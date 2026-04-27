import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { auth } from "../auth.ts"

export const needAuth = createMiddleware<{
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})
