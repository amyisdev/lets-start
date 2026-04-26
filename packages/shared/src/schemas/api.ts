import { z } from "zod"
import { TodoSchema } from "./todo"

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  })

export const TodoListResponseSchema = ApiResponseSchema(z.array(TodoSchema))
export const TodoResponseSchema = ApiResponseSchema(TodoSchema)
export const EmptyResponseSchema = ApiResponseSchema(z.null())

export type TodoListResponse = z.infer<typeof TodoListResponseSchema>
export type TodoResponse = z.infer<typeof TodoResponseSchema>
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>
