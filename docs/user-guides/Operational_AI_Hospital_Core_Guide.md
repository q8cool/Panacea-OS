# Operational AI Hospital Core Guide

## Purpose

The restored AI Hospital Core is the executable hospital workflow entry for Panacea OS v4. It preserves the operational behavior from the old `ai-hospital-core` archive while running through the modern Panacea Foundation Auth, OpenAPI, event, audit, tenant, and projection layers.

## URLs

- Web application: `https://panacea.utbe.ai/#/hospital-core`
- API base: `https://api.panacea.utbe.ai`
- Foundation provider: `https://foundation.utbe.ai`

## Sign In

1. Open `https://panacea.utbe.ai/#/auth/login`.
2. Sign in with approved Foundation provider credentials.
3. After successful authentication, Panacea opens `#/hospital-core`.
4. Confirm the session banner shows the authenticated user, role, and tenant.

## What You Can Do

The restored hospital core supports:

- Create a patient.
- Open patient list and patient profile routes.
- View patient timeline, files, reports, chat, orders, pharmacy review, workflow, notifications, and audit evidence routes.
- Add a clinical note.
- Attach a medical report.
- Record report text extraction or OCR fallback metadata.
- Record AI-assisted report analysis for clinician review.
- Record patient-scoped AI chat.
- Record global AI chat.
- Record clinical reasoning output.
- Create an order workflow.
- Draft a prescription under doctor approval.
- Run pharmacy safety check workflow.
- Advance a patient workflow.
- Record operational notifications.

## Safety Boundary

The AI Hospital Core does not autonomously diagnose, prescribe, or execute treatment. Clinical output is recorded as governed evidence for authorized clinician review. Prescription and treatment/order flows require human approval boundaries and audit evidence.

## Verification

Run:

```bash
npm run web:check
node --test tests/real-time-global-healthcare-command-intelligence-platform/write-workflows.test.mjs
```

Open:

```text
https://panacea.utbe.ai/#/hospital-core
```

