# Panacea OS Usage Summary

Audit date: 2026-06-30
Release status: Panacea OS Enterprise v4.0 officially released
UI status: Professional operator web platform available

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

Use the UI to inspect:

- Release status.
- Runtime service inventory.
- Health, readiness, metrics, and OpenAPI URLs.
- Foundation Provider status.
- Clinical, enterprise, AI, and global capability visibility.
- API contracts and demo curl commands.
- Release evidence.
- Legacy coverage.
- New innovations.
- Documentation and demo instructions.

## 2. What URL do I open?

Open:

```text
http://localhost:5174
```

For production build preview:

```sh
npm run web:build
npm run web:preview
```

Then open:

```text
http://localhost:4174
```

## 3. Is there a visible UI?

Yes. Sprint 101 adds `apps/panacea-web`, a Vite + TypeScript professional web platform.

It is an operator console and demo explorer. It is not yet a direct clinical care application or patient portal.

## 4. If I want to test the backend, how do I do it?

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

## 6. Which legacy features are missing as active runtime services?

The active checkout does not contain standalone runtime services for:

- Direct patient service.
- Direct clinical core care workflows.
- Laboratory.
- Radiology.
- Pharmacy.
- Orders.
- Patient portal.
- API gateway.
- Standalone notification service.
- Standalone audit service.
- Full hospital connection/network service.

Those areas are visible as documentation-backed coverage unless a future approved sprint creates executable services or role-specific UIs.

## 7. What new innovations were added?

Major new capabilities include:

- Professional Panacea web platform.
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

## 8. What should be built next so the operator can visually use the program?

Recommended next UI sprint:

**Authenticated Role Workspace Sprint**

Scope:

- Foundation-backed login.
- Role-aware shell for administrator, operator, clinician, nurse, patient, compliance officer, AI governance officer, and developer.
- Read-only service dashboards with live health polling.
- Safe create/read demo forms for active governance APIs.
- No clinical diagnosis, treatment, or autonomous AI expansion.

## 9. Is Panacea OS currently a backend platform, a full visual application, or both?

It is both a backend platform and an operator-facing web application.

It is not yet a complete visual hospital application for every role. The current UI gives the operator a professional way to inspect, test, and understand the platform without changing product behavior.
