
# Phase 5. Local SEO and content

**Date**: 2026-10-17
**Status**: Accepted

## Summary

Phase 5 makes the site findable and complete. It builds six service area pages fed by the database (each with its own neighborhoods, local issues, price range and FAQs), eight missing pages from the plan (five trust pages and three legal pages), three seasonal articles, and the SEO plumbing the phase gate demands (JSON-LD structured data, a full sitemap, robots control, one branded social card image, and real navigation links). The site keeps its `noindex` demo honesty stance; a single `INDEX_SITE` flag flips the whole thing indexable when a real client deployment needs it.

## Context

Phases 0 to 4 shipped the marketing core, the database with Row Level Security (RLS, the database's per user row filtering), the booking flow and the admin desk. What does not exist yet is everything the plan file promised for local search and content: there is no `/service-areas` route at all (the home page's six city cards are plain text), no structured data, no sitemap, no robots file, and the trust pages (about, guarantee, reviews, financing, membership) and legal pages (privacy, terms, SMS and email consent) promised in the plan's page table are unassigned to any phase. The phase gate is "Rich Results Test passes; sitemap complete", which cannot honestly pass until those pages exist.

Forces that shape this spec. The plan requires area pages with content that is actually different per suburb (neighborhoods, local issues, a price range, two or three local FAQs), benchmarked on One Hour's Sunnyvale page, and explicitly warns against find and replace templates; that content belongs in the `service_areas` table the plan already defines ("local content fields", line 109), but the Phase 2 migration only created `slug, city, zip_codes, is_active, sort_order`. The plan also locks demo honesty (line 181): the public demo ships `noindex` so a fictional company never competes with a real business, which sits in tension with a complete sitemap, so the reconciliation is part of this design. The stack is settled (Next.js 16 App Router with `ensureStatic = "navigation"` on the public layout, Supabase anon reads through the cookie free client factory, Tailwind v4 tokens from Phase 1), public routes are statically generated, and the cookie free `createPublicClient` plus the `use cache` pattern from `lib/lead/areas.ts` is how public pages already read Supabase without breaking static rendering. The membership enquiry lead kind, its booking form copy and its `?kind=` preselect support (components/book/booking-form.tsx) already shipped in Phase 3, so the membership page only needs to link into it. The Figma rule in AGENTS.md forbids MCP calls without explicit human approval; a frame PNG of the Plano area page (`docs/design/Area/Plano.png`) is already in the repo, and the design system (tokens and components) is the Phase 1 system every other page uses.

## Requirements

