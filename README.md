# lets-start

A living starter kit for full-stack projects with Bun, Hono, React, and shadcn/ui.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo + Bun workspaces |
| Server | Bun + Hono + Drizzle ORM + SQLite |
| Client | Vite + React 19 + Tailwind CSS v4 |
| UI | shadcn/ui (base-ui, mira style) |
| Data fetching | @tanstack/react-query |
| Notifications | sonner (toast) |
| Auth | better-auth (email/password) |
| Tooling | Biome + TypeScript |

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Generate a secret for better-auth
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Run database migrations and seed
bun run --cwd apps/server db:migrate
bun run --cwd apps/server db:seed

# Start both dev servers
bun run dev
```

The web app runs on `http://localhost:5173` and the API server on `http://localhost:3000`.

## Authentication

Authentication is powered by [better-auth](https://www.better-auth.com) with email/password. The web app provides sign-up, sign-in, and sign-out flows. Protected routes and user sessions are handled automatically.

To customize the client origin or API URL, see the environment variables in `.env.example`.

## Project Structure

```
├── apps/
│   ├── server/     # Hono REST API with Drizzle + SQLite + better-auth
│   │   ├── scripts/    # serve.ts, migrate.ts, seed.ts
│   │   └── src/        # routes/, middleware/, db/schemas/, lib/
│   └── web/        # Vite React app with auth forms, react-query, sonner
├── packages/
│   ├── shared/     # Zod schemas and shared types
│   └── ui/         # shadcn/ui component library
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all dev servers |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all packages |
| `bun run format` | Format all packages |
| `bun run typecheck` | Type-check all packages |

## Adding Components

```bash
bunx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components/` and can be imported from `@workspace/ui/components/<name>`.

## License

MIT
