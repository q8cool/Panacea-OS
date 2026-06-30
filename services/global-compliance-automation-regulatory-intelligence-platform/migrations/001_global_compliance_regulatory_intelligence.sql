CREATE TABLE IF NOT EXISTS global_compliance_records (
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
  framework_id TEXT,
  regulation_id TEXT,
  requirement_id TEXT,
  change_id TEXT,
  impact_assessment_id TEXT,
  calendar_id TEXT,
  rule_id TEXT,
  checklist_id TEXT,
  evidence_id TEXT,
  gap_id TEXT,
  remediation_id TEXT,
  dashboard_id TEXT,
  audit_plan_id TEXT,
  audit_schedule_id TEXT,
  audit_scope_id TEXT,
  audit_finding_id TEXT,
  corrective_action_plan_id TEXT,
  certification_id TEXT,
  certification_requirement_id TEXT,
  policy_id TEXT,
  attestation_id TEXT,
  exception_id TEXT,
  violation_id TEXT,
  review_id TEXT,
  report_template_id TEXT,
  report_id TEXT,
  submission_id TEXT,
  correspondence_id TEXT,
  owner_id TEXT,
  approval_id TEXT,
  priority TEXT,
  severity TEXT,
  compliance_score NUMERIC(5, 2),
  risk_score NUMERIC(5, 2),
  readiness_score NUMERIC(5, 2),
  impact_score NUMERIC(5, 2),
  effective_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
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
  CONSTRAINT global_compliance_records_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT global_compliance_records_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT global_compliance_records_group_allowed CHECK (record_group IN (
    'regulatory_intelligence',
    'compliance_automation',
    'audit_management',
    'certification_management',
    'policy_compliance',
    'regulatory_reporting'
  )),
  CONSTRAINT global_compliance_records_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'mapped',
    'active',
    'under_review',
    'reviewed',
    'approved',
    'rejected',
    'scheduled',
    'in_progress',
    'completed',
    'closed',
    'expired',
    'expiring',
    'detected',
    'remediated',
    'generated',
    'submitted',
    'updated',
    'changed',
    'validated'
  )),
  CONSTRAINT global_compliance_priority_allowed CHECK (
    priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_compliance_severity_allowed CHECK (
    severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_compliance_score_bounds CHECK (
    (compliance_score IS NULL OR (compliance_score >= 0 AND compliance_score <= 100))
    AND (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
    AND (readiness_score IS NULL OR (readiness_score >= 0 AND readiness_score <= 100))
    AND (impact_score IS NULL OR (impact_score >= 0 AND impact_score <= 100))
  ),
  CONSTRAINT global_compliance_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT global_compliance_records_governed CHECK (
    governance_context ->> 'humanGovernanceRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'noClinicalDecisioning' = 'true'
    AND governance_context ->> 'complianceRoleControlled' = 'true'
    AND governance_context ->> 'regulatoryAccessControlled' = 'true'
    AND governance_context ->> 'evidenceRepositoryAccessControlled' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_global_compliance_records_tenant_group ON global_compliance_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_tenant_status ON global_compliance_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_country ON global_compliance_records (tenant_id, country_code, jurisdiction_code);
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_framework ON global_compliance_records (tenant_id, framework_id) WHERE framework_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_regulation ON global_compliance_records (tenant_id, regulation_id) WHERE regulation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_requirement ON global_compliance_records (tenant_id, requirement_id) WHERE requirement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_rule ON global_compliance_records (tenant_id, rule_id) WHERE rule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_gap ON global_compliance_records (tenant_id, gap_id) WHERE gap_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_audit ON global_compliance_records (tenant_id, audit_plan_id) WHERE audit_plan_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_certification ON global_compliance_records (tenant_id, certification_id) WHERE certification_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_policy ON global_compliance_records (tenant_id, policy_id) WHERE policy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_report ON global_compliance_records (tenant_id, report_id) WHERE report_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_due ON global_compliance_records (tenant_id, due_at) WHERE due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_compliance_records_expires ON global_compliance_records (tenant_id, expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_compliance_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  compliance_resource_type TEXT NOT NULL,
  compliance_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_compliance_integration_source_allowed CHECK (source_system IN (
    'foundation_platform',
    'security_platform',
    'legal_governance_platform',
    'quality_platform',
    'product_management_platform',
    'enterprise_data_platform',
    'audit_service',
    'notification_service'
  ))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_compliance_integration_unique
  ON global_compliance_integration_references (tenant_id, source_system, source_resource_type, source_resource_id, compliance_resource_type, compliance_resource_id);

CREATE TABLE IF NOT EXISTS global_compliance_events (
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
  CONSTRAINT global_compliance_event_type_allowed CHECK (event_type IN (
    'regulation.created',
    'regulation.updated',
    'compliance.check.completed',
    'compliance.gap.detected',
    'audit.created',
    'audit.completed',
    'certification.expiring',
    'policy.violation.detected',
    'regulatory.report.generated',
    'remediation.completed'
  ))
);

CREATE INDEX IF NOT EXISTS idx_global_compliance_events_tenant_type ON global_compliance_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_compliance_events_unpublished ON global_compliance_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_compliance_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_compliance_audit_action_nonempty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_global_compliance_audit_tenant_action ON global_compliance_audit_entries (tenant_id, action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_compliance_audit_resource ON global_compliance_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_compliance_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_compliance_schema_migrations (version)
VALUES ('001_global_compliance_regulatory_intelligence')
ON CONFLICT (version) DO NOTHING;
