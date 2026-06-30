# Compliance Data Model

Sprint 77 stores records in PostgreSQL table `global_compliance_records`.

Core fields:

| Field | Description |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | Regulatory, compliance, audit, certification, policy, or reporting group |
| `record_type` | Specific Sprint 77 module record type |
| `status` | Controlled lifecycle state |
| `country_code`, `jurisdiction_code` | Multi-country compliance scope |
| `framework_id`, `regulation_id`, `requirement_id` | Regulatory framework and requirement references |
| `change_id`, `impact_assessment_id`, `calendar_id` | Regulatory change, impact, and calendar references |
| `rule_id`, `checklist_id`, `evidence_id`, `gap_id`, `remediation_id` | Compliance automation references |
| `audit_plan_id`, `audit_schedule_id`, `audit_scope_id`, `audit_finding_id` | Audit workflow references |
| `corrective_action_plan_id` | Corrective action plan reference |
| `certification_id`, `certification_requirement_id` | Certification lifecycle references |
| `policy_id`, `attestation_id`, `exception_id`, `violation_id`, `review_id` | Policy compliance references |
| `report_template_id`, `report_id`, `submission_id`, `correspondence_id` | Regulatory reporting references |
| `priority`, `severity`, `compliance_score`, `risk_score`, `readiness_score`, `impact_score` | Compliance and risk measures |
| `policy_controls` | Approved policy and governing body metadata |
| `governance_context` | Human governance, audit, tenant, regulatory access, compliance role, and evidence controls |
| `workflow_controls` | Workflow-specific approvals and evidence references |
| `evidence` | Audit evidence array |
| `metrics`, `metadata` | Structured reporting and extension data |

Supporting tables:

| Table | Purpose |
| --- | --- |
| `global_compliance_integration_references` | Links records to Foundation, Security, Legal & Governance, Quality, Product Management, Enterprise Data, Audit, and Notification services |
| `global_compliance_events` | Persistent event outbox |
| `global_compliance_audit_entries` | Immutable audit trail |
| `global_compliance_schema_migrations` | Applied migration registry |
