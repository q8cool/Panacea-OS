# CORS Configuration Guide

## Purpose

Live Mode runs in the browser. Backend services and the Foundation Provider must explicitly allow the web origin.

Do not weaken backend security. CORS must be configured narrowly for trusted Panacea web origins.

## Local Development Origin

```text
http://localhost:5174
```

## Required Methods

For read-only Live Mode:

```text
GET, OPTIONS
```

For optional operator audit test:

```text
POST, OPTIONS
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

## Deployment Validation

Use the detailed validation guide:

```text
docs/user-guides/Browser_CORS_Deployment_Validation.md
```

The web UI also exposes browser-visible CORS readiness through:

```text
http://localhost:5174/#/command/live-status
```

## Exposed Headers

Recommended:

```text
X-Request-Id
X-Correlation-Id
Retry-After
```

## Foundation Endpoints

The following endpoints must allow browser access from trusted origins:

```text
GET https://foundation.utbe.ai/health
GET https://foundation.utbe.ai/ready
GET https://foundation.utbe.ai/metrics
GET https://foundation.utbe.ai/.well-known/jwks.json
POST https://foundation.utbe.ai/api/v1/audit-records
POST https://foundation.utbe.ai/api/v1/policy/evaluate
```

## Backend Service Endpoints

Runtime services should allow browser access only for:

- Health.
- Readiness.
- Metrics where safe.
- OpenAPI.
- Existing read-only API routes.

## Security Notes

- Do not use wildcard origins for production.
- Do not expose secrets in metrics.
- Do not allow credentialed browser requests from untrusted origins.
- Keep tenant and authorization validation server-side.
- Keep browser API allowlist enforcement enabled.
