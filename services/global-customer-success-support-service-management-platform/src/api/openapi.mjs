import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_BASE_PATH,
  API_VERSION,
  customerSuccessStatuses,
  integrationSources,
  recordTypesByGroup,
  requiredEvents
} from "../domain/customer-success-domain.mjs";
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
            schema: schemaRef("CustomerSuccessRecordCreate")
          }
        }
      },
      responses: {
        "201": {
          description: "Customer success record persisted and event queued",
          content: { "application/json": { schema: schemaRef("CustomerSuccessRecordResponse") } }
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
        operationId: "getGlobalCustomerSuccessLive",
        summary: "Liveness probe",
        responses: { "200": { description: "Service is live" } }
      }
    },
    [`${API_BASE_PATH}/ready`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalCustomerSuccessReady",
        summary: "Readiness probe",
        responses: { "200": { description: "Service is ready" } }
      }
    },
    [`${API_BASE_PATH}/metrics`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalCustomerSuccessMetrics",
        summary: "Operational metrics summary",
        responses: { "200": { description: "Metrics returned" } }
      }
    },
    [`${API_BASE_PATH}/docs/openapi.json`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalCustomerSuccessOpenApi",
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
      operationId: "createGlobalCustomerSuccessIntegrationReference",
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
      title: "Panacea OS Global Enterprise Customer Success, Support & Service Management API",
      version: "3.0.0",
      description: "Versioned API for governed, auditable, multi-country customer success, support, service management, onboarding, communication, and support analytics workflows."
    },
    servers: [{ url: API_BASE_PATH, description: "Versioned API base path" }],
    tags: [
      { name: "Operations" },
      { name: "Integrations" },
      { name: "customer_success" },
      { name: "enterprise_support" },
      { name: "service_management" },
      { name: "implementation_onboarding" },
      { name: "customer_communication" },
      { name: "support_analytics" }
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
        CustomerSuccessRecordCreate: {
          type: "object",
          additionalProperties: true,
          required: ["tenantId", "status", "title", "countryCode", "jurisdictionCode", "policyControls", "governanceContext", "workflowControls", "evidence"],
          properties: {
            tenantId: { type: "string" },
            recordGroup: { type: "string", enum: Object.keys(recordTypesByGroup) },
            recordType: { type: "string", enum: Object.values(recordTypesByGroup).flat() },
            status: { type: "string", enum: customerSuccessStatuses },
            title: { type: "string" },
            description: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
            regionCode: { type: "string" },
            jurisdictionCode: { type: "string" },
            organizationId: { type: "string" },
            accountId: { type: "string" },
            customerId: { type: "string" },
            customerHealthScoreId: { type: "string" },
            successPlanId: { type: "string" },
            milestoneId: { type: "string" },
            supportTicketId: { type: "string" },
            incidentId: { type: "string" },
            problemId: { type: "string" },
            changeId: { type: "string" },
            serviceRequestId: { type: "string" },
            knowledgeBaseArticleId: { type: "string" },
            serviceCatalogId: { type: "string" },
            implementationProjectId: { type: "string" },
            onboardingId: { type: "string" },
            communicationId: { type: "string" },
            feedbackId: { type: "string" },
            surveyId: { type: "string" },
            releaseId: { type: "string" },
            maintenanceWindowId: { type: "string" },
            slaId: { type: "string" },
            escalationId: { type: "string" },
            assignmentId: { type: "string" },
            supportAgentId: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent", "critical"] },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            healthScore: { type: "number" },
            satisfactionScore: { type: "number" },
            adoptionScore: { type: "number" },
            dueAt: { type: "string" },
            targetResolutionAt: { type: "string" },
            resolvedAt: { type: "string" },
            startAt: { type: "string" },
            completedAt: { type: "string" },
            policyControls: { type: "object" },
            governanceContext: { type: "object" },
            workflowControls: { type: "object" },
            evidence: { type: "array", items: { type: "object" } },
            metrics: { type: "object" },
            metadata: { type: "object" }
          }
        },
        CustomerSuccessRecordResponse: {
          type: "object",
          required: ["data", "event"],
          properties: {
            data: { type: "object" },
            event: { type: "object", properties: { eventType: { type: "string", enum: requiredEvents } } }
          }
        },
        IntegrationReferenceCreate: {
          type: "object",
          required: ["tenantId", "sourceSystem", "sourceResourceType", "sourceResourceId", "customerSuccessResourceType", "customerSuccessResourceId", "countryCode"],
          properties: {
            tenantId: { type: "string" },
            sourceSystem: { type: "string", enum: integrationSources },
            sourceResourceType: { type: "string" },
            sourceResourceId: { type: "string" },
            customerSuccessResourceType: { type: "string" },
            customerSuccessResourceId: { type: "string" },
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
        "customer_data_access_controls",
        "support_role_permissions",
        "sensitive_incident_controls"
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
