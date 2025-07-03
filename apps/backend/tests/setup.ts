import { beforeAll } from 'bun:test'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { db } from '@/db/client'
import { seed } from './utils/seeder'

beforeAll(async () => {
  process.env.BETTER_AUTH_SECRET = 'testing-only-secret'

  await migrate(db, {
    migrationsFolder: './drizzle/',
  })

  await seed()
})
