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
- API allowlist classification.
- Blocked request reason if the browser call is not allowed.
- Request status.
- Request ID.
- User, role, tenant, timestamp, endpoint, and response status.

## Sprint 108 Connection Labels

Role workspace pages now show one of these explicit labels:

| Label | Meaning |
|---|---|
| `LIVE CONNECTED` | A page-level read API returned live data. |
| `LIVE PARTIAL` | Runtime/OpenAPI status is reachable, but page-level record data is not available. |
| `LIVE API UNAVAILABLE` | No safe matching read endpoint exists or it cannot be reached. |
| `BLOCKED BY AUTH` | Authentication or authorization blocked access. |
| `BLOCKED BY CORS` | Browser CORS blocked access before a usable response. |
| `DEMO MODE` | Demo-only UI data is visible and clearly marked. |
| `DOCUMENTATION ONLY` | The page is backed by documentation or release evidence. |

## Unavailable Data Rules

If a live read-only endpoint is not available:

- The page states `Live API unavailable`.
- Demo rows are not presented as live records.
- The relevant OpenAPI and documentation source remains visible.
- Unknown browser API calls are blocked by default.

## Security Rules

- Demo Role Switcher is disabled in Live Mode.
- Role navigation is derived from token claims.
- Tenant scope is derived from token claims.
- Browser requests include Authorization and tenant headers.
- Browser requests include user, actor, request ID, and correlation ID headers.
- 401 and 403 responses are shown directly instead of being hidden.
- Operator audit append is restricted to operator role sessions.
