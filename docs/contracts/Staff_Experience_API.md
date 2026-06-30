# Staff Experience API

The Staff Experience API supports staff self-service and engagement workflows while preserving HR privacy and organizational access controls.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-workforce/staff-experience/portal` | Staff Portal |
| `POST /api/v3/global-workforce/staff-experience/shift-preferences` | Shift Preferences |
| `POST /api/v3/global-workforce/staff-experience/notifications` | Staff Notifications |
| `POST /api/v3/global-workforce/staff-experience/training-assignments` | Training Assignments |
| `POST /api/v3/global-workforce/staff-experience/performance-feedback` | Performance Feedback |
| `POST /api/v3/global-workforce/staff-experience/incidents` | Incident Reporting |
| `POST /api/v3/global-workforce/staff-experience/wellbeing` | Staff Wellbeing Registry |
| `POST /api/v3/global-workforce/staff-experience/satisfaction-surveys` | Staff Satisfaction Surveys |

Training assignment records require mapped training requirements and compliance review before persistence. Staff experience data remains tenant-isolated and audit-protected.
