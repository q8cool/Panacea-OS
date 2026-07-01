import { validateTokenWithFoundation } from "./auth";
import type { AuthSession, PanaceaWebConfig, TokenValidationResult } from "./types";

export interface FoundationLoginRequest {
  username: string;
  password: string;
  tenantId: string;
}

export interface FoundationAuthUser {
  id?: string;
  userId?: string;
  username: string;
  roles: string[];
  permissions?: string[];
  tenantId: string;
}

export interface FoundationAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  user: FoundationAuthUser;
}

export interface FoundationAuthClientResult {
  ok: boolean;
  session?: AuthSession;
  error?: string;
  warnings: string[];
}

export interface FoundationLogoutResult {
  ok: boolean;
  detail: string;
}

export function providerAuthEndpoints(config: PanaceaWebConfig) {
  return {
    discovery: `${config.FOUNDATION_BASE_URL}/.well-known/openid-configuration`,
    login: `${config.FOUNDATION_BASE_URL}/api/v1/auth/login`,
    token: `${config.FOUNDATION_BASE_URL}/api/v1/auth/token`,
    refresh: `${config.FOUNDATION_BASE_URL}/api/v1/auth/refresh`,
    logout: `${config.FOUNDATION_BASE_URL}/api/v1/auth/logout`,
    me: `${config.FOUNDATION_BASE_URL}/api/v1/auth/me`
  };
}

export async function loginWithFoundationProvider(
  request: FoundationLoginRequest,
  config: PanaceaWebConfig,
  fetchImpl: typeof fetch = fetch
): Promise<FoundationAuthClientResult> {
  const endpoints = providerAuthEndpoints(config);
  const response = await postJson<FoundationAuthResponse>(fetchImpl, endpoints.login, request);
  return sessionFromProviderResponse(response, config, fetchImpl);
}

export async function refreshFoundationProviderSession(
  session: AuthSession,
  config: PanaceaWebConfig,
  fetchImpl: typeof fetch = fetch
): Promise<FoundationAuthClientResult> {
  if (!session.refreshToken) {
    return { ok: false, warnings: [], error: "Provider refresh requires a refresh token." };
  }
  const endpoints = providerAuthEndpoints(config);
  const response = await postJson<FoundationAuthResponse>(fetchImpl, endpoints.refresh, {
    refreshToken: session.refreshToken
  });
  return sessionFromProviderResponse(response, config, fetchImpl);
}

export async function logoutFoundationProviderSession(
  session: AuthSession,
  config: PanaceaWebConfig,
  fetchImpl: typeof fetch = fetch
): Promise<FoundationLogoutResult> {
  if (!session.refreshToken) {
    return { ok: true, detail: "Local session cleared; no provider refresh token was present." };
  }
  const endpoints = providerAuthEndpoints(config);
  try {
    await postJson(fetchImpl, endpoints.logout, { refreshToken: session.refreshToken });
    return { ok: true, detail: "Provider logout accepted and local session cleared." };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Provider logout failed; local session cleared."
    };
  }
}

async function sessionFromProviderResponse(
  response: FoundationAuthResponse,
  config: PanaceaWebConfig,
  fetchImpl: typeof fetch
): Promise<FoundationAuthClientResult> {
  if (!response.accessToken || response.tokenType !== "Bearer") {
    return { ok: false, warnings: [], error: "Foundation login response did not include a Bearer access token." };
  }
  const validation = await validateTokenWithFoundation(response.accessToken, config, fetchImpl);
  if (!validation.ok || !validation.session) {
    return validation;
  }
  const session: AuthSession = {
    ...validation.session,
    refreshToken: response.refreshToken,
    tokenType: response.tokenType,
    authMode: "provider-login"
  };
  return {
    ok: true,
    session,
    warnings: validation.warnings
  };
}

async function postJson<T>(fetchImpl: typeof fetch, url: string, body: unknown): Promise<T> {
  const response = await fetchImpl(url, {
    method: "POST",
    mode: "cors",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  const parsed = (text.trim() ? JSON.parse(text) : {}) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof parsed.message === "string" ? parsed.message : `Foundation auth request failed with HTTP ${response.status}.`;
    throw new Error(message);
  }
  return parsed as T;
}
