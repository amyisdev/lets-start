import { Hono } from "hono"

const app = new Hono()

app.get("/", (c) => {
  return c.json({ success: true, data: { status: "ok" } })
})

export default app
