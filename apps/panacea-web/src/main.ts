import { createIcons, icons } from "lucide";
import "./styles.css";
import { allowlistSummary, buildBrowserApiAllowlist } from "./apiAllowlist";
import { defaultRoute } from "./catalog";
import { clearSession, persistSession, restoreSession, validateTokenWithFoundation } from "./auth";
import { loginWithFoundationProvider, logoutFoundationProviderSession, refreshFoundationProviderSession } from "./foundationAuthClient";
import { discoverFoundationLogin } from "./foundationLoginDiscovery";
import { probeFoundation } from "./foundation";
import { appendOperatorAuditTest, executeReadOnlyRequest, executeWriteWorkflowRequest, findReadOnlyEndpoint, findWriteWorkflowEndpoint, pollRuntimeStatus } from "./liveApi";
import { initialState, renderApp, type RenderState } from "./render";
import { isRoleRoute } from "./roleRender";
import { pageFromRoute, roleDefaultRoute, workspaceFromRoute } from "./roleWorkspaces";
import { localeDirection, normalizeLocale } from "./locales";
import type { AppData } from "./types";
import { buildWebConfig } from "./webConfig";

const root = document.querySelector<HTMLDivElement>("#app");

let data: AppData;
let lastLiveRoute = "";
let liveWorkspaceInFlight = false;
let state: RenderState = {
  ...initialState,
  theme: (localStorage.getItem("panacea-theme") as RenderState["theme"]) || "light",
  language: normalizeLocale(localStorage.getItem("panacea-language")),
  selectedRole: (localStorage.getItem("panacea-demo-role") as RenderState["selectedRole"]) || "operator",
  authSession: restoreSession()
};

