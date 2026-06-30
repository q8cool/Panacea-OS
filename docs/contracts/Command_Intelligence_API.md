# Command Intelligence API

## Base Path

`/api/v4/global-command-intelligence`

## Purpose

The Command Intelligence API records real-time operational intelligence and governed command recommendations for capacity, beds, ICU, emergency, surgery, resources, workforce, supply, transfers, emergency response, and continuity.

Recommendations are advisory only and require governance review before execution.

## Operational Endpoints

- `POST /operational/capacity`
- `POST /operational/beds`
- `POST /operational/icu`
- `POST /operational/emergency`
- `POST /operational/surgery`
- `POST /operational/resources`
- `POST /operational/workforce`
- `POST /operational/supply`

## Decision Support Endpoints

- `POST /decision-support/engines`
- `POST /decision-support/capacity`
- `POST /decision-support/resources`
- `POST /decision-support/staff`
- `POST /decision-support/transfers`
- `POST /decision-support/emergency-response`
- `POST /decision-support/continuity`

## Required Controls

- Real-time signals validated.
- Operational sources verified.
- Capacity impact reviewed.
- Recommendation explainability captured.
- No autonomous execution.
- Governance review queued.

## Events

- `situation.updated`
- `command.recommendation.generated`
