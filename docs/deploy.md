# Deploy runbook: Apex Climate Solutions

Staging first, then production. Every command is copy runnable from the repo root. Human executes Supabase pushes, project creation and Vercel deploys.

## 1. Environment variable manifest

Copy `.env.example` and fill values per environment. Never commit real values.

| Variable | Browser safe? | Staging | Production | Notes |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (`NEXT_PUBLIC_`) | Staging project URL | Production project URL | Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes (`NEXT_PUBLIC_`) | Staging publishable key | Production publishable key | Modern publishable key (`sb_publishable_…`) preferred |
| `RESEND_API_KEY` | No (server only) | Staging Resend key (or same key, different domain) | Production Resend key | Never prefix with `NEXT_PUBLIC_` |
| `RESEND_FROM` | No | e.g. `Apex Climate Solutions <bookings@yourdomain.com>` | Same pattern on the verified domain | Must match a verified Resend domain |
| `LEAD_NOTIFY_EMAIL` | No | Owner inbox for staging tests | Owner inbox | One address |
| `SITE_URL` | No | Preview URL, e.g. `https://apex-git-branch.vercel.app` | Canonical production URL | Used in email admin links |
| `INDEX_SITE` | No | **Leave unset** | **Leave unset** | Demo ships `noindex` until deliberately flipped |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Optional | Optional | Without secret, verification is skipped |
| `TURNSTILE_SECRET_KEY` | No | Optional | Optional | Pair with the site key |

Service role key: never in Vercel client env, never in the repo. Only needed on a trusted machine for `scripts/create-admin.mjs` and rare SQL helpers.

## 2. Create and link the staging Supabase project

Human, once:

```bash
# Create a second project in the same Supabase org (dashboard or CLI).
# Name suggestion: apex-staging
# Region: same as production (e.g. us-east-1 or us-west-1)

# Point the CLI at the new staging project, then push schema and seed.
npx supabase link --project-ref <STAGING_PROJECT_REF>

npx supabase db push --linked --dry-run
npx supabase db push --linked

npx supabase db query --linked --file supabase/seed.sql

# Advisors (security + performance) must report clean.
npx supabase --help  # confirm CLI available; then run advisors from the dashboard
# Supabase Studio → Database → Advisors → Security and Performance: zero findings
```

Optional pgTAP on staging (same workaround as local, no Docker):

```bash
npx supabase db query --linked "create extension if not exists pgtap"
```

Production keeps the **current linked project** (already migrated, seeded, advisors clean).

## 3. Vercel project setup

1. Import the Git repo in Vercel (framework: Next.js, no custom build command).
2. **Preview** environment → staging Supabase URL + publishable key, staging `SITE_URL`, staging Resend / notify values. `INDEX_SITE` unset.
3. **Production** environment → current production Supabase URL + publishable key, production `SITE_URL`, production Resend / notify. `INDEX_SITE` unset.
4. Do not add `SUPABASE_SERVICE_ROLE_KEY` to Vercel.

## 4. Resend sending domain (before first real email test)

In Resend → Domains → add the sending domain used in `RESEND_FROM`.

1. Add the DNS records Resend shows (SPF and DKIM at minimum; DMARC optional but recommended).
2. Wait until the domain shows **Verified**.
3. Send a test booking only after verification so SPF/DKIM pass on the owner alert.

Supabase Auth OTP email (admin sign in) should use the same verified domain when custom SMTP is configured for the project.

## 5. Staged order of operations

1. Staging Supabase ready (section 2).
2. Vercel Preview deploy with staging env; open the Preview URL.
3. Staging smoke: home, `/book`, one service, one area, `/reviews`.
4. Submit a booking on staging; confirm it appears in staging `/admin/inbox` and the owner email arrives within seconds.
5. Only then promote: Production env filled, production deploy.
6. Production smoke (section 6).

## 6. Post deploy verification

Run on the live URL after each environment:

```bash
# From a production build locally, or inspect the deployed bundle:
# search build output for the service role key — must find nothing
rg -i "service_role|service-role" .next || echo "clean"
```

- [ ] `npm run build` succeeds in CI for the deploy commit
- [ ] Supabase advisors clean on **both** projects
- [ ] pgTAP route still passes if used in CI/local (`npx supabase db query …`)
- [ ] `npx playwright test --grep "@ci"` green against the deployed Preview (or local start)
- [ ] Smoke URLs: `/`, `/book`, `/services`, `/service-areas`, `/reviews`, a fake path for styled 404
- [ ] Demo honesty: footer fictional notice, license `TACLB000000C`, SAMPLE tags, area pages say serving
- [ ] `INDEX_SITE` unset → robots disallows all; root metadata `noindex`

## 7. Bootstrap the first admin (once per environment)

On a trusted machine with `.env.local` holding `SUPABASE_SERVICE_ROLE_KEY` for that project:

```bash
node --env-file=.env.local scripts/create-admin.mjs owner@apex.example
```

Idempotent. Prints the admin email. Then sign in at `/admin/sign-in` with that email and the emailed code.
