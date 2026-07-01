# API Allowlist Update Report

Sprint: 108
Date: 2026-07-01

## Decision

PASS.

No new domain endpoint was added to the browser allowlist because the active OpenAPI contracts do not expose page-level record GET read models for the role workspaces. The existing allowlist remains intentionally narrow and safe.

## Current Allowed Browser Reads

- `GET */live`
- `GET */ready`
- `GET */metrics`
- `GET */docs/openapi.json`

## Operator Test Exception

The only non-GET browser exception remains:

```text
POST https://foundation.utbe.ai/api/v1/audit-records
```

It remains restricted to operator role sessions and safe `testOnly: true` payloads.

## Blocked Categories

- Unknown endpoints.
- Writes by default.
- Clinical, patient-affecting, recommendation, safety, approval, override, and emergency action endpoints.
- Dangerous administrative, policy, governance, release, patch, hotfix, remove, or delete endpoints.

## Sprint 108 Change

The browser request client now also sends `X-Actor-Id` as a compatibility alias for existing backend header-auth validation. This does not change the allowlist and does not add write capability.
