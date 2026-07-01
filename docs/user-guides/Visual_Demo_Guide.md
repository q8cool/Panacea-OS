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
   - Switch the language selector from English to `العربية` and show the RTL layout.

2. **Demo Role Switcher**
   - Select Doctor, Patient, Laboratory User, Radiology User, Pharmacist, Administrator, and Operator.
   - Explain this is demo-only and does not bypass production security.

3. **Foundation Login**
   - Open `#/auth/login`.
   - Explain Operator Token Mode.
   - Show the configured Foundation URLs.
   - Explain that a real Foundation-issued JWT is required for Live Mode.
   - Do not paste real patient information.

4. **Live API Status**
   - Open `#/command/live-status`.
   - Refresh live status polling.
   - Explain browser-visible states: online, degraded, offline, unauthorized, and unavailable.
   - Explain CORS requirements if browser calls are blocked.

5. **Doctor / Clinician Workspace**
   - Show patient context panel, timeline, allergies, medications, lab/radiology summaries, AI recommendations, alerts, tasks, and care team pages.
   - Point out: `Advisory only. Clinician remains final decision maker.`

6. **Patient Portal Workspace**
   - Show simple patient-facing language, appointments, medications, allergies, results, documents, messages, invoices, notifications, and care instructions.
   - Explain that educational content is not medical advice.

7. **Laboratory Workspace**
   - Show order status, specimen status, turnaround time, critical result flag, validation/approval state, auditability, and integration status.

8. **Radiology Workspace**
   - Show imaging orders, study list, DICOM metadata, PACS status, reporting worklist, report editor shell, approvals, critical findings, timeline, and analytics.
   - Point out: `DICOM image viewer not implemented in this UI sprint.`

9. **Pharmacy Workspace**
   - Show medication catalog, prescription queue, review, dispensing, inventory, batch/lot, expiration, drug safety, controlled medications, and reports.
   - Explain no new medication safety backend logic was added.

10. **Administration Workspace**
   - Show users, roles, permissions, tenants, organizations, facilities, departments, configuration, audit logs, security, privacy, compliance, release evidence, health, APIs, and docs.

11. **API Explorer**
   - Search for `live`.
   - Filter by `GET`.
   - Open an endpoint detail panel.
   - Copy the generated safe curl command.
   - In Arabic mode, point out that labels are Arabic while API paths, URLs, and cURL remain LTR.

12. **Release Evidence**
   - Show official closure, CI, validation, Foundation Provider, and tag evidence.

## Demo Boundaries

- Use only demo/operator mode.
- Do not enter patient information.
- Do not claim live patient records are loaded.
- Do not claim documentation-backed modules are active runtime services.
- Do not claim Live Mode is active unless a Foundation-issued JWT validates.
- Do not claim unavailable browser APIs returned real records.
- Keep all clinical and AI workflows advisory and governed.
- Do not claim English markdown documents are automatically translated. The UI controls are localized; technical documents remain in their authored language.

## Backend Demo Add-On

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

Then refresh **System Health** and use listed runtime URLs.
