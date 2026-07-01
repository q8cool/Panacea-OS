# Demo To Production Boundary Guide

Panacea OS supports both Demo Mode and Live Mode. Sprint 111 strengthens the boundary between them.

## Demo Mode

Demo Mode is for product review and visual walkthroughs.

- Uses frontend-only synthetic rows.
- Does not persist to PostgreSQL.
- Does not call clinical write endpoints.
- Is clearly labeled as demo data.
- Allows role switching only for presentation.

## Live Mode

Live Mode is for authenticated read-only backend visibility.

- Requires Foundation JWT validation.
- Derives role, tenant, and permissions from token claims.
- Calls only browser-allowlisted GET endpoints.
- Displays only responses that use `source: live-read-model` and `demoData: false`.
- Shows empty live states when the backend has no rows.
- Blocks unknown or unsafe browser calls.

## What Never Happens Automatically

- Demo rows are not promoted into live records.
- Live Mode does not fabricate patient, lab, radiology, pharmacy, or admin records.
- The UI does not execute diagnosis, treatment, prescriptions, result approvals, report approvals, user changes, tenant changes, or policy changes.
- Browser requests do not bypass RBAC, ABAC, tenant isolation, audit logging, or Foundation identity.

## Operator Checklist

Before demonstrating Live Mode:

1. Start backend runtime or point `PANACEA_API_BASE_URL` at the approved deployment.
2. Confirm Foundation JWKS is reachable.
3. Use a Foundation-issued JWT with the correct tenant and role.
4. Confirm service CORS allows the web origin.
5. Open the target role workspace.
6. Verify the page shows `LIVE READ MODEL`, `LIVE CONNECTED`, or a clear empty/error state.
