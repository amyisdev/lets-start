import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { db } from "./db/client"

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  trustedOrigins: [clientOrigin],
})
