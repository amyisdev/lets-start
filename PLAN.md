# Frontend Garden Cleaning Plan

Issues found during code review of `apps/web/`, `packages/shared/`, and `packages/ui/`.

**Status: ✅ All items implemented.**

---

## 1. Dead Code / Redundancy

### 1.1 `packages/shared/src/index.ts` — Redundant barrel file

`package.json` already defines an `"exports"` map with fine-grained subpath exports (`./schemas/todo`, `./schemas/api`, `./constants`). Consumers use those paths, not the barrel. The barrel file is dead code.

**Recommendation:** Remove `src/index.ts`.

**Decision:** ✅ Remove.

### 1.2 `packages/shared/src/constants.ts` — Entire file unused

`API_BASE_URL` is not imported anywhere. `HTTP_STATUS` is also unused — neither the server nor the client imports from this file.

**Decision:** ✅ Remove the entire file.

### 1.3 `packages/ui/src/lib/.gitkeep` — Redundant placeholder

`src/lib/utils.ts` already exists in the same directory. The `.gitkeep` serves no purpose.

**Decision:** ✅ Delete.

### 1.4 `packages/ui/tsconfig.lint.json` — Broken config, remove entire file

- `"include": ["src", "turbo"]` — there is no `turbo/` directory
- `"outDir": "dist"` conflicts with the main config's `"noEmit": true`

Not actively used by any tool. This also resolves section 3.4.

**Decision:** ✅ Delete `tsconfig.lint.json` entirely.

---

## 2. Runtime Safety

### 2.1 `apps/web/src/api/client.ts` — No request timeout

`fetch` hangs indefinitely if the server is unresponsive.

**User question:** What if we replace the API client with `ofetch`?

**Analysis:**

| | `ofetch` | Raw `fetch` + React Query |
|---|---|---|
| Bundle cost | ~2KB gzipped (extra dep) | $0 (platform built-in) |
| Timeout | Built-in `timeout` option | Via `AbortController` (React Query passes `signal` to `queryFn`) |
| Auto JSON | Built-in `.json()` parsing | Manual `.json()` call |
| Error handling | Throws on non-2xx | Must check `response.ok` manually |
| Retry | Manual | React Query built-in retry |

Since section 4.2 introduces `@tanstack/react-query`, React Query's `queryFn` already receives an `AbortSignal` that handles timeout and cancellation. Adding `ofetch` on top would be a redundant dependency — its key features (timeout, retry, error normalization) are already covered by React Query.

**Recommendation:** Stick with raw `fetch`. Pass the `signal` from React Query's `queryFn` context to `fetch` for timeout/cancellation support. The API client's `fetchJson` helper should accept an optional `signal` parameter.

**Decision:** ✅ Keep raw `fetch`, add `signal` support.

### 2.2 `apps/web/src/api/client.ts` — Untyped `as T` cast without runtime validation

`data.data as T` trusts the server to return correctly-typed data. Server and client share the same Zod schemas in a monorepo, so drift is unlikely.

**Decision:** ✅ Keep the lightweight `as T` cast. (Skipped — acceptable for this scope.)

### 2.3 `apps/web/src/lib/auth-provider.tsx` — `signOut` swallows errors

`signOut` has no try/catch — if the request fails, the error is silently swallowed.

**Decision:** ⏭️ Skipped for now.

---

## 3. Consistency

### 3.1 `apps/web/src/main.tsx` — Mixed import styles

File mixes `@/` alias imports and relative `./` imports:
```ts
import { ThemeProvider } from "@/components/theme-provider.tsx"  // @/ alias
import { App } from "./App.tsx"                                   // relative
```

**Decision:** ✅ Use `@/` aliases consistently. Keep `.tsx`/`.ts` extensions.

### 3.2 `apps/web/src/lib/auth-provider.tsx` — Uses `interface` instead of `type`

```ts
interface AuthContextValue { ... }
```

The rest of the codebase uses `type` for object shapes.

**Decision:** ✅ Change to `type AuthContextValue = { ... }`.

### 3.3 `apps/web/src/components/theme-provider.tsx` — Keyboard shortcut bypasses `setTheme`

The "D" key handler calls `setThemeState` + `localStorage.setItem` directly instead of calling `setTheme`. The current approach is a workaround to avoid stale closures in the effect.

**Recommendation:** Use a ref (`useRef`) to hold the latest `setTheme` reference so the effect can safely call it without stale closure issues. This eliminates the duplicated localStorage logic.

**Decision:** ✅ Refactor to use ref pattern.

---

## 4. User Experience

### 4.1 `apps/web/index.html` — Generic title

```html
<title>vite-monorepo</title>
```

**Decision:** ✅ Change to `"Let's Start"`.

### 4.2 `apps/web/src/components/todos.tsx` — Full list reload after every mutation

Every create/toggle/delete calls `loadTodos()` which re-fetches the entire list. Each user action triggers an extra network round-trip.

**User comment:** Introduce `@tanstack/react-query`.

**Recommendation:** Add `@tanstack/react-query` and refactor `todos.tsx` to use `useQuery` for fetching and `useMutation` for mutations. React Query provides:
- Automatic caching and background refetching
- `onMutate` / `onError` / `onSettled` for optimistic updates
- Built-in loading/error states (replaces manual `loading` state)
- Deduplication of requests

