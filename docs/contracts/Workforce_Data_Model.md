# Workforce Data Model

Sprint 73 stores governed workforce records in PostgreSQL using `global_workforce_records`.

Core fields:

| Field | Description |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | One of workforce management, credentialing, planning, staff experience, HR operations, or compliance |
| `record_type` | Module-specific workflow type |
| `status` | Controlled workflow state |
| `country_code`, `jurisdiction_code` | Multi-country governance scope |
| `facility_id`, `department_id`, `staff_id`, `employee_id`, `provider_id` | Operational references |
| `credential_id`, `license_id`, `certification_id`, `privilege_id` | Credentialing references |
| `shift_id`, `schedule_id`, `leave_request_id` | Scheduling and leave references |
| `policy_controls` | Approved policy metadata and governing body reference |
| `governance_context` | Required human governance, audit, tenant isolation, and no-clinical-decisioning controls |
| `workflow_controls` | Workflow-specific authorization and review controls |
| `evidence` | Audit evidence array |
| `metrics`, `metadata` | Structured operational measurements and extensible context |

Supporting tables:

| Table | Purpose |
| --- | --- |
| `global_workforce_integration_references` | Links records to Foundation, Security, Scheduling, Nursing, Education, Quality, Enterprise, Analytics, Audit, and Notification services |
| `global_workforce_events` | Persistent event outbox |
| `global_workforce_audit_entries` | Immutable audit actions for workforce and integration changes |
| `global_workforce_schema_migrations` | Applied migration registry |
