import http from "node:http";
import { API_BASE_PATH, SERVICE_NAME } from "../domain/intelligence-domain.mjs";
import {
  IntelligenceAuthorizationError,
  IntelligenceValidationError
} from "../domain/intelligence-validation.mjs";
import { createHeaderIntelligenceAuthenticator } from "../infrastructure/security.mjs";
import { buildOpenApiDocument } from "./openapi.mjs";
import { routeByFullPath } from "./routes.mjs";

const groupMethodName = {
  autonomous_intelligence_foundation: "recordFoundation",
  clinical_intelligence_governance: "recordClinicalGovernance",
  enterprise_intelligence_orchestration: "recordOrchestration",
  safety_control: "recordSafetyControl",
  explainability_traceability: "recordTraceability"
};

function jsonResponse(response, statusCode, body) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(payload);
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    return {};
  }
  return JSON.parse(raw);
}

function toErrorResponse(error) {
  if (error instanceof IntelligenceAuthorizationError) {
    return {
      statusCode: error.message.includes("not authenticated") ? 401 : 403,
      body: {
        error: "authorization_error",
        message: error.message,
        details: error.details ?? {}
      }
    };
  }
  if (error instanceof IntelligenceValidationError || error instanceof SyntaxError) {
    return {
      statusCode: 400,
      body: {
        error: "validation_error",
        message: error.message,
        details: error.details ?? {}
      }
    };
  }
  return {
    statusCode: 500,
    body: {
      error: "internal_error",
      message: "The autonomous healthcare intelligence foundation could not process the request."
    }
  };
}

export function createAutonomousHealthcareIntelligenceRequestHandler({
  service,
  authenticator = createHeaderIntelligenceAuthenticator(),
  openApiDocument = buildOpenApiDocument()
}) {
  return async function handleAutonomousHealthcareIntelligenceRequest(request, response) {
    try {
      const url = new URL(request.url, "http://localhost");
      if (request.method === "GET" && url.pathname === `${API_BASE_PATH}/live`) {
        return jsonResponse(response, 200, { status: "live", service: SERVICE_NAME });
      }
      if (request.method === "GET" && url.pathname === `${API_BASE_PATH}/ready`) {
        return jsonResponse(response, 200, { status: "ready", dependencies: "configured" });
      }
      if (request.method === "GET" && url.pathname === `${API_BASE_PATH}/metrics`) {
        return jsonResponse(response, 200, {
          service: SERVICE_NAME,
          auditability: "persistent",
          tenantIsolation: "required",
          advisoryOnly: true,
          clinicianApproval: "enforced",
          autonomousDiagnosis: "not_permitted",
          autonomousTreatment: "not_permitted"
        });
      }
      if (request.method === "GET" && url.pathname === `${API_BASE_PATH}/docs/openapi.json`) {
        return jsonResponse(response, 200, openApiDocument);
      }

      if (!url.pathname.startsWith(API_BASE_PATH)) {
        return jsonResponse(response, 404, { error: "not_found", message: "Route is outside the autonomous healthcare intelligence API." });
      }
      const relativePath = url.pathname.slice(API_BASE_PATH.length);
      if (request.method === "POST" && relativePath === "/integrations/references") {
        const principal = authenticator.authenticate(request);
        const body = await readJson(request);
        const reference = await service.createIntegrationReference(body, principal);
        return jsonResponse(response, 201, { data: reference });
      }

      const route = routeByFullPath.get(relativePath);
      if (!route || request.method !== route.method) {
        return jsonResponse(response, 404, { error: "not_found", message: "Autonomous healthcare intelligence route not found." });
      }
      const principal = authenticator.authenticate(request);
      const body = await readJson(request);
      const methodName = groupMethodName[route.group];
      const result = await service[methodName](
        {
          ...body,
          recordGroup: route.group,
          recordType: route.type
        },
        principal
      );
      return jsonResponse(response, 201, { data: result.record, event: result.event });
    } catch (error) {
      const { statusCode, body } = toErrorResponse(error);
      return jsonResponse(response, statusCode, body);
    }
  };
}

export function createAutonomousHealthcareIntelligenceServer(options) {
  return http.createServer(createAutonomousHealthcareIntelligenceRequestHandler(options));
}
