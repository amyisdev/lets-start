import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth/better-auth'
import { errorHandler, NotFoundError } from './shared/app-error'
import { trustedOrigins } from './shared/config'

const app = new Hono()
  .onError(errorHandler)
  .use('/api/*', cors({ origin: trustedOrigins, credentials: true }))
  .get('/api/health', (c) => c.json({ status: 'success' }))

  .on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

  .use('/api/*', () => {
    throw new NotFoundError()
  })

export default app
