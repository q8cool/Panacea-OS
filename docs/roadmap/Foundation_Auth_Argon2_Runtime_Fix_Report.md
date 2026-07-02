# Foundation Auth Argon2 Runtime Fix Report

Date: 2026-07-02
Branch: `develop/v4.0`
Scope: Foundation Auth Provider password hashing runtime compatibility

## Final Decision

PASS. The Foundation Auth Provider no longer depends on `crypto.argon2Sync`, which is unavailable on Node.js v22.23.1 on the UTBE server. Password hashing and verification now use the production Argon2 package dependency.

## Runtime Issue

The UTBE server raised:

```text
TypeError: crypto.argon2Sync is not a function
```

Root cause: the previous implementation used a Node.js built-in Argon2 API that is not available in the server's Node.js runtime.

## Fix Implemented

- Added the `argon2` package as the only root runtime dependency.
- Replaced all `crypto.argon2Sync` usage with `argon2.hash` and `argon2.verify`.
- Preserved the required stored hash prefix: `argon2id$`.
- Removed live fallback hashing from plaintext operator password environment values.
- Kept password hashes in external server-only user files.
- Added `npm run foundation:hash-password` for safe password hash generation.
- Updated the recommended users file path to `/etc/panacea/foundation-auth/foundation-users.json`.
- Updated Foundation setup and user provisioning documentation.

## Security Posture

- Plaintext passwords are not stored.
- Real user files remain outside Git.
- The generated hash is Argon2id.
- Login verification uses the same Argon2 library as hash generation.
- Invalid password attempts still return a generic credential error.
- Existing RS256 JWT, JWKS, refresh rotation, logout revoke, tenant, role, and permission behavior remains unchanged.

## New Operator Command

```sh
npm run foundation:hash-password
```

The command prompts for a password without echoing when possible and prints only the Argon2id hash. Operators paste the printed value into:

```text
/etc/panacea/foundation-auth/foundation-users.json
```

## Tests Added Or Updated

- Hash generation produces `argon2id$`.
- Valid password verification succeeds.
- Invalid password verification fails.
- Example sentinel hash values are rejected.
- `foundation-users.json` with valid hashes loads.
- Provider starts with valid config.
- Login succeeds with a valid user.
- Login fails with invalid password.
- Root package identity now allows only the approved `argon2` runtime dependency and no development dependencies.

## Validation Results

| Command | Result |
|---|---|
| `node --test tests/foundation-integration/foundation-auth-provider.test.mjs` | PASS, 17 tests |
| `printf '%s\\n' 'runtime-password-check' \| npm run --silent foundation:hash-password` | PASS, printed `argon2id$...` |
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 155 tests |
| `npm run openapi` | PASS |
| `npm run web:check` | PASS, 60 web tests |
| `npm run web:build` | PASS |
| `npm run quality:gate` | PASS |
| `npm audit --audit-level=moderate` | PASS, 0 vulnerabilities |

The final quality gate included the Argon2 dependency, report, scripts, documentation, and updated tests.

## Deployment Notes

After pulling this commit on the UTBE server:

```sh
npm ci
npm run foundation:hash-password
npm run foundation:auth-provider
```

The Foundation Auth Provider process should start without the previous `crypto.argon2Sync` runtime error.

## Clinical Boundary

This change only fixes Foundation authentication password hashing. It does not add healthcare features, clinical behavior, diagnosis, treatment recommendations, or AI capabilities.
