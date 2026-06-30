import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_BASE_PATH,
  API_VERSION,
  integrationSources,
  productManagementStatuses,
  recordTypesByGroup,
  requiredEvents
} from "../domain/product-management-domain.mjs";
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
            schema: schemaRef("ProductManagementRecordCreate")
          }
        }
      },
      responses: {
        "201": {
          description: "Product management record persisted and event queued",
          content: { "application/json": { schema: schemaRef("ProductManagementRecordResponse") } }
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
        operationId: "getGlobalProductManagementLive",
        summary: "Liveness probe",
        responses: { "200": { description: "Service is live" } }
      }
    },
    [`${API_BASE_PATH}/ready`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalProductManagementReady",
        summary: "Readiness probe",
        responses: { "200": { description: "Service is ready" } }
      }
    },
    [`${API_BASE_PATH}/metrics`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalProductManagementMetrics",
        summary: "Operational metrics summary",
        responses: { "200": { description: "Metrics returned" } }
      }
    },
    [`${API_BASE_PATH}/docs/openapi.json`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalProductManagementOpenApi",
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
      operationId: "createGlobalProductManagementIntegrationReference",
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
      title: "Panacea OS Global Enterprise Product Management, Roadmap & Innovation Portfolio API",
      version: "3.0.0",
      description: "Versioned API for governed, auditable, multi-country product management, roadmap governance, innovation portfolio, requirements, product feedback, and release governance workflows."
    },
    servers: [{ url: API_BASE_PATH, description: "Versioned API base path" }],
    tags: [
      { name: "Operations" },
      { name: "Integrations" },
      { name: "product_management" },
      { name: "roadmap_management" },
      { name: "innovation_portfolio" },
      { name: "requirements_management" },
      { name: "product_feedback" },
      { name: "release_governance" }
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
        ProductManagementRecordCreate: {
          type: "object",
          additionalProperties: true,
          required: ["tenantId", "status", "title", "countryCode", "jurisdictionCode", "policyControls", "governanceContext", "workflowControls", "evidence"],
          properties: {
            tenantId: { type: "string" },
            recordGroup: { type: "string", enum: Object.keys(recordTypesByGroup) },
            recordType: { type: "string", enum: Object.values(recordTypesByGroup).flat() },
            status: { type: "string", enum: productManagementStatuses },
            title: { type: "string" },
            description: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
            regionCode: { type: "string" },
            jurisdictionCode: { type: "string" },
            organizationId: { type: "string" },
            productId: { type: "string" },
            moduleId: { type: "string" },
            capabilityId: { type: "string" },
            featureId: { type: "string" },
            dependencyId: { type: "string" },
            roadmapId: { type: "string" },
            versionId: { type: "string" },
            releaseId: { type: "string" },
            milestoneId: { type: "string" },
            sprintId: { type: "string" },
            innovationIdeaId: { type: "string" },
            experimentId: { type: "string" },
            requirementId: { type: "string" },
            traceabilityId: { type: "string" },
            feedbackId: { type: "string" },
            customerId: { type: "string" },
            clinicianId: { type: "string" },
            patientId: { type: "string" },
            releaseCandidateId: { type: "string" },
            ownerId: { type: "string" },
            approvalId: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            impactScore: { type: "number" },
            effortScore: { type: "number" },
            valueScore: { type: "number" },
            riskScore: { type: "number" },
            coveragePercent: { type: "number" },
            plannedStartAt: { type: "string" },
            plannedEndAt: { type: "string" },
            approvedAt: { type: "string" },
            completedAt: { type: "string" },
            policyControls: { type: "object" },
            governanceContext: { type: "object" },
            workflowControls: { type: "object" },
            evidence: { type: "array", items: { type: "object" } },
            metrics: { type: "object" },
            metadata: { type: "object" }
          }
        },
        ProductManagementRecordResponse: {
          type: "object",
          required: ["data", "event"],
          properties: {
            data: { type: "object" },
            event: { type: "object", properties: { eventType: { type: "string", enum: requiredEvents } } }
          }
        },
        IntegrationReferenceCreate: {
          type: "object",
          required: ["tenantId", "sourceSystem", "sourceResourceType", "sourceResourceId", "productManagementResourceType", "productManagementResourceId", "countryCode"],
          properties: {
            tenantId: { type: "string" },
            sourceSystem: { type: "string", enum: integrationSources },
            sourceResourceType: { type: "string" },
            sourceResourceId: { type: "string" },
            productManagementResourceType: { type: "string" },
            productManagementResourceId: { type: "string" },
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
        "product_governance_permissions",
        "roadmap_approval_permissions",
        "innovation_review_permissions",
        "release_governance_permissions"
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
