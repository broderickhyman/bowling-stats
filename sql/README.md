# Bowling Statistics SQL Queries

A collection of SQL queries for analyzing bowling performance data from PinPal SQLite databases. These queries can be used for offline analysis, reporting, or testing.

## Overview

These queries are designed to work with PinPal's SQLite database schema, extracting and calculating various bowling metrics including:

- League statistics and averages
- Monthly performance trends
- Game and frame analysis
- Ball usage statistics
- Spare conversion and strike rates

## Usage

1. Extract the SQLite database from a PinPal backup using the [BackupParser](../parser)
2. Open the `.db` file in a SQLite client (e.g., SQLite Browser, DBeaver)
3. Copy and paste a query below into the SQL editor
4. Run the query to view the results

## Query Reference

### League Analysis

**league-list.sql**
- Lists all bowling leagues with basic statistics
- Shows average score, game count, and date range for each league
- Ordered by most recent activity

**league-averages.sql**
- Detailed league statistics including gutter rates
- Tracks gutter frequency per league
- Useful for comparing performance across leagues

### Monthly Statistics

**monthly-averages.sql**
- Monthly performance metrics with comprehensive statistics
- Includes strike rates, pocket hit rates, spare conversion, and gutter counts
- Broken down by frame type (single pin spares, regular spares, opens)
- Useful for identifying trends over time

**monthly-averages-testing.sql**
- Test version of monthly averages (development/debugging)

### Game Performance

**high-games.sql**
- Lists the highest scoring games
- Useful for identifying peak performance

**all-time-bests.sql**
- All-time best performances across various metrics
- Aggregates top scores and performance statistics

**top-10-all-time.sql**
- Top 10 highest scores in bowling history
- Quick reference for peak performance

**nightly-averages.sql**
- Bowling session/night statistics
- Analyzes performance by bowling session date

**nightly-series.sql**
- Tracks series performance by night
- May include multi-game analysis

### Equipment and Miscellaneous

**ball-usage.sql**
- Statistics for each bowling ball used
- Tracks usage frequency and performance by ball

**misc.sql**
- Miscellaneous queries and analysis
- General purpose queries for exploration

**misc2.sql**
- Additional miscellaneous queries
- Further exploration tools

## PinPal Database Schema Notes

The queries assume knowledge of the PinPal database structure, particularly:

- `league` - League information and metadata
- `game` - Individual game records
- `frame` - Frame-by-frame scoring data
- `week` - Weekly session data
- Frame scoring encoding uses bit flags for strikes, spares, and pin configuration

## Tips for Creating New Queries

- PinPal uses bitwise flags for frame and game data
- Timestamps are stored as Unix epoch format
- Use `STRFTIME()` with 'unixepoch' modifier to convert timestamps
- Frame scores use bit operations: lower bits for first ball, upper bits for second ball
- Pin data uses bit flags to represent specific pin positions
