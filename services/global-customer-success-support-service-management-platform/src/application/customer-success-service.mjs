import crypto from "node:crypto";
import {
  deriveCustomerSuccessEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/customer-success-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  CustomerSuccessAuthorizationError,
  validateCreateCustomerSuccessRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/customer-success-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new CustomerSuccessAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new CustomerSuccessAuthorizationError("principal is not authorized for this country", { countryCode });
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

export class GlobalCustomerSuccessService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordCustomerSuccess(input, principal) {
    return this.#createRecord(input, principal, recordGroups.customerSuccess);
  }

  async recordEnterpriseSupport(input, principal) {
    return this.#createRecord(input, principal, recordGroups.enterpriseSupport);
  }

  async recordServiceManagement(input, principal) {
    return this.#createRecord(input, principal, recordGroups.serviceManagement);
  }

  async recordImplementationOnboarding(input, principal) {
    return this.#createRecord(input, principal, recordGroups.implementationOnboarding);
  }

  async recordCustomerCommunication(input, principal) {
    return this.#createRecord(input, principal, recordGroups.customerCommunication);
  }

  async recordSupportAnalytics(input, principal) {
    return this.#createRecord(input, principal, recordGroups.supportAnalytics);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new CustomerSuccessAuthorizationError("principal is not authorized to create customer success integration references", {
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
      action: "global_customer_success.integration_reference.created",
      resourceType: reference.customerSuccessResourceType,
      resourceId: reference.customerSuccessResourceId,
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
    const validated = validateCreateCustomerSuccessRecordInput({
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
    const eventType = deriveCustomerSuccessEventType(record);
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
        customerId: record.customerId,
        accountId: record.accountId,
        supportTicketId: record.supportTicketId,
        incidentId: record.incidentId,
        serviceRequestId: record.serviceRequestId,
        onboardingId: record.onboardingId,
        feedbackId: record.feedbackId
      }
    });
    await this.repository.saveCustomerSuccessRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_customer_success.${record.recordGroup}.${record.recordType}.${record.status}`,
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
        severity: record.severity
      }
    });
    return { record, event };
  }
}

export function createGlobalCustomerSuccessService(options) {
  return new GlobalCustomerSuccessService(options);
}
