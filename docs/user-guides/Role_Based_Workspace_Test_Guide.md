# Role Based Workspace Test Guide

Date: 2026-07-01

## Purpose

This guide maps Sprint 115 pilot workflows to role workspaces and API contracts.

## Role Matrix

| Role | Workspace route | Live read endpoint | Write workflow family | Expected boundary |
|---|---|---|---|---|
| Doctor | `#/workspace/doctor/dashboard` | `/read-models/clinical/patients` | `/write-workflows/clinical/*` | Can see tenant-scoped clinical read models |
| Patient | `#/workspace/patient/appointments` | `/read-models/patient-portal/me/appointments` | `/write-workflows/patient-portal/*` | Self-scoped to authenticated patient |
| Laboratory | `#/workspace/laboratory/result-entry` | `/read-models/laboratory/results` | `/write-workflows/laboratory/*` | Cannot perform pharmacy or radiology actions |
| Radiology | `#/workspace/radiology/reporting` | `/read-models/radiology/reports` | `/write-workflows/radiology/*` | Cannot approve pharmacy or lab workflows |
| Pharmacy | `#/workspace/pharmacy/prescriptions` | `/read-models/pharmacy/prescriptions` | `/write-workflows/pharmacy/*` | Must include medication safety control |
| Administrator | `#/workspace/administrator/users` | `/read-models/admin/users` | `/write-workflows/admin/*` | Can administer tenant-scoped records |
| Operator | `#/command/transaction-review` | `/write-workflows/events` and `/write-workflows/projections` | projection retry only | Can review audit/projection evidence without editing clinical data |

## Required Test Assertions

For every role:

- Live session banner appears.
- Correct read-model endpoint is selected from OpenAPI.
- Returned data has `demoData: false`.
- Demo rows are not displayed as live rows.
- Unauthorized role access is blocked.

For operator:

- Events include request and correlation identifiers.
- Projections include target read models.
- Failed projection retry is allowed only with operator/admin role and retry permission.

## Automated Coverage

Automated coverage is in:

- `tests/real-time-global-healthcare-command-intelligence-platform/write-workflows.test.mjs`
- `apps/panacea-web/test/app.test.ts`

Run:

```bash
npm run test:run
npm run web:check
```

## Manual Pilot Walkthrough

1. Start Docker runtime.
2. Open the web app.
3. Authenticate in Live Mode.
4. Navigate each role workspace.
5. Execute allowed read checks.
6. Submit approved write workflows only where allowed.
7. Review transactions as operator.
8. Confirm no cross-tenant or wrong-role access.

