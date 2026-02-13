# Technical Decision Records

This document captures key architectural decisions using the ADR (Architecture Decision Record) format. Each record describes the context, the decision made, and its consequences.

---

## ADR-001: Monorepo with npm Workspaces

**Status:** Accepted

### Context

The URL shortener application has three distinct layers: a database package, a backend API, and a frontend client. These packages share configuration (ESLint, .gitignore) and the backend depends on the database package directly. We needed a strategy for organizing code and managing cross-package dependencies.

Options considered:
- **npm workspaces** -- native monorepo support built into npm
- **Turborepo** -- monorepo build system with caching and task orchestration
- **Lerna** -- established monorepo tool with versioning and publishing features

### Decision

Use npm workspaces as the monorepo management tool.

The root `package.json` declares three workspaces (`database`, `backend`, `frontend`). Cross-package dependencies use the workspace protocol (e.g., `"database": "*"` in the backend's package.json). Root-level scripts delegate to workspace-specific scripts via `--workspace` flags.

### Consequences

- **Positive:** Zero additional tooling -- works with any npm version >= 7. No extra configuration files, no CLI tools to install. Developers familiar with npm need no new knowledge.
- **Positive:** Dependency hoisting reduces disk usage and ensures consistent versions across packages.
- **Negative:** No built-in task caching or parallel task execution. Running lint or tests across all packages requires manual scripting or sequential execution.
- **Negative:** If the project grows to many packages with complex interdependencies, the lack of a dependency graph executor may become a bottleneck.

---

## ADR-002: SQLite as Database

**Status:** Accepted

### Context

The URL shortener needs persistent storage for URL mappings with fast lookups by short code. The application is expected to run as a single-instance service (development, personal use, or small-scale deployment). We needed a database that minimizes operational complexity.

Options considered:
- **SQLite + better-sqlite3** -- embedded, file-based, synchronous driver
- **PostgreSQL** -- full-featured relational database server
- **MongoDB** -- document-oriented NoSQL database

### Decision

Use SQLite via the `better-sqlite3` driver, storing data in `data/urls.db` with WAL journal mode enabled.

The database schema consists of a single `urls` table with columns: `id` (auto-increment primary key), `original_url`, `short_code` (unique, indexed), `created_at`, and `click_count`.

### Consequences

- **Positive:** Zero configuration -- no database server to install, configure, or maintain. The entire database is a single file that can be backed up with a file copy.
- **Positive:** The synchronous API of `better-sqlite3` eliminates async complexity in request handlers. Queries execute inline without callbacks or promises.
- **Positive:** WAL mode allows concurrent readers, which suits the read-heavy URL resolution pattern.
- **Negative:** SQLite supports only one writer at a time. Under heavy concurrent write load, requests would queue rather than execute in parallel.
- **Negative:** No built-in replication. Scaling to multiple application instances would require migrating to a client-server database.
- **Negative:** The `better-sqlite3` package includes a native C++ addon that must be compiled during installation, which can fail on systems without build tools.

---

## ADR-003: Nanoid for Short Codes

**Status:** Accepted

### Context

Each shortened URL needs a unique, compact identifier that appears in the shortened URL path (e.g., `/aBcD1eF`). The identifier must be URL-safe, resistant to collisions, and short enough to be practical.

Options considered:
- **nanoid** -- cryptographically random, URL-safe, configurable length
- **UUID v4** -- universally unique, 36 characters
- **hashids** -- encodes integers into short, reversible strings
- **Sequential IDs** -- auto-incrementing integers

### Decision

Use `nanoid` with a length of 7 characters. The default nanoid alphabet (`A-Za-z0-9_-`) produces URL-safe strings without encoding.

### Consequences

- **Positive:** At 7 characters with a 64-character alphabet, the ID space is 64^7 = ~4.4 billion combinations. Collision probability is negligible for any practical dataset size.
- **Positive:** Cryptographically random generation means IDs are not guessable or sequential, providing a basic level of obscurity.
- **Positive:** URL-safe by default -- no percent-encoding needed in paths.
- **Negative:** Not human-readable. Users cannot infer anything about the destination from the short code.
- **Negative:** No inherent ordering. Creation time cannot be derived from the code, though the database stores `created_at` separately.
- **Negative:** Theoretical (though astronomically unlikely) collision risk. The insert would fail due to the UNIQUE constraint, but no retry logic is currently implemented.

---

## ADR-004: Express.js for API

**Status:** Accepted

### Context

The backend needs an HTTP framework to serve the REST API for creating, listing, resolving, and deleting shortened URLs. The framework must support middleware composition, JSON parsing, and CORS.

Options considered:
- **Express.js** -- the most widely used Node.js HTTP framework
- **Fastify** -- performance-focused with built-in schema validation
- **Hono** -- ultralight, edge-compatible framework

### Decision

Use Express.js (v4) with `cors` middleware for cross-origin requests, `express.json()` for body parsing, and custom middleware for URL validation and error handling.

### Consequences

- **Positive:** The largest ecosystem of any Node.js framework. Virtually every npm middleware package supports Express. Finding solutions to problems is straightforward due to extensive community resources.
- **Positive:** Familiar to most Node.js developers. Low onboarding friction for contributors.
- **Positive:** Stable and battle-tested in production across thousands of applications.
- **Negative:** Lower raw request throughput compared to Fastify (which can be 2-3x faster in benchmarks). For a URL shortener's scale, this difference is immaterial.
- **Negative:** The middleware pattern relies on `(req, res, next)` callbacks rather than modern async patterns. Error handling requires explicit `next(err)` calls.
- **Negative:** Express v4 does not natively handle async errors in route handlers. Thrown errors in async handlers need explicit try/catch or a wrapper.

---

## ADR-005: Next.js App Router for Frontend

**Status:** Accepted

### Context

The frontend needs to provide a user interface for shortening URLs, viewing existing shortened URLs, and copying short links. It should load quickly and be straightforward to develop.

Options considered:
- **Next.js 14 (App Router)** -- React framework with SSR, file-based routing
- **Vite + React** -- lightweight bundler with fast HMR
- **Create React App** -- zero-config React starter (now deprecated)

### Decision

Use Next.js 14 with the App Router, styled with Tailwind CSS. The frontend runs on port 3000 and communicates with the backend API on port 3001.

### Consequences

- **Positive:** Server-side rendering provides fast initial page loads and improved SEO potential.
- **Positive:** File-based routing via the App Router eliminates manual route configuration. Adding pages is as simple as creating files in the `app/` directory.
- **Positive:** Built-in optimizations for code splitting, image handling, and font loading reduce the need for manual performance tuning.
- **Negative:** Next.js is a heavier framework than a pure SPA bundler like Vite. The development server and build process are more resource-intensive.
- **Negative:** The App Router introduced new paradigms (Server Components, server/client boundary) that add conceptual complexity beyond what a simple SPA requires.
- **Negative:** Tight coupling to the Next.js ecosystem. Migrating away would require rewriting routing and SSR logic.

---

## ADR-006: ESLint Flat Config

**Status:** Accepted

### Context

The project needs consistent code style and error detection across all three workspace packages. ESLint is the standard JavaScript linter, and it recently introduced a new configuration format.

Options considered:
- **Flat config** (`eslint.config.js`) -- the new ESLint configuration format
- **Legacy config** (`.eslintrc.json` / `.eslintrc.js`) -- the traditional format

### Decision

Use the ESLint flat config format with a single `eslint.config.js` at the repository root. The configuration extends `@eslint/js` recommended rules and adds project-specific rules: `no-unused-vars` (warn), `no-console` (off), `prefer-const` (error), `no-var` (error), `eqeqeq` (error), and `curly` (error, multi-line).

Ignored directories: `node_modules/`, `.next/`, `dist/`, `coverage/`.

### Consequences

- **Positive:** Flat config is the future direction of ESLint. Adopting it now avoids a future migration from the legacy format.
- **Positive:** Uses standard ES module `import` syntax. Configuration is composable through array concatenation rather than the complex cascade/extend behavior of the legacy format.
- **Positive:** A single root config file applies to all workspace packages, ensuring consistent rules project-wide.
- **Negative:** Some third-party ESLint plugins have not yet updated to support flat config, potentially limiting plugin choices.
- **Negative:** Fewer online examples and Stack Overflow answers compared to the well-established legacy format.
