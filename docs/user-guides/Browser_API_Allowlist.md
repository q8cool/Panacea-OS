# Browser API Allowlist

## Purpose

Sprint 105 adds a browser API allowlist for Panacea Web Live Mode.

The allowlist is generated from the existing OpenAPI documents loaded into the web app. No endpoints are invented.

Implementation:

```text
apps/panacea-web/src/apiAllowlist.ts
```

## Classification Rules

| Classification | Browser behavior |
|---|---|
| `ALLOWED_READ` | GET endpoint may be called from browser Live Mode. |
| `ALLOWED_OPERATOR_TEST` | Operator-only test endpoint may be called with safe test payload. |
| `BLOCKED_WRITE` | Non-GET request is blocked by default. |
| `BLOCKED_CLINICAL_ACTION` | Clinical, patient, recommendation, safety, approval, or emergency action is blocked. |
| `BLOCKED_ADMIN_DANGEROUS` | Admin, policy, governance, release, or destructive action is blocked. |
| `SERVER_ONLY` | Must remain behind server-side workflow unless deployment policy explicitly exposes it. |
| `UNKNOWN` | Blocked by default. |

## Current Generated Summary

Based on 26 OpenAPI documents and 1,352 endpoints:

| Classification | Count |
|---|---:|
| `ALLOWED_READ` | 104 |
| `ALLOWED_OPERATOR_TEST` | 1 |
| `BLOCKED_WRITE` | 761 |
| `BLOCKED_CLINICAL_ACTION` | 205 |
| `BLOCKED_ADMIN_DANGEROUS` | 282 |
| `SERVER_ONLY` | 0 |
| `UNKNOWN` | 0 |

## Allowed Read Pattern

The current safe browser read set is limited to existing runtime and contract endpoints:

- `GET */live`
- `GET */ready`
- `GET */metrics`
- `GET */docs/openapi.json`

## Workspace Coverage

| Workspace | Current browser-safe read coverage |
|---|---|
| Doctor / Clinician | Runtime/OpenAPI reads from autonomous intelligence, compliance, and command contracts. |
| Patient Portal | Runtime/OpenAPI reads from privacy and consent contracts. |
| Laboratory | No current role-specific read model exposed in active OpenAPI. |
| Radiology | No current role-specific read model exposed in active OpenAPI. |
| Pharmacy | No current role-specific read model exposed in active OpenAPI. |
| Administration | Runtime/OpenAPI reads from workforce and command contracts. |
| Operator | Runtime/OpenAPI reads from command and platform contracts plus operator audit test. |

## Blocked By Default

The browser blocks:

- Unknown URLs.
- POST/PUT/PATCH/DELETE unless explicitly allowlisted.
- Clinical action endpoints.
- Recommendation approval or override endpoints.
- Patient-affecting actions.
- Dangerous administrative actions.
- Governance and release actions that require server-side workflow.

## Operator Audit Test

The only operator test endpoint is:

```text
POST https://foundation.utbe.ai/api/v1/audit-records
```

It is allowed only for operator role sessions and only with `testOnly: true` payloads.
