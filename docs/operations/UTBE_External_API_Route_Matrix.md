# UTBE External API Route Matrix

Status: controlled external pilot route matrix
Web domain: `https://panacea.utbe.ai`
API domain: `https://api.panacea.utbe.ai`
Expected status: HTTP 200 when the pilot stack, DNS, TLS, and reverse proxy are active
Clinical status: not approved for real clinical production use

| Service | Live URL | Ready URL | Metrics URL | OpenAPI URL | Expected status | Actual status | Operator sign-off |
|---|---|---|---|---|---|---|---|
| autonomous-healthcare-intelligence-foundation | `https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live` | `https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/ready` | `https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/metrics` | `https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/docs/openapi.json` | 200 |  |  |
| real-time-global-healthcare-command-intelligence-platform | `https://api.panacea.utbe.ai/api/v4/global-command-intelligence/live` | `https://api.panacea.utbe.ai/api/v4/global-command-intelligence/ready` | `https://api.panacea.utbe.ai/api/v4/global-command-intelligence/metrics` | `https://api.panacea.utbe.ai/api/v4/global-command-intelligence/docs/openapi.json` | 200 |  |  |
| global-workforce-hr-credentialing-staff-experience-platform | `https://api.panacea.utbe.ai/api/v3/global-workforce/live` | `https://api.panacea.utbe.ai/api/v3/global-workforce/ready` | `https://api.panacea.utbe.ai/api/v3/global-workforce/metrics` | `https://api.panacea.utbe.ai/api/v3/global-workforce/docs/openapi.json` | 200 |  |  |
| global-legal-contracting-risk-governance-platform | `https://api.panacea.utbe.ai/api/v3/global-legal-governance/live` | `https://api.panacea.utbe.ai/api/v3/global-legal-governance/ready` | `https://api.panacea.utbe.ai/api/v3/global-legal-governance/metrics` | `https://api.panacea.utbe.ai/api/v3/global-legal-governance/docs/openapi.json` | 200 |  |  |
| global-customer-success-support-service-management-platform | `https://api.panacea.utbe.ai/api/v3/global-customer-success/live` | `https://api.panacea.utbe.ai/api/v3/global-customer-success/ready` | `https://api.panacea.utbe.ai/api/v3/global-customer-success/metrics` | `https://api.panacea.utbe.ai/api/v3/global-customer-success/docs/openapi.json` | 200 |  |  |
| global-product-management-roadmap-innovation-portfolio-platform | `https://api.panacea.utbe.ai/api/v3/global-product-management/live` | `https://api.panacea.utbe.ai/api/v3/global-product-management/ready` | `https://api.panacea.utbe.ai/api/v3/global-product-management/metrics` | `https://api.panacea.utbe.ai/api/v3/global-product-management/docs/openapi.json` | 200 |  |  |
| global-compliance-automation-regulatory-intelligence-platform | `https://api.panacea.utbe.ai/api/v3/global-compliance/live` | `https://api.panacea.utbe.ai/api/v3/global-compliance/ready` | `https://api.panacea.utbe.ai/api/v3/global-compliance/metrics` | `https://api.panacea.utbe.ai/api/v3/global-compliance/docs/openapi.json` | 200 |  |  |
| global-ai-assurance-safety-model-risk-management-platform | `https://api.panacea.utbe.ai/api/v3/global-ai-assurance/live` | `https://api.panacea.utbe.ai/api/v3/global-ai-assurance/ready` | `https://api.panacea.utbe.ai/api/v3/global-ai-assurance/metrics` | `https://api.panacea.utbe.ai/api/v3/global-ai-assurance/docs/openapi.json` | 200 |  |  |
| global-enterprise-data-privacy-consent-trust-platform | `https://api.panacea.utbe.ai/api/v3/global-privacy/live` | `https://api.panacea.utbe.ai/api/v3/global-privacy/ready` | `https://api.panacea.utbe.ai/api/v3/global-privacy/metrics` | `https://api.panacea.utbe.ai/api/v3/global-privacy/docs/openapi.json` | 200 |  |  |

## Verification Boundary

This matrix proves route expectations only after the operator starts the pilot stack and configures DNS, TLS, and Nginx.

Not approved for real clinical production use.
