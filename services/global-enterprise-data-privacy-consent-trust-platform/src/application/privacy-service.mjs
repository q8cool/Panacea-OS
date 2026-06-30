import crypto from "node:crypto";
import {
  derivePrivacyEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/privacy-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  PrivacyAuthorizationError,
  validateCreatePrivacyRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/privacy-validation.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new PrivacyAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new PrivacyAuthorizationError("principal is not authorized for this country", { countryCode });
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

export class GlobalPrivacyService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordGlobalConsent(input, principal) {
    return this.#createRecord(input, principal, recordGroups.globalConsent);
  }

  async recordPatientDataRights(input, principal) {
    return this.#createRecord(input, principal, recordGroups.patientDataRights);
  }

  async recordPrivacyPolicyEngine(input, principal) {
    return this.#createRecord(input, principal, recordGroups.privacyPolicyEngine);
  }

  async recordDataSharingGovernance(input, principal) {
    return this.#createRecord(input, principal, recordGroups.dataSharingGovernance);
  }

  async recordTrustPlatform(input, principal) {
    return this.#createRecord(input, principal, recordGroups.trustPlatform);
  }

  async recordPrivacyMonitoring(input, principal) {
    return this.#createRecord(input, principal, recordGroups.privacyMonitoring);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new PrivacyAuthorizationError("principal is not authorized to create privacy integration references", {
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
      action: "global_privacy.integration_reference.created",
      resourceType: reference.privacyResourceType,
      resourceId: reference.privacyResourceId,
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
    const validated = validateCreatePrivacyRecordInput({
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
    const eventType = derivePrivacyEventType(record);
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
        dataSubjectId: record.dataSubjectId,
        consentId: record.consentId,
        dataRightsRequestId: record.dataRightsRequestId,
        privacyPolicyId: record.privacyPolicyId,
        purposeId: record.purposeId,
        sharingAgreementId: record.sharingAgreementId,
        sharingApprovalId: record.sharingApprovalId,
        trustRelationshipId: record.trustRelationshipId,
        trustProfileId: record.trustProfileId,
        monitoringId: record.monitoringId,
        violationId: record.violationId,
        privacyIncidentId: record.privacyIncidentId
      }
    });
    await this.repository.savePrivacyRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_privacy.${record.recordGroup}.${record.recordType}.${record.status}`,
      resourceType: record.recordType,
      resourceId: record.id,
      occurredAt,
      countryCode: record.countryCode,
      metadata: {
        eventType,
        jurisdictionCode: record.jurisdictionCode,
        policyId: record.policyControls.policyId,
        governingBody: record.policyControls.governingBody,
        purposeId: record.purposeId,
        consentId: record.consentId,
        dataResidencyVerified: record.workflowControls.dataResidencyVerified,
        crossBorderPolicyVerified: record.workflowControls.crossBorderPolicyVerified,
        priority: record.priority,
        severity: record.severity,
        riskLevel: record.riskLevel,
        riskScore: record.riskScore
      }
    });
    return { record, event };
  }
}

export function createGlobalPrivacyService(options) {
  return new GlobalPrivacyService(options);
}
