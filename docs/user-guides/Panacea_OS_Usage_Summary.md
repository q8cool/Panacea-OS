# Panacea OS Usage Summary

Audit date: 2026-06-30
Release status: Panacea OS Enterprise v4.0 officially released
UI status: Professional operator and role-based web platform available

## Sprint 110 Operational Demo Update

Panacea OS now includes a visible operational demo layer for the web platform. The role workspaces no longer feel like document-only pages: they render synthetic hospital data for operator review, patient search, chart summaries, patient portal views, laboratory queues, radiology study lists, pharmacy inventory, administration tables, and command-center quick access.

Every synthetic record is labeled:

```text
DEMO DATA — NOT REAL PATIENT DATA
```

The demo data is frontend-only and is not persisted to the production backend. Live Mode remains available for authenticated read-only API evaluation when a Foundation-issued JWT and browser-accessible service endpoints exist.

## Sprint 111 Live Read Model Update

Panacea OS now exposes authenticated backend read-model APIs for the role workspaces through the Real-Time Global Healthcare Command Intelligence Platform:

```text
http://localhost:18095/api/v4/global-command-intelligence/read-models/...
```

Live Mode now maps doctor, patient portal, laboratory, radiology, pharmacy, and administration pages to versioned GET endpoints. The UI displays live records only when the backend response uses `source: live-read-model` and `demoData: false`.

If the backend returns zero rows, the page shows an authenticated empty state. Demo records are not mixed into Live Mode.

New guides:

- `docs/user-guides/Live_Read_Model_Guide.md`
- `docs/user-guides/Live_Clinician_Workspace_Guide.md`
- `docs/user-guides/Live_Patient_Portal_Guide.md`
- `docs/user-guides/Live_Laboratory_Workspace_Guide.md`
- `docs/user-guides/Live_Radiology_Workspace_Guide.md`
- `docs/user-guides/Live_Pharmacy_Workspace_Guide.md`
- `docs/user-guides/Live_Admin_Workspace_Guide.md`
- `docs/user-guides/Demo_To_Production_Boundary_Guide.md`

## Sprint 108 Live Integration Update

Panacea OS now has local live runtime validation for all 9 active services and trusted-origin CORS preflight for `http://localhost:5174`. The web client sends Authorization, tenant, user, actor, request ID, and correlation ID headers for allowed Live Mode requests.

Important: the platform is still read-only from the browser. Role workspaces now have page-level read-model APIs, but production records appear only when approved upstream systems populate the read-model tables for the authenticated tenant.

The deployed `https://foundation.utbe.ai` provider still needs remote routing updates for HEAD, OpenID discovery, auth, audit preflight, and policy preflight. Repository-local provider tests pass for those behaviors.

## Sprint 109 Arabic Localization Update

Panacea OS now supports bilingual web operation:

- English: left-to-right.
- Arabic: right-to-left.

Use the language selector in the top navigation and choose `العربية`. The selection persists after reload through browser local storage.

Arabic mode translates the sidebar, top navigation, status labels, role workspaces, API Explorer controls, demo safety labels, and clinical advisory labels. API paths, URLs, service IDs, cURL commands, code blocks, and English markdown bodies remain English/LTR by design.

Arabic guides:

- `docs/user-guides/Arabic_UI_Guide.md`
- `docs/user-guides/Localization_Guide.md`
- `docs/user-guides/RTL_Layout_Guide.md`
- `docs/user-guides/Arabic_Medical_Terminology_Guide.md`

## 1. How do I use Panacea OS today?

Use the web platform first:

```sh
cd "/Users/faisalalkandari/Documents/New project"
npm --prefix apps/panacea-web install
npm run web:dev
```

Open:

```text
http://localhost:5174
```

Use the **Demo Role Switcher** to open:

- Doctor / Clinician Workspace.
- Patient Portal Workspace.
- Laboratory Workspace.
- Radiology Workspace.
- Pharmacy Workspace.
- Administration Workspace.
- Operator dashboard.

Use the **Language** selector to switch between English and Arabic.

For an operational walkthrough, use:

```text
http://localhost:5174/#/command/executive-overview
http://localhost:5174/#/workspace/doctor/patient-search
http://localhost:5174/#/workspace/patient/appointments
http://localhost:5174/#/workspace/laboratory/result-entry
http://localhost:5174/#/workspace/radiology/dicom-metadata
http://localhost:5174/#/workspace/pharmacy/inventory
http://localhost:5174/#/workspace/administrator/users
```

To test authenticated Live Mode, open:

```text
http://localhost:5174/#/auth/login
```

Use Provider Login if Foundation auth endpoints are deployed. Otherwise paste a Foundation-issued JWT. If the token validates against Foundation issuer and JWKS, the UI switches to Live Mode and derives role, tenant, and permissions from claims.

## 2. What URL do I open?

Open:

```text
http://localhost:5174
```

Direct workspace URLs:

```text
http://localhost:5174/#/workspace/doctor/dashboard
http://localhost:5174/#/workspace/patient/dashboard
http://localhost:5174/#/workspace/laboratory/dashboard
http://localhost:5174/#/workspace/radiology/dashboard
http://localhost:5174/#/workspace/pharmacy/dashboard
http://localhost:5174/#/workspace/administrator/dashboard
http://localhost:5174/#/auth/login
http://localhost:5174/#/command/live-status
```

