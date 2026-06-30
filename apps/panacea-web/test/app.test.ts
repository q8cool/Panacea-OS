import { describe, expect, it, vi } from "vitest";
import dataJson from "../public/panacea-data.json";
import { flattenEndpoints, filterEndpoints } from "../src/apiExplorer";
import { probeFoundation } from "../src/foundation";
import { initialState, renderRoute } from "../src/render";
import type { AppData } from "../src/types";

const data = dataJson as AppData;

describe("Panacea web platform", () => {
  it("renders the executive overview with real release evidence", () => {
    const html = renderRoute(data, "/command/executive-overview", initialState);
    expect(html).toContain("Executive Overview");
    expect(html).toContain("OFFICIALLY RELEASED");
    expect(html).toContain(String(data.services.length));
    expect(html).toContain("Explore APIs");
  });

  it("renders active service health and OpenAPI links", () => {
    const html = renderRoute(data, "/command/system-health", initialState);
    expect(html).toContain("Runtime Service Matrix");
    expect(html).toContain("http://localhost:18095");
    expect(html).toContain("docs/openapi.json");
  });

  it("keeps documented clinical modules visible without implying active runtime services", () => {
    const html = renderRoute(data, "/clinical/modules", initialState);
    expect(html).toContain("Clinical Modules");
    expect(html).toContain("Patient Registry");
    expect(html).toContain("Documentation-backed");
  });

  it("flattens and filters OpenAPI endpoints", () => {
    const endpoints = flattenEndpoints(data.openApiDocuments);
    expect(endpoints.length).toBeGreaterThan(300);
    const liveEndpoints = filterEndpoints(endpoints, { query: "live", method: "GET", documentId: "ALL" });
    expect(liveEndpoints.length).toBeGreaterThan(0);
    expect(liveEndpoints.every((endpoint) => endpoint.method === "GET")).toBe(true);
  });

  it("renders the API explorer with curl guidance", () => {
    const html = renderRoute(data, "/developer/api-explorer", {
      ...initialState,
      apiQuery: "live",
      apiMethod: "GET"
    });
    expect(html).toContain("API Explorer");
    expect(html).toContain("curl -X GET");
    expect(html).toContain("X-Tenant-Id");
  });

  it("renders user guide documents inside the documentation center", () => {
    const html = renderRoute(data, "/developer/documentation", {
      ...initialState,
      selectedDocumentId: "docs/user-guides/How_To_Run_Panacea_OS.md"
    });
    expect(html).toContain("Documentation Center");
    expect(html).toContain("How To Run Panacea OS");
  });

  it("probes Foundation endpoints and validates JWKS shape", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      const body = url.includes("jwks") ? JSON.stringify({ keys: [{ kid: "test-key", kty: "RSA" }] }) : JSON.stringify({ status: "ok" });
      return new Response(body, { status: 200 });
    }) as unknown as typeof fetch;

    const result = await probeFoundation(data, fetchImpl);
    expect(result.overall).toBe("pass");
    expect(result.checks).toHaveLength(4);
    expect(result.checks.find((check) => check.name === "jwks")?.detail).toContain("Valid JWKS");
  });
});
