# AI Safety Testing API

The AI Safety Testing API exposes Sprint 78 safety testing endpoints under `/api/v3/global-ai-assurance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-ai-assurance/safety-tests/registries` | Safety Test Registry |
| `POST /api/v3/global-ai-assurance/safety-tests/clinical` | Clinical Safety Test Cases |
| `POST /api/v3/global-ai-assurance/safety-tests/hallucination` | Hallucination Test Cases |
| `POST /api/v3/global-ai-assurance/safety-tests/bias` | Bias Test Cases |
| `POST /api/v3/global-ai-assurance/safety-tests/robustness` | Robustness Test Cases |
| `POST /api/v3/global-ai-assurance/safety-tests/adversarial` | Adversarial Test Cases |
| `POST /api/v3/global-ai-assurance/safety-tests/regression` | Regression Safety Tests |
| `POST /api/v3/global-ai-assurance/safety-tests/reports` | Safety Test Reports |

Safety testing is an assurance workflow only. Clinical safety test cases validate AI behavior but do not generate diagnoses, treatments, or autonomous clinical decisions.
