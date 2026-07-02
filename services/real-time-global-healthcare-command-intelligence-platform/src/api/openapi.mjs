import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_BASE_PATH,
  API_VERSION,
  commandStatuses,
  integrationSources,
  recordTypesByGroup,
  requiredEvents
} from "../domain/command-domain.mjs";
import { readModelDefinitions, readModelPermission } from "../domain/read-models.mjs";
import {
  requiredWriteWorkflowEvents,
  writeWorkflowDefinitions,
  writeWorkflowPermission
} from "../domain/write-workflows.mjs";
import {
  projectionReadPermission,
  projectionRetryPermission,
  projectionStatuses
} from "../domain/write-projections.mjs";
import { routeDefinitions } from "./routes.mjs";

function schemaRef(name) {
  return { $ref: `#/components/schemas/${name}` };
}

function createRecordPath(route) {
  return {
    [route.method.toLowerCase()]: {
      tags: [route.group],
      operationId: route.operationId,
      summary: route.summary,
      security: [{ bearerAuth: [] }, { tenantHeaders: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: schemaRef("CommandRecordCreate")
          }
        }
      },
      responses: {
        "201": {
          description: "Command intelligence record persisted and event queued",
          content: { "application/json": { schema: schemaRef("CommandRecordResponse") } }
        },
        "400": { description: "Validation failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "401": { description: "Authentication failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "403": { description: "Authorization failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } }
      }
    }
  };
}

function createReadModelPath(definition) {
  const pathParameters = [...definition.path.matchAll(/\{([^}]+)\}/g)].map((match) => ({
    name: match[1],
    in: "path",
    required: true,
    schema: { type: "string", minLength: 1 },
    description: `Read-model ${match[1]} selector.`
  }));
  return {
    get: {
      tags: ["live_read_models"],
      operationId: definition.operationId,
      summary: definition.summary,
      description: "Live workspace read model. The endpoint returns tenant-scoped backend records only; it does not perform writes or clinical actions.",
      security: [{ bearerAuth: [] }, { tenantHeaders: [] }],
      parameters: [
        ...pathParameters,
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
          description: "Maximum read-model rows to return."
        },
        {
          name: "offset",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 0, maximum: 10000, default: 0 },
          description: "Read-model row offset."
        }
      ],
      responses: {
        "200": {
          description: "Tenant-scoped live read-model rows returned",
          content: { "application/json": { schema: schemaRef("ReadModelListResponse") } }
        },
        "400": { description: "Validation failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "401": { description: "Authentication failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "403": { description: "Authorization failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } }
      }
    }
  };
}

function createWriteWorkflowPath(definition) {
  const pathParameters = [...definition.path.matchAll(/\{([^}]+)\}/g)].map((match) => ({
    name: match[1],
    in: "path",
    required: true,
    schema: { type: "string", minLength: 1 },
    description: `Write workflow ${match[1]} selector.`
  }));
  return {
    post: {
      tags: ["live_write_workflows"],
      operationId: definition.operationId,
      summary: definition.summary,
      description: "Authenticated tenant-scoped transactional write workflow. The endpoint persists approved operational or clinical records, appends audit evidence, and queues an event. It does not perform autonomous diagnosis, autonomous treatment, autonomous prescribing, or unapproved automation.",
      security: [{ bearerAuth: [] }, { tenantHeaders: [] }],
      parameters: pathParameters,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: schemaRef("WriteWorkflowCreate")
          }
        }
      },
      responses: {
        "201": {
          description: "Live write workflow persisted and event queued",
          content: { "application/json": { schema: schemaRef("WriteWorkflowResponse") } }
        },
        "400": { description: "Validation failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "401": { description: "Authentication failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "403": { description: "Authorization failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } }
      }
    }
  };
}

