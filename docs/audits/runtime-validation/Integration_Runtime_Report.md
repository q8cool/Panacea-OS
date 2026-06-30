# Integration Runtime Report

Audit date: 2026-06-30

## Decision

PASS with one documented scope limitation.

The active services can run against shared PostgreSQL and protected API writes persist records, event outbox rows, and audit rows.

## Runtime Integration Checks

| Check | Result | Evidence |
|---|---|---|
| Shared Docker network | PASS | `panacea-sprint88-net` |
| Shared PostgreSQL database | PASS | `panacea_runtime` |
| OpenAPI availability | PASS | all 9 services returned OpenAPI |
| Protected endpoint access | PASS | authenticated POST returned `201` |
| Tenant-scoped request | PASS | persisted tenant `tenant-autonomous-intelligence` |
| Event outbox append | PASS | one event row for validation actor |
| Audit append | PASS | one audit row for validation actor |
| Unauthenticated rejection | PASS | HTTP `401` |
| Health aggregation input | PASS | all service `/live` endpoints returned success |

## Protected Runtime Write Evidence

Endpoint:

`POST /api/v4/autonomous-healthcare-intelligence/foundation/capabilities`

Headers:

- `x-tenant-id: tenant-autonomous-intelligence`
- `x-actor-id: sprint88-runtime-validator`
- `x-permissions: autonomous_intelligence.*`
- `x-country-codes: KW,SA`

Response evidence:

- Event type: `intelligence.capability.registered`
- Tenant: `tenant-autonomous-intelligence`
- Actor: `sprint88-runtime-validator`

Database evidence:

| Table | Rows for validation actor |
|---|---:|
| `autonomous_healthcare_intelligence_records` | 1 |
| `autonomous_healthcare_intelligence_events` | 1 |
| `autonomous_healthcare_intelligence_audit_entries` | 1 |

## Scope Limitation

A standalone Foundation Platform service is not present in the active service inventory. The authentication flow was therefore validated through the runtime header authenticator and protected endpoint middleware rather than a live Foundation authentication service exchange.

Recommended next item: add a full-stack runtime profile once the Foundation service is present in the active repository or available as an external test dependency.
