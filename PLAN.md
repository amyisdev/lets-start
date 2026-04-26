# Server Garden Cleaning Plan

Issues found during code review of `apps/server/`, organized by category. Each item includes a recommendation and (where provided) the user's decision.

**Status: ✅ All items implemented.**

---

## 1. Code Duplication

### 1.1 `routes/todos.ts` — "find or 404" repeated in PATCH and DELETE

Both handlers do the same select-then-check pattern.

**Recommendation:** Extract into a shared helper `getTodoOrThrow(id)`.

**Decision:** ✅ Implemented in `routes/todos.ts`.

---

## 2. Missing Infrastructure

### 2.1 `src/index.ts` — No graceful shutdown

`SIGTERM`/`SIGINT` handlers should close the server and DB gracefully.

**Decision:** ✅ Refactored `src/index.ts` to only `export app`. `Bun.serve()` moved to `scripts/serve.ts` with signal handlers.

### 2.2 `src/index.ts` — No startup validation

`BETTER_AUTH_SECRET` is required by better-auth but never checked at startup.

**Decision:** ✅ Added `@t3-oss/env-core` with Zod schemas in `src/lib/config.ts`. Fails fast with clear error if missing.

### 2.3 `src/db/client.ts` — No error handling on DB open

**Decision:** Skipped.

### 2.4 No tests

**Decision:** Skipped.

---

## 3. Inconsistencies

### 3.1 `schema.ts` barrel re-export of `auth-schema.ts`

`schema.ts` uses `export * from "./auth-schema"`, mixing app tables with auth tables in one import.

**Decision:** ✅ Moved schemas into `db/schemas/` directory:
- `db/schemas/todos.ts` — todos table definition
- `db/schemas/auth.ts` — auth tables + relations
- `db/schemas/index.ts` — barrel re-export

Runnable scripts (`migrate.ts`, `seed.ts`, `serve.ts`) moved to `scripts/`.

### 3.2 Timestamp strategy mismatch

`todos.updatedAt` uses `$defaultFn` (INSERT only) while auth tables use `$onUpdate` (auto on UPDATE). PATCH handler manually sets `updatedAt`.

**Decision:** ✅ Switched to `$onUpdate(() => new Date())` and removed manual `updatedAt` from PATCH handler.

### 3.3 `clientOrigin` env var read in two places

`process.env.CLIENT_ORIGIN` defaulted in both `index.ts` and `auth.ts`.

**Decision:** ✅ Handled by the `@t3-oss/env-core` setup in 2.2.

---

## 4. Best Practices / Quality

### 4.1 `middleware/error.ts` — Raw error object logged

`console.error(err)` logs full error including stack.

**Decision:** ✅ Adopted `pino` as the structured logger. `src/lib/logger.ts` exports a shared logger instance.

### 4.2 `routes/todos.ts` — No pagination on GET /

**Decision:** Skipped.

### 4.3 `src/lib/` — Empty directory

**Recommendation:** ✅ Populated with `config.ts` and `logger.ts`.

---

## Final File Structure

```
apps/server/
├── scripts/
│   ├── serve.ts        ← Bun.serve() + graceful shutdown
│   ├── migrate.ts      ← drizzle migration runner
│   └── seed.ts         ← database seeder
├── src/
│   ├── index.ts        ← Hono app setup & exports (no Bun.serve)
│   ├── auth.ts         ← better-auth config
│   ├── db/
│   │   ├── client.ts   ← drizzle + SQLite connection
│   │   └── schemas/
│   │       ├── index.ts  ← barrel export
│   │       ├── todos.ts  ← todos table
│   │       └── auth.ts   ← auth tables + relations
│   ├── lib/
│   │   ├── config.ts   ← @t3-oss/env-core validation
│   │   └── logger.ts   ← pino logger
│   ├── middleware/
│   │   ├── auth.ts     ← needAuth middleware
│   │   └── error.ts    ← error handler (uses pino)
│   └── routes/
│       ├── health.ts
│       └── todos.ts    ← uses needAuth + getTodoOrThrow
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```