function createProjectionListPath(kind) {
  const isEvents = kind === "events";
  return {
    get: {
      tags: ["live_event_projection"],
      operationId: isEvents ? "listLiveWriteWorkflowEvents" : "listLiveWriteWorkflowProjections",
      summary: isEvents ? "List accepted live write workflow events" : "List live write workflow projection statuses",
      description: "Operator and administrator review endpoint for tenant-scoped live write events and read-model projections. It is review-scoped, fully auditable, and does not re-execute clinical decisions.",
      security: [{ bearerAuth: [] }, { tenantHeaders: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, maximum: 100, default: 25 }
        },
        {
          name: "offset",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 0, maximum: 10000, default: 0 }
        },
        ...(isEvents ? [] : [{
          name: "status",
          in: "query",
          required: false,
          schema: { type: "string", enum: projectionStatuses }
        }]),
        {
          name: "eventType",
          in: "query",
          required: false,
          schema: { type: "string", enum: requiredWriteWorkflowEvents() }
        }
      ],
      responses: {
        "200": { description: "Tenant-scoped transaction review records returned", content: { "application/json": { schema: schemaRef(isEvents ? "WriteWorkflowEventListResponse" : "WriteWorkflowProjectionListResponse") } } },
        "400": { description: "Validation failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "401": { description: "Authentication failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "403": { description: "Authorization failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } }
      }
    }
  };
}

