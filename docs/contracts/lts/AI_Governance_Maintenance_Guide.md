# AI Governance Maintenance Guide

## Scope

AI governance maintenance covers AI model lifecycle monitoring, prompt lifecycle monitoring, agent lifecycle monitoring, AI incident review, AI safety patch workflow, AI assurance revalidation, and model risk revalidation.

## Boundaries

LTS maintenance must not add AI capabilities or change production clinical behavior without authorized governance approval.

## Required Event

- `ai.safety.patch.applied`

## Required Controls

- Human approval.
- AI governance approval.
- Model risk revalidation.
- Prompt and agent lifecycle review when affected.
- Full auditability.
