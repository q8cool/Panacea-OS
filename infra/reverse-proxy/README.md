# Panacea OS Reverse Proxy Readiness

This directory contains Nginx examples for external controlled pilots. The UTBE pilot uses `nginx.utbe.panacea.conf`; the generic `nginx.panacea.example.conf` remains a domain-neutral reference only. These files do not include real certificates, private keys, or credentials.

## Required Operator Inputs

- Web domain: `panacea.utbe.ai`
- API domain: `api.panacea.utbe.ai`
- TLS certificate path
- TLS private key path
- Approved CORS origins
- Firewall rules allowing inbound `443` and restricted operator access to `22`
- Foundation Provider URLs and issuer values in the environment

## Recommended Topology

```text
browser -> HTTPS reverse proxy -> Panacea web frontend
browser -> HTTPS reverse proxy -> Panacea API services
operator -> SSH/VPN -> server management only
```

## Apply

Copy `nginx.utbe.panacea.conf` into the server Nginx configuration after confirming certificate paths:

```bash
sudo cp infra/reverse-proxy/nginx.utbe.panacea.conf /etc/nginx/sites-available/panacea-utbe.conf
sudo ln -sfn /etc/nginx/sites-available/panacea-utbe.conf /etc/nginx/sites-enabled/panacea-utbe.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Validation

```bash
curl -I https://panacea.utbe.ai/
curl -I https://api.panacea.utbe.ai/api/v4/global-command-intelligence/live
curl -I https://api.panacea.utbe.ai/api/v4/global-command-intelligence/ready
curl -I https://api.panacea.utbe.ai/api/v4/global-command-intelligence/docs/openapi.json
```

## Security Notes

- HTTPS is required for external pilot access.
- CORS must be restricted to approved web origins.
- Do not expose PostgreSQL to the public internet.
- Do not place secrets in this Nginx configuration.
- Keep request and proxy timeouts explicit so failed upstreams are visible.
