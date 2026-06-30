import { AiAssuranceAuthorizationError, validatePrincipal } from "../domain/ai-assurance-validation.mjs";

function splitHeader(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export class HeaderAiAssuranceAuthenticator {
  authenticate(request) {
    const headers = request.headers ?? {};
    const principal = {
      tenantId: headers["x-tenant-id"],
      actorId: headers["x-actor-id"],
      subjectType: headers["x-subject-type"] ?? "user",
      permissions: splitHeader(headers["x-permissions"]),
      roles: splitHeader(headers["x-roles"]),
      countryCodes: splitHeader(headers["x-country-codes"])
    };
    try {
      return validatePrincipal(principal);
    } catch (error) {
      throw new AiAssuranceAuthorizationError("request is not authenticated", { reason: error.message });
    }
  }
}

export function createHeaderAiAssuranceAuthenticator() {
  return new HeaderAiAssuranceAuthenticator();
}
