# Version 3 API Reference

## OpenAPI Bundle

The Version 3 RC OpenAPI bundle is stored in `docs/contracts/openapi`.

| Platform | Base Path | Paths | Events |
| --- | --- | ---: | ---: |
| AI Assurance, Safety and Model Risk | `/api/v3/global-ai-assurance` | 59 | 12 |
| Compliance Automation and Regulatory Intelligence | `/api/v3/global-compliance` | 48 | 10 |
| Customer Success, Support and Service Management | `/api/v3/global-customer-success` | 52 | 11 |
| Privacy, Consent and Trust | `/api/v3/global-privacy` | 50 | 10 |
| Legal, Contracting, Risk and Governance | `/api/v3/global-legal-governance` | 58 | 11 |
| Product Management, Roadmap and Innovation Portfolio | `/api/v3/global-product-management` | 52 | 10 |
| Workforce, HR, Credentialing and Staff Experience | `/api/v3/global-workforce` | 52 | 11 |

## Common Endpoint Pattern

Each tracked v3 service exposes:

- `GET /live`
- `GET /ready`
- `GET /metrics`
- `GET /docs/openapi.json`
- `POST /integrations/references`

## Security Contract

All APIs require authenticated identity context, tenant headers, RBAC/ABAC authorization, tenant isolation, audit persistence, and service-specific governance controls.

## Clinical Safety Boundary

No Version 3 RC API introduces autonomous diagnosis, autonomous treatment, or autonomous clinical decisions.
