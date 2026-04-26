import { Hono } from "hono"
import { logger } from "hono/logger"
import { corsMiddleware } from "./middleware/cors.ts"
import { errorHandler } from "./middleware/error.ts"
import healthRoutes from "./routes/health.ts"
import todoRoutes from "./routes/todos.ts"

const app = new Hono()

app.use(logger())
app.use(corsMiddleware())

app.route("/api/health", healthRoutes)
app.route("/api/todos", todoRoutes)

app.onError(errorHandler)

const port = Number(process.env.PORT) || 3001

console.log(`Server starting on port ${port}`)

Bun.serve({
  fetch: app.fetch,
  port,
})
