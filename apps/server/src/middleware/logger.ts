import type { MiddlewareHandler } from "hono"
import { logger } from "../lib/logger.ts"

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const path = c.req.path
  const method = c.req.method

  await next()

  const status = c.res.status
  const durationMs = Date.now() - start

  // Skip health check logs to avoid noise from load balancers / uptime monitors
  if (path === "/api/health") {
    return
  }

  logger.info(
    { method, path, status, durationMs },
    `${method} ${path} - ${status}`,
  )
}
