# Bowling Stats

A system for analyzing bowling performance data from PinPal exports. Import your bowling history, visualize trends, and identify areas for improvement.

## Overview

This repository contains a complete solution for tracking and analyzing bowling statistics:

- **Web Application** - React app for visualizing bowling data with interactive dashboards
- **Parser Tool** - Command-line utility for extracting SQLite databases from PinPal backups
- **SQL Queries** - Collection of queries for offline analysis and exploration

All data is processed locally in your browser for privacy. No data is sent to external servers.

## Quick Start

The app is hosted and ready to use at **[https://bowling-stats.broderickhyman.com/](https://bowling-stats.broderickhyman.com/)** — just visit the link and start analyzing your bowling data!

Alternatively, you can run it locally:

1. **Install Dependencies**: `npm install` (from the `stats-web` directory)
2. **Start Development Server**: `npm run dev`
3. **Upload Your Data**: Export your bowling data from PinPal and import it through the app
4. **View Your Stats**: Explore your bowling statistics and trends

For detailed setup instructions, see [stats-web/README.md](./stats-web/README.md).

## Repository Structure

### [stats-web](./stats-web) - Web Application
The main user interface for visualizing bowling statistics. Built with React, Tailwind CSS, and Recharts.

**Key Features:**
- Interactive dashboards and charts
- League, monthly, and ball statistics
- Real-time data visualization
- Local data storage (IndexedDB)
- Dark/light theme support

**Get Started:** `cd stats-web && npm install && npm run dev`

See [stats-web/README.md](./stats-web/README.md) for full documentation.

### [parser](./parser) - BackupParser Tool
A .NET command-line tool for extracting SQLite databases from PinPal backup files. Useful if you prefer command-line processing or need to extract the database separately.

**Usage:** `dotnet run -- --path backup.pinpal`

See [parser/README.md](./parser/README.md) for full documentation.

### [sql](./sql) - Analysis Queries
A collection of SQL queries for analyzing bowling statistics directly from the PinPal SQLite database. Useful for offline analysis or building custom reports.

**Queries Include:**
- League averages and statistics
- Monthly performance trends
- Game and ball analysis
- Strike and spare conversion rates

See [sql/README.md](./sql/README.md) for query documentation.

## Technology Stack

- **Frontend**: React 19 with TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Build Tool**: Vite
- **Database**: SQLite (from PinPal), sql.js (browser processing)
- **Storage**: IndexedDB with Dexie.js
- **Parser**: .NET / C#
- **Analysis**: SQL queries

## Data Source

This project works with data exported from [PinPal](https://www.pinpal.app/), a mobile bowling tracking application. The web app and parser extract and visualize the underlying SQLite database.

## Key Concepts

### How It Works

1. Export your bowling data from the PinPal app (Settings > Export Database)
2. The `.pinpal` backup file contains an embedded SQLite database
3. Upload the backup file to the web app (or use the parser tool)
4. The app extracts the database and stores it locally in your browser
5. Query and visualize your bowling statistics

### Privacy

- No data is stored on any external server
- All processing happens locally in your browser
- IndexedDB stores the database locally on your device
- Your bowling statistics never leave your computer

## Getting Help

- Check the project-specific README files for detailed documentation
- Review the [CLAUDE.md](./stats-web/CLAUDE.md) file for development guidelines
- Explore the [sql queries](./sql) for understanding the data structure

## License

See [LICENSE](./LICENSE) for details.

---

**Ready to explore your bowling stats?** Start with the [stats-web README](./stats-web/README.md)!
