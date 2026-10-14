
# Phase 2. Data and security

**Date**: 2026-10-14
**Status**: In Progress

## Summary

Phase 2 gives Apex its database: eight tables, two enum types, and Row Level Security (database rules that decide which rows each user may see or change) on every table, all created by one migration file. The public can read marketing content and add a lead, nothing else; only allowlisted admins can read or change leads. The phase also ships a seed file so the demo database looks alive, and pgTAP tests (Postgres unit tests) that prove the security rules hold. The gate is clean advisors and passing RLS tests.

## Context

The phased plan puts data and security before the booking flow on purpose: RLS is easiest to get right before anything depends on it. Phase 1 shipped static pages reading local content modules; Phase 2 replaces that foundation with the real tables that Phase 3 (booking), Phase 4 (admin) and Phase 5 (local pages) all build on. `PLAN.md` fixes the table list, the public and admin permissions per table, and the two enums; this spec turns that into an exact schema, an exact policy matrix, and the tests that check both.

Forces that shaped this spec: the Supabase MCP is read only on this project, the repo bans `db pull` and `db reset` (both need Docker), and the cloud project `apex` (`qnyfuzxfqghipuntrhhr`) is already linked and empty. So migrations are hand authored in git and pushed by the human, and the gate tests run against the linked project itself rather than a local stack. Leads hold personal data (name, phone, address), so anon must never get a read path to them; consent fields exist now so Phase 3 can store flag, timestamp and wording version per plan. One assumption made explicit: admin authentication (sign in, MFA, sessions) is Phase 4's spec; this phase only ships the `admin_users` allowlist table that its policies read.

## Requirements

