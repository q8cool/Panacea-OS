# UTBE HTTPS Certificate Runbook

Status: controlled external pilot HTTPS runbook
Domains: `panacea.utbe.ai`, `api.panacea.utbe.ai`
Clinical status: not approved for real clinical production use

Use only operator-approved certificate issuance. Do not commit certificates, private keys, account keys, or challenge secrets.

## Install Certbot On Ubuntu

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

## Confirm DNS Before Issuing

```bash
dig +short panacea.utbe.ai
dig +short api.panacea.utbe.ai
```

Both domains must resolve to the approved external pilot server public IP.

## Install Nginx UTBE Configuration

```bash
sudo cp infra/reverse-proxy/nginx.utbe.panacea.conf /etc/nginx/sites-available/panacea-utbe.conf
sudo ln -sfn /etc/nginx/sites-available/panacea-utbe.conf /etc/nginx/sites-enabled/panacea-utbe.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Issue Certificates

```bash
sudo certbot --nginx -d panacea.utbe.ai -d api.panacea.utbe.ai
```

Expected certificate paths:

```text
/etc/letsencrypt/live/panacea.utbe.ai/fullchain.pem
/etc/letsencrypt/live/panacea.utbe.ai/privkey.pem
/etc/letsencrypt/live/api.panacea.utbe.ai/fullchain.pem
/etc/letsencrypt/live/api.panacea.utbe.ai/privkey.pem
```

## Renewal Check

```bash
sudo certbot renew --dry-run
```

Expected: renewal simulation succeeds.

## HTTPS Verification

```bash
curl -I https://panacea.utbe.ai
curl -I https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live
```

Expected:

- TLS handshake succeeds.
- No `--insecure` option is required.
- Web UI route responds through HTTPS.
- API live route returns HTTP 200 when the pilot stack is running.

## Boundary

HTTPS readiness does not approve real clinical production use.

Not approved for real clinical production use.
