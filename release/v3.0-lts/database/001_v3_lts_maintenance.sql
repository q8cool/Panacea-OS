CREATE TABLE IF NOT EXISTS v3_lts_maintenance_records (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  record_group TEXT NOT NULL,
  record_type TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  country_code CHAR(2) NOT NULL,
  region_code TEXT,
  environment TEXT NOT NULL,
  release_channel TEXT NOT NULL,
  affected_service TEXT,
  affected_version TEXT NOT NULL DEFAULT '3.0.0',
  target_version TEXT NOT NULL DEFAULT '3.0.1-LTS',
  patch_id TEXT,
  hotfix_id TEXT,
  maintenance_window_id TEXT,
  support_ticket_id TEXT,
  incident_id TEXT,
  problem_id TEXT,
  change_id TEXT,
  support_bundle_id TEXT,
  diagnostic_report_id TEXT,
  health_snapshot_id TEXT,
  environment_report_id TEXT,
  cve_id TEXT,
  dependency_id TEXT,
  certificate_id TEXT,
  secret_rotation_id TEXT,
  advisory_id TEXT,
  vulnerability_id TEXT,
  global_deployment_id TEXT,
  federation_id TEXT,
  data_residency_policy_id TEXT,
  ai_model_id TEXT,
  prompt_id TEXT,
  agent_id TEXT,
  ai_incident_id TEXT,
  upgrade_validation_id TEXT,
  rollback_validation_id TEXT,
  compatibility_matrix_id TEXT,
  monitoring_id TEXT,
  owner_id TEXT,
  approver_id TEXT,
  priority TEXT,
  severity TEXT,
  risk_level TEXT,
  risk_score NUMERIC(5, 2),
  compatibility_score NUMERIC(5, 2),
  security_score NUMERIC(5, 2),
  readiness_score NUMERIC(5, 2),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  installed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
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
  CONSTRAINT v3_lts_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT v3_lts_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT v3_lts_country_code CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT v3_lts_record_group_allowed CHECK (record_group IN (
    'lts_maintenance_framework',
    'stability_hardening',
    'security_maintenance',
    'global_operations_support',
    'ai_governance_maintenance',
    'upgrade_rollback_support',
    'support_operations',
    'long_term_monitoring'
  )),
  CONSTRAINT v3_lts_status_allowed CHECK (status IN (
    'draft',
    'created',
    'requested',
    'approved',
    'scheduled',
    'started',
    'in_progress',
    'validated',
    'installed',
    'applied',
    'completed',
    'closed',
    'rejected',
    'failed',
    'monitoring'
  )),
  CONSTRAINT v3_lts_release_channel_allowed CHECK (
    release_channel IN ('ga', 'lts', 'maintenance', 'security_hotfix', 'emergency_patch')
  ),
  CONSTRAINT v3_lts_environment_allowed CHECK (
    environment IN ('development', 'staging', 'production', 'disaster_recovery', 'regional', 'global')
  ),
  CONSTRAINT v3_lts_priority_allowed CHECK (
    priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT v3_lts_severity_allowed CHECK (
    severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT v3_lts_risk_level_allowed CHECK (
    risk_level IS NULL OR risk_level IN ('minimal', 'low', 'moderate', 'high', 'critical')
  ),
  CONSTRAINT v3_lts_score_bounds CHECK (
    (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
    AND (compatibility_score IS NULL OR (compatibility_score >= 0 AND compatibility_score <= 100))
    AND (security_score IS NULL OR (security_score >= 0 AND security_score <= 100))
    AND (readiness_score IS NULL OR (readiness_score >= 0 AND readiness_score <= 100))
  ),
  CONSTRAINT v3_lts_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT v3_lts_policy_controlled CHECK (
    policy_controls ->> 'policyApproved' = 'true'
    AND policy_controls ->> 'humanApprovalRequired' = 'true'
    AND policy_controls ->> 'auditPolicyApplied' = 'true'
    AND policy_controls ->> 'tenantIsolationApplied' = 'true'
    AND policy_controls ->> 'globalPolicyEnforced' = 'true'
    AND policy_controls ->> 'aiGovernanceApplied' = 'true'
    AND policy_controls ->> 'supportRolePermissionsApplied' = 'true'
  ),
  CONSTRAINT v3_lts_governed CHECK (
    governance_context ->> 'maintenanceOnly' = 'true'
    AND governance_context ->> 'noNewBusinessFeatures' = 'true'
    AND governance_context ->> 'noNewAiCapabilities' = 'true'
    AND governance_context ->> 'noAutonomousClinicalDecisioning' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'multiCountryGovernanceChecked' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_v3_lts_records_tenant_group ON v3_lts_maintenance_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_tenant_status ON v3_lts_maintenance_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_country ON v3_lts_maintenance_records (tenant_id, country_code, region_code);
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_patch ON v3_lts_maintenance_records (tenant_id, patch_id) WHERE patch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_hotfix ON v3_lts_maintenance_records (tenant_id, hotfix_id) WHERE hotfix_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_support ON v3_lts_maintenance_records (tenant_id, support_ticket_id) WHERE support_ticket_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_ai ON v3_lts_maintenance_records (tenant_id, ai_model_id, prompt_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_upgrade ON v3_lts_maintenance_records (tenant_id, upgrade_validation_id) WHERE upgrade_validation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_v3_lts_records_rollback ON v3_lts_maintenance_records (tenant_id, rollback_validation_id) WHERE rollback_validation_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS v3_lts_events (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '3.0.1-LTS',
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  CONSTRAINT v3_lts_event_type_allowed CHECK (event_type IN (
    'lts.patch.created',
    'lts.patch.approved',
    'lts.patch.installed',
    'hotfix.created',
    'hotfix.applied',
    'maintenance.started',
    'maintenance.completed',
    'support.bundle.generated',
    'upgrade.validated',
    'rollback.validated',
    'ai.safety.patch.applied',
    'global.support.alert.created'
  ))
);

CREATE INDEX IF NOT EXISTS idx_v3_lts_events_tenant_type ON v3_lts_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_v3_lts_events_unpublished ON v3_lts_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS v3_lts_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT v3_lts_audit_country_code CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_v3_lts_audit_actor ON v3_lts_audit_entries (tenant_id, actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_v3_lts_audit_resource ON v3_lts_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS v3_lts_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO v3_lts_migrations (version)
VALUES ('001_v3_lts_maintenance')
ON CONFLICT (version) DO NOTHING;
