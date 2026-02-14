# BowlingStats Web Application

The web-based frontend for visualizing and analyzing bowling statistics from PinPal exports.

For an overview of the entire project, see the [main README](../README.md).

## Overview

This React application allows users to upload PinPal bowling app exports and visualize their bowling statistics through interactive dashboards. All data is processed and stored locally in the browser using IndexedDB for privacy and offline access.

## Features

- **Import PinPal Data**: Upload SQLite database exports from the PinPal mobile app
- **Performance Metrics**: View bowling averages, strike rates, spare conversion, and game trends
- **Visual Analytics**: Interactive charts and statistics dashboards
- **Offline Storage**: All data processed and stored locally in your browser
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Custom Material Design theme optimized for readability

## Prerequisites

- Node.js 18+ and npm/pnpm

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Navigate to http://localhost:5173
```

### Using the App

1. Navigate to the upload page
2. Export your bowling data from PinPal (Settings > Export Database)
3. Upload the `.db` file through the app's onboarding
4. View your bowling statistics and trends

## Development

### Available Commands

- `npm run dev` - Start the Vite development server on localhost:5173 with hot reload
- `npm run build` - Build the project for production (output in `dist/`)
- `npm run lint` - Run ESLint on TypeScript/TSX files
- `npm run preview` - Preview the production build locally

### Testing

Tests are not currently configured for this project. Testing setup can be added using Vitest or React Testing Library as needed.

## Project Structure

```
src/
├── components/            # React components
│   ├── layout.tsx         # Root layout with navigation
│   ├── stat-card.tsx      # Statistics card component
│   ├── games-overview.tsx # Games display component
│   ├── league-overview-card.tsx # League summary card
│   ├── ball-card.tsx      # Ball statistics card
│   ├── theme-toggle.tsx   # Dark/light mode toggle
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts
│   └── pinpal-service-context.tsx # PinpalService provider
├── lib/                   # Utilities
│   ├── theme-provider.tsx # Theme management
│   └── utils.ts           # Helper functions
├── pages/                 # Route pages
│   ├── home.tsx           # Home/dashboard page
│   ├── upload.tsx         # Database import page
│   ├── leagues.tsx        # League list page
│   ├── league-detail.tsx  # League detail page
│   ├── balls.tsx          # Ball statistics page
│   └── monthly.tsx        # Monthly statistics page
├── services/              # Core services
│   ├── pinpal.service.ts  # PinPal database querying
│   ├── db.ts              # IndexedDB wrapper (Dexie)
│   ├── pinpal.model.ts    # PinPal data models
│   └── pinpal-query.model.ts # Query option types
├── App.tsx                # Root component with routing
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## Architecture

### Data Layer

**PinpalService** (`src/services/pinpal.service.ts`)
- Core service for querying bowling statistics from SQLite databases
- Initializes sql.js from CDN to process SQLite databases in the browser
- Loads SQLite database from IndexedDB via AppDB service
- Provides methods to query leagues, games, ball statistics, and monthly statistics
- Implements complex SQL queries with CTEs for aggregating bowling metrics
- Calculates pin leave types (splits, single pins, regular leaves) on initialization
- Models: `PinpalModel` and `PinpalQueryModel` define the data structures

**AppDB** (`src/services/db.ts`)
- Dexie wrapper for IndexedDB storage
- Stores the raw SQLite database file (Uint8Array) in IndexedDB
- Provides single table: `databaseFiles` indexed by `title`

**Import Process**
- User uploads PinPal backup file via upload page
- `PinpalService.importDatabase()` extracts SQLite database from backup file by searching for "SQLite format 3" header
- Stores extracted database in IndexedDB
- Loads database into sql.js for querying

### State Management

- React Context for PinpalService singleton (`usePinpalService()` hook)
- Component-level state using React hooks (`useState`, `useEffect`)
- No global state management library (Redux, Zustand, etc.)

### UI Components

**Pages** (`src/pages/`):
- `home.tsx` - Dashboard with recent bowling activity
- `upload.tsx` - Database file import interface
- `leagues.tsx` - League list view
- `league-detail.tsx` - Individual league statistics and games
- `balls.tsx` - Statistics organized by bowling ball
- `monthly.tsx` - Monthly aggregated statistics and trends

**Shared Components** (`src/components/`):
- `layout.tsx` - Root layout with navigation
- `stat-card.tsx` - Reusable card for displaying statistics
- `games-overview.tsx` - Displays game scores and details
- `league-overview-card.tsx` - League summary card
- `ball-card.tsx` - Ball statistics card
- `theme-toggle.tsx` - Dark/light mode toggle
- `ui/` - shadcn/ui component library (buttons, cards, charts, inputs, etc.)

### Routing

Routes configured in `src/App.tsx` using React Router v7 with `createBrowserRouter`:
- `/` - Home page
- `/upload` - Upload database
- `/leagues` - League list
- `/league/:id` - League detail
- `/balls` - Ball statistics
- `/monthly` - Monthly trends

## Technology Stack

- **React** 19 with TypeScript
- **Vite** for build tooling and development server
- **React Router** v7 for routing
- **Tailwind CSS** v4 for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **Dexie.js** for IndexedDB storage and management
- **sql.js** for parsing and querying PinPal SQLite exports in the browser

## Code Style and Best Practices

### TypeScript
- Strict type checking enabled
- Prefer type inference when obvious
- Avoid `any`; use `unknown` for uncertain types
- Use `import type { ... }` for type-only imports

### React
- Functional components with hooks
- Use React Context for shared services (PinpalService)
- Prefer composition over prop drilling
- Type component props explicitly
- Use `useState` and `useEffect` for component state and side effects

### Styling
- Tailwind CSS v4 with custom design tokens
- Global styles in `src/index.css`
- OKLCH color space for custom colors
- shadcn/ui components for consistent UI
- Path alias `@/*` maps to `src/*`

## Building

To build the project for production:

```bash
npm run build
```

Build artifacts are output to `dist/` with production optimizations. The build uses Vite for fast bundling and optimization.

## Troubleshooting

### Database Import Issues
- Ensure you've exported the database from PinPal (Settings > Export Database)
- The `.db` file must be a valid SQLite database

### Performance Issues
- Try clearing IndexedDB and re-importing your data
- Check browser console for errors

## Contributing

When contributing to this project, please follow the code style guidelines above and ensure tests pass before submitting changes.
