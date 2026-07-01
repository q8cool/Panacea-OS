# External Health Verification Commands

Status: controlled external pilot command template
Scope: public HTTPS route verification through the operator reverse proxy
Clinical status: not approved for real clinical production use

Replace `https://api.panacea.utbe.ai` with the approved pilot API domain. Do not place credentials or patient data in these commands.

## Expected Results

For every active service:

- Live endpoint returns HTTP 200.
- Ready endpoint returns HTTP 200.
- Metrics endpoint returns HTTP 200.
- OpenAPI endpoint returns HTTP 200.
- TLS validation succeeds without `--insecure`.

## Live Endpoint Commands

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/global-command-intelligence/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-workforce/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-legal-governance/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-customer-success/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-product-management/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-compliance/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-ai-assurance/live
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-privacy/live
```

## Ready Endpoint Commands

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/global-command-intelligence/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-workforce/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-legal-governance/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-customer-success/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-product-management/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-compliance/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-ai-assurance/ready
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-privacy/ready
```

## Metrics Endpoint Commands

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/global-command-intelligence/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-workforce/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-legal-governance/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-customer-success/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-product-management/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-compliance/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-ai-assurance/metrics
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-privacy/metrics
```

## OpenAPI Endpoint Commands

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v4/global-command-intelligence/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-workforce/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-legal-governance/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-customer-success/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-product-management/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-compliance/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-ai-assurance/docs/openapi.json
curl -fsS -o /dev/null -w "%{http_code}\n" https://api.panacea.utbe.ai/api/v3/global-privacy/docs/openapi.json
```

## TLS And Header Verification

```bash
curl -Iv https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live
curl -fsS https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/metrics | head
```

Expected:

- TLS certificate is valid.
- No secret values appear in headers or metrics.
- Public routes map to the correct internal service route.

## Final Boundary

These commands verify controlled pilot connectivity only.

Not approved for real clinical production use.
