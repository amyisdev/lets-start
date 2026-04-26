import type { Context, ErrorHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { logger } from "../lib/logger.ts"

export const errorHandler: ErrorHandler = (err, c: Context) => {
  logger.error(err)

  if (err instanceof HTTPException) {
    return c.json({ success: false, error: err.message }, err.status)
  }

  return c.json({ success: false, error: "Internal server error" }, 500)
}
