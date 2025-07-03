import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route entries for the MemoryRouter
   * @default ['/']
   */
  initialEntries?: string[]

  /**
   * Initial index for the MemoryRouter
   * @default 0
   */
  initialIndex?: number
}

/**
 * Custom render function that wraps components with MemoryRouter for testing
 * components that use React Router 7
 */
export function renderWithRouter(ui: ReactElement, options: RenderWithRouterOptions = {}) {
  const { initialEntries = ['/'], initialIndex = 0, ...renderOptions } = options

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        {children}
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
