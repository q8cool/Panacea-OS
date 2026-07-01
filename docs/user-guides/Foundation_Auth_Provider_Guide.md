# Foundation Auth Provider Guide

Sprint 106 adds Foundation authentication infrastructure for Panacea OS web Live Mode.

This provider is authentication infrastructure only. It does not add healthcare modules, clinical logic, AI behavior, diagnosis, treatment recommendations, or workflow execution.

## Endpoints

The Foundation auth provider exposes:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/.well-known/openid-configuration` | OpenID-compatible discovery metadata |
| GET | `/.well-known/jwks.json` | RS256 public keys |
| POST | `/api/v1/auth/login` | Bootstrap operator login |
| POST | `/api/v1/auth/token` | Password or refresh grant endpoint |
| POST | `/api/v1/auth/refresh` | Refresh-token rotation |
| POST | `/api/v1/auth/logout` | Refresh-token revocation |
| GET | `/api/v1/auth/me` | Current authenticated user context |
| GET | `/health` | Provider health |
| GET | `/ready` | Provider readiness |
| GET | `/metrics` | Safe provider metrics |
| POST | `/api/v1/audit-records` | Safe audit append validation |
| POST | `/api/v1/policy/evaluate` | Safe policy evaluation validation |

## Required Environment

```sh
export PANACEA_FOUNDATION_URL="https://foundation.utbe.ai"
export PANACEA_FOUNDATION_JWT_ISSUER="https://foundation.utbe.ai"
export PANACEA_FOUNDATION_AUTH_AUDIENCE="panacea-web"
export PANACEA_FOUNDATION_AUTH_PRIVATE_KEY_PEM="$FOUNDATION_RS256_PRIVATE_KEY_PEM"
export PANACEA_FOUNDATION_AUTH_PUBLIC_KEY_PEM="$FOUNDATION_RS256_PUBLIC_KEY_PEM"
export PANACEA_FOUNDATION_AUTH_KEY_ID="foundation-auth-key-1"
export PANACEA_FOUNDATION_OPERATOR_USERNAME="operator"
export PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH="$FOUNDATION_OPERATOR_PASSWORD_HASH"
export PANACEA_FOUNDATION_OPERATOR_USER_ID="foundation-operator"
export PANACEA_FOUNDATION_OPERATOR_TENANT_ID="default"
export PANACEA_FOUNDATION_OPERATOR_ROLES="operator"
export PANACEA_FOUNDATION_OPERATOR_PERMISSIONS="foundation:read,foundation:audit:append,foundation:policy:evaluate,panacea:operate"
export PANACEA_FOUNDATION_AUTH_CORS_ORIGIN="http://localhost:5174"
export PANACEA_FOUNDATION_AUTH_PORT="8080"
```

Use a derived password hash for production. Plain environment bootstrap password support exists only for controlled bootstrap validation and should be replaced with `PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH` before sustained use.

## Start Provider

```sh
npm run foundation:auth-provider
```

The process emits structured JSON logs. Logs include event names, tenant and actor references where safe. Logs do not include raw passwords, access tokens, or refresh tokens.

## Nginx Routing

Route `https://foundation.utbe.ai` to the provider port.

Required paths:

```text
/health
/ready
/metrics
/.well-known/jwks.json
/.well-known/openid-configuration
/api/v1/auth/login
/api/v1/auth/token
/api/v1/auth/refresh
/api/v1/auth/logout
/api/v1/auth/me
/api/v1/audit-records
/api/v1/policy/evaluate
```

## Security Controls

- RS256 access tokens are required.
- JWKS publishes only the public key.
- Operator credentials come from environment.
- Login errors do not reveal which credential was wrong.
- Login attempts are rate-limited.
- Refresh tokens rotate on refresh.
- Logout revokes the refresh token when it is known to the provider process.
- Auth events are audit-recorded without passwords or raw tokens.
- CORS allows `http://localhost:5174` and required Panacea headers.
- Wildcard credentialed CORS is not used.

## Validation Commands

```sh
curl https://foundation.utbe.ai/.well-known/openid-configuration
curl https://foundation.utbe.ai/.well-known/jwks.json
curl -i -X OPTIONS https://foundation.utbe.ai/api/v1/auth/login \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type,X-Tenant-Id,X-User-Id,X-Request-Id,X-Correlation-Id"
```

Login validation requires approved operator credentials from the deployment environment. Do not write passwords in shell history or reports.
