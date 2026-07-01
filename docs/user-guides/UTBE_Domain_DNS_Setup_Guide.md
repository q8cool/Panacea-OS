# UTBE Domain DNS Setup Guide

Status: controlled external pilot DNS guide
Domain: `utbe.ai`
Web UI: `panacea.utbe.ai`
API: `api.panacea.utbe.ai`
Clinical status: not approved for real clinical production use

Use the real server public IP only in the DNS provider console. Do not commit server credentials or secrets.

## Required DNS Records

If the DNS provider supports zone-relative nested records:

```text
A     panacea       <SERVER_PUBLIC_IP>
A     api.panacea   <SERVER_PUBLIC_IP>
```

If the DNS provider requires full hostnames:

```text
A     panacea.utbe.ai       <SERVER_PUBLIC_IP>
A     api.panacea.utbe.ai   <SERVER_PUBLIC_IP>
```

Expected result:

```text
Both domains resolve to the external pilot server public IP.
```

## Verification Commands

```bash
dig panacea.utbe.ai
dig api.panacea.utbe.ai
nslookup panacea.utbe.ai
nslookup api.panacea.utbe.ai
```

Optional concise check:

```bash
dig +short panacea.utbe.ai
dig +short api.panacea.utbe.ai
```

The returned IP must match the approved external pilot server public IP.

## Operator Checklist

| Item | Expected value | Status | Operator sign-off |
|---|---|---|---|
| Web UI DNS record | `panacea.utbe.ai -> <SERVER_PUBLIC_IP>` | Pending | |
| API DNS record | `api.panacea.utbe.ai -> <SERVER_PUBLIC_IP>` | Pending | |
| DNS propagation checked | both domains resolve | Pending | |
| No wildcard exposure required | explicit records only | Pending | |
| Public IP approved | operator-controlled server | Pending | |

## Boundary

DNS readiness does not approve clinical production use.

Not approved for real clinical production use.
