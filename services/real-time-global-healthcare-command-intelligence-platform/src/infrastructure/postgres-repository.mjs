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
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_real_time_global_command_intelligence.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
