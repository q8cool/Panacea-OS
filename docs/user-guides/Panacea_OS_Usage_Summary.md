# Panacea OS Usage Summary

Audit date: 2026-06-30
Release status: Panacea OS Enterprise v4.0 officially released
UI status: Professional operator and role-based web platform available

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
```

## 3. Is there a visible UI?

Yes. Panacea OS now has `apps/panacea-web`, a Vite + TypeScript professional web platform with operator and role-based workspaces.

The role workspaces are read-only demo/operator interfaces. They do not execute clinical care, diagnosis, treatment, medication safety backend logic, DICOM image viewing, or production administrative writes.

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

## 5. Which legacy features are preserved?

Preserved or upgraded coverage includes:

- Deployment packaging and validation.
- Security controls through service-level RBAC, ABAC, tenant context, and Foundation provider contracts.
- Audit evidence through service audit tables and Foundation audit endpoint validation.
- Workflow and governance concepts through active v3/v4 service APIs.
- Documentation, release evidence, runtime orchestration, and disaster recovery validation.
- A web visibility layer replacing the missing legacy frontend with a professional operator console.
- Role-based UI shells for clinician, patient, laboratory, radiology, pharmacy, and administration workflows.

## 6. Which features still require live backend data?

The role workspaces are visual and API-aware, but the following require live authenticated APIs:

- Real patient search and profile data.
- Encounter, order, result, note, and care-team records.
- Patient messages, appointments, documents, invoices, and telemedicine sessions.
- Laboratory order/specimen/result writes.
- Radiology PACS integration, DICOM object retrieval, report writes, and critical finding notifications.
- Pharmacy prescription queues, safety checks, dispensing, inventory, controlled-medication records.
- Admin user, role, permission, tenant, organization, facility, configuration, and audit-log write workflows.

## 7. What new innovations were added?

Major capabilities include:

- Professional Panacea web platform.
- Role-based user workspaces.
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

**Authenticated Live Data Workspace Sprint**

Scope:

- Foundation-backed login.
- Real role claims.
- Read-only API execution from the browser.
- Token, CORS, and error handling.
- Live service polling.
- Audit-aware browser actions.
- No clinical diagnosis, treatment, or autonomous AI expansion.

## 9. Is Panacea OS currently a backend platform, a full visual application, or both?

It is both a backend platform and a professional visual web application.

It now includes role-based workspaces, but those workspaces remain read-only and demo/operator oriented until live backend APIs and production authentication are connected.
