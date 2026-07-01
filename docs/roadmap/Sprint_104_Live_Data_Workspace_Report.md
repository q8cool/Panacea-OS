# Sprint 104 Live Data Workspace Report

Date: 2026-07-01
Branch: `develop/v4.0`
Scope: Frontend-only authenticated Live Data mode for existing Panacea OS web workspaces.

## Decision

PASS — Authenticated Live Data workspace integration implemented.

No backend healthcare features, clinical logic, AI capabilities, new healthcare modules, or backend product behavior changes were added.

## Live Mode Implemented

YES.

The web app now supports:

- Foundation Login page.
- Operator JWT token mode.
- JWT structure, expiry, issuer, tenant, role, JWKS, and RS256 signature validation where browser-compatible keys are available.
- Session persistence and logout.
- Role-based workspace activation from token claims.
- Demo Role Switcher disabled in Live Mode.
- Read-only browser API client.
- Live endpoint polling.
- Audit-aware browser action display.
- Demo fallback when live APIs are unavailable.

## Foundation Authentication Status

| Item | Status |
|---|---|
| Foundation base URL | `https://foundation.utbe.ai` |
| Login UI | Implemented |
| Full provider-hosted login redirect | Not available in current provider contract |
| Operator token mode | Implemented |
| Logout | Implemented |
| Session persistence | Implemented |
| Token expiry display | Implemented |

## JWT / JWKS Validation Status

| Check | Status |
|---|---|
| JWT structure | Implemented |
| Signed algorithm required | Implemented |
| Expiry validation | Implemented |
| Issuer validation | Implemented |
| Tenant claim extraction | Implemented |
| Role claim extraction | Implemented |
| Permission claim extraction | Implemented |
| JWKS discovery | Implemented |
| RS256 WebCrypto signature verification | Implemented |
| Live JWT validation | Requires real Foundation-issued test token |

Live Foundation endpoint checks:

| Endpoint | Result |
|---|---|
| `https://foundation.utbe.ai/health` | PASS, HTTP 200 |
| `https://foundation.utbe.ai/ready` | PASS, HTTP 200 |
| `https://foundation.utbe.ai/metrics` | PASS, HTTP 200 |
| `https://foundation.utbe.ai/.well-known/jwks.json` | PASS, JWKS JSON returned |

## Role-Based Workspace Status

| Workspace | Status |
|---|---|
| Doctor / Clinician | Live Mode aware, role claim supported |
| Patient Portal | Live Mode aware, role claim supported |
| Laboratory | Live Mode aware, role claim supported |
| Radiology | Live Mode aware, role claim supported |
| Pharmacy | Live Mode aware, role claim supported |
| Administration | Live Mode aware, role claim supported |
| Operator | Live Mode aware, command/status views supported |

## API Client Status

Implemented in `apps/panacea-web/src/liveApi.ts`.

The client supports:

- Configurable API base URL.
- Bearer token.
- Tenant header.
- User header.
- Request ID.
- Correlation ID.
- Timeout.
- Safe retry for GET requests only.
- 401, 403, 404, 5xx, CORS, and network error display.
- Optional operator-only audit append test with `testOnly: true`.

## Live API Connectivity Status

The browser now selects existing read-only OpenAPI endpoints where available.

If no read-only endpoint is available for a workspace page, the UI shows:

```text
Live API unavailable
```

Demo rows are hidden in Live Mode and are never presented as real records.

## CORS Requirements

Backend services and Foundation must allow the trusted web origin:

```text
http://localhost:5174
```

Required headers:

```text
Authorization
Content-Type
X-Tenant-Id
X-User-Id
X-Request-Id
X-Correlation-Id
```

See `docs/user-guides/CORS_Configuration_Guide.md`.

## Unavailable APIs

The active v4 repository does not expose full clinical, laboratory, radiology, pharmacy, patient portal, or administration read models for every role page.

Those areas remain unavailable unless an existing authenticated read-only API is reachable through OpenAPI and CORS.

Unavailable data is explicitly displayed as unavailable. It is not invented.

## Demo Fallback Behavior

If no JWT is present, token validation fails, CORS blocks browser calls, or APIs are offline:

- The UI remains usable in Demo Mode.
- Demo labels remain visible.
- Role switching is allowed only in Demo Mode.
- Live Mode cannot be entered without a valid token.
- Workspace pages show OpenAPI/documentation source context.

## Tests Passed

| Command | Result |
|---|---|
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 117 repository tests |
| `npm run openapi` | PASS, 26 OpenAPI documents |
| `npm run web:check` | PASS, 22 UI tests |
| `npm run web:build` | PASS, production Vite build |
| `npm run quality:gate` | PASS |
| `curl -I http://localhost:5174/` | PASS, HTTP 200 |
| `curl https://foundation.utbe.ai/health` | PASS, HTTP 200 |
| `curl https://foundation.utbe.ai/ready` | PASS, HTTP 200 |
| `curl https://foundation.utbe.ai/.well-known/jwks.json` | PASS, JWKS response returned |

The production web build completed with a non-blocking Vite bundle-size warning. This should be considered in a later performance-focused UI sprint.

## Local URL

```text
http://localhost:5174/
```

Key routes:

```text
http://localhost:5174/#/auth/login
http://localhost:5174/#/command/live-status
http://localhost:5174/#/workspace/doctor/dashboard
http://localhost:5174/#/workspace/patient/dashboard
http://localhost:5174/#/workspace/laboratory/dashboard
http://localhost:5174/#/workspace/radiology/dashboard
http://localhost:5174/#/workspace/pharmacy/dashboard
http://localhost:5174/#/workspace/administrator/dashboard
```

## Next Recommended Sprint

**Sprint 105 — Live Data Hardening, Provider Login Redirect & Browser API Allowlist**

Recommended scope:

- Add provider-hosted login redirect if Foundation exposes an OAuth/OIDC authorization endpoint.
- Add production test JWT issuance workflow.
- Validate browser CORS in deployment.
- Define read-only browser endpoint allowlist.
- Add live API contract fixtures once backend read models are available.
- Keep all clinical, AI, and operational workflows advisory and governed.
