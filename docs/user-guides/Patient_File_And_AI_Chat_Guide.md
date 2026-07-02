# Patient File And AI Chat Guide

## Patient Files

The Patient Files page lets an authenticated clinician attach a patient document record to the governed operational core. The workflow stores the transaction, emits an event, creates read model projections, and records audit evidence.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/files`

## Medical File Analysis

The Medical File Analysis page records file analysis results for clinician review. The analysis record is not a final diagnosis and does not trigger treatment.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/files/analyze`

## Patient AI Chat

The Patient AI Chat page records patient-scoped clinical assistant prompts and review traces. The conversation remains tied to the patient context and requires clinician oversight.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/patients/{patientId}/chat`

## Global AI Chat

The Global AI Chat page records organization-scoped clinical assistant review activity. It is used for governed knowledge review and does not alter patient care.

Route:

`POST https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core/chat`

## Safety Rules

- No autonomous diagnosis.
- No autonomous treatment.
- No patient-facing medical advice replaces clinician advice.
- Audit, tenant isolation, and event projection remain mandatory.
