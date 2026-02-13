# Setup Guide

## Prerequisites

- **Node.js 18+** -- Required for npm workspaces and the `--watch` flag used by the backend dev server. Verify with `node --version`.
- **npm 9+** -- Ships with Node.js 18+. Verify with `npm --version`.
- **C/C++ build tools** -- Required by the `better-sqlite3` native addon. On macOS, install Xcode Command Line Tools (`xcode-select --install`). On Ubuntu/Debian, install `build-essential`. On Windows, install the Visual Studio C++ build tools.

## Installation

Clone the repository and install all dependencies (including workspace packages):

```bash
npm install
```

This installs dependencies for all three workspaces (`database`, `backend`, `frontend`) and hoists shared packages to the root `node_modules/`.

## Running the Application

### Backend API (port 3001)

```bash
npm run dev:backend
```

Starts the Express server on `http://localhost:3001` using Node's built-in `--watch` flag for automatic restarts on file changes.

### Frontend (port 3000)

```bash
npm run dev:frontend
```

Starts the Next.js development server on `http://localhost:3000` with hot module replacement.

### Running Both

Open two terminal windows/tabs and run each command separately. The frontend communicates with the backend at `http://localhost:3001`.

## Seeding the Database

Populate the database with sample URLs for development:

```bash
node database/seeds/sample.js
```

This creates the SQLite database file at `data/urls.db` (if it does not exist), initializes the schema, and inserts three sample URLs. You will see output like:

```
Seeding database with sample URLs...

  aBcD1eF -> https://github.com/anthropics/claude-code
  xYz9876 -> https://docs.anthropic.com/en/docs/welcome
  gH3jK5m -> https://en.wikipedia.org/wiki/URL_shortening

Done. Seeded 3 sample URLs.
```

The actual short codes will differ on each run since they are randomly generated.

## Linting

Run ESLint across all workspace packages:

```bash
npm run lint
```

The project uses ESLint flat config (`eslint.config.js` at the root). See `docs/DECISIONS.md` ADR-006 for details on the configuration.

## Project Structure

```
url-shortener/
  package.json            Root workspace configuration
  eslint.config.js        Shared ESLint rules
  database/               SQLite database package
    index.js              Public API exports
    src/connection.js     Database connection (singleton)
    src/schema.js         Table definitions
    src/models/url.js     URL CRUD operations
    seeds/sample.js       Database seeder
  backend/                Express API server
    src/server.js         Server entry point
    src/routes/           Route handlers
    src/middleware/        Middleware (validation, errors)
  frontend/               Next.js web client
    src/app/              App Router pages and layouts
    tailwind.config.js    Tailwind CSS configuration
  docs/                   Documentation
```

## Troubleshooting

### `better-sqlite3` installation fails

This package includes a native C++ addon. If `npm install` fails with compilation errors:

1. Ensure you have C/C++ build tools installed (see Prerequisites).
2. On macOS, run `xcode-select --install` if you have not already.
3. On Node.js version mismatches, try clearing the npm cache: `npm cache clean --force && rm -rf node_modules && npm install`.
4. If using an ARM Mac (M1/M2/M3), ensure you are using the ARM build of Node.js (not Rosetta).

### Port already in use

If port 3000 or 3001 is already occupied:

- Find the process: `lsof -i :3001` (replace with the relevant port)
- Kill it: `kill -9 <PID>`
- Or change the port in the respective package configuration

### Database is locked

SQLite allows only one writer at a time. If you see "database is locked" errors:

1. Ensure only one backend instance is running.
2. Check for orphaned processes holding the database file open.
3. Delete `data/urls.db` and re-seed if the database is corrupted.

### Frontend cannot reach backend

If the frontend shows network errors:

1. Confirm the backend is running on port 3001.
2. Check the browser console for CORS errors -- the backend uses the `cors` middleware, but verify it is configured correctly.
3. Ensure no firewall or proxy is blocking localhost connections.

### ESLint reports errors after adding a file

The flat config applies to all files in the repository except those in the `ignores` list. If a generated or third-party file triggers lint errors, add its path pattern to the `ignores` array in `eslint.config.js`.
