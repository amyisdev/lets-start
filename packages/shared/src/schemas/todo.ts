import { z } from "zod"

export const TodoSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoSchema = z.object({
  title: z.string().min(1).max(255),
})

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>

export const UpdateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
})

export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>
