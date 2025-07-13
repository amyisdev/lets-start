import { HttpResponse, http } from 'msw'

const user = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@tk.local',
  role: 'user',
}

export const unauthenticated = http.get('http://localhost:3000/api/auth/get-session', () => {
  return HttpResponse.json(null)
})

export const authenticated = http.get('http://localhost:3000/api/auth/get-session', () => {
  return HttpResponse.json({ user, session: { id: '1' } })
})

export const authenticatedAdmin = http.get('http://localhost:3000/api/auth/get-session', () => {
  return HttpResponse.json({ user: { ...user, role: 'admin' }, session: { id: '1' } })
})

export const loginSuccess = http.post('http://localhost:3000/api/auth/sign-in/email', () => {
  return HttpResponse.json({ user })
})

export const loginFailed = http.post('http://localhost:3000/api/auth/sign-in/email', () => {
  return HttpResponse.json(
    {
      code: 'INVALID_EMAIL_OR_PASSWORD',
      message: 'Invalid email or password',
    },
    { status: 401 },
  )
})

export const signUpSuccess = http.post('http://localhost:3000/api/auth/sign-up/email', () => {
  return HttpResponse.json({ user })
})

export const signUpFailed = http.post('http://localhost:3000/api/auth/sign-up/email', () => {
  return HttpResponse.json(
    {
      code: 'USER_ALREADY_EXISTS',
      message: 'User already exists',
    },
    { status: 422 },
  )
})

export const signOutSuccess = http.post('http://localhost:3000/api/auth/sign-out', () => {
  return HttpResponse.json({ success: true })
})

export const handlers = [authenticated, loginSuccess, signUpSuccess, signOutSuccess]