The API client (`client.ts`) will become a set of plain async functions (returning promises) used as `queryFn` and `mutationFn`. React Query's `signal` parameter will be passed through to `fetch` for request cancellation.

**Open question:** Should we also add `@tanstack/react-query-devtools` (dev-only, useful for debugging)?

### 4.3 `apps/web/src/components/todos.tsx` — No user-facing error messages

All catch blocks only do `console.error`. The user gets no indication that their action failed.

**User comment:** Install sonner via shadcn/ui.

**Implementation plan:**
1. Install sonner via shadcn: `bunx --bun shadcn@latest add sonner -c apps/web`
   - This installs `sonner` into `packages/ui/src/components/sonner.tsx`
2. Mount `<Toaster />` once in the app root (`main.tsx`, after `<ThemeProvider>`)
3. Call `toast.error(message)` in mutation `onError` callbacks (inside `todos.tsx`)

**Error flow:**
- API client (`fetchJson`) throws `Error` with a descriptive message (server error or HTTP status)
  → React Query mutation catches the error
  → `onError` callback calls `toast.error(error.message)`
  → Sonner displays the toast notification

**Decision:** ✅ Install sonner, mount Toaster in `main.tsx`, call `toast.error()` in mutation `onError` callbacks.

### 4.4 `apps/web/src/components/auth-forms.tsx` — No explicit success feedback

After successful login/register, the component relies on `AuthProvider` detecting the session change to swap views. Brief delay before transition.

**Decision:** ✅ Current behavior is fine.

---

## 5. Implementation Order

| # | Item | Section | Complexity |
|---|------|---------|------------|
| 1 | Remove `packages/shared/src/index.ts` | 1.1 | Trivial |
| 2 | Remove `packages/shared/src/constants.ts` | 1.2 | Trivial (check no imports first) |
| 3 | Delete `packages/ui/src/lib/.gitkeep` | 1.3 | Trivial |
| 4 | Delete `packages/ui/tsconfig.lint.json` | 1.4 | Trivial |
| 5 | Fix `index.html` title | 4.1 | Trivial |
| 6 | Fix import styles in `main.tsx` (`@/` alias) | 3.1 | Trivial |
| 7 | Change `interface` to `type` in `auth-provider.tsx` | 3.2 | Trivial |
| 8 | Fix theme keyboard shortcut (ref pattern) | 3.3 | Low |
| 9 | Add `signal` support to `fetchJson` | 2.1 | Low |
| 10 | Install and mount sonner | 4.3 | Low |
| 11 | Add `@tanstack/react-query`, refactor `todos.tsx` | 4.2 | High |
| 12 | Wire sonner error toasts into react-query mutations | 4.3 | Low |

Items 1–4 (dead code removal) should be done first since they may affect imports in later steps.

---

## 6. File Cleanup Summary

| Action | File |
|--------|------|
| Remove | `packages/shared/src/index.ts` |
| Remove | `packages/shared/src/constants.ts` |
| Remove | `packages/ui/src/lib/.gitkeep` |
| Remove | `packages/ui/tsconfig.lint.json` |
| Modify | `apps/web/index.html` (title) |
| Modify | `apps/web/src/main.tsx` (import styles, mount Toaster) |
| Modify | `apps/web/src/lib/auth-provider.tsx` (interface → type) |
| Modify | `apps/web/src/components/theme-provider.tsx` (keyboard ref) |
| Modify | `apps/web/src/api/client.ts` (signal support, simplify for react-query) |
| Modify | `apps/web/src/components/todos.tsx` (react-query refactor + sonner) |
| Add dep | `@tanstack/react-query` |
| Add dep | `sonner` (via shadcn) |
| Add dep | `next-themes` (peer dep for sonner) |
| Add file | `packages/ui/src/components/sonner.tsx` (via shadcn) |

---

## Final File Structure

```
apps/web/
├── src/
│   ├── api/
│   │   └── client.ts           ← fetchJson + signal support
│   ├── components/
│   │   ├── auth-forms.tsx       ← unchanged
│   │   ├── theme-provider.tsx   ← keyboard shortcut uses ref pattern
│   │   └── todos.tsx            ← @tanstack/react-query + sonner
│   ├── lib/
│   │   ├── auth-client.ts       ← unchanged
│   │   └── auth-provider.tsx    ← interface → type
│   ├── App.tsx                  ← unchanged
│   ├── main.tsx                 ← QueryClientProvider + Toaster + @/ imports
│   └── vite-env.d.ts            ← unchanged
├── index.html                   ← title: "Let's Start"
├── package.json                 ← +@tanstack/react-query
├── components.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts

packages/shared/
├── src/
│   ├── schemas/
│   │   ├── api.ts               ← unchanged
│   │   └── todo.ts              ← unchanged
├── package.json                 ← removed ./constants export
└── tsconfig.json

packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx           ← unchanged
│   │   └── sonner.tsx           ← NEW: shadcn sonner wrapper
│   ├── lib/
│   │   └── utils.ts             ← unchanged
│   └── styles/
│       └── globals.css          ← updated with sonner CSS vars
├── package.json                 ← +sonner, +next-themes
├── components.json
└── tsconfig.json
```