async function bootstrap() {
  const response = await fetch("/panacea-data.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load Panacea data: HTTP ${response.status}`);
  data = (await response.json()) as AppData;
  state = {
    ...state,
    webConfig: buildWebConfig(data),
    selectedRole: state.authSession?.role ?? state.selectedRole
  };
  window.addEventListener("hashchange", render);
  render();
  if (state.authSession) void refreshLiveStatus();
}

function render() {
  if (!root) return;
  const route = currentRoute();
  document.documentElement.lang = state.language;
  document.documentElement.dir = localeDirection(state.language);
  document.title = state.language === "ar" ? "باناسيا أو إس" : "Panacea OS";
  root.innerHTML = renderApp(data, route, state);
  bindEvents();
  createIcons({ icons });
  void afterRender(route);
}

function currentRoute(): string {
  const route = window.location.hash.replace(/^#/, "");
  return route || defaultRoute;
}

function bindEvents() {
  document.querySelector<HTMLInputElement>("#global-search")?.addEventListener("input", (event) => {
    state = { ...state, globalSearch: (event.target as HTMLInputElement).value };
    render();
  });

  document.querySelector<HTMLButtonElement>("#theme-toggle")?.addEventListener("click", () => {
    state = { ...state, theme: state.theme === "light" ? "dark" : "light" };
    localStorage.setItem("panacea-theme", state.theme);
    render();
  });

  document.querySelector<HTMLSelectElement>("#language-toggle")?.addEventListener("change", (event) => {
    state = { ...state, language: normalizeLocale((event.target as HTMLSelectElement).value) };
    localStorage.setItem("panacea-language", state.language);
    render();
  });

  document.querySelector<HTMLSelectElement>("#demo-role-switcher")?.addEventListener("change", (event) => {
    if (state.authSession) return;
    const selectedRole = (event.target as HTMLSelectElement).value as RenderState["selectedRole"];
    state = { ...state, selectedRole };
    localStorage.setItem("panacea-demo-role", selectedRole);
    window.location.hash = roleDefaultRoute(selectedRole);
  });

  document.querySelector<HTMLFormElement>("#auth-token-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = document.querySelector<HTMLTextAreaElement>("#operator-jwt-token")?.value.trim() ?? "";
    if (!token) {
      state = { ...state, authError: "A Foundation-issued JWT is required for Live Mode.", authValidation: undefined };
      render();
      return;
    }
    const config = state.webConfig ?? buildWebConfig(data);
    state = { ...state, authError: "Validating token against Foundation JWKS...", authValidation: undefined };
    render();
    const validation = await validateTokenWithFoundation(token, config);
    if (!validation.ok || !validation.session) {
      state = { ...state, authError: validation.error ?? "Token validation failed.", authValidation: validation, authSession: undefined };
      render();
      return;
    }
    validation.session.authMode = "operator-jwt";
    persistSession(validation.session);
    lastLiveRoute = "";
    state = {
      ...state,
      authSession: validation.session,
      authError: "",
      authValidation: validation,
      selectedRole: validation.session.role,
      liveWorkspaceState: undefined
    };
    window.location.hash = roleDefaultRoute(validation.session.role);
    render();
    void refreshLiveStatus();
  });

  document.querySelectorAll<HTMLButtonElement>("#logout-button").forEach((button) => {
    button.addEventListener("click", () => {
      const session = state.authSession;
      const config = state.webConfig ?? buildWebConfig(data);
      if (session?.authMode === "provider-login") {
        void logoutFoundationProviderSession(session, config).then((result) => {
          state = { ...state, providerAuthStatus: result.detail };
          render();
        });
      }
      clearSession();
      lastLiveRoute = "";
      state = {
        ...state,
        authSession: undefined,
        authError: "",
        authValidation: undefined,
        providerAuthStatus: session?.authMode === "provider-login" ? "Provider logout requested; local session cleared." : "",
        liveWorkspaceState: undefined,
        auditAppendResult: undefined
      };
      window.location.hash = "/auth/login";
      render();
    });
  });

  document.querySelector<HTMLFormElement>("#provider-login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const config = state.webConfig ?? buildWebConfig(data);
    const username = document.querySelector<HTMLInputElement>("#provider-username")?.value.trim() ?? "";
    const password = document.querySelector<HTMLInputElement>("#provider-password")?.value ?? "";
    const tenantId = document.querySelector<HTMLInputElement>("#provider-tenant")?.value.trim() ?? "";
    if (!username || !password || !tenantId) {
      state = { ...state, authError: "Username, password, and tenant are required for Foundation provider login." };
      render();
      return;
    }
    state = { ...state, authError: "Checking Foundation provider login endpoints...", providerAuthStatus: undefined };
    render();
    const discovery = state.providerLoginDiscovery ?? await discoverFoundationLogin(config);
    if (!discovery.providerHostedLoginAvailable) {
      state = {
        ...state,
        providerLoginDiscovery: discovery,
        authError: "Foundation provider login endpoint is not available. Use Operator JWT mode until the provider exposes login/token endpoints."
      };
      render();
      return;
    }
    state = { ...state, providerLoginDiscovery: discovery, authError: "Signing in with Foundation provider..." };
    render();
    try {
      const result = await loginWithFoundationProvider({ username, password, tenantId }, config);
      if (!result.ok || !result.session) {
        state = { ...state, authError: result.error ?? "Foundation provider login failed.", authValidation: result };
        render();
        return;
      }
      persistSession(result.session);
      lastLiveRoute = "";
      state = {
        ...state,
        authSession: result.session,
        authError: "",
        authValidation: result,
        providerAuthStatus: "Foundation provider login succeeded.",
        selectedRole: result.session.role,
        liveWorkspaceState: undefined
      };
      window.location.hash = roleDefaultRoute(result.session.role);
      render();
      void refreshLiveStatus();
    } catch (error) {
      state = {
        ...state,
        authError: error instanceof Error ? error.message : "Foundation provider login failed.",
        providerAuthStatus: undefined
      };
      render();
    }
  });

  document.querySelector<HTMLButtonElement>("#refresh-provider-session")?.addEventListener("click", async () => {
    const session = state.authSession;
    if (!session) return;
    const config = state.webConfig ?? buildWebConfig(data);
    state = { ...state, providerAuthStatus: "Refreshing Foundation provider session..." };
    render();
    const result = await refreshFoundationProviderSession(session, config);
    if (!result.ok || !result.session) {
      state = { ...state, authError: result.error ?? "Foundation provider refresh failed.", authValidation: result, providerAuthStatus: undefined };
      render();
      return;
    }
    persistSession(result.session);
    state = {
      ...state,
      authSession: result.session,
      authError: "",
      authValidation: result,
      providerAuthStatus: "Foundation provider session refreshed."
    };
    render();
    void refreshLiveStatus();
  });

  document.querySelector<HTMLButtonElement>("#refresh-live-status")?.addEventListener("click", () => {
    void refreshLiveStatus();
  });

  document.querySelector<HTMLButtonElement>("#append-test-audit")?.addEventListener("click", async () => {
    if (!state.authSession || state.authSession.role !== "operator") return;
    const config = state.webConfig ?? buildWebConfig(data);
    const allowlist = buildBrowserApiAllowlist(data, config);
    const result = await appendOperatorAuditTest(state.authSession, config, allowlist);
    state = { ...state, auditAppendResult: result };
    render();
  });

  document.querySelector<HTMLButtonElement>("#discover-foundation-login")?.addEventListener("click", async () => {
    const config = state.webConfig ?? buildWebConfig(data);
    const result = await discoverFoundationLogin(config);
    const allowlist = buildBrowserApiAllowlist(data, config);
    state = {
      ...state,
      providerLoginDiscovery: result,
      apiAllowlistSummary: allowlistSummary(allowlist)
    };
    render();
  });

  document.querySelector<HTMLInputElement>("#api-query")?.addEventListener("input", (event) => {
    state = { ...state, apiQuery: (event.target as HTMLInputElement).value, selectedEndpointKey: "" };
    render();
  });

  document.querySelector<HTMLSelectElement>("#api-method")?.addEventListener("change", (event) => {
    state = { ...state, apiMethod: (event.target as HTMLSelectElement).value, selectedEndpointKey: "" };
    render();
  });

  document.querySelector<HTMLSelectElement>("#api-document")?.addEventListener("change", (event) => {
    state = { ...state, apiDocumentId: (event.target as HTMLSelectElement).value, selectedEndpointKey: "" };
    render();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-endpoint-key]").forEach((button) => {
    button.addEventListener("click", () => {
      state = { ...state, selectedEndpointKey: button.dataset.endpointKey ?? "" };
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-document-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state = { ...state, selectedDocumentId: button.dataset.documentId ?? "" };
      render();
    });
  });

  document.querySelector<HTMLButtonElement>("#probe-foundation")?.addEventListener("click", async () => {
    const button = document.querySelector<HTMLButtonElement>("#probe-foundation");
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i data-lucide="LoaderCircle"></i> Probing';
      createIcons({ icons });
    }
    state = { ...state, foundationProbe: await probeFoundation(data) };
    render();
  });

  document.querySelector<HTMLFormElement>("#live-write-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.authSession) {
      state = {
        ...state,
        authError: "Live write workflows require a Foundation-authenticated session."
      };
      render();
      return;
    }
    const session = state.authSession;
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const route = currentRoute();
    const workspace = workspaceFromRoute(route);
    const page = pageFromRoute(route);
    if (!workspace || !page) return;
    const config = state.webConfig ?? buildWebConfig(data);
    const allowlist = buildBrowserApiAllowlist(data, config);
    const endpoint = state.liveWorkspaceState?.writeEndpoint ?? findWriteWorkflowEndpoint(data, workspace, page, config, route);
    const body = buildWriteWorkflowBody(form, session, workspace.id, page.id);
    state = {
      ...state,
      liveWorkspaceState: {
        endpoint: state.liveWorkspaceState?.endpoint ?? findReadOnlyEndpoint(data, workspace, page, config, route),
        result: state.liveWorkspaceState?.result,
        auditAction: state.liveWorkspaceState?.auditAction,
        writeEndpoint: endpoint,
        writeResult: {
          requestId: "pending",
          method: "POST",
          url: endpoint.url,
          state: "degraded",
          detail: "Submitting live write workflow...",
          checkedAt: new Date().toISOString()
        }
      }
    };
    render();
    const response = await executeWriteWorkflowRequest(endpoint, session, config, allowlist, body);
    state = {
      ...state,
      liveWorkspaceState: {
        endpoint: state.liveWorkspaceState?.endpoint ?? findReadOnlyEndpoint(data, workspace, page, config, route),
        result: state.liveWorkspaceState?.result,
        auditAction: state.liveWorkspaceState?.auditAction,
        writeEndpoint: endpoint,
        writeResult: response.result,
        writeAuditAction: response.auditAction
      },
      lastAuditAction: response.auditAction
    };
    render();
  });
}

