# Foundation External Dependency Contract

Audit date: 2026-06-30
Dependency status: External

## Purpose

This contract defines how Panacea service runtimes depend on the external Foundation Platform for identity, access policy, tenant context, audit, and operational health integration.

## Identity Contract

Foundation must issue or validate JWTs with these claims:

| Claim | Type | Required | Meaning |
|---|---|---|---|
| `iss` | string | Yes | Foundation issuer. |
| `aud` | string | Yes | Service audience. |
| `sub` | string | Yes | Subject identifier. |
| `jti` | string | Yes | Token identifier. |
| `tenant_id` | string | Yes | Tenant scope. |
| `actor_id` | string | Yes | Actor used for audit. |
| `subject_type` | string | Yes | User, service, or automation subject. |
| `permissions` | string array | Yes | RBAC permission grants. |
| `roles` | string array | Yes | Role names. |
| `country_codes` | string array | Yes | ABAC country scope. |
| `iat` | number | Yes | Issued at. |
| `exp` | number | Yes | Expiration. |

## Downstream Header Contract

When Foundation terminates authentication at an edge gateway, downstream calls must propagate:

| Header | Required | Source |
|---|---|---|
| `authorization` | Yes when JWT is passed through | Bearer JWT. |
| `x-tenant-id` | Yes for header propagation mode | `tenant_id` claim. |
| `x-actor-id` | Yes for header propagation mode | `actor_id` claim. |
| `x-subject-type` | Yes for header propagation mode | `subject_type` claim. |
| `x-permissions` | Yes for header propagation mode | Comma-separated permissions. |
| `x-roles` | Yes for header propagation mode | Comma-separated roles. |
| `x-country-codes` | Yes for header propagation mode | Comma-separated country codes. |

## Audit Contract

Audit entries must include:

- tenant id;
- actor id;
- action;
- resource type;
- resource id;
- country code;
- occurred timestamp;
- metadata.

## Event Contract

Event outbox envelopes must include:

- tenant id;
- event type;
- aggregate id;
- aggregate type;
- actor id;
- occurred timestamp;
- payload;
- schema version.

## Operational Contract

Foundation must expose health, readiness, and metrics endpoints. Dependent services must expose matching endpoints for orchestration visibility.

## Release Decision

The external dependency contract is acceptable for release preparation. Remote runtime validation against the real Foundation endpoint remains required before production approval.
