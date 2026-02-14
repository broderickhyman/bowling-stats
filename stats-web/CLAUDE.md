# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application for visualizing bowling statistics from PinPal app exports. The app processes SQLite database files client-side, storing them in IndexedDB for offline access. All data processing happens locally in the browser for privacy.

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server (localhost:5173)

# Building
npm run build            # TypeScript compilation + Vite production build

# Code Quality
npm run lint             # Run ESLint on TypeScript/TSX files

# Preview
npm run preview          # Preview production build locally
```

## Architecture

### Data Flow

1. **Import Process**: User uploads PinPal backup file → `PinpalService.importDatabase()` extracts SQLite database by searching for "SQLite format 3" header → Stores in IndexedDB via `AppDB` (Dexie wrapper)
2. **Query Process**: Components use `usePinpalService()` hook → Service initializes sql.js from CDN → Loads database from IndexedDB → Executes SQL queries
3. **State Management**: React Context for PinpalService singleton, component-level state with hooks

### Key Services

**PinpalService** (`src/services/pinpal.service.ts`)
- Initializes sql.js from CDN (https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/)
- Loads SQLite database from IndexedDB via AppDB
- Provides methods: `loadLeagueOverviews()`, `loadGames()`, `loadGameStats()`, `loadBallStats()`, `loadMonthlyStats()`, `loadWeeks()`
- Implements complex SQL with CTEs for aggregating bowling metrics (strikes, spares, pocket hits, etc.)
- Calculates pin leave types (splits, single pins, regular) using adjacency algorithm in `calculateLeaves()`
- Uses bit manipulation to parse PinPal's frame data encoding

**AppDB** (`src/services/db.ts`)
- Dexie wrapper for IndexedDB
- Single table: `databaseFiles` indexed by `title`
- Stores raw SQLite database as Uint8Array

**PinpalServiceContext** (`src/contexts/pinpal-service-context.tsx`)
- Provides singleton PinpalService instance via React Context
- Use `usePinpalService()` hook to access service in components

### UI Structure

**Pages** (`src/pages/`)
- `home.tsx` - Dashboard with recent bowling activity
- `upload.tsx` - Database file import interface
- `leagues.tsx` - League list view
- `league-detail.tsx` - Individual league statistics and games
- `balls.tsx` - Statistics grouped by bowling ball
- `monthly.tsx` - Monthly aggregated trends

**Shared Components** (`src/components/`)
- `layout.tsx` - Root layout with navigation
- `stat-card.tsx` - Reusable statistics display card
- `games-overview.tsx` - Game scores display
- `league-overview-card.tsx` - League summary card
- `ball-card.tsx` - Ball statistics card
- `theme-toggle.tsx` - Dark/light mode toggle
- `ui/` - shadcn/ui components (button, card, chart, etc.)

### Routing

Uses React Router v7 with `createBrowserRouter`:
- `/` - Home page
- `/upload` - Upload database
- `/leagues` - League list
- `/league/:id` - League detail
- `/balls` - Ball statistics
- `/monthly` - Monthly trends

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- Custom design tokens in `src/index.css` using OKLCH color space
- Dark mode support via custom variant: `@custom-variant dark (&:is(.dark *))`
- shadcn/ui components imported from `shadcn/tailwind.css`
- Geist Variable font (`@fontsource-variable/geist`)
- Path alias: `@/*` maps to `src/*`

## Code Patterns

### TypeScript
- Strict type checking enabled
- Type imports: use `import type { ... }` for types
- Models defined in `src/services/pinpal.model.ts` and `pinpal-query.model.ts`

### React
- Use hooks for state and effects
- Context for shared services (PinpalService)
- Prefer composition over prop drilling
- Type component props explicitly

### Data Models
- `Game`, `LeagueOverview`, `Week`, `BallStats`, `MonthlyStats` - Core data types from PinPal database
- `Stats` interface - Aggregated statistics including average, strikes%, spares%, etc.
- `GameQueryOptions`, `LeagueQueryOptions` - Query option types

## Docker Deployment

Multi-stage Dockerfile:
1. **Builder stage**: Node 24-alpine, pnpm for dependencies, `npm run build`
2. **Runner stage**: nginx-unprivileged:alpine3.22, serves from `/usr/share/nginx/html`, exposes port 8080
3. Custom `nginx.conf` for SPA routing

## Important Notes

- sql.js is loaded from CDN, not bundled (see PinpalService initialization)
- All database processing happens client-side - no backend required
- PinPal stores frame data using bit flags - see SQL queries in PinpalService for decoding logic
- Frame flags: `& 1` = valid frame, `& 2` = second ball thrown, `& 4` = clean game
- Pin encoding uses 10 bits for pins 1-10
- Dates in PinPal DB are Unix timestamps (seconds), convert with `new Date(timestamp * 1000)`
