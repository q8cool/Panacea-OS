# Role-Based Live Workspace Guide

## Overview

Sprint 104 upgrades the Sprint 103 role workspaces with authenticated Live Mode.

Each workspace remains read-only in the browser and never performs autonomous clinical action.

## Workspaces

| Workspace | Live behavior |
|---|---|
| Doctor / Clinician | Uses role claims and attempts read-only API discovery for clinical pages. Demo rows are hidden in Live Mode when APIs are unavailable. |
| Patient Portal | Uses patient role claims and shows patient-facing boundaries. No guidance replaces clinician advice. |
| Laboratory | Shows read-only lab API availability where contracts exist. |
| Radiology | Shows read-only imaging/report API availability where contracts exist. DICOM image viewing is not implemented. |
| Pharmacy | Shows read-only pharmacy API availability where contracts exist. No new medication safety backend logic is added. |
| Administration | Shows read-only admin/system visibility where contracts exist. |
| Operator | Uses command, status, Foundation, API Explorer, evidence, and documentation pages. |

## Live Panels

Each workspace page shows:

- Live Data Connection.
- OpenAPI endpoint candidate.
- Endpoint source contract.
- Request status.
- Request ID.
- User, role, tenant, timestamp, endpoint, and response status.

## Unavailable Data Rules

If a live read-only endpoint is not available:

- The page states `Live API unavailable`.
- Demo rows are not presented as live records.
- The relevant OpenAPI and documentation source remains visible.

## Security Rules

- Demo Role Switcher is disabled in Live Mode.
- Role navigation is derived from token claims.
- Tenant scope is derived from token claims.
- Browser requests include Authorization and tenant headers.
- 401 and 403 responses are shown directly instead of being hidden.
