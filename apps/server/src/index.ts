import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "./auth.ts"
import { env } from "./lib/config.ts"
import { errorHandler } from "./middleware/error.ts"
import { requestLogger } from "./middleware/logger.ts"
import healthRoutes from "./routes/health.ts"
import profileRoutes from "./routes/profile.ts"
import todoRoutes from "./routes/todos.ts"

const app = new Hono()
  .onError(errorHandler)

  .use(requestLogger)
  .use(
    cors({
      origin: env.CLIENT_ORIGIN,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  )

  // Mount auth handler
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

  // Mount routes
  .route("/api/health", healthRoutes)
  .route("/api/profile", profileRoutes)
  .route("/api/todos", todoRoutes)

export { app }
