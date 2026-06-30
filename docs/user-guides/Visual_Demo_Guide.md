# Visual Demo Guide

## Demo Goal

Show Panacea OS v4.0 as a visible, professional, role-aware platform without adding new backend behavior.

## Start Demo

```sh
npm run web:dev
```

Open:

```text
http://localhost:5174
```

## Recommended Walkthrough

1. **Executive Overview**
   - Show official release status.
   - Show active service count.
   - Show OpenAPI and test evidence.
   - Show Foundation Provider status.

2. **Demo Role Switcher**
   - Select Doctor, Patient, Laboratory User, Radiology User, Pharmacist, Administrator, and Operator.
   - Explain this is demo-only and does not bypass production security.

3. **Doctor / Clinician Workspace**
   - Show patient context panel, timeline, allergies, medications, lab/radiology summaries, AI recommendations, alerts, tasks, and care team pages.
   - Point out: `Advisory only. Clinician remains final decision maker.`

4. **Patient Portal Workspace**
   - Show simple patient-facing language, appointments, medications, allergies, results, documents, messages, invoices, notifications, and care instructions.
   - Explain that educational content is not medical advice.

5. **Laboratory Workspace**
   - Show order status, specimen status, turnaround time, critical result flag, validation/approval state, auditability, and integration status.

6. **Radiology Workspace**
   - Show imaging orders, study list, DICOM metadata, PACS status, reporting worklist, report editor shell, approvals, critical findings, timeline, and analytics.
   - Point out: `DICOM image viewer not implemented in this UI sprint.`

7. **Pharmacy Workspace**
   - Show medication catalog, prescription queue, review, dispensing, inventory, batch/lot, expiration, drug safety, controlled medications, and reports.
   - Explain no new medication safety backend logic was added.

8. **Administration Workspace**
   - Show users, roles, permissions, tenants, organizations, facilities, departments, configuration, audit logs, security, privacy, compliance, release evidence, health, APIs, and docs.

9. **API Explorer**
   - Search for `live`.
   - Filter by `GET`.
   - Open an endpoint detail panel.
   - Copy the generated safe curl command.

10. **Release Evidence**
   - Show official closure, CI, validation, Foundation Provider, and tag evidence.

## Demo Boundaries

- Use only demo/operator mode.
- Do not enter patient information.
- Do not claim live patient records are loaded.
- Do not claim documentation-backed modules are active runtime services.
- Keep all clinical and AI workflows advisory and governed.

## Backend Demo Add-On

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

Then refresh **System Health** and use listed runtime URLs.
