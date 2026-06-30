import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresGlobalProductManagementRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async saveProductManagementRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_product_management_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id, product_id, module_id,
          capability_id, feature_id, dependency_id, roadmap_id, version_id, release_id,
          milestone_id, sprint_id, innovation_idea_id, experiment_id, requirement_id,
          traceability_id, feedback_id, customer_id, clinician_id, patient_id,
          release_candidate_id, owner_id, approval_id, priority, impact_score, effort_score,
          value_score, risk_score, coverage_percent, planned_start_at, planned_end_at,
          approved_at, completed_at, policy_controls, governance_context, workflow_controls,
          evidence, metrics, metadata, created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34, $35,
          $36, $37, $38, $39, $40,
          $41, $42, $43::jsonb, $44::jsonb, $45::jsonb,
          $46::jsonb, $47::jsonb, $48::jsonb, $49, $50, $51, $52
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
          record.productId,
          record.moduleId,
          record.capabilityId,
          record.featureId,
          record.dependencyId,
          record.roadmapId,
          record.versionId,
          record.releaseId,
          record.milestoneId,
          record.sprintId,
          record.innovationIdeaId,
          record.experimentId,
          record.requirementId,
          record.traceabilityId,
          record.feedbackId,
          record.customerId,
          record.clinicianId,
          record.patientId,
          record.releaseCandidateId,
          record.ownerId,
          record.approvalId,
          record.priority,
          record.impactScore,
          record.effortScore,
          record.valueScore,
          record.riskScore,
          record.coveragePercent,
          nullableDate(record.plannedStartAt),
          nullableDate(record.plannedEndAt),
          nullableDate(record.approvedAt),
          nullableDate(record.completedAt),
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
      `INSERT INTO global_product_management_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        product_management_resource_type, product_management_resource_id, country_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.productManagementResourceType,
        reference.productManagementResourceId,
        reference.countryCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO global_product_management_audit_entries (
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
      `INSERT INTO global_product_management_events (
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

export async function createPostgresGlobalProductManagementRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresGlobalProductManagementRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_global_product_management_roadmap_innovation.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
