import { describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import dataJson from "../public/panacea-data.json";
import { buildBrowserApiAllowlist, evaluateBrowserApiRequest } from "../src/apiAllowlist";
import { createSessionFromClaimsForDisplay, validateTokenWithFoundation } from "../src/auth";
import {
  loginWithFoundationProvider,
  logoutFoundationProviderSession,
  providerAuthEndpoints,
  refreshFoundationProviderSession
} from "../src/foundationAuthClient";
import { buildCurl, endpointBaseUrl, flattenEndpoints, filterEndpoints } from "../src/apiExplorer";
import { probeFoundation } from "../src/foundation";
import { discoverFoundationLogin } from "../src/foundationLoginDiscovery";
import { apiRequest, appendOperatorAuditTest, executeWriteWorkflowRequest, findWriteWorkflowEndpoint, pollRuntimeStatus } from "../src/liveApi";
import { languageOptions, translate } from "../src/locales";
import { allRoleRoutes, roleDefaultRoute, roleSwitcherOptions, roleWorkspaces } from "../src/roleWorkspaces";
import { initialState, renderApp, renderRoute } from "../src/render";
import { buildWebConfig } from "../src/webConfig";
import type { AppData, AuthSession, LiveStatusState, LiveWorkspaceState } from "../src/types";
import { allowedReadFixture, blockedWriteFixture, operatorAuditFixture } from "./liveApiFixtures";

const data = dataJson as AppData;
const config = buildWebConfig(data);
const publicApiBaseUrl = "https://api.panacea.utbe.ai";
const providerKeyPair = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
});

