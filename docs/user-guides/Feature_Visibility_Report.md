# Feature Visibility Report

Audit date: 2026-06-30
Release state: Panacea OS Enterprise v4.0 officially released
Sprint context: Sprint 101 web visibility layer

## Summary

Panacea OS v4.0 now has a working professional web platform under `apps/panacea-web`.

The web platform is an operator-facing UI that makes the existing backend release visible:

- Executive release overview.
- System health and service inventory.
- Command intelligence overview.
- Foundation Provider status and probe page.
- Clinical, enterprise, AI, and global capability visibility matrices.
- API Explorer over existing OpenAPI contracts.
- Release Evidence Center.
- Documentation Center.
- Legacy Coverage and New Innovations reports.
- Demo/operator mode.

The web platform does not add clinical business behavior, AI reasoning, diagnosis, treatment recommendations, or new backend services.

## Active Runtime Platform Matrix

| Platform | Has UI | Has API | Has OpenAPI | Has database migration | Has Docker runtime | Has tests | User-visible |
|---|---:|---:|---:|---:|---:|---:|---:|
| Global Workforce, HR, Credentialing and Staff Experience | YES, operator view | YES | YES | YES | YES | YES | YES |
| Global Legal, Contracting, Risk and Enterprise Governance | YES, operator view | YES | YES | YES | YES | YES | YES |
| Global Customer Success, Support and Service Management | YES, operator view | YES | YES | YES | YES | YES | YES |
| Global Product Management, Roadmap and Innovation Portfolio | YES, operator view | YES | YES | YES | YES | YES | YES |
| Global Compliance Automation and Regulatory Intelligence | YES, operator view | YES | YES | YES | YES | YES | YES |
| Global AI Assurance, Safety and Model Risk Management | YES, operator view | YES | YES | YES | YES | YES | YES |
| Global Data Privacy, Consent and Trust | YES, operator view | YES | YES | YES | YES | YES | YES |
| Autonomous Healthcare Intelligence Foundation | YES, operator view | YES | YES | YES | YES | YES | YES |
| Real-Time Global Healthcare Command Intelligence | YES, operator view | YES | YES | YES | YES | YES | YES |
| Live Foundation Provider on `foundation.utbe.ai` | YES, operator status page | YES | No bundled OpenAPI | External validation provider | External nginx/HTTPS runtime | Validated by release checks | YES |

## Web UI Visibility

| UI area | Status | Notes |
|---|---|---|
| Executive Overview | Working | Release status, readiness score, service count, OpenAPI count, test evidence, Foundation status |
| System Health | Working | Active service table, local health/readiness/metrics/OpenAPI URLs |
| Command Intelligence | Working | Details active command intelligence service and endpoints |
| Foundation Provider | Working | Documents live provider URLs and supports browser-level probes |
| Clinical Modules | Working visibility matrix | Shows documentation-backed clinical areas without claiming active runtime services |
| Enterprise Modules | Working visibility matrix | Active governance APIs plus documented enterprise capabilities |
| AI & Governance | Working | Active AI assurance and autonomous intelligence governance surfaces |
| API Explorer | Working | Search/filter OpenAPI operations and generate safe demo curl commands |
| Release Evidence | Working | Shows release closure, CI, validation, tags, Foundation, and evidence docs |
| Documentation Center | Working | Lists repository Markdown documentation and renders selected docs |
| Legacy Coverage | Working | Renders legacy coverage report |
| New Innovations | Working | Renders innovation report and capability cards |
| Demo Mode | Working | Safe operator demo plan and runtime commands |

## Active Runtime Service Inventory

| Service | API base | Host port | OpenAPI path count | Migration | Test files | Visibility |
|---|---|---:|---:|---|---:|---|
| `autonomous-healthcare-intelligence-foundation` | `/api/v4/autonomous-healthcare-intelligence` | `18094` | 41 | `001_autonomous_healthcare_intelligence_foundation.sql` | 4 | Web, OpenAPI, REST, docs |
| `real-time-global-healthcare-command-intelligence-platform` | `/api/v4/global-command-intelligence` | `18095` | 51 | `001_real_time_global_command_intelligence.sql` | 4 | Web, OpenAPI, REST, docs |
| `global-workforce-hr-credentialing-staff-experience-platform` | `/api/v3/global-workforce` | `18141` | 52 | `001_global_workforce_hr_credentialing_staff_experience.sql` | 4 | Web, OpenAPI, REST, docs |
| `global-legal-contracting-risk-governance-platform` | `/api/v3/global-legal-governance` | `18142` | 58 | `001_global_legal_contracting_risk_governance.sql` | 4 | Web, OpenAPI, REST, docs |
| `global-customer-success-support-service-management-platform` | `/api/v3/global-customer-success` | `18143` | 52 | `001_global_customer_success_support_service_management.sql` | 4 | Web, OpenAPI, REST, docs |
| `global-product-management-roadmap-innovation-portfolio-platform` | `/api/v3/global-product-management` | `18144` | 52 | `001_global_product_management_roadmap_innovation.sql` | 4 | Web, OpenAPI, REST, docs |
| `global-compliance-automation-regulatory-intelligence-platform` | `/api/v3/global-compliance` | `18145` | 48 | `001_global_compliance_regulatory_intelligence.sql` | 4 | Web, OpenAPI, REST, docs |
| `global-ai-assurance-safety-model-risk-management-platform` | `/api/v3/global-ai-assurance` | `18146` | 59 | `001_global_ai_assurance_model_risk.sql` | 4 | Web, OpenAPI, REST, docs |
| `global-enterprise-data-privacy-consent-trust-platform` | `/api/v3/global-privacy` | `18147` | 50 | `001_global_privacy_consent_trust.sql` | 4 | Web, OpenAPI, REST, docs |

## Documentation-Backed Areas

The following areas are visible in the web UI but do not have standalone active runtime services in this checkout:

- Patient Registry.
- Clinical Core.
- Laboratory.
- Radiology.
- Pharmacy.
- Scheduling.
- Emergency.
- Inpatient.
- ICU.
- Surgery.
- Nursing.
- Blood Bank.
- Infection Control.
- Revenue Cycle.
- Inventory.
- Analytics.
- Research.
- Telemedicine.
- Patient Portal.
- Population Health.
- Digital Twin.
- Medical Knowledge Graph.
- Marketplace and SDK.

These are classified as documentation-backed or historical coverage until a future approved sprint adds executable services or role-specific workflow UIs.
