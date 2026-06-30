# Docker Runtime Report

Audit date: 2026-06-30

## Decision

PASS.

Docker Desktop was available and all active service images built and ran successfully.

## Docker Environment

| Item | Result |
|---|---|
| Docker CLI | `Docker version 29.5.3, build d1c06ef` |
| Docker engine | Docker Desktop |
| Architecture | `aarch64` engine, `arm64` client |
| PostgreSQL image | `postgres:16-alpine` available |
| Node base image | `node:22-bookworm-slim` pulled successfully |
| Credential or base image pull issue | None |

## Image Build Results

| Service | Image tag | Build |
|---|---|---|
| autonomous-healthcare-intelligence-foundation | `panacea-sprint88/autonomous-healthcare-intelligence-foundation:runtime` | PASS |
| global-ai-assurance-safety-model-risk-management-platform | `panacea-sprint88/global-ai-assurance-safety-model-risk-management-platform:runtime` | PASS |
| global-compliance-automation-regulatory-intelligence-platform | `panacea-sprint88/global-compliance-automation-regulatory-intelligence-platform:runtime` | PASS |
| global-customer-success-support-service-management-platform | `panacea-sprint88/global-customer-success-support-service-management-platform:runtime` | PASS |
| global-enterprise-data-privacy-consent-trust-platform | `panacea-sprint88/global-enterprise-data-privacy-consent-trust-platform:runtime` | PASS |
| global-legal-contracting-risk-governance-platform | `panacea-sprint88/global-legal-contracting-risk-governance-platform:runtime` | PASS |
| global-product-management-roadmap-innovation-portfolio-platform | `panacea-sprint88/global-product-management-roadmap-innovation-portfolio-platform:runtime` | PASS |
| global-workforce-hr-credentialing-staff-experience-platform | `panacea-sprint88/global-workforce-hr-credentialing-staff-experience-platform:runtime` | PASS |
| real-time-global-healthcare-command-intelligence-platform | `panacea-sprint88/real-time-global-healthcare-command-intelligence-platform:runtime` | PASS |

## Runtime Matrix

| Service | Live | Ready | Metrics | OpenAPI paths | JSON logs | Exit code | Startup errors |
|---|---|---|---|---:|---|---:|---|
| autonomous-healthcare-intelligence-foundation | PASS | PASS | PASS | 41 | PASS | 0 | None |
| global-workforce-hr-credentialing-staff-experience-platform | PASS | PASS | PASS | 52 | PASS | 0 | None |
| global-legal-contracting-risk-governance-platform | PASS | PASS | PASS | 58 | PASS | 0 | None |
| global-customer-success-support-service-management-platform | PASS | PASS | PASS | 52 | PASS | 0 | None |
| global-product-management-roadmap-innovation-portfolio-platform | PASS | PASS | PASS | 52 | PASS | 0 | None |
| global-compliance-automation-regulatory-intelligence-platform | PASS | PASS | PASS | 48 | PASS | 0 | None |
| global-ai-assurance-safety-model-risk-management-platform | PASS | PASS | PASS | 59 | PASS | 0 | None |
| global-enterprise-data-privacy-consent-trust-platform | PASS | PASS | PASS | 50 | PASS | 0 | None |
| real-time-global-healthcare-command-intelligence-platform | PASS | PASS | PASS | 51 | PASS | 0 | None |

## Notes

- The first attempted manual loop used zsh variable syntax that produced malformed image references ending in `untime`. The corrected command used `${service}:runtime`; all recorded service results use the corrected tags.
- No Docker Desktop credential failure occurred.
- No startup errors appeared in container logs.
