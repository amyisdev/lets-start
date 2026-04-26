import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().default("./data.db"),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
    CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
