# Sprint 105 Live Data Hardening Report

Date: 2026-07-01
Branch: `develop/v4.0`
Scope: Frontend-only Live Data hardening, Foundation login discovery, browser API allowlist, CORS guidance, and validation evidence.

## Decision

PASS — Live Data browser integration hardened.

No backend healthcare features, clinical logic, AI capabilities, new healthcare modules, or backend product behavior changes were added.

## Login Discovery Status

Foundation Provider inspected:

```text
https://foundation.utbe.ai
```

| Endpoint | Result |
|---|---|
| `/.well-known/openid-configuration` | HTTP 404 |
| `/oauth/authorize` | HTTP 404 |
| `/authorize` | HTTP 404 |
| `/api/v1/auth/login` | HTTP 404 |
| `/api/v1/auth/token` | HTTP 404 |
| `/api/v1/auth/refresh` | HTTP 404 |

Provider-hosted login available: NO.

Operator JWT Mode remains the safe supported login method until Foundation exposes OAuth/OIDC or token issuance endpoints.

## Provider-Hosted Login Available

NO.

The web UI now includes provider login discovery support and displays operator action required when login endpoints are unavailable.

## Test JWT Workflow Status

Generated: YES.

Document:

```text
docs/user-guides/Foundation_Test_JWT_Workflow.md
```

Status: OPERATOR ACTION REQUIRED until Foundation can issue short-lived RS256 test JWTs signed by a key published in JWKS.

## Allowlist Generated

YES.

Implementation:

```text
apps/panacea-web/src/apiAllowlist.ts
```

Generated from existing OpenAPI documents only.

Current summary:

| Classification | Count |
|---|---:|
| `ALLOWED_READ` | 104 |
| `ALLOWED_OPERATOR_TEST` | 1 |
| `BLOCKED_WRITE` | 761 |
| `BLOCKED_CLINICAL_ACTION` | 205 |
| `BLOCKED_ADMIN_DANGEROUS` | 282 |
| `SERVER_ONLY` | 0 |
| `UNKNOWN` | 0 |

## Allowlist Enforced

YES.

The frontend API client blocks:

- Unknown endpoints.
- Non-GET endpoints unless explicitly allowlisted.
- Clinical action endpoints.
- Dangerous administrative endpoints.
- Operator audit append unless the session role is `operator`.

Blocked requests display classification and reason in the UI.

## CORS Guide Generated

YES.

Documents:

```text
docs/user-guides/CORS_Configuration_Guide.md
docs/user-guides/Browser_CORS_Deployment_Validation.md
```

## Tests Passed

| Command | Result |
|---|---|
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 117 repository tests |
| `npm run openapi` | PASS, 26 OpenAPI documents |
| `npm run web:check` | PASS, 28 UI tests |
| `npm run web:build` | PASS, production Vite build |
| `npm run quality:gate` | PASS |
| `curl -I http://localhost:5174/` | PASS, HTTP 200 |
| `curl -I https://foundation.utbe.ai/health` | DNS resolution timed out during final validation |
| `curl -I https://foundation.utbe.ai/ready` | DNS resolution timed out during final validation |
| `curl -I https://foundation.utbe.ai/.well-known/jwks.json` | DNS resolution timed out during final validation |
| `curl --resolve foundation.utbe.ai:443:162.0.228.10 -I ...` | HTTP 404 for HEAD; provider appears to require GET |
| `curl --resolve foundation.utbe.ai:443:162.0.228.10 https://foundation.utbe.ai/health` | PASS, HTTP 200 |
| `curl --resolve foundation.utbe.ai:443:162.0.228.10 https://foundation.utbe.ai/ready` | PASS, HTTP 200 |
| `curl --resolve foundation.utbe.ai:443:162.0.228.10 https://foundation.utbe.ai/.well-known/jwks.json` | PASS, HTTP 200 |

The production web build completed with a non-blocking Vite bundle-size warning.

Foundation note: provider GET endpoints are live, but HEAD requests return 404 when routed to the known server IP. The browser uses GET for discovery and runtime probes.

## What Is Now Production-Hardened

- Provider login discovery checks.
- Operator JWT fallback with no simulated login.
- JWT/JWKS validation remains required for Live Mode.
- Browser API allowlist generated from OpenAPI.
- Unknown browser API calls blocked by default.
- Dangerous write and clinical action endpoints blocked in browser.
- Operator audit test restricted to operator role sessions.
- CORS deployment validation guide created.
- UI shows provider login availability, JWT/JWKS status, allowlist status, CORS readiness, and blocked request reasons.

## What Still Requires Backend / Foundation Support

- Provider-hosted OAuth/OIDC login.
- Foundation token issuance endpoint.
- Refresh token endpoint.
- Production test JWT issuance workflow.
- CORS headers on all live deployment endpoints.
- Role-specific clinical, laboratory, radiology, pharmacy, patient portal, and administration read-model APIs.

## Next Recommended Sprint

**Sprint 106 — Foundation Auth Endpoint Enablement & Production CORS Verification**

Recommended scope:

- Deploy Foundation OAuth/OIDC discovery and token endpoints.
- Create short-lived test JWT issuance workflow.
- Verify browser CORS with deployed services.
- Add production read-model API contracts before expanding live workspace data.
- Keep all clinical, AI, and operational actions governed and non-autonomous.
