# Demo vs Live Write Boundary Guide

## Demo Mode

Demo Mode is visible and safe for presentation. It never persists production records.

The UI displays:

```text
Demo action only — not persisted to production backend
إجراء تجريبي فقط — لا يتم حفظه في قاعدة الإنتاج
```

Demo Mode does not submit POST requests to the live write workflow endpoints.

## Live Mode

Live Mode requires:

- Foundation authentication.
- Tenant scope from the token.
- Role and permission claims.
- Browser allowlist approval.
- Versioned OpenAPI endpoint.
- Workflow controls confirming audit, tenant isolation, and human action.

## Blocked Actions

The browser blocks:

- Unknown POST endpoints.
- Unapproved clinical actions.
- Autonomous diagnosis.
- Autonomous treatment.
- Unapproved emergency enforcement.
- Dangerous administrative actions outside Sprint 113.
