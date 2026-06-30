# Docker Readiness Report

Status: static Docker readiness completed for every tracked service.

## Implemented

- Added a production `Dockerfile` to every service.
- Added a `.dockerignore` to every service.
- Used multi-stage dependency/runtime layout.
- Used non-root `node` runtime user.
- Added HTTP health checks against each service liveness endpoint.
- Added service-specific ports and production entrypoints.

## Service Matrix

| `autonomous-healthcare-intelligence-foundation` | Sprint 84 v4 autonomous healthcare intelligence foundation | 41 | 8094 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-ai-assurance-safety-model-risk-management-platform` | Sprint 78 AI assurance and model risk management | 59 | 8146 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-compliance-automation-regulatory-intelligence-platform` | Sprint 77 compliance automation and regulatory intelligence | 48 | 8145 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-customer-success-support-service-management-platform` | Sprint 75 customer success and service management | 52 | 8143 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-enterprise-data-privacy-consent-trust-platform` | Sprint 79 privacy, consent, and trust | 50 | 8147 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-legal-contracting-risk-governance-platform` | Sprint 74 legal, contracting, risk, and governance | 58 | 8142 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-product-management-roadmap-innovation-portfolio-platform` | Sprint 76 product, roadmap, and innovation portfolio | 52 | 8144 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-workforce-hr-credentialing-staff-experience-platform` | Sprint 73 workforce, HR, credentialing, and staff experience | 52 | 8141 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `real-time-global-healthcare-command-intelligence-platform` | Sprint 85 real-time global command intelligence | 51 | 8095 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |

## Runtime Environment Variables

| Service | Port variable | Database URL variable | Default port |
|---|---|---|---:|
| `autonomous-healthcare-intelligence-foundation` | `PORT` | `DATABASE_URL` | 8094 |
| `global-ai-assurance-safety-model-risk-management-platform` | `PANACEA_GLOBAL_AI_ASSURANCE_PORT` | `GLOBAL_AI_ASSURANCE_DATABASE_URL` | 8146 |
| `global-compliance-automation-regulatory-intelligence-platform` | `PANACEA_GLOBAL_COMPLIANCE_PORT` | `GLOBAL_COMPLIANCE_DATABASE_URL` | 8145 |
| `global-customer-success-support-service-management-platform` | `PANACEA_GLOBAL_CUSTOMER_SUCCESS_PORT` | `GLOBAL_CUSTOMER_SUCCESS_DATABASE_URL` | 8143 |
| `global-enterprise-data-privacy-consent-trust-platform` | `PANACEA_GLOBAL_PRIVACY_PORT` | `GLOBAL_PRIVACY_DATABASE_URL` | 8147 |
| `global-legal-contracting-risk-governance-platform` | `PANACEA_GLOBAL_LEGAL_PORT` | `GLOBAL_LEGAL_DATABASE_URL` | 8142 |
| `global-product-management-roadmap-innovation-portfolio-platform` | `PANACEA_GLOBAL_PRODUCT_MANAGEMENT_PORT` | `GLOBAL_PRODUCT_MANAGEMENT_DATABASE_URL` | 8144 |
| `global-workforce-hr-credentialing-staff-experience-platform` | `PANACEA_GLOBAL_WORKFORCE_PORT` | `GLOBAL_WORKFORCE_DATABASE_URL` | 8141 |
| `real-time-global-healthcare-command-intelligence-platform` | `PORT` | `DATABASE_URL` | 8095 |

## Local Docker Build Attempt

A local Docker image build was attempted. Docker Desktop failed while resolving/pulling the base image due to local credential/runtime behavior. Static Docker readiness passed, and CI contains a Docker build matrix so the image build is enforced in a clean CI environment.
