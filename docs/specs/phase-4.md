
# Phase 4. Admin dashboard

**Date**: 2026-10-15
**Status**: In Progress (plan approved 2026-10-15)

## Summary

Phase 4 puts the owner behind a login and gives them a working desk: an inbox of leads, a lead detail page with status changes and notes, a settings page, and CSV export. Sign in is passwordless: Supabase Auth emails a 6 digit code (email OTP via `signInWithOtp`), Resend delivers the email through Supabase's custom SMTP, and the admin role lives in `app_metadata` (the part of the user record only the server can write), enforced in the database policies and again in every Server Action. A one time repo script creates the first admin, one migration swaps the Phase 2 policies to read the JWT role claim, and the owner email's admin link finally resolves.

## Context

Phases 0 to 3 shipped the site, the database with RLS, and the booking flow. Every lead the owner receives by email now links to `/admin/leads/[id]`, which 404s, and the plan's core promise (every request lands in one place with a status) is not visible until this phase builds the desk. The schema is ready: `leads`, `lead_events`, `site_settings`, `offers` and `admin_users` all exist with RLS from Phase 2, and Phase 2 deliberately left sign in, sessions, MFA and the first admin row to this spec.

Forces that shaped this spec: the engineer locked the architecture early (Supabase email OTP, signups disabled, role in `app_metadata`, Resend as custom SMTP), so this spec designs around that spine rather than re opening it. PLAN.md promised TOTP multi factor and the phase gate says "Auth with MFA"; the engineer chose a single factor (the emailed code) for the demo, so the plan wording gets a follow up edit rather than a second factor this phase. Phase 2's policies authorize admins with an `EXISTS` check against the `admin_users` table; the locked architecture says the role claim in the JWT (from `app_metadata`) is the source of truth, so one migration rewrites every admin policy. Next 16 renamed Middleware to Proxy (`proxy.ts`), and its bundled docs are explicit that proxy is an optimistic check only, not a session or authorization solution, so the real gates are the Server Actions, the layouts and RLS. The Figma Admin canvas was read once on 2026-10-15 and cached in `docs/design/mcp/admin.md`; it has Inbox, Lead detail and Settings frames but no sign in frame, so that one screen is designed from the Phase 1 system.

## Requirements

