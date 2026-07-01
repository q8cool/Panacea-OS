# Sprint 106 — Foundation Auth Provider Endpoints & Real Login Integration Report

Date: 2026-07-01
Branch: `develop/v4.0`

## Decision

Repository implementation: PASS.

Live `foundation.utbe.ai` auth routing: NOT YET DEPLOYED.

Sprint 106 added production-safe Foundation auth infrastructure and connected Panacea Web to real provider login flows. The live domain still serves the pre-Sprint auth surface for auth paths, so provider login requires deployment or nginx routing of the Sprint 106 provider before live operator use.

## Scope Confirmation

- No healthcare modules were added.
- No clinical logic was added.
- No AI capabilities were added.
- No clinical product behavior was changed.
- Authentication infrastructure only.

## Foundation Auth Endpoint Status

| Endpoint | Repository implementation | Automated test | Live `foundation.utbe.ai` observation |
|---|---:|---:|---|
| `GET /.well-known/openid-configuration` | YES | PASS | HTTP 404 |
| `GET /.well-known/jwks.json` | YES | PASS | GET HTTP 200 from existing provider |
| `POST /api/v1/auth/login` | YES | PASS | HTTP 404 |
| `POST /api/v1/auth/token` | YES | PASS | Not live-routed |
| `POST /api/v1/auth/refresh` | YES | PASS | Not live-routed |
| `POST /api/v1/auth/logout` | YES | PASS | Not live-routed |
| `GET /api/v1/auth/me` | YES | PASS | Not live-routed |

## OpenID Discovery Status

Repository provider returns:

- `issuer`
- `jwks_uri`
- `token_endpoint`
- `userinfo_endpoint`
- `login_endpoint`
- `end_session_endpoint`
- `response_types_supported`
- `subject_types_supported`
- `id_token_signing_alg_values_supported`
- `claims_supported`
- `grant_types_supported`

Issuer is configured as:

```text
https://foundation.utbe.ai
```

JWKS URI is:

```text
https://foundation.utbe.ai/.well-known/jwks.json
```

## Token And Session Controls

Implemented:

- RS256 access token signing.
- JWKS public key publication.
- Required claims: `iss`, `sub`, `aud`, `exp`, `iat`, `tenantId`, `roles`, `permissions`, `userId`, `username`.
- Environment-based operator credentials.
- PBKDF2 operator password hash support.
- Timing-safe credential comparison.
- Login rate limiting.
- Refresh-token rotation.
- Logout refresh-token revocation where the provider process owns the session.
- Structured error responses.
- Structured JSON logs without passwords or raw tokens.

## Audit And Policy Integration

Safe audit events implemented:

- `auth.login.success`
- `auth.login.failure`
- `auth.token.refresh`
- `auth.logout`
- `auth.me.accessed`

Audit events do not include passwords or raw access or refresh tokens.

Existing validation endpoints remain available in the provider implementation:

- `POST /api/v1/audit-records`
- `POST /api/v1/policy/evaluate`

## CORS Status

Repository implementation:

- Origin: `http://localhost:5174`
- Methods: `GET`, `POST`, `OPTIONS`
- Headers: `Authorization`, `Content-Type`, `X-Tenant-Id`, `X-User-Id`, `X-Request-Id`, `X-Correlation-Id`
- Wildcard credentialed CORS: not used

Live observation:

```text
OPTIONS https://foundation.utbe.ai/api/v1/auth/login -> HTTP 404
```

Meaning: CORS auth route is not live-routed yet.

## Web UI Login Integration Status

Implemented:

- Provider Login form with username, password, and tenant ID.
- Provider login discovery.
- Successful session storage after RS256/JWKS validation.
- Failed login error display.
- Authenticated user display.
- Tenant display.
- Roles and permissions display.
- Token expiry display.
- Auth mode display: Provider Login / Operator JWT / Demo.
- Refresh-token flow for provider sessions.
- Logout flow for provider sessions.
- Operator JWT mode preserved.
- Demo mode preserved.

## Validation Results

| Command | Result |
|---|---|
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 126 tests |
| `npm run openapi` | PASS, 26 OpenAPI documents |
| `npm run web:check` | PASS, 33 web tests |
| `npm run web:build` | PASS |
| `npm run quality:gate` | PASS |
| Foundation auth provider contract tests | PASS, 9 tests |

## Live Foundation Validation

| Check | Result |
|---|---|
| `curl -I https://foundation.utbe.ai/health` | HTTP 404 for HEAD |
| `curl -I https://foundation.utbe.ai/ready` | HTTP 404 for HEAD |
| `curl -I https://foundation.utbe.ai/.well-known/jwks.json` | HTTP 404 for HEAD |
| `curl https://foundation.utbe.ai/health` | HTTP 200 |
| `curl https://foundation.utbe.ai/ready` | HTTP 200 |
| `curl https://foundation.utbe.ai/.well-known/jwks.json` | HTTP 200 |
| `curl https://foundation.utbe.ai/.well-known/openid-configuration` | HTTP 404 |
| `curl -X OPTIONS https://foundation.utbe.ai/api/v1/auth/login` | HTTP 404 |
| `curl -X POST https://foundation.utbe.ai/api/v1/auth/login --data '{}'` | HTTP 404 |

Live login with safe credentials was not executed because no approved credential environment variables were present.

Credential environment scan result:

```text
FOUNDATION_TEST_USERNAME=MISSING
FOUNDATION_TEST_PASSWORD=MISSING
FOUNDATION_TEST_TENANT_ID=MISSING
PANACEA_FOUNDATION_OPERATOR_USERNAME=MISSING
PANACEA_FOUNDATION_OPERATOR_PASSWORD=MISSING
PANACEA_FOUNDATION_OPERATOR_TENANT_ID=MISSING
```

SSH deployment attempt:

```text
ssh root@162.0.228.10 -> Permission denied (publickey,password)
```

No server changes were made.

## Local URL

```text
http://localhost:5174/
```

Smoke result:

```text
curl -I http://localhost:5174/ -> HTTP 200
```

Login page:

```text
http://localhost:5174/#/auth/login
```

## Live Foundation URL

```text
https://foundation.utbe.ai
```

## Remaining Auth Gaps

1. Deploy `npm run foundation:auth-provider` behind nginx on `foundation.utbe.ai`.
2. Configure RS256 private/public key environment variables.
3. Configure operator password hash.
4. Route auth endpoints through nginx.
5. Re-run live OpenID, CORS, login, refresh, logout, and `/me` validation.
6. Provide approved live test credentials through environment for credentialed validation.

## Final Sprint 106 Status

PASS WITH LIVE DEPLOYMENT REQUIRED.

The repository implementation is complete and validated. The live provider login path is not active until the Foundation auth provider is deployed or routed on `foundation.utbe.ai`.
