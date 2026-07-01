# Foundation Provider Login Discovery

Date: 2026-07-01
Provider: `https://foundation.utbe.ai`

## Decision

Provider-hosted login available: NO.

Panacea Web must continue using Operator JWT Mode until Foundation exposes OAuth/OIDC or token issuance endpoints.

## Endpoints Checked

| Endpoint | Result | Meaning |
|---|---|---|
| `/.well-known/openid-configuration` | HTTP 404 | OpenID metadata is not published. |
| `/oauth/authorize` | HTTP 404 | OAuth authorize endpoint is not published. |
| `/authorize` | HTTP 404 | Generic authorize endpoint is not published. |
| `/api/v1/auth/login` | HTTP 404 | Login endpoint is not published. |
| `/api/v1/auth/token` | HTTP 404 | Token endpoint is not published. |
| `/api/v1/auth/refresh` | HTTP 404 | Refresh endpoint is not published. |

## Available Foundation Endpoints

| Endpoint | Result |
|---|---|
| `/health` | HTTP 200 |
| `/ready` | HTTP 200 |
| `/.well-known/jwks.json` | HTTP 200 |

## Web UI Behavior

- Foundation Login page remains available.
- Operator JWT Mode remains the supported Live Mode entry path.
- Provider login redirect is not enabled.
- Refresh-token behavior is not enabled.
- Logout clears the local browser session only.

## Operator Action Required

To support provider-hosted production login, Foundation must expose one of:

- OpenID Connect discovery metadata.
- OAuth authorization endpoint.
- Login endpoint.
- Token endpoint.
- Refresh endpoint if session refresh is required.

Panacea Web will not simulate production login.