**User stories**:
- As the site owner, every visitor request lands in one table with a status, and no visitor can read anyone else's request.
- As an anonymous visitor, my submitted request cannot be read by other visitors, and I cannot make it arrive with a status of my choosing.
- As a demo viewer, the database arrives seeded so the admin inbox and marketing pages look real on first open.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: A single timestamped file in `supabase/migrations/` creates both enums and all eight tables, enables RLS and defines every policy in that same file; it applies cleanly to the linked project (`npx supabase db push --linked --dry-run` reports no errors, the human's push succeeds).
- **AC-2**: Anon reads expose exactly the planned public rows: all `services`; only active `service_areas`; only `offers` that are active and inside their date window; only published `reviews`; the `site_settings` singleton. Anon can select or write nothing on `leads`, `lead_events` or `admin_users`, and has no update or delete anywhere.
- **AC-3**: Anon can insert a lead (status defaults to `new`); an insert carrying any other status is refused by the database; anon has no select on `leads`.
- **AC-4**: A simulated admin (a row in `admin_users` plus JWT claims) can select leads, update a lead's status with the update actually persisting, and insert `lead_events`; a non admin authenticated user sees zero rows in `leads`, `lead_events` and `admin_users`.
- **AC-5**: pgTAP tests in `supabase/tests/` cover AC-2, AC-3 and AC-4, pass with `npx supabase test db --linked`, and leave no rows behind after running.
- **AC-6**: After the push, Supabase advisors report zero security findings and zero performance findings.
- **AC-7**: `supabase/seed.sql` seeds the six services and the six service areas named in PLAN.md (Dallas, Plano, Irving, Garland, Richardson, Frisco), one offer with fixed demo dates (2026-01-01 to 2026-12-31) so it always reads as in season, sample reviews, the `site_settings` row, and 15 to 20 sample leads spread across statuses plus some `lead_events`; running the seed twice leaves the same data (idempotent: `DO UPDATE` on marketing rows, `DO NOTHING` on `site_settings` so demo admin edits survive); the human applies it to the linked project.
- **AC-8**: Generated TypeScript database types are committed to `lib/supabase/database.types.ts` (the directory is created this phase), and `npm run lint`, `npm run typecheck` and `npm run test` all pass.
- **AC-9**: Anon can read `services` through the PostgREST API (a `GET` on `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/services` with the anon key from `.env.local`), proving the tables are exposed to the Data API with RLS still enforcing rows; `git grep -i service_role` stays empty and no new secret reaches the repo.

## Options considered

### Option 1: Hand authored migration, human pushes

Write one SQL migration in `supabase/migrations/` via `npx supabase migration new`, have the human run the dry run and the push, then generate types and run tests against the linked project.

**Pros**:
- Matches the AGENTS.md contract exactly (MCP read only, human applies schema).
- Every schema change is a reviewable file in git.

**Cons**:
- The agent cannot close the loop alone; each schema iteration waits on the human push.

### Option 2: Iterate with MCP `execute_sql`, then capture a migration

PLAN.md mentions iterating with MCP `execute_sql` and committing a migration once the schema settles.

**Pros**:
- Fast trial and error without push cycles.

**Cons**:
- AGENTS.md declares the Supabase MCP read only on this project, and capturing the result would need `db pull`, which is banned (Docker). This option is unavailable under the repo's own rules.

### Option 3: Local Supabase stack (Docker)

Run `supabase start`, reset, diff and test locally, push when settled.

**Pros**:
- A full offline loop, no human in the middle.

**Cons**:
- Needs Docker, which this repo avoids (`db pull` and `db reset` are banned), and the cloud project is the source of truth for this demo anyway.

## Decision

**Chosen option**: Option 1: Hand authored migration, human pushes.

One migration file carries enums, tables, indexes, RLS and policies; the human pushes it, seeds it and the phase closes on advisors plus pgTAP run against the linked project.

**Implementation skills**: `supabase` (`.agents/skills/supabase/`) · `supabase-postgres-best-practices` (`.agents/skills/supabase-postgres-best-practices/`)

## Rationale

The AGENTS.md contract is the strongest force: the MCP is read only, `db pull` and `db reset` are banned, and schema changes are timestamped SQL files the human applies. Option 2 and Option 3 both collide with those rules, so they are not really on the table; PLAN.md's `execute_sql` suggestion yields to the stricter file in this repo. The cost is a slower iteration loop (every schema change waits on a human push), which is acceptable for a phase that touches the schema exactly once.

The recommended calls inside that decision: the admin check is an inline `EXISTS` against `admin_users` rather than a `SECURITY DEFINER` function, because such a function in `public` becomes an endpoint any role can call; `lead_events.event_type` is text rather than an enum, so Phase 3 can log new event kinds without a migration; there are no triggers and no `updated_at` column, because `lead_events` already records every change with its own timestamp and a trigger would add a database function for no gain; the seed uses `ON CONFLICT` on fixed slugs and ids so it can be run again without wiping real demo leads.

## Feature design

**Data model sketch**:

Enums: `lead_status` (new, contacted, scheduled, completed, lost, spam); `lead_kind` (emergency, repair, estimate, tune_up, membership_enquiry).

| Table | Columns (besides `id uuid PK default gen_random_uuid()` and `created_at timestamptz default now()`) |
|---|---|
| `leads` | `kind lead_kind NOT NULL`, `status lead_status NOT NULL default 'new'`, `name text NOT NULL`, `phone text NOT NULL`, `email text`, `zip text NOT NULL`, `address text` (nullable, only booked visits), `issue text`, `preferred_day date`, `preferred_window text` (ASAP / morning / afternoon / evening, validated by Zod in Phase 3, no enum), `consent_email bool NOT NULL default false`, `consent_sms bool NOT NULL default false`, `consent_at timestamptz`, `consent_version text`, `utm_source/utm_medium/utm_campaign text`, `reference_code text UNIQUE` |
| `lead_events` | `lead_id uuid NOT NULL FK → leads on delete cascade`, `event_type text NOT NULL` (status_changed / note / email_sent; text on purpose), `actor_user_id uuid` (nullable FK → `admin_users`, null means system), `body text`, `metadata jsonb`, `created_at` |
| `services` | `slug text UNIQUE NOT NULL`, `name text NOT NULL`, `summary text NOT NULL`, `is_emergency bool NOT NULL default false`, `sort_order int NOT NULL default 0` |
| `service_areas` | `slug text UNIQUE NOT NULL`, `city text NOT NULL`, `zip_codes text[] NOT NULL`, `is_active bool NOT NULL default true`, `sort_order int NOT NULL default 0` (content columns belong to Phase 5) |
| `offers` | `title text NOT NULL`, `body text NOT NULL`, `starts_on date NOT NULL`, `ends_on date NOT NULL`, `is_active bool NOT NULL default true` |
| `reviews` | `name text NOT NULL`, `rating int NOT NULL check (1..5)`, `body text NOT NULL`, `reviewed_on date NOT NULL`, `is_sample bool NOT NULL default true`, `is_published bool NOT NULL default true` |
| `site_settings` | singleton: `id bool PK default true check (id)`, `phone text NOT NULL`, `business_hours jsonb NOT NULL` (structured for Phase 5 JSON-LD), `emergency_mode bool NOT NULL default false`, `emergency_banner text`, `tdlr_license text NOT NULL` |
| `admin_users` | `user_id uuid PK → auth.users on delete cascade`, `role text NOT NULL default 'admin'`, `created_at` |

Indexes: `leads(status)`, `leads(created_at desc)`, `leads(phone)` (Phase 3 duplicate guard looks phones up), `lead_events(lead_id, created_at)` (the foreign key needs it, or the performance advisor complains), unique on `leads(reference_code)` and the three slugs.

**State transitions**: `leads.status` moves new → contacted → scheduled → completed, with lost and spam as terminal exits. The database only constrains the vocabulary (the enum). Enforcing which transitions are legal is the Phase 4 action's job; every change is recorded as a `lead_events` row with its timestamp.

**API surface** (the PostgREST table endpoints these policies create; there is no app level API this phase):

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/rest/v1/leads` | POST | kind, name, phone, zip (req); others (opt) | nothing (no `.select()`, status stays `new`) | anon | 403 when `status` is not `new` |
| `/rest/v1/leads`, `/lead_events` | GET, PATCH | filters; status or event row | rows (admin only) | authenticated + admin check | 401/403 for anon and non admins |
| `/rest/v1/services`, `/site_settings` | GET | none | all rows | anon | none |
| `/rest/v1/service_areas`, `/offers`, `/reviews` | GET | none | rows passing the visibility predicate | anon | none |
| `/rest/v1/admin_users` | GET | none | own row only | authenticated | others' rows invisible |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Anon lead insert | `status = new` | column default, enforced by `WITH CHECK` |
| Anon lead insert | `id`, `created_at` | `gen_random_uuid()`, `now()` defaults |
| Any admin policy | "is this user an admin" | `auth.uid()` against `admin_users.user_id` |
| Offer visibility | "is it in season" | DB clock (`current_date`) vs `starts_on`, `ends_on` |
| `reference_code` (Phase 3) | the code itself | input from the Phase 3 action; column exists from this phase (decided here) |
| Seed sample leads | statuses and content | literals in `supabase/seed.sql` |
| `lead_events.actor_user_id` | who did it | Phase 4 action supplies the admin id; null for system events |

**Key invariants**:
- Anon inserted leads always have `status = new` (the insert policy refuses anything else).
- `site_settings` holds at most one row (the primary key enforces it).
- Every `lead_events` row points at an existing lead (foreign key).
- `reviews.rating` is 1 to 5.
- Admin visibility derives only from `admin_users`, never from JWT `user_metadata`.

**Security model**:

RLS enabled with policies in the same migration that creates each table:

| Table | anon | authenticated, non admin | admin (row in `admin_users`) |
|---|---|---|---|
| `leads` | INSERT only, `WITH CHECK status = 'new'` | none | SELECT, UPDATE (`USING` + `WITH CHECK` = admin check); no DELETE |
| `lead_events` | none | none | SELECT, INSERT |
| `services` | SELECT | none | SELECT, INSERT, UPDATE, DELETE |
| `service_areas` | SELECT where `is_active` | none | all four |
| `offers` | SELECT where `is_active` and `current_date` between `starts_on` and `ends_on` | none | all four |
| `reviews` | SELECT where `is_published` | none | all four |
| `site_settings` | SELECT | none | SELECT, INSERT (`WITH CHECK (id)` keeps it single), UPDATE |
| `admin_users` | none | SELECT own row (`user_id = (select auth.uid())`) | same policy |

The admin check is `exists (select 1 from admin_users where user_id = (select auth.uid()))`, written inline in each admin policy. It works because `admin_users` lets each user see their own row; without that policy the check would read as false for everyone. Policies use `TO anon` / `TO authenticated`, never `auth.role()`, and `(select auth.uid())` is wrapped so the check runs once per statement rather than once per row. No `SECURITY DEFINER` function appears anywhere in this phase.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: anon inserts a lead with only required fields; the row exists with `status = new`, verifies **AC-3**
- Failure case: anon inserts a lead with `status = 'scheduled'`; the database refuses it, verifies **AC-3**
- Auth/permission: anon and non admin authenticated selects on `leads`, `lead_events`, `admin_users` return zero rows; anon update and delete attempts change nothing, verifies **AC-2**, **AC-4**
- Auth/permission: admin updates a lead's status and the change is visible on re select (proves the matching SELECT policy exists), then the admin inserts a `lead_events` row, verifies **AC-4**
- Visibility: anon reads `offers` outside their date window and unpublished reviews and gets nothing back, verifies **AC-2**
- Cleanup: after the full test run, no test rows remain and advisors are clean, verifies **AC-5**, **AC-6**

Test mechanics: every test file runs inside a transaction it rolls back. Fixtures that write as the table owner (`postgres`, which bypasses RLS) run first, which includes inserting a minimal `auth.users` row because the `admin_users` foreign key requires one; only then does the test switch identity with `set local role authenticated` plus `set local request.jwt.claims` carrying the user id as `sub`, to simulate an admin or a non admin. If the linked project lacks pgTAP, install it once with `npx supabase db query --linked "create extension if not exists pgtap"`, deliberately kept out of the migration so the demo schema stays clean.

## Build plan

1. Create the migration with `npx supabase migration new phase2_data_and_security`, then write enums, eight tables, indexes, `ENABLE ROW LEVEL SECURITY` and all policies in that one file (RLS in the same migration as the table, per AGENTS.md), satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**
2. Report the exact human commands (`npx supabase db push --linked --dry-run`, then `npx supabase db push --linked`) and wait for confirmation that the push succeeded, satisfies **AC-1**
3. Run advisors (`npx supabase db advisors`, cross checked with the MCP `get_advisors` tool) and fix any finding, satisfies **AC-6**
4. Verify Data API exposure: anon `GET /rest/v1/services` returns rows while `git grep -i service_role` stays empty, satisfies **AC-9**
5. Generate and commit types: `npx supabase gen types typescript --linked` into `lib/supabase/`, then run lint, typecheck and tests, satisfies **AC-8**
6. Write `supabase/seed.sql` (fixed slugs and ids; the six services and six areas named in PLAN.md; an offer with fixed demo dates 2026-01-01 to 2026-12-31; `ON CONFLICT DO UPDATE` on marketing rows but `DO NOTHING` on `site_settings` so demo admin edits survive; 15 to 20 sample leads with events), report the human's apply command (`npx supabase db query --linked --file supabase/seed.sql`), satisfies **AC-7**
7. Write pgTAP tests in `supabase/tests/` for the critical scenarios above, setup per the test mechanics note (rolled back transactions, owner fixtures first, then simulated JWT claims); run `npx supabase test db --linked` until green, installing pgTAP first with `npx supabase db query --linked "create extension if not exists pgtap"` if the project lacks it, satisfies **AC-5**, **AC-2**, **AC-3**, **AC-4**
8. Run the full gate (`npm run lint`, `npm run typecheck`, `npm run test`) and report at the phase gate: what passed, what did not, what the human must do next, satisfies **AC-8**

## Consequences

**Positive**:
- Security is proven before any feature depends on it: RLS on every table, tested by pgTAP, checked by advisors.
- The demo database arrives populated, so Phase 4's inbox works on day one.
- One migration and no functions or triggers keeps the schema easy to review at 2am.

**Negative / tradeoffs**:
- Every schema change needs a human push, so the agent's loop is slower than a self served one.
- pgTAP runs against the linked cloud project: test traffic is rolled back but still shows in project logs.
- Without `updated_at`, "when was this lead last touched" comes only from `lead_events`, so anything that mutates a lead must write an event to stay truthful.

**Neutral**:
- `service_areas` content columns deliberately wait for Phase 5, which means a second migration then.
- `lead_events.event_type` is free text, so new event kinds cost no migration but also no database validation.
- The Supabase project's default grants are assumed for new tables; AC-9 verifies that assumption by calling the API.

## Follow-up

- [ ] The Phase 3 spec must settle anon side writes to `lead_events`: the duplicate guard needs to find an existing lead (anon cannot select leads), and the plan's `email_sent` logging needs an anon insert. One mechanism must cover both (a narrow anon `INSERT` policy, or a server side path under a different role). This phase ships `leads.phone` and `lead_events.event_type` so nothing blocks it.
- [ ] The Phase 3 spec must keep the lead action's insert `.select()` free (the plan's own rule); the policy here gives anon no select on leads, so a returning insert would fail by design.
- [ ] The Phase 4 spec owns admin sign in, MFA, sessions and how the first `admin_users` row is created; this phase ships the allowlist table only.
- [ ] The Phase 5 spec adds `service_areas` content columns in its own migration (neighborhoods, local issues, price range, FAQs).
- [ ] The `supabase` and `supabase-postgres-best-practices` skills shaped this design but are not listed in AGENTS.md; their conventions belong in the root AGENTS.md since they apply to every database task.
- [ ] The plan's rate limit on the booking endpoint is platform configuration, not schema; decide where it lives before Phase 3 builds the form.
