# Migration Rollback Strategy

Audit date: 2026-06-30
Decision: PASS WITH CONDITIONS

## Strategy Decision

The active migrations are idempotent forward migrations. They create tables, indexes, constraints, event outbox tables, audit tables, integration references, and migration tracking tables. They do not include down migration scripts.

Rollback for the current release evidence package is backup and restore only.

## Migration Classification

| Migration | Classification | Reason |
|---|---|---|
| `services/autonomous-healthcare-intelligence-foundation/migrations/001_autonomous_healthcare_intelligence_foundation.sql` | Requires backup/restore rollback only | Creates persistent records, events, audit, integration references, indexes, and migration tracking without down script. |
| `services/global-ai-assurance-safety-model-risk-management-platform/migrations/001_global_ai_assurance_model_risk.sql` | Requires backup/restore rollback only | Creates governed AI assurance records, events, audit, integration references, indexes, and migration tracking without down script. |
| `services/global-compliance-automation-regulatory-intelligence-platform/migrations/001_global_compliance_regulatory_intelligence.sql` | Requires backup/restore rollback only | Creates compliance records, audit structures, events, indexes, and migration tracking without down script. |
| `services/global-customer-success-support-service-management-platform/migrations/001_global_customer_success_support_service_management.sql` | Requires backup/restore rollback only | Creates customer success records, audit, events, integration references, indexes, and migration tracking without down script. |
| `services/global-enterprise-data-privacy-consent-trust-platform/migrations/001_global_privacy_consent_trust.sql` | Requires backup/restore rollback only | Creates privacy records, audit, events, integration references, indexes, and migration tracking without down script. |
| `services/global-legal-contracting-risk-governance-platform/migrations/001_global_legal_contracting_risk_governance.sql` | Requires backup/restore rollback only | Creates legal governance records, audit, events, integration references, indexes, and migration tracking without down script. |
| `services/global-product-management-roadmap-innovation-portfolio-platform/migrations/001_global_product_management_roadmap_innovation.sql` | Requires backup/restore rollback only | Creates product governance records, audit, events, integration references, indexes, and migration tracking without down script. |
| `services/global-workforce-hr-credentialing-staff-experience-platform/migrations/001_global_workforce_hr_credentialing_staff_experience.sql` | Requires backup/restore rollback only | Creates workforce records, audit, events, integration references, indexes, and migration tracking without down script. |
| `services/real-time-global-healthcare-command-intelligence-platform/migrations/001_real_time_global_command_intelligence.sql` | Requires backup/restore rollback only | Creates command intelligence records, audit, events, integration references, indexes, and migration tracking without down script. |

## Why Down Migrations Are Not Implemented

The active migrations create release-critical persistence structures. Automatic destructive rollback would risk deleting audit, event, and governance records. The safer current policy is to restore from a verified backup taken before migration execution.

## Rollback Procedure

1. Stop write traffic.
2. Confirm pre-migration backup exists.
3. Stop affected service containers.
4. Restore the database from the approved backup.
5. Validate schema, indexes, event outbox tables, and audit tables.
6. Restart services.
7. Run readiness, health, OpenAPI, and protected-write verification.

## Production Approval Implication

Production release may proceed only if the release board accepts backup/restore rollback for the current schema. Future release hardening should add a migration framework that supports explicit down scripts or reversible change plans.
