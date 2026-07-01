# Foundation Routing Fix Report

Sprint: 108
Date: 2026-07-01

## Decision

PARTIAL.

The repository-local Foundation auth provider now supports HEAD for existing read endpoints and already supports OPTIONS preflight, OpenID discovery, auth login/token/refresh/logout/me, audit append, and policy evaluation routes. The live deployed `https://foundation.utbe.ai` provider still returns 404 for HEAD and auth/audit/policy discovery routes, so remote deployment/routing remains required.

## Repository Provider Changes

| Route | Method | Status |
| --- | --- | --- |
| `/health` | HEAD | Implemented locally |
| `/ready` | HEAD | Implemented locally |
| `/metrics` | HEAD | Implemented locally |
| `/.well-known/jwks.json` | HEAD | Implemented locally |
| `/.well-known/openid-configuration` | GET | Existing local support |
| `/api/v1/auth/login` | OPTIONS/POST | Existing local support |
| `/api/v1/audit-records` | OPTIONS/POST | Existing local support |
| `/api/v1/policy/evaluate` | OPTIONS/POST | Existing local support |

## Live Remote Observations

| Probe | Result |
| --- | --- |
| `curl -I https://foundation.utbe.ai/health` | HTTP 404 |
| `curl -I https://foundation.utbe.ai/ready` | HTTP 404 |
| `curl -I https://foundation.utbe.ai/.well-known/jwks.json` | HTTP 404 |
| `curl https://foundation.utbe.ai/health` | HTTP 200 |
| `curl https://foundation.utbe.ai/ready` | HTTP 200 |
| `curl https://foundation.utbe.ai/.well-known/jwks.json` | HTTP 200 |
| `GET /.well-known/openid-configuration` | HTTP 404 |
| `OPTIONS /api/v1/auth/login` | HTTP 404 |
| `OPTIONS /api/v1/audit-records` | HTTP 404 |
| `OPTIONS /api/v1/policy/evaluate` | HTTP 404 |

## Required Operator Action

Deploy or route the updated repository Foundation auth provider behind `foundation.utbe.ai` before marking live provider login and remote audit/policy preflight as fixed.
