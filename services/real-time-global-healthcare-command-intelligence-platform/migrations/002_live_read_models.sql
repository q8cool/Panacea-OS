CREATE TABLE IF NOT EXISTS global_command_intelligence_read_models (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  workspace TEXT NOT NULL,
  model_key TEXT NOT NULL,
  subject_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL DEFAULT 'system',
  updated_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT gci_read_model_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT gci_read_model_workspace_allowed CHECK (workspace IN (
    'clinical',
    'patient_portal',
    'laboratory',
    'radiology',
    'pharmacy',
    'admin'
  )),
  CONSTRAINT gci_read_model_key_nonempty CHECK (length(trim(model_key)) > 0),
  CONSTRAINT gci_read_model_status_allowed CHECK (status IN ('active', 'inactive', 'archived')),
  CONSTRAINT gci_read_model_title_nonempty CHECK (length(trim(title)) > 0),
  CONSTRAINT gci_read_model_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_gci_read_models_tenant_workspace ON global_command_intelligence_read_models (tenant_id, workspace, model_key, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_gci_read_models_subject ON global_command_intelligence_read_models (tenant_id, workspace, model_key, subject_id) WHERE subject_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gci_read_models_status ON global_command_intelligence_read_models (tenant_id, status);

CREATE TABLE IF NOT EXISTS global_command_intelligence_read_model_events (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '4.0.0',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  CONSTRAINT gci_read_model_event_type_allowed CHECK (event_type IN (
    'read.model.created',
    'read.model.updated',
    'read.model.archived'
  ))
);

CREATE INDEX IF NOT EXISTS idx_gci_read_model_events_tenant_type ON global_command_intelligence_read_model_events (tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_gci_read_model_events_unpublished ON global_command_intelligence_read_model_events (tenant_id, occurred_at) WHERE published_at IS NULL;

INSERT INTO global_command_intelligence_migrations (version)
VALUES ('002_live_read_models')
ON CONFLICT (version) DO NOTHING;
