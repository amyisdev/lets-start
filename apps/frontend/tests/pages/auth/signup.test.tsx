import { screen, waitFor } from '@testing-library/react'
import { authenticated, signUpFailed, unauthenticated } from 'tests/msw/handlers/auth'
import { server } from 'tests/msw/server'
import { renderWithRouter } from 'tests/utils'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import SignUp from '@/pages/auth/signup'

describe('Signup', () => {
  beforeEach(() => {
    server.use(unauthenticated)
  })

  it('renders the signup page', async () => {
    renderWithRouter(<SignUp />)

    expect(screen.getByRole('heading', { level: 1 }).textContent).toEqual('Sign up')
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('can signup and redirect to home', async () => {
    const { user } = renderWithRouter(<App />, { route: '/auth/signup' })

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 }).textContent).toEqual('Sign up')
    })

    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const signUpButton = screen.getByRole('button', { name: 'Sign up' })

    server.use(authenticated)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'password')
    await user.click(signUpButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 }).textContent).toEqual('Home')
    })
  })

  it('can show error when signup fails', async () => {
    server.use(signUpFailed)

    const { user } = renderWithRouter(<SignUp />)

    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const signUpButton = screen.getByRole('button', { name: 'Sign up' })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'test@test.com')
    await user.type(passwordInput, 'password')
    await user.click(signUpButton)

    expect(screen.getByText('User already exists')).toBeInTheDocument()
  })

  it('redirects to home when user is authenticated', async () => {
    server.use(authenticated)

    renderWithRouter(<App />, { route: '/auth/signup' })

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 }).textContent).toEqual('Home')
    })
  })
})
