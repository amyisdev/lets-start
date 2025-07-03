# Frontend - React + Vite + shadcn/ui

The frontend application for the "Let's Start" project, built with modern web technologies for optimal developer experience and performance.

## Tech Stack

- **React 19** with **TypeScript** for robust component development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible UI components
- **Bun Test Runner** for fast testing

## Getting Started

### Development

Run the frontend development server:

```bash
# From the root of the monorepo
bun run dev --filter=frontend

# Or from this directory
bun run dev
```

The application will be available at `http://localhost:5173`

### Building

Build the frontend for production:

```bash
# From the root of the monorepo
bun run build --filter=frontend

# Or from this directory
bun run build
```

### Testing

Run tests:

```bash
# From the root of the monorepo
bun run test --filter=frontend

# Or from this directory
bun test
```

## Project Structure

```
apps/frontend/
├── src/
│   ├── components/      # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── tests/               # Test files
└── vite.config.ts       # Vite configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start development server with HMR |
| `build` | Build for production |
| `preview` | Preview production build locally |
| `test` | Run tests with Bun |
| `test:watch` | Run tests in watch mode |

## Environment Variables

Create a `.env.local` file in this directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
```

Copy from `.env.example` if available, or create the file with the above template.

## Adding shadcn/ui Components

This project uses shadcn/ui for component library. To add new components:

```bash
# Install a component (run from this directory)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

Components will be added to `src/components/ui/` and can be imported like:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
```

## Tailwind Configuration

The project includes a custom Tailwind configuration provided by shadcn/ui:

- Extended color palette
- Custom spacing and typography
- Component-specific utilities
- Dark mode support

## API Integration

The frontend is configured to work with the Hono backend API. API calls should use the configured base URL:

```tsx
// Example API call
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`)
```

## Deployment

Build the project and upload the `dist/` folder to your hosting provider:

```bash
bun run build
# Upload the dist/ folder
```

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org)
- [Biome](https://biomejs.dev)
- [Bun Documentation](https://bun.sh/docs)
