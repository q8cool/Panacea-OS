CREATE TABLE IF NOT EXISTS global_legal_records (
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
  facility_id TEXT,
  department_id TEXT,
  legal_matter_id TEXT,
  legal_case_id TEXT,
  legal_document_id TEXT,
  contract_id TEXT,
  contract_template_id TEXT,
  contract_obligation_id TEXT,
  vendor_id TEXT,
  insurance_provider_id TEXT,
  employee_id TEXT,
  clinical_service_id TEXT,
  risk_id TEXT,
  mitigation_plan_id TEXT,
  board_id TEXT,
  committee_id TEXT,
  meeting_id TEXT,
  decision_id TEXT,
  policy_id TEXT,
  policy_version_id TEXT,
  regulatory_obligation_id TEXT,
  regulatory_submission_id TEXT,
  evidence_repository_id TEXT,
  effective_date DATE,
  expiration_date DATE,
  review_due_date DATE,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  risk_score NUMERIC(5, 2),
  risk_level TEXT,
  amount NUMERIC(18, 2),
  currency_code CHAR(3),
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
  CONSTRAINT global_legal_records_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT global_legal_records_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT global_legal_records_group_allowed CHECK (record_group IN (
    'legal_management',
    'contract_management',
    'enterprise_risk_management',
    'governance',
    'policy_management',
    'compliance_regulatory'
  )),
  CONSTRAINT global_legal_records_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'active',
    'open',
    'under_review',
    'reviewed',
    'approved',
    'published',
    'attested',
    'submitted',
    'recorded',
    'scored',
    'mitigated',
    'expiring',
    'expired',
    'completed',
    'compliant',
    'non_compliant',
    'closed',
    'updated'
  )),
  CONSTRAINT global_legal_records_risk_level_allowed CHECK (
    risk_level IS NULL OR risk_level IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_legal_records_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT global_legal_records_governed CHECK (
    governance_context ->> 'humanGovernanceRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'noClinicalDecisioning' = 'true'
    AND governance_context ->> 'legalDataPrivacyControlled' = 'true'
    AND governance_context ->> 'contractAccessControlled' = 'true'
    AND governance_context ->> 'governanceAccessControlled' = 'true'
    AND governance_context ->> 'regulatoryAccessControlled' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_global_legal_records_tenant_group ON global_legal_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_global_legal_records_tenant_status ON global_legal_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_global_legal_records_country ON global_legal_records (tenant_id, country_code, jurisdiction_code);
CREATE INDEX IF NOT EXISTS idx_global_legal_records_matter ON global_legal_records (tenant_id, legal_matter_id) WHERE legal_matter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_legal_records_contract ON global_legal_records (tenant_id, contract_id) WHERE contract_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_legal_records_risk ON global_legal_records (tenant_id, risk_id) WHERE risk_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_legal_records_policy ON global_legal_records (tenant_id, policy_id) WHERE policy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_legal_records_regulatory ON global_legal_records (tenant_id, regulatory_obligation_id) WHERE regulatory_obligation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_legal_records_expiration ON global_legal_records (tenant_id, expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_legal_records_review_due ON global_legal_records (tenant_id, review_due_date) WHERE review_due_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_legal_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  legal_resource_type TEXT NOT NULL,
  legal_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_legal_integration_source_allowed CHECK (source_system IN (
    'foundation_platform',
    'security_platform',
    'compliance_platform',
    'quality_platform',
    'workforce_platform',
    'supply_chain_platform',
    'revenue_cycle_platform',
    'enterprise_platform',
    'audit_service',
    'notification_service'
  ))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_legal_integration_unique
  ON global_legal_integration_references (tenant_id, source_system, source_resource_type, source_resource_id, legal_resource_type, legal_resource_id);

CREATE TABLE IF NOT EXISTS global_legal_events (
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
  CONSTRAINT global_legal_event_type_allowed CHECK (event_type IN (
    'legal.matter.created',
    'contract.created',
    'contract.approved',
    'contract.expiring',
    'risk.created',
    'risk.mitigated',
    'policy.created',
    'policy.approved',
    'policy.published',
    'governance.decision.recorded',
    'regulatory.obligation.updated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_global_legal_events_tenant_type ON global_legal_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_legal_events_unpublished ON global_legal_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_legal_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_legal_audit_action_nonempty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_global_legal_audit_tenant_action ON global_legal_audit_entries (tenant_id, action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_legal_audit_resource ON global_legal_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_legal_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_legal_schema_migrations (version)
VALUES ('001_global_legal_contracting_risk_governance')
ON CONFLICT (version) DO NOTHING;
