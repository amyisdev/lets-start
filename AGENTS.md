# Agent Context

## Architecture

Turborepo monorepo with Bun workspaces.

```
apps/server    Bun + Hono REST API + Drizzle ORM + SQLite (DB colocated here)
apps/web       Vite + React 19 + Tailwind v4 + shadcn/ui (base-ui, mira)
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
- **Server runs directly via Bun** (`Bun.serve()` in `src/index.ts`). The `build` script is only `tsc --noEmit` for type checking — no compiled output.
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
2. Add DB schema to `apps/server/src/db/schema.ts` if needed
3. Create route at `apps/server/src/routes/<feature>.ts`, mount in `src/index.ts`
4. Add API client methods to `apps/web/src/api/client.ts`
5. Build UI in `apps/web/src/components/`

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

## Vite Dev Proxy

`apps/web/vite.config.ts` proxies `/api/*` to `http://localhost:3001` during dev.
