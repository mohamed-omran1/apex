# Apex Climate Solutions — Build Plan

Oct 11, 2026 · Mora

## Goals and locked decisions

Apex is a demo site for a fictional Dallas HVAC company, built to show small owner-operator contractors that a fast, credible site turns mobile searches into booked calls.

| Decision | Choice |
| --- | --- |
| Brand | Apex Climate Solutions, fictional, Dallas–Fort Worth |
| Who the portfolio targets | Small local owner-operators and small crews |
| Scope | Marketing site, online booking, admin dashboard |
| Out of scope | Customer portal, online payments, membership billing |
| Stack | Next.js 16, React 19, TypeScript, Tailwind v4, Supabase, Resend, npm |
| AI tooling | A mix of tools; one AGENTS.md is the source of truth for all of them |

**Done means:**

- A visitor on a phone sees the call button without scrolling and can request service in under a minute.
- Every request lands in the admin dashboard with a status, and the owner gets an email within seconds.
- Mobile Lighthouse performance is 90 or higher on the home page and a service-area page.
- Row Level Security is on every table, and no service-role key ever reaches the browser.
- A prospect can open the live demo, try booking, then see that request in the admin view.

## How the business works

An HVAC contractor sells three kinds of jobs, and each one needs something different from the website.

| Job type | Customer state | What the site must do |
| --- | --- | --- |
| Emergency repair | System is down, it is hot, they want a person now | Tap-to-call in the header and a sticky mobile bar, visible 24/7 status, a short phone-first emergency form |
| Replacement or install | Planned, expensive, comparing two or three companies | Free-estimate booking, financing explained, what is included, real reviews |
| Maintenance | Routine and seasonal | Tune-up booking, a plain membership explainer, seasonal prompts |

Seasonality is strong in Dallas. One Hour's local page leans on triple-digit summers and recommends [AC tune-ups in early spring and furnace checkups in early fall](https://www.onehourheatandair.com/areas-we-service/sunnyvale-tx/), so the homepage banner and offers should rotate by season.

**Where a small owner-operator loses leads.** The owner is often on a roof or in an attic when the phone rings. Calls go unanswered, after-hours requests wait until morning, and leads are scattered across calls, texts, Google and a contact form. Apex should demonstrate the fix: every lead lands in one place with a status, the owner is notified instantly, and the next action is obvious. That is the pitch to this audience, not fancy design.

## Competitor findings

The big Dallas players win on trust stacks and local pages, which a small contractor can copy cheaply, and they lose on form friction and thin local content. I opened two pages in detail; Airtron and On Time Experts still need a manual pass (task in the build plan).

