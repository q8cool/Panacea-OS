# Product Management Data Model

Sprint 76 stores records in PostgreSQL table `global_product_management_records`.

Core fields:

| Field | Description |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | Product, roadmap, innovation, requirements, feedback, or release governance group |
| `record_type` | Specific Sprint 76 module record type |
| `status` | Controlled lifecycle state |
| `country_code`, `jurisdiction_code` | Multi-country support scope |
| `product_id`, `module_id`, `capability_id`, `feature_id` | Product and feature references |
| `dependency_id`, `roadmap_id`, `version_id`, `release_id` | Roadmap and dependency references |
| `milestone_id`, `sprint_id` | Milestone and sprint planning references |
| `innovation_idea_id`, `experiment_id` | Innovation portfolio references |
| `requirement_id`, `traceability_id` | Requirements management references |
| `feedback_id`, `customer_id`, `clinician_id`, `patient_id` | Feedback source references |
| `release_candidate_id`, `approval_id`, `owner_id` | Release governance and ownership references |
| `impact_score`, `effort_score`, `value_score`, `risk_score`, `coverage_percent` | Portfolio scoring and coverage metrics |
| `policy_controls` | Approved policy and governing body metadata |
| `governance_context` | Human governance, audit, tenant, product, roadmap, innovation, and release controls |
| `workflow_controls` | Workflow-specific approvals and evidence references |
| `evidence` | Audit evidence array |
| `metrics`, `metadata` | Structured reporting and extension data |

Supporting tables:

| Table | Purpose |
| --- | --- |
| `global_product_management_integration_references` | Links records to Foundation, Developer, Marketplace, Customer Success, Support, Legal & Governance, Enterprise Data, Audit, and Notification services |
| `global_product_management_events` | Persistent event outbox |
| `global_product_management_audit_entries` | Immutable audit trail |
| `global_product_management_schema_migrations` | Applied migration registry |
