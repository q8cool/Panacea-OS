# Foundation Login Guide

## Login Model

Panacea Web uses Foundation-backed JWT validation for Live Mode.

If the Foundation Provider does not expose a browser login page, use Operator Token Mode:

1. Obtain a test JWT from the Foundation Provider.
2. Open `http://localhost:5174/#/auth/login`.
3. Paste the JWT.
4. Validate the token.
5. Open the workspace selected from the role claim.

## Required JWT Claims

The token must include:

- `iss`: must match `FOUNDATION_JWT_ISSUER`.
- `exp`: future expiry.
- `sub`: user subject.
- `tenant_id`, `tenantId`, or `tid`: tenant scope.
- `role`, `roles`, `realm_access.roles`, or `resource_access.*.roles`: supported Panacea role.

Supported role mappings:

| Claim value | Workspace |
|---|---|
| `doctor`, `clinician`, `physician`, `provider` | Doctor / Clinician |
| `patient` | Patient Portal |
| `laboratory`, `lab`, `lab-user` | Laboratory |
| `radiology`, `radiologist`, `imaging` | Radiology |
| `pharmacy`, `pharmacist` | Pharmacy |
| `administrator`, `admin` | Administration |
| `operator`, `support`, `platform-operator` | Operator |

## Validation Outcomes

| Outcome | Meaning |
|---|---|
| Live Mode | Token validated against Foundation issuer and JWKS. |
| Invalid token | The JWT is malformed, expired, unsigned, wrong issuer, or unsupported. |
| JWKS unavailable | Foundation discovery could not be reached from the browser. |
| Role missing | The token does not contain a supported Panacea role. |
| Tenant missing | The token does not contain a tenant claim. |

## Logout

Use the logout button in the top bar or login page.

Logout clears the browser session and returns the UI to Demo Mode.
