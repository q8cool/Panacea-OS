# Sprint 111 Live Read Model Report

Status: COMPLETED WITH RUNTIME INFRASTRUCTURE CONDITION

Branch: `develop/v4.0`

## Objective

Enable authenticated live read-model APIs for Panacea OS role workspaces while preserving the strict demo-to-production boundary.

No new clinical features, autonomous diagnosis, autonomous treatment, AI capabilities, or unsafe write workflows were added.

## Implemented

| Area | Status | Evidence |
|---|---:|---|
| Live read-model API | YES | `GET /api/v4/global-command-intelligence/read-models/...` |
| PostgreSQL migration | YES | `002_live_read_models.sql` |
| OpenAPI contracts | YES | Read-model paths and schemas generated |
| Tenant isolation | YES | Read models filter by `tenant_id` |
| Role and permission checks | YES | Workspace roles plus `global_command_intelligence.read_models.read` |
| Audit logging | YES | Every read-model request appends `global_command_intelligence.read_model.read` |
| Event outbox table | YES | `global_command_intelligence_read_model_events` |
| Browser allowlist | YES | Versioned GET read-model endpoints allowed; writes remain blocked |
| Web Live Mode rendering | YES | Live rows, authenticated empty states, auth/CORS errors |
| Demo/live separation | YES | Live Mode requires `demoData: false`; demo rows are not mixed |
| Documentation | YES | Live read-model and role-specific guides generated |

## Role Workspace Coverage

| Workspace | Live read-model coverage |
|---|---|
| Doctor / Clinician | Patients, profile, summary, timeline, encounters, allergies, conditions, medications, vitals, notes, orders, labs, radiology summaries, pharmacy review, alerts, tasks, care team |
| Patient Portal | Profile, appointments, visits, medications, allergies, labs, radiology, documents, invoices, messages, care instructions |
| Laboratory | Dashboard, orders, specimens, specimen detail, results, critical results, quality control, reports |
| Radiology | Dashboard, orders, studies, study detail, DICOM metadata, PACS status, reporting worklist, reports, critical findings, timeline |
| Pharmacy | Dashboard, medications, prescriptions, prescription detail, dispensing, inventory, batches, expiration warnings, safety alerts, controlled medications |
| Administration | Users, roles, permissions, tenants, organizations, facilities, departments, configuration, audit logs, security, privacy, compliance, system health, release evidence |

## Validation Summary

| Command | Result |
|---|---|
| `npm test` in real-time command service | PASS, 15 tests |
| `npm run web:check` | PASS, 45 tests |
| `npm run typecheck` | PASS |
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 134 tests |
| `npm run openapi` | PASS, 26 OpenAPI documents |
| `npm run audit` | PASS, 0 moderate vulnerabilities |
| `npm run web:build` | PASS |
| `npm run quality:gate` | PASS |
| `npm run runtime:orchestration` | BLOCKED BY LOCAL DOCKER IMAGE ACCESS |
| `curl -I http://localhost:5174/` | PASS after starting web dev server, HTTP 200 |
| `curl https://foundation.utbe.ai/health` | PASS, `{"status":"ok","service":"foundation-provider"}` |
| `curl https://foundation.utbe.ai/ready` | PASS, `{"status":"ready","service":"foundation-provider"}` |
| `curl https://foundation.utbe.ai/.well-known/jwks.json` | PASS, JWKS returned |

## Runtime Orchestration Condition

`npm run runtime:orchestration` did not reach service startup. Docker Compose failed while resolving the base image metadata for `node:22-bookworm-slim`:

```text
DeadlineExceeded: context deadline exceeded
target global-compliance-automation-regulatory-intelligence-platform: failed to solve: DeadlineExceeded: context deadline exceeded
```

An explicit `docker pull node:22-bookworm-slim` attempt did not complete and was interrupted after repeated no-output waits. The interrupted pull ended with:

```text
error getting credentials - err: signal: interrupt
```

Additional evidence:

```text
docker image inspect node:22-bookworm-slim
Error response from daemon: No such image: node:22-bookworm-slim

docker version
29.5.3 / 29.5.3
```

This is a local Docker Desktop / Docker Hub credential or image metadata access blocker. The implementation, contracts, tests, OpenAPI, build, audit, web build, and quality gate passed.

Mitigation:

1. Fix Docker Desktop credential helper or Docker Hub access on the operator machine.
2. Run `docker pull node:22-bookworm-slim`.
3. Rerun `npm run runtime:orchestration`.

## Remaining Boundaries

- Live read-model rows must be populated by approved upstream systems or future governed ingestion workflows.
- No browser write workflows were added.
- No clinical diagnosis or treatment behavior was added.
- No medication safety engine behavior was added.
- No DICOM image viewer was added.
- No production patient data was introduced.

## Operator Test Path

1. Start runtime:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

2. Start web UI:

```sh
npm run web:dev
```

3. Open:

```text
http://localhost:5174/#/auth/login
```

4. Authenticate with a Foundation-issued JWT.

5. Open a role workspace and verify that Live Mode shows `LIVE READ MODEL`, an authenticated empty state, or a clear auth/CORS/service error.

## Final Recommendation

Proceed to a controlled read-model population sprint or operator sample-data sprint after the local Docker image access condition is resolved or formally accepted. Keep the next sprint read-only unless product governance explicitly approves write workflows.
