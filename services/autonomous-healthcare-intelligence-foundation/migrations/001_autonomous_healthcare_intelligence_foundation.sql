CREATE TABLE IF NOT EXISTS autonomous_healthcare_intelligence_records (
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
  intelligence_id TEXT,
  capability_id TEXT,
  policy_id TEXT,
  runtime_governance_id TEXT,
  safety_layer_id TEXT,
  approval_workflow_id TEXT,
  recommendation_id TEXT,
  review_rule_id TEXT,
  escalation_rule_id TEXT,
  override_id TEXT,
  orchestrator_id TEXT,
  context_broker_id TEXT,
  event_router_id TEXT,
  decision_registry_id TEXT,
  workflow_controller_id TEXT,
  trace_id TEXT,
  evidence_trace_id TEXT,
  approval_trace_id TEXT,
  audit_package_id TEXT,
  emergency_stop_id TEXT,
  owner_id TEXT,
  approver_id TEXT,
  priority TEXT,
  risk_level TEXT,
  risk_score NUMERIC(5, 2),
  safety_score NUMERIC(5, 2),
  governance_score NUMERIC(5, 2),
  traceability_score NUMERIC(5, 2),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  blocked_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
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
  CONSTRAINT ahi_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT ahi_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT ahi_country_code CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT ahi_record_group_allowed CHECK (record_group IN (
    'autonomous_intelligence_foundation',
    'clinical_intelligence_governance',
    'enterprise_intelligence_orchestration',
    'safety_control',
    'explainability_traceability'
  )),
  CONSTRAINT ahi_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'created',
    'active',
    'classified',
    'under_review',
    'review_required',
    'approval_required',
    'approved',
    'rejected',
    'blocked',
    'started',
    'in_progress',
    'completed',
    'escalated',
    'overridden',
    'stopped',
    'generated',
    'archived'
  )),
  CONSTRAINT ahi_priority_allowed CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT ahi_risk_level_allowed CHECK (risk_level IS NULL OR risk_level IN ('minimal', 'low', 'moderate', 'high', 'critical')),
  CONSTRAINT ahi_score_bounds CHECK (
    (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
    AND (safety_score IS NULL OR (safety_score >= 0 AND safety_score <= 100))
    AND (governance_score IS NULL OR (governance_score >= 0 AND governance_score <= 100))
    AND (traceability_score IS NULL OR (traceability_score >= 0 AND traceability_score <= 100))
  ),
  CONSTRAINT ahi_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT ahi_policy_controlled CHECK (
    policy_controls ->> 'policyApproved' = 'true'
    AND policy_controls ->> 'humanApprovalRequired' = 'true'
    AND policy_controls ->> 'clinicianApprovalRequired' = 'true'
    AND policy_controls ->> 'auditPolicyApplied' = 'true'
    AND policy_controls ->> 'tenantIsolationApplied' = 'true'
    AND policy_controls ->> 'aiGovernanceApplied' = 'true'
    AND policy_controls ->> 'clinicalApprovalApplied' = 'true'
    AND policy_controls ->> 'emergencyStopAuthorized' = 'true'
    AND policy_controls ->> 'autonomousActionBlocked' = 'true'
  ),
  CONSTRAINT ahi_governed CHECK (
    governance_context ->> 'advisoryOnly' = 'true'
    AND governance_context ->> 'noAutonomousDiagnosis' = 'true'
    AND governance_context ->> 'noAutonomousTreatment' = 'true'
    AND governance_context ->> 'clinicianApprovalEnforced' = 'true'
    AND governance_context ->> 'explainabilityRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'multiCountryGovernanceChecked' = 'true'
    AND governance_context ->> 'privacyConsentChecked' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_ahi_records_tenant_group ON autonomous_healthcare_intelligence_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_ahi_records_tenant_status ON autonomous_healthcare_intelligence_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ahi_records_country ON autonomous_healthcare_intelligence_records (tenant_id, country_code, region_code);
CREATE INDEX IF NOT EXISTS idx_ahi_records_recommendation ON autonomous_healthcare_intelligence_records (tenant_id, recommendation_id) WHERE recommendation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ahi_records_trace ON autonomous_healthcare_intelligence_records (tenant_id, trace_id) WHERE trace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ahi_records_emergency_stop ON autonomous_healthcare_intelligence_records (tenant_id, emergency_stop_id) WHERE emergency_stop_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS autonomous_healthcare_intelligence_events (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '4.0.0',
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  CONSTRAINT ahi_event_type_allowed CHECK (event_type IN (
    'intelligence.capability.registered',
    'intelligence.policy.created',
    'recommendation.governance.started',
    'recommendation.governance.completed',
    'human.approval.required',
    'unsafe.recommendation.blocked',
    'intelligence.trace.created',
    'governance.audit.generated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_ahi_events_tenant_type ON autonomous_healthcare_intelligence_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ahi_events_unpublished ON autonomous_healthcare_intelligence_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS autonomous_healthcare_intelligence_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT ahi_audit_country_code CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_ahi_audit_actor ON autonomous_healthcare_intelligence_audit_entries (tenant_id, actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ahi_audit_resource ON autonomous_healthcare_intelligence_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS autonomous_healthcare_intelligence_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  intelligence_resource_type TEXT NOT NULL,
  intelligence_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT ahi_integration_source_allowed CHECK (source_system IN (
    'ai_runtime_v2',
    'ahos_core',
    'clinical_intelligence_platform',
    'ai_assurance_platform',
    'privacy_consent_platform',
    'global_knowledge_network',
    'enterprise_data_platform',
    'audit_service',
    'notification_service'
  )),
  CONSTRAINT ahi_integration_country_code CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_ahi_integration_source ON autonomous_healthcare_intelligence_integration_references (tenant_id, source_system, source_resource_type);
CREATE INDEX IF NOT EXISTS idx_ahi_integration_resource ON autonomous_healthcare_intelligence_integration_references (tenant_id, intelligence_resource_type, intelligence_resource_id);

CREATE TABLE IF NOT EXISTS autonomous_healthcare_intelligence_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO autonomous_healthcare_intelligence_migrations (version)
VALUES ('001_autonomous_healthcare_intelligence_foundation')
ON CONFLICT (version) DO NOTHING;
