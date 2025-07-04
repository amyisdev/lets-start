import { describe, expect, it } from 'bun:test'
import { signedInAs } from 'tests/utils/auth'
import { auth } from '@/auth/better-auth'

describe('BetterAuth', () => {
  it('should allow admin to create an organization', async () => {
    const res = await auth.api.createOrganization({
      headers: await signedInAs('admin@ls.local'),
      body: {
        name: 'Admin Organization',
        slug: 'admin-organization',
      },
    })

    expect(res?.name).toEqual('Admin Organization')
    expect(res?.slug).toEqual('admin-organization')
  })

  it('should not allow user to create an organization', () => {
    expect(async () => {
      await auth.api.createOrganization({
        headers: await signedInAs('user@ls.local'),
        body: {
          name: 'User Organization',
          slug: 'user-organization',
        },
      })
    }).toThrow()
  })
})
