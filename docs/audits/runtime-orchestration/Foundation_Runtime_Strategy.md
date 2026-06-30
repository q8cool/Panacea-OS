# Foundation Runtime Strategy

Audit date: 2026-06-30

## Decision

Option B — documented Foundation external dependency.

No minimal Foundation runtime adapter was created in Sprint 89. Creating an adapter would introduce a new runtime service, which is outside the sprint objective unless strictly required. The repository can validate Foundation-level behavior through the active services while documenting the expected external Foundation contract.

## Expected Foundation Runtime Contract

The external Foundation Platform is expected to provide:

- authentication context validation;
- tenant context validation;
- RBAC permission evaluation;
- ABAC policy evaluation;
- audit append or audit ingestion;
- health endpoint;
- readiness endpoint;
- metrics endpoint;
- service discovery metadata.

## Expected Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/foundation/live` | Foundation liveness |
| `GET /api/v1/foundation/ready` | Foundation readiness |
| `GET /api/v1/foundation/metrics` | Foundation runtime metrics |
| `POST /api/v1/foundation/auth/validate` | Validate authentication context |
| `POST /api/v1/foundation/access/evaluate` | Evaluate RBAC and ABAC |
| `POST /api/v1/foundation/audit/events` | Append audit event |
| `GET /api/v1/foundation/tenants/{tenantId}` | Resolve tenant context |

## Expected Environment Variables

| Variable | Purpose |
|---|---|
| `PANACEA_FOUNDATION_URL` | Base URL for Foundation runtime |
| `PANACEA_AUDIT_URL` | Audit service URL, defaults to Foundation URL where supported |
| `PANACEA_IDENTITY_URL` | Identity validation URL |
| `PANACEA_SECURITY_URL` | Security policy URL |
| `PANACEA_NOTIFICATION_URL` | Notification service URL |

## Local Validation Strategy

Local Sprint 89 validation substitutes the external Foundation runtime by exercising equivalent behavior inside active service middleware and persistence:

- unauthenticated request returns `401`;
- unauthorized permission set returns `403`;
- tenant mismatch returns `403`;
- protected tenant-scoped request succeeds;
- audit entry is persisted;
- event outbox entry is persisted;
- service health, readiness, metrics, and OpenAPI endpoints respond.

## Integration Status

Current active service configuration already defines Foundation-oriented dependency URLs where applicable, such as `PANACEA_FOUNDATION_URL`, `PANACEA_AUDIT_URL`, and related platform URLs. A future sprint should validate these variables against a live Foundation Platform instance when it is available.
