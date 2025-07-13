import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './msw/server'

// Workaround for radix error
window.HTMLElement.prototype.hasPointerCapture = vi.fn()

beforeAll(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
  server.listen()
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
