# Daybook

[![CI](https://github.com/khalilurrrahmanridoykhan/daybook/actions/workflows/ci.yml/badge.svg)](https://github.com/khalilurrrahmanridoykhan/daybook/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

One private workspace for your **tasks**, **notes**, **Google Calendar alerts**, and
**monthly envelope budgeting**. Built as a multi-user SaaS.

Set up a month's income, split it into envelopes (savings, transport, family food, …),
log what you spend against each envelope, and watch the balance fall — with unspent
money rolling into next month.

## Stack

| Layer     | Choice                                                           |
| --------- | ---------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, RSC, Server Actions), TypeScript strict  |
| UI        | Tailwind CSS v4, shadcn/ui, next-themes                          |
| Auth      | Auth.js v5 — credentials + optional Google, JWT sessions         |
| Database  | PostgreSQL (Neon in prod), Prisma 7 with the `pg` driver adapter |
| Money     | BigInt minor units — never floats                                |
| Tests     | Vitest (pure service-layer logic)                                |
| Hosting   | Vercel + Vercel Cron                                             |

## Prerequisites

- **Node 22 LTS** — the repo pins it via `.nvmrc`. With `fnm`/`nvm`, `cd` into the
  project and run `fnm use` (or `nvm use`).
- **pnpm** — `npm i -g pnpm`
- **PostgreSQL** — local (`brew services start postgresql@14`) or a Neon URL.

## Setup

```bash
pnpm install
cp .env.example .env          # then fill in the values (see comments in the file)

# local Postgres: create the databases referenced by .env
createdb daybook_dev
createdb daybook_shadow

pnpm db:migrate               # apply migrations
pnpm db:seed                  # optional: demo user  →  demo@daybook.local / demo12345
pnpm dev
```

App: <http://localhost:3000> · sign-in: `/login` · workspace: `/app`

## Scripts

| Script                          | Does                                  |
| ------------------------------- | ------------------------------------- |
| `pnpm dev`                      | Next dev server (Turbopack)           |
| `pnpm build`                    | `prisma generate` + `next build`      |
| `pnpm check`                    | lint + typecheck + test (the CI gate) |
| `pnpm test` / `pnpm test:watch` | Vitest                                |
| `pnpm db:migrate`               | `prisma migrate dev`                  |
| `pnpm db:deploy`                | `prisma migrate deploy` (prod / CI)   |
| `pnpm db:seed`                  | reseed the demo user                  |
| `pnpm db:studio`                | Prisma Studio                         |
| `pnpm db:reset`                 | drop + re-migrate + reseed            |
| `pnpm format`                   | Prettier write                        |

## Environment variables

See `.env.example` — every variable is documented inline. Phase-1 essentials
(`DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET`) are required; the
rest are optional until the phase that uses them. `src/lib/env.ts` validates them
at boot and exposes `featureFlags` for the optional integrations.

## Project layout

```
src/
  app/
    (marketing)/        public landing
    (auth)/             login · register
    app/                the workspace (protected)  →  Today · Tasks · Notes · Budget · Settings
    api/
      auth/[...nextauth] Auth.js handler
      cron/[job]         Vercel Cron entrypoint
      health             DB health probe
  components/
    ui/                 shadcn primitives
    app/ · auth/        feature components
  lib/
    auth.ts · auth-edge.ts · auth.config.ts   Auth.js wiring
    db.ts               Prisma singleton (pg adapter)
    env.ts              validated env + feature flags
    crypto.ts           AES-256-GCM token vault
    money.ts            BigInt minor-unit helpers
    currency.ts         per-user currency formatting
    session.ts          requireUser / requireUserId
    services/           pure, framework-agnostic logic (unit-tested)
      budget.ts · rollover.ts · wallets.ts · recurring.ts · calendar-sync.ts
    actions/            "use server" mutations
  proxy.ts              Next 16 middleware (optimistic route guard)
prisma/
  schema.prisma · migrations/ · seed.ts
```

## Deploying to Vercel

1. Import the repo. Framework preset: **Next.js**. Node version: **22.x**.
2. Set env vars from `.env.example` (use a Neon `DATABASE_URL`; set
   `SHADOW_DATABASE_URL` to a second Neon database for migrations).
3. Build command stays `pnpm build`; add `pnpm db:deploy` as a
   pre-build/"Deploy" step or run migrations from CI.
4. `vercel.json` registers four cron jobs. The `*/15` reminder sweep needs a
   **Pro** plan; on Hobby, change it to a daily schedule.

## Roadmap

| Phase | Deliverable                                                                                                       | Status  |
| ----- | ----------------------------------------------------------------------------------------------------------------- | ------- |
| 0     | Foundations — auth, app shell, full DB schema, pure budget/rollover/wallet logic + tests, CI, deploy config       | ✅ done |
| 1     | Accounts & Tasks — verification email, password reset, task CRUD, Today / Upcoming / All / board, tags, recurring | next    |
| 2     | Notes — capture, markdown editor, pin / colour / archive, full-text search, task links                            |         |
| 3a    | Budget core — wallets & transfers, months, income, categories, allocations, transactions, dashboard               |         |
| 3b    | Budget automation — close-month + auto rollover, recurring engine, trend charts, savings goals                    |         |
| 4     | Google Calendar — OAuth, encrypted token vault, one-way task→event sync, reminder offsets, cron fallback          |         |
| 5     | Hardening & launch — tenant-isolation audit, rate limiting, data export/delete, PWA polish, Sentry, landing page  |         |

## Status

**Phase 0 — Foundations: complete.** Register / login / logout work end to end, the
app shell and the database schema for every phase are in place, and the envelope
budgeting / rollover / wallet math is implemented and unit-tested. Tasks, Notes, the
budgeting UI and Google Calendar sync follow in the phases above.

## License

MIT — see [LICENSE](./LICENSE).
