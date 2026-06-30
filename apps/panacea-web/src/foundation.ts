import type { AppData } from "./types";

export type FoundationCheckName = "health" | "readiness" | "metrics" | "jwks";

export interface FoundationEndpointCheck {
  name: FoundationCheckName;
  label: string;
  url: string;
  required: boolean;
  status: "pending" | "pass" | "fail" | "blocked";
  httpStatus?: number;
  detail: string;
  durationMs?: number;
}

export interface FoundationProbeResult {
  overall: "pass" | "degraded" | "blocked";
  checkedAt: string;
  checks: FoundationEndpointCheck[];
}

export function foundationChecks(data: AppData): FoundationEndpointCheck[] {
  return [
    { name: "health", label: "Health", url: data.foundation.healthUrl, required: true, status: "pending", detail: "Not checked yet" },
    { name: "readiness", label: "Readiness", url: data.foundation.readinessUrl, required: true, status: "pending", detail: "Not checked yet" },
    { name: "metrics", label: "Metrics", url: data.foundation.metricsUrl, required: false, status: "pending", detail: "Not checked yet" },
    { name: "jwks", label: "JWKS", url: data.foundation.jwksUrl, required: true, status: "pending", detail: "Not checked yet" }
  ];
}

export async function probeFoundation(data: AppData, fetchImpl: typeof fetch = fetch): Promise<FoundationProbeResult> {
  const checks = await Promise.all(
    foundationChecks(data).map(async (check) => {
      const started = performance.now();
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 5000);
        const response = await fetchImpl(check.url, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          signal: controller.signal
        });
        window.clearTimeout(timeout);
        const durationMs = Math.round(performance.now() - started);
        if (!response.ok) {
          return {
            ...check,
            status: "fail" as const,
            httpStatus: response.status,
            durationMs,
            detail: `HTTP ${response.status}`
          };
        }
        const body = await response.text();
        return {
          ...check,
          status: "pass" as const,
          httpStatus: response.status,
          durationMs,
          detail: check.name === "jwks" ? jwksDetail(body) : safeResponseDetail(body)
        };
      } catch (error) {
        return {
          ...check,
          status: "blocked" as const,
          detail: error instanceof Error ? error.message : "Browser probe could not reach endpoint"
        };
      }
    })
  );

  const required = checks.filter((check) => check.required);
  const requiredPassed = required.every((check) => check.status === "pass");
  const requiredBlocked = required.some((check) => check.status === "blocked");
  return {
    overall: requiredPassed ? "pass" : requiredBlocked ? "blocked" : "degraded",
    checkedAt: new Date().toISOString(),
    checks
  };
}

function safeResponseDetail(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "HTTP 200 with empty response";
  return trimmed.length > 160 ? `${trimmed.slice(0, 160)}...` : trimmed;
}

function jwksDetail(body: string): string {
  try {
    const parsed = JSON.parse(body) as { keys?: unknown[] };
    const count = Array.isArray(parsed.keys) ? parsed.keys.length : 0;
    return count > 0 ? `Valid JWKS structure with ${count} key(s)` : "JWKS response did not include public keys";
  } catch {
    return "JWKS response was not valid JSON";
  }
}
