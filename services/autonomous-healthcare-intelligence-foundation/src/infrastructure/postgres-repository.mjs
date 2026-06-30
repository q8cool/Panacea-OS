import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresAutonomousHealthcareIntelligenceRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async saveIntelligenceRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO autonomous_healthcare_intelligence_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id, intelligence_id,
          capability_id, policy_id, runtime_governance_id, safety_layer_id, approval_workflow_id,
          recommendation_id, review_rule_id, escalation_rule_id, override_id, orchestrator_id,
          context_broker_id, event_router_id, decision_registry_id, workflow_controller_id,
          trace_id, evidence_trace_id, approval_trace_id, audit_package_id, emergency_stop_id,
          owner_id, approver_id, priority, risk_level, risk_score, safety_score, governance_score,
          traceability_score, started_at, completed_at, approved_at, blocked_at, stopped_at,
          policy_controls, governance_context, workflow_controls, evidence, metrics, metadata,
          created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22,
          $23, $24, $25, $26,
          $27, $28, $29, $30, $31,
          $32, $33, $34, $35, $36, $37, $38,
          $39, $40, $41, $42, $43, $44,
          $45::jsonb, $46::jsonb, $47::jsonb, $48::jsonb, $49::jsonb, $50::jsonb,
          $51, $52, $53, $54
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
          record.intelligenceId,
          record.capabilityId,
          record.policyId,
          record.runtimeGovernanceId,
          record.safetyLayerId,
          record.approvalWorkflowId,
          record.recommendationId,
          record.reviewRuleId,
          record.escalationRuleId,
          record.overrideId,
          record.orchestratorId,
          record.contextBrokerId,
          record.eventRouterId,
          record.decisionRegistryId,
          record.workflowControllerId,
          record.traceId,
          record.evidenceTraceId,
          record.approvalTraceId,
          record.auditPackageId,
          record.emergencyStopId,
          record.ownerId,
          record.approverId,
          record.priority,
          record.riskLevel,
          record.riskScore,
          record.safetyScore,
          record.governanceScore,
          record.traceabilityScore,
          nullableDate(record.startedAt),
          nullableDate(record.completedAt),
          nullableDate(record.approvedAt),
          nullableDate(record.blockedAt),
          nullableDate(record.stoppedAt),
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
      `INSERT INTO autonomous_healthcare_intelligence_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        intelligence_resource_type, intelligence_resource_id, country_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.intelligenceResourceType,
        reference.intelligenceResourceId,
        reference.countryCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO autonomous_healthcare_intelligence_audit_entries (
        id, tenant_id, actor_id, action, resource_type, resource_id, country_code, metadata, occurred_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      [
        entry.id,
        entry.tenantId,
        entry.actorId,
        entry.action,
        entry.resourceType,
        entry.resourceId,
        entry.countryCode,
        json(entry.metadata),
        entry.occurredAt
      ]
    );
  }

  async #insertEvent(client, event) {
    await client.query(
      `INSERT INTO autonomous_healthcare_intelligence_events (
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

export async function createPostgresAutonomousHealthcareIntelligenceRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresAutonomousHealthcareIntelligenceRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_autonomous_healthcare_intelligence_foundation.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
