# Tenant Token Propagation Report

Sprint: 108
Date: 2026-07-01

## Decision

PASS for browser request construction and existing backend security validation.

## Browser Headers Sent By Live Mode

The web API client sends:

| Header | Source |
| --- | --- |
| `Authorization: Bearer <token>` | Foundation provider login or operator JWT session |
| `X-Tenant-Id` | Validated tenant claim |
| `X-User-Id` | Validated subject claim |
| `X-Actor-Id` | Validated subject claim, added as backend header-auth compatibility alias |
| `X-Request-Id` | Browser-generated request ID |
| `X-Correlation-Id` | Same generated correlation ID |

## Backend Behavior Validated

| Scenario | Result |
| --- | --- |
| Missing authentication | HTTP 401 |
| Unauthorized permission | HTTP 403 |
| Tenant mismatch | HTTP 403 |
| Valid tenant-scoped protected validation write | HTTP 201 |
| Event outbox write | PASS |
| Audit write | PASS |

## Current Limitation

There are no role-specific protected GET read-model endpoints for patient, lab, radiology, pharmacy, or admin records in the active OpenAPI contracts. Therefore tenant-scoped record reads cannot be proven for those role pages yet. Runtime and OpenAPI reads are available and CORS-enabled.
