# BackupParser

A command-line tool for extracting SQLite databases from PinPal bowling app backup files.

## Overview

The BackupParser is a .NET console application that parses PinPal backup files (`.pinpal`) and extracts the embedded SQLite database. This can be useful for offline analysis or as an alternative to the in-browser import in the stats-web application.

**Note**: The [stats-web](../stats-web) application handles database extraction in the browser, so this tool is optional. Use it if you prefer command-line processing or need to extract the database separately.

## Prerequisites

- .NET SDK (check `BackupParser.csproj` for required version)

## Building

```bash
cd parser
dotnet build
```

## Usage

```bash
dotnet run -- --path /path/to/backup.pinpal
```

Or with the compiled executable:

```bash
BackupParser --path /path/to/backup.pinpal
```

### Command-Line Options

- `-p, --path` (required): Path to the PinPal backup file (`.pinpal`)

### Output

The tool extracts the SQLite database from the backup and saves it as a `.db` file in the same directory as the input file.

```
Input:  bowling_backup.pinpal
Output: bowling_backup.db
```

## How It Works

The parser searches through the backup file for the "SQLite format 3" magic string, which marks the beginning of the embedded SQLite database. Once found, it extracts the entire database to a new file.

## Development

The parser is a minimal .NET project with a single purpose. Main components:

- `Program.cs` - Entry point and database extraction logic
- `CommandLineOptions.cs` - Command-line argument definitions
