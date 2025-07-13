# Testing Guide

## Test Utilities

### renderWithRouter

A custom render function for testing React components that use React Router 7.

#### Basic Usage

```tsx
import { renderWithRouter } from '../utils'
import { App } from '@/App'

test('renders app at home route', () => {
  const screen = renderWithRouter(<App />)
  // Test your component...
})
```

#### With Specific Routes

```tsx
import { renderWithRouter } from '../utils'
import { UserProfile } from '@/components/UserProfile'

test('renders user profile page', () => {
  const screen = renderWithRouter(<UserProfile />, {
    initialEntries: ['/users/123'],
    initialIndex: 0
  })
  // Test your component...
})
```

#### With Multiple Routes

```tsx
import { renderWithRouter } from '../utils'
import { App } from '@/App'

test('navigates between routes', () => {
  const screen = renderWithRouter(<App />, {
    initialEntries: ['/', '/about', '/contact'],
    initialIndex: 1 // Start at /about
  })
  // Test your component...
})
```

#### Options

- `initialEntries?: string[]` - Array of route paths (default: `['/']`)
- `initialIndex?: number` - Index of the initial route (default: `0`)
- All other options from `@testing-library/react`'s `render` function

#### Why Use This?

React Router 7 components need to be wrapped in a router context to function properly. This helper uses `MemoryRouter` which is perfect for testing because:

- It doesn't depend on browser APIs
- You can control the routing state
- It's isolated between tests
- You can specify initial routes and navigation history

## Testing Best Practices

### When to Use renderWithRouter

Use `renderWithRouter` when testing:
- Components that use React Router hooks (`useNavigate`, `useLocation`, `useParams`, etc.)
- Components that render `<Link>` or `<NavLink>` elements
- Full application components (like `<App />`)
- Components that depend on route parameters

Use regular `render` for:
- Simple components that don't interact with routing
- Unit tests for pure functions
- Components that don't use router context

### Example Test Structure

```tsx
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../utils'
import { SomeComponent } from '@/components/SomeComponent'

describe('SomeComponent', () => {
  it('renders correctly', () => {
    const screen = renderWithRouter(<SomeComponent />)
    
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })
  
  it('navigates on button click', async () => {
    const screen = renderWithRouter(<SomeComponent />)
    const { user } = screen
    
    await user.click(screen.getByRole('button', { name: 'Navigate' }))
    
    // Assert navigation behavior
  })
}) 
