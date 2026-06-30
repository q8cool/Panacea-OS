# Customer Success Data Model

Sprint 75 stores records in PostgreSQL table `global_customer_success_records`.

Core fields:

| Field | Description |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | Customer success, support, service, onboarding, communication, or analytics domain |
| `record_type` | Specific Sprint 75 module record type |
| `status` | Controlled lifecycle state |
| `country_code`, `jurisdiction_code` | Multi-country support scope |
| `customer_id`, `account_id`, `customer_health_score_id` | Customer success references |
| `support_ticket_id`, `sla_id`, `escalation_id`, `assignment_id` | Support workflow references |
| `incident_id`, `problem_id`, `change_id`, `service_request_id` | Service management references |
| `implementation_project_id`, `onboarding_id` | Implementation and onboarding references |
| `communication_id`, `feedback_id`, `survey_id` | Customer communication references |
| `priority`, `severity`, `health_score`, `satisfaction_score`, `adoption_score` | Operational metrics |
| `policy_controls` | Approved policy and governing body metadata |
| `governance_context` | Human governance, audit, tenant, customer-data, support-role, and incident controls |
| `workflow_controls` | Workflow-specific approvals and evidence references |
| `evidence` | Audit evidence array |
| `metrics`, `metadata` | Structured reporting and extension data |

Supporting tables:

| Table | Purpose |
| --- | --- |
| `global_customer_success_integration_references` | Links records to Foundation, Enterprise, DevOps, Security, LTS Maintenance, Legal & Governance, Audit, and Notification services |
| `global_customer_success_events` | Persistent event outbox |
| `global_customer_success_audit_entries` | Immutable audit trail |
| `global_customer_success_schema_migrations` | Applied migration registry |
