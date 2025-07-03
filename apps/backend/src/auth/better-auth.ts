import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { nanoid } from 'nanoid'
import { db } from '@/db/client'
import { trustedOrigins } from '@/shared/config'
import * as schema from './auth.schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }),

  plugins: [admin()],
  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    cookiePrefix: 'ls',
    database: {
      generateId() {
        return nanoid()
      },
    },
  },

  trustedOrigins,
})
