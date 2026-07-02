# AI Hospital Core Restoration Report

## Decision

Panacea OS restored the operational AI Hospital Core capabilities as governed live workflows inside the existing real-time global command intelligence runtime.

This restoration does not create autonomous diagnosis, autonomous treatment, or autonomous prescribing. Clinical workflows remain advisory, auditable, tenant-scoped, and subject to clinician approval.

## Archive Review

The uploaded archive `ai-hospital-core.zip` was inspected outside the repository. Operational modules identified in the archive included:

- `apps/frontend_web`
- `apps/api_gateway`
- `apps/patient_service`
- `apps/clinical_core`
- `apps/medical_data_service`
- `apps/pharmacy_safety_service`
- `apps/orders_service`
- `apps/workflow_service`
- `apps/knowledge_service`
- `apps/audit_service`
- `apps/notification_service`
- `apps/identity_service`
- shared contract, auth, event, tenant, and logging packages

Build output, package caches, transient runtime logs, and local environment folders from the archive were not copied.

## Gap Found

The current v4 web workspaces had professional role pages and live service health, but several clinical surfaces were still represented as governed workspace views instead of operational hospital workflows. The legacy archive contained executable routes for patients, files, clinical file intelligence, patient chat, global chat, prescriptions, orders, workflow advancement, audit, and notifications.

## Restored Scope

The restored scope is implemented through OpenAPI-backed runtime routes under:

`/api/v4/global-command-intelligence/operational-core`

Restored governed operations:

- Patient registration
- Patient profile read model linkage
- Clinical note creation
- Patient file attachment workflow
- PDF text extraction and OCR fallback metadata workflow
- Patient file analysis workflow
- Patient-scoped clinical assistant chat logging
- Global clinical assistant chat logging
- Clinical reasoning workflow logging
- Prescription approval request workflow
- Prescription doctor approval workflow
- Pharmacy safety check workflow
- Order creation workflow
- Treatment and order request workflow
- Treatment and order doctor approval workflow
- Lab, radiology, and clinical report analysis workflow
- Arabic clinical report translation workflow
- Patient workflow advancement workflow
- Patient-linked notification workflow

## Backend Integration

The restoration uses the existing PostgreSQL-backed command intelligence service because it already provides:

- Foundation-authenticated request handling
- RBAC and ABAC-aware principal validation
- Tenant isolation
- Audit entries
- Event persistence
- Event outbox behavior
- Read model projection
- OpenAPI generation
- Docker runtime support

No standalone healthcare service was added.

## Web Integration

The web application now exposes `#/hospital-core` as the restored operational product entry after Foundation login. It includes executable forms for:

- Patient Registration
- Add Clinical Note
- Upload Medical File
- PDF Text Extraction
- AI-Assisted Report Analysis
- Arabic Medical Translation
- Patient-Isolated AI Chat
- Global AI Chat
- Clinical Reasoning Workflow
- Create Order
- Draft Prescription
- Pharmacy Safety Check
- Advance Workflow
- Operational Notification

The doctor workspace still exposes operational routes for patient files, report analysis, patient chat, global chat, prescriptions, treatment orders, workflow actions, pharmacy review, and clinical reasoning, and those routes now use the restored operational backend mappings.

The patient registration action now uses the operational core route rather than a generic write route.

Production web links use:

- Web: `https://panacea.utbe.ai`
- API: `https://api.panacea.utbe.ai`
- Foundation Auth: `https://foundation.utbe.ai`

## Safety Boundary

Prescription and treatment order workflows are restored as approval workflows only. They record requests, approvals, safety gates, and audit evidence. They do not execute treatment, prescribe without a clinician, or bypass pharmacy review.

## Verification

Added tests cover:

- Operational core route matching
- OpenAPI publication
- Patient registration and clinical note execution
- Patient file workflows
- PDF text extraction and OCR fallback metadata route
- Medical file analysis
- Patient and global clinical assistant chat
- Clinical reasoning workflow
- Prescription approval boundary
- Pharmacy safety workflow
- Treatment and order approval boundary
- Order creation
- Report analysis and Arabic translation route
- Workflow advancement route
- Notification workflow
- Read model projections
- Audit metadata
- Browser API allowlist enforcement
- Production UTBE API URL usage
- Public workspace text cleanup

Validation commands executed:

```bash
npm run check
npm run build
npm run test:run
npm run openapi
npm run web:check
npm run web:build
npm run quality:gate
```

Results:

- `npm run check`: PASS
- `npm run build`: PASS
- `npm run test:run`: PASS, 156 tests
- `npm run openapi`: PASS, 26 OpenAPI documents
- `npm run web:check`: PASS, 64 web tests
- `npm run web:build`: PASS
- `npm run quality:gate`: PASS

## Final Result

The old operational AI Hospital Core has been restored into Panacea OS as governed, auditable, production-oriented operational workflows without weakening clinical safety or Foundation authentication.