## 3. Is there a visible UI?

Yes. Panacea OS now has `apps/panacea-web`, a Vite + TypeScript professional web platform with operator and role-based workspaces.

The role workspaces are read-only interfaces with two modes:

- Demo Mode: presentation and documentation-backed visibility with clear demo labels.
- Live Mode: Foundation JWT authenticated, role/tenant scoped, read-only backend read-model connectivity.

They do not execute clinical care, diagnosis, treatment, medication safety backend logic, DICOM image viewing, or production administrative writes.

## 4. How do I test the backend?

Start backend runtime:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

Run validation:

```sh
npm run check
npm run test:run
npm run openapi
npm run runtime:orchestration
npm run runtime:disaster-recovery
```

Open the API Explorer in the web UI or use the service OpenAPI URLs listed under **System Health**.

For browser runtime status, open **Live API Status** and refresh polling. Browser CORS must be configured on Foundation and service endpoints before live calls can succeed.

## 5. Which legacy features are preserved?

Preserved or upgraded coverage includes:

- Deployment packaging and validation.
- Security controls through service-level RBAC, ABAC, tenant context, and Foundation provider contracts.
- Audit evidence through service audit tables and Foundation audit endpoint validation.
- Workflow and governance concepts through active v3/v4 service APIs.
- Documentation, release evidence, runtime orchestration, and disaster recovery validation.
- A web visibility layer replacing the missing legacy frontend with a professional operator console.
- Role-based UI shells for clinician, patient, laboratory, radiology, pharmacy, and administration workflows.
- Authenticated frontend Live Mode with JWT/JWKS validation and read-only API client behavior.

## 6. Which features still require live backend data?

The role workspaces are visual and API-aware. Sprint 111 adds live read models for the following read-only areas:

- Clinical patient lists, summaries, timelines, allergies, conditions, medications, vitals, notes, orders, labs, radiology summaries, pharmacy review, alerts, tasks, and care team views.
- Patient portal profile, appointments, visits, medications, allergies, labs, radiology, documents, invoices, messages, and care instructions.
- Laboratory dashboard, orders, specimens, results, critical results, quality control, and reports.
- Radiology dashboard, orders, studies, DICOM metadata, PACS status, reporting worklist, reports, critical findings, and timeline.
- Pharmacy dashboard, medications, prescriptions, dispensing, inventory, batches, expiration warnings, safety alerts, and controlled medications.
- Administration users, roles, permissions, tenants, organizations, facilities, departments, configuration, audit logs, security, privacy, compliance, system health, and release evidence.

The following still require future governed write workflows or upstream integrations:

- Production ingestion into read-model tables.
- Clinical order creation, result signing, note authoring, and care-team changes.
- Patient message sending, appointment booking, invoice payment, and telemedicine sessions.
- Laboratory order/specimen/result writes.
- Radiology PACS integration, DICOM object retrieval, report writes, and critical finding notifications.
- Pharmacy prescription queues, safety checks, dispensing, inventory, controlled-medication records.
- Admin user, role, permission, tenant, organization, facility, configuration, and audit-log write workflows.

Live Mode does not invent these records. If no read-model row exists for the authenticated tenant, the page displays an authenticated empty state and hides demo rows.

## 7. What new innovations were added?

Major capabilities include:

- Professional Panacea web platform.
- Role-based user workspaces.
- Foundation Provider Login with token validation, refresh, and logout.
- Foundation-backed operator token login.
- JWT claim extraction, expiry handling, issuer checks, tenant and role mapping.
- Read-only browser API client with Authorization, tenant, request ID, and correlation headers.
- Live read-model API surface for role workspaces.
- PostgreSQL live read-model persistence and event outbox table.
- OpenAPI-generated browser API allowlist.
- Foundation login discovery status.
- CORS deployment validation guide.
- Production test JWT workflow guidance.
- Live API status polling and audit-aware browser action display.
- Demo Role Switcher.
- Live Foundation Provider validation at `https://foundation.utbe.ai`.
- Enterprise release evidence package.
- Runtime orchestration validation.
- Disaster recovery validation.
- OpenAPI inventory and explorer.
- AI assurance and model risk governance service.
- Autonomous intelligence governance foundation service.
- Real-time global command intelligence service.
- Compliance automation service.
- Privacy, consent, and trust service.
- Workforce, legal governance, customer success, and product management services.

## 8. What should be built next?

Recommended next UI sprint:

**Live Read Model Population And Operator Seed Sprint**

Scope:

- Define approved non-PHI operator sample rows for read-model tables.
- Add controlled ingestion from existing operational systems into read-model tables.
- Keep browser actions read-only.
- Continue CORS and Foundation deployment validation.
- No clinical diagnosis, treatment, or autonomous AI expansion.

## 9. Is Panacea OS currently a backend platform, a full visual application, or both?

It is both a backend platform and a professional visual web application.

It now includes role-based workspaces and authenticated Live Mode. The workspaces remain read-only and depend on existing live APIs, CORS, and Foundation-issued JWTs for real data.
