# URL Shortener

A full-stack URL shortener built as a monorepo with npm workspaces. Shorten long URLs into compact, shareable links with click tracking and a dashboard.

**Live Demo:** https://url-shortener-smoky-six.vercel.app

## Features

- Shorten any URL into a compact Base62-encoded link
- One-click copy to clipboard
- Dashboard with all shortened URLs and click counts
- Delete URLs you no longer need
- HTTP 302 redirects for accurate click analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Express.js (ES modules) |
| Database | SQLite via better-sqlite3 |
| Monorepo | npm workspaces |
| Linting | ESLint flat config |

## Quick Start

```bash
# Install all dependencies
npm install

# Start the backend (port 3001)
npm run dev:backend

# Start the frontend (port 3000) - in a separate terminal
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

```
├── database/         SQLite connection, schema, and URL model
├── backend/          Express API server
├── frontend/         Next.js web client
└── docs/             Architecture, API reference, and decisions
```

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/urls | Create a short URL |
| GET | /api/urls | List all URLs |
| GET | /api/urls/:shortCode | Get URL details |
| DELETE | /api/urls/:shortCode | Delete a URL |
| GET | /r/:shortCode | Redirect to original URL |
| GET | /api/health | Health check |

See [docs/API.md](docs/API.md) for full endpoint documentation with examples.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - tech stack choices and tradeoffs
- [Setup Guide](docs/SETUP.md) - installation, running, and troubleshooting
- [API Reference](docs/API.md) - endpoint documentation
- [Decisions](docs/DECISIONS.md) - technical decision records

## Design

The short code generation follows the counter-based approach used by production URL shorteners like Bitly: each URL gets an auto-incremented integer ID from SQLite, which is then Base62-encoded into a compact string. This guarantees zero collisions without any external dependencies.

## License

MIT
