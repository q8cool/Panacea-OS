# Version Compatibility Matrix

| Source Version | Target Version | Compatibility | Required Validation |
| --- | --- | --- | --- |
| 3.0.0 | 3.0.1-LTS | Backward compatible | Schema, API, event, config, rollback |
| 3.0.0 | security hotfix | Backward compatible unless emergency approval states otherwise | Security, rollback, audit |
| 3.0.1-LTS | later 3.0.x LTS | Backward compatible | Full LTS validation gate |

## Required Checks

- API compatibility validation.
- Event compatibility validation.
- Database migration validation.
- Configuration compatibility validation.
- Data migration validation.
- Rollback validation.
- AI governance revalidation for AI-impacting patches.
