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
import { flattenEndpoints, filterEndpoints } from "../src/apiExplorer";
import { probeFoundation } from "../src/foundation";
import { discoverFoundationLogin } from "../src/foundationLoginDiscovery";
import { apiRequest, appendOperatorAuditTest } from "../src/liveApi";
import { languageOptions, translate } from "../src/locales";
import { allRoleRoutes, roleDefaultRoute, roleSwitcherOptions, roleWorkspaces } from "../src/roleWorkspaces";
import { initialState, renderApp, renderRoute } from "../src/render";
import { buildWebConfig } from "../src/webConfig";
import type { AppData, AuthSession, LiveStatusState, LiveWorkspaceState } from "../src/types";
import { allowedReadFixture, blockedWriteFixture, operatorAuditFixture } from "./liveApiFixtures";

const data = dataJson as AppData;
const config = buildWebConfig(data);
const providerKeyPair = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
});

describe("Panacea web platform", () => {
  it("renders the executive overview with real release evidence", () => {
    const html = renderRoute(data, "/command/executive-overview", initialState);
    expect(html).toContain("Executive Overview");
    expect(html).toContain("OFFICIALLY RELEASED");
    expect(html).toContain(String(data.services.length));
    expect(html).toContain("Explore APIs");
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

  it("renders doctor workspace in Arabic with translated safety labels", () => {
    const html = renderRoute(data, "/workspace/doctor/ai-recommendations", {
      ...initialState,
      language: "ar",
      selectedRole: "doctor"
    });
    expect(html).toContain("مساحة عمل الطبيب / الطبيب السريري");
    expect(html).toContain("عارض توصيات الذكاء الاصطناعي");
    expect(html).toContain("بيانات تجريبية — ليست بيانات مرضى حقيقية");
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
    expect(html).toContain("Provider Login");
    expect(html).toContain("Operator Token Mode");
    expect(html).toContain("Sign In With Foundation");
    expect(html).toContain("Paste Foundation-issued JWT");
    expect(html).toContain("FOUNDATION_JWKS_URL");
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
    expect(html).toContain(session.tenantId);
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
      "X-Actor-Id": "administrator-subject"
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
    expect(allowed.allowed).toBe(true);
    expect(allowed.classification).toBe("ALLOWED_READ");
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

  it("renders allowlist and CORS readiness status on the login page", () => {
    const html = renderRoute(data, "/auth/login", {
      ...initialState,
      webConfig: config,
      apiAllowlistSummary: {
        ALLOWED_READ: 10,
        ALLOWED_OPERATOR_TEST: 1,
        BLOCKED_WRITE: 50,
        BLOCKED_CLINICAL_ACTION: 20,
        BLOCKED_ADMIN_DANGEROUS: 5,
        SERVER_ONLY: 0,
        UNKNOWN: 0
      }
    });
    expect(html).toContain("Browser API Allowlist");
    expect(html).toContain("CORS readiness");
    expect(html).toContain("ALLOWED_READ");
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
    expect(html).toContain("LIVE MODE -- AUTHENTICATED READ-ONLY SESSION");
    expect(html).toContain("LIVE API UNAVAILABLE");
    expect(html).toContain("Demo rows are hidden in Live Mode");
    expect(html).toContain("No live records are displayed");
    expect(html).toContain("ALLOWED_READ");
    expect(html).not.toContain("Rows are UI-state examples");
  });

  it("renders live workspace status labels for partial, auth, and CORS outcomes", () => {
    const endpoint = {
      label: "Runtime health",
      method: "GET" as const,
      url: "http://localhost:18094/api/v4/autonomous-healthcare-intelligence/live",
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
    expect(partial).toContain("LIVE PARTIAL");

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
    expect(authBlocked).toContain("BLOCKED BY AUTH");

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
    expect(corsBlocked).toContain("BLOCKED BY CORS");
  });

  it("renders the operator operational demo board with quick workspace access", () => {
    const html = renderRoute(data, "/command/executive-overview", initialState);
    expect(html).toContain("Operator Live Demo Board");
    expect(html).toContain("Panacea Gulf Demo Hospital");
    expect(html).toContain("DEMO DATA — NOT REAL PATIENT DATA");
    expect(html).toContain("#/workspace/doctor/dashboard");
    expect(html).toContain("#/workspace/administrator/dashboard");
  });

  it("renders doctor patient search, chart, and advisory-only demo content", () => {
    const search = renderRoute(data, "/workspace/doctor/patient-search", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(search).toContain("Demo Patient Alpha");
    expect(search).toContain("DEMO-MRN-1001");
    expect(search).toContain("#/workspace/doctor/patient-profile/demo-patient-001");

    const chart = renderRoute(data, "/workspace/doctor/clinical-timeline/demo-patient-001", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(chart).toContain("Demo specimen collected");
    expect(chart).toContain("Demo medication review queued");

    const advisory = renderRoute(data, "/workspace/doctor/ai-recommendations/demo-patient-001", {
      ...initialState,
      selectedRole: "doctor"
    });
    expect(advisory).toContain("Advisory only. Clinician remains final decision maker.");
    expect(advisory).toContain("They are not diagnosis, treatment, or production AI output.");
  });

  it("renders patient portal demo records without replacing clinician advice", () => {
    const html = renderRoute(data, "/workspace/patient/appointments", {
      ...initialState,
      selectedRole: "patient"
    });
    expect(html).toContain("Patient Portal Demo");
    expect(html).toContain("Simple patient-facing demo data. This does not replace clinician advice.");
    expect(html).toContain("Cardiology Clinic");
    expect(html).toContain("DEMO DATA");
  });

  it("renders operational records for lab, radiology, pharmacy, and administration", () => {
    const lab = renderRoute(data, "/workspace/laboratory/result-entry", initialState);
    expect(lab).toContain("Laboratory Operations Demo");
    expect(lab).toContain("Demo entry only -- not persisted to production backend");

    const radiology = renderRoute(data, "/workspace/radiology/dicom-metadata", initialState);
    expect(radiology).toContain("Radiology Operations Demo");
    expect(radiology).toContain("StudyInstanceUID-DEMO");

    const pharmacy = renderRoute(data, "/workspace/pharmacy/inventory", initialState);
    expect(pharmacy).toContain("Pharmacy Operations Demo");
    expect(pharmacy).toContain("LOT-DEMO-410");

    const admin = renderRoute(data, "/workspace/administrator/users", initialState);
    expect(admin).toContain("Administration Demo Console");
    expect(admin).toContain("Demo Doctor");
    expect(admin).toContain("demo-tenant");
  });

  it("localizes operational demo labels in Arabic", () => {
    const html = renderRoute(data, "/workspace/doctor/patient-search", {
      ...initialState,
      language: "ar",
      selectedRole: "doctor"
    });
    expect(html).toContain("بيانات تجريبية — ليست بيانات مرضى حقيقية");
    expect(html).toContain("بحث المرضى");
    expect(html).toContain("بحث مريض صناعي");
    expect(html).toContain("Demo Patient Alpha");
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
