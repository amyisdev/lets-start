import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "@workspace/shared/schemas/todo"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/api/client"

export function Todos() {
  const [newTitle, setNewTitle] = useState("")
  const queryClient = useQueryClient()

  const { data: todos = [], isPending } = useQuery({
    queryKey: ["todos"],
    queryFn: ({ signal }) => api.todos.list(signal),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateTodoInput) => api.todos.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      setNewTitle("")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTodoInput }) =>
      api.todos.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.todos.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createMutation.mutate({ title: newTitle.trim() })
  }

  const handleToggle = (todo: Todo) => {
    updateMutation.mutate({
      id: todo.id,
      input: { completed: !todo.completed },
    })
  }

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

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
          <Button type="submit" disabled={!newTitle.trim() || isMutating}>
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
          {todos.length === 0 && !isPending && (
            <p className="text-muted-foreground text-center text-sm py-4">
              No todos yet. Add one above.
            </p>
          )}
          {isPending && todos.length === 0 && (
            <p className="text-muted-foreground text-center text-sm py-4">
              Loading...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
