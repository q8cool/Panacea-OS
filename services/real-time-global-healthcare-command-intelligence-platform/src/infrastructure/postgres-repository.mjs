import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresRealTimeGlobalCommandIntelligenceRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async saveCommandRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_command_intelligence_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id, command_center_id,
          command_event_id, situation_id, alert_id, crisis_event_id, coordination_id,
          recommendation_id, briefing_id, facility_id, department_id, owner_id, approver_id,
          priority, risk_level, severity, confidence_score, risk_score, urgency_score,
          capacity_impact_score, started_at, updated_at_signal, escalated_at, resolved_at,
          generated_at, policy_controls, governance_context, workflow_controls, evidence,
          metrics, metadata, created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23,
          $24, $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34,
          $35, $36::jsonb, $37::jsonb, $38::jsonb, $39::jsonb,
          $40::jsonb, $41::jsonb, $42, $43, $44, $45
        )`,
        [
          record.id,
          record.tenantId,
          record.recordGroup,
          record.recordType,
          record.status,
          record.title,
          record.description,
          record.countryCode,
          record.regionCode,
          record.jurisdictionCode,
          record.organizationId,
          record.commandCenterId,
          record.commandEventId,
          record.situationId,
          record.alertId,
          record.crisisEventId,
          record.coordinationId,
          record.recommendationId,
          record.briefingId,
          record.facilityId,
          record.departmentId,
          record.ownerId,
          record.approverId,
          record.priority,
          record.riskLevel,
          record.severity,
          record.confidenceScore,
          record.riskScore,
          record.urgencyScore,
          record.capacityImpactScore,
          nullableDate(record.startedAt),
          nullableDate(record.updatedAtSignal),
          nullableDate(record.escalatedAt),
          nullableDate(record.resolvedAt),
          nullableDate(record.generatedAt),
          json(record.policyControls),
          json(record.governanceContext),
          json(record.workflowControls),
          JSON.stringify(record.evidence),
          json(record.metrics),
          json(record.metadata),
          record.createdBy,
          record.updatedBy,
          record.createdAt,
          record.updatedAt
        ]
      );
      await this.#insertEvent(client, event);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async saveIntegrationReference(reference) {
    await this.pool.query(
      `INSERT INTO global_command_intelligence_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        command_resource_type, command_resource_id, country_code, region_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.commandResourceType,
        reference.commandResourceId,
        reference.countryCode,
        reference.regionCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveWriteWorkflow(record, event, auditEntry, projections = []) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_command_intelligence_write_workflows (
          id, tenant_id, workflow_group, workflow_key, event_type, subject_id, status,
          title, reason, idempotency_key, payload, workflow_controls, request_context,
          created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb,
          $14, $15, $16, $17
        )`,
        [
          record.id,
          record.tenantId,
          record.workflowGroup,
          record.workflowKey,
          record.eventType,
          record.subjectId,
          record.status,
          record.title,
          record.reason,
          record.idempotencyKey,
          json(record.payload),
          json(record.workflowControls),
          json(record.requestContext),
          record.createdBy,
          record.updatedBy,
          record.createdAt,
          record.updatedAt
        ]
      );
      await this.#insertWriteWorkflowEvent(client, event);
      for (const projection of projections) {
        await this.#upsertReadModel(client, projection.readModel);
        await this.#insertProjection(client, projection);
      }
      await client.query(
        `INSERT INTO global_command_intelligence_audit_entries (
          id, tenant_id, actor_id, action, resource_type, resource_id, country_code, region_code, metadata, occurred_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
        [
          auditEntry.id,
          auditEntry.tenantId,
          auditEntry.actorId,
          auditEntry.action,
          auditEntry.resourceType,
          auditEntry.resourceId,
          auditEntry.countryCode,
          auditEntry.regionCode,
          json(auditEntry.metadata),
          auditEntry.occurredAt
        ]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listWriteWorkflowEvents({ tenantId, eventType, limit, offset }) {
    const filters = [tenantId];
    let eventTypeFilter = "";
    if (eventType) {
      filters.push(eventType);
      eventTypeFilter = ` AND e.event_type = $${filters.length}`;
    }
    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total
       FROM global_command_intelligence_write_workflow_events e
       WHERE e.tenant_id = $1${eventTypeFilter}`,
      filters
    );
    const rowsResult = await this.pool.query(
      `SELECT
         e.id, e.tenant_id, e.event_type, e.aggregate_id, e.aggregate_type, e.actor_id,
         e.schema_version, e.payload, e.occurred_at, e.published_at,
         w.workflow_group, w.workflow_key, w.subject_id, w.status AS workflow_status,
         w.title, w.request_context,
         COALESCE(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'projectionTarget', p.projection_target,
           'readModelId', p.read_model_id,
           'status', p.projection_status,
           'processedAt', p.processed_at,
           'failureReason', p.failure_reason,
           'retryCount', p.retry_count
         ) ORDER BY p.updated_at DESC) FILTER (WHERE p.id IS NOT NULL), '[]'::jsonb) AS projections
       FROM global_command_intelligence_write_workflow_events e
       LEFT JOIN global_command_intelligence_write_workflows w
         ON w.id = e.aggregate_id AND w.tenant_id = e.tenant_id
       LEFT JOIN global_command_intelligence_write_workflow_projections p
         ON p.event_id = e.id AND p.tenant_id = e.tenant_id
       WHERE e.tenant_id = $1${eventTypeFilter}
       GROUP BY e.id, w.workflow_group, w.workflow_key, w.subject_id, w.status, w.title, w.request_context
       ORDER BY e.occurred_at DESC, e.id ASC
       LIMIT $${filters.length + 1} OFFSET $${filters.length + 2}`,
      [...filters, limit, offset]
    );
    return {
      total: Number(countResult.rows[0]?.total ?? 0),
      items: rowsResult.rows.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id,
        eventType: row.event_type,
        aggregateId: row.aggregate_id,
        aggregateType: row.aggregate_type,
        actorId: row.actor_id,
        schemaVersion: row.schema_version,
        payload: row.payload,
        occurredAt: row.occurred_at?.toISOString?.() ?? row.occurred_at,
        publishedAt: row.published_at?.toISOString?.() ?? row.published_at,
        workflowGroup: row.workflow_group,
        workflowKey: row.workflow_key,
        workflowStatus: row.workflow_status,
        subjectId: row.subject_id,
        title: row.title,
        requestContext: row.request_context,
        projections: row.projections
      }))
    };
  }

  async listWriteWorkflowProjections({ tenantId, status, eventType, limit, offset }) {
    const filters = [tenantId];
    let statusFilter = "";
    let eventTypeFilter = "";
    if (status) {
      filters.push(status);
      statusFilter = ` AND projection_status = $${filters.length}`;
    }
    if (eventType) {
      filters.push(eventType);
      eventTypeFilter = ` AND event_type = $${filters.length}`;
    }
    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total
       FROM global_command_intelligence_write_workflow_projections
       WHERE tenant_id = $1${statusFilter}${eventTypeFilter}`,
      filters
    );
    const rowsResult = await this.pool.query(
      `SELECT id, tenant_id, event_id, event_type, workflow_id, projection_target, read_model_id,
              projection_status, processed_at, failure_reason, retry_count, correlation_id, request_id,
              actor_id, payload, created_by, updated_by, created_at, updated_at
       FROM global_command_intelligence_write_workflow_projections
       WHERE tenant_id = $1${statusFilter}${eventTypeFilter}
       ORDER BY updated_at DESC, id ASC
       LIMIT $${filters.length + 1} OFFSET $${filters.length + 2}`,
      [...filters, limit, offset]
    );
    return {
      total: Number(countResult.rows[0]?.total ?? 0),
      items: rowsResult.rows.map((row) => this.#projectionFromRow(row))
    };
  }

  async getWriteWorkflowProjection({ tenantId, projectionId }) {
    const result = await this.pool.query(
      `SELECT id, tenant_id, event_id, event_type, workflow_id, projection_target, read_model_id,
              projection_status, processed_at, failure_reason, retry_count, correlation_id, request_id,
              actor_id, payload, created_by, updated_by, created_at, updated_at
       FROM global_command_intelligence_write_workflow_projections
       WHERE tenant_id = $1 AND id = $2`,
      [tenantId, projectionId]
    );
    return result.rows[0] ? this.#projectionFromRow(result.rows[0]) : null;
  }

  async retryWriteWorkflowProjection(projection, auditEntry, replayedAt) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await this.#upsertReadModel(client, projection.payload.targetReadModel);
      const updated = await client.query(
        `UPDATE global_command_intelligence_write_workflow_projections
         SET projection_status = 'replayed',
             failure_reason = NULL,
             processed_at = $3,
             retry_count = retry_count + 1,
             updated_by = $4,
             updated_at = $3
         WHERE tenant_id = $1 AND id = $2
         RETURNING id, tenant_id, event_id, event_type, workflow_id, projection_target, read_model_id,
                   projection_status, processed_at, failure_reason, retry_count, correlation_id, request_id,
                   actor_id, payload, created_by, updated_by, created_at, updated_at`,
        [projection.tenantId, projection.id, replayedAt, auditEntry.actorId]
      );
      await client.query(
        `INSERT INTO global_command_intelligence_audit_entries (
          id, tenant_id, actor_id, action, resource_type, resource_id, country_code, region_code, metadata, occurred_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
        [
          auditEntry.id,
          auditEntry.tenantId,
          auditEntry.actorId,
          auditEntry.action,
          auditEntry.resourceType,
          auditEntry.resourceId,
          auditEntry.countryCode,
          auditEntry.regionCode,
          json(auditEntry.metadata),
          auditEntry.occurredAt
        ]
      );
      await client.query("COMMIT");
      return this.#projectionFromRow(updated.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO global_command_intelligence_audit_entries (
        id, tenant_id, actor_id, action, resource_type, resource_id, country_code, region_code, metadata, occurred_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
      [
        entry.id,
        entry.tenantId,
        entry.actorId,
        entry.action,
        entry.resourceType,
        entry.resourceId,
        entry.countryCode,
        entry.regionCode,
        json(entry.metadata),
        entry.occurredAt
      ]
    );
  }

  async listReadModels({ tenantId, workspace, modelKey, subjectId, limit, offset }) {
    const filters = [tenantId, workspace, modelKey];
    let subjectFilter = "";
    if (subjectId) {
      filters.push(subjectId);
      subjectFilter = ` AND subject_id = $${filters.length}`;
    }
    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total
       FROM global_command_intelligence_read_models
       WHERE tenant_id = $1 AND workspace = $2 AND model_key = $3${subjectFilter}`,
      filters
    );
    const rowsResult = await this.pool.query(
      `SELECT id, tenant_id, workspace, model_key, subject_id, status, title, payload, created_at, updated_at
       FROM global_command_intelligence_read_models
       WHERE tenant_id = $1 AND workspace = $2 AND model_key = $3${subjectFilter}
       ORDER BY updated_at DESC, id ASC
       LIMIT $${filters.length + 1} OFFSET $${filters.length + 2}`,
      [...filters, limit, offset]
    );
    return {
      total: Number(countResult.rows[0]?.total ?? 0),
      items: rowsResult.rows.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id,
        workspace: row.workspace,
        modelKey: row.model_key,
        subjectId: row.subject_id,
        status: row.status,
        title: row.title,
        payload: row.payload,
        createdAt: row.created_at?.toISOString?.() ?? row.created_at,
        updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at
      }))
    };
  }

  async #insertEvent(client, event) {
    await client.query(
      `INSERT INTO global_command_intelligence_events (
        id, tenant_id, event_type, aggregate_id, aggregate_type, actor_id,
        schema_version, payload, occurred_at, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, NULL)`,
      [
        event.id,
        event.tenantId,
        event.eventType,
        event.aggregateId,
        event.aggregateType,
        event.actorId,
        event.schemaVersion,
        JSON.stringify(event.payload),
        event.occurredAt
      ]
    );
  }

  async #insertWriteWorkflowEvent(client, event) {
    await client.query(
      `INSERT INTO global_command_intelligence_write_workflow_events (
        id, tenant_id, event_type, aggregate_id, aggregate_type, actor_id,
        schema_version, payload, occurred_at, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, NULL)`,
      [
        event.id,
        event.tenantId,
        event.eventType,
        event.aggregateId,
        event.aggregateType,
        event.actorId,
        event.schemaVersion,
        JSON.stringify(event.payload),
        event.occurredAt
      ]
    );
  }

  async #upsertReadModel(client, readModel) {
    await client.query(
      `INSERT INTO global_command_intelligence_read_models (
        id, tenant_id, workspace, model_key, subject_id, status, title, payload,
        created_by, updated_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        title = EXCLUDED.title,
        payload = EXCLUDED.payload,
        updated_by = EXCLUDED.updated_by,
        updated_at = EXCLUDED.updated_at`,
      [
        readModel.id,
        readModel.tenantId,
        readModel.workspace,
        readModel.modelKey,
        readModel.subjectId ?? null,
        readModel.status,
        readModel.title,
        json(readModel.payload),
        readModel.createdBy,
        readModel.updatedBy,
        readModel.createdAt,
        readModel.updatedAt
      ]
    );
  }

  async #insertProjection(client, projection) {
    await client.query(
      `INSERT INTO global_command_intelligence_write_workflow_projections (
        id, tenant_id, event_id, event_type, workflow_id, projection_target, read_model_id,
        projection_status, processed_at, failure_reason, retry_count, correlation_id, request_id,
        actor_id, payload, created_by, updated_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15::jsonb, $16, $17, $18, $19
      )
      ON CONFLICT (tenant_id, event_id, projection_target) DO UPDATE SET
        projection_status = 'replayed',
        processed_at = EXCLUDED.processed_at,
        failure_reason = NULL,
        payload = EXCLUDED.payload,
        updated_by = EXCLUDED.updated_by,
        updated_at = EXCLUDED.updated_at`,
      [
        projection.id,
        projection.tenantId,
        projection.eventId,
        projection.eventType,
        projection.workflowId,
        projection.projectionTarget,
        projection.readModelId,
        projection.projectionStatus,
        projection.processedAt,
        projection.failureReason,
        projection.retryCount,
        projection.correlationId,
        projection.requestId,
        projection.actorId,
        json(projection.payload),
        projection.createdBy,
        projection.updatedBy,
        projection.createdAt,
        projection.updatedAt
      ]
    );
  }

  #projectionFromRow(row) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      eventId: row.event_id,
      eventType: row.event_type,
      workflowId: row.workflow_id,
      projectionTarget: row.projection_target,
      readModelId: row.read_model_id,
      projectionStatus: row.projection_status,
      status: row.projection_status,
      processedAt: row.processed_at?.toISOString?.() ?? row.processed_at,
      failureReason: row.failure_reason,
      retryCount: Number(row.retry_count ?? 0),
      correlationId: row.correlation_id,
      requestId: row.request_id,
      actorId: row.actor_id,
      payload: row.payload,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at,
      updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at
    };
  }
}

export async function createPostgresRealTimeGlobalCommandIntelligenceRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresRealTimeGlobalCommandIntelligenceRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  try {
    const migrationsDir = path.resolve(moduleDir, "../../migrations");
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      await pool.query(sql);
    }
  } finally {
    await pool.end();
  }
}
