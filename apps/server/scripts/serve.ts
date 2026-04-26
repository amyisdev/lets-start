import { app } from "../src/index.ts"
import { logger } from "../src/lib/logger.ts"

const port = Number(process.env.PORT) || 3000

const server = Bun.serve({
  fetch: app.fetch,
  port,
})

logger.info("Listening on port %d", port)

async function shutdown() {
  logger.info("Shutting down...")
  server.stop()
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
