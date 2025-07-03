import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import App from '@/App'
import Home from '@/pages/home'
import { renderWithRouter } from '../utils'

describe('Home', () => {
  it('renders heading', () => {
    const screen = render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Home')
  })

  it('renders home as index route', () => {
    const screen = renderWithRouter(<App />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Home')
  })
})
