# Auth Token Claims

Foundation access tokens used by Panacea Web Live Mode must be RS256-signed JWTs.

## Required Claims

| Claim | Purpose |
|---|---|
| `iss` | Must equal `https://foundation.utbe.ai` |
| `sub` | Subject identifier |
| `aud` | Intended audience, typically `panacea-web` |
| `exp` | Expiry as Unix seconds |
| `iat` | Issued-at timestamp |
| `tenantId` | Tenant scope |
| `roles` | Role list |
| `permissions` | Permission list |
| `userId` | User identifier |
| `username` | Operator or user name |

The browser also accepts legacy tenant claim forms `tenant_id` and `tid` for compatibility.

## Supported Role Mapping

| Claim value | Workspace |
|---|---|
| `operator`, `support`, `platform-operator` | Operator |
| `administrator`, `admin` | Administrator |
| `doctor`, `clinician`, `physician`, `provider` | Doctor / clinician |
| `patient` | Patient |
| `laboratory`, `lab`, `lab-user` | Laboratory |
| `radiology`, `radiologist`, `imaging` | Radiology |
| `pharmacy`, `pharmacist` | Pharmacy |

## Signing

Only RS256 is accepted by the browser validator.

The JWT header must include:

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "foundation-auth-key-1"
}
```

The `kid` must match a public key in:

```text
https://foundation.utbe.ai/.well-known/jwks.json
```

## Data Safety

Do not place PHI, passwords, refresh tokens, private keys, or secrets inside JWT claims.
