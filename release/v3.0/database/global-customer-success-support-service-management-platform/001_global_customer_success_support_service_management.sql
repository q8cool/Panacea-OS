CREATE TABLE IF NOT EXISTS global_customer_success_records (
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
  account_id TEXT,
  customer_id TEXT,
  customer_health_score_id TEXT,
  success_plan_id TEXT,
  milestone_id TEXT,
  support_ticket_id TEXT,
  incident_id TEXT,
  problem_id TEXT,
  change_id TEXT,
  service_request_id TEXT,
  knowledge_base_article_id TEXT,
  service_catalog_id TEXT,
  implementation_project_id TEXT,
  onboarding_id TEXT,
  communication_id TEXT,
  feedback_id TEXT,
  survey_id TEXT,
  release_id TEXT,
  maintenance_window_id TEXT,
  sla_id TEXT,
  escalation_id TEXT,
  assignment_id TEXT,
  support_agent_id TEXT,
  priority TEXT,
  severity TEXT,
  health_score NUMERIC(5, 2),
  satisfaction_score NUMERIC(5, 2),
  adoption_score NUMERIC(5, 2),
  due_at TIMESTAMPTZ,
  target_resolution_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  start_at TIMESTAMPTZ,
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
  CONSTRAINT global_customer_success_records_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT global_customer_success_records_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT global_customer_success_records_group_allowed CHECK (record_group IN (
    'customer_success',
    'enterprise_support',
    'service_management',
    'implementation_onboarding',
    'customer_communication',
    'support_analytics'
  )),
  CONSTRAINT global_customer_success_records_status_allowed CHECK (status IN (
    'draft',
    'registered',
    'active',
    'open',
    'pending',
    'assigned',
    'started',
    'on_track',
    'at_risk',
    'escalated',
    'resolved',
    'closed',
    'completed',
    'approved',
    'received',
    'published',
    'measured',
    'breached',
    'updated'
  )),
  CONSTRAINT global_customer_success_priority_allowed CHECK (
    priority IS NULL OR priority IN ('low', 'medium', 'high', 'urgent', 'critical')
  ),
  CONSTRAINT global_customer_success_severity_allowed CHECK (
    severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT global_customer_success_evidence_array CHECK (jsonb_typeof(evidence) = 'array'),
  CONSTRAINT global_customer_success_records_governed CHECK (
    governance_context ->> 'humanGovernanceRequired' = 'true'
    AND governance_context ->> 'auditRequired' = 'true'
    AND governance_context ->> 'tenantIsolationRequired' = 'true'
    AND governance_context ->> 'noClinicalDecisioning' = 'true'
    AND governance_context ->> 'customerDataAccessControlled' = 'true'
    AND governance_context ->> 'supportRolePermissionControlled' = 'true'
    AND governance_context ->> 'sensitiveIncidentControlled' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_tenant_group ON global_customer_success_records (tenant_id, record_group, record_type);
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_tenant_status ON global_customer_success_records (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_country ON global_customer_success_records (tenant_id, country_code, jurisdiction_code);
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_customer ON global_customer_success_records (tenant_id, customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_account ON global_customer_success_records (tenant_id, account_id) WHERE account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_ticket ON global_customer_success_records (tenant_id, support_ticket_id) WHERE support_ticket_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_incident ON global_customer_success_records (tenant_id, incident_id) WHERE incident_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_request ON global_customer_success_records (tenant_id, service_request_id) WHERE service_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_onboarding ON global_customer_success_records (tenant_id, onboarding_id) WHERE onboarding_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_due ON global_customer_success_records (tenant_id, due_at) WHERE due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_global_customer_success_records_resolution ON global_customer_success_records (tenant_id, target_resolution_at) WHERE target_resolution_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_customer_success_integration_references (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_resource_type TEXT NOT NULL,
  source_resource_id TEXT NOT NULL,
  customer_success_resource_type TEXT NOT NULL,
  customer_success_resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_customer_success_integration_source_allowed CHECK (source_system IN (
    'foundation_platform',
    'enterprise_platform',
    'devops_platform',
    'security_platform',
    'lts_maintenance_platform',
    'legal_governance_platform',
    'audit_service',
    'notification_service'
  ))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_customer_success_integration_unique
  ON global_customer_success_integration_references (tenant_id, source_system, source_resource_type, source_resource_id, customer_success_resource_type, customer_success_resource_id);

CREATE TABLE IF NOT EXISTS global_customer_success_events (
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
  CONSTRAINT global_customer_success_event_type_allowed CHECK (event_type IN (
    'customer.created',
    'customer.health.updated',
    'support.ticket.created',
    'support.ticket.escalated',
    'support.ticket.resolved',
    'incident.created',
    'incident.resolved',
    'service.request.created',
    'onboarding.started',
    'onboarding.completed',
    'customer.feedback.received'
  ))
);

CREATE INDEX IF NOT EXISTS idx_global_customer_success_events_tenant_type ON global_customer_success_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_customer_success_events_unpublished ON global_customer_success_events (tenant_id, occurred_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS global_customer_success_audit_entries (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT global_customer_success_audit_action_nonempty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_global_customer_success_audit_tenant_action ON global_customer_success_audit_entries (tenant_id, action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_customer_success_audit_resource ON global_customer_success_audit_entries (tenant_id, resource_type, resource_id);

CREATE TABLE IF NOT EXISTS global_customer_success_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO global_customer_success_schema_migrations (version)
VALUES ('001_global_customer_success_support_service_management')
ON CONFLICT (version) DO NOTHING;
