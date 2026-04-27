# Feature Development Guidelines

This document captures the patterns discovered while implementing the **User Profiles & User-Scoped Data** feature. Follow these conventions when adding any new feature to the starter kit.

---

## 1. Shared Schemas (`packages/shared`)

### One schema file per feature

Create `packages/shared/src/schemas/<feature>.ts` for every feature that needs types shared between server and client.

```ts
// packages/shared/src/schemas/profile.ts
import { z } from "zod"

// Response schema — what the API returns
export const UserProfileSchema = z.object({
  displayName: z.string().nullable(),
  bio: z.string().max(160).nullable(),
  avatarUrl: z.string().url().nullable(),
})
export type UserProfile = z.infer<typeof UserProfileSchema>

// Input schema — what the client sends (POST/PATCH body)
export const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional(),
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
```

**Rules:**
- Separate response schemas (`XSchema`) from input schemas (`CreateXSchema`, `UpdateXSchema`)
- Export both the Zod schema and the inferred TypeScript type
- **Never use `.ts` extensions in imports** in this package (no `allowImportingTsExtensions`)
- Register the export in `packages/shared/package.json`:
  ```json
  "exports": {
    "./schemas/<feature>": "./src/schemas/<feature>.ts"
  }
  ```

---

## 2. Database Schema (`apps/server/src/db/schemas`)

### One schema file per feature

Create `apps/server/src/db/schemas/<feature>.ts` for every feature that needs tables.

```ts
// apps/server/src/db/schemas/profile.ts
import { relations } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { user } from "./auth.ts"

export const userProfiles = sqliteTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  bio: text("bio", { length: 160 }),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$onUpdate(() => new Date()),
})

export const userProfileRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, { fields: [userProfiles.userId], references: [user.id] }),
}))
```

**Rules:**
- Export the table and its relations from the same file
- Use `references()` for foreign keys with `onDelete: "cascade"` for user-owned data
- Export everything from `apps/server/src/db/schemas/index.ts` (barrel file)
- Timestamp columns should use `.$defaultFn(() => new Date())` for `createdAt` and `.$onUpdate(() => new Date())` for `updatedAt`

### Adding a column to an existing table

When you need to add a column (e.g., scoping existing data to users):

```ts
// Modify the existing schema file
export const todos = sqliteTable("todos", {
  // ... existing columns
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})
```

**⚠️ Gotcha:** Adding a `NOT NULL` column to a SQLite table with existing data will fail at migration time. For a local/dev database, the pragmatic fix is to delete `data.db` and re-run `db:migrate`. In production, use a multi-step migration: add as nullable → backfill data → add `NOT NULL` constraint.

### Migration workflow

```bash
# After modifying schema files:
bun run --cwd apps/server db:generate   # Generates drizzle/000X_*.sql
# Review the generated SQL manually
bun run --cwd apps/server db:migrate    # Apply to database
```

---

## 3. Server Routes (`apps/server/src/routes`)

### One route file per feature

Create `apps/server/src/routes/<feature>.ts` and mount it in `src/index.ts`:

```ts
// apps/server/src/index.ts
import featureRoutes from "./routes/<feature>.ts"
app.route("/api/<feature>", featureRoutes)
```

### Authentication

Protected routes use `needAuth` middleware at the top of the file. **Use method chaining** on `Hono` so the middleware's `Variables` type flows to all downstream handlers:

```ts
import { needAuth } from "../middleware/auth.ts"

const featureRoutes = new Hono()
  .use("*", needAuth)
  .get("/", async (c) => {
    const user = c.get("user")  // fully typed
    // ...
  })
  .post("/", async (c) => {
    const user = c.get("user")  // fully typed here too
    // ...
  })

export default featureRoutes
```

**Critical:** Chain methods on the `Hono` instance (`new Hono().use(...).get(...).post(...)`). Separate `app.use()` / `app.get()` calls break Hono's type inference for middleware variables.

### Accessing the current user

Use `c.get("user")`. The type is inferred automatically because `needAuth` is declared with typed variables and chained before the handler:

```ts
const user = c.get("user")  // { id: string, name: string, email: string, ... }
```

### User-scoped queries

Every query on user-owned data must include a `WHERE` clause restricting to the current user:

```ts
// List — only the user's items
const items = await db
  .select()
  .from(todos)
  .where(eq(todos.userId, user.id))

// Get by ID — verify ownership
const item = await db
  .select()
  .from(todos)
  .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
  .limit(1)

// Update/Delete — scope the WHERE clause
await db
  .update(todos)
  .set(input)
  .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
```

**Pattern**: Extract a helper like `getUserItemOrThrow(id, userId)` that checks both existence AND ownership, returning 404 if either fails.

### Upsert for single-row-per-user tables

Use `onConflictDoUpdate` for tables where each user has exactly one row:

```ts
const result = await db
  .insert(userProfiles)
  .values({ userId: user.id, ...input })
  .onConflictDoUpdate({
    target: userProfiles.userId,
    set: input,
  })
  .returning()
```

