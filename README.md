# Apex Climate Solutions

Demo site for a fictional Dallas HVAC company: a fast, credible marketing site where every
service request lands in one place with a status and the owner is emailed instantly.

- Plan: `docs/PLAN.md` · Phase specs: `docs/specs/` · Design handoff: `docs/design/`
- Rules for every AI agent: `AGENTS.md` (Claude Code reads it through `CLAUDE.md`)

## Stack

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, Supabase, Resend, Vitest,
Playwright. Package manager: npm.

## Commands

```bash
npm run dev        # dev server on http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # next typegen + tsc --noEmit
npm run test       # Vitest
npm run test:e2e   # Playwright
npm run build      # production build
```

## Environment

Copy `.env.example` to `.env.local` and fill in real values. `.env.local` is never committed.
The Supabase service-role key never appears in this repo.

## Demo honesty

Apex is fictional. The production demo ships `noindex`, the TDLR license number is the
placeholder `TACLB000000C`, and sample reviews are labeled as demo content.
