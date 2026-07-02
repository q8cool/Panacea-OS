# Patient File Upload and AI Analysis Guide

## Purpose

This guide explains how to attach medical files and record governed AI-assisted analysis in the restored AI Hospital Core.

## Workflow

1. Sign in through Foundation Auth.
2. Open `https://panacea.utbe.ai/#/hospital-core`.
3. Use Patient Registration if the patient record does not already exist.
4. Use Upload Medical File to attach a report reference to the patient file.
5. Use PDF Text Extraction to record extraction metadata.
6. Select `PDF text extraction`, `OCR fallback`, or `Manual verification` according to the source document.
7. Use AI-Assisted Report Analysis to record the clinician-reviewed interpretation workflow.
8. Use Arabic Medical Translation when governed translation evidence is required.
9. Open Patient Files, Report Interpretation, Patient Timeline, and Audit Trail routes from the Operational Patient File section.

## API Routes

- `POST /api/v4/global-command-intelligence/operational-core/patients/{patientId}/files`
- `POST /api/v4/global-command-intelligence/operational-core/patients/{patientId}/files/{fileId}/extract`
- `POST /api/v4/global-command-intelligence/operational-core/patients/{patientId}/files/analyze`
- `POST /api/v4/global-command-intelligence/operational-core/patients/{patientId}/reports/analyze`
- `POST /api/v4/global-command-intelligence/operational-core/patients/{patientId}/reports/translate`

## Safety Boundary

Analysis and translation outputs are advisory evidence. They do not replace clinician judgment and do not change patient treatment without authorized review.

## Verification

Run:

```bash
npm run openapi
npm run web:check
```

Confirm the browser uses `https://api.panacea.utbe.ai` for all operational routes.