**User stories**:
- As a homeowner in Plano, I search "AC repair Plano" and land on a page that names my neighborhood, explains what usually breaks here, gives a plain price range, and answers two or three local questions, so I trust the company enough to book.
- As a comparison shopper, I can open about, guarantee, reviews, financing and membership pages and read real explanations, so the company looks complete instead of a template with a form.
- As the site owner, every public page carries correct structured data and every URL appears in the sitemap, so when I flip the demo to a real deployment it is ready for search engines.
- As a privacy conscious visitor, I can read the privacy, terms and consent pages from the footer links.
- As Google, I see consistent `HVACBusiness` data, breadcrumbs and matching FAQ markup, and the demo still cannot be indexed while `INDEX_SITE` is off.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: One migration adds six columns to `public.service_areas`: `lede` (text, not null), `meta_description` (text, not null), `neighborhoods` (text[], not null), `local_issues` (text[], not null), `price_range` (text, not null), `faqs` (jsonb, not null, array of `{"q": string, "a": string}`). Seed data fills all six active areas (dallas, plano, irving, garland, richardson, frisco) with unique, specific content per city (no shared sentences across cities, price ranges plausible for the DFW market, two or three FAQs each). RLS is unchanged: the existing anon `SELECT` where `is_active` policy already covers the new columns, and the pgTAP suite and advisors still pass with zero findings. Generated types are refreshed (`npx supabase gen types typescript --linked`). The human applies the migration.
- **AC-2**: `/service-areas` renders an index of all active areas, each linking to `/service-areas/[slug]`, using the Phase 1 components (ServiceHero, cards or list consistent with the services index pattern), with unique metadata (title and description). Inactive areas never appear.
- **AC-3**: `/service-areas/[slug]` renders one page per active area with, in order: hero (crumb, h1 naming the city, lede from the `lede` column, primary CTA to `/book`, secondary call link), a neighborhoods section listing the `neighborhoods` array, a local issues section listing `local_issues`, a price range block showing `price_range` in plain language, the FAQ section rendering `faqs`, and a closing CTA. `generateStaticParams` returns active slugs from the database, falling back to the six known slug constants when the fetch fails (for example a CI build with no Supabase env), so the URLs always exist in a build. When a row is missing at render time (no env build), the page renders a graceful thin state (city name from the slug, call and book CTA) rather than a 404 or a crash. An unknown slug (not in the fallback list and not in the database) is a 404.
- **AC-4**: The five trust pages exist at `/about`, `/guarantee`, `/reviews`, `/financing`, `/membership`, each with real copy in a typed content module under `lib/content/`, Phase 1 tokens only, unique metadata, and a closing CTA. `/reviews` reads published rows from the `reviews` table through the anon client (RLS already allows it) with the `is_sample` SAMPLE tag visible on sample reviews and a graceful empty state. `/membership` explains the seasonal club in plain language, states that no card is charged on the site, and links to `/book?kind=membership_enquiry`. All five pages carry the demo honesty framing (fictional company, sample reviews).
- **AC-5**: Opening `/book?kind=membership_enquiry` (or `?type=membership`, which the form already maps) preselects the Seasonal Club kind in the booking form, the membership hidden field submits `kind=membership_enquiry`, and the lead lands in the admin inbox as a membership enquiry. No change to the lead action or Zod schema is needed; this criterion is the link, a regression test on the existing param parsing, and the end to end proof.
- **AC-6**: The three legal pages exist at `/privacy`, `/terms`, `/consent`. Privacy explains what the lead form collects (name, phone, ZIP, address only for a booked visit), that SMS is off in the MVP, and retention in plain language. Terms is a short plain demo terms page. Consent explains the email and SMS consent checkbox, that consent is stored with a timestamp and wording version, and links to both. Footer legal text becomes real links to these pages. All three carry the demo honesty framing and are clearly labeled as sample text, not legal advice.
- **AC-7**: `/tips` is an index of the three seasonal articles, and each article renders at `/tips/[slug]` from a typed content module `lib/content/articles.ts` (fields: `slug`, `title`, `description`, `season` tag, `published_on`, body sections as eyebrow/heading/paragraphs/bullets typed like `services.ts`). `generateStaticParams` covers the three slugs: spring AC tune-up checklist, "AC not cooling? Five checks before you call", fall furnace check. Unique metadata per article; each article links to the relevant service page or `/book`.
- **AC-8**: Structured data ships as JSON-LD (schema.org markup in a `<script type="application/ld+json">` tag). `HVACBusiness` appears on every public page (name, phone, address, hours, TDLR license placeholder, `areaServed` listing the six cities), sourced from `lib/content/site.ts` constants. `BreadcrumbList` appears on `/services/*`, `/service-areas/*` and `/tips/*` pages, matching the visible breadcrumbs. `FAQPage` appears on every page that renders visible FAQs (service pages and area pages), and its question and answer pairs match the visible text exactly. All JSON-LD parses as valid JSON (unit test).
- **AC-9**: `sitemap.ts` at the app root lists every public URL: home, `/book`, `/services` plus the six service slugs, `/service-areas` plus every active area slug, the five trust pages, the three legal pages, `/tips` plus the three article slugs. `robots.ts` at the app root: when `INDEX_SITE` is not `"true"`, it disallows all crawling (and the root metadata keeps `robots: { index: false, follow: false }`); when `INDEX_SITE=true` it allows all and the root metadata robots value becomes index/follow. The flag reads from `process.env.INDEX_SITE`, defaults off, and is documented in `.env.example`. Canonical URLs on public pages use `SITE_URL`.
- **AC-10**: One static branded OG image (1200×630 PNG) ships in `public/images/` and is referenced by a shared public metadata helper with an absolute URL built from `SITE_URL`, so every public page has `og:title`, `og:description` and `og:image` plus a Twitter card equivalent. No per page image generation, no runtime image routes.
- **AC-11**: Navigation is wired to the new surfaces: header "Areas" links to `/service-areas`; the home page's six city cards each link to `/service-areas/[slug]`; the footer Areas column lists the six cities as links; the footer legal line links to `/privacy`, `/terms` and `/consent`; a "Tips" entry (footer and, if it fits cleanly, header) links to `/tips`. Every one of these links resolves to a live page.
- **AC-12**: The gate passes: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass; Playwright `@ci` includes smoke checks for `/service-areas`, one area page, `/tips`, `/reviews` and `/privacy` (render, correct h1, no console errors); mobile Lighthouse on home stays at 90 or higher; the human runs Google's Rich Results Test on the home page and one area page with zero errors for the JSON-LD types in AC-8; the sitemap lists every route in AC-9 and each returns 200 in the local production build.

