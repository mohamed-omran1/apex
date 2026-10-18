# Demo clip shot list (about 60 seconds)

Portfolio line from `docs/PLAN.md`: book an emergency repair on a phone, watch the owner email arrive, open the admin, move the lead to scheduled.

Record at a phone viewport (for example 390×844). Keep the demo bar and footer disclaimer in frame when you can. No voiceover required; screen text carries the story.

| # | Beat | On screen | Target time |
| --- | --- | --- | --- |
| 1 | Open home on a phone | Hero, call button, sticky book bar | 0:00–0:08 |
| 2 | Tap Book, pick Emergency | Zip skipped for emergency; short form | 0:08–0:20 |
| 3 | Fill and submit | Name, phone, zip, what is wrong; success screen with reference code | 0:20–0:35 |
| 4 | Owner email arrives | Inbox preview: URGENT subject, tap to call, admin link | 0:35–0:45 |
| 5 | Open admin, open the lead | Inbox shows the new lead pinned; detail page facts | 0:45–0:55 |
| 6 | Status → Scheduled | Confirm status pill and timeline event | 0:55–1:00 |

## Pre verify in the running app (before you record)

- [x] Mobile viewport booking: emergency form submits and returns a reference code (Pixel 7 profile against the production build, 2.5 s, reference `APX-LQ66E3`)
- [ ] Owner email path: Resend configured (or console warning path documented); email arrives when keys are set
- [ ] Admin: sign in works; a seeded lead can move `new` → `scheduled` (or the live demo lead)
- [ ] Seed looks alive: 18 sample leads across statuses (see `supabase/seed.sql`)

## After recording

Note the file name, length, and anything that surprised you under the spec's build plan step 13.

| Field | Value |
| --- | --- |
| Recorded on | |
| File | |
| Length | |
| Notes | |
