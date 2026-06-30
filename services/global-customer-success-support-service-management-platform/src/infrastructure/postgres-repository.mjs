import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresGlobalCustomerSuccessRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async saveCustomerSuccessRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_customer_success_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id, account_id, customer_id,
          customer_health_score_id, success_plan_id, milestone_id, support_ticket_id, incident_id,
          problem_id, change_id, service_request_id, knowledge_base_article_id, service_catalog_id,
          implementation_project_id, onboarding_id, communication_id, feedback_id, survey_id,
          release_id, maintenance_window_id, sla_id, escalation_id, assignment_id, support_agent_id,
          priority, severity, health_score, satisfaction_score, adoption_score, due_at,
          target_resolution_at, resolved_at, start_at, completed_at, policy_controls,
          governance_context, workflow_controls, evidence, metrics, metadata, created_by, updated_by,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23,
          $24, $25, $26, $27, $28,
          $29, $30, $31, $32, $33, $34,
          $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45::jsonb,
          $46::jsonb, $47::jsonb, $48::jsonb, $49::jsonb, $50::jsonb, $51, $52,
          $53, $54
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
          record.accountId,
          record.customerId,
          record.customerHealthScoreId,
          record.successPlanId,
          record.milestoneId,
          record.supportTicketId,
          record.incidentId,
          record.problemId,
          record.changeId,
          record.serviceRequestId,
          record.knowledgeBaseArticleId,
          record.serviceCatalogId,
          record.implementationProjectId,
          record.onboardingId,
          record.communicationId,
          record.feedbackId,
          record.surveyId,
          record.releaseId,
          record.maintenanceWindowId,
          record.slaId,
          record.escalationId,
          record.assignmentId,
          record.supportAgentId,
          record.priority,
          record.severity,
          record.healthScore,
          record.satisfactionScore,
          record.adoptionScore,
          nullableDate(record.dueAt),
          nullableDate(record.targetResolutionAt),
          nullableDate(record.resolvedAt),
          nullableDate(record.startAt),
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
      `INSERT INTO global_customer_success_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        customer_success_resource_type, customer_success_resource_id, country_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.customerSuccessResourceType,
        reference.customerSuccessResourceId,
        reference.countryCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO global_customer_success_audit_entries (
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
      `INSERT INTO global_customer_success_events (
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

export async function createPostgresGlobalCustomerSuccessRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresGlobalCustomerSuccessRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_global_customer_success_support_service_management.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
