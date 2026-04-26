import { db } from "./client.ts"
import { todos } from "./schema.ts"

async function seed() {
  console.log("Seeding database...")

  const existing = await db.select().from(todos).limit(1)
  if (existing.length > 0) {
    console.log("Database already seeded.")
    return
  }

  await db.insert(todos).values([
    { title: "Build the starter kit", completed: true },
    { title: "Add Hono server", completed: false },
    { title: "Wire up the frontend", completed: false },
  ])

  console.log("Seeding complete.")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
