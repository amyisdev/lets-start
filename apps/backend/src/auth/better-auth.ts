import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, organization } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
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

  plugins: [
    admin(),
    organization({
      async allowUserToCreateOrganization(user) {
        const [dbUser] = await db.select().from(schema.users).where(eq(schema.users.id, user.id))
        return dbUser?.role === 'admin'
      },
    }),
  ],
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
