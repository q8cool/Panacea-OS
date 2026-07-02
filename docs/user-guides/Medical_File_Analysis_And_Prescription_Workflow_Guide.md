# Medical File Analysis And Prescription Workflow Guide

## Report Analysis

The Report Analysis page records governed lab, radiology, and clinical report analysis for clinician review.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/reports/analyze`

## Arabic Clinical Translation

Clinical report translation is recorded as a governed review workflow. The translated wording requires reviewer confirmation.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/reports/translate`

## Prescription Request

Prescription workflows are restored as approval requests. They must be reviewed by a clinician and pass pharmacy safety controls.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/prescriptions`

## Prescription Approval

Approval records clinician approval after safety review. This is an audit and workflow record, not an autonomous prescription action.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/prescriptions/{prescriptionId}/approve`

## Treatment And Order Workflow

Treatment and order workflows are restored as governed request and approval records.

Routes:

- `POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/treatment-orders`
- `POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/treatment-orders/{orderId}/approve`

## Required Controls

- Clinician approval required.
- Pharmacy safety gate required for medication workflows.
- Audit required.
- Tenant isolation required.
- Human user confirmation required.
- No autonomous execution.
