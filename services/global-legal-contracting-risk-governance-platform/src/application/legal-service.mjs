import crypto from "node:crypto";
import {
  deriveLegalEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/legal-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  LegalAuthorizationError,
  validateCreateLegalRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/legal-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new LegalAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new LegalAuthorizationError("principal is not authorized for this country", { countryCode });
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

export class GlobalLegalService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordLegalManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.legalManagement);
  }

  async recordContractManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.contractManagement);
  }

  async recordEnterpriseRisk(input, principal) {
    return this.#createRecord(input, principal, recordGroups.enterpriseRiskManagement);
  }

  async recordGovernance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.governance);
  }

  async recordPolicyManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.policyManagement);
  }

  async recordComplianceRegulatory(input, principal) {
    return this.#createRecord(input, principal, recordGroups.complianceRegulatory);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new LegalAuthorizationError("principal is not authorized to create legal governance integration references", {
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
      action: "global_legal.integration_reference.created",
      resourceType: reference.legalResourceType,
      resourceId: reference.legalResourceId,
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
    const validated = validateCreateLegalRecordInput({
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
    const eventType = deriveLegalEventType(record);
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
        jurisdictionCode: record.jurisdictionCode,
        legalMatterId: record.legalMatterId,
        contractId: record.contractId,
        riskId: record.riskId,
        policyId: record.policyId,
        regulatoryObligationId: record.regulatoryObligationId
      }
    });
    await this.repository.saveLegalRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_legal.${record.recordGroup}.${record.recordType}.${record.status}`,
      resourceType: record.recordType,
      resourceId: record.id,
      occurredAt,
      countryCode: record.countryCode,
      metadata: {
        eventType,
        jurisdictionCode: record.jurisdictionCode,
        policyId: record.policyControls.policyId,
        governingBody: record.policyControls.governingBody,
        riskLevel: record.riskLevel
      }
    });
    return { record, event };
  }
}

export function createGlobalLegalService(options) {
  return new GlobalLegalService(options);
}
