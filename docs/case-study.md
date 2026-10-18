# Apex Climate Solutions: case study

Apex is a demo. The company is fictional, the license number is the placeholder
`TACLB000000C`, the reviews carry a SAMPLE tag, and the site ships `noindex`.
Everything below was measured on this build. The numbers are reproducible from
the evidence files named next to them.

## The problem

Small HVAC owner operators lose work in three places. The phone rings while
hands are dirty. Web form leads scatter across email inboxes nobody checks.
And the sites that do exist load slowly on a phone, which is where the search
happens. The brief for Apex: one place where every request lands, the owner is
told within seconds, and the page opens fast enough that nobody bounces before
the phone number is visible.

## The approach

Next.js App Router with Server Components by default. No Supabase client in the
browser: sign in and lead submission are Server Actions, and the lead action is
the only write path from the public site. Row Level Security on every table
authorizes admins from `app_metadata`, proven by a pgTAP suite rather than by
trust. One Zod schema per form, shared by the form and the action. Design
tokens only, so the palette and type cannot drift between pages.

## The booking flow

Three steps on one page: ZIP, what you need, the details. The ZIP step checks
against the six served areas and answers honestly outside them (pointing at the
phone instead of blocking). The kind picker switches the field set, so an
emergency call gets a short form and an estimate request gets address and
scheduling fields. One tap on a phone number is a `tel:` link everywhere it
appears.

**Form fields.** The standard path asks for 11 named inputs: request type, name,
phone, ZIP, email, address, preferred day, preferred window, issue, and two
consent checkboxes. The emergency short form drops to 7. Hidden UTM and
honeypot fields are not counted.

**Time to submit.** One timed run on the local production build, landing page to
reference code on screen: **1.8 seconds** (automated fill, fresh insert,
reference `APX-JWTGZ5`). A person typing on a phone will take longer; the 1.8
seconds is the page and the database, not the human.

## The admin

One inbox, a lead detail view, status changes that write an event history, and
filters that stay honest when a list is empty (a written empty state, not a
blank table). Sign in is a one time email code, so there is no password to
reset and no password to phish.

## Measurable facts

Measured on a local production build with mobile emulation, median of five runs
per page. Raw JSON lives in `docs/evidence/lighthouse/`.

| Fact | Value | Source |
|---|---|---|
| Home, mobile Lighthouse performance | **91** (runs: 88, 94, 91, 91, 91) | `home-final-1..5.json` |
| Service area page (`/service-areas/dallas`), mobile Lighthouse performance | **96** (runs: 96, 95, 96, 96, 96) | `dallas-final-1..5.json` |
| Accessibility score on both pages | 100 | same runs |
| Layout shift (CLS) on both pages | 0.000 | same runs |
| axe accessibility suite | 18 tests, 0 failures | `e2e/axe.ci.spec.ts` |
| Full Playwright `@ci` suite | 52 tests, 0 failures (mobile and desktop) | `e2e/*.spec.ts` |
| Unit tests | 44 passing | Vitest |
| Static pages in the production build | 41 | `npm run build` |
| Service role key in the browser bundle | none found | build output search |

SEO scores 69 (home) and 66 (dallas) are expected and correct: the demo ships
`noindex` until a real client flips `INDEX_SITE=true`. Largest Contentful Paint
on home runs 3.1 to 3.7 seconds under mobile throttling, above the 2.5 second
target; the performance score gate (90 or better) is met, and LCP is the next
thing to chase if this were a real launch.

## The clip

The 60 second screen recording is shot against `docs/demo-clip.md`: book an
emergency repair on a phone, watch the owner email arrive, open the admin, move
the lead to scheduled. The human records it and notes the result here:

- [ ] Clip recorded: (date, notes)

## Honest limits

Conversion claims are deliberately absent: a demo with no traffic cannot back
them. The phone number, license, reviews and service areas are placeholders.
The site exists to show the work, not to book real jobs.
