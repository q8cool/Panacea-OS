# Global Command Center API

## Base Path

`/api/v4/global-command-intelligence`

## Purpose

The Global Command Center API records governed command center views for global, regional, country, hospital, and department command operations. It supports real-time situation awareness, command dashboards, and command event timelines.

Command center intelligence remains advisory and does not execute clinical or emergency actions autonomously.

## Endpoints

- `POST /command-centers/global`
- `POST /command-centers/regional`
- `POST /command-centers/country`
- `POST /command-centers/hospital`
- `POST /command-centers/department`
- `POST /command-centers/situation-awareness`
- `POST /command-centers/dashboards`
- `POST /command-centers/timeline`

## Required Controls

- Identity, RBAC, and ABAC authorization.
- Tenant isolation.
- Country and region authorization.
- Regional governance policies.
- Country-level policy controls.
- Audit for every command action.

## Events

- `command.center.created`
- `command.event.created`
- `situation.updated`
