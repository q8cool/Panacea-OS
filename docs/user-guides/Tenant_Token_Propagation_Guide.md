# Tenant Token Propagation Guide

## Browser Request Headers

Panacea Web Live Mode sends these headers for allowed API requests:

```text
Authorization: Bearer <Foundation JWT>
X-Tenant-Id: <tenant claim>
X-User-Id: <subject claim>
X-Actor-Id: <subject claim>
X-Request-Id: <generated request ID>
X-Correlation-Id: <generated correlation ID>
```

## Validation Behavior

The repository runtime validates:

- Missing authentication returns 401.
- Unauthorized permission returns 403.
- Tenant mismatch returns 403.
- Valid governed test writes persist a record, event, and audit entry.

## Current Read Limitation

Active role-specific record read APIs are not yet exposed. Tenant-scoped record reads can be fully validated only after approved GET read-model endpoints exist.

## Operator Checklist

1. Sign in with Foundation Provider Login or paste a valid Foundation-issued JWT.
2. Confirm the UI shows role and tenant from token claims.
3. Open Live API Status.
4. Confirm runtime endpoints respond and CORS is not blocking requests.
5. Confirm role workspace pages do not show demo rows as live records.
