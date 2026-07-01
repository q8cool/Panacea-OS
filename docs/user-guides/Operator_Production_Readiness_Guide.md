# Operator Production Readiness Guide

Date: 2026-07-01

## Readiness Position

Panacea OS is ready for a controlled production-like pilot when all required Sprint 116 commands pass and the operator accepts the remaining pilot conditions. This is not an unrestricted production clinical go-live.

## Operator Checklist

| Check | Command or Evidence |
|---|---|
| Static validation | `npm run check` |
| Build validation | `npm run build` |
| Automated tests | `npm run test:run` |
| OpenAPI validation | `npm run openapi` |
| Web tests | `npm run web:check` |
| Web build | `npm run web:build` |
| Quality gate | `npm run quality:gate` |
| Runtime orchestration | `npm run runtime:orchestration` |
| Start services | `npm run panacea:start` |
| Runtime status | `npm run panacea:status` |
| Runtime health | `npm run panacea:health` |
| Safe stop | `npm run panacea:stop` |

## Operator Visibility

The operator can verify:

- service health through `npm run panacea:health`
- transaction review through the command intelligence read and projection APIs
- audit entries through runtime orchestration and repository tests
- event/outbox entries through runtime orchestration and repository tests
- projection status through Sprint 114 and Sprint 115 tests
- request, correlation, tenant, and user identifiers through write workflow records

## Pilot Conditions

- Live Foundation identity must be configured for real users.
- Pilot data must be approved by the operator and institution.
- UI Live Mode must use Foundation-issued tokens.
- Demo Mode remains clearly labeled and separate.
- Production database backup and restore procedures must be accepted by the release owner.
- Historical evidence waivers remain documented as accepted risk.

## Recommended Pilot Start

1. Confirm branch and commit.
2. Run all validation commands.
3. Start the runtime.
4. Run `npm run panacea:health`.
5. Open the web UI.
6. Validate Live Mode with a Foundation-issued JWT.
7. Run a governed pilot transaction through the command intelligence workflow.
8. Confirm read model, event, projection, and audit visibility.
9. Record pilot evidence.

## Stop Procedure

```bash
npm run panacea:stop
```

If a production-like pilot is active, notify stakeholders before stopping services.
