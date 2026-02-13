# Architecture Overview

## System Summary

URL Shortener is a full-stack monorepo application that creates and resolves shortened URLs. It consists of three workspace packages (`database`, `backend`, `frontend`) managed by npm workspaces at the repository root.

## Architecture Diagram

```
                         +--------------------------+
                         |       Browser Client     |
                         +-----------+--------------+
                                     |
                          HTTP (port 3000)
                                     |
                         +-----------v--------------+
                         |   Next.js 14 Frontend    |
                         |   (App Router + SSR)     |
                         |   Tailwind CSS styling   |
                         +-----------+--------------+
                                     |
                          HTTP (port 3001)
                                     |
                         +-----------v--------------+
                         |   Express.js Backend     |
                         |   /api/* routes          |
                         |   Middleware pipeline:    |
                         |   - validateUrl          |
                         |   - errorHandler         |
                         +-----------+--------------+
                                     |
                           Sync function calls
                           (better-sqlite3)
                                     |
                         +-----------v--------------+
                         |   SQLite Database        |
                         |   data/urls.db           |
                         |   WAL journal mode       |
                         +--------+-----------------+
                                  |
                         +--------v-----------------+
                         |   Database Layer          |
                         |   - connection (singleton)|
                         |   - schema (auto-migrate) |
                         |   - models/url (CRUD)     |
                         |   - Base62 (short codes)  |
                         +--------------------------+
```

## Data Flow

1. **Shorten URL** -- The frontend sends a POST request with `originalUrl` to the backend API. The `validateUrl` middleware verifies the URL format. The database layer inserts the record, then Base62-encodes the auto-incremented row ID to produce a deterministic, collision-free short code. This follows the counter-based approach used by production URL shorteners like Bitly (see [Hello Interview's Bitly breakdown](https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly)).

2. **Resolve URL** -- A GET request with a short code hits the backend at `GET /r/:shortCode`. The database layer looks up the code, increments the click counter, and the backend issues an HTTP 302 (temporary) redirect to the original URL. A 302 is used instead of 301 because it forces the browser to always hit our server, enabling accurate click analytics -- a 301 (permanent) redirect would be cached by browsers, causing subsequent visits to bypass our server entirely and making click tracking impossible.

3. **List URLs** -- The frontend fetches all shortened URLs from the backend. The database returns rows ordered by `created_at DESC`.

## Tech Stack

### Next.js 14 (Frontend)

**Chosen over:** Vite, Create React App

**Why:** Server-side rendering for fast initial loads, file-based routing via the App Router that eliminates manual route configuration, and built-in optimizations (code splitting, image handling, font loading).

**Tradeoff:** Heavier framework overhead compared to a lightweight SPA bundler like Vite. Adds complexity that a simple single-page app may not need.

### Express.js (Backend API)

**Chosen over:** Fastify, Hono

**Why:** The most mature Node.js HTTP framework with the largest middleware ecosystem. Straightforward request/response model. Extensive community documentation and proven production track record.

**Tradeoff:** Lower raw throughput than Fastify or Hono. Callback-oriented API design predates modern async patterns, though this project uses simple synchronous database calls that make this a non-issue.

### SQLite + better-sqlite3 (Database)

**Chosen over:** PostgreSQL, MongoDB

**Why:** Zero configuration -- no server process to install or manage. The database is a single file (`data/urls.db`). The `better-sqlite3` driver provides a synchronous API that simplifies request handling (no async/await for queries). WAL journal mode enables concurrent reads.

**Tradeoff:** Single-writer limitation means write throughput is bounded. No built-in replication or horizontal scaling. Not suitable for high-concurrency write workloads, but perfectly adequate for a URL shortener's read-heavy pattern.

### npm Workspaces (Monorepo)

**Chosen over:** Turborepo, Lerna, Nx

**Why:** Native to npm with zero additional tooling. Workspaces are defined in the root `package.json` and dependencies are hoisted automatically. Cross-package references use workspace protocol (`"database": "*"`).

**Tradeoff:** No built-in task orchestration, caching, or dependency graph execution. For larger projects with many packages and complex build pipelines, a dedicated tool would provide better performance.

### Base62 Counter-Based Short Codes

**Chosen over:** nanoid, UUID, MD5/SHA-256 hashing

**Why:** This follows the same approach recommended in [Bitly's system design](https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly). Each URL gets a unique auto-incremented integer ID from SQLite, which is then encoded into a compact Base62 string (charset: `0-9A-Za-z`). This guarantees zero collisions -- every ID maps to exactly one short code, and vice versa.

**How it works:** ID `1` → `"1"`, ID `62` → `"10"`, ID `1000000` → `"4c92"`. Even at 1 billion URLs, codes stay under 6 characters. The approach scales to 62^7 (3.5 trillion) URLs before needing 8-character codes.

**Why not hashing (MD5/SHA-256)?** Hashing the original URL and taking a prefix risks collisions -- two different URLs could produce the same prefix, requiring collision resolution logic. The counter approach eliminates this entirely.

**Why not nanoid?** While nanoid generates URL-safe random strings with low collision probability, it's probabilistic -- collisions are unlikely but possible. A counter-based approach provides a mathematical guarantee of uniqueness. It also produces shorter codes (ID `1000` = `"g8"` vs nanoid's fixed 7 chars).

**Tradeoff:** Short codes are sequential/predictable (someone could guess codes by incrementing). For a public-facing service at scale, this could be mitigated by adding an offset or shuffling the Base62 alphabet. Not an issue for this application's scope.

### Tailwind CSS (Styling)

**Chosen over:** CSS Modules, styled-components, vanilla CSS

**Why:** Utility-first approach enables rapid UI development without context-switching to separate stylesheets. Automatic purging keeps the production bundle small. Consistent design tokens via the configuration file.

**Tradeoff:** Verbose class strings in HTML/JSX markup. Steeper learning curve for developers unfamiliar with the utility-first paradigm. Less semantic than BEM or CSS Modules.

### ESLint Flat Config (Linting)

**Chosen over:** Legacy `.eslintrc` format

**Why:** The flat config format (`eslint.config.js`) is the modern ESLint standard. Uses native ES module imports, is simpler to compose, and avoids the cascading confusion of the legacy format.

**Tradeoff:** Some community plugins have not yet migrated to flat config support. Fewer examples available online compared to the legacy format.

## Project Structure

```
url-shortener/
  package.json            Root workspace config
  eslint.config.js        Shared lint rules (flat config)
  database/
    index.js              Public API (re-exports)
    src/connection.js     SQLite singleton connection
    src/schema.js         Table creation / migration
    src/models/url.js     CRUD operations for URLs
    seeds/sample.js       Database seeder script
  backend/
    src/server.js         Express app entry point
    src/routes/health.js  Health check endpoint
    src/middleware/        validateUrl, errorHandler
  frontend/
    src/app/              Next.js App Router pages
    tailwind.config.js    Tailwind configuration
    next.config.js        Next.js configuration
  docs/                   Project documentation
```
