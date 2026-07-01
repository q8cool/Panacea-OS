# Domain And DNS Setup Guide

Date: 2026-07-01
Scope: External controlled pilot deployment readiness

This guide prepares DNS and HTTPS for a controlled pilot. It does not approve real clinical production use.

## Recommended Hostnames

Use example-only placeholders until the operator assigns the approved pilot domain:

```text
panacea.example.com
api.panacea.example.com
```

## DNS Records

Create an `A` record for the web application:

```text
panacea.example.com -> <SERVER_PUBLIC_IP>
```

Create an `A` record for the API reverse proxy:

```text
api.panacea.example.com -> <SERVER_PUBLIC_IP>
```

Optional `CNAME` records may point regional names to the approved canonical names:

```text
pilot.panacea.example.com -> panacea.example.com
pilot-api.panacea.example.com -> api.panacea.example.com
```

## TLS Certificate

Issue TLS certificates for both hostnames:

```text
panacea.example.com
api.panacea.example.com
```

The Nginx example expects certificate and key paths to be replaced by the operator:

```text
/etc/letsencrypt/live/panacea.example.com/fullchain.pem
/etc/letsencrypt/live/panacea.example.com/privkey.pem
/etc/letsencrypt/live/api.panacea.example.com/fullchain.pem
/etc/letsencrypt/live/api.panacea.example.com/privkey.pem
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
| Pilot | `https://panacea.example.com` | `https://api.panacea.example.com` | controlled pilot data only after approval |
| Production | approved production domain | approved production API domain | real data only after legal, clinical, privacy, and security approval |

## Validation

```bash
dig panacea.example.com
dig api.panacea.example.com
curl -I https://panacea.example.com/
curl -I https://api.panacea.example.com/api/v4/global-command-intelligence/live
```

The expected API health response is HTTP `200` from live, ready, metrics, and OpenAPI endpoints listed in `docs/operations/Pilot_Service_Health_Matrix.json`.
