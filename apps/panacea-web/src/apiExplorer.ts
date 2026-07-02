import type { ApiEndpoint, OpenApiDocument } from "./types";

const PUBLIC_API_BASE_URL = "https://api.panacea.utbe.ai";

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

export function endpointBaseUrl(_endpoint: EndpointRecord): string {
  return PUBLIC_API_BASE_URL;
}

export function buildCurl(endpoint: EndpointRecord): string {
  const url = `${endpointBaseUrl(endpoint)}${endpoint.path}`;
  const headers = [
    "-H 'Content-Type: application/json'",
    "-H 'Authorization: Bearer <TOKEN>'",
    "-H 'X-Tenant-Id: utbe-health-system'",
    "-H 'X-User-Id: platform-operator'"
  ];
  if (endpoint.method === "GET" || endpoint.method === "DELETE") {
    return `curl -X ${endpoint.method} ${headers.join(" ")} '${url}'`;
  }
  const body = endpoint.requestSchema
    ? "{\\n  \"tenantId\": \"utbe-health-system\",\\n  \"testOnly\": true\\n}"
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
