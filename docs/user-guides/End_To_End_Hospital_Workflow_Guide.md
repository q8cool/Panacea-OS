# End To End Hospital Workflow Guide

Date: 2026-07-01
Scope: Sprint 115 pilot validation

## Purpose

This guide explains how to validate the existing Panacea OS transactional hospital workflow without adding new clinical behavior. The validation proves that accepted live write workflows move through:

1. Authenticated API request
2. RBAC and tenant validation
3. Workflow persistence
4. Audit entry
5. Event/outbox entry
6. Projection tracking
7. Read-model update
8. Role-scoped UI visibility
9. Cross-tenant isolation
10. Unauthorized role rejection

## Runtime Startup

Start the runtime profile:

```bash
docker compose -f infra/docker-compose/runtime/docker-compose.yml up -d --build
```

Verify core runtime endpoints:

```bash
curl http://localhost:18094/api/v4/autonomous-healthcare-intelligence/live
curl http://localhost:18095/api/v4/global-command-intelligence/live
curl http://localhost:18146/api/v3/global-ai-assurance/live
curl http://localhost:18147/api/v3/global-privacy/live
```

Use `GET` requests for these runtime checks. The contracts document `GET`; `HEAD` is not the service contract.

## Command Intelligence Base URL

All Sprint 115 transactional journeys use:

```text
http://localhost:18095/api/v4/global-command-intelligence
```

Required headers for a live workflow request:

```text
Authorization: Bearer validation-token
X-Tenant-Id: tenant-global-command
X-Actor-Id: doctor-pilot-115
X-Roles: doctor
X-Permissions: global_command_intelligence.write_workflows.write
X-Country-Codes: KW
X-Region-Codes: GCC
X-Request-Id: sprint115-request-example
X-Correlation-Id: sprint115-correlation-example
Content-Type: application/json
```

## Required Workflow Controls

Every live write payload must include these controls:

```json
{
  "workflowControls": {
    "liveMode": true,
    "demoData": false,
    "auditRequired": true,
    "tenantIsolationConfirmed": true,
    "humanUserConfirmed": true,
    "noAutonomousDiagnosis": true,
    "noAutonomousTreatment": true,
    "noAiGeneratedClinicalDecision": true,
    "patientClinicalRecordModificationBlocked": true,
    "documentedMedicationSafetyRulesApplied": true,
    "sourceBoundary": "foundation-authenticated-live-workflow"
  }
}
```

Patient portal workflows require `patientClinicalRecordModificationBlocked: true`.

Pharmacy workflows require `documentedMedicationSafetyRulesApplied: true`.

## Journeys Validated

| Journey | Event examples | Primary role | UI/read-model visibility |
|---|---|---|---|
| Administration | `tenant.created`, `organization.created`, `department.created`, `user.created`, `role.created`, `role.assigned`, `configuration.updated` | administrator | `/read-models/admin/*` |
| Clinician | `patient.created`, `patient.updated`, `encounter.created`, `clinical.note.created`, `allergy.created`, `condition.created`, `medication.created`, `vital.signs.created`, `care.team.updated` | doctor | `/read-models/clinical/patients*` |
| Laboratory | `lab.order.created`, `specimen.collected`, `specimen.received`, `lab.result.entered`, `lab.result.validated`, `lab.result.approved`, `critical.lab.result.flagged` | laboratory | `/read-models/laboratory/*` and clinical lab summaries |
| Radiology | `imaging.order.created`, `imaging.study.started`, `imaging.study.completed`, `radiology.report.created`, `radiology.report.approved`, `critical.finding.flagged` | radiology | `/read-models/radiology/*` and clinical radiology summaries |
| Pharmacy | `prescription.created`, `prescription.reviewed`, `medication.safety.validated`, `medication.dispensed`, `pharmacy.inventory.updated`, `medication.safety.alert.flagged` | pharmacy | `/read-models/pharmacy/*` and patient medication summaries |
| Scheduling | `appointment.created`, `appointment.updated`, `appointment.checked_in`, `appointment.completed`, `appointment.cancelled` | administrator or doctor | patient portal appointments and clinical order/encounter summaries |
| Patient Portal | `patient.appointment.requested`, `patient.secure.message.sent`, `patient.refill.requested`, `patient.report.requested`, `patient.communication.preferences.updated` | patient | `/read-models/patient-portal/me/*` |
| Operator Review | events, projections, failed projection retry | operator | `/write-workflows/events`, `/write-workflows/projections` |

