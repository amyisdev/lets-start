import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'
import { BrowserRouter } from 'react-router'

function wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

export function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route)
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper }),
  }
}