## Options considered

### Area page content storage

**Option A: database columns on `service_areas` (chosen).** The six new columns from AC-1, filled by seed, read through the anon client at build time. **Pros**: matches the plan's data model exactly ("local content fields" in the table), a real client can later edit content without a deploy, one table and one RLS policy already exist. **Cons**: one migration and a type regeneration, build time dependency on Supabase (handled with the same fallback pattern `getActiveZips` uses).

**Option B: typed content module in `lib/content/`.** Six area entries in TypeScript like `services.ts`. **Pros**: zero migration, fully static, no build dependency. **Cons**: contradicts the plan's data model, leaves the `service_areas` table as ZIP codes only, and makes the "admin can edit later" story false.

**Option C: database columns plus an admin editor.** Migration plus a service areas card in `/admin/settings`. **Pros**: the owner can edit local content. **Cons**: grows Phase 5 significantly for content that changes twice a year; recorded as a follow up instead.

### Where the noindex demo stance meets the sitemap gate

**Option A: noindex stays, sitemap ships complete, one flag flips both (chosen).** `robots.ts` disallows all, root metadata keeps `noindex`, `sitemap.ts` still lists every URL, and `INDEX_SITE=true` flips robots, metadata and (implicitly) the demo's posture together. **Pros**: demo honesty is preserved with one reviewable switch; the gate passes because the Rich Results Test fetches a URL directly regardless of robots, and "sitemap complete" is checkable in the build; a real deployment is one env var away. **Cons**: a crawler that ignores robots could still fetch pages; the sitemap is complete but disallowed, which looks odd if inspected naively.

**Option B: allow crawl, meta noindex only.** Robots allows everything, only the page meta stops indexing. **Pros**: closer to a production robots/sitemap pair. **Cons**: pages are fetchable and servable by any crawler; weaker demo honesty for a fictional company.

**Option C: index the demo.** Drop noindex entirely. **Cons**: directly contradicts the locked plan decision (line 181) and could let a fictional company surface in real local searches.

### Structured data content source

**Option A: `lib/content/site.ts` constants (chosen).** Phone, license, address and hours come from the same module the header and footer already render. **Pros**: zero new reads, cache safe under static generation, single source for every JSON-LD instance. **Cons**: admin edits to `site_settings` phone or hours do not flow into JSON-LD until a later phase binds them; recorded as a follow up.

**Option B: read the `site_settings` row with `use cache`.** Anon select is already allowed by RLS. **Pros**: admin edits flow into structured data. **Cons**: another build time database dependency for values that change rarely, and the cache invalidation story for a one row table adds complexity the demo does not need yet.

### Social card images

**Option A: one static branded PNG (chosen).** A single 1200×630 image in `public/images/`, referenced with an absolute `SITE_URL` based path. **Pros**: zero runtime cost, keeps the Lighthouse gate safe, one file to restyle per client. **Cons**: every page shares one card image; per page cards are a later nicety.

**Option B: `opengraph-image.tsx` per page template with `next/og`.** **Pros**: unique cards per page, matches the plan's "generated OG images" wording literally. **Cons**: an edge function surface per route, more build time and bundle cost, for a noindex demo whose social cards barely matter.

## Decision

Build Phase 5 as specified: a six column migration on `service_areas` with unique seed content, area pages rendered from the database with a static fallback for slug generation, eight trust and legal pages with copy in typed content modules, three articles in `lib/content/articles.ts`, JSON-LD from `site.ts` constants, a complete sitemap with an `INDEX_SITE` flip for robots and meta, one static OG image, and full navigation wiring. The membership enquiry reuses the existing booking form param; no new lead path.

**Implementation skills**: `supabase` (`.agents/skills/supabase/`) · `next-dev-loop` (`.agents/skills/next-dev-loop/`) · Next 16 bundled docs in `node_modules/next/dist/docs/` (metadata, sitemap, robots, static rendering, JSON-LD patterns) before any code.

## Rationale