**User stories**:
- As the site owner, I open `/admin` on my phone from the alert email, type the code from my inbox, and see my leads without creating or remembering a password.
- As the owner, I move a lead from new to contacted to scheduled, leave notes, and the timeline shows who did what and when.
- As the owner, I flip emergency mode and edit the seasonal offer and hours without touching the database, and I can download my leads as CSV.
- As a stranger, I cannot reach any admin page or read a single lead, even if I forge requests.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: `/admin/sign-in` renders a labeled email form on tokens (mobile and desktop). Submitting a valid email calls `signInWithOtp` with `shouldCreateUser: false` and swaps the form to a 6 digit code field. A fourth request for the same email (or seventh from the same IP) inside 10 minutes returns a rate limited message and sends nothing; the limiter keys on the lowercased trimmed email and the first `x-forwarded-for` hop. Unknown emails still show the same "check your inbox" response and create no account: the action maps Supabase user not found and identity errors to that generic success, and only rate limit and server errors surface differently.
- **AC-2**: Entering a valid, unexpired code for a user whose `app_metadata.role` is `admin` establishes a session (cookies set via `@supabase/ssr`). `verifyOtp` calls Supabase with `{ email, token, type: "email" }` and the Auth OTP length stays at the default 6 digits. Proxy appends the original path as `next` on its redirect to sign in; `verifyOtp` accepts the `next` path only when it matches `^/admin(/[a-z0-9/_-]+)?$` (rejects `//`, backslashes and absolute URLs), otherwise lands on `/admin/inbox`. A wrong, expired or already used code shows an inline error and sets no session.
- **AC-3**: A code that verifies for an existing auth user without the admin role is immediately signed out and shows "This account does not have admin access." Public signup is impossible: `shouldCreateUser: false` on every OTP request, and the dashboard sign up toggle is off.
- **AC-4**: Every `/admin` route except `/admin/sign-in` redirects to sign in when there is no session, and the Proxy matcher covers all nested paths including the `GET /admin/export` route handler; the Proxy also optimistically checks the JWT `app_metadata.role` claim. A session without the admin role is signed out and redirected by the admin layout, which re checks the role authoritatively before render; every admin Server Action re checks the role from the session before doing anything; and even if all app checks were bypassed, the Phase 2 RLS policies, now reading the JWT `app_metadata.role` claim, return zero rows to non admins.
- **AC-5**: `/admin/inbox` lists leads paginated at 25 per page, newest first with new emergency leads pinned above the rest, filter chips by status and kind, and a search box matching name and reference code as a case insensitive substring, plus phone matched against digits stripped from the stored value in SQL. Empty filter results show an empty state. Layout and tokens match the cached Admin / Inbox frame.
- **AC-6**: `/admin/leads/[id]` shows the facts card (all contact, address, consent and UTM fields), the timeline (every `lead_events` row, newest first, with actor or "System"), a note box, and the action buttons. `updateLeadStatus` accepts only legal transitions (below), persists the new status and inserts a `status_changed` event with `actor_user_id` from the session; `addNote` inserts a `note` event. An illegal transition returns an error and changes nothing. An unknown id renders 404. The owner email link now resolves.
- **AC-7**: `/admin/settings` shows the three cards from the frame: emergency mode (toggle plus banner text), seasonal offer (title, body, start and end dates, active flag; edits the most recent offer or creates the first when none exists), and the business card (phone editable, business hours edited per day, TDLR license read only). `updateSettings` patches only the keys it is given (partial Zod), so the sidebar toggle sends just `emergency_mode` and cannot clobber the banner or hours. The phone field reuses the lead phone rule (10 plus digits, US style); business hours load with per day defaults (`open`, `close`, `closed`) filling any missing keys before render, and save writes the full normalized object. The one Save button submits the settings form then the offer form sequentially under a single saved state. Saves persist through the signed in session client (RLS enforced). The sidebar emergency mode panel works on every admin screen and writes the same `site_settings` row.
- **AC-8**: "Export CSV" on the inbox downloads all leads matching the current filters (status, kind, search; the `page` param is ignored so the export is never truncated) through `GET /admin/export`, behind the session, with every `leads` column in the Phase 2 migration order, RFC 4180 escaping, cells starting with `=` or `+` prefixed with a quote against spreadsheet formula injection, a `Content-Disposition` filename of `leads-YYYY-MM-DD.csv`, a header row only when there are no rows, and no dependency added.
- **AC-9**: One migration drops every Phase 2 admin policy and recreates it with `(select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'` as the check, keeping the `WITH CHECK` pairs on updates; `admin_users` stays as an onboarding record but no policy reads it anymore. The pgTAP suite is updated to grant the simulated admin the JWT claim instead of the table row, passes 16/16 or better on the linked project, and advisors report zero findings. The human applies the migration.
- **AC-10**: `scripts/create-admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` to call the Auth admin API to create or fetch a confirmed user with `app_metadata.role = "admin"` (the admin API path bypasses the public signup switch, so `shouldCreateUser` is irrelevant here), and upserts the matching `admin_users(user_id, role)` row in the same run (the `lead_events.actor_user_id` foreign key needs it), and prints the email used. Running it twice for the same email is idempotent: it sets the role claim and upserts the row instead of failing, which also promotes an existing non admin user of that email. The human runs it once before the first sign in. The service role key never appears in the browser bundle or the repo (`git grep -i service_role` stays empty).
- **AC-11**: With Resend configured as Supabase custom SMTP (human, one dashboard session documented in the spec), the OTP email arrives within seconds and contains the 6 digit code (template uses `{{ .Token }}`).
- **AC-12**: Gate passes: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`; Playwright `@ci` covers sign in render, rate limit UI, and the unauthenticated redirect from `/admin/inbox`; `/admin` routes carry `noindex` (robots meta); advisors unchanged after the migration push.

## Options considered

### Auth mechanism (engineer locked; alternatives recorded for the plan)

**Option A: email + password.** Traditional form, Supabase hashes the password. **Pros**: familiar, works offline of email. **Cons**: password reset flows, weak password risk on a one person tool, more screens. **Option B: magic link redirect.** Supabase emails a one time link that opens a session. **Pros**: zero code to type. **Cons**: breaks in in app email viewers that prefetch links, less visible feedback, still email based. **Option C: email OTP code (chosen).** Supabase emails a 6 digit code the user types. **Pros**: one factor, no password storage, works when link prefetching eats magic links, tiny UI. **Cons**: still depends on email delivery, single factor (TOTP deferred).

### RLS role source

**Option A: `app_metadata` claim only (chosen).** One migration swaps the admin check to the JWT claim. **Pros**: single source of truth matching the locked architecture; no table lookup per row; works even if `admin_users` rows go stale. **Cons**: role changes are not fresh until the token refreshes; `admin_users` becomes a log, not enforcement. **Option B: keep `admin_users` in RLS, claim only in the app.** **Pros**: no migration. **Cons**: two sources that drift silently; contradicts the locked architecture. **Option C: drop `admin_users`.** **Pros**: cleanest. **Cons**: diverges from PLAN.md's data model for no gain today; a later phase may want the onboarding log.

### First admin bootstrap

**Option A: one time repo script (chosen).** `scripts/create-admin.ts` with the service role creates the confirmed user and metadata. **Pros**: reviewable, re usable for later admins, idempotent. **Cons**: the human must run one command. **Option B: dashboard by hand.** **Cons**: easy to mistype the metadata JSON, no repeatable record. **Option C: SQL into `auth.users`.** **Cons**: bypasses Auth internals, fragile across Supabase versions.

### Session storage

**Option A: Supabase cookies through `@supabase/ssr` (chosen).** Already installed in Phase 3; Proxy refreshes; RLS reads the JWT. **Pros**: no new dependency, sessions are standard Supabase sessions. **Cons**: refresh depends on Proxy running on every admin request. **Option B: custom session table and cookie.** **Cons**: rebuilding what Supabase Auth already does (rotation, revocation) for no demo benefit.

## Decision

Build the admin on Supabase email OTP with the role claim in `app_metadata`, sessions via `@supabase/ssr` cookies refreshed by `proxy.ts` (optimistic check only), one policy swap migration, a bootstrap script, and the four surfaces from the cached Figma frames plus a sign in screen designed from the Phase 1 tokens. Single factor; TOTP waits.

**Implementation skills**: `supabase` (`.agents/skills/supabase/`) · Next 16 bundled docs in `node_modules/next/dist/docs/` (proxy file convention, Server Actions, route handlers) before any code · `@supabase/ssr` docs via its `llms.txt` before the session layer.

## Rationale

The locked architecture optimizes for the demo's real risk: not password strength, but the owner never getting a lead. Email OTP removes password reset support entirely and reuses the Resend account the lead alerts already depend on, so deliverability is one pipeline. `app_metadata` is the only user field the client cannot write, which is why the Supabase security checklist and AGENTS.md both bless it (never `user_metadata`); putting the claim in the JWT lets RLS enforce admin without a subquery per row. The migration over keeping `admin_users` as the RLS source is deliberate: two sources of truth for "who is an admin" always drift, and the table survives as an onboarding record with no enforcement role. Proxy stays thin on purpose, following the Next 16 bundled docs' warning that Proxy is not an authorization solution; the load bearing checks are the session in each Server Action and RLS underneath. Deferring TOTP trades PLAN.md's letter for a leaner demo; the emailed code is still a real factor (something you have), and the follow up records the plan edit so nothing is silently lost.

## Feature design

**Data model sketch**:

No new tables and no new columns. The schema target is the Phase 2 schema with a changed policy set:

| Object | Change |
|---|---|
| admin policies on `leads`, `lead_events`, `services`, `service_areas`, `offers`, `reviews`, `site_settings` | Drop and recreate: admin check becomes `(select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`; keep `USING` and `WITH CHECK` pairs on updates; keep the anon policies untouched |
| `admin_users` | Kept; the "select own row" policy stays; no admin policy reads it anymore |
| `auth.users` (Supabase managed) | Bootstrap script creates one user with `app_metadata: { role: "admin" }`, email confirmed |
| `site_settings`, `offers`, `leads`, `lead_events` | Read and written exactly as Phase 2 designed; settings and offers writes now happen under the admin session, still gated by RLS |

**State transitions**:

`leads.status`: `new → contacted → scheduled → completed`, with `lost` and `spam` reachable from `new`, `contacted` or `scheduled`. `completed`, `lost` and `spam` are terminal (no transitions out). Enforced in `updateLeadStatus` (Zod enum plus an allow list of pairs); the database still only constrains the vocabulary. Every accepted change writes a `lead_events` row `status_changed` with the old and new status in `metadata` and `actor_user_id` from the session.

**API surface** (pages, Server Actions and one route handler; all admin only):

| Surface | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/admin/sign-in` | GET | `next` query (optional) | sign in UI | none | rate limited state |
| `requestOtp` action | POST | `email: string` | generic success always | none | `rate_limited`, `server_error` |
| `verifyOtp` action | POST | `email`, `token: 6 digits`, `type: "email"`, `next?` (safe `/admin` path only) | session cookies, redirect | valid OTP | `invalid_code`, `not_admin` (signed out again) |
| `signOut` action | POST | none | cookies cleared, redirect to sign in | session | none |
| `/admin/inbox` | GET | `status`, `kind`, `q`, `page` search params | paginated lead rows | admin session | redirect to sign in |
| `/admin/leads/[id]` | GET | id path param | lead, events | admin session | 404, redirect |
| `updateLeadStatus` action | POST | `leadId`, `status` | new status, event id | admin session + role re check | `illegal_transition`, `not_found`, `not_admin` |
| `addNote` action | POST | `leadId`, `body` (1 to 2000 chars) | event id | admin session + role re check | `not_found`, `not_admin` |
| `/admin/settings` | GET | none | settings + offer forms | admin session | redirect |
| `updateSettings` action | POST | any subset of phone, emergency_mode, emergency_banner, business_hours (partial patch) | saved flag | admin session + role re check | `invalid`, `not_admin` |
| `updateOffer` action | POST | title, body, starts_on, ends_on, is_active | saved flag | admin session + role re check | `invalid`, `not_admin` |
| `/admin/export` | GET | status, kind, q from the inbox filters (`page` ignored, all matching rows) | `text/csv` attachment `leads-YYYY-MM-DD.csv` | admin session | redirect, header only when empty |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| `requestOtp` | email address | form input, Zod validated |
| `verifyOtp` | session user id | Supabase Auth after a valid code |
| role check (actions, proxy, RLS) | "is admin" | JWT `app_metadata.role`, set only by the bootstrap script |
| `updateLeadStatus` | actor on the event | session user id (`auth.uid()`) |
| `updateLeadStatus` | legal next statuses | the transition allow list in this spec |
| inbox list | rows, pinned order | `leads` columns; order `(status = 'new' and kind = 'emergency') desc, created_at desc` |
| lead detail facts | every fact shown | `leads` columns as created in Phase 2 |
| timeline | events | `lead_events` rows joined on `lead_id`; actor name from the signed in admin's email when `actor_user_id` matches, else "System" |
| settings forms | phone, hours, banner fields | current `site_settings` row |
| settings forms | offer fields | most recent offer (`offers` ordered `created_at desc`, limit 1), or when the table is empty a new one with empty title and body, dates today to today, `is_active = false` |
| settings forms | business hours object | shape from `supabase/seed.sql`; load normalizes missing day keys to `{ open, close, closed }` defaults before render, save writes the full normalized object |
| CSV row | column values | `leads` columns in the Phase 2 migration order (header row built from that same list) |
| sidebar "Who" block | signed in admin's email | Supabase session user (`user.email`) after `verifyOtp` |
| owner email link | `/admin/leads/{id}` | already built in Phase 3 from `SITE_URL` env |

**Key invariants**:
- No admin surface trusts the client: every action re reads the session and checks the role claim; RLS enforces the same claim in the database.
- A session without `app_metadata.role = "admin"` can exist (a real auth user) but can read and write nothing admin.
- OTP requests never reveal whether an email has an account; unknown emails get the same response and no user row.
- Every lead mutation writes a `lead_events` row with `actor_user_id`; no silent updates (Phase 2 has no `updated_at`).
- `admin_users` rows are written only by the bootstrap script (service role), never by the app at runtime.

**Security model**:

| Actor | May do |
|---|---|
| anon | nothing under `/admin`; OTP request only, rate limited |
| authenticated, no admin role | verify their own code (then immediately signed out); zero rows via RLS everywhere |
| admin (JWT claim) | read and change leads, insert events, read and write `site_settings` and `offers`, export CSV |
| service role | bootstrap script only, server side only |

Notes: `user_metadata` is never read for authorization; Proxy only refreshes tokens and does the optimistic redirect and role check; `/admin` sends `noindex` robots meta; the service role key stays in `.env.local` alone; OTP request rate limits are in memory per instance (same honest demo stance as Phase 3, platform limit as follow up), and the verify step has no app level attempt limiter because Supabase Auth's own invalid attempt limit is the brake (accepted for the demo); auth audit trail is Supabase's own `auth.audit_log_entries`, lead audit is `lead_events`.

**Configuration required**:

No new repo environment variables (`SITE_URL`, the Supabase keys and the Resend key already exist). The human does one dashboard session, documented in the build plan:
- Supabase Auth SMTP: Resend as the custom SMTP provider (host, port and user per Resend's SMTP docs at build time; password is a Resend API key, stored only in the dashboard).
- Email templates: the "Confirm signup / Magic link / Change email" template set to use `{{ .Token }}` so email OTP sends a 6 digit code, not a link.
- Auth settings: public signups off; leave the OTP length at the default 6 digits; inactivity timeout off (or well beyond 7 days) with the refresh token window configured so a signed in admin stays signed in for up to 7 days, while access token TTL stays default and Proxy refreshes it on each admin request. Confirm the exact dashboard labels against current Supabase Auth docs at build time and record them in the step 12 checklist.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: script creates the auth user and the `admin_users` row (the actor foreign key resolves), OTP requested and verified, inbox lists seeded leads, status moves new to scheduled with two timeline events, verifies **AC-2**, **AC-6**, **AC-10**
- Happy path: settings save flips emergency mode and the sidebar panel reflects it on reload, verifies **AC-7**
- Failure case: fourth OTP request for one email inside 10 minutes is refused, verifies **AC-1**
- Failure case: OTP requested for an unknown email still returns the generic check your inbox response and creates no user, verifies **AC-1**
- Failure case: wrong or reused code shows the inline error and no session cookie is set, verifies **AC-2**
- Failure case: illegal transition (completed to contacted) is rejected with a message and no event written, verifies **AC-6**
- Auth/permission: signed in non admin user gets empty inbox data, blocked actions, and a redirect from the lead detail page; anon GET on `/admin/inbox` redirects to sign in, verifies **AC-3**, **AC-4**
- Auth/permission: pgTAP admin simulation carries the JWT claim and passes; without the claim, zero rows on every admin table, verifies **AC-9**
- Deliverability: human confirms the OTP email arrives with the 6 digit code, verifies **AC-11**
- Export: CSV downloads with filters applied and correct escaping on a lead whose issue text contains commas and quotes, verifies **AC-8**

## Build plan

1. [ ] Spec committed (this file), satisfies nothing on its own
2. [ ] Read Next 16 bundled docs (proxy, Server Actions, forms, route handlers) and `@supabase/ssr` `llms.txt`; then write the migration with `npx supabase migration new phase4_admin_auth`: drop and recreate every admin policy on the claim, keep anon policies and the own row `admin_users` policy; update `supabase/tests/rls_policies.sql` to grant the simulated admin the JWT claim; report the human push commands and run advisors plus pgTAP, satisfies **AC-9**
3. [ ] `scripts/create-admin.ts` (service role, confirmed user, `app_metadata.role`, `admin_users` upsert, idempotent); document the run command for the human and confirm one admin exists, satisfies **AC-10**
4. [ ] Session layer: extend `lib/supabase/server.ts` with a session client factory; root `proxy.ts` (Next 16 convention) refreshing the session and redirecting unauthenticated `/admin` requests to sign in; `lib/validation/auth.ts` and `settings.ts` Zod schemas; in memory OTP rate limiter, satisfies **AC-1**, **AC-4** prerequisite
5. [ ] Auth actions `requestOtp`, `verifyOtp` (role check then immediate sign out on failure), `signOut` with `useActionState` wiring, satisfies **AC-2**, **AC-3**, **AC-11**
6. [ ] `/admin/sign-in` page from Phase 1 tokens (centered card, no Figma frame exists), satisfies **AC-1**
7. [ ] `/admin` shell: sidebar from the cached frame (nav, emergency panel, who block with sign out), `noindex` metadata helper for all admin routes, satisfies **AC-4**, **AC-7** shell half
8. [ ] `/admin/inbox`: server component reading leads through the session client with filters, search and pagination; `updateLeadStatus` and `addNote` actions with the transition allow list; empty states, satisfies **AC-5**, **AC-6** action half
9. [ ] `/admin/leads/[id]`: facts card, timeline, note box, action buttons (including a Lost button the frame omits), satisfies **AC-6**
10. [ ] `/admin/settings`: three cards, `updateSettings` and `updateOffer` actions, sidebar toggle parity, satisfies **AC-7**
11. [ ] `GET /admin/export` CSV route with filter parity and escaping, satisfies **AC-8**
12. [ ] Playwright `@ci` suites (sign in render, rate limit UI, unauthenticated redirect); local full loop (script, OTP email, inbox, status move, settings, CSV); gate lint, typecheck, test, build; human confirms SMTP config and first OTP email; tick ACs and report, satisfies **AC-11**, **AC-12**

## Consequences

**Positive**:
- The demo loop closes end to end: book a lead, get the email, open the admin link, sign in with a code, move the lead, flip emergency mode.
- No passwords exist anywhere in the product; password reset, strength rules and breach response are all gone.
- One source of truth for admin authorization (the JWT claim) enforced twice (Actions plus RLS), reviewable in one migration.

**Negative / tradeoffs**:
- Single factor: anyone who can read the owner's email inbox is an admin. Accepted for a noindex demo; TOTP is the recorded follow up.
- Role changes are not fresh until the token refreshes; removing an admin also needs their sessions revoked in the Supabase dashboard, or a still valid refresh token keeps working up to the 7 day window.
- The migration makes `admin_users` a log with no enforcement role, which invites "why is this table here" questions until a later phase drops or re purpose it.
- OTP depends on email deliverability; if Resend or SMTP config is wrong, the owner is locked out with only dashboard access as recovery.
- The Figma cache is depth 3: inner row copy (nav labels, card fields) is built from the data model and site copy patterns, not pixel text. If that matters, one more approved Figma read is needed.

**Neutral**:
- In memory rate limits reset per instance (same as Phase 3).
- Business hours json shape comes from the existing seed; the editor conforms to it rather than defining a new one.
- Auth events live in Supabase's auth logs, not `lead_events`; lead mutations remain the only thing the timeline shows.

## Follow-up

- [ ] Edit `docs/PLAN.md`: the trust table row "TOTP multi-factor on admin accounts" and the Phase 4 gate "Auth with MFA" now read "email OTP (single factor); TOTP deferred". This spec is the record of that deviation.
- [ ] TOTP as a second factor (Supabase MFA enroll and verify screens, recovery codes) when the demo graduates to a real client deployment.
- [ ] Platform level rate limit on the OTP request action (Vercel WAF), joining the Phase 3 booking follow up.
- [ ] Decide whether to drop `admin_users` entirely in a later migration once the claim based policies have shipped for a while.
- [ ] Document the exact Supabase dashboard settings (SMTP fields, template token, sign up toggle, 7 day refresh knob names) in `docs/design/` or the repo wiki after the build confirms them, so a second deployment is copyable.
- [ ] `supabase` skill conventions are still not in root `AGENTS.md` (carried from Phase 2); they apply to every database task and belong at root level.
- [ ] Read only demo admin (PLAN portfolio item) needs a second non admin role story; not designed here.
- [ ] Phase 3 spec status line still reads "In Progress" though the phase is closed; `/sync` should reconcile it.

## References

**Project sources**:
- `AGENTS.md`: server components by default, sign in as a Server Action, admin authorized from `admin_users` or `app_metadata`, never `user_metadata`; service role server only; Figma call budget and caching rule
- `docs/PLAN.md`: admin scope row (login, inbox, lead detail, settings, CSV), phase 4 gate, trust table
- `docs/specs/phase-2.md`: schema, enums, the Phase 2 policy matrix this migration rewrites, RLS test mechanics
- `docs/specs/phase-3.md`: action state pattern, in memory rate limiter, email events, owner email admin link
- `docs/design/mcp/admin.md`: cached Figma Admin canvas (read 2026-10-15)
- `docs/design/mcp/site.md`: palette and type tokens reference
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`: Next 16 proxy convention and its "optimistic check only" guidance
- `node_modules/@supabase/auth-js` types: `shouldCreateUser` and `VerifyOtpParams` as installed in this repo
- `.agents/skills/supabase/`: security checklist (app_metadata for authorization, UPDATE needs SELECT, `TO authenticated` plus ownership predicate)

**Practices & standards**:
- Authorization claims belong in server writable metadata only (`app_metadata`), never user editable metadata
- Optimistic gateway checks (Proxy) plus authoritative checks (Actions and RLS)
- Passwordless single factor email OTP for low risk internal tools; TOTP as the standard next factor
- Idempotent bootstrap scripts for the one privileged account
