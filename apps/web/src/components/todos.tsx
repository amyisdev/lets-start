import type { Todo } from "@workspace/shared/schemas/todo"
import { Button } from "@workspace/ui/components/button"
import { useCallback, useEffect, useState } from "react"
import { api } from "@/api/client"

export function Todos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const loadTodos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.todos.list()
      setTodos(data)
    } catch (err) {
      console.error("Failed to load todos:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      await api.todos.create({ title: newTitle.trim() })
      setNewTitle("")
      await loadTodos()
    } catch (err) {
      console.error("Failed to create todo:", err)
    }
  }

  const handleToggle = async (todo: Todo) => {
    try {
      await api.todos.update(todo.id, { completed: !todo.completed })
      await loadTodos()
    } catch (err) {
      console.error("Failed to update todo:", err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.todos.delete(id)
      await loadTodos()
    } catch (err) {
      console.error("Failed to delete todo:", err)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-medium">Todos</h1>
          <p className="text-muted-foreground text-sm">
            A full-stack example with Hono, Drizzle, and React.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" disabled={!newTitle.trim()}>
            Add
          </Button>
        </form>

        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
                className="size-4 cursor-pointer"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {todo.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(todo.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                Delete
              </Button>
            </div>
          ))}
          {todos.length === 0 && !loading && (
            <p className="text-muted-foreground text-center text-sm py-4">
              No todos yet. Add one above.
            </p>
          )}
          {loading && todos.length === 0 && (
            <p className="text-muted-foreground text-center text-sm py-4">
              Loading...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
