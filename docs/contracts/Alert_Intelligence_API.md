# Alert Intelligence API

## Base Path

`/api/v4/global-command-intelligence`

## Purpose

The Alert Intelligence API records global alerts, classification, prioritization, correlation, escalation, suppression rules, review workflows, and resolution tracking.

Alert intelligence supports command review and escalation but does not execute clinical or emergency actions.

## Endpoints

- `POST /alerts/registries`
- `POST /alerts/classifications`
- `POST /alerts/prioritization`
- `POST /alerts/correlation`
- `POST /alerts/escalation`
- `POST /alerts/suppression-rules`
- `POST /alerts/reviews`
- `POST /alerts/resolution`

## Required Controls

- Alert source verified.
- Alert review required.
- Correlation reviewed.
- Escalation approved.
- Suppression rules approved.
- Resolution evidence captured.

## Events

- `alert.correlated`
- `alert.escalated`
