# Domain And DNS Setup Guide

Date: 2026-07-01
Scope: External controlled pilot deployment readiness

This guide prepares DNS and HTTPS for a controlled pilot. It does not approve real clinical production use.

## Recommended Hostnames

Use example-only placeholders until the operator assigns the approved pilot domain:

```text
panacea.utbe.ai
api.panacea.utbe.ai
```

## DNS Records

Create an `A` record for the web application:

```text
panacea.utbe.ai -> <SERVER_PUBLIC_IP>
```

Create an `A` record for the API reverse proxy:

```text
api.panacea.utbe.ai -> <SERVER_PUBLIC_IP>
```

Optional `CNAME` records may point regional names to the approved canonical names:

```text
pilot.panacea.utbe.ai -> panacea.utbe.ai
pilot-api.panacea.utbe.ai -> api.panacea.utbe.ai
```

## TLS Certificate

Issue TLS certificates for both hostnames:

```text
panacea.utbe.ai
api.panacea.utbe.ai
```

The Nginx example expects certificate and key paths to be replaced by the operator:

```text
/etc/letsencrypt/live/panacea.utbe.ai/fullchain.pem
/etc/letsencrypt/live/panacea.utbe.ai/privkey.pem
/etc/letsencrypt/live/api.panacea.utbe.ai/fullchain.pem
/etc/letsencrypt/live/api.panacea.utbe.ai/privkey.pem
```

## Firewall Ports

Allow:

- `443/tcp` for HTTPS
- `80/tcp` only for HTTP-to-HTTPS redirect and certificate challenges
- `22/tcp` only from approved operator IP ranges or VPN

Do not expose PostgreSQL publicly.

## Environment Differences

| Environment | Web URL | API URL | Data use |
|---|---|---|---|
| Local | `http://localhost:5174` | service-specific localhost ports | local validation data only |
| Pilot | `https://panacea.utbe.ai` | `https://api.panacea.utbe.ai` | controlled pilot data only after approval |
| Production | approved production domain | approved production API domain | real data only after legal, clinical, privacy, and security approval |

## Validation

```bash
dig panacea.utbe.ai
dig api.panacea.utbe.ai
curl -I https://panacea.utbe.ai/
curl -I https://api.panacea.utbe.ai/api/v4/global-command-intelligence/live
```

The expected API health response is HTTP `200` from live, ready, metrics, and OpenAPI endpoints listed in `docs/operations/Pilot_Service_Health_Matrix.json`.