### Response envelope

Every endpoint returns `{ success: true, data: ... }` or `{ success: false, error: ... }`:

```ts
return c.json({ success: true, data: result[0] })
return c.json({ success: true, data: null })     // For deletes
return c.json({ success: true, data: null })     // Profile not found (not 404)
```

---

## 4. API Client (`apps/web/src/api/client.ts`)

### Feature method groups

Mirror the server route structure with feature prefixes:

```ts
export const api = {
  profile: {
    get: (signal?: AbortSignal) =>
      fetchJson<UserProfile | null>("/profile", { signal }),
    update: (input: UpdateProfileInput, signal?: AbortSignal) =>
      fetchJson<UserProfile>("/profile", {
        method: "PATCH",
        body: JSON.stringify(input),
        signal,
      }),
  },
  todos: {
    // ... existing methods
  },
}
```

**Rules:**
- Every method accepts an optional `signal: AbortSignal` for request cancellation
- Group methods by feature (`api.profile.*`, `api.todos.*`)
- Type imports from `@workspace/shared/schemas/<feature>`

---

## 5. React Components & Data Fetching

### Query keys

Use feature-based query keys:

```ts
useQuery({ queryKey: ["profile"], ... })
useQuery({ queryKey: ["todos"], ... })
```

### Mutation patterns

```ts
const updateMutation = useMutation({
  mutationFn: (input: UpdateProfileInput) => api.profile.update(input),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] })
    toast.success("Profile updated")
  },
  onError: (err: Error) => {
    toast.error(err.message)
  },
})
```

**Rules:**
- `invalidateQueries` on success to refresh related data
- `toast.success()` for user-visible success feedback
- `toast.error()` for error feedback (never silently fail)
- Reset local form state in `onSuccess` when appropriate

### Signal passthrough

```ts
useQuery({
  queryKey: ["profile"],
  queryFn: ({ signal }) => api.profile.get(signal),
})
```

React Query automatically passes an `AbortSignal` to `queryFn`. Forward it to `fetch` via the API client for proper request cancellation.

---

## 6. Routing & Navigation

### Protected routes

Wrap every route that requires authentication in `<AuthGuard>`:

```tsx
<Route
  path="/profile"
  element={
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  }
/>
```

### Navigation between features

Use `react-router`'s `<Link>` for internal navigation. Add cross-feature links in shared header areas.

---

## 7. Type-Safe Hono Context

### Middleware declares its own Variables

The `needAuth` middleware types the variables it sets using `createMiddleware<{ Variables: ... }>()`:

```ts
// apps/server/src/middleware/auth.ts
import { createMiddleware } from "hono/factory"
import { auth } from "../auth.ts"

export const needAuth = createMiddleware<{
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})
```

**Why this pattern:** The variables are only typed where `needAuth` is actually used. Routes that don't apply `needAuth` won't see `user` or `session` on the context.

### Do NOT use global module augmentation

❌ Avoid this approach:

```ts
// DON'T DO THIS
import "hono"
declare module "hono" {
  interface ContextVariableMap {
    user: { ... }
  }
}
```

This incorrectly makes `user` available on **every** Hono context — even unprotected routes like `/api/health` where `needAuth` is never applied.

### Method chaining preserves inference

The `needAuth` middleware is typed with `Variables`. When you chain it on a `Hono` instance, all subsequent handlers in that chain know about those variables:

```ts
const featureRoutes = new Hono()
  .use("*", needAuth)      // sets Variables { user, session }
  .get("/", (c) => {       // c.get("user") is typed here
    const user = c.get("user")
    return c.json({ userId: user.id })
  })
```

If you break the chain into separate calls, TypeScript loses the connection:

```ts
// ❌ DON'T DO THIS — type inference breaks
const app = new Hono()
app.use("*", needAuth)
app.get("/", (c) => {
  const user = c.get("user")  // user is typed as unknown
})
```

---

## Quick Checklist

When adding a new feature, verify:

- [ ] Zod schemas created in `packages/shared/src/schemas/<feature>.ts`
- [ ] Export added to `packages/shared/package.json`
- [ ] DB schema created in `apps/server/src/db/schemas/<feature>.ts` (if needed)
- [ ] Barrel export added to `apps/server/src/db/schemas/index.ts`
- [ ] Migration generated and applied
- [ ] Route created in `apps/server/src/routes/<feature>.ts`
- [ ] Route mounted in `apps/server/src/index.ts`
- [ ] `app.use("*", needAuth)` if authentication required
- [ ] All DB queries scoped to `user.id`
- [ ] API client methods added to `apps/web/src/api/client.ts`
- [ ] `AbortSignal` accepted by all new API methods
- [ ] React Query hooks use feature-based `queryKey`
- [ ] Mutations invalidate queries and show toast feedback
- [ ] Route added to `apps/web/src/App.tsx` (with `<AuthGuard>` if needed)
- [ ] Navigation links added between related pages
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` passes
