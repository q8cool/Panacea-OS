import crypto from "node:crypto";
import {
  deriveWorkforceEventType,
  nowIso,
  permissions,
  permissionAllows,
  recordGroups
} from "../domain/workforce-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  validateCreateWorkforceRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal,
  WorkforceAuthorizationError
} from "../domain/workforce-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new WorkforceAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new WorkforceAuthorizationError("principal is not authorized for this country", {
      countryCode
    });
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

export class GlobalWorkforceService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordWorkforceManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.workforceManagement);
  }

  async recordClinicalCredentialing(input, principal) {
    return this.#createRecord(input, principal, recordGroups.clinicalCredentialing);
  }

  async recordWorkforcePlanning(input, principal) {
    return this.#createRecord(input, principal, recordGroups.workforcePlanning);
  }

  async recordStaffExperience(input, principal) {
    return this.#createRecord(input, principal, recordGroups.staffExperience);
  }

  async recordHrOperations(input, principal) {
    return this.#createRecord(input, principal, recordGroups.hrOperations);
  }

  async recordCompliance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.compliance);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new WorkforceAuthorizationError("principal is not authorized to create workforce integration references", {
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
      action: "global_workforce.integration_reference.created",
      resourceType: reference.workforceResourceType,
      resourceId: reference.workforceResourceId,
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
    const validated = validateCreateWorkforceRecordInput({
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
    const eventType = deriveWorkforceEventType(record);
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
        facilityId: record.facilityId,
        departmentId: record.departmentId,
        staffId: record.staffId,
        credentialId: record.credentialId,
        complianceRequirementId: record.complianceRequirementId
      }
    });
    await this.repository.saveWorkforceRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_workforce.${record.recordGroup}.${record.recordType}.${record.status}`,
      resourceType: record.recordType,
      resourceId: record.id,
      occurredAt,
      countryCode: record.countryCode,
      metadata: {
        eventType,
        jurisdictionCode: record.jurisdictionCode,
        policyId: record.policyControls.policyId,
        governingBody: record.policyControls.governingBody
      }
    });
    return {
      record,
      event
    };
  }
}

export function createGlobalWorkforceService(options) {
  return new GlobalWorkforceService(options);
}
