# Live Mode Validation Guide

Date: 2026-07-01
Scope: Panacea Web and command intelligence live validation

## Live Mode Principles

- Live Mode must never fall back silently to Demo Mode.
- Live Mode requests require a tenant, role, permission, actor, and bearer token.
- Browser-visible writes are restricted to approved live write workflow endpoints.
- Clinical autonomy remains blocked by required workflow controls.

## Required Headers

```text
Authorization: Bearer validation-token
X-Tenant-Id: tenant-global-command
X-Actor-Id: <role>-pilot-115
X-Roles: doctor | patient | laboratory | radiology | pharmacy | administrator | operator
X-Permissions: global_command_intelligence.read_models.read
X-Country-Codes: KW
X-Region-Codes: GCC
```

Write workflows require:

```text
X-Permissions: global_command_intelligence.write_workflows.write
```

Operator transaction review requires:

```text
X-Permissions: global_command_intelligence.write_workflows.read
```

Projection retry additionally requires:

```text
X-Permissions: global_command_intelligence.write_workflows.retry
```

## Live Read Checks

Doctor:

```bash
curl -H 'Authorization: Bearer validation-token' \
  -H 'X-Tenant-Id: tenant-global-command' \
  -H 'X-Actor-Id: doctor-pilot-115' \
  -H 'X-Roles: doctor' \
  -H 'X-Permissions: global_command_intelligence.read_models.read' \
  -H 'X-Country-Codes: KW' \
  -H 'X-Region-Codes: GCC' \
  http://localhost:18095/api/v4/global-command-intelligence/read-models/clinical/patients
```

Patient portal:

```bash
curl -H 'Authorization: Bearer validation-token' \
  -H 'X-Tenant-Id: tenant-global-command' \
  -H 'X-Actor-Id: patient-pilot-115' \
  -H 'X-Roles: patient' \
  -H 'X-Permissions: global_command_intelligence.read_models.read' \
  -H 'X-Country-Codes: KW' \
  -H 'X-Region-Codes: GCC' \
  http://localhost:18095/api/v4/global-command-intelligence/read-models/patient-portal/me/appointments
```

## Security Negative Checks

Unauthenticated request:

```bash
curl -i http://localhost:18095/api/v4/global-command-intelligence/read-models/clinical/patients
```

Wrong role:

```bash
curl -i -H 'Authorization: Bearer validation-token' \
  -H 'X-Tenant-Id: tenant-global-command' \
  -H 'X-Actor-Id: patient-pilot-115' \
  -H 'X-Roles: patient' \
  -H 'X-Permissions: read' \
  http://localhost:18095/api/v4/global-command-intelligence/read-models/clinical/patients
```

Expected result: HTTP `403` for role boundary violations.

## UI Validation

Open the web app, sign in through Foundation mode or provide an operator JWT, and navigate to:

- Doctor workspace
- Patient portal workspace
- Laboratory workspace
- Radiology workspace
- Pharmacy workspace
- Administration workspace
- Operator transaction review

Expected Live Mode signals:

- `LIVE MODE -- AUTHENTICATED READ-ONLY SESSION`
- `Live Read Model`
- `demoData: false` in API result evidence
- No Demo Mode rows displayed as live rows
- Transaction Review shows event and projection status

## Test Evidence

Run:

```bash
npm run web:check
```

The Sprint 115 web test renders live evidence for doctor, patient, laboratory, radiology, pharmacy, administration, and operator transaction review screens.

