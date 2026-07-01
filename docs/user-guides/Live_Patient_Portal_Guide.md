# Live Patient Portal Guide

The patient portal uses self-scoped read models in Live Mode.

## Routes

| UI route | Backend read model |
|---|---|
| `#/workspace/patient/dashboard` | `/api/v4/global-command-intelligence/read-models/patient-portal/me` |
| `#/workspace/patient/appointments` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/appointments` |
| `#/workspace/patient/visit-history` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/visits` |
| `#/workspace/patient/medications` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/medications` |
| `#/workspace/patient/allergies` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/allergies` |
| `#/workspace/patient/lab-results` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/labs` |
| `#/workspace/patient/radiology-reports` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/radiology` |
| `#/workspace/patient/clinical-documents` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/documents` |
| `#/workspace/patient/secure-messages` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/messages` |
| `#/workspace/patient/invoices-payments` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/invoices` |
| `#/workspace/patient/care-instructions` | `/api/v4/global-command-intelligence/read-models/patient-portal/me/care-instructions` |

## Self Scope

Patient portal read models are scoped to the authenticated actor ID. A patient token cannot request another patient subject through these routes.

## Patient Boundary

Patient-facing content remains informational and does not replace clinician advice.
