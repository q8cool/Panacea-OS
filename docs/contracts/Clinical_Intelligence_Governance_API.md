# Clinical Intelligence Governance API

## Base Path

`/api/v4/autonomous-healthcare-intelligence`

## Purpose

The Clinical Intelligence Governance API controls advisory recommendation governance, clinical review rules, human approval rules, safety escalation rules, clinical override workflows, and recommendation lifecycle tracking.

Clinical recommendations remain advisory. Human clinicians remain the final decision makers.

## Endpoints

- `POST /clinical-governance/policies`
- `POST /clinical-governance/recommendations`
- `POST /clinical-governance/review-rules`
- `POST /clinical-governance/human-approval-rules`
- `POST /clinical-governance/safety-escalations`
- `POST /clinical-governance/overrides`
- `POST /clinical-governance/lifecycle`

## Required Controls

- Clinical review rules approved.
- Human approval rules enforced.
- Safety escalation configured.
- Overrides require documented reason and audit entry.
- Recommendation lifecycle is tracked from creation through governance completion.
- Unsafe recommendations are blocked before clinical use.

## Events

- `intelligence.policy.created`
- `recommendation.governance.started`
- `recommendation.governance.completed`
- `human.approval.required`
