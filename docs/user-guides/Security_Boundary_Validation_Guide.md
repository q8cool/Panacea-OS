# Security Boundary Validation Guide

Date: 2026-07-01

## Purpose

This guide records the security boundaries verified for controlled pilot readiness. The checks are validation of existing behavior only.

## Required Boundaries

| Boundary | Validation |
|---|---|
| Authentication | Missing credentials return `401`. |
| Authorization | Missing or incorrect permission returns `403`. |
| Tenant isolation | Header/body tenant mismatch returns `403`. |
| Role boundary | Role-specific read models reject roles outside the workspace boundary. |
| Patient self-scope | Patient portal read models only return the authenticated patient's records. |
| Write permission | Live write workflows require the configured write permission. |
| Audit | Accepted write workflows create audit entries. |
| Event/outbox | Accepted write workflows create event/outbox entries. |
| Projection integrity | Projection rows are created deterministically and cannot be marked successful without projection processing. |
| Live/demo boundary | Live Mode does not fall back to demo rows when runtime access fails. |

## Automated Evidence

Run:

```bash
npm run test:run
npm run runtime:orchestration
```

The tests cover:

- unauthenticated rejection
- unauthorized rejection
- tenant mismatch rejection
- patient self-scope isolation
- laboratory and pharmacy boundary checks
- radiology approval boundary checks
- governed write workflow controls
- audit/event/projection persistence

## Operator Live Checks

```bash
npm run panacea:start
npm run panacea:health
```

Then use the Panacea Web live workspaces with a Foundation-issued JWT. If the runtime is unavailable, the UI must show an unavailable state instead of demo rows.

## What Must Not Be Claimed

- Do not claim demo role selection grants production access.
- Do not claim Live Mode is active without a validated Foundation session.
- Do not claim patient data exists unless returned by the authenticated tenant-scoped runtime API.
- Do not claim autonomous diagnosis or treatment behavior exists.
