import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { db } from "../src/db/client.ts"

async function runMigrations() {
  console.log("Running migrations...")
  migrate(db, { migrationsFolder: "./drizzle" })
  console.log("Migrations complete.")
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
