# Starter Kit — Implementation Plan

## Current State

| Area | Tech |
|------|------|
| **Monorepo** | Turborepo + Bun workspaces (bun@1.3.5) |
| **Client** | `apps/web` — Vite + React 19 + shadcn/ui (base-ui, mira style) |
| **UI Kit** | `packages/ui` — shadcn component library, Tailwind v4, Geist font, lucide icons |
| **Tooling** | Biome (replacing ESLint + Prettier), TypeScript |
| **Missing** | Server, shared types, DB layer, DX tooling, AI context |

---

## What We're Building

A living starter kit for vibe-coded projects with Bun server and React client, organized as a monorepo.

### Architecture Decisions

| Decision | Choice |
|----------|--------|
| **Database** | SQLite via Drizzle ORM (Bun's built-in `bun:sqlite`) |
| **API Pattern** | Traditional REST (JSON, no Hono RPC) |
| **Example Feature** | Todos CRUD |
| **API Client** | Lives in `apps/web` directly (not a shared package) |
| **Dev Mode** | `turbo dev` runs both Vite + Hono concurrently |
| **Linter/Formatter** | Biome — 2-space indent, semicolons as needed, always trailing comma, standard strictness |
| **UI Components** | Keep minimal — only Button pre-installed, add others per project |

---

## Package Versions (latest as of check)

These are the versions to install across the monorepo.

### Root
| Package | Version |
|---------|---------|
| `turbo` | `^2.9.6` |
| `typescript` | `^5.9.3` |
| `@biomejs/biome` | `^2.4.13` |

### `packages/ui`
| Package | Version |
|---------|---------|
| `@base-ui/react` | `^1.4.1` |
| `@fontsource-variable/geist` | `^5.2.8` |
| `class-variance-authority` | `^0.7.1` |
| `clsx` | `^2.1.1` |
| `lucide-react` | `^1.11.0` |
| `react` | `^19.2.5` |
| `react-dom` | `^19.2.5` |
| `shadcn` | `^4.5.0` |
| `tailwind-merge` | `^3.5.0` |
| `tw-animate-css` | `^1.4.0` |
| `zod` | `^3.25.76` |
| `tailwindcss` | `^4.2.4` |
| `@tailwindcss/vite` | `^4.2.4` |

### `packages/shared`
| Package | Version |
|---------|---------|
| `zod` | `^3.25.76` |

### `apps/server`
| Package | Version |
|---------|---------|
| `hono` | `^4.12.15` |
| `@hono/zod-validator` | `^0.7.6` |
| `drizzle-orm` | `^0.45.2` |
| `drizzle-kit` | `^0.31.10` |
| `@types/bun` | `^1.2.13` |

### `apps/web`
| Package | Version |
|---------|---------|
| `vite` | `^8.0.10` |
| `@vitejs/plugin-react` | `^6.0.1` |
| `react` | `^19.2.5` |
| `react-dom` | `^19.2.5` |
| `lucide-react` | `^1.11.0` |
| `@tailwindcss/vite` | `^4.2.4` |

### Version Notes
- **TypeScript `^5.9.3`** — Kept at 5.9.x rather than jumping to 6.0.3 (very new; safer for ecosystem stability in a starter kit). Revisit in a few weeks.
- **React 19** — Has built-in TypeScript types. `@types/react` and `@types/react-dom` are technically redundant but kept for tooling compatibility.
- **`@types/bun`** — Needed in `apps/server` for Bun-native APIs (`Bun.serve`, `bun:sqlite`). Replaces `bun-types`.
- **`@types/node`** — `^25.6.0` is the latest on npm. Used in Vite and UI packages for Node.js API typings.

---

## Bun Workspace Catalog

Use Bun's `[install.catalog]` feature in the root `package.json` to pin shared dependency versions across all workspaces. Workspaces reference catalog entries with `"catalog:"` as the version.

### Catalog entries to define in root `package.json`

```json
{
  "name": "lets-start",
  "workspaces": ["apps/*", "packages/*"],
  "dependencies": {
    "zod": "^3.25.76",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  },
  "devDependencies": {
    "turbo": "^2.9.6",
    "typescript": "^5.9.3",
    "@biomejs/biome": "^2.4.13",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@types/node": "^25.6.0"
  }
}
```

### How it works in workspace `package.json`

```json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

### Packages to catalog
| Package | Used in |
|---------|---------|
| `react` | `packages/ui`, `apps/web` |
| `react-dom` | `packages/ui`, `apps/web` |
| `zod` | `packages/shared`, `apps/server` |
| `typescript` | All packages |
| `@types/react` | `packages/ui`, `apps/web` |
| `@types/react-dom` | `packages/ui`, `apps/web` |
| `@types/node` | `packages/ui`, `apps/web`, `apps/server` |

---

## Implementation Steps

### Step 1: `packages/shared` — Shared schemas and types

Single source of truth for data contracts consumed by both server and client. Types are co-located with their Zod schemas.

- `src/schemas/todo.ts` — Zod schema for Todo entity + inferred TypeScript types (`Todo`, `CreateTodoInput`, `UpdateTodoInput`)
- `src/schemas/api.ts` — Zod schemas for API request/response shapes + inferred types
- `src/constants.ts` — Shared constants (status codes, defaults)
- `src/index.ts` — Barrel exports
- `package.json` — `"name": "@workspace/shared"` with deps: `zod`, exports map pointing to `src/schemas/*.ts` and `src/constants.ts`
- `tsconfig.json` — ES2022, ESNext modules, no DOM lib

---

### Step 2: `apps/server` — Hono REST API + DB layer

Bun + Hono HTTP server with Drizzle ORM + SQLite built in.

#### DB layer (colocated in the server app)
- `src/db/schema.ts` — Drizzle schema (todos table definition)
- `src/db/client.ts` — Bun SQLite connection singleton + Drizzle client instance
- `src/db/migrate.ts` — Script to run migrations programmatically
- `src/db/seed.ts` — Seed script with sample todos
- `drizzle.config.ts` — Drizzle Kit configuration using `bun-sqlite` driver

#### API layer
- `src/index.ts` — App entry point: Hono init, middleware registration, route mounting, `Bun.serve({ fetch: app.fetch, port: env.PORT })`. Bun loads `.env` automatically — no `dotenv` package needed.
- `src/middleware/error.ts` — Global error handler
- `src/middleware/cors.ts` — CORS configuration (allow `http://localhost:5173` for Vite dev server)
- `src/routes/todos.ts` — CRUD endpoints:
  - `GET /api/todos` — List all
  - `POST /api/todos` — Create
  - `PATCH /api/todos/:id` — Toggle completed / update
  - `DELETE /api/todos/:id` — Delete
- `src/routes/health.ts` — Health check endpoint (`GET /api/health`)

#### Config
- `package.json` — `"name": "server"` with deps: `hono`, `@hono/zod-validator`, `drizzle-orm`, `drizzle-kit`, `@types/bun`, `@workspace/shared`
- `package.json` scripts: `db:generate`, `db:migrate`, `db:seed`
- `tsconfig.json` — ES2022, ESNext modules, no DOM lib

---

### Step 3: `apps/web` updates — API client and Todos UI

Connect the React client to the API with a simple fetch wrapper and shadcn-styled components.

- `src/api/client.ts` — Fetch wrapper with typed methods for Todo CRUD
- `src/api/types.ts` — API response/request types (re-exported or derived from `@workspace/shared`)
- Add `@workspace/shared` as a dependency in `package.json`
- `src/components/todos.tsx` — Todo list UI:
  - List all todos with status
  - Toggle complete via checkbox
  - Create new todo via input form
  - Delete todo via button
- `src/App.tsx` — Updated to render Todos component (replace placeholder)
- `vite.config.ts` — Add proxy rule so `/api/*` forwards to `http://localhost:3001` during dev

---

### Step 4: Configuration and tooling updates

- **Switch to Biome** — Replace ESLint and Prettier across the entire monorepo:
  - Root `biome.json` with: 2-space indent, `semicolons: "asNeeded"`, `trailingCommas: "all"`, standard strictness
  - Remove `eslint`, `prettier`, `prettier-plugin-tailwindcss` deps from all `package.json` files
  - Remove `.prettierrc`, `.prettierignore`, and all `eslint.config.js` files
  - Add `@biomejs/biome` as a root devDependency
  - Update all `package.json` scripts: `lint` → `biome check`, `format` → `biome format --write`
  - Note: Biome does not have a Tailwind class-sorting plugin. We lose `prettier-plugin-tailwindcss` class ordering; classes still work, just unsorted.
  - Update `turbo.json` tasks accordingly
- `.env.example` — Template with env vars (`PORT`, `DATABASE_URL`)
- `.gitignore` — Ensure SQLite DB files (\*.db, \*.sqlite) are excluded
- Root `tsconfig.json` — Update references if needed

---

### Step 5: Docs and AI context

- `AGENTS.md` — Architecture overview, key files and their purposes, conventions for adding routes/components, tips for future AI coding sessions
- `README.md` — Update to reflect full stack, add getting-started instructions

---

## File Map (after all steps)

```
lets-start/
├── apps/
│   ├── server/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   ├── todos.ts
│   │   │   │   └── health.ts
│   │   │   ├── middleware/
│   │   │   │   ├── error.ts
│   │   │   │   └── cors.ts
│   │   │   └── db/
│   │   │       ├── schema.ts
│   │   │       ├── client.ts
│   │   │       ├── migrate.ts
│   │   │       └── seed.ts
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── src/
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   └── types.ts
│       │   ├── components/
│       │   │   ├── theme-provider.tsx
│       │   │   └── todos.tsx
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── todo.ts
│   │   │   │   └── api.ts
│   │   │   ├── constants.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ui/  (will be updated during Biome migration)
├── AGENTS.md
├── PLAN.md
├── biome.json
├── turbo.json
├── .env.example
└── README.md
```
