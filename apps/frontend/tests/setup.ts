import { afterAll, afterEach, beforeAll, expect } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { server } from './msw/server'

GlobalRegistrator.register()

expect.extend(matchers)

beforeAll(() => server.listen())

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
