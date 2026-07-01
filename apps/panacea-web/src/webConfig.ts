import type { AppData, PanaceaWebConfig } from "./types";

type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | boolean | undefined>;
};

type WindowWithPanaceaConfig = Window & {
  PANACEA_WEB_CONFIG?: Partial<Record<keyof PanaceaWebConfig, string | boolean | number>>;
};

const FOUNDATION_BASE_URL = "https://foundation.utbe.ai";

export function buildWebConfig(data: AppData): PanaceaWebConfig {
  const runtime = typeof window === "undefined" ? {} : (window as WindowWithPanaceaConfig).PANACEA_WEB_CONFIG ?? {};
  const env = ((import.meta as ImportMetaWithEnv).env ?? {}) as Record<string, string | boolean | undefined>;

  const foundationBase = cleanUrl(
    readSetting("FOUNDATION_BASE_URL", runtime, env) ||
      readSetting("VITE_FOUNDATION_BASE_URL", runtime, env) ||
      data.foundation.baseUrl ||
      FOUNDATION_BASE_URL
  );

  return {
    FOUNDATION_BASE_URL: foundationBase,
    FOUNDATION_HEALTH_URL: endpointSetting("FOUNDATION_HEALTH_URL", "/health", foundationBase, data.foundation.healthUrl, runtime, env),
    FOUNDATION_READY_URL: endpointSetting("FOUNDATION_READY_URL", "/ready", foundationBase, data.foundation.readinessUrl, runtime, env),
    FOUNDATION_METRICS_URL: endpointSetting("FOUNDATION_METRICS_URL", "/metrics", foundationBase, data.foundation.metricsUrl, runtime, env),
    FOUNDATION_JWKS_URL: endpointSetting("FOUNDATION_JWKS_URL", "/.well-known/jwks.json", foundationBase, data.foundation.jwksUrl, runtime, env),
    FOUNDATION_JWT_ISSUER: cleanUrl(readSetting("FOUNDATION_JWT_ISSUER", runtime, env) || foundationBase),
    FOUNDATION_AUDIT_APPEND_URL: endpointSetting("FOUNDATION_AUDIT_APPEND_URL", "/api/v1/audit-records", foundationBase, data.foundation.auditAppendUrl, runtime, env),
    FOUNDATION_POLICY_URL: endpointSetting("FOUNDATION_POLICY_URL", "/api/v1/policy/evaluate", foundationBase, data.foundation.policyUrl, runtime, env),
    PANACEA_API_BASE_URL: cleanUrl(readSetting("PANACEA_API_BASE_URL", runtime, env) || readSetting("VITE_PANACEA_API_BASE_URL", runtime, env) || "http://localhost"),
    PANACEA_WEB_MODE: readSetting("PANACEA_WEB_MODE", runtime, env) === "live" ? "live" : "demo",
    PANACEA_DEFAULT_TENANT: readSetting("PANACEA_DEFAULT_TENANT", runtime, env) || readSetting("VITE_PANACEA_DEFAULT_TENANT", runtime, env) || "demo-tenant",
    PANACEA_ENABLE_DEMO_MODE: readBoolean("PANACEA_ENABLE_DEMO_MODE", runtime, env, true),
    PANACEA_REQUEST_TIMEOUT_MS: readNumber("PANACEA_REQUEST_TIMEOUT_MS", runtime, env, 5000)
  };
}

export function missingLiveConfig(config: PanaceaWebConfig): string[] {
  return ([
    "FOUNDATION_BASE_URL",
    "FOUNDATION_HEALTH_URL",
    "FOUNDATION_READY_URL",
    "FOUNDATION_JWKS_URL",
    "FOUNDATION_JWT_ISSUER",
    "PANACEA_API_BASE_URL",
    "PANACEA_DEFAULT_TENANT"
  ] as const).filter((key) => !String(config[key] ?? "").trim());
}

function endpointSetting(
  key: keyof PanaceaWebConfig,
  path: string,
  foundationBase: string,
  generatedValue: string,
  runtime: WindowWithPanaceaConfig["PANACEA_WEB_CONFIG"],
  env: Record<string, string | boolean | undefined>
): string {
  return cleanUrl(readSetting(key, runtime, env) || readSetting(`VITE_${key}`, runtime, env) || generatedValue || `${foundationBase}${path}`);
}

function readSetting(
  key: string,
  runtime: WindowWithPanaceaConfig["PANACEA_WEB_CONFIG"],
  env: Record<string, string | boolean | undefined>
): string {
  const runtimeValue = runtime?.[key as keyof PanaceaWebConfig];
  if (typeof runtimeValue === "string") return runtimeValue.trim();
  if (typeof runtimeValue === "number" || typeof runtimeValue === "boolean") return String(runtimeValue);
  const envValue = env[key] ?? env[`VITE_${key}`];
  return typeof envValue === "string" ? envValue.trim() : "";
}

function readBoolean(
  key: string,
  runtime: WindowWithPanaceaConfig["PANACEA_WEB_CONFIG"],
  env: Record<string, string | boolean | undefined>,
  fallback: boolean
): boolean {
  const value = readSetting(key, runtime, env);
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readNumber(
  key: string,
  runtime: WindowWithPanaceaConfig["PANACEA_WEB_CONFIG"],
  env: Record<string, string | boolean | undefined>,
  fallback: number
): number {
  const value = Number(readSetting(key, runtime, env));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function cleanUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}
