import crypto from "node:crypto";
import {
  deriveProductManagementEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/product-management-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  ProductManagementAuthorizationError,
  validateCreateProductManagementRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/product-management-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new ProductManagementAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new ProductManagementAuthorizationError("principal is not authorized for this country", { countryCode });
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

export class GlobalProductManagementService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordProductManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.productManagement);
  }

  async recordRoadmapManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.roadmapManagement);
  }

  async recordInnovationPortfolio(input, principal) {
    return this.#createRecord(input, principal, recordGroups.innovationPortfolio);
  }

  async recordRequirementsManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.requirementsManagement);
  }

  async recordProductFeedback(input, principal) {
    return this.#createRecord(input, principal, recordGroups.productFeedback);
  }

  async recordReleaseGovernance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.releaseGovernance);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new ProductManagementAuthorizationError("principal is not authorized to create product management integration references", {
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
      action: "global_product_management.integration_reference.created",
      resourceType: reference.productManagementResourceType,
      resourceId: reference.productManagementResourceId,
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
    const validated = validateCreateProductManagementRecordInput({
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
    const eventType = deriveProductManagementEventType(record);
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
        productId: record.productId,
        featureId: record.featureId,
        roadmapId: record.roadmapId,
        milestoneId: record.milestoneId,
        innovationIdeaId: record.innovationIdeaId,
        requirementId: record.requirementId,
        feedbackId: record.feedbackId,
        releaseCandidateId: record.releaseCandidateId
      }
    });
    await this.repository.saveProductManagementRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_product_management.${record.recordGroup}.${record.recordType}.${record.status}`,
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
        riskScore: record.riskScore
      }
    });
    return { record, event };
  }
}

export function createGlobalProductManagementService(options) {
  return new GlobalProductManagementService(options);
}
