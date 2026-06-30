import crypto from "node:crypto";
import {
  deriveComplianceEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/compliance-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  ComplianceAuthorizationError,
  validateCreateComplianceRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/compliance-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new ComplianceAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new ComplianceAuthorizationError("principal is not authorized for this country", { countryCode });
  }
}

function createEventEnvelope({ tenantId, eventType, aggregateId, aggregateType, actorId, occurredAt, payload }) {
  return {
    id: crypto.randomUUID(),
    tenantId,
    eventType,
    aggregateId,
    aggregateType,
    actorId,
    occurredAt,
    payload,
    schemaVersion: "3.0.0"
  };
}

export class GlobalComplianceService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordRegulatoryIntelligence(input, principal) {
    return this.#createRecord(input, principal, recordGroups.regulatoryIntelligence);
  }

  async recordComplianceAutomation(input, principal) {
    return this.#createRecord(input, principal, recordGroups.complianceAutomation);
  }

  async recordAuditManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.auditManagement);
  }

  async recordCertificationManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.certificationManagement);
  }

  async recordPolicyCompliance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.policyCompliance);
  }

  async recordRegulatoryReporting(input, principal) {
    return this.#createRecord(input, principal, recordGroups.regulatoryReporting);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new ComplianceAuthorizationError("principal is not authorized to create compliance integration references", {
        requiredPermission: permissions.integrationWrite
      });
    }
    const validated = validateIntegrationReferenceInput(input);
    assertTenantAccess(normalizedPrincipal, validated.tenantId);
    assertCountryAccess(normalizedPrincipal, validated.countryCode);

    const occurredAt = nowIso(this.clock);
    const reference = {
      id: crypto.randomUUID(),
      ...validated,
      createdBy: normalizedPrincipal.actorId,
      createdAt: occurredAt
    };
    await this.repository.saveIntegrationReference(reference);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: reference.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: "global_compliance.integration_reference.created",
      resourceType: reference.complianceResourceType,
      resourceId: reference.complianceResourceId,
      occurredAt,
      countryCode: reference.countryCode,
      metadata: {
        sourceSystem: reference.sourceSystem,
        sourceResourceType: reference.sourceResourceType,
        sourceResourceId: reference.sourceResourceId
      }
    });
    return reference;
  }

  async #createRecord(input, principal, expectedGroup) {
    const validated = validateCreateComplianceRecordInput({
      ...input,
      recordGroup: expectedGroup
    });
    const normalizedPrincipal = assertPrincipalCanWriteGroup(principal, validated.recordGroup);
    assertTenantAccess(normalizedPrincipal, validated.tenantId);
    assertCountryAccess(normalizedPrincipal, validated.countryCode);

    const occurredAt = nowIso(this.clock);
    const record = {
      id: crypto.randomUUID(),
      ...validated,
      createdBy: normalizedPrincipal.actorId,
      updatedBy: normalizedPrincipal.actorId,
      createdAt: occurredAt,
      updatedAt: occurredAt
    };
    const eventType = deriveComplianceEventType(record);
    const event = createEventEnvelope({
      tenantId: record.tenantId,
      eventType,
      aggregateId: record.id,
      aggregateType: record.recordType,
      actorId: normalizedPrincipal.actorId,
      occurredAt,
      payload: {
        recordGroup: record.recordGroup,
        recordType: record.recordType,
        status: record.status,
        countryCode: record.countryCode,
        frameworkId: record.frameworkId,
        regulationId: record.regulationId,
        requirementId: record.requirementId,
        ruleId: record.ruleId,
        evidenceId: record.evidenceId,
        gapId: record.gapId,
        remediationId: record.remediationId,
        auditPlanId: record.auditPlanId,
        certificationId: record.certificationId,
        policyId: record.policyId,
        reportId: record.reportId
      }
    });
    await this.repository.saveComplianceRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_compliance.${record.recordGroup}.${record.recordType}.${record.status}`,
      resourceType: record.recordType,
      resourceId: record.id,
      occurredAt,
      countryCode: record.countryCode,
      metadata: {
        eventType,
        jurisdictionCode: record.jurisdictionCode,
        policyId: record.policyControls.policyId,
        governingBody: record.policyControls.governingBody,
        priority: record.priority,
        severity: record.severity,
        riskScore: record.riskScore
      }
    });
    return { record, event };
  }
}

export function createGlobalComplianceService(options) {
  return new GlobalComplianceService(options);
}
