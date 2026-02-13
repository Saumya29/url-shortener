# Agent Team Summary

How this project was built using 5 specialized Claude Code agents working in parallel.

## The 5 Agents

| Agent | Role | What they built |
|-------|------|-----------------|
| **database-engineer** | DB layer | SQLite connection, schema, URL model (CRUD), seed data |
| **backend-engineer** | API server | Express scaffold, URL routes, validation middleware, redirect endpoint |
| **ui-developer** | Frontend | Next.js scaffold, Tailwind, ShortenForm, Dashboard, UrlList, API client |
| **docs-writer** | Documentation | ARCHITECTURE.md, SETUP.md, API.md, DECISIONS.md |
| **team-lead** | Coordinator | Monitored progress, flagged blockers, reported status |

## Tmux Layout

All 5 agents ran in a single tmux session (`agents`) with separate windows. Each agent was a Claude Code subprocess that could read/write files and run commands independently.

## Execution Phases

### Phase 1 - All 5 in parallel

- `database-engineer`: schema + connection + URL model
- `backend-engineer`: scaffolded Express (app.js, server.js, health route) - couldn't wire DB routes yet
- `ui-developer`: scaffolded Next.js + Tailwind + static component shells
- `docs-writer`: started ARCHITECTURE.md and DECISIONS.md
- `team-lead`: watched task list, reported progress

### Phase 2 - After DB interfaces were ready

- `backend-engineer`: built URL CRUD routes and redirect endpoint, consuming the `database` package
- `ui-developer`: continued building components (ShortenForm, UrlList, CopyButton)
- `docs-writer`: wrote API.md

### Phase 3 - After API was ready

- `ui-developer`: wired up `lib/api.js` to talk to the backend
- `docs-writer`: wrote SETUP.md with full run instructions

### Phase 4 - Integration fixes

- `ui-developer` hit a bug where the API response shape didn't match what the frontend expected (field name mismatch on `clickCount` vs `click_count`)
- `database-engineer` refactored nanoid to Base62 counter-based short codes (inspired by Bitly's system design)

## Inter-Process Communication

The agents coordinated through:

1. **Shared task list** - A central task list that all agents could read and update. Tasks had owners and statuses (pending/in_progress/completed).

2. **Direct messages** - Agents sent messages to each other by name. For example, `team-lead` messaged `backend-engineer` when DB interfaces were ready, and `ui-developer` messaged `team-lead` when hitting the API response shape mismatch.

3. **Shared filesystem** - All agents worked in the same repo. `database/index.js` was the contract between `database-engineer` and `backend-engineer`. The API routes were the contract between `backend-engineer` and `ui-developer`.

4. **Git** - Each agent made atomic commits with conventional prefixes (`feat(db):`, `feat(api):`, `feat(ui):`, `docs:`). Since they worked on separate directories, merge conflicts were rare.

## Key Decisions Made During the Build

- **Base62 counter IDs over nanoid** - Initially used nanoid for random short codes, then refactored to Base62-encoded auto-increment IDs (Bitly's approach). Zero collisions, shorter codes, no external dependency.
- **HTTP 302 over 301** - Temporary redirects so every click hits the server for analytics.
- **SQLite over Postgres** - Zero config, single file, perfect for the scope.
- **npm workspaces over Turborepo** - No extra tooling needed.

## What Went Well

- The DB/backend/frontend/docs split mapped cleanly to separate directories, so agents rarely stepped on each other
- Phase-based parallelism meant agents could scaffold independently, then integrate
- The `team-lead` caught coordination issues early

## What Was Tricky

- The API response shape mismatch between backend and frontend (snake_case vs camelCase) - classic integration bug that only showed up when wiring them together
- Running dev servers for testing required tmux pane management (the `while true` file watcher loops got stuck at one point and needed `respawn-pane -k` to fix)
- Deploying required interactive browser auth flows for GitHub CLI, Railway, and Vercel since those can't be automated headlessly
