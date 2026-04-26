import { zValidator } from "@hono/zod-validator"
import {
  CreateTodoSchema,
  UpdateTodoSchema,
} from "@workspace/shared/schemas/todo"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { db } from "../db/client.ts"
import { todos } from "../db/schemas/todos.ts"
import { needAuth } from "../middleware/auth.ts"

const app = new Hono()

app.use("*", needAuth)

async function getTodoOrThrow(id: number) {
  const todo = await db.select().from(todos).where(eq(todos.id, id)).limit(1)
  if (todo.length === 0) {
    throw new HTTPException(404, { message: "Todo not found" })
  }
  return todo[0]
}

app.get("/", async (c) => {
  const allTodos = await db.select().from(todos).orderBy(todos.createdAt)
  return c.json({ success: true, data: allTodos })
})

app.post("/", zValidator("json", CreateTodoSchema), async (c) => {
  const input = c.req.valid("json")

  const result = await db
    .insert(todos)
    .values({
      title: input.title,
      completed: false,
    })
    .returning()

  return c.json({ success: true, data: result[0] }, 201)
})

app.patch("/:id", zValidator("json", UpdateTodoSchema), async (c) => {
  const id = Number(c.req.param("id"))
  const input = c.req.valid("json")

  if (Number.isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid id" })
  }

  await getTodoOrThrow(id)

  const result = await db
    .update(todos)
    .set(input)
    .where(eq(todos.id, id))
    .returning()

  return c.json({ success: true, data: result[0] })
})

app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"))

  if (Number.isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid id" })
  }

  await getTodoOrThrow(id)

  await db.delete(todos).where(eq(todos.id, id))

  return c.json({ success: true, data: null })
})

export default app
