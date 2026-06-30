CREATE TABLE IF NOT EXISTS global_workforce_records (
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
  facility_id TEXT,
  department_id TEXT,
  staff_id TEXT,
  employee_id TEXT,
  provider_id TEXT,
  credential_id TEXT,
  license_id TEXT,
  certification_id TEXT,
  privilege_id TEXT,
  shift_id TEXT,
  schedule_id TEXT,
  leave_request_id TEXT,
  training_assignment_id TEXT,
  compliance_requirement_id TEXT,
  payroll_reference_id TEXT,
  effective_date DATE,
  expiration_date DATE,
  review_due_date DATE,
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  fte NUMERIC(5, 2),
  hours NUMERIC(7, 2),
  cost_amount NUMERIC(18, 2),
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
  CONSTRAINT global_workforce_records_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT global_workforce_records_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT global_workforce_records_group_allowed CHECK (record_group IN (
    'workforce_management',
    'clinical_credentialing',
    'workforce_planning',
    'staff_experience',
    'hr_operations',
    'compliance'
  )),
  CONSTRAINT global_workforce_records_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'active',
    'assigned',
    'available',
    'scheduled',
    'requested',
    'approved',
    'verified',
    'expired',
    'completed',
    'under_review',
    'compliant',
    'non_compliant',
    'closed',
    'updated'
  )),
  CONSTRAINT global_workforce_records_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT global_workforce_records_governed CHECK (
    governance_context ->> 'humanGovernanceRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'noClinicalDecisioning' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_global_workforce_records_tenant_group ON global_workforce_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_tenant_status ON global_workforce_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_staff ON global_workforce_records (tenant_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_employee ON global_workforce_records (tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_provider ON global_workforce_records (tenant_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_credential ON global_workforce_records (tenant_id, credential_id);
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_country ON global_workforce_records (tenant_id, country_code, jurisdiction_code);
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_expiration ON global_workforce_records (tenant_id, expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_workforce_records_review_due ON global_workforce_records (tenant_id, review_due_date) WHERE review_due_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_workforce_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  workforce_resource_type TEXT NOT NULL,
  workforce_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_workforce_integration_source_allowed CHECK (source_system IN (
    'foundation_platform',
    'security_platform',
    'scheduling_platform',
    'nursing_platform',
    'education_platform',
    'quality_platform',
    'enterprise_platform',
    'analytics_platform',
    'audit_service',
    'notification_service'
  ))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_workforce_integration_unique
  ON global_workforce_integration_references (tenant_id, source_system, source_resource_type, source_resource_id, workforce_resource_type, workforce_resource_id);

CREATE TABLE IF NOT EXISTS global_workforce_events (
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
  CONSTRAINT global_workforce_event_type_allowed CHECK (event_type IN (
    'staff.created',
    'staff.updated',
    'credential.created',
    'credential.verified',
    'credential.expired',
    'shift.assigned',
    'shift.completed',
    'leave.requested',
    'leave.approved',
    'training.assigned',
    'compliance.updated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_global_workforce_events_tenant_type ON global_workforce_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_workforce_events_unpublished ON global_workforce_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_workforce_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_workforce_audit_action_nonempty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_global_workforce_audit_tenant_action ON global_workforce_audit_entries (tenant_id, action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_workforce_audit_resource ON global_workforce_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_workforce_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_workforce_schema_migrations (version)
VALUES ('001_global_workforce_hr_credentialing_staff_experience')
ON CONFLICT (version) DO NOTHING;
