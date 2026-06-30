import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function json(value) {
  return JSON.stringify(value ?? {});
}

function nullableDate(value) {
  return value || null;
}

export class PostgresGlobalLegalRepository {
  constructor({ pool }) {
    if (!pool) {
      throw new Error("pool is required");
    }
    this.pool = pool;
  }

  async saveLegalRecord(record, event) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO global_legal_records (
          id, tenant_id, record_group, record_type, status, title, description,
          country_code, region_code, jurisdiction_code, organization_id, facility_id, department_id,
          legal_matter_id, legal_case_id, legal_document_id, contract_id, contract_template_id,
          contract_obligation_id, vendor_id, insurance_provider_id, employee_id, clinical_service_id,
          risk_id, mitigation_plan_id, board_id, committee_id, meeting_id, decision_id,
          policy_id, policy_version_id, regulatory_obligation_id, regulatory_submission_id,
          evidence_repository_id, effective_date, expiration_date, review_due_date, submitted_at,
          approved_at, risk_score, risk_level, amount, currency_code, policy_controls,
          governance_context, workflow_controls, evidence, metrics, metadata, created_by, updated_by,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23,
          $24, $25, $26, $27, $28, $29,
          $30, $31, $32, $33,
          $34, $35, $36, $37, $38,
          $39, $40, $41, $42, $43, $44::jsonb,
          $45::jsonb, $46::jsonb, $47::jsonb, $48::jsonb, $49::jsonb, $50, $51,
          $52, $53
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
          record.facilityId,
          record.departmentId,
          record.legalMatterId,
          record.legalCaseId,
          record.legalDocumentId,
          record.contractId,
          record.contractTemplateId,
          record.contractObligationId,
          record.vendorId,
          record.insuranceProviderId,
          record.employeeId,
          record.clinicalServiceId,
          record.riskId,
          record.mitigationPlanId,
          record.boardId,
          record.committeeId,
          record.meetingId,
          record.decisionId,
          record.policyId,
          record.policyVersionId,
          record.regulatoryObligationId,
          record.regulatorySubmissionId,
          record.evidenceRepositoryId,
          nullableDate(record.effectiveDate),
          nullableDate(record.expirationDate),
          nullableDate(record.reviewDueDate),
          nullableDate(record.submittedAt),
          nullableDate(record.approvedAt),
          record.riskScore,
          record.riskLevel,
          record.amount,
          record.currencyCode,
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
      `INSERT INTO global_legal_integration_references (
        id, tenant_id, source_system, source_resource_type, source_resource_id,
        legal_resource_type, legal_resource_id, country_code, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
      [
        reference.id,
        reference.tenantId,
        reference.sourceSystem,
        reference.sourceResourceType,
        reference.sourceResourceId,
        reference.legalResourceType,
        reference.legalResourceId,
        reference.countryCode,
        json(reference.metadata),
        reference.createdBy,
        reference.createdAt
      ]
    );
  }

  async saveAuditEntry(entry) {
    await this.pool.query(
      `INSERT INTO global_legal_audit_entries (
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
      `INSERT INTO global_legal_events (
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

export async function createPostgresGlobalLegalRepository({ connectionString }) {
  if (!connectionString) {
    throw new Error("connectionString is required");
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  return {
    repository: new PostgresGlobalLegalRepository({ pool }),
    pool
  };
}

export async function runPostgresMigrations({ connectionString }) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString });
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationPath = path.resolve(moduleDir, "../../migrations/001_global_legal_contracting_risk_governance.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
  } finally {
    await pool.end();
  }
}
