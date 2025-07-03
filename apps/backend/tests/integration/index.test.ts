import { describe, expect, it } from 'bun:test'
import app from '@/index'

describe('Health Check', () => {
  it('should return status ok', async () => {
    const response = await app.request('/api/health')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: 'success' })
  })
})

describe('Catch All', () => {
  it('should return not found', async () => {
    const response = await app.request('/api/not-found')
    expect(response.status).toBe(404)
  })
})
