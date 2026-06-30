# Service Runtime Report

Audit date: 2026-06-30

## Decision

PASS.

Every active service started against live PostgreSQL, exposed runtime endpoints, served OpenAPI, emitted structured lifecycle logs, and shut down cleanly.

## Service Runtime Inventory

| Service | API base | Health | Readiness | Metrics | OpenAPI | Auth middleware | Audit integration | Event outbox |
|---|---|---|---|---|---|---|---|---|
| autonomous-healthcare-intelligence-foundation | `/api/v4/autonomous-healthcare-intelligence` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| global-ai-assurance-safety-model-risk-management-platform | `/api/v3/global-ai-assurance` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| global-compliance-automation-regulatory-intelligence-platform | `/api/v3/global-compliance` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| global-customer-success-support-service-management-platform | `/api/v3/global-customer-success` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| global-enterprise-data-privacy-consent-trust-platform | `/api/v3/global-privacy` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| global-legal-contracting-risk-governance-platform | `/api/v3/global-legal-governance` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| global-product-management-roadmap-innovation-portfolio-platform | `/api/v3/global-product-management` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| global-workforce-hr-credentialing-staff-experience-platform | `/api/v3/global-workforce` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| real-time-global-healthcare-command-intelligence-platform | `/api/v4/global-command-intelligence` | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## Runtime Behavior Verified

- Startup reads runtime configuration.
- PostgreSQL pool initializes.
- `/live` returns service status.
- `/ready` returns configured dependency readiness.
- `/metrics` returns service runtime metadata.
- `/docs/openapi.json` returns the service OpenAPI document.
- Protected write routes require authenticated tenant-scoped headers.
- Service logs emit JSON lifecycle events.
- `SIGTERM` closes the HTTP server and PostgreSQL pool.

## Remaining Limitations

- No Docker Compose file currently starts the full stack in a single command.
- Full live service-to-service calls are limited by the active repository containing only the 9 current services.
