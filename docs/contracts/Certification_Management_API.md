# Certification Management API

The Certification Management API exposes Sprint 77 certification lifecycle endpoints under `/api/v3/global-compliance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-compliance/certifications/registries` | Certification Registry |
| `POST /api/v3/global-compliance/certifications/requirements` | Certification Requirements |
| `POST /api/v3/global-compliance/certifications/evidence` | Certification Evidence |
| `POST /api/v3/global-compliance/certifications/renewals` | Certification Renewal Tracking |
| `POST /api/v3/global-compliance/certifications/expiration-alerts` | Certification Expiration Alerts |
| `POST /api/v3/global-compliance/certifications/readiness-dashboard` | Certification Readiness Dashboard |

Certification workflows support readiness, renewal, evidence, and expiration tracking. Expiration alerts remain advisory operational controls and require review.
