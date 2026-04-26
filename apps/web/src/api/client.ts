import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "@workspace/shared/schemas/todo"

const API_BASE = "/api"

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
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
  todos: {
    list: () => fetchJson<Todo[]>("/todos"),
    create: (input: CreateTodoInput) =>
      fetchJson<Todo>("/todos", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: number, input: UpdateTodoInput) =>
      fetchJson<Todo>(`/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    delete: (id: number) =>
      fetchJson<null>(`/todos/${id}`, {
        method: "DELETE",
      }),
  },
}
