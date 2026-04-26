import type { Context, Next } from "hono"

export function corsMiddleware() {
  return async (c: Context, next: Next) => {
    c.header("Access-Control-Allow-Origin", "http://localhost:5173")
    c.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    )
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    if (c.req.method === "OPTIONS") {
      return c.body(null, 204)
    }

    await next()
  }
}