## Example Create Patient Request

Set the Authorization header from a Foundation-issued token stored outside Git:

```bash
export PANACEA_AUTH_HEADER="Authorization: Bearer <REPLACE_WITH_FOUNDATION_JWT_OUTSIDE_GIT>"
```

```bash
curl -X POST \
  -H "$PANACEA_AUTH_HEADER" \
  -H 'X-Tenant-Id: tenant-global-command' \
  -H 'X-Actor-Id: doctor-pilot-115' \
  -H 'X-Roles: doctor' \
  -H 'X-Permissions: global_command_intelligence.write_workflows.write' \
  -H 'X-Country-Codes: KW' \
  -H 'X-Region-Codes: GCC' \
  -H 'X-Request-Id: sprint115-request-patient-created' \
  -H 'X-Correlation-Id: sprint115-correlation-patient-created' \
  -H 'Content-Type: application/json' \
  http://localhost:18095/api/v4/global-command-intelligence/write-workflows/clinical/patients \
  --data '{
    "tenantId": "tenant-global-command",
    "subjectId": "patient-pilot-115",
    "title": "Sprint 115 pilot patient",
    "reason": "Operator-approved transactional validation",
    "idempotencyKey": "sprint115-patient-created",
    "payload": {
      "detail": "Pilot validation transaction",
      "patientId": "patient-pilot-115"
    },
    "workflowControls": {
      "liveMode": true,
      "demoData": false,
      "auditRequired": true,
      "tenantIsolationConfirmed": true,
      "humanUserConfirmed": true,
      "noAutonomousDiagnosis": true,
      "noAutonomousTreatment": true,
      "noAiGeneratedClinicalDecision": true,
      "patientClinicalRecordModificationBlocked": true,
      "documentedMedicationSafetyRulesApplied": true,
      "sourceBoundary": "foundation-authenticated-live-workflow"
    }
  }'
```

Expected result:

- HTTP `201`
- `data.status` is `accepted`
- `event.eventType` is `patient.created`
- `projections` includes clinical read-model targets
- No autonomous diagnosis or autonomous treatment is generated

## Operator Review

List accepted workflow events:

```bash
curl \
  -H "$PANACEA_AUTH_HEADER" \
  -H 'X-Tenant-Id: tenant-global-command' \
  -H 'X-Actor-Id: operator-pilot-115' \
  -H 'X-Roles: operator' \
  -H 'X-Permissions: global_command_intelligence.write_workflows.read' \
  -H 'X-Country-Codes: KW' \
  -H 'X-Region-Codes: GCC' \
  http://localhost:18095/api/v4/global-command-intelligence/write-workflows/events
```

List projection status:

```bash
curl \
  -H "$PANACEA_AUTH_HEADER" \
  -H 'X-Tenant-Id: tenant-global-command' \
  -H 'X-Actor-Id: operator-pilot-115' \
  -H 'X-Roles: operator' \
  -H 'X-Permissions: global_command_intelligence.write_workflows.read' \
  -H 'X-Country-Codes: KW' \
  -H 'X-Region-Codes: GCC' \
  http://localhost:18095/api/v4/global-command-intelligence/write-workflows/projections
```

## Evidence Locations

- Integration tests: `tests/real-time-global-healthcare-command-intelligence-platform/write-workflows.test.mjs`
- Web tests: `apps/panacea-web/test/app.test.ts`
- OpenAPI: `docs/contracts/openapi/real-time-global-healthcare-command-intelligence-platform.openapi.json`
- Runtime orchestration: `npm run runtime:orchestration`