async function afterRender(route: string) {
  if (!state.authSession || !isRoleRoute(route) || liveWorkspaceInFlight) return;
  if (route === lastLiveRoute && state.liveWorkspaceState?.result) return;
  const workspace = workspaceFromRoute(route);
  const page = pageFromRoute(route);
  if (!workspace || !page) return;
  const config = state.webConfig ?? buildWebConfig(data);
  const allowlist = buildBrowserApiAllowlist(data, config);
  const endpoint = findReadOnlyEndpoint(data, workspace, page, config, route);
  const writeEndpoint = findWriteWorkflowEndpoint(data, workspace, page, config, route);
  if (route !== lastLiveRoute) {
    lastLiveRoute = route;
    state = { ...state, liveWorkspaceState: { endpoint, writeEndpoint } };
    render();
    return;
  }
  liveWorkspaceInFlight = true;
  const response = await executeReadOnlyRequest(endpoint, state.authSession, config, allowlist);
  liveWorkspaceInFlight = false;
  state = {
    ...state,
    liveWorkspaceState: {
      endpoint,
      writeEndpoint,
      writeResult: state.liveWorkspaceState?.writeResult,
      writeAuditAction: state.liveWorkspaceState?.writeAuditAction,
      result: response.result,
      auditAction: response.auditAction
    },
    lastAuditAction: response.auditAction
  };
  render();
}

