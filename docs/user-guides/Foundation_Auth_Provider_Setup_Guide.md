# Foundation Auth Provider Setup Guide

Scope: Foundation authentication provider for Panacea OS secure web access.

This provider enables username/password sign-in, RS256 access tokens, JWKS validation, refresh-token rotation, logout, and authenticated profile lookup for Panacea OS. It does not add healthcare modules, clinical behavior, diagnosis, treatment recommendations, or AI capability.

## Required External Files

Store these files outside the repository:

| File | Purpose | Recommended path |
|---|---|---|
| RSA private key | Signs RS256 access tokens | `/etc/panacea/foundation-auth-private-key.pem` |
| RSA public key | Exposed through JWKS | `/etc/panacea/foundation-auth-public-key.pem` |
| Users file | Contains Argon2id password hashes and roles | `/etc/panacea/foundation-auth/foundation-users.json` |
| Refresh token store | Stores hashed refresh-token lifecycle rows | `/var/lib/panacea/foundation-refresh-sessions.json` |

Recommended permissions:

```sh
sudo chown -R panacea:panacea /etc/panacea /var/lib/panacea
sudo chmod 700 /etc/panacea /var/lib/panacea
sudo chmod 600 /etc/panacea/foundation-auth/foundation-users.json
sudo chmod 600 /etc/panacea/foundation-auth-private-key.pem
```

## Environment

```sh
export PANACEA_FOUNDATION_URL="https://foundation.utbe.ai"
export PANACEA_FOUNDATION_JWT_ISSUER="https://foundation.utbe.ai"
export PANACEA_FOUNDATION_AUTH_AUDIENCE="panacea-os"
export PANACEA_FOUNDATION_AUTH_PRIVATE_KEY_PEM="$(cat /etc/panacea/foundation-auth-private-key.pem)"
export PANACEA_FOUNDATION_AUTH_PUBLIC_KEY_PEM="$(cat /etc/panacea/foundation-auth-public-key.pem)"
export PANACEA_FOUNDATION_AUTH_KEY_ID="foundation-auth-key-2026-07"
export PANACEA_FOUNDATION_USERS_FILE="/etc/panacea/foundation-auth/foundation-users.json"
export PANACEA_FOUNDATION_AUTH_REFRESH_TOKEN_STORE_FILE="/var/lib/panacea/foundation-refresh-sessions.json"
export PANACEA_FOUNDATION_AUTH_CORS_ORIGIN="https://panacea.utbe.ai"
export PANACEA_FOUNDATION_AUTH_PORT="8080"
```

## Install Runtime Dependencies

```sh
npm ci
```

The Foundation Auth Provider uses the `argon2` package for Argon2id password hashing and verification. Node.js built-in `crypto` Argon2 APIs are not required.

## Create User Password Hashes

```sh
npm run foundation:hash-password
```

Paste the printed `argon2id$...` value into `/etc/panacea/foundation-auth/foundation-users.json`.

## Start

```sh
npm run foundation:auth-provider
```

Run it behind nginx with `foundation.utbe.ai` proxying to `127.0.0.1:8080`.

## Required Routes

| Method | Path |
|---|---|
| GET | `/health` |
| GET | `/ready` |
| GET | `/metrics` |
| GET | `/.well-known/openid-configuration` |
| GET | `/.well-known/jwks.json` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/token` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/logout` |
| GET | `/api/v1/auth/me` |
| POST | `/api/v1/audit-records` |
| POST | `/api/v1/policy/evaluate` |

## Validation

```sh
curl -I https://foundation.utbe.ai/health
curl -I https://foundation.utbe.ai/ready
curl -I https://foundation.utbe.ai/.well-known/openid-configuration
curl -I https://foundation.utbe.ai/.well-known/jwks.json

curl -i -X OPTIONS https://foundation.utbe.ai/api/v1/auth/login \
  -H "Origin: https://panacea.utbe.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type,X-Tenant-ID,X-Request-ID,X-Correlation-ID"
```

Expected:

- health, readiness, discovery, and JWKS return HTTP 200.
- auth CORS preflight returns HTTP 204.
- `Access-Control-Allow-Origin` equals `https://panacea.utbe.ai`.
- JWKS contains a real RSA public key with `kid`, `kty`, `use`, `alg`, `n`, and `e`.

## Panacea Web Result

After deployment, open:

```text
https://panacea.utbe.ai/#/auth/login
```

Expected:

- Provider login discovery shows available.
- username/password login returns a secure session.
- role and organization appear from token claims.
- refresh rotates the session token.
- logout revokes the refresh token.

## Operational Hospital Core Permissions

Operational Hospital Core workflows call the live command service. A successful username/password login must issue service-level claims in addition to the broader Panacea platform claims.

Recommended project-owner permissions:

```json
[
  "panacea:operate",
  "panacea:read",
  "panacea:write",
  "read",
  "global_command_intelligence.read_models.read",
  "global_command_intelligence.write_workflows.write",
  "global_command_intelligence.write_workflows.read",
  "global_command_intelligence.write_workflows.retry"
]
```

Recommended administrator permissions:

```json
[
  "panacea:admin",
  "panacea:read",
  "panacea:write",
  "read",
  "global_command_intelligence.read_models.read",
  "global_command_intelligence.write_workflows.write",
  "global_command_intelligence.write_workflows.read",
  "global_command_intelligence.write_workflows.retry"
]
```

If patient registration succeeds but patient list or patient-file reads return `403`, update `/etc/panacea/foundation-auth/foundation-users.json` with these claims and restart the provider. Panacea Web also expands `panacea:read`, `panacea:write`, and `panacea:operate` into the compatible service headers for existing approved tokens, but the provider should still issue the canonical claims.

## Clinical Boundary

Foundation authentication enables secure access only. Real clinical production use still requires organizational, legal, privacy, security, regulatory, and clinical approval.
