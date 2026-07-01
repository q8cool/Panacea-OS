# Role-Based Live Workspace Guide

## Overview

Sprint 111 upgrades the role workspaces with authenticated backend read-model APIs.

Each workspace remains read-only in the browser and never performs autonomous clinical action.

## Workspaces

| Workspace | Live behavior |
|---|---|
| Doctor / Clinician | Uses clinical read models for patients, timelines, allergies, medications, orders, labs, radiology summaries, pharmacy review, alerts, tasks, and care team views. |
| Patient Portal | Uses self-scoped patient portal read models. No guidance replaces clinician advice. |
| Laboratory | Uses laboratory read models for dashboard, orders, specimens, results, critical results, QC, and reports. |
| Radiology | Uses radiology read models for orders, studies, metadata, PACS status, reports, critical findings, and timeline. DICOM image viewing is not implemented. |
| Pharmacy | Uses pharmacy read models for medications, prescriptions, dispensing, inventory, batches, expiration warnings, safety alerts, and controlled medications. No new medication safety backend logic is added. |
| Administration | Uses administration read models for users, roles, tenants, configuration, audit logs, security, privacy, compliance, system health, and release evidence. |
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
- Live read-model rows when the backend returns `demoData: false`.

## Sprint 108 Connection Labels

Role workspace pages now show one of these explicit labels:

| Label | Meaning |
|---|---|
| `LIVE CONNECTED` | A page-level read-model API returned a successful response. |
| `LIVE PARTIAL` | Runtime/OpenAPI status is reachable, but a page-level request has not completed yet. |
| `LIVE API UNAVAILABLE` | No safe matching read endpoint exists or it cannot be reached. |
| `BLOCKED BY AUTH` | Authentication or authorization blocked access. |
| `BLOCKED BY CORS` | Browser CORS blocked access before a usable response. |
| `DEMO MODE` | Demo-only UI data is visible and clearly marked. |
| `DOCUMENTATION ONLY` | The page is backed by documentation or release evidence. |

## Unavailable Data Rules

If a live read-model endpoint is unavailable:

- The page states `Live API unavailable`.
- Demo rows are not presented as live records.
- The relevant OpenAPI and documentation source remains visible.
- Unknown browser API calls are blocked by default.

If a live read-model endpoint returns zero rows:

- The page states that the backend returned zero tenant-scoped records.
- Demo rows remain hidden.
- The endpoint, request ID, tenant, and role remain visible for auditability.

## Security Rules

- Demo Role Switcher is disabled in Live Mode.
- Role navigation is derived from token claims.
- Tenant scope is derived from token claims.
- Browser requests include Authorization and tenant headers.
- Browser requests include user, actor, request ID, and correlation ID headers.
- Browser requests include role and permission headers.
- 401 and 403 responses are shown directly instead of being hidden.
- Operator audit append is restricted to operator role sessions.

## Read Model Guides

- `Live_Read_Model_Guide.md`
- `Live_Clinician_Workspace_Guide.md`
- `Live_Patient_Portal_Guide.md`
- `Live_Laboratory_Workspace_Guide.md`
- `Live_Radiology_Workspace_Guide.md`
- `Live_Pharmacy_Workspace_Guide.md`
- `Live_Admin_Workspace_Guide.md`
