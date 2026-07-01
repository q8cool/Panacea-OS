# Live Clinician Workspace Guide

The clinician workspace uses read-only clinical read models in Live Mode.

## Routes

| UI route | Backend read model |
|---|---|
| `#/workspace/doctor/dashboard` | `/api/v4/global-command-intelligence/read-models/clinical/patients` |
| `#/workspace/doctor/patient-search` | `/api/v4/global-command-intelligence/read-models/clinical/patients` |
| `#/workspace/doctor/patient-profile/{id}` | `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}` |
| `#/workspace/doctor/clinical-timeline/{id}` | `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/timeline` |
| `#/workspace/doctor/allergies/{id}` | `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/allergies` |
| `#/workspace/doctor/medications/{id}` | `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/medications` |
| `#/workspace/doctor/lab-results/{id}` | `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/labs` |
| `#/workspace/doctor/radiology-reports/{id}` | `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/radiology` |
| `#/workspace/doctor/pharmacy-review/{id}` | `/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/pharmacy-review` |

## Safety

The clinician workspace remains advisory and read-only. It does not autonomously diagnose, treat, prescribe, approve, or modify clinical records.

## Required Claims

- Role: `doctor` or administrator/operator equivalent.
- Permission: `global_command_intelligence.read_models.read`, wildcard permission, or `read`.
- Tenant: must match persisted read-model rows.

## Empty State

If the backend returns zero rows, the UI displays a live empty state. It does not substitute demo patient rows.
