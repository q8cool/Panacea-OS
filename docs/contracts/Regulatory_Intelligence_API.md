# Regulatory Intelligence API

The Regulatory Intelligence API exposes Sprint 77 regulatory tracking endpoints under `/api/v3/global-compliance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-compliance/regulatory/frameworks` | Regulatory Framework Registry |
| `POST /api/v3/global-compliance/regulatory/countries` | Country Regulatory Registry |
| `POST /api/v3/global-compliance/regulatory/regions` | Regional Regulatory Registry |
| `POST /api/v3/global-compliance/regulatory/healthcare-regulations` | Healthcare Regulation Registry |
| `POST /api/v3/global-compliance/regulatory/requirement-mappings` | Regulatory Requirement Mapping |
| `POST /api/v3/global-compliance/regulatory/change-tracking` | Regulatory Change Tracking |
| `POST /api/v3/global-compliance/regulatory/impact-assessments` | Regulatory Impact Assessment |
| `POST /api/v3/global-compliance/regulatory/calendar` | Regulatory Calendar |

Every request requires identity, RBAC, ABAC, tenant isolation, regulatory access controls, compliance role permissions, policy approval, workflow controls, and evidence.
