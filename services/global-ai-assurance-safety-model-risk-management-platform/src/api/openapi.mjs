import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_BASE_PATH,
  API_VERSION,
  aiAssuranceStatuses,
  integrationSources,
  recordTypesByGroup,
  requiredEvents
} from "../domain/ai-assurance-domain.mjs";
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
            schema: schemaRef("AiAssuranceRecordCreate")
          }
        }
      },
      responses: {
        "201": {
          description: "AI assurance record persisted and event queued",
          content: { "application/json": { schema: schemaRef("AiAssuranceRecordResponse") } }
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
        operationId: "getGlobalAiAssuranceLive",
        summary: "Liveness probe",
        responses: { "200": { description: "Service is live" } }
      }
    },
    [`${API_BASE_PATH}/ready`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalAiAssuranceReady",
        summary: "Readiness probe",
        responses: { "200": { description: "Service is ready" } }
      }
    },
    [`${API_BASE_PATH}/metrics`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalAiAssuranceMetrics",
        summary: "Operational metrics summary",
        responses: { "200": { description: "Metrics returned" } }
      }
    },
    [`${API_BASE_PATH}/docs/openapi.json`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalAiAssuranceOpenApi",
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
      operationId: "createGlobalAiAssuranceIntegrationReference",
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
      title: "Panacea OS Global Enterprise AI Assurance, Safety & Model Risk Management API",
      version: "3.0.0",
      description: "Versioned API for governed, auditable, multi-country AI assurance, model risk, safety testing, prompt and agent assurance, monitoring, incident management, and regulatory AI governance workflows."
    },
    servers: [{ url: API_BASE_PATH, description: "Versioned API base path" }],
    tags: [
      { name: "Operations" },
      { name: "Integrations" },
      { name: "ai_assurance" },
      { name: "model_risk_management" },
      { name: "ai_safety_testing" },
      { name: "prompt_agent_assurance" },
      { name: "ai_monitoring" },
      { name: "ai_incident_management" },
      { name: "regulatory_ai_governance" }
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
        AiAssuranceRecordCreate: {
          type: "object",
          additionalProperties: true,
          required: ["tenantId", "status", "title", "countryCode", "jurisdictionCode", "policyControls", "governanceContext", "workflowControls", "evidence"],
          properties: {
            tenantId: { type: "string" },
            recordGroup: { type: "string", enum: Object.keys(recordTypesByGroup) },
            recordType: { type: "string", enum: Object.values(recordTypesByGroup).flat() },
            status: { type: "string", enum: aiAssuranceStatuses },
            title: { type: "string" },
            description: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
            regionCode: { type: "string" },
            jurisdictionCode: { type: "string" },
            organizationId: { type: "string" },
            aiSystemId: { type: "string" },
            aiUseCaseId: { type: "string" },
            assuranceId: { type: "string" },
            riskClassificationId: { type: "string" },
            safetyAssessmentId: { type: "string" },
            impactAssessmentId: { type: "string" },
            modelId: { type: "string" },
            modelVersionId: { type: "string" },
            modelRiskId: { type: "string" },
            validationId: { type: "string" },
            limitationId: { type: "string" },
            testId: { type: "string" },
            testCaseId: { type: "string" },
            testReportId: { type: "string" },
            promptId: { type: "string" },
            promptVersionId: { type: "string" },
            agentId: { type: "string" },
            agentVersionId: { type: "string" },
            permissionReviewId: { type: "string" },
            behaviorEvaluationId: { type: "string" },
            runtimeApprovalId: { type: "string" },
            monitoringId: { type: "string" },
            recommendationMonitorId: { type: "string" },
            driftMonitorId: { type: "string" },
            biasMonitorId: { type: "string" },
            hallucinationMonitorId: { type: "string" },
            unsafeOutputMonitorId: { type: "string" },
            performanceMonitorId: { type: "string" },
            incidentId: { type: "string" },
            investigationId: { type: "string" },
            correctiveActionId: { type: "string" },
            regulatoryRequirementId: { type: "string" },
            complianceMappingId: { type: "string" },
            evidenceRepositoryId: { type: "string" },
            auditPackageId: { type: "string" },
            governanceDecisionId: { type: "string" },
            attestationId: { type: "string" },
            ownerId: { type: "string" },
            approvalId: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            riskLevel: { type: "string", enum: ["minimal", "low", "moderate", "high", "critical"] },
            riskScore: { type: "number" },
            safetyScore: { type: "number" },
            validationScore: { type: "number" },
            biasScore: { type: "number" },
            driftScore: { type: "number" },
            performanceScore: { type: "number" },
            readinessScore: { type: "number" },
            impactScore: { type: "number" },
            startedAt: { type: "string" },
            completedAt: { type: "string" },
            approvedAt: { type: "string" },
            rejectedAt: { type: "string" },
            retiredAt: { type: "string" },
            detectedAt: { type: "string" },
            closedAt: { type: "string" },
            generatedAt: { type: "string" },
            policyControls: { type: "object" },
            governanceContext: { type: "object" },
            workflowControls: { type: "object" },
            evidence: { type: "array", items: { type: "object" } },
            metrics: { type: "object" },
            metadata: { type: "object" }
          }
        },
        AiAssuranceRecordResponse: {
          type: "object",
          required: ["data", "event"],
          properties: {
            data: { type: "object" },
            event: { type: "object", properties: { eventType: { type: "string", enum: requiredEvents } } }
          }
        },
        IntegrationReferenceCreate: {
          type: "object",
          required: ["tenantId", "sourceSystem", "sourceResourceType", "sourceResourceId", "aiAssuranceResourceType", "aiAssuranceResourceId", "countryCode"],
          properties: {
            tenantId: { type: "string" },
            sourceSystem: { type: "string", enum: integrationSources },
            sourceResourceType: { type: "string" },
            sourceResourceId: { type: "string" },
            aiAssuranceResourceType: { type: "string" },
            aiAssuranceResourceId: { type: "string" },
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
      events: requiredEvents,
      controls: [
        "identity",
        "rbac",
        "abac",
        "audit",
        "tenant_isolation",
        "ai_governance_permissions",
        "model_approval_permissions",
        "prompt_approval_permissions",
        "agent_approval_permissions",
        "regulatory_access_controls",
        "production_promotion_approval_required"
      ],
      clinicalAutomation: "not_permitted"
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputArgIndex = process.argv.indexOf("--write");
  const document = buildOpenApiDocument();
  if (outputArgIndex >= 0) {
    const requestedPath = process.argv[outputArgIndex + 1];
    if (!requestedPath) {
      throw new Error("--write requires a path");
    }
    const outputPath = path.resolve(process.cwd(), requestedPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
  }
}
