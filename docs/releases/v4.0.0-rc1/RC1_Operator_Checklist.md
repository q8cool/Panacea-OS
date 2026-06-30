# RC1 Operator Checklist

- Confirm release-owner approval for open conditions.
- Confirm Git remote configuration.
- Confirm remote CI execution if release policy requires it.
- Confirm Foundation provider configuration.
- Confirm PostgreSQL migration execution against clean infrastructure.
- Confirm disaster recovery backup and restore procedure.
- Confirm secret scan output.
- Confirm Docker image build and startup behavior.
- Confirm Kubernetes deployment manifests.
- Confirm audit, tenant, RBAC, and ABAC configuration.
- Create RC1 tag only after the evidence commit is approved.
