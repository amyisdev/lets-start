import { render, waitFor } from '@testing-library/react'
import { unauthenticated } from 'tests/msw/handlers/auth'
import { server } from 'tests/msw/server'
import { renderWithRouter } from 'tests/utils'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { authClient } from '@/lib/auth-client'
import Home from '@/pages/home'

describe('Home', () => {
  it('renders welcome message', () => {
    const screen = render(<Home />)

    const welcome = screen.getByText('Welcome to the home page')
    expect(welcome).toBeInTheDocument()
  })

  it('renders home as index route', async () => {
    const screen = renderWithRouter(<App />)

    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Home')
  })

  it('redirects to login page if not authenticated', async () => {
    server.use(unauthenticated)
    await authClient.signOut()

    const screen = renderWithRouter(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login')
    })
  })
})
