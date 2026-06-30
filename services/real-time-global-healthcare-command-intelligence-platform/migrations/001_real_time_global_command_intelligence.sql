CREATE TABLE IF NOT EXISTS global_command_intelligence_records (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  record_group TEXT NOT NULL,
  record_type TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  country_code CHAR(2) NOT NULL,
  region_code TEXT NOT NULL,
  jurisdiction_code TEXT NOT NULL,
  organization_id TEXT,
  command_center_id TEXT,
  command_event_id TEXT,
  situation_id TEXT,
  alert_id TEXT,
  crisis_event_id TEXT,
  coordination_id TEXT,
  recommendation_id TEXT,
  briefing_id TEXT,
  facility_id TEXT,
  department_id TEXT,
  owner_id TEXT,
  approver_id TEXT,
  priority TEXT,
  risk_level TEXT,
  severity TEXT,
  confidence_score NUMERIC(5, 2),
  risk_score NUMERIC(5, 2),
  urgency_score NUMERIC(5, 2),
  capacity_impact_score NUMERIC(5, 2),
  started_at TIMESTAMPTZ,
  updated_at_signal TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
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
  CONSTRAINT gci_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT gci_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT gci_country_code CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT gci_region_nonempty CHECK (length(trim(region_code)) > 0),
  CONSTRAINT gci_record_group_allowed CHECK (record_group IN (
    'global_command_intelligence',
    'real_time_operational_intelligence',
    'global_alert_intelligence',
    'crisis_emergency_coordination',
    'command_decision_support',
    'executive_intelligence'
  )),
  CONSTRAINT gci_status_allowed CHECK (status IN (
    'draft',
    'created',
    'active',
    'updated',
    'classified',
    'prioritized',
    'correlated',
    'escalated',
    'suppressed',
    'review_required',
    'reviewed',
    'resolved',
    'started',
    'mobilized',
    'coordinated',
    'generated',
    'completed',
    'closed'
  )),
  CONSTRAINT gci_priority_allowed CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT gci_severity_allowed CHECK (severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT gci_risk_level_allowed CHECK (risk_level IS NULL OR risk_level IN ('minimal', 'low', 'moderate', 'high', 'critical')),
  CONSTRAINT gci_score_bounds CHECK (
    (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100))
    AND (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
    AND (urgency_score IS NULL OR (urgency_score >= 0 AND urgency_score <= 100))
    AND (capacity_impact_score IS NULL OR (capacity_impact_score >= 0 AND capacity_impact_score <= 100))
  ),
  CONSTRAINT gci_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT gci_policy_controlled CHECK (
    policy_controls ->> 'policyApproved' = 'true'
    AND policy_controls ->> 'humanApprovalRequired' = 'true'
    AND policy_controls ->> 'governanceApprovalRequired' = 'true'
    AND policy_controls ->> 'clinicalApprovalProtected' = 'true'
    AND policy_controls ->> 'auditPolicyApplied' = 'true'
    AND policy_controls ->> 'tenantIsolationApplied' = 'true'
    AND policy_controls ->> 'regionalGovernanceApplied' = 'true'
    AND policy_controls ->> 'countryPolicyApplied' = 'true'
    AND policy_controls ->> 'emergencyAccessGoverned' = 'true'
    AND policy_controls ->> 'autonomousExecutionBlocked' = 'true'
  ),
  CONSTRAINT gci_governed CHECK (
    governance_context ->> 'advisoryOnly' = 'true'
    AND governance_context ->> 'noAutonomousDiagnosis' = 'true'
    AND governance_context ->> 'noAutonomousTreatment' = 'true'
    AND governance_context ->> 'noAutonomousEmergencyEnforcement' = 'true'
    AND governance_context ->> 'clinicianApprovalProtected' = 'true'
    AND governance_context ->> 'governanceApprovalEnforced' = 'true'
    AND governance_context ->> 'explainabilityRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'multiCountryGovernanceChecked' = 'true'
    AND governance_context ->> 'regionalPolicyChecked' = 'true'
    AND governance_context ->> 'countryPolicyChecked' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_gci_records_tenant_group ON global_command_intelligence_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_gci_records_tenant_status ON global_command_intelligence_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_gci_records_country_region ON global_command_intelligence_records (tenant_id, country_code, region_code);
CREATE INDEX IF NOT EXISTS idx_gci_records_alert ON global_command_intelligence_records (tenant_id, alert_id) WHERE alert_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gci_records_crisis ON global_command_intelligence_records (tenant_id, crisis_event_id) WHERE crisis_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gci_records_recommendation ON global_command_intelligence_records (tenant_id, recommendation_id) WHERE recommendation_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_command_intelligence_events (
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
  CONSTRAINT gci_event_type_allowed CHECK (event_type IN (
    'command.center.created',
    'command.event.created',
    'situation.updated',
    'alert.correlated',
    'alert.escalated',
    'crisis.event.created',
    'emergency.coordination.started',
    'command.recommendation.generated',
    'executive.briefing.generated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_gci_events_tenant_type ON global_command_intelligence_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_gci_events_unpublished ON global_command_intelligence_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_command_intelligence_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  region_code TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT gci_audit_country_code CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_gci_audit_actor ON global_command_intelligence_audit_entries (tenant_id, actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_gci_audit_resource ON global_command_intelligence_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_command_intelligence_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  command_resource_type TEXT NOT NULL,
  command_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  region_code TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT gci_integration_source_allowed CHECK (source_system IN (
    'autonomous_intelligence_foundation',
    'ahos_core',
    'enterprise_operations_platform',
    'global_healthcare_platform',
    'public_health_platform',
    'facility_platform',
    'workforce_platform',
    'supply_chain_platform',
    'analytics_platform',
    'audit_service',
    'notification_service'
  )),
  CONSTRAINT gci_integration_country_code CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_gci_integration_source ON global_command_intelligence_integration_references (tenant_id, source_system, source_resource_type);
CREATE INDEX IF NOT EXISTS idx_gci_integration_resource ON global_command_intelligence_integration_references (tenant_id, command_resource_type, command_resource_id);

CREATE TABLE IF NOT EXISTS global_command_intelligence_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_command_intelligence_migrations (version)
VALUES ('001_real_time_global_command_intelligence')
ON CONFLICT (version) DO NOTHING;
