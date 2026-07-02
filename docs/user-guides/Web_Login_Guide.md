# Web Login Guide

Panacea Web supports three visible access modes:

| Mode | Description |
|---|---|
| Provider Login | Real Foundation login with username, password, tenant, signed access token, refresh, and logout |
| Operator Access Token | Manual entry of a Foundation-issued JWT for controlled access validation |
| Guided Preview | Guided role workspaces with protected sample records and clear governance boundaries |

## Provider Login Flow

1. The browser discovers Foundation login endpoints.
2. The operator submits username, password, and tenant ID.
3. Foundation returns an RS256 access token and refresh token.
4. The browser validates the access token against Foundation JWKS.
5. The browser stores a live session only after signature, issuer, expiry, tenant, and role validation succeed.
6. The top bar and login page show the authenticated user, tenant, roles, permissions, auth mode, and expiry.

## Refresh Flow

Provider Login sessions show a **Refresh Session** button.

Refresh:

- sends the refresh token to `/api/v1/auth/refresh`;
- receives a rotated refresh token when accepted;
- validates the new access token against JWKS before updating the session.

## Logout Flow

Logout:

- calls `/api/v1/auth/logout` when a provider refresh token exists;
- clears browser local storage;
- clears the active secure session and returns to guided preview access.

## Error Handling

The UI displays authentication failures directly:

- provider login unavailable;
- invalid credentials;
- expired or unsigned token;
- issuer mismatch;
- missing tenant claim;
- unsupported role claim;
- JWKS or CORS failure.

The UI does not invent a session when Foundation rejects login.
