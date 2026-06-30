# Legal Governance Data Model

Sprint 74 stores records in PostgreSQL table `global_legal_records`.

Core fields:

| Field | Description |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | Legal, contract, risk, governance, policy, or regulatory domain |
| `record_type` | Specific Sprint 74 module record type |
| `status` | Controlled lifecycle state |
| `country_code`, `jurisdiction_code` | Multi-country governance scope |
| `legal_matter_id`, `legal_case_id`, `legal_document_id` | Legal management references |
| `contract_id`, `contract_template_id`, `contract_obligation_id` | Contract lifecycle references |
| `risk_id`, `risk_score`, `risk_level`, `mitigation_plan_id` | Enterprise risk references |
| `board_id`, `committee_id`, `meeting_id`, `decision_id` | Governance references |
| `policy_id`, `policy_version_id` | Policy lifecycle references |
| `regulatory_obligation_id`, `regulatory_submission_id`, `evidence_repository_id` | Regulatory and evidence references |
| `policy_controls` | Approved policy and governing body metadata |
| `governance_context` | Human governance, audit, tenant, legal, contract, governance, and regulatory controls |
| `workflow_controls` | Workflow-specific approvals, review references, and evidence links |
| `evidence` | Audit evidence array |
| `metrics`, `metadata` | Structured operational and extension data |

Supporting tables:

| Table | Purpose |
| --- | --- |
| `global_legal_integration_references` | Links legal governance records to platform integrations |
| `global_legal_events` | Persistent event outbox |
| `global_legal_audit_entries` | Immutable audit trail |
| `global_legal_schema_migrations` | Applied migration registry |
