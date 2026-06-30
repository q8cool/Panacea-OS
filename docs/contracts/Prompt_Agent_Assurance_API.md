# Prompt Agent Assurance API

The Prompt & Agent Assurance API exposes Sprint 78 prompt and agent governance endpoints under `/api/v3/global-ai-assurance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-ai-assurance/prompt-agent/prompts/risks` | Prompt Risk Registry |
| `POST /api/v3/global-ai-assurance/prompt-agent/prompts/reviews` | Prompt Review Workflow |
| `POST /api/v3/global-ai-assurance/prompt-agent/prompts/approvals` | Prompt Approval Workflow |
| `POST /api/v3/global-ai-assurance/prompt-agent/agents/risks` | Agent Risk Registry |
| `POST /api/v3/global-ai-assurance/prompt-agent/agents/permissions` | Agent Permission Review |
| `POST /api/v3/global-ai-assurance/prompt-agent/agents/behavior` | Agent Behavior Evaluation |
| `POST /api/v3/global-ai-assurance/prompt-agent/agents/safety-testing` | Agent Safety Testing |
| `POST /api/v3/global-ai-assurance/prompt-agent/agents/runtime-approvals` | Agent Runtime Approval |

Prompt and agent workflows require human approval, audit evidence, permission review, and production-promotion controls before runtime use.
