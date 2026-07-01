# Live Workspace Integration Guide

## Purpose

Sprint 111 connects the Panacea web workspaces to existing live runtime surfaces and versioned backend read-model APIs where safe read-only browser access is supported.

## How To Run

Start the UI:

```sh
npm run web:dev
```

Open:

```text
http://localhost:5174
```

Start the runtime service stack for backend validation:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

Stop it:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml down -v --remove-orphans
```

## Live Mode

Open:

```text
http://localhost:5174/#/auth/login
```

Use Foundation Provider Login only when the deployed Foundation provider exposes login/token endpoints. Otherwise use Operator JWT mode with a Foundation-issued JWT.

## Workspace Status Labels

| Label | Meaning |
| --- | --- |
| `LIVE CONNECTED` | A page-level read API returned live data. |
| `LIVE READ MODEL` | The page is rendering a backend read-model response with `demoData: false`. |
| `LIVE PARTIAL` | Runtime/OpenAPI status is reachable, but the page request has not completed yet. |
| `LIVE API UNAVAILABLE` | No matching safe read endpoint exists or the endpoint is unavailable. |
| `BLOCKED BY AUTH` | The endpoint returned 401/403 or token claims are insufficient. |
| `BLOCKED BY CORS` | Browser transport was blocked by CORS or fetch failed before a response. |
| `DEMO MODE` | Demo-only UI data is visible and clearly marked. |
| `DOCUMENTATION ONLY` | The page is backed by docs/release evidence rather than live backend records. |

## Important Boundary

Live Mode does not invent clinical records. If an API does not exist, the UI shows unavailable status and keeps demo data separate.

If an API exists but returns zero records, the UI displays an authenticated empty state rather than falling back to demo rows.
