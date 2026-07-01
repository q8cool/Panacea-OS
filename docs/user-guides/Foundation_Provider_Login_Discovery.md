# Foundation Provider Login Discovery

Date: 2026-07-01
Provider: `https://foundation.utbe.ai`

## Decision

Repository support: YES.

Panacea Web now supports provider login when Foundation exposes auth endpoints. If the live domain still reports `404` for auth paths, deploy the Sprint 106 Foundation auth provider or route nginx to it before using provider login.

## Latest Live Observation

Observed on 2026-07-01:

| Check | Result |
|---|---|
| `GET /health` | HTTP 200 |
| `GET /ready` | HTTP 200 |
| `GET /.well-known/jwks.json` | HTTP 200 |
| `GET /.well-known/openid-configuration` | HTTP 404 |
| `OPTIONS /api/v1/auth/login` | HTTP 404 |

Meaning: the repository contains the auth provider implementation, but the live `foundation.utbe.ai` route has not yet been switched to that implementation.

## Endpoints Checked

| Endpoint | Result | Meaning |
|---|---|---|
| `/.well-known/openid-configuration` | HTTP 404 | OpenID metadata is not published. |
| `/oauth/authorize` | HTTP 404 | OAuth authorize endpoint is not published. |
| `/authorize` | HTTP 404 | Generic authorize endpoint is not published. |
| `/api/v1/auth/login` | Required | Login endpoint for username, password, and tenant ID. |
| `/api/v1/auth/token` | Required | Password or refresh grant endpoint. |
| `/api/v1/auth/refresh` | Required | Refresh-token rotation endpoint. |
| `/api/v1/auth/logout` | Required | Provider logout endpoint. |
| `/api/v1/auth/me` | Required | Bearer-token user context endpoint. |

## Available Foundation Endpoints

| Endpoint | Result |
|---|---|
| `/health` | HTTP 200 |
| `/ready` | HTTP 200 |
| `/.well-known/jwks.json` | HTTP 200 |

## Web UI Behavior

- Foundation Login page remains available.
- Operator JWT Mode remains the supported Live Mode entry path.
- Provider Login form is available.
- Operator JWT Mode remains available.
- Refresh-token behavior is enabled for provider sessions.
- Logout clears the local browser session and calls Foundation logout when a provider refresh token exists.

## Operator Action Required

To support provider production login, Foundation must expose:

- OpenID-compatible discovery metadata.
- Login endpoint.
- Token endpoint.
- Refresh endpoint.
- Logout endpoint.
- Current user endpoint.

Panacea Web will not simulate production login. If these endpoints are absent on `https://foundation.utbe.ai`, login remains Operator JWT or Demo Mode.
