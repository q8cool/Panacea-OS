import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresGlobalAiAssuranceRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async saveAiAssuranceRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_ai_assurance_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id, ai_system_id,
          ai_use_case_id, assurance_id, risk_classification_id, safety_assessment_id,
          impact_assessment_id, model_id, model_version_id, model_risk_id, validation_id,
          limitation_id, test_id, test_case_id, test_report_id, prompt_id, prompt_version_id,
          agent_id, agent_version_id, permission_review_id, behavior_evaluation_id,
          runtime_approval_id, monitoring_id, recommendation_monitor_id, drift_monitor_id,
          bias_monitor_id, hallucination_monitor_id, unsafe_output_monitor_id,
          performance_monitor_id, incident_id, investigation_id, corrective_action_id,
          regulatory_requirement_id, compliance_mapping_id, evidence_repository_id,
          audit_package_id, governance_decision_id, attestation_id, owner_id, approval_id,
          priority, severity, risk_level, risk_score, safety_score, validation_score,
          bias_score, drift_score, performance_score, readiness_score, impact_score,
          started_at, completed_at, approved_at, rejected_at, retired_at, detected_at,
          closed_at, generated_at, policy_controls, governance_context, workflow_controls,
          evidence, metrics, metadata, created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          $22, $23, $24, $25, $26, $27,
          $28, $29, $30, $31,
          $32, $33, $34, $35,
          $36, $37, $38,
          $39, $40, $41, $42,
          $43, $44, $45,
          $46, $47, $48, $49, $50,
          $51, $52, $53, $54, $55, $56,
          $57, $58, $59, $60, $61,
          $62, $63, $64, $65, $66, $67,
          $68, $69, $70::jsonb, $71::jsonb, $72::jsonb,
          $73::jsonb, $74::jsonb, $75::jsonb, $76, $77, $78, $79
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
          record.aiSystemId,
          record.aiUseCaseId,
          record.assuranceId,
          record.riskClassificationId,
          record.safetyAssessmentId,
          record.impactAssessmentId,
          record.modelId,
          record.modelVersionId,
          record.modelRiskId,
          record.validationId,
          record.limitationId,
          record.testId,
          record.testCaseId,
          record.testReportId,
          record.promptId,
          record.promptVersionId,
          record.agentId,
          record.agentVersionId,
          record.permissionReviewId,
          record.behaviorEvaluationId,
          record.runtimeApprovalId,
          record.monitoringId,
          record.recommendationMonitorId,
          record.driftMonitorId,
          record.biasMonitorId,
          record.hallucinationMonitorId,
          record.unsafeOutputMonitorId,
          record.performanceMonitorId,
          record.incidentId,
          record.investigationId,
          record.correctiveActionId,
          record.regulatoryRequirementId,
          record.complianceMappingId,
          record.evidenceRepositoryId,
          record.auditPackageId,
          record.governanceDecisionId,
          record.attestationId,
          record.ownerId,
          record.approvalId,
          record.priority,
          record.severity,
          record.riskLevel,
          record.riskScore,
          record.safetyScore,
          record.validationScore,
          record.biasScore,
          record.driftScore,
          record.performanceScore,
          record.readinessScore,
          record.impactScore,
          nullableDate(record.startedAt),
          nullableDate(record.completedAt),
          nullableDate(record.approvedAt),
          nullableDate(record.rejectedAt),
          nullableDate(record.retiredAt),
          nullableDate(record.detectedAt),
          nullableDate(record.closedAt),
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
      `INSERT INTO global_ai_assurance_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        ai_assurance_resource_type, ai_assurance_resource_id, country_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.aiAssuranceResourceType,
        reference.aiAssuranceResourceId,
        reference.countryCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO global_ai_assurance_audit_entries (
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
      `INSERT INTO global_ai_assurance_events (
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

export async function createPostgresGlobalAiAssuranceRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresGlobalAiAssuranceRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_global_ai_assurance_model_risk.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