function buildWriteWorkflowBody(form: HTMLFormElement, session: NonNullable<RenderState["authSession"]>, workspaceId: string, pageId: string) {
  const formData = new FormData(form);
  const title = String(formData.get("title") ?? "").trim();
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  return {
    tenantId: session.tenantId,
    subjectId: subjectId || undefined,
    title,
    reason,
    idempotencyKey: `web-${workspaceId}-${pageId}-${Date.now()}`,
    payload: {
      workspaceId,
      pageId,
      detail,
      submittedBy: session.subject,
      submittedRole: session.role,
      submittedAt: new Date().toISOString()
    },
    workflowControls: {
      liveMode: true,
      demoData: false,
      auditRequired: true,
      tenantIsolationConfirmed: true,
      humanUserConfirmed: true,
      noAutonomousDiagnosis: true,
      noAutonomousTreatment: true,
      noAiGeneratedClinicalDecision: true,
      patientClinicalRecordModificationBlocked: true,
      documentedMedicationSafetyRulesApplied: true,
      sourceBoundary: "panacea-web-approved-sprint-113-workflow"
    },
    requestContext: {
      client: "panacea-web",
      route: currentRoute(),
      language: state.language
    }
  };
}

async function refreshLiveStatus() {
  state = {
    ...state,
    liveStatus: {
      foundation: [],
      services: [],
      checkedAt: new Date().toISOString()
    }
  };
  render();
  const liveStatus = await pollRuntimeStatus(data, state.webConfig ?? buildWebConfig(data), state.authSession);
  state = { ...state, liveStatus };
  render();
}

bootstrap().catch((error) => {
  if (!root) return;
  root.innerHTML = `
    <main class="load-error">
      <h1>Panacea OS Web Platform</h1>
      <p>${error instanceof Error ? error.message : "Startup failed"}</p>
    </main>
  `;
});
