# Browser CORS Deployment Validation

## Purpose

Panacea Web Live Mode runs from a browser. Foundation and backend services must explicitly allow the trusted web origin.

## Required Origin

Local development:

```text
http://localhost:5174
```

Production should use the official Panacea web origin only.

## Required Methods

Read-only Live Mode:

```text
GET, OPTIONS
```

Operator audit test:

```text
POST, OPTIONS
```

## Required Request Headers

```text
Authorization
Content-Type
X-Tenant-Id
X-User-Id
X-Request-Id
X-Correlation-Id
```

## Recommended Exposed Headers

```text
X-Request-Id
X-Correlation-Id
Retry-After
```

## Credential Policy

Use bearer tokens in the `Authorization` header.

Do not enable wildcard origins with credentials in production.

## Preflight Validation

Example preflight:

```sh
curl -i -X OPTIONS "https://foundation.utbe.ai/health" \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,X-Tenant-Id,X-Request-Id,X-Correlation-Id"
```

Expected:

```text
HTTP 200 or 204
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Methods: GET,OPTIONS
Access-Control-Allow-Headers: Authorization,...
```

## Browser Validation

1. Start web app.
2. Open `http://localhost:5174/#/command/live-status`.
3. Click Refresh Live Status.
4. Confirm endpoint states are `online`.

If the browser shows `unavailable` while curl succeeds, inspect browser console for CORS failures.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Browser says endpoint unavailable | Missing CORS headers or network policy. |
| HTTP 401 | Token missing, expired, wrong issuer, or invalid signature. |
| HTTP 403 | Role, permission, tenant, or policy denied. |
| HTTP 404 | Endpoint not deployed or wrong base URL. |
| Preflight fails | OPTIONS method or requested headers not allowed. |
| Metrics blocked | Deployment policy may keep metrics server-side. |

## Security Boundary

Do not solve CORS by allowing all origins in production.

Do not expose secrets in metrics or OpenAPI responses.
