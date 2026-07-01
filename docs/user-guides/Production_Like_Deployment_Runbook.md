# Production Like Deployment Runbook

Date: 2026-07-01
Scope: Panacea OS v4.0 controlled pilot runtime

## Purpose

This runbook explains how an operator starts, validates, observes, and stops the production-like Panacea OS runtime. It does not add clinical behavior or AI capability. The goal is to prove that the active services run against PostgreSQL, expose contracted runtime endpoints, and fail visibly when infrastructure is unavailable.

## Prerequisites

- Docker Desktop running and authenticated for base image pulls.
- Node.js and npm available in the workspace shell.
- Repository branch: `develop/v4.0`.
- Optional Panacea Web UI: `npm run web:dev`.

## Start

```bash
npm run panacea:start
```

This command runs:

```bash
docker compose -f infra/docker-compose/runtime/docker-compose.yml up -d --build
```

It starts PostgreSQL plus all nine active runtime services.

## Status

```bash
npm run panacea:status
```

The command prints Docker Compose status and an explicit status line for PostgreSQL and every active service container.

## Health

```bash
npm run panacea:health
```

The command checks:

- PostgreSQL readiness with `pg_isready`.
- Service container health.
- `/live`.
- `/ready`.
- `/metrics`.
- `/docs/openapi.json`.

Failures are not hidden. If a service is stopped, the command tells the operator to run `npm run panacea:start`.

## Restart

```bash
npm run panacea:restart
```

This stops the runtime without deleting the PostgreSQL volume, then rebuilds and starts the runtime profile.

## Stop

```bash
npm run panacea:stop
```

This runs Docker Compose down without `-v`, preserving the PostgreSQL named volume by default.

## Service Route Matrix

| Service | Port | Live | Ready | Metrics | OpenAPI |
|---|---:|---|---|---|---|
| Autonomous Healthcare Intelligence Foundation | 18094 | `/api/v4/autonomous-healthcare-intelligence/live` | `/api/v4/autonomous-healthcare-intelligence/ready` | `/api/v4/autonomous-healthcare-intelligence/metrics` | `/api/v4/autonomous-healthcare-intelligence/docs/openapi.json` |
| Global Command Intelligence | 18095 | `/api/v4/global-command-intelligence/live` | `/api/v4/global-command-intelligence/ready` | `/api/v4/global-command-intelligence/metrics` | `/api/v4/global-command-intelligence/docs/openapi.json` |
| Global Workforce | 18141 | `/api/v3/global-workforce/live` | `/api/v3/global-workforce/ready` | `/api/v3/global-workforce/metrics` | `/api/v3/global-workforce/docs/openapi.json` |
| Global Legal Governance | 18142 | `/api/v3/global-legal-governance/live` | `/api/v3/global-legal-governance/ready` | `/api/v3/global-legal-governance/metrics` | `/api/v3/global-legal-governance/docs/openapi.json` |
| Global Customer Success | 18143 | `/api/v3/global-customer-success/live` | `/api/v3/global-customer-success/ready` | `/api/v3/global-customer-success/metrics` | `/api/v3/global-customer-success/docs/openapi.json` |
| Global Product Management | 18144 | `/api/v3/global-product-management/live` | `/api/v3/global-product-management/ready` | `/api/v3/global-product-management/metrics` | `/api/v3/global-product-management/docs/openapi.json` |
| Global Compliance | 18145 | `/api/v3/global-compliance/live` | `/api/v3/global-compliance/ready` | `/api/v3/global-compliance/metrics` | `/api/v3/global-compliance/docs/openapi.json` |
| Global AI Assurance | 18146 | `/api/v3/global-ai-assurance/live` | `/api/v3/global-ai-assurance/ready` | `/api/v3/global-ai-assurance/metrics` | `/api/v3/global-ai-assurance/docs/openapi.json` |
| Global Privacy, Consent, Trust | 18147 | `/api/v3/global-privacy/live` | `/api/v3/global-privacy/ready` | `/api/v3/global-privacy/metrics` | `/api/v3/global-privacy/docs/openapi.json` |

## Manual Verification

```bash
docker ps
curl http://localhost:18094/api/v4/autonomous-healthcare-intelligence/live
curl http://localhost:18095/api/v4/global-command-intelligence/live
curl http://localhost:18141/api/v3/global-workforce/live
curl http://localhost:18142/api/v3/global-legal-governance/live
curl http://localhost:18143/api/v3/global-customer-success/live
curl http://localhost:18144/api/v3/global-product-management/live
curl http://localhost:18145/api/v3/global-compliance/live
curl http://localhost:18146/api/v3/global-ai-assurance/live
curl http://localhost:18147/api/v3/global-privacy/live
```

Use `GET` requests. The runtime contracts document `GET`; `HEAD` is not the required operator validation method.

## Logs

```bash
docker compose -f infra/docker-compose/runtime/docker-compose.yml logs -f
```

Service lifecycle logs are JSON structured and are validated by `npm run runtime:orchestration`.

## Pilot Decision Boundary

Passing this runbook means the system is ready for a controlled production-like pilot. It does not mean unrestricted production go-live, live clinical use, or autonomous clinical operation.
