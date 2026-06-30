# Version 3.0 LTS Policy

## Scope

Panacea OS Enterprise Version 3.0 LTS is maintenance-only. It permits approved patches, hotfixes, security remediations, compatibility fixes, rollback support, diagnostic improvements, and operational support evidence.

## Prohibited Changes

- New business features.
- New AI capabilities.
- New services.
- Autonomous diagnosis.
- Autonomous treatment.
- Autonomous clinical decisions.

## Release Channels

- `ga`: immutable Version 3.0 GA baseline.
- `lts`: approved long-term support line.
- `maintenance`: scheduled patch release.
- `security_hotfix`: security remediation release.
- `emergency_patch`: urgent production stability or security fix.

## Approval Requirements

Every patch or hotfix requires:

- Identity-authenticated requester.
- RBAC and ABAC authorization.
- Tenant isolation.
- Global policy review.
- Security review.
- AI governance review when AI runtime, model, prompt, agent, or assurance workflows are affected.
- Audit entry and event publication.

## Compatibility

LTS releases must remain backward compatible with Version 3.0 GA unless a security advisory explicitly approves a breaking operational mitigation.
