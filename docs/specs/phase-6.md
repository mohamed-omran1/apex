
# Phase 6. Polish, deploy and case study

**Date**: 2026-10-18
**Status**: In Progress

## Summary

Phase 6 takes the finished site to launch. It adds accessibility checks to the Playwright suite, designs the missing error and empty states, wires a speed reporting job into continuous integration, and writes one deploy runbook so staging and production go live in a known order. The human performs the two deploys and records the demo clip against an agent prepared shot list. The phase closes when every line of the launch checklist in `docs/PLAN.md` is ticked with evidence and the case study is written from real measurements.

## Context

Phases 0 to 5 built the marketing site, the database with Row Level Security (RLS, the database's per user row filtering), the booking flow, the admin desk and the SEO layer. Green at close of phase 5: lint, typecheck, 44 unit tests, production build of 41 static pages, 34 Playwright `@ci` tests, 17 pgTAP tests, advisors clean, mobile Lighthouse median 92 on home and 95 on `/service-areas/dallas`. What remains is exactly the phase 6 row of the plan (line 244: "Accessibility, perf, staging then production, demo clip") and the launch checklist (line 262), whose gate is "Pre-launch checklist ticked".

Forces that shape this spec. AGENTS.md locks rules that decide several questions here: no new dependency without telling the human (the accessibility tool is one), the service role key never reaches the client (the checklist demands a search of the build output), the public demo ships `noindex` until `INDEX_SITE` is flipped, demo honesty (fictional company footer, placeholder license `TACLB000000C`, SAMPLE review tags) must hold on the live URL, and every schema push stays a human operation because the Supabase MCP is read only. The plan's QA and deploy sections (lines 250 to 260) promise axe checks inside the Playwright run, Lighthouse CI against the speed targets, Vercel hosting with separate staging and production Supabase projects, and Resend sending domain verification (SPF and DKIM) before the first real email test. Two facts recorded in the phase 5 handoff change how the gate runs: machine noise moves Lighthouse scores by about plus or minus 2, so the real gate is the median of three to five local runs; and this machine has no Docker, so pgTAP runs through the `db query` workaround already proven in phase 5. The repo today has no root 404 or error page (only `app/admin/not-found.tsx`), no axe tests despite the plan's promise, and no Lighthouse job: `.github/workflows/ci.yml` runs lint, typecheck, unit tests, build and the `@ci` suite only.

Explicitly not in scope: the plan's portfolio idea of a read only demo admin on seeded data (deferred, recorded as a follow up), any schema or RLS change, any new public write path, and flipping `INDEX_SITE`.

## Requirements

**User stories**:
- As a visitor who mistypes a URL, I get a designed 404 page with clear ways back (home, call, book), never a bare framework page.
- As the site owner, accessibility and speed are checked on every push, so regressions surface before launch instead of after.
- As the person deploying, I follow one runbook with exact environment variables and an exact order, so staging and production hold no surprises.
- As a prospect, the 60 second clip and the case study show the real flow with numbers that were actually measured.
- As the demo audience, the honesty framing (noindex, footer disclaimer, placeholder license, sample tags) is still intact on the live URL.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: `@axe-core/playwright` is added as a dev dependency (human approved in the design conversation, the only new dependency of this phase). A new axe spec tagged `@ci` checks: home, `/services` index plus one service detail, `/service-areas` index plus one area detail, `/book`, `/reviews`, the admin inbox and one admin lead detail (admin routes sign in through the existing pattern in `e2e/admin.ci.spec.ts`). Zero serious or critical violations; every finding on those routes is fixed. A manual spot check of the same routes confirms visible focus rings and WCAG 2 AA (AA, the accessibility standard) contrast on text and controls. `npx playwright test --grep "@ci"` stays green on both mobile and desktop projects.
- **AC-2**: Root `app/not-found.tsx` and `app/error.tsx` exist (plus `app/global-error.tsx` for failures in the root layout), styled with Phase 1 tokens only, each showing a plain language message and links to home, the phone number (from `lib/content/site.ts`) and `/book`. In the production build an unknown URL returns HTTP 404 with that page, and no error page ever renders a stack trace or environment value. An empty state audit covers the reviews page, the admin inbox including its filters, the service and area lists, and the offers surface: missing states are added and inconsistent ones are aligned to one pattern, so no empty surface renders blank or as a raw error.
- **AC-3**: Local mobile Lighthouse medians are recorded for home and `/service-areas/dallas` using the handoff method (headless Chrome, mobile form factor, three to five runs, take the median), with home at 90 or higher, which is the AGENTS.md hard rule. A `performance` job is added to `.github/workflows/ci.yml`: it builds, starts the app (with the same Supabase environment variables the `e2e` job uses), runs `npx --yes lighthouse` against the same two URLs with `--only-categories=performance`, and prints the performance score; the job runs with `continue-on-error` so runner noise can never block a merge. Both the local medians and the CI scores are recorded for the case study.
- **AC-4**: `docs/deploy.md` exists and covers, in order: the environment variable manifest for both environments (every variable in `.env.example`, marked which are `NEXT_PUBLIC_` and browser safe versus server only, with `INDEX_SITE` left unset); creating and linking the staging Supabase project, pushing migrations and applying the seed to it (human executed commands verbatim); Vercel setup with the Preview environment bound to staging and Production bound to the current linked project; Resend sending domain verification (SPF and DKIM) before the first real email test; the staged order of operations (staging first, then production); and post deploy verification (production build, advisors, the pgTAP route, the `@ci` suite, smoke URLs). Every command in the runbook exists in the repo or the Supabase CLI and is copy runnable.
- **AC-5**: The human executes the staging half of the runbook: a staging Supabase project is created, migrations and seed applied, advisors run clean; the staging deployment is live with staging environment variables; a booking submitted on staging appears in the staging admin inbox and the owner notification email arrives within seconds. Results are recorded in this spec's build plan step 10.
- **AC-6**: The human executes the production half: production is live on the current linked Supabase project with production environment variables set per the runbook, `INDEX_SITE` unset (robots disallows all and the root metadata keeps `noindex`), and the demo honesty framing verified on the live URL (footer disclaimer, placeholder license `TACLB000000C`, SAMPLE tags on sample reviews, "serving" language on area pages). Results are recorded in build plan step 11.
- **AC-7**: Every item of the launch checklist (`docs/PLAN.md`, lines 264 to 270) is ticked with evidence: tap-to-call and the booking flow tested on a real iPhone and a real Android phone; owner notification email arriving within seconds and rendering well in Gmail; Supabase advisors reporting no security or performance warnings; no service-role key in the client bundle (search the build output); 404, 500 and empty states designed; demo disclaimers, placeholder license and `noindex` in place; seed data loaded (verified: `supabase/seed.sql` carries 18 sample leads across the statuses shown in the status history, applied to both the staging and production projects).
- **AC-8**: `docs/demo-clip.md` exists with a 60 second shot list matching the plan's portfolio line (book an emergency repair on a phone, the owner email arrives, open the admin, move the lead to scheduled), and every step is verified working in the running app beforehand: booking at a mobile viewport, the email send path, and the admin status change to scheduled on a seeded lead. The seed leaves the admin looking alive for the recording. The human records against the shot list and notes the result.
- **AC-9**: `docs/case-study.md` contains the full prose following the plan's outline (line 279): the problem (missed calls, scattered leads, slow sites), the approach, the booking flow, the admin, then measurable facts taken from real measurement, not guesses: the Lighthouse medians from AC-3, the booking form field count read from `components/book/booking-form.tsx`, and the seconds from landing to a submitted request from a timed run. No conversion-lift percentages (the plan forbids them), and the demo honesty framing is present.
- **AC-10**: The gate passes: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass; the full `@ci` Playwright suite (now including the axe spec) is green; advisors are clean on both projects; a search of the build output finds no service-role key; the styled 404 works in the production build; the phase is reported at the gate with the human's checklist results.

## Options considered

### Accessibility enforcement

**Option A: axe checks in `@ci` plus fixes (chosen).** Add `@axe-core/playwright`, check the key public and admin routes on every push, fix what it reports. **Pros**: a permanent regression guard, matches the plan's QA line ("axe checks inside the Playwright run"). **Cons**: one approved new dependency, and only routes named in the suite are covered automatically.

**Option B: manual WCAG 2 AA audit only, no new dependency.** Hand check contrast, focus, labels and tap targets once. **Pros**: zero dependencies. **Cons**: no regression guard; the audit repeats from scratch next phase.

**Option C: full manual audit of every page plus axe automation.** Widest net. **Cons**: large effort on a demo whose route count already passed phase gates; diminishing returns beyond the key routes.

### Performance gate

**Option A: non-blocking CI job plus local median as the real gate (chosen).** Add a Lighthouse job that reports scores with `continue-on-error`; the gate stays the documented local median of three to five runs. **Pros**: honors the plan's Lighthouse CI wording, scores stay visible on every push, runner noise never blocks a merge. **Cons**: a failing score is easy to ignore unless someone reads the job.

**Option B: blocking Lighthouse CI at 90.** **Pros**: a hard automated gate. **Cons**: the handoff measured plus or minus 2 of noise on this machine alone; a shared runner will flake and erode trust in CI.

**Option C: local runs only, no CI change.** **Pros**: simplest. **Cons**: leaves the plan's Lighthouse CI promise unmet and hides speed regressions between local sessions.

### Deploy ownership

**Option A: agent writes the runbook, human deploys (chosen).** One `docs/deploy.md` artifact; the human executes staging then production. **Pros**: repeatable and reviewable, and the rules already reserve pushes and deploys for the human (Supabase MCP is read only, `db push` is human applied). **Cons**: the runbook can drift if steps change later.

**Option B: the spec itself is the runbook.** **Pros**: one less file. **Cons**: the spec is the build contract that `/check` verifies against; operational steps do not belong there and would rot with it.

**Option C: the agent runs the deploys too.** **Cons**: needs Vercel authentication on this machine, the Supabase side is read only for the agent anyway, and the human must perform pushes regardless, so the saving is illusory.

### Supabase project mapping

**Option A: current linked project becomes production, a new project becomes staging (chosen).** The current project is seeded, advisors clean and fully tested; that is exactly what production should be. **Pros**: production starts from a verified state; staging is disposable. **Cons**: you create and seed a second project before staging can go live.

**Option B: current project stays staging, a fresh production project is created at launch.** **Pros**: production starts pristine. **Cons**: seed, migrations and advisor verification all get re proven under launch time pressure.

**Option C: one project for both.** **Pros**: least work. **Cons**: no pre production verification at all, and it contradicts the plan's deploy line (separate Supabase projects for staging and production).

## Decision

Build Phase 6 as specified: one approved dependency (`@axe-core/playwright`) with a `@ci` axe suite over the key routes; designed root 404, error and global error pages plus an empty state audit; a non blocking Lighthouse job in CI with local medians as the gate; one `docs/deploy.md` runbook that the human executes for staging (a new Supabase project) then production (the current linked project); a shot list plus verified steps for the human's demo clip; and the full case study at `docs/case-study.md` written from real commits and measurements. The read only demo admin stays out of scope as a follow up.

**Implementation skills**: `next-dev-loop` (`.agents/skills/next-dev-loop/`) to verify the error pages and clip steps in the running app, not just in a build · `supabase` (`.agents/skills/supabase/`) for the staging project, migration push and advisor conventions in the runbook · Next 16 bundled docs in `node_modules/next/dist/docs/` (not found, error boundaries and global error) before writing the error pages.

## Rationale

The checklist is the gate, so the spec mirrors it one AC at a time and puts every human only operation (device tests, Gmail rendering, deploys, pushes) in its own identified step rather than hiding it inside agent work. The axe suite over key routes beats a one time manual audit because the plan itself asks for axe inside Playwright, and a suite that runs on every push keeps the accessibility promise honest after this phase ends; a full site manual audit was rejected as effort the demo does not need when the key routes carry the whole funnel. The Lighthouse job is non blocking because the recorded noise of plus or minus 2 makes a blocking threshold a flaky gate that gets disabled in frustration, while the local median (the method that actually passed every phase gate so far) stays the number quoted in the case study; blocking CI is the runner up if measured runner noise turns out to be calm. The runbook exists as its own file because operational steps inside a build contract would confuse `/check` and age badly, and because the human, not the agent, holds every credential involved. Production takes the current linked project because it is the verified one: seed applied, advisors clean, tests green, and a fresh production database at launch would only re prove work already done.

## Feature design

**Data model sketch**: No schema change. The only data work is verification: `supabase/seed.sql` already carries 18 sample leads with a status history spanning new, contacted, scheduled, completed, lost and spam, which satisfies the checklist's "15 to 20 sample leads in different statuses". If verification finds fewer than 15 rows or a missing status class, the seed file is extended in place (a file edit, human applied to both projects), never a migration.

**State transitions**: none new. The lead status machine (`new` to `contacted` to `scheduled` to `completed`, plus `lost` and `spam`) shipped in phase 4 and is only exercised, not changed.

**API surface**: no new endpoints, no new Server Actions, no new write paths. The new surfaces are pages and checks:

| Surface | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| any unknown URL | GET | request path | styled 404 page, HTTP 404 | anon | none |
| route segment error | runtime | thrown error | styled error page, details logged server side only | anon | never renders stack or env values |
| root layout failure | runtime | thrown error | `global-error` page | anon | recovery link to home |
| axe spec (`@ci`) | test run | fixed route list | violations by impact level | admin sign in helper for admin routes | fails the suite on serious or critical |
| `performance` CI job | workflow | home and area URLs, build with Supabase env | performance score printed per URL | none | `continue-on-error`, never blocks |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| 404 and error page phone CTA | phone number | `lib/content/site.ts` constants |
| 404 and error page links | home and `/book` destinations | route constants |
| axe route list | the routes checked | this spec, AC-1 |
| Lighthouse local medians | scores | handoff method runs on the production build |
| Lighthouse CI scores | scores | `npx --yes lighthouse` output in the `performance` job |
| runbook environment manifest | variable names and which side sees them | `.env.example` |
| runbook staging commands | push, seed, advisor commands | Supabase CLI, `AGENTS.md` conventions |
| checklist seed evidence | lead count and status classes | `supabase/seed.sql` |
| case study speed facts | Lighthouse medians | AC-3 measurements |
| case study field count | booking form field count | `components/book/booking-form.tsx` |
| case study time to submit | seconds landing to submitted | one timed booking run |
| clip shot list | the four beats | `docs/PLAN.md` portfolio line 277 |

**Key invariants**:
- No new public write path; booking still goes only through the existing `submitLead` action.
- `@axe-core/playwright` is the only new package in the phase.
- `INDEX_SITE` stays unset on staging and production; the demo ships noindex until the human flips it.
- Error pages show a friendly message and working links, never a stack trace, query dump or environment value.
- New UI uses Phase 1 tokens only; no hard-coded colors or font names.
- Deploys, migration pushes and seed applications remain human operations.
- Demo honesty holds on the live URL: fictional footer, `TACLB000000C`, SAMPLE tags, "serving" never "office in".

**Security model**: unchanged from phase 5. Anon and admin powers are exactly what the pgTAP suite already proves; this phase adds no tables, no policies and no service role usage. The launch checklist item "no service-role key in the client bundle" is enforced by searching the build output during the gate step. Error pages are a disclosure surface by nature, so they render only static copy. Advisors are re run on both projects after the staging push.

**Configuration required**: no new application environment variables. Each Vercel environment (Preview and Production) receives the full `.env.example` set: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (browser safe), `RESEND_API_KEY`, `RESEND_FROM`, `LEAD_NOTIFY_EMAIL`, `SITE_URL` (server only), `INDEX_SITE` (left unset), and optionally the Turnstile keys. The runbook names each and where it is set.

**Critical test scenarios** (each maps to an acceptance criteria in ## Requirements):
- Happy path: visit an unknown URL in the production build, get the styled 404, follow the home and book links, verifies **AC-2**
- Failure case: a forced render error in the running app shows the error page with no stack trace (temporary throwaway route removed before commit), verifies **AC-2**
- Happy path: `npx playwright test --grep "@ci"` runs the axe spec with zero serious or critical violations, verifies **AC-1**
- Happy path: three local Lighthouse runs on home produce a median of 90 or higher, verifies **AC-3**
- Failure case: the `performance` job fails on runner noise and the merge is still allowed (`continue-on-error`), verifies **AC-3**
- Walkthrough: every command in `docs/deploy.md` is checked for existence and correct flags before the human runs it, verifies **AC-4**
- Happy path: a booking on staging lands in the staging admin and the owner email arrives within seconds, verifies **AC-5**
- Auth/permission: the live production URL still carries noindex, the footer disclaimer, the placeholder license and SAMPLE tags, verifies **AC-6**
- Gate: seed shows 18 leads across statuses, the build output search finds no service-role key, every checklist line is ticked with evidence, verifies **AC-7**, **AC-10**
- Happy path: a timed booking run and the field count feed the case study numbers, verifies **AC-8**, **AC-9**

## Build plan

1. [ ] Spec written (this file), satisfies nothing on its own; commit still owed by the human
2. [x] Add `@axe-core/playwright`, write the `@ci` axe spec for the routes in AC-1 using the existing admin sign in pattern, run it, fix every serious or critical finding on those routes plus the focus and contrast spot check, satisfies **AC-1** (axe spec green: 18 tests, 0 failures; logo aria label and copper contrast fixed)
3. [x] Root `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` from Phase 1 tokens; verify both states in the running app with `next-dev-loop` (unknown URL, temporary forced error removed before commit), satisfies **AC-2** error half (unknown URL returns 404 with styled copy in the production build; forced throwaway route rendered the styled error page in a real browser, no visible stack, route removed)
4. [x] Empty state audit (reviews, admin inbox and filters, service and area lists, offers): add or align states to one pattern, satisfies **AC-2** empty half (one `EmptyState` primitive; OfferBar hidden when empty)
5. [ ] `performance` job in `.github/workflows/ci.yml` (build, start with the e2e job's environment, `npx --yes lighthouse` on the two URLs, scores printed, `continue-on-error`); confirm it runs on a push, satisfies **AC-3** CI half (job written; run on push still needs a human commit and push)
6. [x] Local Lighthouse medians for home and `/service-areas/dallas` with the handoff method; record the numbers, satisfies **AC-3** local half (home median 91 from runs 88, 94, 91, 91, 91; dallas median 96 from 96, 95, 96, 96, 96; CLS 0.000 on both; evidence in `docs/evidence/lighthouse/home-final-*.json` and `dallas-final-*.json`)
7. [x] Write `docs/deploy.md` per AC-4: env manifest, staging project creation and push commands, Vercel Preview and Production mapping, Resend SPF and DKIM verification, staged order, post deploy checks; dry check every command, satisfies **AC-4** (flags verified against `supabase db query --help`; admin bootstrap corrected to `node --env-file=.env.local scripts/create-admin.mjs`)
8. [x] Verify the seed evidence (18 leads, status classes); extend `supabase/seed.sql` only if the checklist minimum is unmet, satisfies **AC-7** seed half (`seed.sql` carries exactly 18 leads, `APEX-DEMO-001` to `018`, across all six statuses: new, contacted, scheduled, completed, lost, spam; no extension needed)
9. [ ] Write `docs/demo-clip.md` shot list; verify each beat in the running app (mobile viewport booking, email send path, admin status change on a seeded lead), satisfies **AC-8** (shot list written; mobile emergency submit verified live: 2.5 s to reference `APX-LQ66E3`; owner email send path executes with `LEAD_NOTIFY_EMAIL` set, arrival in the inbox is the human Gmail check; admin status change needs the human OTP mailbox)
10. [ ] HUMAN: staging per the runbook (create and link the staging Supabase project, push migrations, apply seed, advisors clean, Vercel Preview env, deploy, booking plus email test), record results here, satisfies **AC-5**
11. [ ] HUMAN: production per the runbook (Resend domain verification, Production env, deploy, confirm noindex and demo honesty on the live URL), record results here, satisfies **AC-6**
12. [ ] Gate: lint, typecheck, unit tests, build, full `@ci` suite green; build output search for the service-role key; tick every launch checklist line in `docs/PLAN.md` with evidence; run the verify and review pass, satisfies **AC-7**, **AC-10** (agent half done: lint, typecheck, 44 unit tests, build of 41 pages, `@ci` 52 of 52, service role key absent from `.next/static`, 404 verified in the production build; waiting on the human checklist lines, the commit and push, and the verify and review pass)
13. [ ] Write `docs/case-study.md` from the real commits and measured facts (document workflow); the human records the clip against the shot list and notes the result, satisfies **AC-9**, completes **AC-8** (`docs/case-study.md` written with the measured facts: home 91, dallas 96, 11 field standard form, 1.8 s timed run; clip recording still owed by the human)

## Consequences

**Positive**:
- The launch checklist stops being a wish list and becomes a ticked, evidenced gate, which is the phase's definition of done.
- Accessibility and speed get permanent automated visibility (axe on every push, Lighthouse scores on every push) instead of one person remembering to check.
- One runbook makes the deploy repeatable and reviewable, and makes a second environment (staging) a procedure rather than an improvised session.
- The case study ships with numbers that were measured on this build, which is exactly what the plan's portfolio angle asks for.

**Negative / tradeoffs**:
- One new dependency (`@axe-core/playwright`) must be maintained; it is approved, but it adds install weight and an upgrade surface.
- The non blocking Lighthouse job can rot into a red badge nobody reads; the local median still depends on the human actually running it and recording the result.
- The runbook drifts whenever commands or environments change, and nothing automated catches the drift.
- The phase's tail (two deploys, real device tests, Gmail rendering, clip recording) is entirely human work, so the gate can stall through no fault of the build.
- The case study and shot list are static prose that go stale the moment the site changes again.

**Neutral**:
- No schema, RLS or write path changes, so the security review surface stays exactly what phase 5 closed with.
- CI gets slightly slower (axe spec inside `@ci`, one extra Lighthouse job).
- `docs/` gains three files (`deploy.md`, `demo-clip.md`, `case-study.md`).

## Follow-up

- [ ] Read only demo admin on seeded data for prospects (the plan's portfolio "Try it yourself" line, deferred from this phase).
- [ ] Decide after a few weeks whether the Lighthouse job should become blocking (if runner noise proves calm) or be removed (if it is always ignored).
- [ ] Google Business Profile setup and name/address/phone consistency across directories (carried from phase 5, belongs with portfolio outreach, not the build).
- [ ] When a real client flips `INDEX_SITE=true`, re-run the Rich Results Test and the full Lighthouse gate on the deployed URL (carried from phase 5).
- [ ] Run `/sync` at phase close to reconcile the two carried housekeeping items recorded in `docs/specs/phase-5.md` (phase 3 spec status line, supabase skill conventions in root `AGENTS.md`).
- [ ] Re run advisors and the pgTAP route on staging after any future schema change, per the runbook.

## References

**Project sources**:
- `AGENTS.md`: server components by default, no new dependency without approval, service role key rules, design tokens only, accessibility (WCAG 2 AA, labeled fields, visible focus, large tap targets), performance targets, demo honesty rules, human applied migrations, Figma call budget
- `docs/PLAN.md`: phase 6 scope row (line 244), QA testing and deploy section (lines 250 to 260), launch checklist (lines 262 to 270), portfolio angle with the 60 second clip (line 277) and the case study outline (line 279), claims to avoid (line 280)
- `docs/specs/phase-5.md`: close state, follow ups this phase inherits, the `INDEX_SITE` semantics and the six slug fallback patterns
- `docs/specs/phase-4.md`: admin sign in pattern reused by the axe suite, lead status machine exercised by the clip
- `docs/specs/phase-3.md`: booking form as the only public write path, owner notification email path
- `.env.example`: the environment variable manifest the runbook is built from
- `supabase/seed.sql`: seed evidence for the checklist (18 sample leads and status history)
- `.github/workflows/ci.yml`, `playwright.config.ts`: current CI shape the two new checks extend
- `components/book/booking-form.tsx`, `lib/content/site.ts`: sources for the case study field count and the error page phone constant
- Phase 5 handoff notes (session transfer file): the local Lighthouse median method, the pgTAP `db query` workaround, Windows shell notes, human touchpoints

**Practices & standards**:
- WCAG 2 AA as the accessibility target, with automated axe checks in end to end suites as the regression guard
- Lighthouse performance measurement as a median of repeated runs to absorb machine noise, mobile form factor for a phone first audience
- Twelve factor style environment configuration: one manifest, one value per environment, no secrets in the repository
- Staging before production as the deploy order, with the verified environment promoted rather than rebuilt at launch
- Demo data honesty: placeholder license numbers, labeled sample reviews, explicit fictional company framing, `noindex` until deliberately flipped
