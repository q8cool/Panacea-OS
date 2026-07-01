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
      description: "Read-only live workspace model. The endpoint returns tenant-scoped backend records only; it does not return browser demo records and does not perform writes or clinical actions.",
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
      { name: "live_read_models" }
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
        "live_read_models"
      ],
      liveReadModels: readModelDefinitions.map((definition) => ({
        workspace: definition.workspace,
        modelKey: definition.modelKey,
        path: `${API_BASE_PATH}${definition.path}`,
        roles: definition.allowedRoles,
        permission: readModelPermission
      }))
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
