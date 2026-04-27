import { db } from "../src/db/client.ts"
import { todos } from "../src/db/schemas/todos.ts"

async function seed() {
  console.log("Seeding database...")

  const existing = await db.select().from(todos).limit(1)
  if (existing.length > 0) {
    console.log("Database already seeded.")
    return
  }

  // Todos now require a userId (FK to user table).
  // Since we can't create a valid better-auth user from a seed script easily,
  // users should register and create their own todos via the app.
  console.log("Skipping todo seeding — todos require an authenticated user.")
  console.log("Seeding complete.")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