| Pattern | [Service Experts Dallas](https://www.serviceexperts.com/dallas-tx/) | [One Hour, Sunnyvale page](https://www.onehourheatandair.com/areas-we-service/sunnyvale-tx/) | Apex move |
| --- | --- | --- | --- |
| Header | Phone number, Schedule CTA, offers bar, 4.8 rating | 24/7 phone icon, Book Now and Call Us, 4.82 Google rating | Sticky call and book bar on mobile, rating badge near the hero |
| Offer | $0 diagnostic with paid repair and a $49 tune-up, each with an end date | Free estimate and upfront pricing | One seasonal offer with a visible end date |
| Trust | Written guarantee, ACE certification, licensed and insured, license numbers in the footer | On-time guarantee, satisfaction-or-free, background-checked techs | Guarantee strip plus the TDLR license number in the footer and structured data |
| Plans | Lease program and a maintenance membership | Maintenance plans and a club membership | Membership explainer with an enquiry form, no billing |
| Quoting | Instant-quote tool | Zip code check for service coverage | Zip check at the top of the booking form |
| Local pages | One long list of served cities | A page per suburb with local FAQs, neighborhoods, recent jobs and a repair price range | Service-area pages with real local detail, not find-and-replace templates |
| Reviews | Recent, dated, naming the technician | Recent Google reviews | Sample reviews, clearly labeled as demo content |

**Copy:** the header pattern, dated offers, the guarantee strip, the zip check, and local pages that mention real neighborhoods.

**Skip:** lease programs, an online shop, franchise-style navigation with a dozen service menus. They signal a big company and add build cost that a one-truck owner will never use.

**Beat them on:** a booking form with four or five fields, plain price ranges (One Hour publishes a repair range on its local page), and mobile speed. Large franchise sites carry heavy tracking and video; a lean Next.js site can be visibly faster.

## Pages and features

The MVP is roughly 25 public pages plus a small admin; anything that needs payments, live availability or a customer login waits for later.

| Area | MVP | Later |
| --- | --- | --- |
| Home | Hero with call and book buttons, trust strip, services, seasonal offer, three-step how-it-works, reviews, service-area teaser, FAQ, closing CTA | A/B tested hero variants |
| Services | Index plus AC repair, AC replacement, heating repair, maintenance and tune-ups, indoor air quality, and a 24/7 emergency page | Commercial HVAC page |
| Service areas | Index plus six suburb pages (Dallas, Plano, Irving, Garland, Richardson, Frisco), each with unique local content | More suburbs added from the database |
| Booking | One flow for emergency, repair, estimate and tune-up requests, with a zip check | Live calendar availability |
| Trust pages | About, guarantee, reviews, financing explainer, membership explainer with an enquiry form | Review requests after a job |
| Content | Three seasonal tips articles | Full blog |
| Legal | Privacy, terms, SMS and email consent | Cookie preferences |
| Admin | Login, leads inbox with filters, lead detail with status and notes, emergency-mode toggle, offer and business-hours editor, CSV export | Technician assignment, day schedule, SMS replies |

Out of scope on purpose: customer portal, payments, membership billing, and any instant-quote engine. Each adds weeks and does not change what a small owner-operator sees in the demo.

## Booking and lead flow

A request should take under a minute from tap to saved lead, and every request ends in the same inbox whatever its urgency.

**Flow (8 steps):**

1. **Visitor taps Book** — header button or sticky mobile bar
2. **Zip check** — out-of-area gets a polite message
3. **Pick request type** — emergency, repair, estimate, tune-up
4. **Fill the form** — short for emergency, full otherwise
5. **Server Action checks** — Zod, honeypot and Turnstile
6. **Insert lead as new** — anon insert-only RLS policy
7. **Send emails** — owner alert and visitor receipt *(the step that protects the owner from missed leads)*
8. **Admin inbox** — new, contacted, scheduled, completed

- **Short form for emergencies:** name, phone, zip and what is wrong, so the phone number is captured even if the visitor gives up halfway. Other kinds add the address, a preferred day and a window of ASAP, morning, afternoon or evening.
- **Requested windows, not live availability.** Small contractors schedule by phone, so calendar sync can wait.
- **Out-of-area zips** get a polite message and a way to leave a number anyway.
- **Emergency leads** are tagged urgent: the email subject starts with URGENT and the lead is pinned to the top of the inbox.
- **Duplicate guard:** a second request from the same phone number within ten minutes adds an event to the existing lead instead of creating a new one.
- **Statuses** are `new`, `contacted`, `scheduled`, `completed`, plus `lost` and `spam`, and every change is logged in `lead_events`.
- **The owner email** carries the summary, a tap-to-call link and a link to the lead in the admin.

## Data model and security

Eight tables cover the whole MVP, and Row Level Security is on for every one: the public can read marketing data and insert a lead, and only allowlisted admins can read or change leads.

| Table | Holds | Public (anon) | Admin |
| --- | --- | --- | --- |
| `leads` | Request kind, urgency, status, contact details, address and zip, issue text, preferred window, consent flags, UTM fields | Insert only, forced to status `new` | Read, update status |
| `lead_events` | Status changes, notes, emails sent, one row each | None | Read, insert |
| `services` | Slug, name, summary, emergency flag, sort order | Read | Edit |
| `service_areas` | Slug, city name, zip codes, local content fields, active flag | Read active rows | Edit |
| `offers` | Title, body, start and end dates, active flag | Read rows currently in date | Edit |
| `reviews` | Name, rating, text, date, `is_sample` flag | Read published rows | Edit |
| `site_settings` | One row: phone, hours, emergency mode and banner, TDLR license number | Read | Edit |
| `admin_users` | User id and role for the allowlist | None | Read |

The lead statuses are `new`, `contacted`, `scheduled`, `completed`, `lost` and `spam`. Kinds are `emergency`, `repair`, `estimate`, `tune_up` and `membership_enquiry`. Both are Postgres enums.

**Rules that agents tend to get wrong.** Supabase's own agent-skills checklist, from their [launch post](https://supabase.com/blog/supabase-agent-skills), is worth pasting into AGENTS.md:

- Authorize admins from the `admin_users` table or `app_metadata`, never `user_metadata`, which users can edit.
- The service-role key stays on the server. In Next.js, any `NEXT_PUBLIC_` variable ships to the browser.
- Any view needs `security_invoker = true`, otherwise it bypasses RLS.
- An UPDATE needs a matching SELECT policy or it silently changes zero rows.
- An insert that returns data needs a SELECT policy too, so the lead action should generate its own reference code and skip `.select()` after the insert.

**Migration workflow.** Develop against a local or staging Supabase project, iterate with the MCP `execute_sql` tool, run the database advisors once the schema settles, then commit a migration. Supabase [recommends against](https://supabase.com/blog/supabase-agent-skills) pointing the MCP server at production.

## Architecture and stack

There is no Supabase client in the browser bundle for the MVP: pages are Server Components, and sign-in and lead submission are Server Actions.

**Layers:**

- **Browser**
  - Owner at /admin → Admin pages
  - Visitor on a phone → Public pages
- **Next.js 16 on Vercel**
  - Admin pages (session check) → Supabase for leads and login
  - Public pages (reads content) → Supabase for reads; form submit → Lead action
  - Lead action (writes leads, the only write path from the public site) → Supabase insert, and → Resend for email
- **Services**
  - Supabase: Postgres with RLS, plus Auth
  - Resend: owner alert

The lead action is the only write path from the public site, which keeps spam checks, validation and email in one place.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript | Server Components by default, plus bundled docs and MCP for agents |
| Styling | Tailwind v4 with a small in-repo component set | Fast to build and easy to restyle per client |
| Data | Supabase Postgres through `@supabase/ssr` | RLS on every table, one server client factory |
| Validation | Zod schemas shared by the form and the action | One definition of a valid lead |
| Email | Resend, called only from the lead action | Keys never leave the server |
| Hosting | Vercel, with Supabase staging and production projects | Matches the QA plan |
| Tests | Vitest, Playwright, pgTAP | Covers logic, flows and RLS |

```text
app/
  (public)/          home, services, service-areas, book, trust pages
  admin/             protected routes: inbox, lead detail, settings
actions/             submitLead, signIn, updateLeadStatus
lib/
  supabase/          server client factory, generated types
  validation/        Zod schemas
  email/             Resend wrappers and templates
supabase/
  migrations/  seed.sql  tests/
docs/specs/          one spec per build phase
```

## Local SEO and content

Local search is how small contractors get found, so the demo should show a clean local-SEO foundation rather than keyword stuffing.

- **Service-area pages.** One dynamic route, `/service-areas/[slug]`, fed by the `service_areas` table and pre-built with `generateStaticParams`. Each page needs content that is actually different: neighborhoods, typical local issues, a price range, two or three local FAQs. One Hour's suburb page is the benchmark, and a find-and-replace template is the thing to avoid.
- **Say "serving", not "office in".** Texas rules limit what a secondary location can be used for: [16 TAC §75.71(f)](https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-75-71) says non-office locations may not be used to contract HVAC sales or service. Apex has one Dallas office and serves the suburbs from it.
- **Structured data.** JSON-LD with the schema.org `HVACBusiness` type (name, phone, hours, `areaServed`) on every page, plus `BreadcrumbList` on service and area pages. Check it in Google's Rich Results Test before launch.
- **Metadata.** A title pattern like "AC Repair in Plano, TX | Apex Climate Solutions", unique descriptions, canonical URLs, generated OG images, plus `sitemap.ts` and `robots.ts` using the App Router file conventions.
- **Speed targets.** LCP under 2.5 s, CLS under 0.1, INP under 200 ms on a mid-range phone. Server Components by default, `next/image` and `next/font`, no chat widget and no tag manager in the MVP.
- **Content.** Three seasonal articles: spring AC tune-up checklist, "AC not cooling? Five checks before you call", and a fall furnace check.

**Demo honesty.** Apex is fictional, so the footer carries a visible "demo company" note, sample reviews are labeled, and the production demo ships with `noindex` so it never competes with a real business. The case study then shows the real-client version: Google Business Profile setup and consistent name, address and phone everywhere.

## Trust and compliance

The compliance details are what separate a real contractor site from a template, and most portfolio sites skip them. This is practical guidance, not legal advice; a real client's counsel should review it.

| Topic | Rule for Apex | Where it lives |
| --- | --- | --- |
| TDLR license | [Texas advertising by HVAC companies must include the licensee's license number](https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-75-71) (§75.71(h)). Service Experts shows its numbers in the page footer. Apex shows a clearly marked placeholder, never a real or realistic number, since §75.71(j) bars using a license not assigned to the company | `site_settings.tdlr_license`, footer, JSON-LD |
| Regulator notice | Proposals, invoices and contracts must carry the TDLR "Regulated by" notice. Put it in the footer now and in future estimate templates | Footer component |
| Consent | Store a consent flag, a timestamp and the wording version with each lead. SMS stays off in the MVP, but the checkbox and the columns exist | `leads` consent columns |
| Spam | Honeypot field, Cloudflare Turnstile, server-side Zod validation, and a platform-level rate limit on the booking endpoint | Server Action, edge rules |
| Admin access | Supabase Auth with the `admin_users` allowlist, email OTP (single factor); TOTP deferred, no public sign-up | `/admin` middleware and RLS |
| Secrets | Resend and service keys server-only, `.env.example` committed, real `.env.local` never | Repo and hosting settings |
| Accessibility | Labeled form fields, visible focus, color contrast at WCAG 2 AA, checked with axe in CI | Components and tests |
| Privacy | Ask for the minimum: name, phone, zip, and the full address only when a visit is booked. Privacy page explains retention | Booking form, `/privacy` |

## AI-agent setup

Because you will switch between tools, the repo itself is the contract: one `AGENTS.md`, one `.mcp.json`, and per-phase spec files, so any agent can pick up any task.

| File | Job |
| --- | --- |
| `AGENTS.md` | The single source of truth, around 100 lines: stack, commands, folder layout, the Supabase security checklist from the data-model section, and a definition of done |
| `CLAUDE.md` | One line, `@AGENTS.md`, so Claude Code reads the same rules |
| `.mcp.json` | Next.js DevTools MCP and the Supabase MCP, the latter pointed at a local or staging project only |
| `docs/PLAN.md` | An export of this plan |
| `docs/specs/phase-N.md` | One spec per build phase: scope, files to touch, acceptance checks |

Keep the hard rules inline in `AGENTS.md`. Supabase found that agents skim reference files, so [critical security rules belong in the main file](https://supabase.com/blog/supabase-agent-skills).

**Docs-first order, so agents stop relying on stale training data:**

1. Next.js ships version-matched docs inside the package at `node_modules/next/dist/docs/`, and [the managed block in `AGENTS.md` points agents at them](https://nextjs.org/docs/app/guides/ai-agents). Next.js 16.3 and later generate that block automatically, and Vercel reports [bundled docs beat skill-based retrieval](https://nextjs.org/docs/app/guides/ai-agents) in its evals.
2. The built-in Next.js MCP endpoint at `/_next/mcp` gives agents live routes, logs and compile errors from the dev server.
3. For Supabase, agents use the MCP `search_docs` tool first, then fetch the docs page as Markdown by adding `.md` to the URL, then web search as a last resort.
4. Any other library: look for `/llms.txt` or a `.md` version of the page before searching.

**Skills worth installing** (commands from the two sources above):

```bash
npx skills add supabase/agent-skills
npx skills add vercel/next.js --skill next-dev-loop
# later, for the performance phase
npx skills add vercel/next.js --skill next-bundle-optimizer
```

Your own fresh-docs skill fits this stack too, so Apex can be its first real test.

**Per-task loop:** write or open the phase spec, let one agent implement it on a branch, have it verify with `next-dev-loop` against the running app, run lint, typecheck and tests, run the Supabase advisors if the schema changed, then review the diff yourself. One phase per agent session keeps context clean when you switch tools.

## Phased build plan

Data and security come before the booking flow on purpose: RLS is easiest to get right before anything depends on it.

| Phase | Name | Scope | Gate to pass before the next phase |
| --- | --- | --- | --- |
| 0 | Foundation and agent setup | AGENTS.md, .mcp.json, skills, CI, local Supabase | Agent can run dev server, lint, typecheck, tests |
| 1 | Design system and static pages | Tokens, components, home and service pages | Mobile Lighthouse 90+ on home — passed 2026-10-14, score 92 |
| 2 | Data and security | Schema, enums, RLS policies, seed data | Advisors clean and RLS tests pass |
| 3 | Booking flow | Form, Server Action, Resend emails, spam checks | E2E passes and the owner email arrives |
| 4 | Admin dashboard | Auth with email OTP (single factor); TOTP deferred, inbox, lead detail, settings, CSV | Lead moves new to scheduled; non-admin blocked |
| 5 | Local SEO and content | Area pages, JSON-LD, sitemap, three articles | Rich Results Test passes; sitemap complete |
| 6 | Polish, deploy and case study | Accessibility, perf, staging then production, demo clip | Pre-launch checklist ticked |

- **One phase, one spec, one agent session.** Each phase gets a file in `docs/specs/` with scope, files to touch and the gate as acceptance checks, so you can hand it to any tool.
- **Phase 0 also holds the remaining competitor teardown:** open Airtron and On Time Experts and tick off the same pattern list as the competitor table.
- **No durations yet.** They depend on how many hours a week you can give this. Tell me and I will add dates.

## QA, testing and deploy

A contractor demo lives or dies on the booking flow and the admin view, so tests concentrate there and run in CI.

- **Unit (Vitest):** the Zod schemas for the booking form and the lead status transitions.
- **End to end (Playwright):** an emergency request, an estimate request, validation errors, the zip check, admin login, and moving a lead from `new` to `scheduled`.
- **RLS tests:** pgTAP checks through the Supabase CLI proving that anon can insert a lead but cannot read, update or delete one, and that a non-admin user sees nothing in the admin tables.
- **Accessibility:** axe checks inside the Playwright run.
- **Performance:** Lighthouse CI against the targets in the SEO section, on the home page and one service-area page.

**Deploy:** Vercel for Next.js, with separate Supabase projects for staging and production and separate environment variables for each. Verify the Resend sending domain (SPF and DKIM) before the first real email test.

**Pre-launch checklist**

- [ ] Tap-to-call and the booking flow tested on a real iPhone and a real Android phone
- [ ] Owner notification email arrives within seconds and renders well in Gmail
- [ ] Supabase advisors report no security or performance warnings
- [ ] No service-role key in the client bundle (search the build output)
- [ ] 404, 500 and empty states designed
- [ ] Demo disclaimers, placeholder license and `noindex` in place
- [ ] Seed data loaded: services, six areas, one offer, sample reviews, 15 to 20 sample leads in different statuses so the admin looks alive

## Portfolio angle

Small owner-operators do not care about your stack; they care that the phone rings and nothing gets lost. Present Apex as proof of that, with the technical work as supporting detail.

- **One-line pitch:** "A fast HVAC website where every request lands in one place and the owner is told instantly."
- **A 60-second screen recording:** book an emergency repair on a phone, watch the owner email arrive, open the admin, move the lead to scheduled. This one clip does more than any page of copy.
- **Try it yourself:** a read-only demo admin on seeded data, enforced by RLS, so a prospect can click around without breaking anything.
- **Case study outline:** the problem (missed calls, scattered leads, slow sites), the approach, the booking flow, the admin, then measurable facts you can verify: Lighthouse scores, form fields count, seconds from landing to submitted request.
- **Claims to avoid:** conversion-lift percentages. Most figures online come from agencies selling websites, and Apex has no real traffic to back them up. Show speed, clarity and process instead.
- **Outreach:** a short teardown of the prospect's current site (three specific fixes) plus the Apex link, not a generic "I build websites" message.

## Risks and open questions

The biggest risks are agents skipping Supabase security rules and the scope growing past a one-person demo.

| Risk | Mitigation |
| --- | --- |
| Agents skip RLS or leak the service key | Checklist inline in `AGENTS.md`, database advisors per phase, pgTAP RLS tests |
| Scope creep into portal, payments, live calendar | The out-of-scope list in this plan; changes go through a new phase |
| Thin competitor research | Only two sites were opened in depth; Phase 0 finishes the rest |
| A fictional company looking misleading | Demo notice, labeled sample reviews, placeholder license, `noindex` |

**Decisions for you**

- [ ] Continue the existing Apex repo, or start a fresh one?
- [ ] Ship the public demo with `noindex`? My default is yes.
- [ ] Keep Cloudflare Turnstile, or rely on honeypot plus rate limiting only?
- [ ] How many hours a week can you give this, so I can add dates to the roadmap?

## Sources

Pages opened on October 11, 2026. Competitor offers and ratings change often.

- [16 Tex. Admin. Code §75.71](https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-75-71), Cornell LII
- [Service Experts Dallas](https://www.serviceexperts.com/dallas-tx/)
- [One Hour Heating & Air Conditioning, Sunnyvale page](https://www.onehourheatandair.com/areas-we-service/sunnyvale-tx/)
- [How Next.js supports AI coding agents](https://nextjs.org/docs/app/guides/ai-agents), Next.js docs, version 16.4.0
- [AI Agents Know About Supabase. They Don't Always Use It Right.](https://supabase.com/blog/supabase-agent-skills), Supabase blog, April 9, 2026
