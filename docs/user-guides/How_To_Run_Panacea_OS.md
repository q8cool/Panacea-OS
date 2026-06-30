# How To Run Panacea OS

Audience: Panacea OS operators, developers, release validators, and infrastructure engineers.

## Current Runtime Shape

Panacea OS v4.0 now includes a professional operator web platform at `apps/panacea-web`.

The visible surfaces are:

- Web operator UI for release status, service health, module visibility, OpenAPI exploration, Foundation Provider status, release evidence, legacy coverage, innovations, documentation, and demo mode.
- REST APIs exposed by active services.
- OpenAPI JSON documents.
- Docker Compose runtime for local infrastructure validation.
- PostgreSQL-backed runtime validation.
- Kubernetes manifests for deployment packaging.
- Live external Foundation Provider at `https://foundation.utbe.ai`.

The web UI is an operator and demo console. It does not perform clinical care, diagnosis, treatment, autonomous AI actions, or write patient data.

## Prerequisites

| Requirement | Recommended version | Purpose |
|---|---:|---|
| Node.js | 22 or newer | Run root validation scripts and web platform |
| npm | Bundled with Node.js | Execute workspace scripts |
| Docker Desktop or Docker Engine | Current stable | Build and run services locally |
| Docker Compose | v2 | Start the runtime profile |
| PostgreSQL client | Optional | Inspect runtime database manually |
| Git | Current stable | Source control and release evidence |
| Network access | Required for live Foundation validation | Reach `https://foundation.utbe.ai` |

## Repository Path

```sh
cd "/Users/faisalalkandari/Documents/New project"
```

## Install Web Dependencies

```sh
npm --prefix apps/panacea-web install
```

## Run The Web Platform

```sh
npm run web:dev
```

Open:

```text
http://localhost:5174
```

If port `5174` is busy, Vite will choose another available port and print it in the terminal.

## Build And Preview The Web Platform

```sh
npm run web:build
npm run web:preview
```

Open:

```text
http://localhost:4174
```

## Foundation Provider Configuration

The live Foundation Provider has been validated at:

```sh
export FOUNDATION_BASE_URL="https://foundation.utbe.ai"
export FOUNDATION_HEALTH_URL="https://foundation.utbe.ai/health"
export FOUNDATION_READY_URL="https://foundation.utbe.ai/ready"
export FOUNDATION_METRICS_URL="https://foundation.utbe.ai/metrics"
export FOUNDATION_JWKS_URL="https://foundation.utbe.ai/.well-known/jwks.json"
export FOUNDATION_JWT_ISSUER="https://foundation.utbe.ai"
export FOUNDATION_AUDIT_APPEND_URL="https://foundation.utbe.ai/api/v1/audit-records"
export FOUNDATION_POLICY_URL="https://foundation.utbe.ai/api/v1/policy/evaluate"
```

The web platform shows documented release status and can run browser-level health, readiness, metrics, and JWKS probes. Browser CORS policy can block direct probes even when release evidence is valid.

## Start Backend Runtime

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

## Active Service URLs

| Service | Health | Readiness | Metrics | OpenAPI |
|---|---|---|---|---|
| Command Intelligence | `http://localhost:18095/api/v4/global-command-intelligence/live` | `http://localhost:18095/api/v4/global-command-intelligence/ready` | `http://localhost:18095/api/v4/global-command-intelligence/metrics` | `http://localhost:18095/api/v4/global-command-intelligence/docs/openapi.json` |
| Autonomous Intelligence Foundation | `http://localhost:18094/api/v4/autonomous-healthcare-intelligence/live` | `http://localhost:18094/api/v4/autonomous-healthcare-intelligence/ready` | `http://localhost:18094/api/v4/autonomous-healthcare-intelligence/metrics` | `http://localhost:18094/api/v4/autonomous-healthcare-intelligence/docs/openapi.json` |
| AI Assurance | `http://localhost:18146/api/v3/global-ai-assurance/live` | `http://localhost:18146/api/v3/global-ai-assurance/ready` | `http://localhost:18146/api/v3/global-ai-assurance/metrics` | `http://localhost:18146/api/v3/global-ai-assurance/docs/openapi.json` |
| Compliance | `http://localhost:18145/api/v3/global-compliance/live` | `http://localhost:18145/api/v3/global-compliance/ready` | `http://localhost:18145/api/v3/global-compliance/metrics` | `http://localhost:18145/api/v3/global-compliance/docs/openapi.json` |
| Privacy | `http://localhost:18147/api/v3/global-privacy/live` | `http://localhost:18147/api/v3/global-privacy/ready` | `http://localhost:18147/api/v3/global-privacy/metrics` | `http://localhost:18147/api/v3/global-privacy/docs/openapi.json` |

The full service inventory appears in the web UI under **System Health**.

## Verify Runtime Status

```sh
npm run check
npm run test:run
npm run openapi
npm run web:check
npm run web:build
```

For live infrastructure validation:

```sh
npm run runtime:orchestration
npm run runtime:disaster-recovery
```

## View Logs

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml logs -f
```

For one service:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml logs -f real-time-global-healthcare-command-intelligence-platform
```

## Stop The System

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml down
```

Stop the web dev server with `Ctrl+C`.

## What To Open First

1. `http://localhost:5174`
2. **Executive Overview**
3. **System Health**
4. **API Explorer**
5. **Foundation Provider**
6. **Release Evidence**

This is currently both a backend platform and a professional operator web application. Role-specific clinician, nurse, patient, pharmacy, laboratory, finance, and compliance workspaces are not separate full workflow applications in this sprint.
