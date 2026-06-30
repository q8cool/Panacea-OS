# Foundation Integration Contract Report

Audit date: 2026-06-30
Decision: PASS

## Scope

The active repository treats Foundation as an external runtime dependency. Sprint 90 validates the required service-facing contract without creating a new Foundation service.

## Contract Summary

| Contract area | Requirement | Validation |
|---|---|---|
| Authentication | Incoming requests must originate from Foundation-validated identity context | Contract harness validates Bearer JWT shape and maps claims to service principal context. |
| JWT claims | Claims must include issuer, audience, subject, token id, tenant, actor, subject type, permissions, roles, country codes, issued-at, and expiry | `tests/foundation-integration/foundation-contract.test.mjs` validates required claims. |
| Tenant context | Tenant claim must propagate to service tenant context | Contract test verifies persisted tenant from JWT claim. |
| RBAC | Missing write permission must return `403` | Contract test verifies RBAC denial. |
| ABAC | Country authorization mismatch must return `403` | Contract test verifies ABAC denial. |
| Audit append | Protected writes must produce audit entries with tenant, actor, action, resource, country, and metadata | Contract test validates audit payload shape. |
| Event outbox | Protected writes must produce event envelopes with tenant, actor, aggregate, payload, and schema version | Contract test validates event payload shape. |
| Health | Service must expose unauthenticated live endpoint | Contract test verifies `/live`. |
| Readiness | Service must expose readiness endpoint | Contract test verifies `/ready`. |
| Metrics | Service must expose operational metrics endpoint | Contract test verifies `/metrics`. |
| Error model | Auth failures use `authorization_error`; validation failures use `validation_error`; unknown failures use `internal_error` | Existing server mapping and contract tests validate authorization model. |

## Required Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string for service persistence. |
| `PORT` | Yes in container runtime | Service HTTP port. |
| `PANACEA_FOUNDATION_URL` | Yes in integrated runtime | Base URL for external Foundation runtime. |
| `PANACEA_IDENTITY_URL` | Yes in integrated runtime | Identity validation endpoint base URL. |
| `PANACEA_AUDIT_URL` | Yes in integrated runtime | Audit append endpoint base URL when audit is centralized. |
| `PANACEA_SECURITY_URL` | Yes in integrated runtime | RBAC and ABAC policy endpoint base URL. |
| `PANACEA_NOTIFICATION_URL` | Optional for release evidence | Notification endpoint base URL. |

## Required Secrets

| Secret | Purpose |
|---|---|
| `FOUNDATION_JWT_ISSUER` | Accepted issuer for Foundation tokens. |
| `FOUNDATION_JWT_AUDIENCE` | Accepted audience for service calls. |
| `FOUNDATION_JWKS_URL` | Public key discovery URL for signature verification in the deployed Foundation adapter. |
| `DATABASE_URL` | Secret-backed PostgreSQL connection string. |
| `SERVICE_TO_SERVICE_CLIENT_ID` | Service identity for calls into Foundation. |
| `SERVICE_TO_SERVICE_CLIENT_SECRET` | Secret for service-to-service authentication where mTLS is not used. |

## Service Discovery Requirements

Services must resolve Foundation through environment configuration, Kubernetes service discovery, or an approved service mesh route. The expected endpoint family is:

- `GET /api/v1/foundation/live`
- `GET /api/v1/foundation/ready`
- `GET /api/v1/foundation/metrics`
- `POST /api/v1/foundation/auth/validate`
- `POST /api/v1/foundation/access/evaluate`
- `POST /api/v1/foundation/audit/events`
- `GET /api/v1/foundation/tenants/{tenantId}`

## Conclusion

The Foundation integration contract is valid for release preparation. Production release requires binding the contract to the approved external Foundation runtime and capturing remote integration evidence.
