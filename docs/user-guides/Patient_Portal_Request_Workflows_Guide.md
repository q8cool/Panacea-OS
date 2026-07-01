# Patient Portal Request Workflows Guide

Patient portal writes are request workflows only. Patients do not directly modify clinical records.

| Workflow | Endpoint | Event |
|---|---|---|
| Request appointment | `/api/v4/global-command-intelligence/write-workflows/patient-portal/appointment-requests` | `patient.appointment.requested` |
| Send secure message | `/api/v4/global-command-intelligence/write-workflows/patient-portal/messages` | `patient.secure.message.sent` |
| Request refill | `/api/v4/global-command-intelligence/write-workflows/patient-portal/refill-requests` | `patient.refill.requested` |
| Request medical report | `/api/v4/global-command-intelligence/write-workflows/patient-portal/medical-report-requests` | `patient.report.requested` |
| Update communication preferences | `/api/v4/global-command-intelligence/write-workflows/patient-portal/preferences` | `patient.communication.preferences.updated` |

The backend requires `patientClinicalRecordModificationBlocked: true` for patient portal workflows.
