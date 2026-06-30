# Crisis Coordination API

## Base Path

`/api/v4/global-command-intelligence`

## Purpose

The Crisis Coordination API records governed crisis events, emergency operations workflows, mass casualty coordination, pandemic and disaster dashboards, resource mobilization, cross-hospital coordination, and cross-region coordination.

Emergency workflows are policy-controlled and may not enforce emergency actions without authorized approval.

## Endpoints

- `POST /crisis/events`
- `POST /crisis/emergency-operations`
- `POST /crisis/mass-casualty`
- `POST /crisis/pandemic-dashboard`
- `POST /crisis/disaster-dashboard`
- `POST /crisis/resource-mobilization`
- `POST /crisis/cross-hospital`
- `POST /crisis/cross-region`

## Required Controls

- Crisis authority verified.
- Emergency access governed.
- Cross-boundary coordination approved.
- Mass casualty governance checked.
- All actions audited by tenant, country, and region.

## Events

- `crisis.event.created`
- `emergency.coordination.started`
