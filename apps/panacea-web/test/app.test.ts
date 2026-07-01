import { describe, expect, it, vi } from "vitest";
import dataJson from "../public/panacea-data.json";
import { createSessionFromClaimsForDisplay, validateTokenWithFoundation } from "../src/auth";
import { flattenEndpoints, filterEndpoints } from "../src/apiExplorer";
import { probeFoundation } from "../src/foundation";
import { apiRequest } from "../src/liveApi";
import { allRoleRoutes, roleDefaultRoute, roleSwitcherOptions, roleWorkspaces } from "../src/roleWorkspaces";
import { initialState, renderApp, renderRoute } from "../src/render";
import { buildWebConfig } from "../src/webConfig";
import type { AppData, AuthSession, LiveStatusState, LiveWorkspaceState } from "../src/types";

const data = dataJson as AppData;
const config = buildWebConfig(data);

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

  it("renders the Foundation login screen and operator token mode", () => {
    const html = renderRoute(data, "/auth/login", {
      ...initialState,
      webConfig: config
    });
    expect(html).toContain("Foundation Login");
    expect(html).toContain("Operator Token Mode");
    expect(html).toContain("Paste Foundation-issued JWT");
    expect(html).toContain("FOUNDATION_JWKS_URL");
  });

  it("extracts token-mode claims for display without treating them as signed live authentication", () => {
    const token = makeJwt({
      iss: config.FOUNDATION_JWT_ISSUER,
      sub: "doctor-1",
      name: "Dr Test",
      exp: Math.floor(Date.now() / 1000) + 900,
      tenant_id: "tenant-a",
      roles: ["doctor"],
      permissions: ["patients:read"]
    });
    const result = createSessionFromClaimsForDisplay(token, config);
    expect(result.ok).toBe(true);
    expect(result.session?.role).toBe("doctor");
    expect(result.session?.tenantId).toBe("tenant-a");
    expect(result.warnings.join(" ")).toContain("signature validation is still required");
  });

  it("shows invalid and expired token errors", async () => {
    const invalid = await validateTokenWithFoundation("not-a-jwt", config, vi.fn() as unknown as typeof fetch);
    expect(invalid.ok).toBe(false);
    expect(invalid.error).toContain("JWT must contain");

    const expired = await validateTokenWithFoundation(
      makeJwt({
        iss: config.FOUNDATION_JWT_ISSUER,
        sub: "doctor-1",
        exp: Math.floor(Date.now() / 1000) - 10,
        tenant_id: "tenant-a",
        roles: ["doctor"]
      }),
      config,
      vi.fn() as unknown as typeof fetch
    );
    expect(expired.ok).toBe(false);
    expect(expired.error).toContain("expired");
  });

  it("uses authenticated claims for live role navigation instead of the demo role switcher", () => {
    const session = sessionFor("doctor");
    const html = renderApp(data, "/workspace/doctor/dashboard", {
      ...initialState,
      authSession: session,
      selectedRole: "doctor"
    });
    expect(html).toContain("Live Mode");
    expect(html).toContain("Role From Token");
    expect(html).toContain("disabled");
    expect(html).toContain(session.tenantId);
  });

  it("API client adds Authorization, tenant, and request correlation headers", async () => {
    let headers: HeadersInit | undefined;
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      headers = init?.headers;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await apiRequest("GET", "https://api.example.test/api/v4/live", sessionFor("administrator"), config, undefined, fetchImpl);
    expect(result.state).toBe("online");
    expect(headers).toMatchObject({
      Authorization: "Bearer test-token",
      "X-Tenant-Id": "tenant-a"
    });
    expect((headers as Record<string, string>)["X-Request-Id"]).toBeTruthy();
  });

  it("API client handles 401, 403, and unavailable APIs without throwing", async () => {
    const session = sessionFor("administrator");
    const unauthorized = await apiRequest("GET", "https://api.example.test/401", session, config, undefined, vi.fn(async () => new Response("no", { status: 401 })) as unknown as typeof fetch);
    const forbidden = await apiRequest("GET", "https://api.example.test/403", session, config, undefined, vi.fn(async () => new Response("no", { status: 403 })) as unknown as typeof fetch);
    const unavailable = await apiRequest("GET", "https://api.example.test/down", session, config, undefined, vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch);

    expect(unauthorized.state).toBe("unauthorized");
    expect(forbidden.state).toBe("unauthorized");
    expect(unavailable.state).toBe("unavailable");
  });

  it("renders Foundation and service live/offline status states", () => {
    const liveStatus: LiveStatusState = {
      checkedAt: new Date().toISOString(),
      foundation: [
        { label: "Foundation Health", url: config.FOUNDATION_HEALTH_URL, state: "online", httpStatus: 200, detail: "ok", checkedAt: new Date().toISOString() },
        { label: "Foundation JWKS", url: config.FOUNDATION_JWKS_URL, state: "offline", httpStatus: 503, detail: "down", checkedAt: new Date().toISOString() }
      ],
      services: [
        { label: "Service health", url: "http://localhost:18095/live", state: "unavailable", detail: "CORS", checkedAt: new Date().toISOString() }
      ]
    };
    const html = renderRoute(data, "/command/live-status", {
      ...initialState,
      authSession: sessionFor("operator"),
      liveStatus
    });
    expect(html).toContain("Live API Status");
    expect(html).toContain("Foundation Health");
    expect(html).toContain("offline");
    expect(html).toContain("unavailable");
  });

  it("renders live workspace unavailable states without presenting demo rows as live data", () => {
    const liveWorkspaceState: LiveWorkspaceState = {
      endpoint: {
        label: "No matching read-only endpoint",
        method: "GET",
        url: "",
        source: "OpenAPI contract",
        available: false,
        reason: "Live API unavailable"
      },
      result: {
        requestId: "req-test",
        method: "GET",
        url: "No matching read-only endpoint",
        state: "unavailable",
        detail: "Live API unavailable",
        checkedAt: new Date().toISOString()
      }
    };
    const html = renderRoute(data, "/workspace/patient/dashboard", {
      ...initialState,
      authSession: sessionFor("patient"),
      liveWorkspaceState
    });
    expect(html).toContain("LIVE MODE -- AUTHENTICATED READ-ONLY SESSION");
    expect(html).toContain("Demo rows are hidden in Live Mode");
    expect(html).toContain("No live records are displayed");
    expect(html).not.toContain("Rows are UI-state examples");
  });
});

function sessionFor(role: AuthSession["role"]): AuthSession {
  return {
    token: "test-token",
    subject: `${role}-subject`,
    displayName: `${role} user`,
    issuer: config.FOUNDATION_JWT_ISSUER,
    tenantId: "tenant-a",
    role,
    roles: [role],
    permissions: ["read"],
    expiresAt: new Date(Date.now() + 900_000).toISOString(),
    authenticatedAt: new Date().toISOString(),
    tokenHeader: {
      alg: "RS256",
      kid: "test-key"
    }
  };
}

function makeJwt(claims: Record<string, unknown>): string {
  return [base64Url({ alg: "RS256", kid: "test-key" }), base64Url(claims), "c2lnbmF0dXJl"].join(".");
}

function base64Url(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}
