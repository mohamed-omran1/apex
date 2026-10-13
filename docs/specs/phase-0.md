# Phase 0 — Foundation and agent setup

**Goal:** the repo is ready so any agent can build safely and verify its own work.
**Out of scope:** UI, database schema, Supabase client code, forms.

## Tasks

1. **Scaffold (skip if already done).** `create-next-app` latest: TypeScript, Tailwind, App
   Router, ESLint, npm, no `src/` folder, alias `@/*`. Confirm Next.js is 16.x and TypeScript
   is `strict`. Commit.
2. **Scripts.** Add `typecheck` (`tsc --noEmit`), `test` (Vitest) and `test:e2e` (Playwright).
   Install Vitest and Playwright with one smoke test each (home page renders).
3. **Project docs.** Place `AGENTS.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/specs/` and
   `docs/design/` in the repo. If Next.js added a managed block to `AGENTS.md`, keep it.
4. **Skills.** Run `npx skills add supabase/agent-skills` and
   `npx skills add vercel/next.js --skill next-dev-loop`. Check where they install and that
   OpenCode actually loads them (ask it to list its available skills).
5. **Environment.** Create `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and the public
   (anon or publishable) key variable, plus `RESEND_API_KEY` as a server-only placeholder.
   Real values go in `.env.local`, which stays out of git. Do not add the service-role key.
6. **Supabase CLI, no Docker.** `npx supabase login`, `npx supabase init`,
   `npx supabase link --project-ref <ref>`. Confirm `supabase/migrations/` exists.
   Do not run `db pull` or `db reset`.
7. **CI.** A GitHub Actions workflow on pull requests: install, lint, typecheck, test, build.
   Playwright joins CI in Phase 3.
8. **Optional but useful:** connect the repo to Vercel for preview deploys so every phase can be
   checked on a real phone. Add the public env vars there.

## Acceptance gate (the agent reports each line)

- [ ] `npm run dev` starts and the home page loads
- [ ] The agent ran lint, typecheck and test on its own and they pass
- [ ] The Next.js MCP responds: the agent can read routes and errors from the running dev server
- [ ] `opencode mcp list` shows every configured MCP as connected
- [ ] Supabase MCP read works (list tables, run advisors) and a test write is refused
- [ ] Figma MCP was **not** called during this phase
- [ ] CI is green on the first pull request
- [ ] `AGENTS.md` and `docs/` are committed; no secrets in the repo (`git grep -i service_role` is empty)

Stop here and report. Do not start Phase 1.
