# Operational Patient Registration Improvement Report

Date: 2026-07-03  
Branch: `develop/v4.0`

## Decision

PASS. The Hospital Core patient registration workflow now presents a structured operational registration form instead of a minimal identifier-only form.

## Improvements Completed

- Added automatic patient identifier generation in the web client using the `PAT-<timestamp>-<suffix>` format.
- Added automatic medical record number generation using the `MRN-<timestamp>-<suffix>` format.
- Added automatic patient file name generation from patient name and medical record number.
- Marked generated identifiers as read-only so operators do not need to type file numbers manually.
- Added structured registration fields:
  - Patient full name
  - Patient file name
  - Medical record number
  - Blood type
  - Date of birth
  - Gender
  - Phone number
  - Civil ID / national ID
  - Emergency contact
  - Registration reason
  - Address and registration notes
- Updated submitted payload normalization so patient records carry display fields such as `fullName`, `medicalRecordNumber`, `fileNumber`, and `bloodType`.
- Updated read-model projection display fields so the patient list and patient file summary can show the new patient name, patient file name, file number, and blood type.
- Preserved clinical safety boundaries:
  - No autonomous diagnosis
  - No autonomous treatment
  - Human approval remains enforced
  - All write workflows remain tenant-scoped and audited

## Operator Experience

1. Open `https://panacea.utbe.ai/#/hospital-core`.
2. Sign in through Foundation.
3. Select `Create Patient`.
4. Enter the patient full name and demographic/contact fields.
5. The patient ID, medical record number, and patient file name are generated automatically.
6. Submit patient registration.
7. The new patient ID becomes the active patient file identifier for opening the patient file, adding notes, uploading files, and continuing workflows.

## Validation

- `npm run web:check`: PASS
- `node --test tests/real-time-global-healthcare-command-intelligence-platform/write-workflows.test.mjs`: PASS

## Remaining Operator Note

The browser must be able to call the live API through the production CORS allowlist. If patient submission fails in Safari, verify that Nginx/API CORS allows the authenticated browser headers used by Panacea OS.
