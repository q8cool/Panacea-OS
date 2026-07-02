# Foundation Auth Provider Activation Report

Date: 2026-07-02
Branch: `develop/v4.0`
Scope: Foundation authentication provider for Panacea OS web login

## Final Decision

Repository implementation: PASS.

Live domain activation: pending deployment or nginx routing update on `foundation.utbe.ai`.

Foundation Auth Provider is enabled in the Panacea OS repository for controlled external web login. It is not approved for real clinical production identity use until formal security review, operator approval, credential governance, and deployment validation are complete.

## Missing Endpoints Found

Live checks before this sprint showed:

| Endpoint | Live result |
|---|---|
| `GET /health` | 200 |
| `GET /ready` | 200 |
| `GET /metrics` | 200 |
| `GET /.well-known/jwks.json` | 200 |
| `GET /.well-known/openid-configuration` | 404 |
| `POST /api/v1/auth/login` | 404 |
| `POST /api/v1/auth/token` | 404 |
| `POST /api/v1/auth/refresh` | 404 |
| `POST /api/v1/auth/logout` | 404 |
| `GET /api/v1/auth/me` | 404 |

Root cause: the live `foundation.utbe.ai` service exposes validation endpoints but is not yet routed to the repository Foundation Auth Provider implementation.

## Auth Endpoints Implemented

The repository Foundation Auth Provider exposes:

| Method | Endpoint |
|---|---|
| GET | `/.well-known/openid-configuration` |
| GET | `/.well-known/jwks.json` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/token` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/logout` |
| GET | `/api/v1/auth/me` |
| GET | `/health` |
| GET | `/ready` |
| GET | `/metrics` |
| POST | `/api/v1/audit-records` |
| POST | `/api/v1/policy/evaluate` |

## Key Management Design

- RS256 signing is required.
- Private key is loaded from environment or secure server file outside Git.
- Public key is derived or loaded and exposed through JWKS.
- JWKS includes `kid`, `kty`, `use`, `alg`, `n`, and `e`.
- Access tokens include the matching `kid`.
- No private key or real secret is committed.

## User Provisioning Design

- Users are loaded from `PANACEA_FOUNDATION_USERS_FILE` or `PANACEA_FOUNDATION_USERS_JSON`.
- The recommended server path is `/etc/panacea/foundation-users.json`.
- Passwords use Argon2id hashes.
- Real user files are ignored by Git.
- `foundation-users.example.json` documents the required shape without real credentials.

Required controlled access roles:

| User type | Role | Tenant | Required permissions |
|---|---|---|---|
| Project owner | `operator` | `utbe-health-system` | `panacea:operate`, `panacea:read`, `panacea:write`, `global_command_intelligence.write_workflows.write` |
| Administrator / security | `administrator` | `utbe-health-system` | `panacea:admin`, `panacea:read`, `panacea:write` |

## JWT Claims

Access tokens include:

- `iss`: `https://foundation.utbe.ai`
- `aud`: `panacea-os`
- `sub`
- `name`
- `tenantId`
- `tenant_id`
- `roles`
- `permissions`
- `userId`
- `username`
- `iat`
- `exp`
- `jti`

## Refresh And Logout Result

- Refresh tokens are generated from cryptographically secure random bytes.
- The server stores a SHA-256 token hash, token id, user id, tenant id, expiry, revoked state, rotation timestamp, and last-used timestamp.
- Refresh rotates the token and revokes the previous token.
- Logout revokes the refresh token when known by the provider.
- Raw refresh tokens are not persisted.

## CORS Result

Default allowed browser origin:

```text
https://panacea.utbe.ai
```

Allowed methods:

```text
GET, POST, OPTIONS
```

Allowed headers include:

```text
Authorization, Content-Type, X-Tenant-Id, X-Tenant-ID, X-User-Id, X-Request-Id, X-Correlation-Id
```

Wildcard credentialed CORS is not used.

## Panacea Web Discovery Result

Panacea Web already discovers:

- `/.well-known/openid-configuration`
- `/api/v1/auth/login`
- `/api/v1/auth/token`
- `/api/v1/auth/refresh`
- `/api/v1/auth/logout`
- `/api/v1/auth/me`

Once the live domain is routed to this provider, the Secure Access page should move from operator action required to provider login available.

## Validation Results

Repository validation:

- `npm run check`: PASS.
- `npm run build`: PASS.
- `npm run test:run`: PASS, 153 tests.
- `npm run openapi`: PASS, 26 OpenAPI documents.
- `npm run web:check`: PASS, 60 web tests.
- `npm run web:build`: PASS.
- `npm run quality:gate`: PASS.
- Foundation auth provider tests: PASS, 15 tests.
- Discovery endpoint: PASS.
- JWKS: PASS.
- Login success: PASS.
- Invalid password and tenant rejection: PASS.
- Access token verification against JWKS: PASS.
- Expired token rejection: PASS.
- Wrong issuer rejection: PASS.
- Wrong audience rejection: PASS.
- Refresh rotation: PASS.
- Logout revocation: PASS.
- `/me` authenticated profile: PASS.
- UTBE CORS preflight: PASS.
- External users file: PASS.
- External users file without fallback operator environment: PASS.

Live domain recheck before deployment:

- `https://foundation.utbe.ai/.well-known/openid-configuration`: 404.
- `https://foundation.utbe.ai/api/v1/auth/login`: 404.

Live domain validation must be rerun after the UTBE server is updated and nginx routes `foundation.utbe.ai` to the Foundation Auth Provider process.

## Deployment Required

On the UTBE server:

1. Pull the updated `develop/v4.0` branch.
2. Create `/etc/panacea/foundation-users.json` from `foundation-users.example.json`.
3. Generate Argon2id password hashes outside Git.
4. Provide RS256 key material outside Git.
5. Start `npm run foundation:auth-provider` on `127.0.0.1:8080`.
6. Route `foundation.utbe.ai` through nginx to `127.0.0.1:8080`.
7. Run the validation commands in `Foundation_Auth_Provider_Setup_Guide.md`.
8. Verify login at `https://panacea.utbe.ai/#/auth/login`.

## Remaining Security Recommendations

- Move from file-backed users to a dedicated identity store before broad organizational use.
- Add formal account lifecycle approval.
- Add lockout monitoring and alerting.
- Add key rotation procedure and dual-key JWKS rollover.
- Add external security review before real clinical production identity use.
