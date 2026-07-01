# External Server Prerequisite Checklist

Date: 2026-07-01
Scope: Panacea OS external controlled pilot server readiness

This checklist prepares a server for controlled pilot deployment only. It is not approval for real clinical production use.

## Operating System

- [ ] Ubuntu Server 22.04 LTS or 24.04 LTS is installed.
- [ ] Security updates are applied.
- [ ] Time synchronization is enabled.
- [ ] Hostname and timezone are set by the operator.

## Capacity Recommendation

Minimum pilot sizing:

- [ ] 4 vCPU
- [ ] 16 GB RAM
- [ ] 120 GB SSD storage
- [ ] Separate encrypted backup storage

Recommended pilot sizing:

- [ ] 8 vCPU
- [ ] 32 GB RAM
- [ ] 250 GB SSD storage
- [ ] Dedicated encrypted backup volume

## Docker

- [ ] Docker Engine 24 or newer is installed.
- [ ] Docker Compose plugin v2 is installed.
- [ ] The deployment user can run Docker through a controlled group or approved sudo path.
- [ ] Docker daemon starts on boot.

## Network And Firewall

- [ ] `443/tcp` is open for HTTPS.
- [ ] `80/tcp` is open only for HTTP redirect and certificate issuance.
- [ ] `22/tcp` is restricted to VPN or approved operator IP ranges.
- [ ] PostgreSQL is not exposed to the public internet.
- [ ] Internal service ports are firewalled from public access unless explicitly proxied.

## DNS And HTTPS

- [ ] Web domain points to the server.
- [ ] API domain points to the server.
- [ ] TLS certificates are issued for both domains.
- [ ] Certificate renewal is automated or documented.
- [ ] Reverse proxy configuration is reviewed before reload.

## Backup And Monitoring

- [ ] Encrypted backup storage is available.
- [ ] Backup retention policy is documented.
- [ ] Restore rehearsal is scheduled before pilot opening.
- [ ] System monitoring is configured.
- [ ] Disk, CPU, memory, container health, and database growth alerts are recommended.

## Access Control

- [ ] SSH access is limited to named operators.
- [ ] Password SSH login is disabled where policy permits.
- [ ] Non-root deployment user is preferred.
- [ ] Secrets are stored outside Git.
- [ ] Operator access is logged.

## Final Gate

The server is ready for Panacea OS pilot installation only after every required prerequisite is reviewed and accepted by the deployment owner.