The database wins for area content because the plan already committed to it in two places (the data model table and the local SEO section) and because the alternative makes the `service_areas` table a ZIP code list wearing a content model's name. The fallback slug list costs a few constants and saves the CI build and the sitemap from depending on a live Supabase connection, which is the same honest degradation `getActiveZips` already chose. Keeping `noindex` and adding `INDEX_SITE` resolves the plan's own tension (demo honesty vs a complete sitemap) without weakening either side: the demo cannot rank, the gate is objectively checkable, and the real deployment flip is one variable documented in `.env.example`. Static JSON-LD from `site.ts` rather than a database read follows the project's own pattern of preferring static, cache safe reads on public routes; binding to `site_settings` is a real improvement but belongs when the admin settings page actually edits phone and hours for a live client. One OG image instead of generated per page images protects the Phase 1 Lighthouse 90 gate, which is a hard rule in AGENTS.md, and social cards for a noindex fictional demo are not where differentiation lives. Membership uses the booking param because the form, the Zod schema, the email templates and the admin filters already support the kind; a second form would violate the "one write path from the public site" rule for no gain.

## Feature design

**Data model sketch**:

| Table | Change |
|---|---|
| `service_areas` | Add six not null columns: `lede` text, `meta_description` text, `neighborhoods` text[], `local_issues` text[], `price_range` text, `faqs` jsonb (array of `{q, a}`). Update seed for all six active rows. RLS unchanged. |
| everything else | No schema change. Reviews, offers and site settings are read as Phase 2 designed them. |

The `faqs` jsonb shape is validated on read with a small Zod schema in the area fetch helper; entries missing `q` or `a` are dropped rather than crashing a page.

**State transitions**: none. This phase reads content; it introduces no new statuses or lifecycle.

**API surface** (public read paths and one route convention; no new Server Actions, no new write paths):

