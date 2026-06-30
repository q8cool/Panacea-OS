import { describe, expect, it, vi } from "vitest";
import dataJson from "../public/panacea-data.json";
import { flattenEndpoints, filterEndpoints } from "../src/apiExplorer";
import { probeFoundation } from "../src/foundation";
import { allRoleRoutes, roleDefaultRoute, roleSwitcherOptions, roleWorkspaces } from "../src/roleWorkspaces";
import { initialState, renderApp, renderRoute } from "../src/render";
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

  it("renders the demo role switcher in the global shell", () => {
    const html = renderApp(data, "/workspace/doctor/dashboard", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(html).toContain("Demo Role Switcher");
    expect(html).toContain("Doctor");
    expect(html).toContain("Patient");
    expect(html).toContain("Administrator");
  });

  it("maps role switcher options to workspace routes without bypassing operator mode", () => {
    expect(roleDefaultRoute("operator")).toBe("/command/executive-overview");
    for (const option of roleSwitcherOptions.filter((item) => item.id !== "operator")) {
      expect(roleDefaultRoute(option.id)).toBe(option.route);
      expect(option.route).toMatch(/^\/workspace\//);
    }
  });

  it("renders every role workspace dashboard", () => {
    for (const workspace of roleWorkspaces) {
      const html = renderRoute(data, workspace.route, {
        ...initialState,
        selectedRole: workspace.id
      });
      expect(html).toContain(workspace.title);
      expect(html).toContain("DEMO DATA -- NOT REAL PATIENT DATA");
      expect(html).toContain("Workflow Timeline");
      expect(html).toContain("API And Documentation Sources");
    }
  });

  it("renders every requested role page route without empty screens", () => {
    for (const route of allRoleRoutes()) {
      const html = renderRoute(data, route, initialState);
      expect(html).toContain("Worklist");
      expect(html).toContain("Read-only");
      expect(html).toContain("Live data unavailable");
      expect(html).not.toContain("No module records match this page");
    }
  });

  it("renders clinician safety and advisory-only sections", () => {
    const html = renderRoute(data, "/workspace/doctor/ai-recommendations", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(html).toContain("AI Recommendations Viewer");
    expect(html).toContain("Advisory only. Clinician remains final decision maker.");
    expect(html).toContain("Medication safety area");
  });

  it("renders patient portal pages with patient-facing boundaries", () => {
    const html = renderRoute(data, "/workspace/patient/care-instructions", {
      ...initialState,
      selectedRole: "patient"
    });
    expect(html).toContain("Care Instructions");
    expect(html).toContain("Educational content only");
    expect(html).toContain("Patient-friendly");
  });

  it("renders laboratory, radiology, pharmacy, and admin specialist pages", () => {
    expect(renderRoute(data, "/workspace/laboratory/critical-results", initialState)).toContain("Critical Results");
    expect(renderRoute(data, "/workspace/radiology/dicom-metadata", initialState)).toContain("DICOM image viewer not implemented in this UI sprint.");
    expect(renderRoute(data, "/workspace/pharmacy/drug-safety-alerts", initialState)).toContain("Drug Safety Alerts");
    expect(renderRoute(data, "/workspace/administrator/audit-logs", initialState)).toContain("Audit Logs");
  });
});
