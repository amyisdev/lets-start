import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { auth } from "./auth.ts"
import { errorHandler } from "./middleware/error.ts"
import healthRoutes from "./routes/health.ts"
import todoRoutes from "./routes/todos.ts"

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173"

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}>()

app.use(logger())
app.use(
  cors({
    origin: clientOrigin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
)

// Session middleware - sets user/session on all routes
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    c.set("user", null)
    c.set("session", null)
    await next()
    return
  }
  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})

// Mount auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

// Mount other routes
app.route("/api/health", healthRoutes)
app.route("/api/todos", todoRoutes)

app.onError(errorHandler)

const port = Number(process.env.PORT) || 3001

console.log(`Server starting on port ${port}`)

Bun.serve({
  fetch: app.fetch,
  port,
})
