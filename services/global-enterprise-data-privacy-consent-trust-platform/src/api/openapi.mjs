import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_BASE_PATH,
  API_VERSION,
  integrationSources,
  privacyStatuses,
  recordTypesByGroup,
  requiredEvents
} from "../domain/privacy-domain.mjs";
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
            schema: schemaRef("PrivacyRecordCreate")
          }
        }
      },
      responses: {
        "201": {
          description: "Privacy, consent, data-rights, sharing, trust, or monitoring record persisted and event queued",
          content: { "application/json": { schema: schemaRef("PrivacyRecordResponse") } }
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
        operationId: "getGlobalPrivacyLive",
        summary: "Liveness probe",
        responses: { "200": { description: "Service is live" } }
      }
    },
    [`${API_BASE_PATH}/ready`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalPrivacyReady",
        summary: "Readiness probe",
        responses: { "200": { description: "Service is ready" } }
      }
    },
    [`${API_BASE_PATH}/metrics`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalPrivacyMetrics",
        summary: "Operational metrics summary",
        responses: { "200": { description: "Metrics returned" } }
      }
    },
    [`${API_BASE_PATH}/docs/openapi.json`]: {
      get: {
        tags: ["Operations"],
        operationId: "getGlobalPrivacyOpenApi",
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
      operationId: "createGlobalPrivacyIntegrationReference",
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
      title: "Panacea OS Global Enterprise Data Privacy, Consent & Trust API",
      version: "3.0.0",
      description: "Versioned API for governed, auditable, multi-country privacy, consent lifecycle, patient data-rights, privacy policy, data sharing, trust, and privacy monitoring workflows."
    },
    servers: [{ url: API_BASE_PATH, description: "Versioned API base path" }],
    tags: [
      { name: "Operations" },
      { name: "Integrations" },
      { name: "global_consent" },
      { name: "patient_data_rights" },
      { name: "privacy_policy_engine" },
      { name: "data_sharing_governance" },
      { name: "trust_platform" },
      { name: "privacy_monitoring" }
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
        PrivacyRecordCreate: {
          type: "object",
          additionalProperties: true,
          required: ["tenantId", "status", "title", "countryCode", "jurisdictionCode", "policyControls", "governanceContext", "workflowControls", "evidence"],
          properties: {
            tenantId: { type: "string" },
            recordGroup: { type: "string", enum: Object.keys(recordTypesByGroup) },
            recordType: { type: "string", enum: Object.values(recordTypesByGroup).flat() },
            status: { type: "string", enum: privacyStatuses },
            title: { type: "string" },
            description: { type: "string" },
            countryCode: { type: "string", minLength: 2, maxLength: 2 },
            regionCode: { type: "string" },
            jurisdictionCode: { type: "string" },
            organizationId: { type: "string" },
            dataSubjectId: { type: "string" },
            patientId: { type: "string" },
            consentId: { type: "string" },
            consentVersionId: { type: "string" },
            consentScopeId: { type: "string" },
            dataRightsRequestId: { type: "string" },
            privacyPolicyId: { type: "string" },
            purposeId: { type: "string" },
            minimizationRuleId: { type: "string" },
            retentionPolicyId: { type: "string" },
            privacyExceptionId: { type: "string" },
            sharingAgreementId: { type: "string" },
            sharingPurposeId: { type: "string" },
            sharingApprovalId: { type: "string" },
            sourceOrganizationId: { type: "string" },
            recipientOrganizationId: { type: "string" },
            trustRelationshipId: { type: "string" },
            trustProfileId: { type: "string" },
            dataProcessorId: { type: "string" },
            dataControllerId: { type: "string" },
            trustedPartnerId: { type: "string" },
            verificationId: { type: "string" },
            monitoringId: { type: "string" },
            violationId: { type: "string" },
            privacyIncidentId: { type: "string" },
            riskAssessmentId: { type: "string" },
            ownerId: { type: "string" },
            reviewerId: { type: "string" },
            approvalId: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            riskLevel: { type: "string", enum: ["minimal", "low", "moderate", "high", "critical"] },
            riskScore: { type: "number" },
            complianceScore: { type: "number" },
            consentCoverageScore: { type: "number" },
            trustScore: { type: "number" },
            fulfillmentScore: { type: "number" },
            startedAt: { type: "string" },
            completedAt: { type: "string" },
            approvedAt: { type: "string" },
            requestedAt: { type: "string" },
            fulfilledAt: { type: "string" },
            withdrawnAt: { type: "string" },
            expiresAt: { type: "string" },
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
        PrivacyRecordResponse: {
          type: "object",
          required: ["data", "event"],
          properties: {
            data: { type: "object" },
            event: { type: "object", properties: { eventType: { type: "string", enum: requiredEvents } } }
          }
        },
        IntegrationReferenceCreate: {
          type: "object",
          required: ["tenantId", "sourceSystem", "sourceResourceType", "sourceResourceId", "privacyResourceType", "privacyResourceId", "countryCode"],
          properties: {
            tenantId: { type: "string" },
            sourceSystem: { type: "string", enum: integrationSources },
            sourceResourceType: { type: "string" },
            sourceResourceId: { type: "string" },
            privacyResourceType: { type: "string" },
            privacyResourceId: { type: "string" },
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
        "purpose_based_access_control",
        "consent_enforcement",
        "data_residency_policies",
        "cross_border_policy_enforcement",
        "data_minimization",
        "retention_policy_enforcement"
      ],
      privacyAutomation: "policy_controlled",
      clinicalAutomation: "not_permitted"
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputArgIndex = process.argv.indexOf("--write");
  const document = buildOpenApiDocument();
  if (outputArgIndex >= 0) {
    const outputPath = process.argv[outputArgIndex + 1];
    if (!outputPath) {
      throw new Error("--write requires an output path");
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
  }
}
