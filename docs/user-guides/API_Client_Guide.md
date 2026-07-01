# API Client Guide

## Purpose

The Panacea Web API client supports read-only browser calls to existing APIs.

It does not create backend records except the optional operator-only Foundation audit test event marked `testOnly: true`.

Sprint 105 adds a browser API allowlist. Unknown endpoints are blocked before browser transport.

## Headers

Authenticated requests include:

```text
Authorization: Bearer <JWT>
X-Tenant-Id: <tenant claim>
X-User-Id: <JWT subject>
X-Request-Id: <browser request id>
X-Correlation-Id: <browser request id>
Accept: application/json
```

## Error Handling

| Status | UI state |
|---|---|
| 2xx | `online` |
| 401 | `unauthorized` |
| 403 | `unauthorized` |
| 404 | `unavailable` |
| 5xx | `offline` |
| Network or CORS error | `unavailable` |
| Allowlist block | `unavailable` with blocked reason and classification |

## Retry Policy

The client retries only safe `GET` requests after a transient browser fetch failure.

Write methods are not retried.

## Request Correlation

Every request receives a generated request ID. The UI displays:

- user
- role
- tenant
- request ID
- timestamp
- endpoint
- response status

## API Discovery

Workspace pages select read-only endpoints from the existing OpenAPI bundle where matching contracts are available.

If no read-only endpoint exists, the UI displays `Live API unavailable` and links back to OpenAPI evidence.

## Allowlist Enforcement

Allowed browser reads are generated from existing OpenAPI contracts and limited to runtime and contract-read endpoints:

- `GET */live`
- `GET */ready`
- `GET */metrics`
- `GET */docs/openapi.json`

Everything else is blocked unless explicitly classified as `ALLOWED_OPERATOR_TEST`.
