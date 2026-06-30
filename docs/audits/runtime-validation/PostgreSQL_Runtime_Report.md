# PostgreSQL Runtime Report

Audit date: 2026-06-30

## Decision

PASS.

PostgreSQL runtime validation used a clean Docker-hosted PostgreSQL database.

## Runtime Database

| Item | Value |
|---|---|
| Image | `postgres:16-alpine` |
| Container | `panacea-sprint88-postgres` |
| Network | `panacea-sprint88-net` |
| Database | `panacea_runtime` |
| User | `panacea` |
| Host port | `55432` |
| Readiness check | `pg_isready` PASS |

## Migration Execution

All 9 active service migrations executed successfully with `psql -v ON_ERROR_STOP=1` against a clean database.

| Service migration | Result |
|---|---|
| `001_autonomous_healthcare_intelligence_foundation.sql` | PASS |
| `001_global_ai_assurance_model_risk.sql` | PASS |
| `001_global_compliance_regulatory_intelligence.sql` | PASS |
| `001_global_customer_success_support_service_management.sql` | PASS |
| `001_global_privacy_consent_trust.sql` | PASS |
| `001_global_legal_contracting_risk_governance.sql` | PASS |
| `001_global_product_management_roadmap_innovation.sql` | PASS |
| `001_global_workforce_hr_credentialing_staff_experience.sql` | PASS |
| `001_real_time_global_command_intelligence.sql` | PASS |

## Schema Evidence

| Evidence | Count |
|---|---:|
| Public tables created | 45 |
| Public indexes created | 184 |
| Tables with `tenant_id` columns | 36 |
| Audit actor or user columns | 45 |
| Event outbox tables | 9 |

Event outbox tables:

- `autonomous_healthcare_intelligence_events`
- `global_ai_assurance_events`
- `global_command_intelligence_events`
- `global_compliance_events`
- `global_customer_success_events`
- `global_legal_events`
- `global_privacy_events`
- `global_product_management_events`
- `global_workforce_events`

## Rollback Strategy

No down-migration files are present for the active service migrations. Current rollback support is operational rather than migration-native:

- execute migrations on a clean database before release;
- use database backup and restore for rollback;
- rely on idempotent `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` for safe re-run behavior;
- keep schema migration tracking tables per service.

Recommended next hardening item: introduce explicit reversible migration metadata or rollback drill scripts for release environments.
