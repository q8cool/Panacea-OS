# API & OpenAPI Audit

Audit date: 2026-06-30
Branch: `develop/v4.0`
Latest commit: `dfc4fe7 Harden repository integrity and CI deployment readiness`

Validation command: `node scripts/validate-openapi.mjs --check-only` passed.

| OpenAPI file | Paths | Versioned under /api/v... | Request schemas | Response schemas | Error models | Auth requirements | Status |
|---|---:|---|---|---|---|---|---|
| `docs/contracts/openapi/autonomous-healthcare-intelligence-foundation.openapi.json` | 41 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/global-ai-assurance-safety-model-risk-management-platform.openapi.json` | 59 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/global-compliance-automation-regulatory-intelligence-platform.openapi.json` | 48 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/global-customer-success-support-service-management-platform.openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/global-enterprise-data-privacy-consent-trust-platform.openapi.json` | 50 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/global-legal-contracting-risk-governance-platform.openapi.json` | 58 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/global-product-management-roadmap-innovation-portfolio-platform.openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/global-workforce-hr-credentialing-staff-experience-platform.openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `docs/contracts/openapi/real-time-global-healthcare-command-intelligence-platform.openapi.json` | 51 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0-lts/openapi/panacea-v3-lts-maintenance.openapi.json` | 55 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0/openapi/global-ai-assurance-safety-model-risk-management-platform.openapi.json` | 59 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0/openapi/global-compliance-automation-regulatory-intelligence-platform.openapi.json` | 48 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0/openapi/global-customer-success-support-service-management-platform.openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0/openapi/global-enterprise-data-privacy-consent-trust-platform.openapi.json` | 50 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0/openapi/global-legal-contracting-risk-governance-platform.openapi.json` | 58 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0/openapi/global-product-management-roadmap-innovation-portfolio-platform.openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `release/v3.0/openapi/global-workforce-hr-credentialing-staff-experience-platform.openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `services/autonomous-healthcare-intelligence-foundation/docs/openapi.json` | 41 | YES | YES | YES | YES | YES | Valid |
| `services/global-ai-assurance-safety-model-risk-management-platform/docs/openapi.json` | 59 | YES | YES | YES | YES | YES | Valid |
| `services/global-compliance-automation-regulatory-intelligence-platform/docs/openapi.json` | 48 | YES | YES | YES | YES | YES | Valid |
| `services/global-customer-success-support-service-management-platform/docs/openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `services/global-enterprise-data-privacy-consent-trust-platform/docs/openapi.json` | 50 | YES | YES | YES | YES | YES | Valid |
| `services/global-legal-contracting-risk-governance-platform/docs/openapi.json` | 58 | YES | YES | YES | YES | YES | Valid |
| `services/global-product-management-roadmap-innovation-portfolio-platform/docs/openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `services/global-workforce-hr-credentialing-staff-experience-platform/docs/openapi.json` | 52 | YES | YES | YES | YES | YES | Valid |
| `services/real-time-global-healthcare-command-intelligence-platform/docs/openapi.json` | 51 | YES | YES | YES | YES | YES | Valid |

## Findings

- All public paths are versioned under `/api/v...`.
- No broken OpenAPI JSON files were detected.
- All service OpenAPI contracts include bearer authentication and tenant header security schemes.
