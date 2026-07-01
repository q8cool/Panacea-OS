# Clinician Write Workflows Guide

Clinician Live Mode supports the approved Sprint 113 transactional write workflows.

## Approved Endpoints

| Workflow | Endpoint | Event |
|---|---|---|
| Create patient | `/api/v4/global-command-intelligence/write-workflows/clinical/patients` | `patient.created` |
| Update patient demographics, contact, or emergency contact | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}` | `patient.updated` |
| Create encounter | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}/encounters` | `encounter.created` |
| Create clinical note | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}/notes` | `clinical.note.created` |
| Create allergy | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}/allergies` | `allergy.created` |
| Create condition | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}/conditions` | `condition.created` |
| Create medication record | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}/medications` | `medication.created` |
| Create vital signs | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}/vitals` | `vital.signs.created` |
| Update care team | `/api/v4/global-command-intelligence/write-workflows/clinical/patients/{patientId}/care-team` | `care.team.updated` |

## Safety Boundary

These workflows persist records and events. They do not autonomously diagnose, prescribe, or treat. The clinician remains the final decision maker.

## Required Claims

- Role: `doctor` or approved administrator/operator role.
- Permission: `global_command_intelligence.write_workflows.write`.
- Tenant ID must match the request body.
