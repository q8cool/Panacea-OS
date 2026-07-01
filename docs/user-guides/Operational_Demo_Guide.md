# Operational Demo Guide

Panacea OS now includes a role-based operational demo inside the web platform. The demo is designed to let an operator review how the product feels across clinical, patient, laboratory, radiology, pharmacy, administration, and command-center workspaces without using real patient information.

## Scope

This guide covers the visible web demo only.

- No real PHI is included.
- No production clinical records are created.
- No diagnosis or treatment is generated.
- No autonomous clinical action is available.
- Every demo record is labeled as `DEMO DATA — NOT REAL PATIENT DATA`.

## Start Locally

```sh
cd "/Users/faisalalkandari/Documents/New project"
npm run web:dev
```

Open:

```text
http://localhost:5174
```

## Main Demo Routes

| Area | URL |
|---|---|
| Operator overview | `http://localhost:5174/#/command/executive-overview` |
| Doctor workspace | `http://localhost:5174/#/workspace/doctor/dashboard` |
| Patient portal | `http://localhost:5174/#/workspace/patient/dashboard` |
| Laboratory workspace | `http://localhost:5174/#/workspace/laboratory/dashboard` |
| Radiology workspace | `http://localhost:5174/#/workspace/radiology/dashboard` |
| Pharmacy workspace | `http://localhost:5174/#/workspace/pharmacy/dashboard` |
| Administration workspace | `http://localhost:5174/#/workspace/administrator/dashboard` |
| Foundation login | `http://localhost:5174/#/auth/login` |
| API Explorer | `http://localhost:5174/#/developer/api-explorer` |

## What To Try First

1. Open the operator overview.
2. Use the quick workspace cards to open each role.
3. Switch the language selector between English and Arabic.
4. Open Doctor > Patient Search and select `Demo Patient Alpha`.
5. Open Patient Portal > Appointments.
6. Open Laboratory > Result Entry.
7. Open Radiology > DICOM Metadata Viewer.
8. Open Pharmacy > Inventory.
9. Open Administration > Users and Audit Logs.

## Live Mode Boundary

If a Foundation-issued JWT is provided on the login screen, the UI can evaluate configured read-only endpoints where the browser allowlist permits. If no live read model returns records, the page keeps the visible operational demo data separate and labeled as demo data.

## Stop Locally

Stop the dev server with `Ctrl+C` in the terminal that started `npm run web:dev`.

