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

Use Provider Login when Foundation auth endpoints are available, or paste a Foundation-issued JWT in Operator Token Mode.

Provider Login validates:

- Login endpoint availability.
- Username, password, and tenant response from Foundation.
- RS256 access-token signature through JWKS.
- Token expiry, issuer, tenant, role, and permissions.
- Refresh-token rotation.
- Logout through the provider when supported.

Operator JWT Mode validates:

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

Sprint 106 checks Foundation login discovery endpoints:

- `/.well-known/openid-configuration`
- `/api/v1/auth/login`
- `/api/v1/auth/token`
- `/api/v1/auth/refresh`
- `/api/v1/auth/logout`
- `/api/v1/auth/me`

Current behavior: Provider Login is enabled only when login/token endpoints are reachable from the browser. Otherwise Operator JWT Mode remains available.

See `Foundation_Provider_Login_Discovery.md`.

## Browser API Allowlist

Live Mode browser requests now require an allowlist decision.

Allowed by default:

- Existing OpenAPI `GET */live`
- Existing OpenAPI `GET */ready`
- Existing OpenAPI `GET */metrics`
- Existing OpenAPI `GET */docs/openapi.json`
- Existing OpenAPI `GET */read-models/...` endpoints for authenticated role workspaces.

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

Sprint 111 workspace pages now map to live read-model endpoints. The UI displays backend rows only when the response contains `source: live-read-model` and `demoData: false`.

## Fallback Behavior

If APIs are unavailable, CORS blocks access, or no JWT is available:

- The UI stays usable in Demo Mode.
- Demo data remains clearly labeled.
- Live panels show `Live API unavailable`.
- Live read-model panels show an authenticated empty state when the backend returns zero rows.
- Blocked browser requests show the allowlist classification and reason.
- OpenAPI source information remains visible.

Demo role switching never grants production access.
