# Credentialing API

The Credentialing API manages provider credentials, licenses, certifications, privileges, scope of practice, expiration tracking, verification workflows, and credentialing committee review.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-workforce/credentialing/provider-credentials` | Provider Credential Registry |
| `POST /api/v3/global-workforce/credentialing/licenses` | License Management |
| `POST /api/v3/global-workforce/credentialing/certifications` | Certification Tracking |
| `POST /api/v3/global-workforce/credentialing/privileges` | Privilege Management |
| `POST /api/v3/global-workforce/credentialing/scope-of-practice` | Scope of Practice |
| `POST /api/v3/global-workforce/credentialing/expirations` | Credential Expiration Tracking |
| `POST /api/v3/global-workforce/credentialing/verifications` | Credential Verification Workflow |
| `POST /api/v3/global-workforce/credentialing/committee-reviews` | Credentialing Committee Review |

Verification and committee review payloads must include primary source verification, committee review completion, credentialing access verification, human review, and evidence. Credential state changes publish `credential.created`, `credential.verified`, or `credential.expired`.
