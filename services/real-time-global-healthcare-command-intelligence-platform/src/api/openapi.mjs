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
      { name: "executive_intelligence" }
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
        "country_level_policy_controls"
      ]
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
