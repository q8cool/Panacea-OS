import crypto from "node:crypto";
import {
  deriveIntelligenceEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/intelligence-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  IntelligenceAuthorizationError,
  validateCreateIntelligenceRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/intelligence-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new IntelligenceAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new IntelligenceAuthorizationError("principal is not authorized for this country", { countryCode });
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
    schemaVersion: "4.0.0"
  };
}

export class AutonomousHealthcareIntelligenceService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordFoundation(input, principal) {
    return this.#createRecord(input, principal, recordGroups.foundation);
  }

  async recordClinicalGovernance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.clinicalGovernance);
  }

  async recordOrchestration(input, principal) {
    return this.#createRecord(input, principal, recordGroups.orchestration);
  }

  async recordSafetyControl(input, principal) {
    return this.#createRecord(input, principal, recordGroups.safetyControl);
  }

  async recordTraceability(input, principal) {
    return this.#createRecord(input, principal, recordGroups.traceability);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new IntelligenceAuthorizationError("principal is not authorized to create intelligence integration references", {
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
      action: "autonomous_intelligence.integration_reference.created",
      resourceType: reference.intelligenceResourceType,
      resourceId: reference.intelligenceResourceId,
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
    const validated = validateCreateIntelligenceRecordInput({
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
    const eventType = deriveIntelligenceEventType(record);
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
        intelligenceId: record.intelligenceId,
        capabilityId: record.capabilityId,
        recommendationId: record.recommendationId,
        traceId: record.traceId,
        emergencyStopId: record.emergencyStopId,
        advisoryOnly: record.governanceContext.advisoryOnly,
        clinicianApprovalEnforced: record.governanceContext.clinicianApprovalEnforced
      }
    });
    await this.repository.saveIntelligenceRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `autonomous_intelligence.${record.recordGroup}.${record.recordType}.${record.status}`,
      resourceType: record.recordType,
      resourceId: record.id,
      occurredAt,
      countryCode: record.countryCode,
      metadata: {
        eventType,
        policyId: record.policyControls.policyId,
        governingBody: record.policyControls.governingBody,
        riskLevel: record.riskLevel,
        riskScore: record.riskScore,
        safetyScore: record.safetyScore,
        governanceScore: record.governanceScore
      }
    });
    return { record, event };
  }
}

export function createAutonomousHealthcareIntelligenceService(options) {
  return new AutonomousHealthcareIntelligenceService(options);
}
