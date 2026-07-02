# Panacea Operational Service Integration Fix Report

Date: 2026-07-02  
Branch: `develop/v4.0`

## Decision

PASS for operational wiring remediation after local validation.

## Issue

The Panacea web application could authenticate against Foundation, but live Hospital Core actions and patient-file reads could still fail or look inactive when the issued token only contained broad platform claims such as `panacea:read`, `panacea:write`, and `panacea:operate`.

The live command service enforces service-level claims for read models and write workflows:

- `read`
- `global_command_intelligence.read_models.read`
- `global_command_intelligence.write_workflows.write`
- `global_command_intelligence.write_workflows.read`
- `global_command_intelligence.write_workflows.retry`

This created a production usability gap: the user could sign in, but patient list, patient profile, and operational write flows could return authorization failures if the server-side Foundation user file did not include compatible claims.

## Fixes Completed

- Foundation Auth Provider now expands approved Panacea platform permissions into the canonical service-level permissions used by the live command service.
- Panacea web API client now sends compatible `X-Permissions` headers derived from approved `panacea:*` claims.
- `foundation-users.example.json` now includes project-owner and administrator permissions required for patient registration, patient-file reads, write workflows, projection review, and retry operations.
- Hospital Core workflow cards now show operational access state and disable submit only when a signed-in session lacks write permission.
- Foundation provisioning and setup guides now explain the required service-level permissions and the server-side remediation path.
- Operational AI Hospital Core guide now documents project-owner and administrator access requirements.

## User Impact

After a valid Foundation login, a properly provisioned project-owner/operator or administrator account can:

- create a patient,
- open patient list,
- open patient profile/file routes,
- submit governed operational write workflows,
- view event/projection/audit evidence.

The system still preserves clinical boundaries:

- no autonomous diagnosis,
- no autonomous treatment,
- prescriptions and treatment/order workflows remain governed by human approval,
- all operations remain tenant-scoped and auditable.

## Server Operator Action

If the live server still uses an older `/etc/panacea/foundation-auth/foundation-users.json`, update the `project-owner` and `security-admin` records to include:

```json
[
  "panacea:operate",
  "panacea:read",
  "panacea:write",
  "read",
  "global_command_intelligence.read_models.read",
  "global_command_intelligence.write_workflows.write",
  "global_command_intelligence.write_workflows.read",
  "global_command_intelligence.write_workflows.retry"
]
```

For administrator users, include `panacea:admin` as well.

Restart the Foundation Auth Provider after editing the secured users file.

## Validation

Validation commands executed in this sprint:

- `npm run check`
- `npm run build`
- `npm run test:run`
- `npm run openapi`
- `npm run web:check`
- `npm run web:build`
- `npm run quality:gate`

## Final Decision

Panacea OS operational service authentication and Hospital Core web wiring are remediated for project-owner and administrator workflows. Live deployment may require updating the secured Foundation users file and redeploying the web bundle on the UTBE server.
