# Docker Compose Runtime Report

Audit date: 2026-06-30

## Decision

PASS.

## Compose Profile

File:

`infra/docker-compose/runtime/docker-compose.yml`

## Runtime Services

| Service | Container | Host port | Runtime path status |
|---|---|---:|---|
| PostgreSQL | `panacea-runtime-postgres` | 55433 | PASS |
| autonomous-healthcare-intelligence-foundation | `panacea-runtime-autonomous-healthcare-intelligence-foundation` | 18094 | PASS |
| global-workforce-hr-credentialing-staff-experience-platform | `panacea-runtime-global-workforce-hr-credentialing-staff-experience-platform` | 18141 | PASS |
| global-legal-contracting-risk-governance-platform | `panacea-runtime-global-legal-contracting-risk-governance-platform` | 18142 | PASS |
| global-customer-success-support-service-management-platform | `panacea-runtime-global-customer-success-support-service-management-platform` | 18143 | PASS |
| global-product-management-roadmap-innovation-portfolio-platform | `panacea-runtime-global-product-management-roadmap-innovation-portfolio-platform` | 18144 | PASS |
| global-compliance-automation-regulatory-intelligence-platform | `panacea-runtime-global-compliance-automation-regulatory-intelligence-platform` | 18145 | PASS |
| global-ai-assurance-safety-model-risk-management-platform | `panacea-runtime-global-ai-assurance-safety-model-risk-management-platform` | 18146 | PASS |
| global-enterprise-data-privacy-consent-trust-platform | `panacea-runtime-global-enterprise-data-privacy-consent-trust-platform` | 18147 | PASS |
| real-time-global-healthcare-command-intelligence-platform | `panacea-runtime-real-time-global-healthcare-command-intelligence-platform` | 18095 | PASS |

## Validation Results

| Check | Result |
|---|---|
| `docker compose config --quiet` | PASS |
| Compose build | PASS |
| PostgreSQL health check | PASS |
| Migration execution before service validation | PASS |
| Service startup | PASS |
| Health endpoints | PASS |
| Readiness endpoints | PASS |
| Metrics endpoints | PASS |
| OpenAPI runtime endpoints | PASS |
| Structured JSON lifecycle logs | PASS |
| Clean shutdown | PASS |

## Runtime Endpoint Results

| Service | Live | Ready | Metrics | OpenAPI paths |
|---|---:|---:|---:|---:|
| autonomous-healthcare-intelligence-foundation | 200 | 200 | 200 | 41 |
| global-workforce-hr-credentialing-staff-experience-platform | 200 | 200 | 200 | 52 |
| global-legal-contracting-risk-governance-platform | 200 | 200 | 200 | 58 |
| global-customer-success-support-service-management-platform | 200 | 200 | 200 | 52 |
| global-product-management-roadmap-innovation-portfolio-platform | 200 | 200 | 200 | 52 |
| global-compliance-automation-regulatory-intelligence-platform | 200 | 200 | 200 | 48 |
| global-ai-assurance-safety-model-risk-management-platform | 200 | 200 | 200 | 59 |
| global-enterprise-data-privacy-consent-trust-platform | 200 | 200 | 200 | 50 |
| real-time-global-healthcare-command-intelligence-platform | 200 | 200 | 200 | 51 |

## Notes

The Compose profile is local and validation-oriented. It is not a production deployment manifest.
