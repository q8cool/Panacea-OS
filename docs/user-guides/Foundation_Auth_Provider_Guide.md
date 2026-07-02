# Foundation Auth Provider Guide

This guide describes the Foundation authentication provider used by Panacea OS web secure access.

This provider is authentication infrastructure only. It does not add healthcare modules, clinical logic, AI behavior, diagnosis, treatment recommendations, or workflow execution.

## Endpoints

The Foundation auth provider exposes:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/.well-known/openid-configuration` | OpenID-compatible discovery metadata |
| GET | `/.well-known/jwks.json` | RS256 public keys |
| POST | `/api/v1/auth/login` | Username, password, and tenant login |
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
export PANACEA_FOUNDATION_AUTH_AUDIENCE="panacea-os"
export PANACEA_FOUNDATION_AUTH_PRIVATE_KEY_PEM="$FOUNDATION_RS256_PRIVATE_KEY_PEM"
export PANACEA_FOUNDATION_AUTH_PUBLIC_KEY_PEM="$FOUNDATION_RS256_PUBLIC_KEY_PEM"
export PANACEA_FOUNDATION_AUTH_KEY_ID="foundation-auth-key-1"
export PANACEA_FOUNDATION_USERS_FILE="/etc/panacea/foundation-auth/foundation-users.json"
export PANACEA_FOUNDATION_AUTH_REFRESH_TOKEN_STORE_FILE="/var/lib/panacea/foundation-refresh-sessions.json"
export PANACEA_FOUNDATION_AUTH_CORS_ORIGIN="https://panacea.utbe.ai"
export PANACEA_FOUNDATION_AUTH_PORT="8080"
```

Use Argon2id password hashes in the external users file. Generate them with:

```sh
npm run foundation:hash-password
```

Do not place real user credentials, private keys, refresh token stores, or generated secrets in Git.

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
- User credentials come from an environment-backed or mounted JSON file outside Git.
- Login errors do not reveal which credential was wrong.
- Login attempts are rate-limited.
- Refresh tokens rotate on refresh.
- Logout revokes the refresh token when it is known to the provider process.
- Refresh token storage keeps token hashes and lifecycle metadata, not raw refresh tokens.
- Auth events are audit-recorded without passwords or raw tokens.
- CORS allows `https://panacea.utbe.ai` and required Panacea headers.
- Wildcard credentialed CORS is not used.

## Validation Commands

```sh
curl https://foundation.utbe.ai/.well-known/openid-configuration
curl https://foundation.utbe.ai/.well-known/jwks.json
curl -i -X OPTIONS https://foundation.utbe.ai/api/v1/auth/login \
  -H "Origin: https://panacea.utbe.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type,X-Tenant-ID,X-Request-ID,X-Correlation-ID"
```

Login validation requires approved operator credentials from the deployment environment. Do not write passwords in shell history or reports.
