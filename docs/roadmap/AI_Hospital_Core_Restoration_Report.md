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
- Patient file attachment workflow
- Patient file analysis workflow
- Patient-scoped clinical assistant chat logging
- Global clinical assistant chat logging
- Prescription approval request workflow
- Prescription doctor approval workflow
- Treatment and order request workflow
- Treatment and order doctor approval workflow
- Lab, radiology, and clinical report analysis workflow
- Arabic clinical report translation workflow
- Patient workflow advancement workflow

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

The doctor workspace now exposes operational pages for:

- Patient Files
- Medical File Analysis
- Patient AI Chat
- Global AI Chat
- Prescriptions
- Treatment Orders
- Report Analysis
- Workflow Actions

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
- Patient file workflows
- Medical file analysis
- Patient and global clinical assistant chat
- Prescription approval boundary
- Treatment and order approval boundary
- Report analysis and Arabic translation route
- Workflow advancement route
- Read model projections
- Audit metadata
- Browser API allowlist enforcement
- Production UTBE API URL usage
- Public workspace text cleanup

## Final Result

The old operational AI Hospital Core has been restored into Panacea OS as governed, auditable, production-oriented operational workflows without weakening clinical safety or Foundation authentication.
