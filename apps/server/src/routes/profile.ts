import { zValidator } from "@hono/zod-validator"
import { UpdateProfileSchema } from "@workspace/shared/schemas/profile"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { db } from "../db/client.ts"
import { userProfiles } from "../db/schemas/profile.ts"
import { needAuth } from "../middleware/auth.ts"

const profileRoutes = new Hono()
  .use("*", needAuth)
  .get("/", async (c) => {
    const user = c.get("user")
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    if (profile.length === 0) {
      return c.json({ success: true, data: null })
    }

    return c.json({ success: true, data: profile[0] })
  })

  .patch("/", zValidator("json", UpdateProfileSchema), async (c) => {
    const user = c.get("user")
    const input = c.req.valid("json")

    const result = await db
      .insert(userProfiles)
      .values({
        userId: user.id,
        ...input,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: input,
      })
      .returning()

    return c.json({ success: true, data: result[0] })
  })

export default profileRoutes
