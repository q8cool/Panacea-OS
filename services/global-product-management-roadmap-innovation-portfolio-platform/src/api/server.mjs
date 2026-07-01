import http from "node:http";
import { API_BASE_PATH, SERVICE_NAME } from "../domain/product-management-domain.mjs";
import {
  ProductManagementAuthorizationError,
  ProductManagementValidationError
} from "../domain/product-management-validation.mjs";
import { createHeaderProductManagementAuthenticator } from "../infrastructure/security.mjs";
import { buildOpenApiDocument } from "./openapi.mjs";
import { routeByFullPath } from "./routes.mjs";

const groupMethodName = {
  product_management: "recordProductManagement",
  roadmap_management: "recordRoadmapManagement",
  innovation_portfolio: "recordInnovationPortfolio",
  requirements_management: "recordRequirementsManagement",
  product_feedback: "recordProductFeedback",
  release_governance: "recordReleaseGovernance"
};

const CORS_ALLOWED_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-Tenant-Id",
  "X-User-Id",
  "X-Actor-Id",
  "X-Request-Id",
  "X-Correlation-Id",
  "X-Permissions",
  "X-Roles",
  "X-Country-Codes"
];

function allowedCorsOrigins() {
  return (process.env.PANACEA_CORS_ALLOWED_ORIGINS ?? process.env.PANACEA_CORS_ORIGIN ?? "http://localhost:5174")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function applyCors(response, request) {
  const origin = request.headers.origin;
  if (typeof origin === "string" && allowedCorsOrigins().includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS.join(", "));
    response.setHeader("Access-Control-Max-Age", "600");
  }
}

function handleCorsPreflight(request, response) {
  applyCors(response, request);
  if (request.method === "OPTIONS") {
    response.writeHead(204, { "cache-control": "no-store" });
    response.end();
    return true;
  }
  return false;
}

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
  if (error instanceof ProductManagementAuthorizationError) {
    return {
      statusCode: error.message.includes("not authenticated") ? 401 : 403,
      body: {
        error: "authorization_error",
        message: error.message,
        details: error.details ?? {}
      }
    };
  }
  if (error instanceof ProductManagementValidationError || error instanceof SyntaxError) {
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
      message: "The global product management platform could not process the request."
    }
  };
}

export function createGlobalProductManagementRequestHandler({
  service,
  authenticator = createHeaderProductManagementAuthenticator(),
  openApiDocument = buildOpenApiDocument()
}) {
  return async function handleGlobalProductManagementRequest(request, response) {
    try {
      if (handleCorsPreflight(request, response)) return;
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
          productGovernance: "required",
          clinicalDecisioning: "not_permitted"
        });
      }
      if (request.method === "GET" && url.pathname === `${API_BASE_PATH}/docs/openapi.json`) {
        return jsonResponse(response, 200, openApiDocument);
      }

      if (!url.pathname.startsWith(API_BASE_PATH)) {
        return jsonResponse(response, 404, { error: "not_found", message: "Route is outside the global product management API." });
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
        return jsonResponse(response, 404, { error: "not_found", message: "Global product management route not found." });
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

export function createGlobalProductManagementServer(options) {
  return http.createServer(createGlobalProductManagementRequestHandler(options));
}
