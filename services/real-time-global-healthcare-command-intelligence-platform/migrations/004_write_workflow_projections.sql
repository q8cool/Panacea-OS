CREATE TABLE IF NOT EXISTS global_command_intelligence_write_workflow_projections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  workflow_id UUID NOT NULL,
  projection_target TEXT NOT NULL,
  read_model_id TEXT NOT NULL,
  projection_status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  correlation_id TEXT,
  request_id TEXT,
  actor_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT gci_projection_tenant_nonempty CHECK (length(trim(tenant_id)) > 0),
  CONSTRAINT gci_projection_target_nonempty CHECK (length(trim(projection_target)) > 0),
  CONSTRAINT gci_projection_status_allowed CHECK (projection_status IN (
    'pending',
    'projected',
    'failed',
    'skipped',
    'replayed'
  )),
  CONSTRAINT gci_projection_payload_object CHECK (jsonb_typeof(payload) = 'object'),
  CONSTRAINT gci_projection_retry_nonnegative CHECK (retry_count >= 0),
  CONSTRAINT gci_projection_unique_target UNIQUE (tenant_id, event_id, projection_target),
  CONSTRAINT gci_projection_workflow_fk FOREIGN KEY (workflow_id)
    REFERENCES global_command_intelligence_write_workflows (id)
    ON DELETE CASCADE,
  CONSTRAINT gci_projection_event_fk FOREIGN KEY (event_id)
    REFERENCES global_command_intelligence_write_workflow_events (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gci_write_projections_tenant_status
  ON global_command_intelligence_write_workflow_projections (tenant_id, projection_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_gci_write_projections_event
  ON global_command_intelligence_write_workflow_projections (tenant_id, event_id, projection_target);

CREATE INDEX IF NOT EXISTS idx_gci_write_projections_correlation
  ON global_command_intelligence_write_workflow_projections (tenant_id, correlation_id, request_id)
  WHERE correlation_id IS NOT NULL OR request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gci_write_projections_failed_retry
  ON global_command_intelligence_write_workflow_projections (tenant_id, updated_at DESC)
  WHERE projection_status = 'failed';

INSERT INTO global_command_intelligence_migrations (version)
VALUES ('004_write_workflow_projections')
ON CONFLICT (version) DO NOTHING;
