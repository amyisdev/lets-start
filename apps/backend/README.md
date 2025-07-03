# Backend - Hono API + Drizzle ORM + better-auth

The backend API for the "Let's Start" project, built with modern server technologies for optimal performance and developer experience.

## Tech Stack

- **Hono** - Fast, lightweight web framework for building APIs
- **Drizzle ORM** for type-safe database operations
- **better-auth** for authentication and user management
- **pg** - PostgreSQL client library for database connections
- **PGlite** - Lightweight in-memory PostgreSQL for testing
- **TypeScript** for static type checking
- **Bun Test Runner** for fast testing

## Getting Started

### Development

Run the backend development server:

```bash
# From the root of the monorepo
bun run dev --filter=backend

# Or from this directory
bun run dev
```

The API will be available at `http://localhost:3000`

### Building

Build the backend for production:

```bash
# From the root of the monorepo
bun run build --filter=backend

# Or from this directory
bun run build
```

### Testing

Run tests:

```bash
# From the root of the monorepo
bun run test --filter=backend

# Or from this directory
bun test
```

## Project Structure

```
apps/backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── middleware/      # Custom middleware
│   ├── db/              # Database schema and migrations
│   ├── auth/            # Authentication configuration
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript type definitions
├── tests/               # Test files
├── drizzle.config.ts    # Drizzle ORM configuration
└── package.json         # Dependencies and scripts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start development server with hot reload |
| `build` | Build for production |
| `test` | Run tests with Bun |
| `test:watch` | Run tests in watch mode |

## Environment Variables

Create a `.env.local` file in this directory with the following variables:

```env
# Database
DATABASE_URL=your_database_url

# Authentication
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# CORS
TRUSTED_ORIGINS=http://localhost:5173
```

Copy from `.env.example` if available, or create the file with the above template.

## API Endpoints

The backend provides RESTful API endpoints for:

- **Authentication** - User registration, login, logout
- **User Management** - Profile operations
- **Protected Routes** - Authenticated endpoints

API documentation will be available at `http://localhost:3000/docs` when running in development mode.

## Database Operations

This project uses Drizzle ORM for database operations:

```bash
# Generate migrations
bunx drizzle-kit generate

# Run migrations
bunx drizzle-kit migrate

# Open Drizzle Studio
bunx drizzle-kit studio
```

## Authentication

The backend uses better-auth for comprehensive authentication features:

- Email/password authentication
- Session management
- Protected route middleware
- User role management

## Deployment

Build and deploy the backend:

```bash
bun run build
# Deploy the built application to your hosting provider
```

The backend can be deployed to any Node.js/Bun hosting service like:
- Railway
- Render
- DigitalOcean App Platform
- AWS Lambda (with adapter)

## Learn More

- [Hono Documentation](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [better-auth](https://www.better-auth.com)
- [pg (node-postgres)](https://node-postgres.com)
- [PGlite](https://pglite.dev)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript](https://www.typescriptlang.org)
