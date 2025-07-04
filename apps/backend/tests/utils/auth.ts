import { auth } from '@/auth/better-auth'

const cookiesMap = new Map<string, string>()

export async function signedInAs(email: string, password = 'password') {
  if (cookiesMap.has(email)) {
    return { Cookie: cookiesMap.get(email) || '' }
  }

  const res = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  })

  if (!res.ok) {
    throw new Error(`Failed to sign in as ${email}`)
  }

  const cookie = res.headers.get('set-cookie') || ''
  cookiesMap.set(email, cookie)

  return { Cookie: cookie }
}
