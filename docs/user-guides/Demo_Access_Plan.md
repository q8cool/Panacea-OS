# Demo Access Plan

Audit date: 2026-06-30
Sprint context: Sprint 101 web platform

## Goal

Let the operator see and use Panacea OS quickly without adding backend features or changing clinical behavior.

## Fastest Demo Path

1. Start the web app:

```sh
npm run web:dev
```

2. Open:

```text
http://localhost:5174
```

3. Visit these pages:

- **Executive Overview** for release state, service count, OpenAPI count, tests, and Foundation status.
- **System Health** for local health, readiness, metrics, and OpenAPI URLs.
- **API Explorer** for endpoint search and safe demo curl commands.
- **Foundation Provider** for live provider URLs and browser probes.
- **Release Evidence** for final release and validation documents.
- **Legacy Coverage** for preserved, upgraded, replaced, and missing legacy capability areas.
- **New Innovations** for v4 additions.

## Backend Runtime Demo

Start the backend runtime:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

Then open the web app **System Health** page and use the listed URLs.

## OpenAPI Demo

Open the **API Explorer** page or use:

```text
http://localhost:18095/api/v4/global-command-intelligence/docs/openapi.json
http://localhost:18094/api/v4/autonomous-healthcare-intelligence/docs/openapi.json
http://localhost:18146/api/v3/global-ai-assurance/docs/openapi.json
http://localhost:18145/api/v3/global-compliance/docs/openapi.json
http://localhost:18147/api/v3/global-privacy/docs/openapi.json
```

The UI can search across all bundled OpenAPI documents and generate curl examples with tenant and test headers.

## Foundation Provider Demo

Open:

```text
https://foundation.utbe.ai/health
https://foundation.utbe.ai/ready
https://foundation.utbe.ai/metrics
https://foundation.utbe.ai/.well-known/jwks.json
```

Or use the **Foundation Provider** page in the web app.

## Demo Boundaries

This demo is safe because it is:

- Operator-facing.
- Evidence and contract driven.
- Tenant-aware for API examples.
- Free of PHI.
- Not a clinical care workflow.
- Not an autonomous AI workflow.

## Recommended Next Demo Improvement

Add authenticated role workspaces in a future sprint:

- Admin dashboard.
- Clinician read-only dashboard.
- Compliance officer dashboard.
- AI governance officer dashboard.
- Developer API console.

Those should be built on existing approved APIs and Foundation authentication.
