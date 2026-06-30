import crypto from "node:crypto";
import {
  deriveAiAssuranceEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/ai-assurance-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  AiAssuranceAuthorizationError,
  validateCreateAiAssuranceRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/ai-assurance-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new AiAssuranceAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new AiAssuranceAuthorizationError("principal is not authorized for this country", { countryCode });
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

export class GlobalAiAssuranceService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordAiAssurance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.aiAssurance);
  }

  async recordModelRiskManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.modelRiskManagement);
  }

  async recordAiSafetyTesting(input, principal) {
    return this.#createRecord(input, principal, recordGroups.aiSafetyTesting);
  }

  async recordPromptAgentAssurance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.promptAgentAssurance);
  }

  async recordAiMonitoring(input, principal) {
    return this.#createRecord(input, principal, recordGroups.aiMonitoring);
  }

  async recordAiIncidentManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.aiIncidentManagement);
  }

  async recordRegulatoryAiGovernance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.regulatoryAiGovernance);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new AiAssuranceAuthorizationError("principal is not authorized to create AI assurance integration references", {
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
      action: "global_ai_assurance.integration_reference.created",
      resourceType: reference.aiAssuranceResourceType,
      resourceId: reference.aiAssuranceResourceId,
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
    const validated = validateCreateAiAssuranceRecordInput({
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
    const eventType = deriveAiAssuranceEventType(record);
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
        aiSystemId: record.aiSystemId,
        aiUseCaseId: record.aiUseCaseId,
        modelId: record.modelId,
        promptId: record.promptId,
        agentId: record.agentId,
        testId: record.testId,
        monitoringId: record.monitoringId,
        incidentId: record.incidentId,
        auditPackageId: record.auditPackageId
      }
    });
    await this.repository.saveAiAssuranceRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_ai_assurance.${record.recordGroup}.${record.recordType}.${record.status}`,
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
        riskLevel: record.riskLevel,
        riskScore: record.riskScore
      }
    });
    return { record, event };
  }
}

export function createGlobalAiAssuranceService(options) {
  return new GlobalAiAssuranceService(options);
}
