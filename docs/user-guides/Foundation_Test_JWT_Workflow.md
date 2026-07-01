# Foundation Test JWT Workflow

## Purpose

Live Data Mode requires a real Foundation-issued JWT. This guide defines the safe test-token workflow required for full browser validation.

## Current Status

Foundation can publish JWKS, health, and readiness endpoints, but no token issuance endpoint is currently available.

Status: OPERATOR ACTION REQUIRED.

## Required Test Token Claims

The test JWT must include:

```json
{
  "iss": "https://foundation.utbe.ai",
  "sub": "test-user-subject",
  "exp": 1893456000,
  "tenant_id": "test-tenant",
  "roles": ["operator"],
  "permissions": ["read"]
}
```

Supported role claim values:

| Role claim | Workspace |
|---|---|
| `doctor`, `clinician`, `physician`, `provider` | Doctor / Clinician |
| `patient` | Patient Portal |
| `laboratory`, `lab`, `lab-user` | Laboratory |
| `radiology`, `radiologist`, `imaging` | Radiology |
| `pharmacy`, `pharmacist` | Pharmacy |
| `administrator`, `admin` | Administration |
| `operator`, `support`, `platform-operator` | Operator |

## Safe Issuance Options

Recommended options:

1. Foundation admin issues a short-lived RS256 signed test token.
2. Foundation exposes a protected admin-only test token endpoint.
3. Foundation publishes OpenID/OAuth login endpoints for browser redirect login.

The token must be signed by a key published through:

```text
https://foundation.utbe.ai/.well-known/jwks.json
```

## Browser Validation Steps

1. Open `http://localhost:5174/#/auth/login`.
2. Paste the Foundation-issued JWT.
3. Validate token.
4. Confirm role, tenant, permissions, issuer, and expiry.
5. Open `#/command/live-status`.
6. Refresh live status.
7. Open the role workspace selected from claims.

## Expected Results

- Valid token enters Live Mode.
- Expired token is rejected.
- Missing tenant claim is rejected.
- Unsupported role claim is rejected.
- Wrong issuer is rejected.
- Signature mismatch is rejected.

## Boundary

Do not include PHI in test tokens.

Do not use long-lived production credentials for browser validation.
