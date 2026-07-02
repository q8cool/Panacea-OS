# Operational AI Hospital Core Guide

## Purpose

The Operational AI Hospital Core provides governed patient, file, clinical assistant, prescription, treatment order, report analysis, and workflow action surfaces inside Panacea OS.

The core is available through the doctor workspace and through versioned API routes under:

`https://api.panacea.utbe.ai/api/v4/global-command-intelligence/operational-core`

## Access

1. Open `https://panacea.utbe.ai`.
2. Sign in through the Foundation Provider at `https://foundation.utbe.ai`.
3. Open the doctor workspace.
4. Use the operational pages for patient files, analysis, chat, prescriptions, treatment orders, reports, and workflow actions.

## Main Pages

- Patient Search: patient registration and lookup entry point.
- Patient Profile: governed patient profile context.
- Patient Files: patient document attachment workflow.
- Medical File Analysis: governed clinical file analysis record.
- Patient AI Chat: patient-scoped assistant review trace.
- Global AI Chat: organization-scoped assistant review trace.
- Prescriptions: prescription request and approval workflow.
- Treatment Orders: clinical order request and approval workflow.
- Report Analysis: lab, radiology, and clinical report review.
- Workflow Actions: patient journey advancement with audit.

## API Controls

Every write request requires:

- Foundation authentication
- Tenant isolation
- RBAC and ABAC policy checks
- Human user confirmation
- Audit enabled
- Event projection
- No autonomous diagnosis
- No autonomous treatment

## Operator Verification

Use the Operator Center to review:

- API contracts
- live service health
- transaction evidence
- audit and projection status
- release evidence

## Clinical Boundary

Panacea OS assists workflow review. It does not replace clinicians. Real clinical deployment requires organizational, legal, privacy, regulatory, and clinical approval.
