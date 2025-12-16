# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Commands

### Development
- `npm start` - Start the development server on 0.0.0.0:4200
- `npm run watch` - Build in watch mode with development configuration

### Build
- `npm run build` - Build the project for production (output in `dist/`)
- Build artifacts are configured with production optimizations including output hashing

### Testing
- `npm test` - Run all tests once (non-watch mode) using Vitest
- `npm run test-watch` - Run tests in watch mode
- Tests use Vitest (not Karma) with jsdom environment
- Test setup is configured in `vitest.setup.ts` and `vitest.config.ts`
- Angular's unit-test builder is configured to use the Vitest runner

## Project Architecture

### Data Layer
This application processes bowling statistics from a SQLite database extracted from PinPal (a bowling tracking app).

**Database Services:**
- `PinpalService` (src/app/core/services/pinpal.service.ts) - Core service for querying bowling statistics
  - Initializes sql.js from CDN to process SQLite databases in the browser
  - Loads SQLite database from IndexedDB via AppDB service
  - Provides methods to query leagues, games, ball statistics, and monthly statistics
  - Implements complex SQL queries with CTEs for aggregating bowling metrics (strikes, spares, opens, pocket hits, etc.)
  - Calculates pin leave types (splits, single pins, regular leaves) on initialization
- `AppDB` (src/app/core/services/db.service.ts) - Dexie wrapper for IndexedDB storage
  - Stores the raw SQLite database file (Uint8Array) in IndexedDB
  - Single table: `databaseFiles` indexed by `title`

**Import Process:**
- User uploads PinPal backup file via upload page
- `PinpalService.importDatabase()` extracts SQLite database from backup file by searching for "SQLite format 3" header
- Stores extracted database in IndexedDB
- Loads database into sql.js for querying

### State Management
- Uses Angular signals for reactive state (zoneless change detection enabled)
- `computed()` for derived state
- No global state management library (e.g., NgRx) - uses service-based state

### UI Components
- All components are standalone (Angular 20+)
- Uses Angular Material for UI components
- Uses ng2-charts (Chart.js wrapper) for data visualization
- Implements OnPush change detection strategy

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

### Routing
Routes are configured in `src/app/app.routes.ts` with eager loading (no lazy loading currently implemented).

### Services
- All services use `providedIn: 'root'` for singleton behavior
- Services use `inject()` function instead of constructor injection
- `PageTitleService` - Manages dynamic page titles

### Styling
- SCSS for component styles (configured in angular.json)
- Global styles in `src/styles.scss`
- Prefers Material Design system CSS variables (`--mat-sys-*`) when available

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Styling

- Prefer Material Design system CSS variables (`--mat-sys-*`) when available for colors and theming
- This ensures consistency with the Material Design theme and makes theme customization easier
