# Monorepo Orchestration Report

Status: completed.

## Root Scripts

| Script | Purpose |
|---|---|
| `npm run typecheck` | Runs each service syntax/type-equivalent check. |
| `npm run build` | Validates service package shape, OpenAPI, migrations, Docker support, and Kubernetes support. |
| `npm run check` | Runs typecheck, lint, and format validation. |
| `npm run test:run` | Runs all tracked Panacea tests. |
| `npm run test:unit` | Runs service unit-classified tests. |
| `npm run test:integration` | Runs API integration-classified tests. |
| `npm run test:contract` | Runs service contract tests. |
| `npm run openapi` | Regenerates service OpenAPI and syncs contract copies. |
| `npm run audit` | Runs moderate dependency audits for every service package. |
| `npm run lint` | Runs marker scan, OpenAPI versioning validation, Docker readiness, and Kubernetes readiness. |
| `npm run format:check` | Validates JSON and shell script formatting assumptions. |
| `npm run quality:gate` | Runs the full Sprint 86 quality gate. |

## Service Coverage

| `autonomous-healthcare-intelligence-foundation` | Sprint 84 v4 autonomous healthcare intelligence foundation | 41 | 8094 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-ai-assurance-safety-model-risk-management-platform` | Sprint 78 AI assurance and model risk management | 59 | 8146 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-compliance-automation-regulatory-intelligence-platform` | Sprint 77 compliance automation and regulatory intelligence | 48 | 8145 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-customer-success-support-service-management-platform` | Sprint 75 customer success and service management | 52 | 8143 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-enterprise-data-privacy-consent-trust-platform` | Sprint 79 privacy, consent, and trust | 50 | 8147 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-legal-contracting-risk-governance-platform` | Sprint 74 legal, contracting, risk, and governance | 58 | 8142 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-product-management-roadmap-innovation-portfolio-platform` | Sprint 76 product, roadmap, and innovation portfolio | 52 | 8144 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `global-workforce-hr-credentialing-staff-experience-platform` | Sprint 73 workforce, HR, credentialing, and staff experience | 52 | 8141 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
| `real-time-global-healthcare-command-intelligence-platform` | Sprint 85 real-time global command intelligence | 51 | 8095 | Dockerfile, .dockerignore, Kubernetes manifest, OpenAPI, migration, tests |
