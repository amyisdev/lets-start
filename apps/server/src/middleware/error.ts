import type { Context, ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { logger } from "../lib/logger.ts"

export const errorHandler: ErrorHandler = (err, c: Context) => {
  const method = c.req.method
  const path = c.req.path

  if (err instanceof HTTPException) {
    const status = err.status

    if (status >= 500) {
      logger.error(
        { method, path, status, message: err.message },
        "HTTP exception",
      )
    } else {
      logger.warn(
        { method, path, status, message: err.message },
        "Client error",
      )
    }

    return c.json({ success: false, error: err.message }, status)
  }

  logger.error({ method, path, err }, "Unhandled error")

  return c.json({ success: false, error: "Internal server error" }, 500)
}
