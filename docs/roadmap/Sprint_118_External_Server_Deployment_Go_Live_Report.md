# Sprint 118 External Server Deployment Go-Live Report

Date: 2026-07-01
Branch: `develop/v4.0`
Scope: External server deployment execution planning, HTTPS pilot go-live preparation, route verification, rollback, and recovery readiness

## Final Decision

PASS.

Ready for controlled external pilot go-live preparation.
Not approved for real clinical production use.

## Server Deployment Readiness

Added:

- `docs/user-guides/External_Server_Deployment_Runbook.md`
- `docs/user-guides/External_Server_Prerequisite_Checklist.md`

The runbook covers server preparation, Docker, Docker Compose, repository clone, branch selection, `.env.pilot` creation, domain setup, HTTPS reverse proxy, service start, health checks, web UI startup, stop, restart, logs, backup, restore, and rollback.

## HTTPS And Domain Readiness

Sprint 117 reverse proxy and DNS artifacts remain available. The UTBE pilot domain uses the dedicated UTBE reverse proxy as the deployment baseline:

- `infra/reverse-proxy/nginx.utbe.panacea.conf`
- `infra/reverse-proxy/nginx.panacea.example.conf`
- `infra/reverse-proxy/README.md`
- `docs/user-guides/UTBE_Domain_DNS_Setup_Guide.md`
- `docs/user-guides/Domain_And_DNS_Setup_Guide.md`

Sprint 118 adds operator execution steps for applying and validating these artifacts on an external server.

## Route Verification Readiness

Added:

- `docs/operations/External_Pilot_Route_Verification_Template.md`

The route template includes every active service with public route placeholders, internal routes, live, ready, metrics, and OpenAPI URLs, expected status, actual status, and operator sign-off.

## Rollback Readiness

Added:

- `docs/user-guides/Pilot_Rollback_And_Recovery_Runbook.md`

The rollback runbook covers stopping the current deployment, restoring a previous commit or image tag, restoring the previous environment, restoring a database backup, verifying health, checking audit/event/projection consistency, incident reporting, and avoiding destructive data removal without approval.

## Backup And Restore Readiness

Existing Sprint 117 backup and database guides remain in force:

- `docs/user-guides/Pilot_Backup_Restore_Runbook.md`
- `docs/user-guides/Pilot_Database_Setup_Guide.md`

Sprint 118 links these into the go-live and rollback flow.

## Security Readiness

Added:

- `docs/user-guides/Pilot_Go_Live_Checklist.md`

The checklist covers GitHub Actions, gitleaks, environment configuration, `.env.pilot` outside Git, Docker and PostgreSQL health, live/ready/metrics/OpenAPI endpoints, HTTPS, restricted CORS, backup and restore testing, demo/live separation, no real patient data until approval, assigned operator, and approved rollback plan.

## Deployment Verification

Added:

- `npm run panacea:deployment:verify`

The command verifies required deployment documentation, pilot compose, reverse proxy examples, health matrix, environment examples, package scripts, absence of committed real `.env` files, safe environment template patterns, health commands, and backup/restore guides.

## Validation Commands

| Command | Result |
|---|---|
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 148 tests passed |
| `npm run openapi` | PASS, 26 OpenAPI documents validated |
| `npm run web:check` | PASS, 53 web tests passed |
| `npm run web:build` | PASS |
| `npm run quality:gate` | PASS |
| `npm run runtime:orchestration` | PASS |
| `npm run panacea:start` | PASS |
| `npm run panacea:health` | PASS, PostgreSQL and 9 services healthy |
| `npm run panacea:pilot:health` | PASS |
| `npm run panacea:stop` | PASS, volumes preserved |
| `npm run panacea:pilot:check` | PASS |
| `npm run panacea:pilot:config` | PASS |
| `npm run panacea:deployment:verify` | PASS |
| `gitleaks detect --source . --no-git --verbose` | LOCAL TOOL UNAVAILABLE; Docker gitleaks equivalent PASS with no leaks found |

Notes:

- The first `npm run quality:gate` attempt encountered a transient `registry.npmjs.org` DNS resolution failure during `npm audit`; a direct retry of `npm run audit` passed with 0 vulnerabilities, and the full `npm run quality:gate` retry passed.
- Docker runtime orchestration executed migrations, health checks, readiness checks, metrics checks, OpenAPI runtime checks, protected write verification, security boundary checks, structured log checks, and clean shutdown checks.
- `npm run panacea:health` returned HTTP 200 for live, ready, metrics, and OpenAPI endpoints across all 9 active services.

## Remaining Blockers For Real Clinical Production

- Real domain and TLS certificates must be provisioned and validated by the operator.
- `.env.pilot` must be created on the server from approved secret sources outside Git.
- Foundation Provider live credentials and JWKS/JWT contract must be configured for the pilot environment.
- External penetration testing is recommended before real production.
- Production monitoring and alerting must be connected to the operator's platform.
- Real patient data remains prohibited until legal, clinical, privacy, security, and operational approvals are complete.

## Final Boundary

Ready for controlled external pilot go-live preparation.
Not approved for real clinical production use.
