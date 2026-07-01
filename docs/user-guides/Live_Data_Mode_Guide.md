# Live Data Mode Guide

## Purpose

Live Data Mode connects `apps/panacea-web` to the Foundation Provider and existing read-only backend APIs from the browser.

It does not add backend features, clinical logic, diagnosis, treatment recommendations, or autonomous AI behavior.

## Start The Web App

```sh
cd "/Users/faisalalkandari/Documents/New project"
npm run web:dev
```

Open:

```text
http://localhost:5174
```

## Live Mode Configuration

The web app reads configuration from `window.PANACEA_WEB_CONFIG` or matching Vite environment variables.

Required values:

```text
FOUNDATION_BASE_URL=https://foundation.utbe.ai
FOUNDATION_HEALTH_URL=https://foundation.utbe.ai/health
FOUNDATION_READY_URL=https://foundation.utbe.ai/ready
FOUNDATION_METRICS_URL=https://foundation.utbe.ai/metrics
FOUNDATION_JWKS_URL=https://foundation.utbe.ai/.well-known/jwks.json
FOUNDATION_JWT_ISSUER=https://foundation.utbe.ai
FOUNDATION_AUDIT_APPEND_URL=https://foundation.utbe.ai/api/v1/audit-records
FOUNDATION_POLICY_URL=https://foundation.utbe.ai/api/v1/policy/evaluate
PANACEA_API_BASE_URL=http://localhost
PANACEA_WEB_MODE=demo
PANACEA_DEFAULT_TENANT=demo-tenant
PANACEA_ENABLE_DEMO_MODE=true
PANACEA_REQUEST_TIMEOUT_MS=5000
```

For Vite builds, use `VITE_` prefixes where build-time environment injection is required.

## Authentication

Open:

```text
http://localhost:5174/#/auth/login
```

Paste a Foundation-issued JWT in Operator Token Mode.

The browser validates:

- JWT structure.
- Signed algorithm requirement.
- Expiry.
- Issuer.
- Tenant claim.
- Supported role claim.
- JWKS discovery.
- RS256 signature where the published JWKS key supports browser verification.

If validation fails, Live Mode is not enabled.

## Provider Login Discovery

Sprint 105 checks Foundation login discovery endpoints:

- `/.well-known/openid-configuration`
- `/oauth/authorize`
- `/authorize`
- `/api/v1/auth/login`
- `/api/v1/auth/token`
- `/api/v1/auth/refresh`

Current result: provider-hosted login is not available, so Operator JWT Mode remains required.

See `Foundation_Provider_Login_Discovery.md`.

## Browser API Allowlist

Live Mode browser requests now require an allowlist decision.

Allowed by default:

- Existing OpenAPI `GET */live`
- Existing OpenAPI `GET */ready`
- Existing OpenAPI `GET */metrics`
- Existing OpenAPI `GET */docs/openapi.json`

Blocked by default:

- Unknown endpoints.
- Clinical action endpoints.
- Dangerous administrative endpoints.
- Non-GET requests unless explicitly allowlisted.

See `Browser_API_Allowlist.md`.

## Live Workspace Behavior

Authenticated workspaces show:

- Live Mode label.
- Authenticated user.
- Tenant.
- Role from token claims.
- Token expiry.
- Read-only API candidate from OpenAPI.
- Request ID.
- Endpoint status.
- Audit-aware browser action metadata.

Demo worklist rows are hidden in Live Mode unless an authenticated read-only API returns real data.

## Fallback Behavior

If APIs are unavailable, CORS blocks access, or no JWT is available:

- The UI stays usable in Demo Mode.
- Demo data remains clearly labeled.
- Live panels show `Live API unavailable`.
- Blocked browser requests show the allowlist classification and reason.
- OpenAPI source information remains visible.

Demo role switching never grants production access.
