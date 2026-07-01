# Demo Data Guide

The operational demo uses frontend-only synthetic seed data located in:

```text
apps/panacea-web/src/demoData/index.ts
```

The data exists to demonstrate navigation, layout, role workflows, and operational visibility. It is not persisted to the production backend and must not be treated as live information.

## Data Label

Every role workspace shows:

```text
DEMO DATA — NOT REAL PATIENT DATA
```

## Synthetic Coverage

| Dataset | Purpose |
|---|---|
| Demo hospital | Facility, wards, rooms, beds, departments, clinics, tenants |
| Demo users | Role-specific users for doctor, patient, lab, radiology, pharmacy, admin, operator |
| Demo patients | Synthetic patient charts for UI review only |
| Demo laboratory orders | Lab order, result, validation, and critical-result visibility |
| Demo radiology studies | Study list and DICOM metadata visibility without image viewing |
| Demo pharmacy records | Prescription queue, review labels, catalog, inventory, and lot tracking |
| Demo audit logs | Read-only operational audit visibility |
| Demo system health | Operator view of release, runtime, Foundation, OpenAPI, and quality evidence |

## Safety Rules

- Do not enter real patient data into the demo.
- Do not use demo records for medical decisions.
- Do not describe demo records as live records.
- Do not use demo records as production import data.
- Use Foundation Live Mode only for read-only connectivity validation.

## How To Verify

Run:

```sh
npm run web:check
```

The test suite verifies that role workspaces render synthetic records and keep advisory boundaries visible.

