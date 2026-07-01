# Foundation Login Operator Guide

This guide explains how an operator signs in to Panacea OS web Live Mode after Sprint 106.

## Login URL

```text
http://localhost:5174/#/auth/login
```

## Preferred Mode: Provider Login

Use Provider Login when Foundation exposes:

```text
POST /api/v1/auth/login
POST /api/v1/auth/token
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Steps:

1. Open the login page.
2. Click **Discover Login**.
3. Confirm `Provider login: YES`.
4. Enter the operator username, password, and tenant ID supplied by the Foundation deployment owner.
5. Submit the form.
6. Confirm the session shows `Auth mode: Provider Login`.

The web UI stores the access token and refresh token in browser local storage for the active operator session. Logout clears local storage and calls the Foundation logout endpoint when a refresh token is present.

## Fallback Mode: Operator JWT

Operator JWT mode remains available.

Use it when:

- Foundation login endpoints are not yet routed.
- The operator receives a Foundation-issued test token through an approved process.
- Provider login is unavailable due to CORS or deployment configuration.

The token must be signed with RS256 and validated against Foundation JWKS.

## Tenant And Role

The live session derives tenant, roles, and permissions from token claims. Demo role selection is disabled during Live Mode and never grants production access.

## Safety Boundary

Provider login only authenticates the web workspace. It does not enable clinical writes, diagnosis, treatment, AI expansion, or healthcare workflow execution.
