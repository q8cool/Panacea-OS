CREATE TABLE IF NOT EXISTS global_privacy_records (
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
  data_subject_id TEXT,
  patient_id TEXT,
  consent_id TEXT,
  consent_version_id TEXT,
  consent_scope_id TEXT,
  data_rights_request_id TEXT,
  privacy_policy_id TEXT,
  purpose_id TEXT,
  minimization_rule_id TEXT,
  retention_policy_id TEXT,
  privacy_exception_id TEXT,
  sharing_agreement_id TEXT,
  sharing_purpose_id TEXT,
  sharing_approval_id TEXT,
  source_organization_id TEXT,
  recipient_organization_id TEXT,
  trust_relationship_id TEXT,
  trust_profile_id TEXT,
  data_processor_id TEXT,
  data_controller_id TEXT,
  trusted_partner_id TEXT,
  verification_id TEXT,
  monitoring_id TEXT,
  violation_id TEXT,
  privacy_incident_id TEXT,
  risk_assessment_id TEXT,
  owner_id TEXT,
  reviewer_id TEXT,
  approval_id TEXT,
  priority TEXT,
  severity TEXT,
  risk_level TEXT,
  risk_score NUMERIC(5, 2),
  compliance_score NUMERIC(5, 2),
  consent_coverage_score NUMERIC(5, 2),
  trust_score NUMERIC(5, 2),
  fulfillment_score NUMERIC(5, 2),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
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
  CONSTRAINT global_privacy_records_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT global_privacy_records_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT global_privacy_records_country_code CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT global_privacy_records_group_allowed CHECK (record_group IN (
    'global_consent',
    'patient_data_rights',
    'privacy_policy_engine',
    'data_sharing_governance',
    'trust_platform',
    'privacy_monitoring'
  )),
  CONSTRAINT global_privacy_records_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'active',
    'captured',
    'updated',
    'withdrawn',
    'expired',
    'requested',
    'under_review',
    'approved',
    'rejected',
    'completed',
    'fulfilled',
    'restricted',
    'enforced',
    'exception_requested',
    'verified',
    'detected',
    'open',
    'closed',
    'monitoring'
  )),
  CONSTRAINT global_privacy_priority_allowed CHECK (
    priority IS NULL OR priority IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_privacy_severity_allowed CHECK (
    severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_privacy_risk_level_allowed CHECK (
    risk_level IS NULL OR risk_level IN ('minimal', 'low', 'moderate', 'high', 'critical')
  ),
  CONSTRAINT global_privacy_score_bounds CHECK (
    (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
    AND (compliance_score IS NULL OR (compliance_score >= 0 AND compliance_score <= 100))
    AND (consent_coverage_score IS NULL OR (consent_coverage_score >= 0 AND consent_coverage_score <= 100))
    AND (trust_score IS NULL OR (trust_score >= 0 AND trust_score <= 100))
    AND (fulfillment_score IS NULL OR (fulfillment_score >= 0 AND fulfillment_score <= 100))
  ),
  CONSTRAINT global_privacy_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT global_privacy_records_policy_controlled CHECK (
    policy_controls ->> 'policyApproved' = 'true'
    AND policy_controls ->> 'humanApprovalRequired' = 'true'
    AND policy_controls ->> 'auditPolicyApplied' = 'true'
    AND policy_controls ->> 'purposeAccessControlApplied' = 'true'
    AND policy_controls ->> 'consentEnforcementApplied' = 'true'
    AND policy_controls ->> 'dataResidencyApplied' = 'true'
    AND policy_controls ->> 'crossBorderPolicyApplied' = 'true'
    AND policy_controls ->> 'dataMinimizationApplied' = 'true'
    AND policy_controls ->> 'retentionPolicyApplied' = 'true'
    AND policy_controls ->> 'noUnauthorizedDisclosure' = 'true'
  ),
  CONSTRAINT global_privacy_records_governed CHECK (
    governance_context ->> 'humanGovernanceRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'noClinicalDecisioning' = 'true'
    AND governance_context ->> 'consentRequired' = 'true'
    AND governance_context ->> 'purposeBoundProcessing' = 'true'
    AND governance_context ->> 'dataResidencyChecked' = 'true'
    AND governance_context ->> 'crossBorderPolicyChecked' = 'true'
    AND governance_context ->> 'dataMinimizationRequired' = 'true'
    AND governance_context ->> 'noExternalSharingOutsidePolicy' = 'true'
    AND governance_context ->> 'multiCountryGovernanceChecked' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_global_privacy_records_tenant_group ON global_privacy_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_tenant_status ON global_privacy_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_country ON global_privacy_records (tenant_id, country_code, jurisdiction_code);
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_consent ON global_privacy_records (tenant_id, consent_id) WHERE consent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_data_rights ON global_privacy_records (tenant_id, data_rights_request_id) WHERE data_rights_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_policy ON global_privacy_records (tenant_id, privacy_policy_id) WHERE privacy_policy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_sharing ON global_privacy_records (tenant_id, sharing_agreement_id) WHERE sharing_agreement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_trust ON global_privacy_records (tenant_id, trust_relationship_id) WHERE trust_relationship_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_monitoring ON global_privacy_records (tenant_id, monitoring_id) WHERE monitoring_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_violation ON global_privacy_records (tenant_id, violation_id) WHERE violation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_requested ON global_privacy_records (tenant_id, requested_at) WHERE requested_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_privacy_records_detected ON global_privacy_records (tenant_id, detected_at) WHERE detected_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_privacy_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  privacy_resource_type TEXT NOT NULL,
  privacy_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_privacy_integration_source_allowed CHECK (source_system IN (
    'foundation_platform',
    'security_platform',
    'compliance_platform',
    'global_healthcare_platform',
    'federated_platform',
    'research_platform',
    'patient_portal_platform',
    'ai_assurance_platform',
    'audit_service',
    'notification_service'
  )),
  CONSTRAINT global_privacy_integration_country_code CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_privacy_integration_unique
  ON global_privacy_integration_references (tenant_id, source_system, source_resource_type, source_resource_id, privacy_resource_type, privacy_resource_id);

CREATE TABLE IF NOT EXISTS global_privacy_events (
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
  CONSTRAINT global_privacy_event_type_allowed CHECK (event_type IN (
    'consent.created',
    'consent.updated',
    'consent.withdrawn',
    'data.access.requested',
    'data.export.completed',
    'privacy.policy.updated',
    'data.sharing.approved',
    'privacy.violation.detected',
    'trust.relationship.created',
    'trust.relationship.expired'
  ))
);

CREATE INDEX IF NOT EXISTS idx_global_privacy_events_tenant_type ON global_privacy_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_privacy_events_unpublished ON global_privacy_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_privacy_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_privacy_audit_country_code CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_global_privacy_audit_tenant_actor ON global_privacy_audit_entries (tenant_id, actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_privacy_audit_resource ON global_privacy_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_privacy_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_privacy_migrations (version)
VALUES ('001_global_privacy_consent_trust')
ON CONFLICT (version) DO NOTHING;
