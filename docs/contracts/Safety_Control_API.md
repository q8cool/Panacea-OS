# Safety and Control API

## Base Path

`/api/v4/autonomous-healthcare-intelligence`

## Purpose

The Safety and Control API records prevention controls for autonomous action, unsafe recommendation blocking, human-in-the-loop enforcement, clinical and operational safety guardrails, policy violation detection, and emergency stop controls.

## Endpoints

- `POST /safety/autonomous-action-prevention`
- `POST /safety/unsafe-recommendation-blocking`
- `POST /safety/human-in-the-loop`
- `POST /safety/clinical-guardrails`
- `POST /safety/operational-guardrails`
- `POST /safety/policy-violations`
- `POST /safety/emergency-stops`

## Safety Requirements

- Autonomous action prevention must be active.
- Unsafe recommendation blocking must be active.
- Human-in-the-loop enforcement must be active.
- Clinical and operational guardrails must be active.
- Emergency stop controls must be tested before activation.
- Every safety action is audited with tenant and country context.

## Events

- `unsafe.recommendation.blocked`
- `human.approval.required`
- `governance.audit.generated`
