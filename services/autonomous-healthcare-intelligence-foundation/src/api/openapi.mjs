import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_BASE_PATH,
  API_VERSION,
  intelligenceStatuses,
  integrationSources,
  recordTypesByGroup,
  requiredEvents
} from "../domain/intelligence-domain.mjs";
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
            schema: schemaRef("IntelligenceRecordCreate")
          }
        }
      },
      responses: {
        "201": {
          description: "Intelligence governance record persisted and event queued",
          content: { "application/json": { schema: schemaRef("IntelligenceRecordResponse") } }
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
        operationId: "getAutonomousHealthcareIntelligenceLive",
        summary: "Liveness probe",
        responses: { "200": { description: "Service is live" } }
      }
    },
    [`${API_BASE_PATH}/ready`]: {
      get: {
        tags: ["Operations"],
        operationId: "getAutonomousHealthcareIntelligenceReady",
        summary: "Readiness probe",
        responses: { "200": { description: "Service is ready" } }
      }
    },
    [`${API_BASE_PATH}/metrics`]: {
      get: {
        tags: ["Operations"],
        operationId: "getAutonomousHealthcareIntelligenceMetrics",
        summary: "Operational metrics summary",
        responses: { "200": { description: "Metrics returned" } }
      }
    },
    [`${API_BASE_PATH}/docs/openapi.json`]: {
      get: {
        tags: ["Operations"],
        operationId: "getAutonomousHealthcareIntelligenceOpenApi",
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
      operationId: "createAutonomousHealthcareIntelligenceIntegrationReference",
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
      title: "Panacea OS Autonomous Healthcare Intelligence Foundation API",
      version: "4.0.0",
      description: "Versioned API for governed, advisory, explainable, auditable autonomous healthcare intelligence foundation workflows. The platform does not diagnose, prescribe, bypass clinician approval, or execute clinical actions autonomously."
    },
    servers: [{ url: API_BASE_PATH, description: "Versioned API base path" }],
    tags: [
      { name: "Operations" },
      { name: "Integrations" },
      { name: "autonomous_intelligence_foundation" },
      { name: "clinical_intelligence_governance" },
      { name: "enterprise_intelligence_orchestration" },
      { name: "safety_control" },
      { name: "explainability_traceability" }
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
        IntelligenceRecordCreate: {
          type: "object",
          additionalProperties: true,
          required: ["tenantId", "status", "title", "countryCode", "jurisdictionCode", "policyControls", "governanceContext", "workflowControls", "evidence"],
          properties: {
            tenantId: { type: "string" },
            recordGroup: { type: "string", enum: Object.keys(recordTypesByGroup) },
            recordType: { type: "string", enum: Object.values(recordTypesByGroup).flat() },
            status: { type: "string", enum: intelligenceStatuses },
            title: { type: "string" },
            description: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
            regionCode: { type: "string" },
            jurisdictionCode: { type: "string" },
            organizationId: { type: "string" },
            intelligenceId: { type: "string" },
            capabilityId: { type: "string" },
            policyId: { type: "string" },
            runtimeGovernanceId: { type: "string" },
            safetyLayerId: { type: "string" },
            approvalWorkflowId: { type: "string" },
            recommendationId: { type: "string" },
            reviewRuleId: { type: "string" },
            escalationRuleId: { type: "string" },
            overrideId: { type: "string" },
            orchestratorId: { type: "string" },
            contextBrokerId: { type: "string" },
            eventRouterId: { type: "string" },
            decisionRegistryId: { type: "string" },
            workflowControllerId: { type: "string" },
            traceId: { type: "string" },
            evidenceTraceId: { type: "string" },
            approvalTraceId: { type: "string" },
            auditPackageId: { type: "string" },
            emergencyStopId: { type: "string" },
            ownerId: { type: "string" },
            approverId: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            riskLevel: { type: "string", enum: ["minimal", "low", "moderate", "high", "critical"] },
            riskScore: { type: "number" },
            safetyScore: { type: "number" },
            governanceScore: { type: "number" },
            traceabilityScore: { type: "number" },
            startedAt: { type: "string" },
            completedAt: { type: "string" },
            approvedAt: { type: "string" },
            blockedAt: { type: "string" },
            stoppedAt: { type: "string" },
            policyControls: { type: "object" },
            governanceContext: { type: "object" },
            workflowControls: { type: "object" },
            evidence: { type: "array", items: { type: "object" } },
            metrics: { type: "object" },
            metadata: { type: "object" }
          }
        },
        IntelligenceRecordResponse: {
          type: "object",
          required: ["data", "event"],
          properties: {
            data: { type: "object" },
            event: { type: "object", properties: { eventType: { type: "string", enum: requiredEvents } } }
          }
        },
        IntegrationReferenceCreate: {
          type: "object",
          required: ["tenantId", "sourceSystem", "sourceResourceType", "sourceResourceId", "intelligenceResourceType", "intelligenceResourceId", "countryCode"],
          properties: {
            tenantId: { type: "string" },
            sourceSystem: { type: "string", enum: integrationSources },
            sourceResourceType: { type: "string" },
            sourceResourceId: { type: "string" },
            intelligenceResourceType: { type: "string" },
            intelligenceResourceId: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
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
      clinicianApprovalRequired: true,
      autonomousDiagnosis: "not_permitted",
      autonomousTreatment: "not_permitted",
      productionClinicalBypass: "not_permitted",
      controls: [
        "identity",
        "rbac",
        "abac",
        "audit",
        "tenant_isolation",
        "ai_governance_permissions",
        "clinical_approval_permissions",
        "emergency_stop_permissions"
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
