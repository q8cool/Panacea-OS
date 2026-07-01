import type { AuthSession, PanaceaWebConfig, RoleId, TokenValidationResult } from "./types";

interface JwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

interface JwtClaims {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  name?: string;
  preferred_username?: string;
  email?: string;
  tenant_id?: string;
  tenantId?: string;
  tid?: string;
  role?: string | string[];
  roles?: string[];
  permissions?: string[];
  scope?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
}

interface JwksDocument {
  keys?: JsonWebKeyWithKid[];
}

const SESSION_STORAGE_KEY = "panacea-live-session";

type JsonWebKeyWithKid = JsonWebKey & {
  kid?: string;
};

export function restoreSession(): AuthSession | undefined {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return undefined;
    const session = JSON.parse(raw) as AuthSession;
    return isSessionExpired(session) ? undefined : session;
  } catch {
    return undefined;
  }
}

export function persistSession(session: AuthSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function isSessionExpired(session: AuthSession, now = Date.now()): boolean {
  return new Date(session.expiresAt).getTime() <= now;
}

export function tokenSecondsRemaining(session: AuthSession, now = Date.now()): number {
  return Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - now) / 1000));
}

export function decodeJwt(token: string): { header: JwtHeader; claims: JwtClaims; signingInput: string; signature: Uint8Array } {
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error("JWT must contain header, payload, and signature.");
  }
  return {
    header: JSON.parse(base64UrlDecodeToString(parts[0])) as JwtHeader,
    claims: JSON.parse(base64UrlDecodeToString(parts[1])) as JwtClaims,
    signingInput: `${parts[0]}.${parts[1]}`,
    signature: base64UrlDecodeToBytes(parts[2])
  };
}

export async function validateTokenWithFoundation(
  token: string,
  config: PanaceaWebConfig,
  fetchImpl: typeof fetch = fetch
): Promise<TokenValidationResult> {
  const warnings: string[] = [];
  try {
    const decoded = decodeJwt(token);
    const header = decoded.header;
    const claims = decoded.claims;

    if (!header.alg || header.alg.toLowerCase() === "none") {
      return failure("JWT algorithm must be a signed algorithm.", warnings);
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!claims.exp || claims.exp <= nowSeconds) {
      return failure("JWT is expired or missing an expiry claim.", warnings);
    }

    if (!claims.iss || normalizeIssuer(claims.iss) !== normalizeIssuer(config.FOUNDATION_JWT_ISSUER)) {
      return failure("JWT issuer does not match the configured Foundation issuer.", warnings);
    }

    const role = roleFromClaims(claims);
    if (!role) {
      return failure("JWT does not include a supported Panacea role claim.", warnings);
    }

    const tenantId = tenantFromClaims(claims);
    if (!tenantId) {
      return failure("JWT does not include a tenant claim.", warnings);
    }

    const jwks = await fetchJwks(config.FOUNDATION_JWKS_URL, fetchImpl);
    const key = selectJwk(jwks, header);
    if (!key) {
      return failure("JWKS does not contain a public key for the JWT header.", warnings);
    }

    const verified = await verifySignature(decoded.signingInput, decoded.signature, header, key);
    if (!verified) {
      return failure("JWT signature validation failed.", warnings);
    }

    return {
      ok: true,
      warnings,
      session: {
        token,
        subject: claims.sub || "unknown-subject",
        displayName: claims.name || claims.preferred_username || claims.email || claims.sub || "Authenticated user",
        issuer: claims.iss,
        tenantId,
        role,
        roles: allRolesFromClaims(claims),
        permissions: permissionsFromClaims(claims),
        expiresAt: new Date((claims.exp ?? nowSeconds) * 1000).toISOString(),
        issuedAt: claims.iat ? new Date(claims.iat * 1000).toISOString() : undefined,
        authenticatedAt: new Date().toISOString(),
        tokenHeader: {
          alg: header.alg,
          kid: header.kid
        }
      }
    };
  } catch (error) {
    return failure(error instanceof Error ? error.message : "JWT validation failed.", warnings);
  }
}

