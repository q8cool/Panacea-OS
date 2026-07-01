import crypto from "node:crypto";
import {
  deriveCommandEventType,
  nowIso,
  permissionAllows,
  permissions,
  recordGroups
} from "../domain/command-domain.mjs";
import {
  assertPrincipalCanWriteGroup,
  CommandAuthorizationError,
  validateCreateCommandRecordInput,
  validateIntegrationReferenceInput,
  validatePrincipal
} from "../domain/command-validation.mjs";
import {
  assertPrincipalCanReadModel,
  subjectForReadModel
} from "../domain/read-models.mjs";
import {
  assertPrincipalCanWriteWorkflow,
  normalizeWriteWorkflowInput
} from "../domain/write-workflows.mjs";

function assertTenantAccess(principal, tenantId) {
  if (principal.tenantId !== tenantId) {
    throw new CommandAuthorizationError("principal tenant does not match request tenant", {
      principalTenantId: principal.tenantId,
      tenantId
    });
  }
}

function assertCountryAccess(principal, countryCode) {
  if (principal.countryCodes.length > 0 && !principal.countryCodes.includes(countryCode)) {
    throw new CommandAuthorizationError("principal is not authorized for this country", { countryCode });
  }
}

function assertRegionAccess(principal, regionCode) {
  if (principal.regionCodes.length > 0 && !principal.regionCodes.includes(regionCode)) {
    throw new CommandAuthorizationError("principal is not authorized for this region", { regionCode });
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

export class RealTimeGlobalCommandIntelligenceService {
  constructor({ repository, clock = () => new Date() }) {
    if (!repository) {
      throw new Error("repository is required");
    }
    this.repository = repository;
    this.clock = clock;
  }

  async recordCommandIntelligence(input, principal) {
    return this.#createRecord(input, principal, recordGroups.commandIntelligence);
  }

  async recordOperationalIntelligence(input, principal) {
    return this.#createRecord(input, principal, recordGroups.operationalIntelligence);
  }

  async recordAlertIntelligence(input, principal) {
    return this.#createRecord(input, principal, recordGroups.alertIntelligence);
  }

  async recordCrisisCoordination(input, principal) {
    return this.#createRecord(input, principal, recordGroups.crisisCoordination);
  }

  async recordDecisionSupport(input, principal) {
    return this.#createRecord(input, principal, recordGroups.decisionSupport);
  }

  async recordExecutiveIntelligence(input, principal) {
    return this.#createRecord(input, principal, recordGroups.executiveIntelligence);
  }

  async createIntegrationReference(input, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    if (!permissionAllows(normalizedPrincipal.permissions, permissions.integrationWrite)) {
      throw new CommandAuthorizationError("principal is not authorized to create command intelligence integration references", {
        requiredPermission: permissions.integrationWrite
      });
    }
    const validated = validateIntegrationReferenceInput(input);
    assertTenantAccess(normalizedPrincipal, validated.tenantId);
    assertCountryAccess(normalizedPrincipal, validated.countryCode);
    assertRegionAccess(normalizedPrincipal, validated.regionCode);

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
      action: "global_command_intelligence.integration_reference.created",
      resourceType: reference.commandResourceType,
      resourceId: reference.commandResourceId,
      occurredAt,
      countryCode: reference.countryCode,
      regionCode: reference.regionCode,
      metadata: {
        sourceSystem: reference.sourceSystem,
        sourceResourceType: reference.sourceResourceType,
        sourceResourceId: reference.sourceResourceId
      }
    });
    return reference;
  }

  async listReadModel(definition, params, query, principal) {
    const normalizedPrincipal = validatePrincipal(principal);
    assertPrincipalCanReadModel(normalizedPrincipal, definition);
    const subjectId = subjectForReadModel(definition, params, normalizedPrincipal);
    const occurredAt = nowIso(this.clock);
    const result = await this.repository.listReadModels({
      tenantId: normalizedPrincipal.tenantId,
      workspace: definition.workspace,
      modelKey: definition.modelKey,
      subjectId,
      limit: query.limit,
      offset: query.offset
    });
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: normalizedPrincipal.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: "global_command_intelligence.read_model.read",
      resourceType: `read_model.${definition.workspace}.${definition.modelKey}`,
      resourceId: subjectId ?? "collection",
      occurredAt,
      countryCode: normalizedPrincipal.countryCodes[0] ?? "KW",
      regionCode: normalizedPrincipal.regionCodes[0] ?? "GLOBAL",
      metadata: {
        workspace: definition.workspace,
        modelKey: definition.modelKey,
        subjectScoped: Boolean(subjectId),
        limit: query.limit,
        offset: query.offset,
        returned: result.items.length
      }
    });
    return {
      source: "live-read-model",
      demoData: false,
      tenantId: normalizedPrincipal.tenantId,
      workspace: definition.workspace,
      modelKey: definition.modelKey,
      subjectId,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: result.total
      },
      items: result.items
    };
  }

  async executeWriteWorkflow(definition, params, input, principal, requestContext = {}) {
    const normalizedPrincipal = validatePrincipal(principal);
    assertPrincipalCanWriteWorkflow(normalizedPrincipal, definition);
    const validated = normalizeWriteWorkflowInput(input, definition, params, normalizedPrincipal);
    assertTenantAccess(normalizedPrincipal, validated.tenantId);

    const occurredAt = nowIso(this.clock);
    const record = {
      id: crypto.randomUUID(),
      tenantId: validated.tenantId,
      workflowGroup: definition.workspace,
      workflowKey: definition.workflowKey,
      eventType: definition.eventType,
      subjectId: validated.subjectId,
      status: "accepted",
      title: validated.title,
      reason: validated.reason,
      idempotencyKey: validated.idempotencyKey,
      payload: validated.payload,
      workflowControls: validated.workflowControls,
      requestContext: {
        ...validated.requestContext,
        ...requestContext,
        method: "POST",
        path: definition.path,
        operationId: definition.operationId
      },
      createdBy: normalizedPrincipal.actorId,
      updatedBy: normalizedPrincipal.actorId,
      createdAt: occurredAt,
      updatedAt: occurredAt
    };
    const event = createEventEnvelope({
      tenantId: record.tenantId,
      eventType: definition.eventType,
      aggregateId: record.id,
      aggregateType: `write_workflow.${definition.workspace}.${definition.workflowKey}`,
      actorId: normalizedPrincipal.actorId,
      occurredAt,
      payload: {
        workflowGroup: record.workflowGroup,
        workflowKey: record.workflowKey,
        status: record.status,
        subjectId: record.subjectId,
        title: record.title,
        liveMode: record.workflowControls.liveMode,
        demoData: record.workflowControls.demoData,
        auditRequired: record.workflowControls.auditRequired,
        tenantIsolationConfirmed: record.workflowControls.tenantIsolationConfirmed,
        humanUserConfirmed: record.workflowControls.humanUserConfirmed,
        payloadKeys: Object.keys(record.payload).sort()
      }
    });
    const auditEntry = {
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_command_intelligence.write_workflow.${record.workflowKey}.accepted`,
      resourceType: `write_workflow.${record.workflowGroup}`,
      resourceId: record.id,
      occurredAt,
      countryCode: normalizedPrincipal.countryCodes[0] ?? "KW",
      regionCode: normalizedPrincipal.regionCodes[0] ?? "GLOBAL",
      metadata: {
        eventType: definition.eventType,
        workflowKey: record.workflowKey,
        subjectId: record.subjectId,
        idempotencyKey: record.idempotencyKey,
        liveMode: true,
        demoData: false,
        autonomousDiagnosis: "not_permitted",
        autonomousTreatment: "not_permitted"
      }
    };
    await this.repository.saveWriteWorkflow(record, event, auditEntry);
    return { record, event };
  }

  async #createRecord(input, principal, expectedGroup) {
    const validated = validateCreateCommandRecordInput({
      ...input,
      recordGroup: expectedGroup
    });
    const normalizedPrincipal = assertPrincipalCanWriteGroup(principal, validated.recordGroup);
    assertTenantAccess(normalizedPrincipal, validated.tenantId);
    assertCountryAccess(normalizedPrincipal, validated.countryCode);
    assertRegionAccess(normalizedPrincipal, validated.regionCode);

    const occurredAt = nowIso(this.clock);
    const record = {
      id: crypto.randomUUID(),
      ...validated,
      createdBy: normalizedPrincipal.actorId,
      updatedBy: normalizedPrincipal.actorId,
      createdAt: occurredAt,
      updatedAt: occurredAt
    };
    const eventType = deriveCommandEventType(record);
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
        regionCode: record.regionCode,
        commandCenterId: record.commandCenterId,
        commandEventId: record.commandEventId,
        situationId: record.situationId,
        alertId: record.alertId,
        crisisEventId: record.crisisEventId,
        coordinationId: record.coordinationId,
        recommendationId: record.recommendationId,
        briefingId: record.briefingId,
        advisoryOnly: record.governanceContext.advisoryOnly,
        governanceApprovalEnforced: record.governanceContext.governanceApprovalEnforced
      }
    });
    await this.repository.saveCommandRecord(record, event);
    await this.repository.saveAuditEntry({
      id: crypto.randomUUID(),
      tenantId: record.tenantId,
      actorId: normalizedPrincipal.actorId,
      action: `global_command_intelligence.${record.recordGroup}.${record.recordType}.${record.status}`,
      resourceType: record.recordType,
      resourceId: record.id,
      occurredAt,
      countryCode: record.countryCode,
      regionCode: record.regionCode,
      metadata: {
        eventType,
        policyId: record.policyControls.policyId,
        governingBody: record.policyControls.governingBody,
        riskLevel: record.riskLevel,
        riskScore: record.riskScore,
        urgencyScore: record.urgencyScore,
        confidenceScore: record.confidenceScore
      }
    });
    return { record, event };
  }
}

export function createRealTimeGlobalCommandIntelligenceService(options) {
  return new RealTimeGlobalCommandIntelligenceService(options);
}
