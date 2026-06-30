# GA Known Issues

| Issue | Release impact | Mitigation |
|---|---|---|
| No remote configured in this checkout | Remote CI cannot be observed locally | Configure approved remote before tag distribution |
| Live Foundation provider not observed | Provider behavior is contract validated only | Run provider verification against production-approved endpoint |
| Rollback is backup and restore based | Down migration strategy is not included | Use approved backup and restore runbook |
| Historical Sprint 1-72 artifacts absent | Historical traceability gap remains | Use active repository evidence and waiver |

No critical local validation failure is recorded in the current evidence set.
