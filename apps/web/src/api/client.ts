import type {
  UpdateProfileInput,
  UserProfile,
} from "@workspace/shared/schemas/profile"
import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "@workspace/shared/schemas/todo"

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }

  return data.data as T
}

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
    list: (signal?: AbortSignal) => fetchJson<Todo[]>("/todos", { signal }),
    create: (input: CreateTodoInput, signal?: AbortSignal) =>
      fetchJson<Todo>("/todos", {
        method: "POST",
        body: JSON.stringify(input),
        signal,
      }),
    update: (id: number, input: UpdateTodoInput, signal?: AbortSignal) =>
      fetchJson<Todo>(`/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
        signal,
      }),
    delete: (id: number, signal?: AbortSignal) =>
      fetchJson<null>(`/todos/${id}`, {
        method: "DELETE",
        signal,
      }),
  },
}
