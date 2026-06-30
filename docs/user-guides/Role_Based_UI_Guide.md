# Role-Based UI Guide

## Overview

Sprint 103 adds role-based user workspaces to the existing Panacea web platform under `apps/panacea-web`.

The role workspaces are:

- Doctor / Clinician.
- Patient Portal.
- Laboratory.
- Radiology.
- Pharmacy.
- Administration.
- Operator.

## Demo Role Switcher

The top navigation includes:

```text
Demo Role Switcher
```

This switcher is for demo and presentation use only. It does not bypass production authentication, authorization, RBAC, ABAC, tenant isolation, consent controls, or audit policy.

## Shared UI Features

Each workspace includes:

- Professional Panacea OS branding.
- Responsive layout.
- Role-based home dashboard.
- Sidebar navigation.
- Top navigation.
- Search.
- Status cards.
- Worklists.
- Detail panels.
- Workflow timeline.
- Readiness charts.
- Empty/live-data-unavailable states.
- API and documentation source panels.
- Clear demo data labels.

## Data Label

Role workspaces display:

```text
DEMO DATA -- NOT REAL PATIENT DATA
```

The UI does not load real patient data.

## Data Sources

The role UI uses existing sources only:

- OpenAPI documents.
- Repository metadata.
- `docs/user-guides/`.
- `docs/contracts/`.
- `docs/releases/`.
- Runtime endpoint metadata.
- Foundation Provider status.
- Existing service endpoint metadata where available.

## Not Implemented In This Sprint

- Backend healthcare features.
- New clinical logic.
- New AI capabilities.
- Diagnosis or treatment execution.
- Medication safety backend logic.
- DICOM image viewer.
- Authenticated production writes.

## Recommended Next UI Sprint

Build authenticated role sessions and safe read-only live-data adapters:

- Foundation-backed login.
- Real role claims.
- Read-only API execution.
- CORS and token handling.
- Audit-aware browser telemetry.
- Optional write workflows only after explicit approval.
