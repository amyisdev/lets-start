# Feature Plan: User Profiles & User-Scoped Data

## Why

The starter kit currently has a fundamental gap: **todos are shared by all users**. Every real application needs user-scoped data, authorization that checks "does this resource belong to the current user?", and a user profile for managing personal information. This feature teaches the most important pattern missing from the starter kit while touching every layer of the stack.

---

## Feature Summary

| Tier | What | Files |
|------|------|-------|
| **DB** | Add `user_profile` table. Add `userId` FK to `todos`. Drizzle relations. Migration. | Create `schemas/profile.ts`, modify `schemas/todos.ts`, `schemas/index.ts` |
| **Shared** | Zod schemas for `UserProfile`, `UpdateProfileInput` | Create `schemas/profile.ts` |
| **Server** | `GET /api/profile`, `PATCH /api/profile`. Scope all todo queries to current user. | Create `routes/profile.ts`, modify `routes/todos.ts`, mount in `index.ts` |
| **Web** | Profile page (view/edit), nav links, API client methods | Create `pages/profile.tsx`, modify `api/client.ts`, `App.tsx`, `pages/todos.tsx` |

---

## Patterns Discovered (for future documentation)

| # | Pattern | Where |
|---|---------|-------|
| 1 | One Zod schema file per feature in `packages/shared` | `profile.ts` alongside `todo.ts` |
| 2 | Input schemas (`CreateXSchema`/`UpdateXSchema`) separate from response schemas (`XSchema`) | `UpdateProfileSchema` vs `UserProfileSchema` |
| 3 | One Drizzle schema file per feature, barrel-exported from `index.ts` | `profile.ts`, `todos.ts`, `auth.ts` |
| 4 | Foreign keys via `references()` in table definition | `todos.userId → user.id` |
| 5 | Drizzle relations (`relations()`) exported from same file as the owning table | `todosRelations`, `userProfileRelations` |
| 6 | One route file per feature, mounted in `index.ts` with `/api/<feature>` prefix | `routes/profile.ts` → `app.route("/api/profile", ...)` |
| 7 | `app.use("*", needAuth)` at top of every protected route file | profile, todos |
| 8 | `c.get("user")` to access current user from auth middleware | Every handler that needs user context |
| 9 | User-scoped queries: `WHERE userId = currentUserId` | Every todo query, profile query |
| 10 | Upsert with `onConflictDoUpdate` for single-row-per-user tables | Profile PATCH |
| 11 | API client groups mirror route prefixes | `api.profile.get()`, `api.todos.list()` |
| 12 | `AbortSignal` passthrough on every API method | `signal?: AbortSignal` |
| 13 | `useQuery` + `useMutation` + `queryClient.invalidateQueries` | Profile page |
| 14 | `toast.error()` on mutation failures, `toast.success()` on success | Mutation `onError`/`onSuccess` callbacks |
| 15 | Single-page edit-in-place toggle (view mode ↔ edit mode) | Profile page |
| 16 | `queryKey: ["featureName"]` grouping convention | `["profile"]`, `["todos"]` |
| 17 | Migration workflow: `db:generate` → review SQL → `db:migrate` | New migration file |
| 18 | Auth guard wraps every protected page | `<AuthGuard>` in route definition |
| 19 | Navigation element shared across pages | Header with links to `/todos` and `/profile` |
| 20 | tRPC-style response envelope (`{ success, data }`) on every endpoint | All routes |

---

## Detailed Plan

### Step 1 — Shared Schemas: `packages/shared/src/schemas/profile.ts`

```ts
export const UserProfileSchema = z.object({
  displayName: z.string().nullable(),
  bio: z.string().max(160).nullable(),
  avatarUrl: z.string().url().nullable(),
})
export type UserProfile = z.infer<typeof UserProfileSchema>

export const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional(),
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
```

**Exports needed from `package.json`**: Add `"./schemas/profile": "./src/schemas/profile.ts"` to exports map.

---

### Step 2 — DB Schema: Modify `apps/server/src/db/schemas/todos.ts`

- Add `userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })`
- Import `user` from `./auth.ts`
- Add `todosRelations` export: todo belongs to one user, user has many todos

```ts
export const todosRelations = relations(todos, ({ one }) => ({
  user: one(user, { fields: [todos.userId], references: [user.id] }),
}))
```

**Update barrel**: Export `todosRelations` from `schemas/index.ts`.

---

### Step 3 — DB Schema: Create `apps/server/src/db/schemas/profile.ts`

Table `user_profile` with:
- `userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" })`
- `displayName: text("display_name")`
- `bio: text("bio", { length: 160 })`
- `avatarUrl: text("avatar_url")`
- `createdAt`, `updatedAt` (timestamp, standard pattern)

```ts
export const userProfileRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, { fields: [userProfiles.userId], references: [user.id] }),
}))
```

**Update barrel**: Export `userProfiles`, `userProfileRelations` from `schemas/index.ts`.

---

### Step 4 — Migration Generation