export function createSessionFromClaimsForDisplay(token: string, config: PanaceaWebConfig): TokenValidationResult {
  const warnings = ["Display-only claim extraction; signature validation is still required for Live Mode."];
  try {
    const decoded = decodeJwt(token);
    const role = roleFromClaims(decoded.claims);
    const tenantId = tenantFromClaims(decoded.claims);
    if (!role || !tenantId || !decoded.claims.exp || !decoded.claims.iss) {
      return failure("JWT claims are incomplete.", warnings);
    }
    return {
      ok: true,
      warnings,
      session: {
        token,
        subject: decoded.claims.sub || "unknown-subject",
        displayName: decoded.claims.name || decoded.claims.preferred_username || decoded.claims.sub || "Authenticated user",
        issuer: decoded.claims.iss,
        tenantId,
        role,
        roles: allRolesFromClaims(decoded.claims),
        permissions: permissionsFromClaims(decoded.claims),
        expiresAt: new Date(decoded.claims.exp * 1000).toISOString(),
        issuedAt: decoded.claims.iat ? new Date(decoded.claims.iat * 1000).toISOString() : undefined,
        authenticatedAt: new Date().toISOString(),
        tokenHeader: {
          alg: decoded.header.alg || "unknown",
          kid: decoded.header.kid
        }
      }
    };
  } catch (error) {
    return failure(error instanceof Error ? error.message : "JWT claims could not be read.", warnings);
  }
}

async function fetchJwks(url: string, fetchImpl: typeof fetch): Promise<JwksDocument> {
  const response = await fetchImpl(url, { method: "GET", mode: "cors", cache: "no-store" });
  if (!response.ok) throw new Error(`JWKS discovery failed with HTTP ${response.status}.`);
  const body = (await response.json()) as JwksDocument;
  if (!Array.isArray(body.keys) || body.keys.length === 0) {
    throw new Error("JWKS response does not include public keys.");
  }
  return body;
}

function selectJwk(jwks: JwksDocument, header: JwtHeader): JsonWebKeyWithKid | undefined {
  const keys = jwks.keys ?? [];
  return keys.find((key) => header.kid && key.kid === header.kid) ?? keys.find((key) => key.kty === "RSA" && header.alg === "RS256");
}

async function verifySignature(signingInput: string, signature: Uint8Array, header: JwtHeader, key: JsonWebKeyWithKid): Promise<boolean> {
  if (header.alg !== "RS256") {
    throw new Error(`JWT algorithm ${header.alg || "unknown"} is not supported by the browser validator.`);
  }
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("Browser Web Crypto is required for JWT signature validation.");
  const imported = await subtle.importKey(
    "jwk",
    key,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return subtle.verify("RSASSA-PKCS1-v1_5", imported, toArrayBuffer(signature), new TextEncoder().encode(signingInput));
}

function failure(error: string, warnings: string[]): TokenValidationResult {
  return { ok: false, error, warnings };
}

function normalizeIssuer(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function tenantFromClaims(claims: JwtClaims): string {
  return claims.tenant_id || claims.tenantId || claims.tid || "";
}

function roleFromClaims(claims: JwtClaims): RoleId | undefined {
  const values = allRolesFromClaims(claims).map((role) => role.toLowerCase());
  if (values.some((role) => ["doctor", "clinician", "physician", "provider"].includes(role))) return "doctor";
  if (values.some((role) => ["patient"].includes(role))) return "patient";
  if (values.some((role) => ["laboratory", "lab", "lab-user"].includes(role))) return "laboratory";
  if (values.some((role) => ["radiology", "radiologist", "imaging"].includes(role))) return "radiology";
  if (values.some((role) => ["pharmacy", "pharmacist"].includes(role))) return "pharmacy";
  if (values.some((role) => ["administrator", "admin"].includes(role))) return "administrator";
  if (values.some((role) => ["operator", "support", "platform-operator"].includes(role))) return "operator";
  return undefined;
}

function allRolesFromClaims(claims: JwtClaims): string[] {
  const roles = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value.trim()) roles.add(value.trim());
  };
  if (Array.isArray(claims.role)) claims.role.forEach(add);
  else add(claims.role);
  claims.roles?.forEach(add);
  claims.realm_access?.roles?.forEach(add);
  Object.values(claims.resource_access ?? {}).forEach((access) => access.roles?.forEach(add));
  return [...roles];
}

function permissionsFromClaims(claims: JwtClaims): string[] {
  const permissions = new Set<string>();
  claims.permissions?.forEach((permission) => permissions.add(permission));
  claims.scope?.split(/\s+/).filter(Boolean).forEach((scope) => permissions.add(scope));
  return [...permissions];
}

function base64UrlDecodeToString(value: string): string {
  const bytes = base64UrlDecodeToBytes(value);
  return new TextDecoder().decode(bytes);
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
