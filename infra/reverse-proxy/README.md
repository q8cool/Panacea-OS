# Panacea OS Reverse Proxy Readiness

This directory contains an Nginx example for an external controlled pilot. It is an operator template only and does not include real certificates, private keys, domains, or credentials.

## Required Operator Inputs

- Web domain, for example `panacea.example.com`
- API domain, for example `api.panacea.example.com`
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

Copy `nginx.panacea.example.conf` into the server Nginx configuration after replacing all example domains and certificate paths:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Validation

```bash
curl -I https://panacea.example.com/
curl -I https://api.panacea.example.com/api/v4/global-command-intelligence/live
curl -I https://api.panacea.example.com/api/v4/global-command-intelligence/ready
curl -I https://api.panacea.example.com/api/v4/global-command-intelligence/docs/openapi.json
```

## Security Notes

- HTTPS is required for external pilot access.
- CORS must be restricted to approved web origins.
- Do not expose PostgreSQL to the public internet.
- Do not place secrets in this Nginx configuration.
- Keep request and proxy timeouts explicit so failed upstreams are visible.
