# Pilot Readiness Runbook

Date: 2026-07-01
Scope: Sprint 115 controlled pilot readiness

## Decision Model

Panacea OS is ready for controlled pilot validation when all of these pass:

- Runtime services start through Docker Compose.
- PostgreSQL is healthy.
- Migrations execute and are idempotent.
- Live workflow API accepts governed transactions.
- Events, audit entries, projections, and read models are created.
- Role-scoped workspaces show live read-model evidence.
- Unauthorized, unauthenticated, wrong-role, and wrong-tenant requests fail.
- Demo Mode remains visibly separated from Live Mode.

This runbook does not declare unrestricted production go-live.

## Preflight

```bash
git branch --show-current
docker ps
npm run check
npm run build
npm run test:run
npm run openapi
npm run web:check
npm run web:build
npm run quality:gate
```

## Runtime Proof

Run:

```bash
npm run runtime:orchestration
```

This command starts a clean runtime, applies migrations, validates live endpoints, proves protected write/audit/event behavior, and then shuts down runtime services.

To keep services running for pilot use:

```bash
docker compose -f infra/docker-compose/runtime/docker-compose.yml up -d --build
```

To stop:

```bash
docker compose -f infra/docker-compose/runtime/docker-compose.yml down
```

## Pilot Data Boundary

Use deterministic pilot IDs only:

```text
tenant-global-command
patient-pilot-115
doctor-pilot-115
operator-pilot-115
laboratory-pilot-115
radiology-pilot-115
pharmacy-pilot-115
administrator-pilot-115
```

Do not enter PHI into pilot payloads.

## Operator Checklist

| Step | Evidence |
|---|---|
| Runtime endpoints respond | `curl` returns HTTP 200 for live endpoints |
| Write workflow accepted | POST returns HTTP 201 |
| Event created | `/write-workflows/events` returns the event |
| Projection created | `/write-workflows/projections` returns projected rows |
| Read model visible | role workspace endpoint returns `demoData: false` |
| Audit visible | transaction review and repository audit evidence exist |
| Unauthorized blocked | wrong role returns HTTP 403 |
| Tenant isolation enforced | wrong tenant returns HTTP 403 or no rows |

## Known Pilot Limits

- The web UI validates live read and write workflow visibility through rendered tests and API calls; full browser automation with a deployed identity provider remains an operator environment task.
- The command intelligence service is the active transactional pilot service. Some historical hospital modules are represented through read-model projections rather than separate active services.
- `npm run runtime:orchestration` intentionally shuts services down after proof. Use Docker Compose directly when the operator wants the system to stay running.

## Exit Criteria

Pilot readiness is acceptable when all required commands pass and the Sprint 115 report records no blocking gaps.

