import type { PanaceaWebConfig } from "./types";

export type ProviderLoginEndpointKind =
  | "openidConfiguration"
  | "oauthAuthorize"
  | "authorize"
  | "login"
  | "token"
  | "refresh"
  | "logout"
  | "me";

export interface ProviderLoginEndpointCheck {
  kind: ProviderLoginEndpointKind;
  label: string;
  url: string;
  status: "available" | "missing" | "unavailable";
  httpStatus?: number;
  detail: string;
  checkedAt: string;
}

export interface ProviderLoginDiscoveryResult {
  providerHostedLoginAvailable: boolean;
  checkedAt: string;
  checks: ProviderLoginEndpointCheck[];
  recommendation: string;
}

const DISCOVERY_PATHS: Array<{ kind: ProviderLoginEndpointKind; label: string; path: string }> = [
  { kind: "openidConfiguration", label: "OpenID configuration", path: "/.well-known/openid-configuration" },
  { kind: "oauthAuthorize", label: "OAuth authorize", path: "/oauth/authorize" },
  { kind: "authorize", label: "Authorize", path: "/authorize" },
  { kind: "login", label: "Login", path: "/api/v1/auth/login" },
  { kind: "token", label: "Token", path: "/api/v1/auth/token" },
  { kind: "refresh", label: "Refresh", path: "/api/v1/auth/refresh" },
  { kind: "logout", label: "Logout", path: "/api/v1/auth/logout" },
  { kind: "me", label: "Current user", path: "/api/v1/auth/me" }
];

export function providerLoginDiscoveryTargets(config: PanaceaWebConfig): ProviderLoginEndpointCheck[] {
  return DISCOVERY_PATHS.map((target) => ({
    kind: target.kind,
    label: target.label,
    url: `${config.FOUNDATION_BASE_URL}${target.path}`,
    status: "unavailable",
    detail: "Not checked yet",
    checkedAt: ""
  }));
}

export async function discoverFoundationLogin(
  config: PanaceaWebConfig,
  fetchImpl: typeof fetch = fetch
): Promise<ProviderLoginDiscoveryResult> {
  const checks = await Promise.all(
    providerLoginDiscoveryTargets(config).map(async (target) => {
      try {
        const method = discoveryMethod(target.kind);
        const response = await fetchImpl(target.url, {
          method,
          mode: "cors",
          cache: "no-store"
        });
        const text = await response.text();
        const available = isAvailableDiscoveryResponse(target.kind, response.status);
        return {
          ...target,
          status: available ? "available" as const : response.status === 404 ? "missing" as const : "unavailable" as const,
          httpStatus: response.status,
          detail: available ? discoveryDetail(target.kind, text, method) : `HTTP ${response.status}`,
          checkedAt: new Date().toISOString()
        };
      } catch (error) {
        return {
          ...target,
          status: "unavailable" as const,
          detail: error instanceof Error ? error.message : "Discovery request failed",
          checkedAt: new Date().toISOString()
        };
      }
    })
  );
  const providerHostedLoginAvailable = checks.some((check) => ["login", "token"].includes(check.kind) && check.status === "available");
  return {
    providerHostedLoginAvailable,
    checkedAt: new Date().toISOString(),
    checks,
    recommendation: providerHostedLoginAvailable
      ? "Foundation provider login endpoints are available. Use provider login for Live Mode or Operator JWT mode for issued test tokens."
      : "Provider-hosted login endpoints are not available. Continue Operator JWT mode and require a Foundation-issued test token workflow."
  };
}

function discoveryMethod(kind: ProviderLoginEndpointKind): "GET" | "OPTIONS" {
  return ["login", "token", "refresh", "logout"].includes(kind) ? "OPTIONS" : "GET";
}

function isAvailableDiscoveryResponse(kind: ProviderLoginEndpointKind, status: number): boolean {
  if (["login", "token", "refresh", "logout"].includes(kind)) {
    return [200, 204, 401, 405].includes(status);
  }
  if (kind === "me") {
    return [200, 401, 403].includes(status);
  }
  return status >= 200 && status < 300;
}

function discoveryDetail(kind: ProviderLoginEndpointKind, body: string, method: string): string {
  if (kind === "openidConfiguration") {
    try {
      const parsed = JSON.parse(body) as { authorization_endpoint?: string; token_endpoint?: string; issuer?: string };
      const fields = [parsed.issuer && "issuer", parsed.authorization_endpoint && "authorization_endpoint", parsed.token_endpoint && "token_endpoint"].filter(Boolean);
      return fields.length ? `OpenID metadata contains ${fields.join(", ")}` : "OpenID metadata returned without authorization metadata";
    } catch {
      return "OpenID metadata was not JSON";
    }
  }
  if (method === "OPTIONS") {
    return "CORS preflight is available for this auth endpoint";
  }
  return body.trim() ? "Endpoint responded" : "Endpoint responded with an empty body";
}