describe("Panacea web platform", () => {
  it("renders the executive overview as a professional enterprise hospital interface", () => {
    const html = renderRoute(data, "/command/executive-overview", initialState);
    expect(html).toContain("Executive Overview");
    expect(html).toContain("UTBE Enterprise");
    expect(html).toContain("Enterprise Release");
    expect(html).toContain("Hospital Workspace Launchpad");
    expect(html).toContain("Clinical Operations");
    expect(html).toContain("Patient Care");
    expect(html).toContain("Protected");
    expect(html).toContain("Governed access controls protect operational records");
    expect(html).not.toContain("UTBE Controlled Pilot");
    expect(html).not.toContain("Demo Data — Not Real Patient Data");
  });

  it("loads English and Arabic locale dictionaries", () => {
    expect(languageOptions.map((option) => option.locale)).toEqual(["en", "ar"]);
    expect(translate("en", "Patient Registry")).toBe("Patient Registry");
    expect(translate("ar", "Patient Registry")).toBe("سجل المرضى");
    expect(translate("ar", "Advisory only. Clinician remains final decision maker.")).toBe("للاسترشاد فقط. يبقى القرار النهائي للطبيب المختص.");
  });

  it("renders the language switcher and applies LTR or RTL direction", () => {
    const english = renderApp(data, "/command/executive-overview", {
      ...initialState,
      language: "en"
    });
    expect(english).toContain('lang="en" dir="ltr"');
    expect(english).toContain('id="language-toggle"');
    expect(english).toContain(">English</option>");
    expect(english).toContain(">العربية</option>");

    const arabic = renderApp(data, "/command/executive-overview", {
      ...initialState,
      language: "ar"
    });
    expect(arabic).toContain('lang="ar" dir="rtl"');
    expect(arabic).toContain("النظرة التنفيذية");
    expect(arabic).toContain("مساحات العمل حسب الدور");
  });

  it("keeps active service technical health details in the operator system area", () => {
    const html = renderRoute(data, "/command/system-health", initialState);
    expect(html).toContain("Runtime Service Evidence");
    expect(html).toContain(`${publicApiBaseUrl}/api/v4/global-command-intelligence/live`);
    expect(html).toContain("docs/openapi.json");
  });

  it("generates production web data with UTBE public API routes and no localhost HTTP links", () => {
    expect(data.publicApiBaseUrl).toBe(publicApiBaseUrl);
    expect(config.PANACEA_API_PUBLIC_BASE_URL).toBe(publicApiBaseUrl);
    expect(config.PANACEA_API_BASE_URL).toBe(publicApiBaseUrl);
    expect(JSON.stringify(data)).not.toMatch(/https?:\/\/(?:localhost|127\.0\.0\.1)/);
    expect(data.services.every((service) => service.runtimeChecks.every((check) => check.url.startsWith(publicApiBaseUrl)))).toBe(true);
  });

  it("publishes professional browser documentation without prototype language", () => {
    const publicData = JSON.stringify(data);
    expect(publicData).not.toContain("Demo Mode");
    expect(data.documents.map((document) => document.body).join("\n")).not.toMatch(/\bDemo\b/i);
    expect(publicData).not.toMatch(/\bGuided Preview\b/i);
    expect(data.documents.map((document) => document.body).join("\n")).not.toMatch(/\bPreview\b/i);
    expect(data.documents.map((document) => document.body).join("\n")).not.toMatch(/\bPilot\b/i);
    expect(data.documents.map((document) => document.body).join("\n")).not.toMatch(/\bSample\b/i);
    expect(publicData).not.toContain("non-production rows");
    expect(publicData).not.toMatch(/\bnon-production\b/i);
    expect(publicData).not.toContain("future work");
    expect(publicData).not.toContain("workflow screens remain future work");
    expect(publicData).not.toMatch(/\bdocumentation[- ]only\b/i);
    expect(publicData).not.toMatch(/\bprototype\b/i);
    expect(publicData).not.toMatch(/\bexperimental\b/i);
    expect(data.documents.map((document) => document.body).join("\n")).not.toMatch(/\bSprint\s+\d+\b/i);
    expect(publicData).not.toMatch(/\blocalhost\b/i);
    expect(publicData).toContain(publicApiBaseUrl);
    expect(publicData).toContain("Clinical and legal approval required before real clinical production use.");
    expect(publicData).toContain("Protected workspace records");
  });

  it("publishes only current professional documents in the browser data bundle", () => {
    const publicDocumentPaths = data.documents.map((document) => document.relativePath);
    expect(publicDocumentPaths.length).toBeGreaterThan(20);
    expect(publicDocumentPaths).toContain("docs/user-guides/How_To_Run_Panacea_OS.md");
    expect(publicDocumentPaths).toContain("docs/user-guides/Web_Login_Guide.md");
    expect(publicDocumentPaths).toContain("docs/releases/v4.0.0/Official_Closure_Report.md");
    expect(publicDocumentPaths).toContain("docs/contracts/AI_Assurance_API.md");
    expect(publicDocumentPaths).not.toContain("docs/roadmap/Sprint_108_Live_Integration_Enablement_Report.md");
    expect(publicDocumentPaths).not.toContain("docs/roadmap/Sprint_110_Operational_Demo_Report.md");
    expect(publicDocumentPaths).not.toContain("docs/user-guides/Demo_Access_Plan.md");
    expect(publicDocumentPaths.every((relativePath) => !/\/Sprint_\d+|Demo|Guided[_ -]?Preview|Pilot/i.test(relativePath))).toBe(true);
  });

  it("derives active service status checks from docs/contracts OpenAPI paths", () => {
    const docsByPath = new Map(data.openApiDocuments.map((document) => [document.relativePath, document]));

    for (const service of data.services) {
      const contractPath = `docs/contracts/openapi/${service.id}.openapi.json`;
      const contract = docsByPath.get(contractPath);
      expect(contract, `${service.id} contract`).toBeTruthy();
      expect(service.openApiDocumentPath).toBe(contractPath);
      expect(service.runtimeChecks.length).toBeGreaterThanOrEqual(4);

      const documentedGetPaths = new Set(contract!.endpoints.filter((endpoint) => endpoint.method === "GET").map((endpoint) => endpoint.path));
      const runtimeKinds = new Set(service.runtimeChecks.map((check) => check.kind));
      expect(runtimeKinds).toEqual(new Set(["liveness", "readiness", "metrics", "openapi"]));

      for (const check of service.runtimeChecks) {
        expect(check.method).toBe("GET");
        expect(check.sourceOpenApiPath).toBe(contractPath);
        expect(documentedGetPaths.has(check.path)).toBe(true);
        expect(check.url).toBe(`${publicApiBaseUrl}${check.path}`);
        expect(new URL(check.url).pathname).toBe(check.path);
      }
    }
  });

  it("polls generated OpenAPI-derived service status checks", async () => {
    const service = data.services.find((item) => item.id === "real-time-global-healthcare-command-intelligence-platform")!;
    const calledUrls: string[] = [];
    const fetchImpl = vi.fn(async (url: string) => {
      calledUrls.push(url);
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    }) as unknown as typeof fetch;

    await pollRuntimeStatus({ ...data, services: [service] }, config, undefined, fetchImpl);

    for (const check of service.runtimeChecks) {
      expect(calledUrls).toContain(check.url);
    }
  });

  it("maps the privacy consent trust contract to its runtime service port", () => {
    const privacyDocument = data.openApiDocuments.find((document) => document.relativePath === "docs/contracts/openapi/global-enterprise-data-privacy-consent-trust-platform.openapi.json")!;
    const privacyLiveEndpoint = flattenEndpoints([privacyDocument]).find((endpoint) => endpoint.path === "/api/v3/global-privacy/live")!;
    expect(endpointBaseUrl(privacyLiveEndpoint)).toBe(publicApiBaseUrl);
    expect(buildCurl(privacyLiveEndpoint)).toContain(`${publicApiBaseUrl}/api/v3/global-privacy/live`);
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

  it("renders API Explorer labels in Arabic while keeping API paths LTR", () => {
    const html = renderRoute(data, "/developer/api-explorer", {
      ...initialState,
      language: "ar",
      apiQuery: "live",
      apiMethod: "GET"
    });
    expect(html).toContain("مستكشف واجهات البرمجة");
    expect(html).toContain("الطريقة");
    expect(html).toContain('class="api-path" dir="ltr"');
    expect(html).toContain("curl -X GET");
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

  it("renders the workspace switcher in the global shell", () => {
    const html = renderApp(data, "/workspace/doctor/dashboard", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(html).toContain("Workspace View");
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
      expect(html).toContain("Governed Workspace View");
      expect(html).toContain("Workflow Timeline");
      expect(html).toContain("Governance And Evidence");
    }
  });

  it("renders doctor workspace in Arabic with translated safety labels", () => {
    const html = renderRoute(data, "/workspace/doctor/ai-recommendations", {
      ...initialState,
      language: "ar",
      selectedRole: "doctor"
    });
    expect(html).toContain("مساحة عمل الطبيب / الطبيب السريري");
    expect(html).toContain("عارض توصيات الذكاء الاصطناعي");
    expect(html).toContain("عرض مساحة عمل محكوم");
    expect(html).toContain("للاسترشاد فقط. يبقى القرار النهائي للطبيب المختص.");
  });

  it("renders patient, lab, radiology, pharmacy, and admin workspaces in Arabic", () => {
    expect(renderRoute(data, "/workspace/patient/dashboard", { ...initialState, language: "ar" })).toContain("لوحة المريض");
    expect(renderRoute(data, "/workspace/laboratory/dashboard", { ...initialState, language: "ar" })).toContain("لوحة المختبر");
    expect(renderRoute(data, "/workspace/radiology/dashboard", { ...initialState, language: "ar" })).toContain("لوحة الأشعة");
    expect(renderRoute(data, "/workspace/pharmacy/dashboard", { ...initialState, language: "ar" })).toContain("لوحة الصيدلية");
    expect(renderRoute(data, "/workspace/administrator/dashboard", { ...initialState, language: "ar" })).toContain("لوحة الإدارة");
  });

  it("renders every requested role page route without empty screens", () => {
    for (const route of allRoleRoutes()) {
      const html = renderRoute(data, route, initialState);
      expect(html).toContain("Worklist");
      expect(html).toContain("Read-only");
      expect(html).toContain("Service temporarily unavailable.");
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

  it("renders the secure access screen without raw configuration keys", () => {
    const html = renderRoute(data, "/auth/login", {
      ...initialState,
      webConfig: config
    });
    expect(html).toContain("Secure Access");
    expect(html).toContain("Provider Login");
    expect(html).toContain("Operator Token Validation");
    expect(html).toContain("Sign In With Foundation");
    expect(html).toContain("Foundation Security Token");
    expect(html).not.toContain("FOUNDATION_JWKS_URL");
  });

  it("keeps general product pages free of raw technical artifacts", () => {
    const generalRoutes = [
      "/command/executive-overview",
      "/auth/login",
      "/workspace/doctor/dashboard",
      "/workspace/patient/dashboard",
      "/enterprise/workforce",
      "/clinical/modules",
      "/developer/access-environment"
    ];
    const forbidden = [
      "http://localhost",
      "/api/v",
      "curl -X",
      "<pre><code>",
      "FOUNDATION_",
      "PANACEA_",
      ".openapi.json",
      "docs/openapi.json",
      "Controlled Pilot",
      "UTBE Controlled Pilot",
      "Demo Data",
      "DEMO DATA",
      "Pilot Role View",
      "Demo Mode",
      "No Real Patient Data",
      "No real patient data",
      "Secure Preview",
      "Preview",
      "Synthetic",
      "sample records",
      "sample data"
    ];

    for (const route of generalRoutes) {
      const html = renderRoute(data, route, initialState);
      for (const marker of forbidden) {
        expect(html, `${route} exposes ${marker}`).not.toContain(marker);
      }
    }
  });

  it("keeps technical evidence available inside operator-only areas", () => {
    const system = renderRoute(data, "/command/system-health", initialState);
    const explorer = renderRoute(data, "/developer/api-explorer", {
      ...initialState,
      apiQuery: "live",
      apiMethod: "GET"
    });
    expect(system).toContain(publicApiBaseUrl);
    expect(system).not.toContain("http://localhost");
    expect(system).toContain("docs/openapi.json");
    expect(explorer).toContain("curl -X GET");
    expect(explorer).toContain(publicApiBaseUrl);
    expect(explorer).toContain("/api/v");
  });

  it("keeps clinical and legal limitations in a dedicated governance page", () => {
    const boundary = renderRoute(data, "/evidence/clinical-legal-boundary", initialState);
    expect(boundary).toContain("Clinical and Legal Boundary");
    expect(boundary).toContain("Clinical Governance Notice");
    expect(boundary).toContain("Real clinical deployment requires organizational, legal, privacy, regulatory, and clinical approval.");
    expect(boundary).toContain("No autonomous diagnosis is provided");
    expect(boundary).toContain("No autonomous treatment or prescribing is provided");
  });

  it("renders professional enterprise badges, role cards, Arabic labels, and friendly error states", () => {
    const home = renderRoute(data, "/command/executive-overview", initialState);
    expect(home).toContain("Enterprise Interface");
    expect(home).toContain("Secure Data Boundary");
    expect(home).toContain("Human Approval Required");
    expect(home).toContain("Clinical Operations");
    expect(home).toContain("Medication Management");
    expect(home).not.toContain("Controlled Pilot");
    expect(home).not.toContain("Demo Data");

    const arabic = renderApp(data, "/command/executive-overview", {
      ...initialState,
      language: "ar"
    });
    expect(arabic).toContain("واجهة مؤسسية");
    expect(arabic).toContain("رعاية المرضى");
    expect(arabic).toContain("مركز المشغل");

    const unavailable = renderRoute(data, "/workspace/doctor/dashboard", {
      ...initialState,
      authSession: sessionFor("doctor"),
      liveWorkspaceState: {
        endpoint: {
          label: "Service health",
          method: "GET",
          url: "",
          source: "contract",
          available: false,
          reason: "Live API unavailable"
        },
        result: {
          requestId: "friendly-error",
          method: "GET",
          url: "",
          state: "unavailable",
          detail: "Failed to fetch",
          checkedAt: new Date().toISOString()
        }
      }
    });
    expect(unavailable).toContain("Service temporarily unavailable.");
    expect(unavailable).toContain("The system could not reach this service. Please contact the system operator if this continues.");
    expect(unavailable).not.toContain("Failed to fetch");
  });

  it("provider auth endpoints are derived from Foundation base URL", () => {
    const endpoints = providerAuthEndpoints(config);
    expect(endpoints.login).toBe("https://foundation.utbe.ai/api/v1/auth/login");
    expect(endpoints.refresh).toBe("https://foundation.utbe.ai/api/v1/auth/refresh");
    expect(endpoints.me).toBe("https://foundation.utbe.ai/api/v1/auth/me");
  });

  it("provider login validates the returned access token and stores provider session metadata", async () => {
    const token = makeSignedJwt({
      iss: config.FOUNDATION_JWT_ISSUER,
      aud: "panacea-web",
      sub: "foundation-operator",
      userId: "foundation-operator",
      username: "operator",
      name: "operator",
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
      tenantId: "default",
      roles: ["operator"],
      permissions: ["panacea:operate"]
    });
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("/.well-known/jwks.json")) {
        return new Response(JSON.stringify({ keys: [publicJwk()] }), { status: 200 });
      }
      if (url.includes("/api/v1/auth/login")) {
        return new Response(JSON.stringify({
          accessToken: token,
          refreshToken: "refresh-provider-session",
          expiresIn: 3600,
          tokenType: "Bearer",
          user: { username: "operator", tenantId: "default", roles: ["operator"] }
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
    }) as unknown as typeof fetch;

    const result = await loginWithFoundationProvider({ username: "operator", password: "secret", tenantId: "default" }, config, fetchImpl);
    expect(result.ok).toBe(true);
    expect(result.session?.authMode).toBe("provider-login");
    expect(result.session?.refreshToken).toBe("refresh-provider-session");
    expect(result.session?.role).toBe("operator");
  });

  it("provider login surfaces structured authentication errors", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      error: "invalid_credentials",
      message: "Invalid username, password, or tenant."
    }), { status: 401 })) as unknown as typeof fetch;

    await expect(loginWithFoundationProvider({ username: "operator", password: "wrong", tenantId: "default" }, config, fetchImpl))
      .rejects
      .toThrow("Invalid username, password, or tenant.");
  });

  it("provider refresh flow returns a rotated provider session", async () => {
    const refreshedToken = makeSignedJwt({
      iss: config.FOUNDATION_JWT_ISSUER,
      aud: "panacea-web",
      sub: "foundation-operator",
      userId: "foundation-operator",
      username: "operator",
      exp: Math.floor(Date.now() / 1000) + 1800,
      iat: Math.floor(Date.now() / 1000),
      tenantId: "default",
      roles: ["operator"],
      permissions: ["panacea:operate"]
    });
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("/.well-known/jwks.json")) return new Response(JSON.stringify({ keys: [publicJwk()] }), { status: 200 });
      if (url.includes("/api/v1/auth/refresh")) {
        return new Response(JSON.stringify({
          accessToken: refreshedToken,
          refreshToken: "rotated-refresh-provider-session",
          expiresIn: 3600,
          tokenType: "Bearer",
          user: { username: "operator", tenantId: "default", roles: ["operator"] }
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
    }) as unknown as typeof fetch;
    const result = await refreshFoundationProviderSession({ ...sessionFor("operator"), refreshToken: "refresh-provider-session", authMode: "provider-login" }, config, fetchImpl);
    expect(result.ok).toBe(true);
    expect(result.session?.refreshToken).toBe("rotated-refresh-provider-session");
    expect(result.session?.authMode).toBe("provider-login");
  });

  it("provider logout accepts provider response and clears local-session caller state", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ status: "ok", loggedOut: true }), { status: 200 })) as unknown as typeof fetch;
    const result = await logoutFoundationProviderSession({ ...sessionFor("operator"), refreshToken: "refresh-provider-session", authMode: "provider-login" }, config, fetchImpl);
    expect(result.ok).toBe(true);
    expect(result.detail).toContain("Provider logout accepted");
  });

  it("discovers provider login endpoints and falls back when they are missing", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: "not_found" }), { status: 404 })) as unknown as typeof fetch;
    const discovery = await discoverFoundationLogin(config, fetchImpl);
    expect(discovery.providerHostedLoginAvailable).toBe(false);
    expect(discovery.checks).toHaveLength(8);
    expect(discovery.recommendation).toContain("Operator JWT mode");
  });

  it("detects provider-hosted login when OpenID and auth endpoints exist", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("openid-configuration")) {
        return new Response(JSON.stringify({
          issuer: config.FOUNDATION_JWT_ISSUER,
          token_endpoint: "https://foundation.utbe.ai/api/v1/auth/token",
          userinfo_endpoint: "https://foundation.utbe.ai/api/v1/auth/me"
        }), { status: 200 });
      }
      if (url.includes("/api/v1/auth/login") || url.includes("/api/v1/auth/token")) {
        return new Response(null, { status: 204 });
      }
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
    }) as unknown as typeof fetch;
    const discovery = await discoverFoundationLogin(config, fetchImpl);
    expect(discovery.providerHostedLoginAvailable).toBe(true);
    expect(discovery.checks[0].detail).toContain("token_endpoint");
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
    expect(html).toContain("Secure Session");
  });

  it("API client adds Authorization, tenant, and request correlation headers", async () => {
    let headers: HeadersInit | undefined;
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      headers = init?.headers;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await apiRequest("GET", allowedReadFixture.url, sessionFor("administrator"), config, undefined, fetchImpl, [allowedReadFixture]);
    expect(result.state).toBe("online");
    expect(headers).toMatchObject({
      Authorization: "Bearer test-token",
      "X-Tenant-Id": "tenant-a",
      "X-User-Id": "administrator-subject",
      "X-Actor-Id": "administrator-subject",
      "X-Roles": "administrator",
      "X-Permissions": "read",
      "X-Country-Codes": "KW",
      "X-Region-Codes": "GCC"
    });
    expect((headers as Record<string, string>)["X-Request-Id"]).toBeTruthy();
    expect((headers as Record<string, string>)["X-Correlation-Id"]).toBeTruthy();
  });

  it("API client handles 401, 403, and unavailable APIs without throwing", async () => {
    const session = sessionFor("administrator");
    const unauthorized = await apiRequest("GET", allowedReadFixture.url, session, config, undefined, vi.fn(async () => new Response("no", { status: 401 })) as unknown as typeof fetch, [allowedReadFixture]);
    const forbidden = await apiRequest("GET", allowedReadFixture.url, session, config, undefined, vi.fn(async () => new Response("no", { status: 403 })) as unknown as typeof fetch, [allowedReadFixture]);
    const unavailable = await apiRequest("GET", allowedReadFixture.url, session, config, undefined, vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch, [allowedReadFixture]);

    expect(unauthorized.state).toBe("unauthorized");
    expect(forbidden.state).toBe("unauthorized");
    expect(unavailable.state).toBe("unavailable");
  });

  it("allowlist allows safe reads and blocks unknown endpoints", () => {
    const allowlist = buildBrowserApiAllowlist(data, config);
    const allowed = evaluateBrowserApiRequest(allowlist, "GET", allowedReadUrlFromAllowlist(allowlist), sessionFor("operator"));
    const blocked = evaluateBrowserApiRequest(allowlist, "GET", "https://api.example.test/api/v4/not-in-openapi", sessionFor("operator"));
    const templated = evaluateBrowserApiRequest([
      ...allowlist,
      {
        ...allowedReadFixture,
        path: "/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/timeline",
        url: "https://api.example.test/api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/timeline",
        summary: "List clinical timeline read models",
        reason: "Authenticated backend read model."
      }
    ], "GET", "https://api.example.test/api/v4/global-command-intelligence/read-models/clinical/patients/patient-live-001/timeline?limit=10", sessionFor("doctor"));
    expect(allowed.allowed).toBe(true);
    expect(allowed.classification).toBe("ALLOWED_READ");
    expect(templated.allowed).toBe(true);
    expect(templated.classification).toBe("ALLOWED_READ");
    expect(blocked.allowed).toBe(false);
    expect(blocked.classification).toBe("UNKNOWN");
  });

  it("allowlist blocks dangerous write endpoints before browser transport", async () => {
    const fetchImpl = vi.fn(async () => new Response("should not be called", { status: 200 })) as unknown as typeof fetch;
    const result = await apiRequest("POST", blockedWriteFixture.url, sessionFor("operator"), config, { testOnly: true }, fetchImpl, [blockedWriteFixture]);
    expect(result.state).toBe("unavailable");
    expect(result.allowlistClassification).toBe("BLOCKED_WRITE");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("allowlist permits only authenticated approved Sprint 113 live write workflow endpoints", async () => {
    const allowlist = buildBrowserApiAllowlist(data, config);
    const writeEntry = allowlist.find((entry) => entry.classification === "ALLOWED_LIVE_WRITE");
    expect(writeEntry).toBeTruthy();
    const withoutSession = evaluateBrowserApiRequest(allowlist, "POST", writeEntry!.url, undefined);
    expect(withoutSession.allowed).toBe(false);
    expect(withoutSession.reason).toContain("authenticated Live Mode");

    const withSession = evaluateBrowserApiRequest(allowlist, "POST", writeEntry!.url, sessionFor("doctor"));
    expect(withSession.allowed).toBe(true);
    expect(withSession.classification).toBe("ALLOWED_LIVE_WRITE");
  });

  it("submits approved live write workflow requests with workflow control payloads", async () => {
    const workspace = roleWorkspaces.find((item) => item.id === "doctor")!;
    const page = workspace.pages.find((item) => item.id === "patient-search")!;
    const endpoint = findWriteWorkflowEndpoint(data, workspace, page, config, page.route);
    expect(endpoint.available).toBe(true);
    expect(endpoint.url).toContain("/write-workflows/clinical/patients");

    let requestBody = "";
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      requestBody = String(init?.body ?? "");
      return new Response(JSON.stringify({
        data: { workflowKey: "create_patient", eventType: "patient.created", workflowControls: { liveMode: true, demoData: false } },
        event: { eventType: "patient.created" }
      }), { status: 201 });
    }) as unknown as typeof fetch;

    const allowlist = buildBrowserApiAllowlist(data, config);
    const response = await executeWriteWorkflowRequest(
      endpoint,
      { ...sessionFor("doctor"), permissions: ["global_command_intelligence.write_workflows.write"] },
      config,
      allowlist,
      {
        tenantId: "tenant-a",
        payload: { detail: "approved transaction" },
        workflowControls: {
          liveMode: true,
          demoData: false,
          auditRequired: true,
          tenantIsolationConfirmed: true,
          humanUserConfirmed: true,
          noAutonomousDiagnosis: true,
          noAutonomousTreatment: true,
          noAiGeneratedClinicalDecision: true
        }
      },
      fetchImpl
    );
    expect(response.result.state).toBe("online");
    expect(response.result.httpStatus).toBe(201);
    expect(JSON.parse(requestBody).workflowControls.demoData).toBe(false);
  });

  it("operator audit test remains restricted to operator role", async () => {
    const doctorResult = await appendOperatorAuditTest(sessionFor("doctor"), config, [operatorAuditFixture], vi.fn() as unknown as typeof fetch);
    expect(doctorResult.allowlistClassification).toBe("ALLOWED_OPERATOR_TEST");
    expect(doctorResult.blockedReason).toContain("operator role");

    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ accepted: true }), { status: 201 })) as unknown as typeof fetch;
    const operatorResult = await appendOperatorAuditTest(sessionFor("operator"), config, [operatorAuditFixture], fetchImpl);
    expect(operatorResult.state).toBe("online");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("renders Foundation and service live/offline status states", () => {
    const liveStatus: LiveStatusState = {
      checkedAt: new Date().toISOString(),
      foundation: [
        { label: "Foundation Health", url: config.FOUNDATION_HEALTH_URL, state: "online", httpStatus: 200, detail: "ok", checkedAt: new Date().toISOString() },
        { label: "Foundation JWKS", url: config.FOUNDATION_JWKS_URL, state: "offline", httpStatus: 503, detail: "down", checkedAt: new Date().toISOString() }
      ],
      services: [
        { label: "Service health", url: `${publicApiBaseUrl}/api/v4/global-command-intelligence/live`, state: "unavailable", detail: "CORS", checkedAt: new Date().toISOString() }
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

  it("renders browser access policy status on the login page", () => {
    const html = renderRoute(data, "/auth/login", {
      ...initialState,
      webConfig: config,
      apiAllowlistSummary: {
        ALLOWED_READ: 10,
        ALLOWED_LIVE_WRITE: 4,
        ALLOWED_OPERATOR_TEST: 1,
        ALLOWED_OPERATOR_ACTION: 1,
        BLOCKED_WRITE: 50,
        BLOCKED_CLINICAL_ACTION: 20,
        BLOCKED_ADMIN_DANGEROUS: 5,
        SERVER_ONLY: 0,
        UNKNOWN: 0
      }
    });
    expect(html).toContain("Browser Access Policy");
    expect(html).toContain("Approved read-only access");
    expect(html).not.toContain("ALLOWED_READ");
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
        checkedAt: new Date().toISOString(),
        allowlistClassification: "ALLOWED_READ",
        blockedReason: "No browser-visible read model returned records."
      }
    };
    const html = renderRoute(data, "/workspace/patient/dashboard", {
      ...initialState,
      authSession: sessionFor("patient"),
      liveWorkspaceState
    });
    expect(html).toContain("Live Mode — Authenticated Read-Only Session");
    expect(html).toContain("Service temporarily unavailable.");
    expect(html).toContain("Live Records");
    expect(html).toContain("Approved read-only access");
    expect(html).not.toContain("Rows are UI-state examples");
    expect(html).not.toContain("Patient Portal Demo");
    expect(html).not.toContain("Cardiology Clinic");
  });

  it("renders live write workflow forms and Arabic secure workspace persistence boundaries", () => {
    const liveWorkspaceState: LiveWorkspaceState = {
      endpoint: {
        label: "Global Command Intelligence: List tenant-scoped clinical patient read models",
        method: "GET",
        url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/read-models/clinical/patients",
        source: "services/real-time-global-healthcare-command-intelligence-platform/docs/openapi.json",
        available: true,
        reason: "Live backend read-model endpoint selected from the OpenAPI contract."
      },
      writeEndpoint: {
        label: "Global Command Intelligence: Create a governed tenant-scoped patient record",
        method: "POST",
        url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/write-workflows/clinical/patients",
        source: "services/real-time-global-healthcare-command-intelligence-platform/docs/openapi.json",
        available: true,
        reason: "Approved live transactional write workflow selected from the OpenAPI contract."
      },
      writeResult: {
        requestId: "req-write",
        method: "POST",
        url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/write-workflows/clinical/patients",
        state: "online",
        httpStatus: 201,
        detail: "Request completed.",
        checkedAt: new Date().toISOString(),
        jsonBody: {
          data: { workflowKey: "create_patient", eventType: "patient.created" },
          projections: [
            { projectionTarget: "clinical.patients.patient-live-001", status: "projected" }
          ]
        }
      }
    };
    const live = renderRoute(data, "/workspace/doctor/patient-search", {
      ...initialState,
      authSession: { ...sessionFor("doctor"), permissions: ["global_command_intelligence.write_workflows.write"] },
      liveWorkspaceState
    });
    expect(live).toContain("Transactional Write Workflow");
    expect(live).toContain("Submit Live Write");
    expect(live).toContain("Governed transaction accepted");
    expect(live).toContain("Synchronization Status");
    expect(live).not.toContain("clinical.patients.patient-live-001=projected");

    const arabicDemo = renderRoute(data, "/workspace/laboratory/result-entry", {
      ...initialState,
      language: "ar",
      selectedRole: "laboratory"
    });
    expect(arabicDemo).toContain("إجراء مراجعة فقط — لا يتم حفظه في الخادم التشغيلي");
  });

  it("renders live backend read-model rows without demo workspace records", () => {
    const liveWorkspaceState: LiveWorkspaceState = {
      endpoint: {
        label: "Global Command Intelligence: List tenant-scoped clinical patient read models",
        method: "GET",
        url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/read-models/clinical/patients",
        source: "services/real-time-global-healthcare-command-intelligence-platform/docs/openapi.json",
        available: true,
        reason: "Live backend read-model endpoint selected from the OpenAPI contract."
      },
      result: {
        requestId: "req-live-read",
        method: "GET",
        url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/read-models/clinical/patients",
        state: "online",
        httpStatus: 200,
        detail: "Request completed.",
        checkedAt: new Date().toISOString(),
        jsonBody: {
          data: {
            source: "live-read-model",
            demoData: false,
            tenantId: "tenant-a",
            workspace: "clinical",
            modelKey: "patients",
            pagination: { limit: 25, offset: 0, total: 1 },
            items: [
              {
                id: "read-live-patient-001",
                title: "Live Read Patient",
                status: "active",
                subjectId: "patient-live-001",
                updatedAt: "2026-07-01T10:00:00.000Z",
                payload: { patientId: "patient-live-001", source: "backend" }
              }
            ]
          }
        }
      }
    };
    const html = renderRoute(data, "/workspace/doctor/dashboard", {
      ...initialState,
      authSession: sessionFor("doctor"),
      liveWorkspaceState
    });
    expect(html).toContain("Live Records");
    expect(html).toContain("Live Read Patient");
    expect(html).toContain("Service Online");
    expect(html).not.toContain("Demo Patient Alpha");
    expect(html).not.toContain("Doctor Patient Search");
    expect(html).not.toContain("patientId:");
  });

  it("renders Sprint 115 pilot journey evidence across live role workspaces", () => {
    const roles = [
      {
        route: "/workspace/doctor/dashboard",
        role: "doctor" as const,
        title: "Sprint 115 Live Patient",
        modelKey: "patients",
        endpoint: "/read-models/clinical/patients",
        write: "patient.created",
        projection: "clinical.patients.patient-pilot-115"
      },
      {
        route: "/workspace/patient/appointments",
        role: "patient" as const,
        title: "Sprint 115 Appointment Request",
        modelKey: "appointments",
        endpoint: "/read-models/patient-portal/me/appointments",
        write: "patient.appointment.requested",
        projection: "patient_portal.appointments.patient-pilot-115"
      },
      {
        route: "/workspace/laboratory/result-entry",
        role: "laboratory" as const,
        title: "Sprint 115 Critical Lab Result",
        modelKey: "critical_results",
        endpoint: "/read-models/laboratory/critical-results",
        write: "critical.lab.result.flagged",
        projection: "laboratory.critical_results.result-pilot-115-critical"
      },
      {
        route: "/workspace/radiology/reporting",
        role: "radiology" as const,
        title: "Sprint 115 Critical Finding",
        modelKey: "critical_findings",
        endpoint: "/read-models/radiology/critical-findings",
        write: "critical.finding.flagged",
        projection: "radiology.critical_findings.report-pilot-115-critical"
      },
      {
        route: "/workspace/pharmacy/prescriptions",
        role: "pharmacy" as const,
        title: "Sprint 115 Prescription",
        modelKey: "prescriptions",
        endpoint: "/read-models/pharmacy/prescriptions",
        write: "prescription.created",
        projection: "pharmacy.prescriptions.prescription-pilot-115"
      },
      {
        route: "/workspace/administrator/users",
        role: "administrator" as const,
        title: "Sprint 115 User",
        modelKey: "users",
        endpoint: "/read-models/admin/users",
        write: "user.created",
        projection: "admin.users.user-pilot-115"
      }
    ];

    for (const item of roles) {
      const liveWorkspaceState: LiveWorkspaceState = {
        endpoint: {
          label: `Sprint 115 ${item.role} live read model`,
          method: "GET",
          url: `https://api.panacea.utbe.ai/api/v4/global-command-intelligence${item.endpoint}`,
          source: "docs/contracts/openapi/real-time-global-healthcare-command-intelligence-platform.openapi.json",
          available: true,
          reason: "Sprint 115 live read-model evidence selected from the OpenAPI contract."
        },
        result: {
          requestId: `sprint115-read-${item.role}`,
          method: "GET",
          url: `https://api.panacea.utbe.ai/api/v4/global-command-intelligence${item.endpoint}`,
          state: "online",
          httpStatus: 200,
          detail: "Request completed.",
          checkedAt: new Date().toISOString(),
          jsonBody: {
            data: {
              source: "live-read-model",
              demoData: false,
              tenantId: "tenant-a",
              workspace: item.role === "doctor" ? "clinical" : item.role,
              modelKey: item.modelKey,
              pagination: { limit: 25, offset: 0, total: 1 },
              items: [
                {
                  id: `read-sprint115-${item.role}`,
                  title: item.title,
                  status: "active",
                  subjectId: item.projection.split(".").at(-1),
                  updatedAt: "2026-07-01T10:00:00.000Z",
                  payload: { source: "live-write-projection", eventType: item.write }
                }
              ]
            }
          }
        },
        writeEndpoint: {
          label: `Sprint 115 ${item.write}`,
          method: "POST",
          url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/write-workflows/events",
          source: "docs/contracts/openapi/real-time-global-healthcare-command-intelligence-platform.openapi.json",
          available: true,
          reason: "Approved live transactional workflow evidence."
        },
        writeResult: {
          requestId: `sprint115-write-${item.role}`,
          method: "POST",
          url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/write-workflows/events",
          state: "online",
          httpStatus: 201,
          detail: "Request completed.",
          checkedAt: new Date().toISOString(),
          jsonBody: {
            data: { workflowKey: item.write.replaceAll(".", "_"), eventType: item.write },
            projections: [{ projectionTarget: item.projection, status: "projected" }]
          }
        }
      };
      const html = renderRoute(data, item.route, {
        ...initialState,
        authSession: { ...sessionFor(item.role), permissions: ["read", "global_command_intelligence.write_workflows.write"] },
        liveWorkspaceState
      });
      expect(html).toContain("Live Mode — Authenticated Read-Only Session");
      expect(html).toContain("Live Records");
      expect(html).toContain(item.title);
      expect(html).toContain("Governed transaction accepted");
      expect(html).not.toContain(item.projection);
      expect(html).not.toContain("Rows are UI-state examples");
    }
  });

  it("renders operator transaction review with projection labels and Arabic text", () => {
    const html = renderRoute(data, "/command/transaction-review", {
      ...initialState,
      authSession: sessionFor("operator"),
      transactionReview: {
        lastUpdated: "2026-07-01T10:00:00.000Z",
        events: {
          requestId: "req-events",
          method: "GET",
          url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/write-workflows/events",
          state: "online",
          httpStatus: 200,
          detail: "Request completed.",
          checkedAt: "2026-07-01T10:00:00.000Z",
          jsonBody: {
            data: {
              source: "live-write-workflow-events",
              demoData: false,
              tenantId: "tenant-global-command",
              pagination: { limit: 25, offset: 0, total: 1 },
              items: [
                {
                  id: "event-001",
                  tenantId: "tenant-global-command",
                  eventType: "patient.created",
                  actorId: "doctor-001",
                  workflowKey: "create_patient",
                  subjectId: "patient-live-001",
                  occurredAt: "2026-07-01T10:00:00.000Z",
                  requestContext: { requestId: "req-events", correlationId: "corr-events" },
                  projections: [{ status: "projected", projectionTarget: "clinical.patients.patient-live-001" }]
                }
              ]
            }
          }
        },
        projections: {
          requestId: "req-projections",
          method: "GET",
          url: "https://api.panacea.utbe.ai/api/v4/global-command-intelligence/write-workflows/projections",
          state: "online",
          httpStatus: 200,
          detail: "Request completed.",
          checkedAt: "2026-07-01T10:00:00.000Z",
          jsonBody: {
            data: {
              source: "live-write-workflow-projections",
              demoData: false,
              tenantId: "tenant-global-command",
              pagination: { limit: 50, offset: 0, total: 1 },
              items: [
                {
                  id: "projection-001",
                  tenantId: "tenant-global-command",
                  eventId: "event-001",
                  eventType: "patient.created",
                  projectionTarget: "clinical.patients.patient-live-001",
                  readModelId: "read-event-clinical-patient",
                  projectionStatus: "failed",
                  failureReason: "validation failure",
                  retryCount: 0,
                  actorId: "doctor-001",
                  correlationId: "corr-events",
                  requestId: "req-events",
                  processedAt: "2026-07-01T10:00:00.000Z"
                }
              ]
            }
          }
        }
      }
    });
    expect(html).toContain("Transaction Review");
    expect(html).toContain("Projection Status");
    expect(html).toContain("patient.created");
    expect(html).toContain("Retry");

    const arabicHtml = renderRoute(data, "/command/transaction-review", {
      ...initialState,
      language: "ar",
      authSession: sessionFor("operator")
    });
    expect(arabicHtml).toContain("مراجعة المعاملات");
    expect(arabicHtml).toContain("تحديث المعاملات");
  });

  it("renders live workspace status labels for partial, auth, and CORS outcomes", () => {
    const endpoint = {
      label: "Runtime health",
      method: "GET" as const,
      url: "https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live",
      source: "services/autonomous-healthcare-intelligence-foundation/docs/openapi.json",
      available: true,
      reason: "Runtime endpoint selected from existing OpenAPI."
    };
    const baseState = {
      ...initialState,
      authSession: sessionFor("doctor")
    };

    const partial = renderRoute(data, "/workspace/doctor/dashboard", {
      ...baseState,
      liveWorkspaceState: {
        endpoint,
        result: {
          requestId: "req-partial",
          method: "GET",
          url: endpoint.url,
          state: "online",
          httpStatus: 200,
          detail: "OK",
          checkedAt: new Date().toISOString()
        }
      }
    });
    expect(partial).toContain("Connection Pending");

    const authBlocked = renderRoute(data, "/workspace/doctor/dashboard", {
      ...baseState,
      liveWorkspaceState: {
        endpoint,
        result: {
          requestId: "req-auth",
          method: "GET",
          url: endpoint.url,
          state: "unauthorized",
          httpStatus: 401,
          detail: "Unauthorized",
          checkedAt: new Date().toISOString()
        }
      }
    });
    expect(authBlocked).toContain("Secure Session Required");

    const corsBlocked = renderRoute(data, "/workspace/doctor/dashboard", {
      ...baseState,
      liveWorkspaceState: {
        endpoint,
        result: {
          requestId: "req-cors",
          method: "GET",
          url: endpoint.url,
          state: "unavailable",
          detail: "Failed to fetch",
          checkedAt: new Date().toISOString()
        }
      }
    });
    expect(corsBlocked).toContain("Browser Access Policy Blocked");
  });

  it("renders the professional hospital workspace launchpad with quick workspace access", () => {
    const html = renderRoute(data, "/command/executive-overview", initialState);
    expect(html).toContain("Hospital Workspace Launchpad");
    expect(html).toContain("UTBE enterprise hospital operating interface");
    expect(html).toContain("Enterprise Interface");
    expect(html).toContain("#/workspace/doctor/dashboard");
    expect(html).toContain("#/workspace/administrator/dashboard");
  });

  it("renders doctor patient search, chart, and advisory-only workspace content", () => {
    const search = renderRoute(data, "/workspace/doctor/patient-search", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(search).toContain("Patient Alpha");
    expect(search).toContain("PX-MRN-1001");
    expect(search).toContain("#/workspace/doctor/patient-profile/patient-px-001");

    const chart = renderRoute(data, "/workspace/doctor/clinical-timeline/patient-px-001", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(chart).toContain("Specimen collected");
    expect(chart).toContain("Medication review queued");

    const advisory = renderRoute(data, "/workspace/doctor/ai-recommendations/patient-px-001", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(advisory).toContain("Advisory only. Clinician remains final decision maker.");
    expect(advisory).toContain("They are not diagnosis, treatment, or production AI output.");
  });

  it("renders patient portal workspace records without replacing clinician advice", () => {
    const html = renderRoute(data, "/workspace/patient/appointments", {
      ...initialState,
      selectedRole: "patient"
    });
    expect(html).toContain("Patient Portal");
    expect(html).toContain("Patient-facing workspace information does not replace clinician advice.");
    expect(html).toContain("Cardiology Clinic");
    expect(html).toContain("SECURE WORKSPACE");
  });

  it("renders operational records for lab, radiology, pharmacy, and administration", () => {
    const lab = renderRoute(data, "/workspace/laboratory/result-entry", initialState);
    expect(lab).toContain("Laboratory Operations");
    expect(lab).toContain("Review entry only -- not persisted to operational backend");

    const radiology = renderRoute(data, "/workspace/radiology/dicom-metadata", initialState);
    expect(radiology).toContain("Radiology Operations");
    expect(radiology).toContain("StudyInstanceUID-PX");

    const pharmacy = renderRoute(data, "/workspace/pharmacy/inventory", initialState);
    expect(pharmacy).toContain("Pharmacy Operations");
    expect(pharmacy).toContain("LOT-PX-410");

    const admin = renderRoute(data, "/workspace/administrator/users", initialState);
    expect(admin).toContain("Administration Console");
    expect(admin).toContain("Clinical Doctor");
    expect(admin).toContain("utbe-health-system");
  });

  it("localizes operational secure workspace labels in Arabic", () => {
    const html = renderRoute(data, "/workspace/doctor/patient-search", {
      ...initialState,
      language: "ar",
      selectedRole: "doctor"
    });
    expect(html).toContain("عرض مساحة عمل محكوم");
    expect(html).toContain("بحث المرضى");
    expect(html).toContain("بحث المرضى");
    expect(html).toContain("Patient Alpha");
  });
});

function allowedReadUrlFromAllowlist(allowlist: ReturnType<typeof buildBrowserApiAllowlist>): string {
  const entry = allowlist.find((item) => item.classification === "ALLOWED_READ");
  if (!entry) throw new Error("Expected generated allowlist to include at least one safe read endpoint.");
  return entry.url;
}

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

function makeSignedJwt(claims: Record<string, unknown>): string {
  const header = base64Url({ alg: "RS256", typ: "JWT", kid: "provider-test-key" });
  const payload = base64Url(claims);
  const signature = crypto.createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(providerKeyPair.privateKey)
    .toString("base64url");
  return `${header}.${payload}.${signature}`;
}

function publicJwk(): JsonWebKey & { kid: string; alg: string; use: string } {
  return {
    ...(crypto.createPublicKey(providerKeyPair.publicKey).export({ format: "jwk" }) as JsonWebKey),
    kid: "provider-test-key",
    alg: "RS256",
    use: "sig"
  };
}
