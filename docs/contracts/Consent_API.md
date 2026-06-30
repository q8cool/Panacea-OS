# Global Consent API

Base path: `/api/v3/global-privacy`

The Consent API supports governed consent lifecycle management across countries, organizations, patients, and data subjects. Consent records are policy-controlled and fully auditable.

## Endpoints

- `POST /consents/registries`
- `POST /consents/lifecycle`
- `POST /consents/capture`
- `POST /consents/withdrawals`
- `POST /consents/expirations`
- `POST /consents/versioning`
- `POST /consents/scopes`
- `POST /consents/audit-trails`

## Required Controls

Each request must include:

- `policyControls.policyApproved`
- `policyControls.consentEnforcementApplied`
- `policyControls.purposeAccessControlApplied`
- `policyControls.noUnauthorizedDisclosure`
- `governanceContext.consentRequired`
- `governanceContext.purposeBoundProcessing`
- `workflowControls.consentOwnerAssigned`
- `workflowControls.consentScopeDefined`
- `workflowControls.auditEnabled`

Withdrawal records additionally require `withdrawalVerified` and `withdrawalReference`. Scope management records require `scopeApproved` and `scopeApprovalReference`.

## Events

- `consent.created`
- `consent.updated`
- `consent.withdrawn`
