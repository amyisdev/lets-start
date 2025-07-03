# Let's Start - Personal Starter Kit

A modern, full-stack personal starter kit built with Turborepo for rapid project development.

## Overview

**Let's Start** is a comprehensive starter kit designed to jumpstart full-stack web applications. It leverages the power of Turborepo to manage a monorepo containing both frontend and backend applications with shared tooling and configurations.

## Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Vite** for blazing-fast development and building
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible UI components

### Backend
- **Hono** - Fast, lightweight web framework
- **Drizzle ORM** for type-safe database operations
- **better-auth** for authentication and user management
- **pg** - PostgreSQL client library for database connections
- **PGlite** - Lightweight in-memory PostgreSQL for testing

### Testing
- **Bun Test Runner** for fast, modern testing

### Development Tools
- **Turborepo** for monorepo management
- **TypeScript** for static type checking
- **Biome** for code linting and formatting

## Project Structure

```
lets-start/
├── apps/
│   ├── frontend/          # React + Vite frontend application
│   └── backend/           # Hono backend API
└── turbo.json           # Turborepo configuration
```

## Apps

- `frontend`: A React 19 application built with Vite, featuring Tailwind CSS and shadcn/ui components
- `backend`: A Hono-based API server with Drizzle ORM, better-auth authentication, and PostgreSQL database

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url> my-project
cd my-project
```

2. Install dependencies:
```bash
bun install
```

### Development

To start developing all apps simultaneously:

```bash
bun run dev
```

To develop a specific app:

```bash
# Frontend only
bun run dev --filter=frontend

# Backend only  
bun run dev --filter=backend
```

### Building

Build all apps and packages:

```bash
bun run build
```

Build a specific app:

```bash
bun run build --filter=frontend

bun run build --filter=backend
```

### Testing

Run tests across all packages:

```bash
bun run test
```

## Features

### 🚀 Fast Development
- Hot module replacement with Vite
- Optimized build pipelines with Turborepo
- Instant testing with Bun

### 🎨 Modern UI
- Pre-configured Tailwind CSS
- shadcn/ui component library
- Responsive design patterns

### 🔧 Type Safety
- Full TypeScript support
- Type-safe database queries with Drizzle
- Shared type definitions

### 📦 Monorepo Benefits
- Organized project structure
- Efficient dependency management
- Coordinated deployments

## Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start development servers for all apps |
| `build` | Build all apps |
| `test` | Run tests for all apps |
| `check` | Run Biome linting and formatting |
| `check:write` | Run Biome linting and formatting with auto-fix |
| `ci` | Run Biome linting, format and run tests for all apps |

## Deployment

### Frontend
The frontend can be deployed to any static hosting service (Vercel, Netlify, etc.):

```bash
cd apps/frontend
bun run build
# Deploy the dist/ folder
```

### Backend
The backend can be deployed to any Node.js hosting service:

```bash
cd apps/backend
bun run build
# Deploy the built application
```

## Learn More

- [Turborepo Documentation](https://turborepo.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Hono Documentation](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [better-auth](https://www.better-auth.com)
- [pg (node-postgres)](https://node-postgres.com)
- [PGlite](https://pglite.dev)
- [Biome](https://biomejs.dev)
- [Bun Documentation](https://bun.sh/docs)

## License

MIT License - feel free to use this starter kit for your projects!
