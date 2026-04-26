# Agent Context

## Architecture

Turborepo monorepo with Bun workspaces.

```
apps/server    Bun + Hono REST API + Drizzle ORM + SQLite (DB colocated here)
apps/web       Vite + React 19 + Tailwind v4 + shadcn/ui + react-query + sonner
packages/shared  Zod schemas + inferred types
packages/ui      shadcn component library
```

## Commands

Run from repo root only. No per-package lint/format scripts.

| Task | Command |
|------|---------|
| Dev (both servers) | `bun run dev` |
| Lint | `bun run lint` (Biome, root only) |
| Format | `bun run format` (Biome, root only) |
| Typecheck | `bun run typecheck` (turbo, all packages) |
| Build | `bun run build` (turbo, web + server tsc) |
| DB generate | `bun run --cwd apps/server db:generate` |
| DB migrate | `bun run --cwd apps/server db:migrate` |
| DB seed | `bun run --cwd apps/server db:seed` |

## Critical Gotchas

- **`.ts` import extensions differ by package:**
  - `apps/server` and `apps/web`: `allowImportingTsExtensions: true` → CAN use `.ts` in imports
  - `packages/shared`: NO `allowImportingTsExtensions` → MUST NOT use `.ts` in imports (typecheck will fail)
- **Drizzle config must NOT include `driver: "bun-sqlite"`** — it breaks `drizzle-kit generate`. Omit the field entirely.
- **Server runs via `scripts/serve.ts`** (`Bun.serve()`). `src/index.ts` only exports the Hono app. The `build` script is only `tsc --noEmit` for type checking — no compiled output.
- **Env validation via `@t3-oss/env-core`** — `src/lib/config.ts` validates all server env vars at startup. Missing `BETTER_AUTH_SECRET` causes immediate exit.
- **Bun auto-loads `.env` from repo root** — no `dotenv` package needed. Copy `.env.example` to `.env` at root.
- **Biome CSS linting is disabled** — Tailwind v4 syntax (`@theme inline`, `@custom-variant`) isn't supported by Biome's CSS parser. Only formatting is enabled.
- **`drizzle/` directory is excluded from Biome** — generated migration files shouldn't be linted/formatted.

## Import Conventions

```ts
// UI components
import { Button } from "@workspace/ui/components/button"

// Shared schemas + types
import { TodoSchema, type Todo } from "@workspace/shared/schemas/todo"

// Web app internal
import { api } from "@/api/client"

// Server internal
import { db } from "@/db/client"
```

## Adding a Feature

1. Add Zod schemas to `packages/shared/src/schemas/<feature>.ts` (no `.ts` extensions in imports)
2. Add DB schema to `apps/server/src/db/schemas/<feature>.ts` if needed, export from `schemas/index.ts`
3. Create route at `apps/server/src/routes/<feature>.ts`, mount in `src/index.ts`
4. If the route requires authentication, use `app.use("*", needAuth)` inside the route file
5. Add API client methods to `apps/web/src/api/client.ts`
   - Methods accept an optional `signal: AbortSignal` parameter for request cancellation
6. Add React Query hooks in `apps/web/src/components/` using `useQuery` / `useMutation`
   - Errors are surfaced via `toast.error()` from `sonner` in mutation `onError` callbacks
7. Build UI in `apps/web/src/components/`

## Adding a shadcn Component

```bash
bunx shadcn@latest add <component> -c apps/web
```

Components are installed into `packages/ui/src/components/` automatically.

## Environment Variables

| Var | Default | Purpose |
|-----|---------|---------|
| `PORT` | `3001` | Hono server port |
| `DATABASE_URL` | `./data.db` | SQLite database file (relative to server cwd) |
| `BETTER_AUTH_SECRET` | (required) | Secret key for better-auth sessions |
| `BETTER_AUTH_URL` | `http://localhost:3001` | Base URL for better-auth |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

Validated at startup by `@t3-oss/env-core` in `src/lib/config.ts`. Missing `BETTER_AUTH_SECRET` causes immediate exit.

## Server Architecture

```
apps/server/
├── scripts/
│   ├── serve.ts        ← Bun.serve() + graceful shutdown
│   ├── migrate.ts      ← drizzle migration runner
│   └── seed.ts         ← database seeder
├── src/
│   ├── index.ts        ← Hono app setup (exports app only)
│   ├── auth.ts         ← better-auth config
│   ├── db/
│   │   ├── client.ts   ← drizzle + SQLite connection
│   │   └── schemas/    ← feature-specific Drizzle schemas
│   ├── lib/
│   │   ├── config.ts   ← @t3-oss/env-core validation
│   │   └── logger.ts   ← pino structured logger
│   ├── middleware/
│   │   ├── auth.ts     ← needAuth (returns 401 if unauthenticated)
│   │   └── error.ts    ← global error handler
│   └── routes/         ← Hono route handlers
```

## Web Architecture

```
apps/web/
├── src/
│   ├── api/
│   │   └── client.ts       ← typed fetch wrapper (accepts AbortSignal)
│   ├── components/         ← React components + react-query hooks
│   ├── lib/
│   │   ├── auth-client.ts  ← better-auth client instance
│   │   └── auth-provider.tsx ← auth context + useAuth hook
│   ├── App.tsx             ← root component (auth state machine)
│   └── main.tsx            ← QueryClientProvider + ThemeProvider + Toaster
├── index.html              ← HTML entry point
├── vite.config.ts          ← Vite config (proxies /api/* to server)
└── tsconfig.app.json       ← TypeScript config (allowImportingTsExtensions)
```

Data fetching uses `@tanstack/react-query`. API client methods in `client.ts` are plain async functions used as `queryFn` / `mutationFn`. React Query's `signal` is passed through to `fetch` for request cancellation. Errors are surfaced via `toast.error()` from `sonner` in mutation `onError` callbacks.

## Auth Middleware

Routes requiring authentication should use `needAuth` from `src/middleware/auth.ts`:

```ts
import { needAuth } from "../middleware/auth.ts"

app.use("*", needAuth)
```

This sets `c.set("user", ...)` and `c.set("session", ...)` and throws 401 if unauthenticated.

## Vite Dev Proxy

`apps/web/vite.config.ts` proxies `/api/*` to `http://localhost:3001` during dev.
