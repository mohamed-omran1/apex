<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Apex Climate Solutions

Apex is a demo site for a **fictional** Dallas HVAC company. It exists to show small
owner-operator contractors that a fast, credible site turns mobile searches into booked calls.
The phone is the product. Scope: marketing site, online booking, admin dashboard.
Out of scope: customer portal, payments, membership billing, instant-quote engine.

Plan: `docs/PLAN.md`. Current work: the phase spec in `docs/specs/` named by the human.
Design handoff: `docs/design/`. Do not invent scope that is not in those files.

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4, Supabase (cloud project),
Resend, Zod, Vitest, Playwright. Package manager: npm. No `src/` folder; import alias `@/*`.

## Read docs before writing code (in this order)

1. Next.js: read the version-matched docs in `node_modules/next/dist/docs/` before writing any
   Next.js code. Newer Next.js versions may add a managed block to this file. Keep it.
2. When the dev server is running, use the Next.js MCP (`/_next/mcp`) and the `next-dev-loop`
   skill to read routes, logs and compile errors instead of guessing.
3. Supabase: MCP `search_docs` first, then fetch the docs page as Markdown (append `.md`),
   then web search last.
4. Any other library: look for `/llms.txt` or a `.md` version of its docs before searching.
   Never rely on training memory for versions or APIs.

## Commands

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm run test` (Vitest)
· `npm run test:e2e` (Playwright)

## Folder layout

```text
app/(public)/        home, services, service-areas, book, trust pages
app/admin/           protected routes: inbox, lead detail, settings
actions/             submitLead, signIn, updateLeadStatus (Server Actions)
components/ui/       design-system primitives
lib/content/         typed content modules (Phase 1), replaced by DB reads in Phase 2
lib/supabase/        server client factory, generated types
lib/validation/      Zod schemas shared by forms and actions
lib/email/           Resend wrappers and templates
supabase/            migrations/, tests/, seed.sql
docs/                PLAN.md, specs/, design/
```

## Hard rules

- **Server Components by default.** No Supabase client in the browser bundle. Sign-in and lead
  submission are Server Actions. The lead action is the only write path from the public site.
- **Secrets.** Only `NEXT_PUBLIC_` variables may reach the browser. The service-role key never
  appears in the repo, the client, or chat. `.env.local` is never committed; `.env.example` is.
- **Validation.** One Zod schema per form in `lib/validation/`, used by the form and the action.
- **Design tokens only.** Colors, fonts, spacing and radii come from `app/globals.css`
  (`@theme`). No hard-coded hex values or font names in components.
  Fonts: Fraunces for headlines, Instrument Sans for UI, both through `next/font`.
- **Accessibility.** Labeled fields, visible focus, WCAG 2 AA contrast, large tap targets.
- **Performance.** Mobile Lighthouse 90+ on home. LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
  No chat widget, no tag manager, no remote images in the MVP.
- **Demo honesty.** Footer says this is a fictional company. License number is the placeholder
  `TACLB000000C`, never a real one. Reviews carry a visible SAMPLE tag. Suburb pages say
  "serving", never "office in". The public demo ships `noindex`.
- **No new dependencies** without telling the human why.

## Supabase rules (security checklist)

- Row Level Security on every table, **in the same migration that creates the table**.
- Authorize admins from the `admin_users` table or `app_metadata`. Never `user_metadata`.
- Every view needs `security_invoker = true`.
- An UPDATE needs a matching SELECT policy or it silently changes zero rows.
- An insert that returns data needs a SELECT policy too. The lead action generates its own
  reference code and does not call `.select()` after the insert.
- **The Supabase MCP is read-only on a cloud project.** Use it for docs, listing tables and
  advisors only. Never try to write through it. If a write is refused, stop and tell the human.
- Schema changes are SQL files in `supabase/migrations/` (timestamped). The human applies them:
  `npx supabase db push --linked --dry-run`, then `npx supabase db push --linked`.
- Never run `supabase db reset`, never run destructive SQL, never use `db pull` (needs Docker).
- Regenerate types with `npx supabase gen types typescript --linked`.

## Figma rules

The Figma plan allows about 6 MCP reads per month. **Do not call the Figma MCP** unless the
task names a specific frame and the human approves that call. Use `docs/design/` instead
(frame PNGs, and cached MCP output in `docs/design/mcp/`). After any approved
Figma call, save its output to `docs/design/mcp/<frame>.md` so it is never fetched twice.

## Definition of done

- `npm run lint`, `npm run typecheck` and `npm run test` pass.
- Verified in the running app at 390 px and at desktop width, side by side with the frame PNG.
- No console errors, no hard-coded design values, no new dependency without approval.
- Acceptance checks in the phase spec are ticked.

## Workflow

One phase per session. Read the phase spec and `docs/PLAN.md` first. Make small commits.
Stop at the phase gate and report what passed, what did not, and what the human must do next.
This file holds the shared rules for every tool. Tool-specific MCP config lives in each
tool's own file (`opencode.json` for OpenCode); do not duplicate rules there.
