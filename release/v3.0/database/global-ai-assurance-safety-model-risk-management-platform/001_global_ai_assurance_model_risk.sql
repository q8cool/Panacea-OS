CREATE TABLE IF NOT EXISTS global_ai_assurance_records (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  record_group TEXT NOT NULL,
  record_type TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  country_code CHAR(2) NOT NULL,
  region_code TEXT,
  jurisdiction_code TEXT NOT NULL,
  organization_id TEXT,
  ai_system_id TEXT,
  ai_use_case_id TEXT,
  assurance_id TEXT,
  risk_classification_id TEXT,
  safety_assessment_id TEXT,
  impact_assessment_id TEXT,
  model_id TEXT,
  model_version_id TEXT,
  model_risk_id TEXT,
  validation_id TEXT,
  limitation_id TEXT,
  test_id TEXT,
  test_case_id TEXT,
  test_report_id TEXT,
  prompt_id TEXT,
  prompt_version_id TEXT,
  agent_id TEXT,
  agent_version_id TEXT,
  permission_review_id TEXT,
  behavior_evaluation_id TEXT,
  runtime_approval_id TEXT,
  monitoring_id TEXT,
  recommendation_monitor_id TEXT,
  drift_monitor_id TEXT,
  bias_monitor_id TEXT,
  hallucination_monitor_id TEXT,
  unsafe_output_monitor_id TEXT,
  performance_monitor_id TEXT,
  incident_id TEXT,
  investigation_id TEXT,
  corrective_action_id TEXT,
  regulatory_requirement_id TEXT,
  compliance_mapping_id TEXT,
  evidence_repository_id TEXT,
  audit_package_id TEXT,
  governance_decision_id TEXT,
  attestation_id TEXT,
  owner_id TEXT,
  approval_id TEXT,
  priority TEXT,
  severity TEXT,
  risk_level TEXT,
  risk_score NUMERIC(5, 2),
  safety_score NUMERIC(5, 2),
  validation_score NUMERIC(5, 2),
  bias_score NUMERIC(5, 2),
  drift_score NUMERIC(5, 2),
  performance_score NUMERIC(5, 2),
  readiness_score NUMERIC(5, 2),
  impact_score NUMERIC(5, 2),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ,
  policy_controls JSONB NOT NULL,
  governance_context JSONB NOT NULL,
  workflow_controls JSONB NOT NULL,
  evidence JSONB NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_ai_assurance_records_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT global_ai_assurance_records_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT global_ai_assurance_records_group_allowed CHECK (record_group IN (
    'ai_assurance',
    'model_risk_management',
    'ai_safety_testing',
    'prompt_agent_assurance',
    'ai_monitoring',
    'ai_incident_management',
    'regulatory_ai_governance'
  )),
  CONSTRAINT global_ai_assurance_records_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'classified',
    'active',
    'under_review',
    'reviewed',
    'approved',
    'rejected',
    'started',
    'in_progress',
    'completed',
    'closed',
    'retired',
    'detected',
    'generated',
    'monitoring',
    'validated',
    'updated'
  )),
  CONSTRAINT global_ai_assurance_priority_allowed CHECK (
    priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_ai_assurance_severity_allowed CHECK (
    severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_ai_assurance_risk_level_allowed CHECK (
    risk_level IS NULL OR risk_level IN ('minimal', 'low', 'moderate', 'high', 'critical')
  ),
  CONSTRAINT global_ai_assurance_score_bounds CHECK (
    (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
    AND (safety_score IS NULL OR (safety_score >= 0 AND safety_score <= 100))
    AND (validation_score IS NULL OR (validation_score >= 0 AND validation_score <= 100))
    AND (bias_score IS NULL OR (bias_score >= 0 AND bias_score <= 100))
    AND (drift_score IS NULL OR (drift_score >= 0 AND drift_score <= 100))
    AND (performance_score IS NULL OR (performance_score >= 0 AND performance_score <= 100))
    AND (readiness_score IS NULL OR (readiness_score >= 0 AND readiness_score <= 100))
    AND (impact_score IS NULL OR (impact_score >= 0 AND impact_score <= 100))
  ),
  CONSTRAINT global_ai_assurance_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT global_ai_assurance_records_governed CHECK (
    governance_context ->> 'humanGovernanceRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'noClinicalDecisioning' = 'true'
    AND governance_context ->> 'aiGovernanceControlled' = 'true'
    AND governance_context ->> 'modelApprovalControlled' = 'true'
    AND governance_context ->> 'promptApprovalControlled' = 'true'
    AND governance_context ->> 'agentApprovalControlled' = 'true'
    AND governance_context ->> 'productionPromotionRequiresApproval' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_tenant_group ON global_ai_assurance_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_tenant_status ON global_ai_assurance_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_country ON global_ai_assurance_records (tenant_id, country_code, jurisdiction_code);
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_ai_system ON global_ai_assurance_records (tenant_id, ai_system_id) WHERE ai_system_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_model ON global_ai_assurance_records (tenant_id, model_id) WHERE model_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_prompt ON global_ai_assurance_records (tenant_id, prompt_id) WHERE prompt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_agent ON global_ai_assurance_records (tenant_id, agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_test ON global_ai_assurance_records (tenant_id, test_id) WHERE test_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_monitoring ON global_ai_assurance_records (tenant_id, monitoring_id) WHERE monitoring_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_incident ON global_ai_assurance_records (tenant_id, incident_id) WHERE incident_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_audit_package ON global_ai_assurance_records (tenant_id, audit_package_id) WHERE audit_package_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_completed ON global_ai_assurance_records (tenant_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_records_detected ON global_ai_assurance_records (tenant_id, detected_at) WHERE detected_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_ai_assurance_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  ai_assurance_resource_type TEXT NOT NULL,
  ai_assurance_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_ai_assurance_integration_source_allowed CHECK (source_system IN (
    'foundation_platform',
    'ai_foundation_platform',
    'ai_governance_platform',
    'clinical_intelligence_platform',
    'multi_agent_platform',
    'learning_platform',
    'compliance_platform',
    'security_platform',
    'audit_service',
    'notification_service'
  ))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_ai_assurance_integration_unique
  ON global_ai_assurance_integration_references (tenant_id, source_system, source_resource_type, source_resource_id, ai_assurance_resource_type, ai_assurance_resource_id);

CREATE TABLE IF NOT EXISTS global_ai_assurance_events (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  CONSTRAINT global_ai_assurance_event_type_allowed CHECK (event_type IN (
    'ai.assurance.review.created',
    'ai.risk.classified',
    'model.validation.started',
    'model.validation.completed',
    'model.approved',
    'model.rejected',
    'prompt.approved',
    'agent.approved',
    'ai.safety.test.completed',
    'ai.incident.created',
    'ai.incident.closed',
    'ai.audit.package.generated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_events_tenant_type ON global_ai_assurance_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_events_unpublished ON global_ai_assurance_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_ai_assurance_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_ai_assurance_audit_action_nonempty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_audit_tenant_action ON global_ai_assurance_audit_entries (tenant_id, action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_ai_assurance_audit_resource ON global_ai_assurance_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_ai_assurance_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_ai_assurance_schema_migrations (version)
VALUES ('001_global_ai_assurance_model_risk')
ON CONFLICT (version) DO NOTHING;
