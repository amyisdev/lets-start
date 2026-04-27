import { zValidator } from "@hono/zod-validator"
import {
  CreateTodoSchema,
  UpdateTodoSchema,
} from "@workspace/shared/schemas/todo"
import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { db } from "../db/client.ts"
import { todos } from "../db/schemas/todos.ts"
import { needAuth } from "../middleware/auth.ts"

async function getUserTodoOrThrow(id: number, userId: string) {
  const todo = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .limit(1)

  if (todo.length === 0) {
    throw new HTTPException(404, { message: "Todo not found" })
  }

  return todo[0]
}

const todoRoutes = new Hono()
  .use("*", needAuth)

  .get("/", async (c) => {
    const user = c.get("user")
    const allTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, user.id))
      .orderBy(todos.createdAt)

    return c.json({ success: true, data: allTodos })
  })

  .post("/", zValidator("json", CreateTodoSchema), async (c) => {
    const user = c.get("user")
    const input = c.req.valid("json")

    const result = await db
      .insert(todos)
      .values({
        userId: user.id,
        title: input.title,
        completed: false,
      })
      .returning()

    return c.json({ success: true, data: result[0] }, 201)
  })

  .patch("/:id", zValidator("json", UpdateTodoSchema), async (c) => {
    const user = c.get("user")
    const id = Number(c.req.param("id"))
    const input = c.req.valid("json")

    if (Number.isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid id" })
    }

    await getUserTodoOrThrow(id, user.id)

    const result = await db
      .update(todos)
      .set(input)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
      .returning()

    return c.json({ success: true, data: result[0] })
  })

  .delete("/:id", async (c) => {
    const user = c.get("user")
    const id = Number(c.req.param("id"))

    if (Number.isNaN(id)) {
      throw new HTTPException(400, { message: "Invalid id" })
    }

    await getUserTodoOrThrow(id, user.id)

    await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))

    return c.json({ success: true, data: null })
  })

export default todoRoutes
