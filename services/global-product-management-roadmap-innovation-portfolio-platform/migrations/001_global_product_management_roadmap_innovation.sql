CREATE TABLE IF NOT EXISTS global_product_management_records (
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
  product_id TEXT,
  module_id TEXT,
  capability_id TEXT,
  feature_id TEXT,
  dependency_id TEXT,
  roadmap_id TEXT,
  version_id TEXT,
  release_id TEXT,
  milestone_id TEXT,
  sprint_id TEXT,
  innovation_idea_id TEXT,
  experiment_id TEXT,
  requirement_id TEXT,
  traceability_id TEXT,
  feedback_id TEXT,
  customer_id TEXT,
  clinician_id TEXT,
  patient_id TEXT,
  release_candidate_id TEXT,
  owner_id TEXT,
  approval_id TEXT,
  priority TEXT,
  impact_score NUMERIC(5, 2),
  effort_score NUMERIC(5, 2),
  value_score NUMERIC(5, 2),
  risk_score NUMERIC(5, 2),
  coverage_percent NUMERIC(5, 2),
  planned_start_at TIMESTAMPTZ,
  planned_end_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
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
  CONSTRAINT global_product_management_records_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT global_product_management_records_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT global_product_management_records_group_allowed CHECK (record_group IN (
    'product_management',
    'roadmap_management',
    'innovation_portfolio',
    'requirements_management',
    'product_feedback',
    'release_governance'
  )),
  CONSTRAINT global_product_management_records_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'proposed',
    'active',
    'under_review',
    'reviewed',
    'triaged',
    'prioritized',
    'approved',
    'rejected',
    'planned',
    'in_progress',
    'completed',
    'released',
    'linked',
    'changed',
    'updated',
    'received'
  )),
  CONSTRAINT global_product_management_priority_allowed CHECK (
    priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_product_management_score_bounds CHECK (
    (impact_score IS NULL OR (impact_score >= 0 AND impact_score <= 100))
    AND (effort_score IS NULL OR (effort_score >= 0 AND effort_score <= 100))
    AND (value_score IS NULL OR (value_score >= 0 AND value_score <= 100))
    AND (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
    AND (coverage_percent IS NULL OR (coverage_percent >= 0 AND coverage_percent <= 100))
  ),
  CONSTRAINT global_product_management_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT global_product_management_records_governed CHECK (
    governance_context ->> 'humanGovernanceRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'noClinicalDecisioning' = 'true'
    AND governance_context ->> 'productGovernanceControlled' = 'true'
    AND governance_context ->> 'roadmapApprovalControlled' = 'true'
    AND governance_context ->> 'innovationReviewControlled' = 'true'
    AND governance_context ->> 'releaseGovernanceControlled' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_global_product_management_records_tenant_group ON global_product_management_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_tenant_status ON global_product_management_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_country ON global_product_management_records (tenant_id, country_code, jurisdiction_code);
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_product ON global_product_management_records (tenant_id, product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_feature ON global_product_management_records (tenant_id, feature_id) WHERE feature_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_roadmap ON global_product_management_records (tenant_id, roadmap_id) WHERE roadmap_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_requirement ON global_product_management_records (tenant_id, requirement_id) WHERE requirement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_feedback ON global_product_management_records (tenant_id, feedback_id) WHERE feedback_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_release_candidate ON global_product_management_records (tenant_id, release_candidate_id) WHERE release_candidate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_planned_start ON global_product_management_records (tenant_id, planned_start_at) WHERE planned_start_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_product_management_records_completed ON global_product_management_records (tenant_id, completed_at) WHERE completed_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_product_management_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  product_management_resource_type TEXT NOT NULL,
  product_management_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_product_management_integration_source_allowed CHECK (source_system IN (
    'foundation_platform',
    'developer_platform',
    'marketplace_platform',
    'customer_success_platform',
    'support_platform',
    'legal_governance_platform',
    'enterprise_data_platform',
    'audit_service',
    'notification_service'
  ))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_product_management_integration_unique
  ON global_product_management_integration_references (tenant_id, source_system, source_resource_type, source_resource_id, product_management_resource_type, product_management_resource_id);

CREATE TABLE IF NOT EXISTS global_product_management_events (
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
  CONSTRAINT global_product_management_event_type_allowed CHECK (event_type IN (
    'product.created',
    'feature.created',
    'feature.approved',
    'requirement.created',
    'roadmap.updated',
    'milestone.completed',
    'innovation.idea.submitted',
    'innovation.approved',
    'feedback.received',
    'release.approved'
  ))
);

CREATE INDEX IF NOT EXISTS idx_global_product_management_events_tenant_type ON global_product_management_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_product_management_events_unpublished ON global_product_management_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_product_management_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_product_management_audit_action_nonempty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_global_product_management_audit_tenant_action ON global_product_management_audit_entries (tenant_id, action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_product_management_audit_resource ON global_product_management_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_product_management_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_product_management_schema_migrations (version)
VALUES ('001_global_product_management_roadmap_innovation')
ON CONFLICT (version) DO NOTHING;
