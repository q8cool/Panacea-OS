# Workforce API

The Workforce API exposes versioned Sprint 73 endpoints under `/api/v3/global-workforce` for staff registry, employee profiles, assignments, availability, scheduling, shift, leave, and attendance workflows.

All requests require identity context through tenant and actor headers or the equivalent upstream identity token. The service enforces RBAC/ABAC, tenant isolation, country authorization, HR data privacy, auditable workflow controls, and policy approval evidence.

Primary endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-workforce/workforce/staff` | Staff Registry |
| `POST /api/v3/global-workforce/workforce/employees` | Employee Profile |
| `POST /api/v3/global-workforce/workforce/departments` | Department Assignment |
| `POST /api/v3/global-workforce/workforce/roles` | Role Assignment |
| `POST /api/v3/global-workforce/workforce/availability` | Staff Availability |
| `POST /api/v3/global-workforce/workforce/schedules` | Staff Scheduling |
| `POST /api/v3/global-workforce/workforce/shifts` | Shift Management |
| `POST /api/v3/global-workforce/workforce/leave` | Leave Management |
| `POST /api/v3/global-workforce/workforce/attendance` | Attendance Tracking |

Required governance payload sections are `policyControls`, `governanceContext`, `workflowControls`, and `evidence`. Workforce actions never perform diagnosis, treatment, or autonomous clinical decisioning.
