import { drizzle } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePGLite } from 'drizzle-orm/pglite'

export const db = process.env.NODE_ENV === 'test' ? drizzlePGLite() : drizzle(process.env.DATABASE_URL!)
