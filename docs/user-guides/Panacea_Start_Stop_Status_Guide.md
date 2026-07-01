# Panacea Start Stop Status Guide

Date: 2026-07-01

## Commands

| Command | Purpose |
|---|---|
| `npm run panacea:start` | Build and start PostgreSQL plus all active runtime services. |
| `npm run panacea:stop` | Stop the runtime safely while preserving the PostgreSQL volume. |
| `npm run panacea:restart` | Stop and start the runtime profile. |
| `npm run panacea:status` | Show Docker Compose status and each Panacea runtime container state. |
| `npm run panacea:health` | Validate PostgreSQL plus live, ready, metrics, and OpenAPI endpoints. |

## Normal Operator Flow

```bash
npm run panacea:start
npm run panacea:status
npm run panacea:health
```

Open the web application separately when visual review is required:

```bash
npm run web:dev
```

Then open:

```text
http://localhost:5174
```

## Safe Shutdown

```bash
npm run panacea:stop
```

The command does not remove the PostgreSQL named volume. Use explicit Docker commands only when the operator intentionally wants to reset local state.

## Failure Behavior

`npm run panacea:health` fails loudly when:

- Docker is unavailable.
- PostgreSQL is not running.
- A service container is stopped or unhealthy.
- A live, ready, metrics, or OpenAPI endpoint is unavailable.

The command does not switch the UI into demo data and does not claim live availability when services are down.

## PostgreSQL Container

The runtime PostgreSQL container is:

```text
panacea-runtime-postgres
```

Connection from the host:

```text
postgres://panacea:panacea@localhost:55433/panacea_runtime
```

This local credential is for the runtime validation profile only.