```bash
bun run --cwd apps/server db:generate   # Generates drizzle/0002_*.sql
# Review the generated SQL
bun run --cwd apps/server db:migrate    # Apply migration
```

Migration will:
- ADD COLUMN `user_id` to `todos` (NOT NULL with a default/reference)
- CREATE TABLE `user_profile`

---

### Step 5 — Server Route: Create `apps/server/src/routes/profile.ts`

Protected route file:

- `app.use("*", needAuth)` — all routes require authentication
- `GET /` — fetch profile for current user. Returns `null` data if profile doesn't exist (not 404)
- `PATCH /` — upsert profile fields. Validated with `zValidator("json", UpdateProfileSchema)`. Uses `onConflictDoUpdate({ target: userProfiles.userId, set: input })`

**Key pattern**: Profile is `null`-able — a user may not have created one yet. The GET returns `{ success: true, data: null }` in that case.

---

### Step 6 — Server Route: Modify `apps/server/src/routes/todos.ts`

Scope every operation to the current user:

- `GET /` → add `where(eq(todos.userId, user.id))`
- `POST /` → add `userId: user.id` to `.values()`
- `PATCH /:id` → add `where(eq(todos.userId, user.id))` to scoping (can't modify other users' todos)
- `DELETE /:id` → same scoping

Extract `c.get("user")` at the route level or per-handler.

**Pattern**: Every user-owned query includes a WHERE clause that restricts to the current user's ID.

---

### Step 7 — Mount Profile Route: Modify `apps/server/src/index.ts`

```ts
import profileRoutes from "./routes/profile.ts"
app.route("/api/profile", profileRoutes)
```

---

### Step 8 — Web API Client: Modify `apps/web/src/api/client.ts`

Add profile methods group:

```ts
import type { UserProfile, UpdateProfileInput } from "@workspace/shared/schemas/profile"

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
```

---

### Step 9 — Web UI: Create `apps/web/src/pages/profile.tsx`

Two-mode page (view ↔ edit):

**View mode**: Shows avatar placeholder, display name or email fallback, bio. Has "Edit Profile" button.
**Edit mode**: Form with displayName text input, bio textarea, save/cancel buttons.

- `useQuery({ queryKey: ["profile"], queryFn: ({ signal }) => api.profile.get(signal) })`
- `useMutation` for update with `onSuccess` → invalidate + toast.success, `onError` → toast.error

Include a "Back to Todos" link in the header area.

---

### Step 10 — Web UI: Modify `apps/web/src/App.tsx`

```tsx
import { ProfilePage } from "@/pages/profile"

<Route
  path="/profile"
  element={
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  }
/>
```

---

### Step 11 — Web UI: Add Navigation to `apps/web/src/pages/todos.tsx`

Add a link to `/profile` in the header (next to the sign-out button or as part of the user name area).

---

### Step 12 — Verify

```bash
bun run typecheck    # All packages
bun run lint         # Biome
```

---

## Execution Order

| Step | Action | Complexity |
|------|--------|------------|
| 1 | Create `packages/shared/src/schemas/profile.ts` + update `package.json` exports | Low |
| 2 | Modify `apps/server/src/db/schemas/todos.ts` (add userId + relations) | Medium |
| 3 | Create `apps/server/src/db/schemas/profile.ts` (profile table + relations) | Low |
| 4 | Update `apps/server/src/db/schemas/index.ts` (barrel exports) | Low |
| 5 | Generate & apply DB migration | Medium |
| 6 | Create `apps/server/src/routes/profile.ts` | Medium |
| 7 | Modify `apps/server/src/routes/todos.ts` (user-scope all queries) | Medium |
| 8 | Mount profile route in `apps/server/src/index.ts` | Low |
| 9 | Add profile methods to `apps/web/src/api/client.ts` | Low |
| 10 | Create `apps/web/src/pages/profile.tsx` | High |
| 11 | Add profile route to `apps/web/src/App.tsx` | Low |
| 12 | Add navigation links to `apps/web/src/pages/todos.tsx` | Low |
| 13 | `bun run typecheck` + `bun run lint` | Verify |

---

## File Summary

| Action | File |
|--------|------|
| **Create** | `packages/shared/src/schemas/profile.ts` |
| **Modify** | `packages/shared/package.json` (add export) |
| **Modify** | `apps/server/src/db/schemas/todos.ts` (userId + relations) |
| **Create** | `apps/server/src/db/schemas/profile.ts` |
| **Modify** | `apps/server/src/db/schemas/index.ts` (export profile) |
| **Generate** | `apps/server/drizzle/0002_*.sql` (migration) |
| **Create** | `apps/server/src/routes/profile.ts` |
| **Modify** | `apps/server/src/routes/todos.ts` (user-scope) |
| **Modify** | `apps/server/src/index.ts` (mount profile route) |
| **Modify** | `apps/web/src/api/client.ts` (profile methods) |
| **Create** | `apps/web/src/pages/profile.tsx` |
| **Modify** | `apps/web/src/App.tsx` (add route) |
| **Modify** | `apps/web/src/pages/todos.tsx` (add nav) |
