import { CommandAuthorizationError, validatePrincipal } from "../domain/command-validation.mjs";

function splitHeader(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export class HeaderCommandAuthenticator {
  authenticate(request) {
    const headers = request.headers ?? {};
    const principal = {
      tenantId: headers["x-tenant-id"],
      actorId: headers["x-actor-id"],
      subjectType: headers["x-subject-type"] ?? "user",
      permissions: splitHeader(headers["x-permissions"]),
      roles: splitHeader(headers["x-roles"]),
      countryCodes: splitHeader(headers["x-country-codes"]),
      regionCodes: splitHeader(headers["x-region-codes"])
    };
    try {
      return validatePrincipal(principal);
    } catch (error) {
      throw new CommandAuthorizationError("request is not authenticated", { reason: error.message });
    }
  }
}

export function createHeaderCommandAuthenticator() {
  return new HeaderCommandAuthenticator();
}
