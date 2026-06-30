import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresGlobalComplianceRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async saveComplianceRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_compliance_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id, framework_id,
          regulation_id, requirement_id, change_id, impact_assessment_id, calendar_id,
          rule_id, checklist_id, evidence_id, gap_id, remediation_id, dashboard_id,
          audit_plan_id, audit_schedule_id, audit_scope_id, audit_finding_id,
          corrective_action_plan_id, certification_id, certification_requirement_id,
          policy_id, attestation_id, exception_id, violation_id, review_id,
          report_template_id, report_id, submission_id, correspondence_id,
          owner_id, approval_id, priority, severity, compliance_score, risk_score,
          readiness_score, impact_score, effective_at, due_at, scheduled_at,
          completed_at, expires_at, submitted_at, policy_controls, governance_context,
          workflow_controls, evidence, metrics, metadata, created_by, updated_by,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23,
          $24, $25, $26, $27,
          $28, $29, $30,
          $31, $32, $33, $34, $35,
          $36, $37, $38, $39,
          $40, $41, $42, $43, $44, $45,
          $46, $47, $48, $49, $50,
          $51, $52, $53, $54::jsonb, $55::jsonb,
          $56::jsonb, $57::jsonb, $58::jsonb, $59::jsonb, $60, $61,
          $62, $63
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
          record.frameworkId,
          record.regulationId,
          record.requirementId,
          record.changeId,
          record.impactAssessmentId,
          record.calendarId,
          record.ruleId,
          record.checklistId,
          record.evidenceId,
          record.gapId,
          record.remediationId,
          record.dashboardId,
          record.auditPlanId,
          record.auditScheduleId,
          record.auditScopeId,
          record.auditFindingId,
          record.correctiveActionPlanId,
          record.certificationId,
          record.certificationRequirementId,
          record.policyId,
          record.attestationId,
          record.exceptionId,
          record.violationId,
          record.reviewId,
          record.reportTemplateId,
          record.reportId,
          record.submissionId,
          record.correspondenceId,
          record.ownerId,
          record.approvalId,
          record.priority,
          record.severity,
          record.complianceScore,
          record.riskScore,
          record.readinessScore,
          record.impactScore,
          nullableDate(record.effectiveAt),
          nullableDate(record.dueAt),
          nullableDate(record.scheduledAt),
          nullableDate(record.completedAt),
          nullableDate(record.expiresAt),
          nullableDate(record.submittedAt),
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
      `INSERT INTO global_compliance_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        compliance_resource_type, compliance_resource_id, country_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.complianceResourceType,
        reference.complianceResourceId,
        reference.countryCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO global_compliance_audit_entries (
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
      `INSERT INTO global_compliance_events (
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

export async function createPostgresGlobalComplianceRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresGlobalComplianceRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_global_compliance_regulatory_intelligence.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
