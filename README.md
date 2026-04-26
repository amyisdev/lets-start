# lets-start

A living starter kit for full-stack projects with Bun, Hono, React, and shadcn/ui.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo + Bun workspaces |
| Server | Bun + Hono + Drizzle ORM + SQLite |
| Client | Vite + React 19 + Tailwind CSS v4 |
| UI | shadcn/ui (base-ui, mira style) |
| Tooling | Biome + TypeScript |

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Run database migrations and seed
bun run --cwd apps/server db:migrate
bun run --cwd apps/server db:seed

# Start both dev servers
bun run dev
```

The web app runs on `http://localhost:5173` and the API server on `http://localhost:3001`.

## Project Structure

```
├── apps/
│   ├── server/     # Hono REST API with Drizzle + SQLite
│   └── web/        # Vite React app
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
