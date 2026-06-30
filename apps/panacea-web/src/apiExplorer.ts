import type { ApiEndpoint, OpenApiDocument } from "./types";

export interface EndpointRecord extends ApiEndpoint {
  documentId: string;
  documentTitle: string;
  documentVersion: string;
  documentPath: string;
}

export interface ApiFilter {
  query?: string;
  method?: string;
  documentId?: string;
}

export function flattenEndpoints(documents: OpenApiDocument[]): EndpointRecord[] {
  return documents.flatMap((document) =>
    document.endpoints.map((endpoint) => ({
      ...endpoint,
      documentId: document.id,
      documentTitle: document.title,
      documentVersion: document.version,
      documentPath: document.relativePath
    }))
  );
}

export function filterEndpoints(endpoints: EndpointRecord[], filter: ApiFilter): EndpointRecord[] {
  const query = filter.query?.trim().toLowerCase() ?? "";
  const method = filter.method && filter.method !== "ALL" ? filter.method : "";
  return endpoints.filter((endpoint) => {
    const matchesMethod = method ? endpoint.method === method : true;
    const matchesDocument = filter.documentId && filter.documentId !== "ALL" ? endpoint.documentId === filter.documentId : true;
    const haystack = [
      endpoint.documentTitle,
      endpoint.method,
      endpoint.path,
      endpoint.summary,
      endpoint.operationId,
      endpoint.tags.join(" ")
    ].join(" ").toLowerCase();
    return matchesMethod && matchesDocument && (!query || haystack.includes(query));
  });
}

export function endpointBaseUrl(endpoint: EndpointRecord): string {
  if (endpoint.documentId.includes("autonomous-healthcare-intelligence-foundation")) return "http://localhost:18094";
  if (endpoint.documentId.includes("real-time-global-healthcare-command-intelligence-platform")) return "http://localhost:18095";
  if (endpoint.documentId.includes("global-workforce")) return "http://localhost:18141";
  if (endpoint.documentId.includes("global-legal")) return "http://localhost:18142";
  if (endpoint.documentId.includes("global-customer-success")) return "http://localhost:18143";
  if (endpoint.documentId.includes("global-product-management")) return "http://localhost:18144";
  if (endpoint.documentId.includes("global-compliance")) return "http://localhost:18145";
  if (endpoint.documentId.includes("global-ai-assurance")) return "http://localhost:18146";
  if (endpoint.documentId.includes("global-privacy")) return "http://localhost:18147";
  return "http://localhost";
}

export function buildCurl(endpoint: EndpointRecord): string {
  const url = `${endpointBaseUrl(endpoint)}${endpoint.path}`;
  const headers = [
    "-H 'Content-Type: application/json'",
    "-H 'Authorization: Bearer <TOKEN>'",
    "-H 'X-Tenant-Id: demo-tenant'",
    "-H 'X-User-Id: operator-demo'"
  ];
  if (endpoint.method === "GET" || endpoint.method === "DELETE") {
    return `curl -X ${endpoint.method} ${headers.join(" ")} '${url}'`;
  }
  const body = endpoint.requestSchema
    ? "{\\n  \"tenantId\": \"demo-tenant\",\\n  \"testOnly\": true\\n}"
    : "{}";
  return `curl -X ${endpoint.method} ${headers.join(" ")} '${url}' --data '${body}'`;
}

export function summarizeOpenApi(documents: OpenApiDocument[]) {
  const endpointCount = flattenEndpoints(documents).length;
  const versioned = documents.filter((document) => document.versionedEndpoints).length;
  const invalid = documents.filter((document) => document.validationStatus !== "PASS").length;
  return {
    documents: documents.length,
    endpointCount,
    versioned,
    invalid,
    completenessScore: documents.length === 0 ? 0 : Math.round(((documents.length - invalid) / documents.length) * 100)
  };
}
