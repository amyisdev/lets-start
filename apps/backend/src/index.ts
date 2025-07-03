import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorHandler, NotFoundError } from './shared/app-error'
import { trustedOrigins } from './shared/config'

const app = new Hono()
  .onError(errorHandler)
  .use('/api/*', cors({ origin: trustedOrigins, credentials: true }))
  .get('/api/health', (c) => {
    return c.json({ status: 'success' })
  })
  .use('/api/*', () => {
    throw new NotFoundError()
  })

export default app
