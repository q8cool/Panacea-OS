CREATE TABLE IF NOT EXISTS global_command_intelligence_write_workflows (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  workflow_group TEXT NOT NULL,
  workflow_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  subject_id TEXT,
  status TEXT NOT NULL DEFAULT 'accepted',
  title TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  workflow_controls JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT gci_write_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT gci_write_group_allowed CHECK (workflow_group IN (
    'clinical',
    'laboratory',
    'radiology',
    'pharmacy',
    'scheduling',
    'admin',
    'patient_portal'
  )),
  CONSTRAINT gci_write_key_nonempty CHECK (length(trim(workflow_key)) > 0),
  CONSTRAINT gci_write_status_allowed CHECK (status IN ('accepted', 'rejected', 'completed')),
  CONSTRAINT gci_write_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT gci_write_payload_object CHECK (jsonb_typeof(payload) = 'object'),
  CONSTRAINT gci_write_controls_object CHECK (jsonb_typeof(workflow_controls) = 'object'),
  CONSTRAINT gci_write_request_context_object CHECK (jsonb_typeof(request_context) = 'object'),
  CONSTRAINT gci_write_controls_governed CHECK (
    workflow_controls ->> 'liveMode' = 'true'
    AND workflow_controls ->> 'demoData' = 'false'
    AND workflow_controls ->> 'auditRequired' = 'true'
    AND workflow_controls ->> 'tenantIsolationConfirmed' = 'true'
    AND workflow_controls ->> 'humanUserConfirmed' = 'true'
    AND workflow_controls ->> 'noAutonomousDiagnosis' = 'true'
    AND workflow_controls ->> 'noAutonomousTreatment' = 'true'
    AND workflow_controls ->> 'noAiGeneratedClinicalDecision' = 'true'
  )
);

CREATE INDEX IF NOT EXISTS idx_gci_write_workflows_tenant_group ON global_command_intelligence_write_workflows (tenant_id, workflow_group, workflow_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gci_write_workflows_subject ON global_command_intelligence_write_workflows (tenant_id, workflow_group, subject_id, created_at DESC) WHERE subject_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gci_write_workflows_event_type ON global_command_intelligence_write_workflows (tenant_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gci_write_workflows_idempotency ON global_command_intelligence_write_workflows (tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS global_command_intelligence_write_workflow_events (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '4.0.0',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  CONSTRAINT gci_write_event_type_allowed CHECK (event_type IN (
    'patient.created',
    'patient.updated',
    'encounter.created',
    'clinical.note.created',
    'allergy.created',
    'condition.created',
    'medication.created',
    'vital.signs.created',
    'care.team.updated',
    'lab.order.created',
    'specimen.collected',
    'specimen.received',
    'lab.result.entered',
    'lab.result.validated',
    'lab.result.approved',
    'critical.lab.result.flagged',
    'imaging.order.created',
    'imaging.study.started',
    'imaging.study.completed',
    'radiology.report.created',
    'radiology.report.approved',
    'critical.finding.flagged',
    'prescription.created',
    'prescription.reviewed',
    'medication.safety.validated',
    'medication.dispensed',
    'pharmacy.inventory.updated',
    'medication.safety.alert.flagged',
    'appointment.created',
    'appointment.updated',
    'appointment.cancelled',
    'appointment.checked_in',
    'appointment.completed',
    'user.created',
    'user.updated',
    'role.assigned',
    'role.created',
    'tenant.created',
    'organization.created',
    'department.created',
    'configuration.updated',
    'patient.appointment.requested',
    'patient.secure.message.sent',
    'patient.refill.requested',
    'patient.report.requested',
    'patient.communication.preferences.updated'
  )),
  CONSTRAINT gci_write_event_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_gci_write_events_tenant_type ON global_command_intelligence_write_workflow_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_gci_write_events_unpublished ON global_command_intelligence_write_workflow_events (tenant_id, occurred_at) WHERE published_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gci_write_events_aggregate ON global_command_intelligence_write_workflow_events (tenant_id, aggregate_type, aggregate_id);

INSERT INTO global_command_intelligence_migrations (version)
VALUES ('003_live_write_workflows')
ON CONFLICT (version) DO NOTHING;
