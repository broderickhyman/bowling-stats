# BowlingStats Web Application

The web-based frontend for visualizing and analyzing bowling statistics from PinPal exports.

For an overview of the entire project, see the [main README](../README.md).

## Overview

This Angular application allows users to upload PinPal bowling app exports and visualize their bowling statistics through interactive dashboards. All data is processed and stored locally in the browser using IndexedDB for privacy and offline access.

## Features

- **Import PinPal Data**: Upload SQLite database exports from the PinPal mobile app
- **Performance Metrics**: View bowling averages, strike rates, spare conversion, and game trends
- **Visual Analytics**: Interactive charts and statistics dashboards
- **Offline Storage**: All data processed and stored locally in your browser
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Custom Material Design theme optimized for readability

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+ (`npm install -g @angular/cli`)

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to http://localhost:4200
```

### Using the App

1. Navigate to the upload page
2. Export your bowling data from PinPal (Settings > Export Database)
3. Upload the `.db` file through the app's onboarding
4. View your bowling statistics and trends

## Development

### Available Commands

- `npm start` - Start the development server on 0.0.0.0:4200 with hot reload
- `npm run watch` - Build in watch mode with development configuration
- `npm test` - Run all tests once (non-watch mode) using Vitest
- `npm run test-watch` - Run tests in watch mode
- `npm run build` - Build the project for production (output in `dist/`)

### Testing

This project uses [Vitest](https://vitest.dev/) as the test runner (not Karma).

- Test configuration: `vitest.config.ts` and `vitest.setup.ts`
- Tests run in jsdom environment

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test-watch
```

## Project Structure

```
src/
├── app/
│   ├── core/              # Services and guards
│   │   ├── services/      # Business logic services
│   │   │   ├── pinpal.service.ts       # PinPal database querying
│   │   │   ├── db.service.ts           # IndexedDB wrapper (Dexie)
│   │   │   └── page-title.service.ts   # Page title management
│   │   └── guards/
│   ├── shared/            # Shared components and pipes
│   ├── features/          # Feature modules
│   │   ├── dashboard/     # Statistics dashboard
│   │   ├── onboarding/    # Data import flow
│   │   ├── leagues/       # League detail views
│   │   ├── balls/         # Ball statistics
│   │   └── monthly/       # Monthly aggregated statistics
│   ├── models/            # TypeScript interfaces
│   └── routes/
├── assets/                # Static assets
└── styles/                # Global styles and theming
```

## Architecture

### Data Layer

**PinpalService** (`src/app/core/services/pinpal.service.ts`)
- Core service for querying bowling statistics from SQLite databases
- Initializes sql.js from CDN to process SQLite databases in the browser
- Loads SQLite database from IndexedDB via AppDB service
- Provides methods to query leagues, games, ball statistics, and monthly statistics
- Implements complex SQL queries with CTEs for aggregating bowling metrics
- Calculates pin leave types (splits, single pins, regular leaves) on initialization

**AppDB** (`src/app/core/services/db.service.ts`)
- Dexie wrapper for IndexedDB storage
- Stores the raw SQLite database file (Uint8Array) in IndexedDB
- Provides single table: `databaseFiles` indexed by `title`

**Import Process**
- User uploads PinPal backup file via upload page
- `PinpalService.importDatabase()` extracts SQLite database from backup file by searching for "SQLite format 3" header
- Stores extracted database in IndexedDB
- Loads database into sql.js for querying

### State Management

- Uses Angular signals for reactive state (zoneless change detection enabled)
- `computed()` for derived state
- Service-based state management (no NgRx or similar)

### UI Components

**Page Components:**
- `HomePage` - Overview of recent bowling activity
- `UploadPage` - Database file upload interface
- `LeagueListPage` - List all bowling leagues
- `LeaguePage` - Detailed league statistics (route: `/league/:id`)
- `BallsPage` - Statistics by bowling ball used
- `MonthlyPage` - Monthly aggregated statistics

**Shared Components:**
- `StatCard` - Reusable card for displaying statistics
- `GamesOverview` - Display game scores
- `PinCard` - Display pin-related statistics

All components are standalone (Angular 20+) with `ChangeDetectionStrategy.OnPush`.

### Routing

Routes configured in `src/app/app.routes.ts` with eager loading (no lazy loading currently implemented).

## Technology Stack

- **Angular** 20+ with TypeScript
- **Angular Material** for UI components
- **Dexie.js** for IndexedDB storage and management
- **sql.js** for parsing and querying PinPal SQLite exports in the browser
- **ng2-charts** for data visualization (Chart.js wrapper)
- **Vitest** for unit testing

## Code Style and Best Practices

### TypeScript
- Strict type checking enabled
- Prefer type inference when obvious
- Avoid `any`; use `unknown` for uncertain types

### Angular
- All components are standalone
- Use signals for state management
- Implement OnPush change detection
- Use `input()` and `output()` functions instead of decorators
- Use computed signals for derived state
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`

### Services
- All services use `providedIn: 'root'` for singleton behavior
- Use `inject()` function instead of constructor injection

### Styling
- SCSS for component styles
- Global styles in `src/styles.scss`
- Prefer Material Design system CSS variables (`--mat-sys-*`) when available

## Building

To build the project for production:

```bash
npm run build
```

Build artifacts are output to `dist/` with production optimizations including output hashing.

## Troubleshooting

### Database Import Issues
- Ensure you've exported the database from PinPal (Settings > Export Database)
- The `.db` file must be a valid SQLite database

### Performance Issues
- Try clearing IndexedDB and re-importing your data
- Check browser console for errors

## Contributing

When contributing to this project, please follow the code style guidelines above and ensure tests pass before submitting changes.