function createProjectionDetailPath() {
  return {
    get: {
      tags: ["live_event_projection"],
      operationId: "getLiveWriteWorkflowProjection",
      summary: "Get a live write workflow projection",
      description: "Returns one tenant-scoped projection tracking record for operator review.",
      security: [{ bearerAuth: [] }, { tenantHeaders: [] }],
      parameters: [projectionIdParameter()],
      responses: {
        "200": { description: "Projection returned", content: { "application/json": { schema: schemaRef("WriteWorkflowProjectionResponse") } } },
        "400": { description: "Validation failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "401": { description: "Authentication failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "403": { description: "Authorization failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } }
      }
    }
  };
}

function createProjectionRetryPath() {
  return {
    post: {
      tags: ["live_event_projection"],
      operationId: "retryLiveWriteWorkflowProjection",
      summary: "Retry a failed read-model projection",
      description: "Operator/admin-only replay of a failed projection into an existing read model. The endpoint never re-executes diagnosis, treatment, prescribing, or clinical decisions and uses idempotent read-model upserts.",
      security: [{ bearerAuth: [] }, { tenantHeaders: [] }],
      parameters: [projectionIdParameter()],
      responses: {
        "200": { description: "Projection safely replayed", content: { "application/json": { schema: schemaRef("WriteWorkflowProjectionResponse") } } },
        "400": { description: "Validation failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "401": { description: "Authentication failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "403": { description: "Authorization failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } }
      }
    }
  };
}

function projectionIdParameter() {
  return {
    name: "projectionId",
    in: "path",
    required: true,
    schema: { type: "string", minLength: 1 },
    description: "Projection tracking identifier."
  };
}

export function buildOpenApiDocument() {
  const paths = {
    [`${API_BASE_PATH}/live`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalCommandIntelligenceLive",
        summary: "Liveness probe",
        responses: { "200": { description: "Service is live" } }
      }
    },
    [`${API_BASE_PATH}/ready`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalCommandIntelligenceReady",
        summary: "Readiness probe",
        responses: { "200": { description: "Service is ready" } }
      }
    },
    [`${API_BASE_PATH}/metrics`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalCommandIntelligenceMetrics",
        summary: "Operational metrics summary",
        responses: { "200": { description: "Metrics returned" } }
      }
    },
    [`${API_BASE_PATH}/docs/openapi.json`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalCommandIntelligenceOpenApi",
        summary: "OpenAPI document",
        responses: { "200": { description: "OpenAPI document returned" } }
      }
    }
  };
  for (const route of routeDefinitions) {
    paths[`${API_BASE_PATH}${route.path}`] = createRecordPath(route);
  }
  for (const definition of readModelDefinitions) {
    paths[`${API_BASE_PATH}${definition.path}`] = createReadModelPath(definition);
  }
  for (const definition of writeWorkflowDefinitions) {
    paths[`${API_BASE_PATH}${definition.path}`] = createWriteWorkflowPath(definition);
  }
  paths[`${API_BASE_PATH}/write-workflows/events`] = createProjectionListPath("events");
  paths[`${API_BASE_PATH}/write-workflows/projections`] = createProjectionListPath("projections");
  paths[`${API_BASE_PATH}/write-workflows/projections/{projectionId}`] = createProjectionDetailPath();
  paths[`${API_BASE_PATH}/write-workflows/projections/{projectionId}/retry`] = createProjectionRetryPath();
  paths[`${API_BASE_PATH}/integrations/references`] = {
    post: {
      tags: ["Integrations"],
      operationId: "createGlobalCommandIntelligenceIntegrationReference",
      summary: "Create an auditable integration reference",
      security: [{ bearerAuth: [] }, { tenantHeaders: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: schemaRef("IntegrationReferenceCreate")
          }
        }
      },
      responses: {
        "201": { description: "Integration reference persisted", content: { "application/json": { schema: schemaRef("IntegrationReferenceResponse") } } },
        "400": { description: "Validation failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "401": { description: "Authentication failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } },
        "403": { description: "Authorization failure", content: { "application/json": { schema: schemaRef("ErrorResponse") } } }
      }
    }
  };

  return {
    openapi: "3.1.0",
    info: {
      title: "Panacea OS Real-Time Global Healthcare Command Intelligence API",
      version: "4.0.0",
      description: "Versioned API for governed, advisory, explainable, auditable real-time global healthcare command intelligence. The platform provides command visibility, alerts, crisis coordination, recommendations, and executive intelligence without autonomous diagnosis, autonomous treatment, or autonomous emergency enforcement."
    },
    servers: [{ url: API_BASE_PATH, description: "Versioned API base path" }],
    tags: [
      { name: "Operations" },
      { name: "Integrations" },
      { name: "global_command_intelligence" },
      { name: "real_time_operational_intelligence" },
      { name: "global_alert_intelligence" },
      { name: "crisis_emergency_coordination" },
      { name: "command_decision_support" },
      { name: "executive_intelligence" },
      { name: "live_read_models" },
      { name: "live_write_workflows" },
      { name: "live_event_projection" }
    ],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        tenantHeaders: {
          type: "apiKey",
          in: "header",
          name: "x-tenant-id",
          description: "Tenant isolation boundary supplied by the identity platform."
        }
      },
      schemas: {
        CommandRecordCreate: {
          type: "object",
          additionalProperties: true,
          required: ["tenantId", "status", "title", "countryCode", "regionCode", "jurisdictionCode", "policyControls", "governanceContext", "workflowControls", "evidence"],
          properties: {
            tenantId: { type: "string" },
            recordGroup: { type: "string", enum: Object.keys(recordTypesByGroup) },
            recordType: { type: "string", enum: Object.values(recordTypesByGroup).flat() },
            status: { type: "string", enum: commandStatuses },
            title: { type: "string" },
            description: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
            regionCode: { type: "string" },
            jurisdictionCode: { type: "string" },
            organizationId: { type: "string" },
            commandCenterId: { type: "string" },
            commandEventId: { type: "string" },
            situationId: { type: "string" },
            alertId: { type: "string" },
            crisisEventId: { type: "string" },
            coordinationId: { type: "string" },
            recommendationId: { type: "string" },
            briefingId: { type: "string" },
            facilityId: { type: "string" },
            departmentId: { type: "string" },
            ownerId: { type: "string" },
            approverId: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            riskLevel: { type: "string", enum: ["minimal", "low", "moderate", "high", "critical"] },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            confidenceScore: { type: "number" },
            riskScore: { type: "number" },
            urgencyScore: { type: "number" },
            capacityImpactScore: { type: "number" },
            startedAt: { type: "string" },
            updatedAtSignal: { type: "string" },
            escalatedAt: { type: "string" },
            resolvedAt: { type: "string" },
            generatedAt: { type: "string" },
            policyControls: { type: "object" },
            governanceContext: { type: "object" },
            workflowControls: { type: "object" },
            evidence: { type: "array", items: { type: "object" } },
            metrics: { type: "object" },
            metadata: { type: "object" }
          }
        },
        CommandRecordResponse: {
          type: "object",
          required: ["data", "event"],
          properties: {
            data: { type: "object" },
            event: { type: "object", properties: { eventType: { type: "string", enum: requiredEvents } } }
          }
        },
        IntegrationReferenceCreate: {
          type: "object",
          required: ["tenantId", "sourceSystem", "sourceResourceType", "sourceResourceId", "commandResourceType", "commandResourceId", "countryCode", "regionCode"],
          properties: {
            tenantId: { type: "string" },
            sourceSystem: { type: "string", enum: integrationSources },
            sourceResourceType: { type: "string" },
            sourceResourceId: { type: "string" },
            commandResourceType: { type: "string" },
            commandResourceId: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
            regionCode: { type: "string" },
            metadata: { type: "object" }
          }
        },
        IntegrationReferenceResponse: {
          type: "object",
          required: ["data"],
          properties: { data: { type: "object" } }
        },
        Pagination: {
          type: "object",
          required: ["limit", "offset", "total"],
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset: { type: "integer", minimum: 0 },
            total: { type: "integer", minimum: 0 }
          }
        },
        ReadModelItem: {
          type: "object",
          required: ["id", "tenantId", "workspace", "modelKey", "status", "title", "payload", "updatedAt"],
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            workspace: { type: "string" },
            modelKey: { type: "string" },
            subjectId: { type: "string" },
            status: { type: "string" },
            title: { type: "string" },
            payload: { type: "object", additionalProperties: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        ReadModelList: {
          type: "object",
          required: ["source", "demoData", "tenantId", "workspace", "modelKey", "pagination", "items"],
          properties: {
            source: { type: "string", enum: ["live-read-model"] },
            demoData: { type: "boolean", enum: [false] },
            tenantId: { type: "string" },
            workspace: { type: "string" },
            modelKey: { type: "string" },
            subjectId: { type: "string" },
            pagination: schemaRef("Pagination"),
            items: { type: "array", items: schemaRef("ReadModelItem") }
          }
        },
        ReadModelListResponse: {
          type: "object",
          required: ["data"],
          properties: {
            data: schemaRef("ReadModelList")
          }
        },
        WriteWorkflowControls: {
          type: "object",
          additionalProperties: false,
          required: [
            "liveMode",
            "demoData",
            "auditRequired",
            "tenantIsolationConfirmed",
            "humanUserConfirmed",
            "noAutonomousDiagnosis",
            "noAutonomousTreatment",
            "noAiGeneratedClinicalDecision"
          ],
          properties: {
            liveMode: { type: "boolean", enum: [true] },
            demoData: { type: "boolean", enum: [false] },
            auditRequired: { type: "boolean", enum: [true] },
            tenantIsolationConfirmed: { type: "boolean", enum: [true] },
            humanUserConfirmed: { type: "boolean", enum: [true] },
            noAutonomousDiagnosis: { type: "boolean", enum: [true] },
            noAutonomousTreatment: { type: "boolean", enum: [true] },
            noAiGeneratedClinicalDecision: { type: "boolean", enum: [true] },
            patientClinicalRecordModificationBlocked: { type: "boolean" },
            documentedMedicationSafetyRulesApplied: { type: "boolean" },
            sourceBoundary: { type: "string" }
          }
        },
        WriteWorkflowCreate: {
          type: "object",
          additionalProperties: false,
          required: ["tenantId", "payload", "workflowControls"],
          properties: {
            tenantId: { type: "string" },
            subjectId: { type: "string" },
            title: { type: "string" },
            reason: { type: "string" },
            idempotencyKey: { type: "string" },
            payload: { type: "object", additionalProperties: true },
            workflowControls: schemaRef("WriteWorkflowControls"),
            requestContext: { type: "object", additionalProperties: true }
          }
        },
        WriteWorkflowRecord: {
          type: "object",
          required: ["id", "tenantId", "workflowGroup", "workflowKey", "eventType", "status", "payload", "workflowControls", "createdBy", "createdAt"],
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            workflowGroup: { type: "string" },
            workflowKey: { type: "string" },
            eventType: { type: "string", enum: requiredWriteWorkflowEvents() },
            subjectId: { type: "string" },
            status: { type: "string", enum: ["accepted"] },
            title: { type: "string" },
            reason: { type: "string" },
            idempotencyKey: { type: "string" },
            payload: { type: "object", additionalProperties: true },
            workflowControls: schemaRef("WriteWorkflowControls"),
            requestContext: { type: "object", additionalProperties: true },
            createdBy: { type: "string" },
            updatedBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        WriteWorkflowResponse: {
          type: "object",
          required: ["data", "event", "projections"],
          properties: {
            data: schemaRef("WriteWorkflowRecord"),
            event: { type: "object", properties: { eventType: { type: "string", enum: requiredWriteWorkflowEvents() } } },
            projections: { type: "array", items: schemaRef("WriteWorkflowProjectionSummary") }
          }
        },
        WriteWorkflowEventReview: {
          type: "object",
          additionalProperties: true,
          required: ["id", "tenantId", "eventType", "actorId", "occurredAt", "projections"],
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            eventType: { type: "string", enum: requiredWriteWorkflowEvents() },
            aggregateId: { type: "string" },
            aggregateType: { type: "string" },
            actorId: { type: "string" },
            occurredAt: { type: "string", format: "date-time" },
            workflowGroup: { type: "string" },
            workflowKey: { type: "string" },
            subjectId: { type: "string" },
            title: { type: "string" },
            requestContext: { type: "object", additionalProperties: true },
            projections: { type: "array", items: schemaRef("WriteWorkflowProjectionSummary") }
          }
        },
        WriteWorkflowProjectionSummary: {
          type: "object",
          required: ["id", "eventId", "eventType", "projectionTarget", "readModelId", "status"],
          properties: {
            id: { type: "string" },
            eventId: { type: "string" },
            eventType: { type: "string", enum: requiredWriteWorkflowEvents() },
            workflowId: { type: "string" },
            projectionTarget: { type: "string" },
            readModelId: { type: "string" },
            status: { type: "string", enum: projectionStatuses },
            processedAt: { type: "string", format: "date-time" },
            failureReason: { type: "string" },
            retryCount: { type: "integer", minimum: 0 },
            correlationId: { type: "string" },
            requestId: { type: "string" },
            actorId: { type: "string" }
          }
        },
        WriteWorkflowProjection: {
          allOf: [
            schemaRef("WriteWorkflowProjectionSummary"),
            {
              type: "object",
              properties: {
                tenantId: { type: "string" },
                payload: { type: "object", additionalProperties: true },
                createdBy: { type: "string" },
                updatedBy: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" }
              }
            }
          ]
        },
        WriteWorkflowEventListResponse: {
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["source", "demoData", "tenantId", "pagination", "items"],
              properties: {
                source: { type: "string", enum: ["live-write-workflow-events"] },
                demoData: { type: "boolean", enum: [false] },
                tenantId: { type: "string" },
                pagination: schemaRef("Pagination"),
                items: { type: "array", items: schemaRef("WriteWorkflowEventReview") }
              }
            }
          }
        },
        WriteWorkflowProjectionListResponse: {
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["source", "demoData", "tenantId", "pagination", "items"],
              properties: {
                source: { type: "string", enum: ["live-write-workflow-projections"] },
                demoData: { type: "boolean", enum: [false] },
                tenantId: { type: "string" },
                pagination: schemaRef("Pagination"),
                items: { type: "array", items: schemaRef("WriteWorkflowProjection") }
              }
            }
          }
        },
        WriteWorkflowProjectionResponse: {
          type: "object",
          required: ["data"],
          properties: {
            data: schemaRef("WriteWorkflowProjection")
          }
        },
        ErrorResponse: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            details: { type: "object" }
          }
        }
      }
    },
    "x-panacea": {
      apiVersion: API_VERSION,
      requiredEvents,
      advisoryOnly: true,
      governanceApprovalRequired: true,
      clinicianApprovalProtected: true,
      autonomousDiagnosis: "not_permitted",
      autonomousTreatment: "not_permitted",
      autonomousEmergencyEnforcement: "not_permitted",
      controls: [
        "identity",
        "rbac",
        "abac",
        "audit",
        "tenant_isolation",
        "emergency_access_governance",
        "command_center_permissions",
        "regional_governance_policies",
        "country_level_policy_controls",
        "live_read_models",
        "live_write_workflows",
        "live_event_projection",
        "transaction_review"
      ],
      liveReadModels: readModelDefinitions.map((definition) => ({
        workspace: definition.workspace,
        modelKey: definition.modelKey,
        path: `${API_BASE_PATH}${definition.path}`,
        roles: definition.allowedRoles,
        permission: readModelPermission
      })),
      liveWriteWorkflows: writeWorkflowDefinitions.map((definition) => ({
        workspace: definition.workspace,
        workflowKey: definition.workflowKey,
        eventType: definition.eventType,
        path: `${API_BASE_PATH}${definition.path}`,
        roles: definition.allowedRoles,
        permission: writeWorkflowPermission
      })),
      liveEventProjection: {
        eventsPath: `${API_BASE_PATH}/write-workflows/events`,
        projectionsPath: `${API_BASE_PATH}/write-workflows/projections`,
        retryPath: `${API_BASE_PATH}/write-workflows/projections/{projectionId}/retry`,
        reviewPermission: projectionReadPermission,
        retryPermission: projectionRetryPermission,
        statuses: projectionStatuses
      }
    }
  };
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun && process.argv.includes("--write")) {
  const outputIndex = process.argv.indexOf("--write") + 1;
  const outputPath = process.argv[outputIndex];
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`);
}
