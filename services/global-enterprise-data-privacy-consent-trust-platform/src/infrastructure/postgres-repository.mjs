import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresGlobalPrivacyRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async savePrivacyRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_privacy_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id,
          data_subject_id, patient_id, consent_id, consent_version_id, consent_scope_id,
          data_rights_request_id, privacy_policy_id, purpose_id, minimization_rule_id,
          retention_policy_id, privacy_exception_id, sharing_agreement_id, sharing_purpose_id,
          sharing_approval_id, source_organization_id, recipient_organization_id,
          trust_relationship_id, trust_profile_id, data_processor_id, data_controller_id,
          trusted_partner_id, verification_id, monitoring_id, violation_id,
          privacy_incident_id, risk_assessment_id, owner_id, reviewer_id, approval_id,
          priority, severity, risk_level, risk_score, compliance_score, consent_coverage_score,
          trust_score, fulfillment_score, started_at, completed_at, approved_at, requested_at,
          fulfilled_at, withdrawn_at, expires_at, detected_at, closed_at, generated_at,
          policy_controls, governance_context, workflow_controls, evidence, metrics, metadata,
          created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19, $20,
          $21, $22, $23, $24,
          $25, $26, $27,
          $28, $29, $30, $31,
          $32, $33, $34, $35,
          $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45, $46,
          $47, $48, $49, $50, $51, $52,
          $53, $54, $55, $56, $57, $58,
          $59::jsonb, $60::jsonb, $61::jsonb, $62::jsonb, $63::jsonb, $64::jsonb,
          $65, $66, $67, $68
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
          record.dataSubjectId,
          record.patientId,
          record.consentId,
          record.consentVersionId,
          record.consentScopeId,
          record.dataRightsRequestId,
          record.privacyPolicyId,
          record.purposeId,
          record.minimizationRuleId,
          record.retentionPolicyId,
          record.privacyExceptionId,
          record.sharingAgreementId,
          record.sharingPurposeId,
          record.sharingApprovalId,
          record.sourceOrganizationId,
          record.recipientOrganizationId,
          record.trustRelationshipId,
          record.trustProfileId,
          record.dataProcessorId,
          record.dataControllerId,
          record.trustedPartnerId,
          record.verificationId,
          record.monitoringId,
          record.violationId,
          record.privacyIncidentId,
          record.riskAssessmentId,
          record.ownerId,
          record.reviewerId,
          record.approvalId,
          record.priority,
          record.severity,
          record.riskLevel,
          record.riskScore,
          record.complianceScore,
          record.consentCoverageScore,
          record.trustScore,
          record.fulfillmentScore,
          nullableDate(record.startedAt),
          nullableDate(record.completedAt),
          nullableDate(record.approvedAt),
          nullableDate(record.requestedAt),
          nullableDate(record.fulfilledAt),
          nullableDate(record.withdrawnAt),
          nullableDate(record.expiresAt),
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
      `INSERT INTO global_privacy_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        privacy_resource_type, privacy_resource_id, country_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.privacyResourceType,
        reference.privacyResourceId,
        reference.countryCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO global_privacy_audit_entries (
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
      `INSERT INTO global_privacy_events (
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

export async function createPostgresGlobalPrivacyRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresGlobalPrivacyRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_global_privacy_consent_trust.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