| Surface | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/service-areas` | GET | none | active area list with links | anon (RLS `is_active`) | empty list state |
| `/service-areas/[slug]` | GET | slug path param | full area page from one row | anon | 404 unknown slug; thin state when row missing at build |
| area fetch helper | — | none | active areas for `generateStaticParams`, six slug constants as fallback | anon | fallback list on fetch error |
| `/about`, `/guarantee`, `/reviews`, `/financing`, `/membership` | GET | none | typed copy pages; `/reviews` reads published review rows | anon | empty reviews state |
| `/privacy`, `/terms`, `/consent` | GET | none | typed legal copy pages | anon | none |
| `/tips`, `/tips/[slug]` | GET | slug path param | typed article content | anon | 404 unknown slug |
| `sitemap.ts` | GET | none | XML of every public URL | none | area slugs from fetch or fallback list |
| `robots.ts` | GET | `INDEX_SITE` env | disallow all or allow all | none | default disallow |
| `/book?kind=membership_enquiry` | GET | `kind`/`type` query | form with kind preselected (already implemented) | anon | invalid kind falls back to default |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| area page hero h1 | city display name | `service_areas.city` column |
| area lede, meta description | page intro and SEO description | `lede`, `meta_description` columns |
| neighborhoods, local issues, FAQs | section lists | `neighborhoods`, `local_issues`, `faqs` columns |
| price range block | plain language range | `price_range` column |
| `generateStaticParams` slugs | active slugs, fallback to six constants | DB read; `lib/content` fallback list on error |
| `HVACBusiness` JSON-LD | name, phone, address, hours, license, areaServed | `lib/content/site.ts` constants (city list from the same six slugs) |
| `BreadcrumbList` | trail items | page hierarchy (home, parent index, current), labels from page data |
| `FAQPage` | question and answer pairs | the same `faqs` values rendered visibly on the page |
| trust and legal page copy | all body text | typed modules under `lib/content/` |
| reviews page rows | name, rating, body, date, sample flag | `reviews` table, anon select where `is_published` |
| article body | sections | `lib/content/articles.ts` |
| OG image URL | absolute URL | `SITE_URL` + `/images/<file>.png` |
| canonical URLs | absolute page URL | `SITE_URL` + path |
| sitemap URLs | every public route | route constants plus DB area slugs (or fallback) |
| robots allow/disallow | policy | `process.env.INDEX_SITE === "true"` |

**Key invariants**:
- No new write path from the public site; the membership enquiry goes through the existing `submitLead` action.
- Area page content differences come only from the database row; no per city code branches.
- Every FAQ rendered in JSON-LD is visible on the page, word for word.
- The fallback slug list and the seed slugs stay in sync (one constant list, the seed references the same six).
- `noindex` is the default; indexing requires the explicit `INDEX_SITE=true`.
- Demo honesty holds on every new page: fictional company framing, sample review tags, placeholder license, "serving" language on area pages, never "office in".

**Security model**:

| Actor | May do |
|---|---|
| anon | read active `service_areas` rows (existing RLS), read published `reviews` (existing RLS), read `site_settings` (existing RLS, unused this phase), submit leads through the existing action |
| admin | nothing new; no admin surfaces added |
| service role | not used by any new code path |

No new tables, no new policies, no new secrets, no service role usage. The migration changes columns only; the pgTAP suite should be re-run unchanged and advisors re-checked after the push.

**Configuration required**:
- `INDEX_SITE` (optional, default off): set to `"true"` to allow indexing (robots allows, root metadata becomes index). Documented in `.env.example`. Existing `SITE_URL` is reused for canonical and OG absolute URLs.

**Critical test scenarios** (each maps to an acceptance criteria in ## Requirements):
- Happy path: open `/service-areas`, click Plano, see Plano specific neighborhoods, issues, price range and FAQs that match the seed, verifies **AC-2**, **AC-3**
- Happy path: open `/membership`, click the club link, land on `/book` with Seasonal Club preselected, submit, lead appears in admin as membership enquiry, verifies **AC-4**, **AC-5**
- Happy path: view source of an area page, find HVACBusiness, BreadcrumbList and FAQPage JSON-LD, every FAQ question matches the visible page text, verifies **AC-8**
- Happy path: fetch `/sitemap.xml` in the production build, confirm every URL in AC-9 is listed, verifies **AC-9**
- Failure case: unknown slug `/service-areas/nowhere` returns 404, verifies **AC-3**
- Failure case: area fetch helper forced to fail returns the six slug constants and pages still build, verifies **AC-3**, **AC-9**
- Failure case: `/reviews` with zero published rows shows the empty state instead of an error, verifies **AC-4**
- Config: `INDEX_SITE` unset → robots disallows and meta stays noindex; `INDEX_SITE=true` → both flip, verifies **AC-9**
- Gate: lint, typecheck, test, build pass; Playwright smoke green; Lighthouse home still 90+; Rich Results Test clean on home and one area page, verifies **AC-12**

## Build plan

1. [x] Spec committed (this file), satisfies nothing on its own
2. [x] Read Next 16 bundled docs (metadata, sitemap, robots, static rendering) then write the migration (`npx supabase migration new phase5_area_content`): six not null columns on `service_areas`, update `supabase/seed.sql` with unique content for all six cities, keep the six slug constants in one shared module that the seed comment references; report human push commands, regenerate types, run advisors and pgTAP, satisfies **AC-1**
3. [x] Area read helpers in `lib/lead/` or `lib/content/`: `getActiveAreas()` (with `use cache`, fallback to six slug constants on error), `getAreaBySlug()` (row fetch, Zod validation of `faqs`), satisfies **AC-3** prerequisite
4. [x] `/service-areas` index page and `/service-areas/[slug]` page from the Plano.png frame plus Phase 1 tokens, thin state for missing rows, 404 for unknown slugs, unique metadata per area, satisfies **AC-2**, **AC-3**
5. [x] Typed content modules: `lib/content/trust.ts` (about, guarantee, financing, membership copy), `lib/content/legal.ts` (privacy, terms, consent), `lib/content/articles.ts` (three seasonal articles), satisfies **AC-4**, **AC-6**, **AC-7** copy half
6. [x] Trust pages `/about`, `/guarantee`, `/reviews`, `/financing`, `/membership`; `/reviews` reads the reviews table with SAMPLE tags and empty state; membership links to `/book?kind=membership_enquiry`, satisfies **AC-4**, **AC-5**
7. [x] Legal pages `/privacy`, `/terms`, `/consent`, satisfies **AC-6**
8. [x] `/tips` index and `/tips/[slug]` from the articles module with `generateStaticParams`, satisfies **AC-7**
9. [x] JSON-LD components (HVACBusiness, BreadcrumbList, FAQPage) sourced from `site.ts` plus page data, unit test that FAQPage text matches rendered FAQs and that the payload parses, satisfies **AC-8**
10. [x] Shared public metadata helper (canonical from `SITE_URL`, OG tags pointing at the static image), create the OG PNG, satisfies **AC-10**, **AC-9** canonical half
11. [x] `sitemap.ts` and `robots.ts` with the `INDEX_SITE` flag, update `.env.example`, satisfies **AC-9**
12. [x] Navigation wiring: header, footer, home city cards, satisfies **AC-11**
13. [x] Playwright `@ci` smoke suite for the new routes; a small regression test for the `?kind=` parsing; gate lint, typecheck, test, build; confirm Lighthouse home is still 90+; human runs Rich Results Test and confirms the sitemap is complete; tick ACs and report, satisfies **AC-12**

## Consequences

**Positive**:
- The demo finally matches the plan's page table: a visitor can find local pages, trust pages, legal pages and seasonal content, and the owner can show a prospect a site that looks like a real contractor's.
- Structured data, sitemap and robots are in place, so the Phase 6 deploy does not have to invent SEO plumbing under time pressure.
- The `INDEX_SITE` flag turns the demo honesty stance from a hard coded value into an explicit, documented switch.
- One migration, no new tables, no new RLS policies, no new write paths: the security review surface is tiny.

**Negative / tradeoffs**:
- The build now depends on Supabase for area slugs (with a fallback list that must be kept in sync with the seed; a seventh city added only in the database will not appear in `generateStaticParams` until the fallback list or the build env is updated).
- The six new columns are not editable in the admin, so a content change needs a seed or SQL update; recorded as a follow up but it is a real gap for a client handover.
- Legal pages are sample text written by the build, not counsel reviewed; they carry a visible disclaimer, which is honest but not a substitute for a real client's legal review.
- One OG image means every shared link shows the same card; fine for a demo, thin for a real brand.
- Phase 5 is a wide phase (migration, ten new routes, SEO plumbing). If it stalls, the natural cut line is after step 8: area pages and articles ship, SEO plumbing follows.

**Neutral**:
- `createPublicClient` reads stay cookie free and static safe, matching the existing `ensureStatic = "navigation"` posture.
- The six slug constants become the single source shared by seed comments, fallback generation, and `areaServed` in JSON-LD.
- No new dependencies are added.

## Follow-up

- [ ] Admin editor for `service_areas` content columns (the deferred Option C), once a real client needs to edit local copy without SQL.
- [ ] Bind JSON-LD phone and hours to the `site_settings` row (read with `use cache`) when the admin settings page becomes the live source of truth for a client deployment.
- [ ] Per page generated OG images if a client deployment wants unique social cards.
- [ ] Google Business Profile setup and name/address/phone consistency across directories (plan portfolio item, belongs with the Phase 6 case study).
- [ ] Keep the six slug fallback list and `seed.sql` in sync; consider a unit test that asserts the constant list matches the seed slugs.
- [ ] `supabase` skill conventions are still not in root `AGENTS.md` (carried from Phase 2); they apply to every database task and belong at root level.
- [ ] Phase 3 spec status line still reads "In Progress" though the phase is closed; `/sync` should reconcile it.
- [ ] When a real client flips `INDEX_SITE=true`, re-run the Rich Results Test and the full Lighthouse gate on the deployed URL, not just locally.

## References

**Project sources**:
- `AGENTS.md`: server components by default, design tokens only, demo honesty rules (footer disclaimer, placeholder license, sample review tags, `noindex`), Figma call budget and the docs/design cache rule, "serving" not "office in"
- `docs/PLAN.md`: phase 5 scope row, local SEO section (area page requirements, structured data types, metadata patterns, speed targets, three articles), trust and compliance table, demo honesty paragraph, page table for trust and legal pages
- `docs/specs/phase-2.md`: `service_areas` schema and the anon read policy this migration extends
- `docs/specs/phase-3.md`: booking form, `?kind=` support, lead action as the only public write path
- `docs/specs/phase-4.md`: admin inbox filters that already handle the membership enquiry kind
- `docs/design/Area/Plano.png`: area page frame used as the layout source for this phase
- `lib/content/site.ts`, `lib/lead/areas.ts`, `lib/supabase/server.ts`: existing constants, cached read pattern, and cookie free client factory this phase reuses

**Practices & standards**:
- Local SEO landing page pattern: unique page per served suburb with genuinely local content, never templated duplication
- `HVACBusiness`, `BreadcrumbList` and `FAQPage` schema.org types, with FAQ markup mirroring visible content as Google's structured data rules require
- Demo data honesty: placeholder license numbers, labeled sample reviews, and explicit fictional company framing
- Static first public reads under Next.js App Router with build time fallbacks for database dependencies
