# AI Assurance Data Model

Sprint 78 stores records in PostgreSQL table `global_ai_assurance_records`.

Core fields:

| Field | Description |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | Assurance, model risk, safety testing, prompt-agent, monitoring, incident, or regulatory AI governance group |
| `record_type` | Specific Sprint 78 module record type |
| `status` | Controlled lifecycle state |
| `country_code`, `jurisdiction_code` | Multi-country AI governance scope |
| `ai_system_id`, `ai_use_case_id`, `assurance_id` | AI assurance and inventory references |
| `risk_classification_id`, `safety_assessment_id`, `impact_assessment_id` | Assurance assessment references |
| `model_id`, `model_version_id`, `model_risk_id`, `validation_id`, `limitation_id` | Model risk management references |
| `test_id`, `test_case_id`, `test_report_id` | AI safety testing references |
| `prompt_id`, `prompt_version_id`, `agent_id`, `agent_version_id` | Prompt and agent assurance references |
| `permission_review_id`, `behavior_evaluation_id`, `runtime_approval_id` | Agent governance references |
| `monitoring_id`, `drift_monitor_id`, `bias_monitor_id`, `hallucination_monitor_id`, `unsafe_output_monitor_id` | AI monitoring references |
| `incident_id`, `investigation_id`, `corrective_action_id` | AI incident management references |
| `regulatory_requirement_id`, `compliance_mapping_id`, `evidence_repository_id`, `audit_package_id` | Regulatory AI governance references |
| `risk_level`, `risk_score`, `safety_score`, `validation_score`, `bias_score`, `drift_score`, `performance_score`, `readiness_score`, `impact_score` | AI assurance and model risk measures |
| `policy_controls` | Approved policy, human approval, and production promotion controls |
| `governance_context` | Human governance, audit, tenant, AI governance, model, prompt, agent, regulatory, and production promotion controls |
| `workflow_controls` | Workflow-specific approvals and evidence references |
| `evidence` | Audit evidence array |
| `metrics`, `metadata` | Structured reporting and extension data |

Supporting tables:

| Table | Purpose |
| --- | --- |
| `global_ai_assurance_integration_references` | Links records to Foundation, AI Foundation, AI Governance, Clinical Intelligence, Multi-Agent, Learning, Compliance, Security, Audit, and Notification services |
| `global_ai_assurance_events` | Persistent event outbox |
| `global_ai_assurance_audit_entries` | Immutable audit trail |
| `global_ai_assurance_schema_migrations` | Applied migration registry |
