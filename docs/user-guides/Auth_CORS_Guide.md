# Auth CORS Guide

Foundation auth endpoints must allow the Panacea web origin:

```text
http://localhost:5174
```

## Required Methods

```text
GET
POST
OPTIONS
```

## Required Headers

```text
Authorization
Content-Type
X-Tenant-Id
X-User-Id
X-Request-Id
X-Correlation-Id
```

## Required Auth Paths

```text
/.well-known/openid-configuration
/.well-known/jwks.json
/api/v1/auth/login
/api/v1/auth/token
/api/v1/auth/refresh
/api/v1/auth/logout
/api/v1/auth/me
```

## Validation

```sh
curl -i -X OPTIONS "https://foundation.utbe.ai/api/v1/auth/login" \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type,X-Tenant-Id,X-User-Id,X-Request-Id,X-Correlation-Id"
```

Expected:

- HTTP `200` or `204`.
- `Access-Control-Allow-Origin: http://localhost:5174`.
- Allowed methods include `GET,POST,OPTIONS`.
- Allowed headers include all required Panacea headers.

Do not configure wildcard credentialed CORS for production.
