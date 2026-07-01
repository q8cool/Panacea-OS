# Live Read Model Guide

Sprint 111 adds read-only live read-model endpoints for the Panacea OS role workspaces.

These endpoints are for authenticated viewing only. They do not create orders, diagnoses, treatments, prescriptions, messages, reports, or administrative changes.

## Base Service

The live read models are exposed by:

```text
Real-Time Global Healthcare Command Intelligence Platform
http://localhost:18095/api/v4/global-command-intelligence
```

## Authentication

Every read-model request requires:

- `Authorization: Bearer <Foundation-issued JWT>`
- `X-Tenant-Id`
- `X-Actor-Id` or `X-User-Id`
- `X-Roles`
- `X-Permissions`
- `X-Country-Codes`
- `X-Region-Codes`

The browser sends these from the validated Foundation session in Live Mode.

## Response Boundary

Successful responses use:

```json
{
  "data": {
    "source": "live-read-model",
    "demoData": false,
    "tenantId": "tenant-a",
    "workspace": "clinical",
    "modelKey": "patients",
    "pagination": {
      "limit": 25,
      "offset": 0,
      "total": 0
    },
    "items": []
  }
}
```

The web UI treats `demoData: false` as mandatory for Live Mode display.

## Implemented Read Models

| Workspace | Endpoint examples |
|---|---|
| Clinician | `/api/v4/global-command-intelligence/read-models/clinical/patients`, `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/timeline` |
| Patient portal | `/api/v4/global-command-intelligence/read-models/patient-portal/me`, `/api/v4/global-command-intelligence/read-models/patient-portal/me/labs` |
| Laboratory | `/api/v4/global-command-intelligence/read-models/laboratory/orders`, `/api/v4/global-command-intelligence/read-models/laboratory/critical-results` |
| Radiology | `/api/v4/global-command-intelligence/read-models/radiology/studies`, `/api/v4/global-command-intelligence/read-models/radiology/studies/{studyId}/dicom-metadata` |
| Pharmacy | `/api/v4/global-command-intelligence/read-models/pharmacy/prescriptions`, `/api/v4/global-command-intelligence/read-models/pharmacy/inventory` |
| Administration | `/api/v4/global-command-intelligence/read-models/admin/users`, `/api/v4/global-command-intelligence/read-models/admin/audit-logs` |

## How To Test

1. Start backend runtime:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

2. Start web UI:

```sh
npm run web:dev
```

3. Open:

```text
http://localhost:5174/#/auth/login
```

4. Sign in with a Foundation-issued JWT.

5. Open a role workspace. Live Mode will call the mapped read-model endpoint and show either returned backend rows, an empty tenant-scoped state, or a clear error.

## Data Loading

Sprint 111 defines the read side and persistence tables. Production rows must be populated by approved upstream systems or future governed ingestion workflows. Demo rows are never promoted into live read-model responses.
