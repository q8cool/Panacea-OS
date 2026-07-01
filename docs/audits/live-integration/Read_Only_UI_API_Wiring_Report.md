# Read-Only UI API Wiring Report

Sprint: 108
Date: 2026-07-01

## Decision

PARTIAL.

The role workspaces now show explicit connection status and use existing OpenAPI-derived read-only runtime endpoints when Live Mode is authenticated. No fake data and no new backend endpoints were added. Demo rows remain hidden in Live Mode.

## Workspace Status

| Workspace | Pages | Live status after Sprint 108 | Notes |
| --- | ---: | --- | --- |
| Doctor / Clinician | 18 | LIVE PARTIAL | Runtime/OpenAPI checks available; patient/clinical read models are not exposed as GET APIs |
| Patient Portal | 14 | LIVE PARTIAL | Privacy/consent runtime contracts visible; patient portal records require future read APIs |
| Laboratory | 12 | LIVE PARTIAL | No lab order/specimen/result GET read APIs in active contracts |
| Radiology | 11 | LIVE PARTIAL | No imaging order/study/report/DICOM metadata GET read APIs in active contracts |
| Pharmacy | 12 | LIVE PARTIAL | No catalog/prescription/inventory/safety-alert GET read APIs in active contracts |
| Administration | 17 | LIVE PARTIAL | Runtime/system visibility available; user/role/tenant/audit-log read APIs are not active browser read models |

## UI Status Labels Added

Every role workspace can now show:

- `LIVE CONNECTED`
- `LIVE PARTIAL`
- `LIVE API UNAVAILABLE`
- `BLOCKED BY AUTH`
- `BLOCKED BY CORS`
- `DEMO MODE`
- `DOCUMENTATION ONLY`

## Rules Preserved

- Demo data is not shown as live data.
- Browser writes remain blocked except the operator-only safe audit test.
- Clinical action endpoints remain blocked.
- Unknown endpoints remain blocked.
- No new domain service or clinical behavior was added.
