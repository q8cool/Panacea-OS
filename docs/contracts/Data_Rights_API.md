# Patient Data Rights API

Base path: `/api/v3/global-privacy`

The Patient Data Rights API supports governed request intake, review, fulfillment, and tracking for patient and data subject rights. Deletion requests are recorded only where legally permitted.

## Endpoints

- `POST /data-rights/access-requests`
- `POST /data-rights/correction-requests`
- `POST /data-rights/export-requests`
- `POST /data-rights/deletion-requests`
- `POST /data-rights/restriction-requests`
- `POST /data-rights/portability`
- `POST /data-rights/reviews`
- `POST /data-rights/fulfillment`

## Required Controls

Every data rights request requires identity verification, legal basis review, fulfillment tracking, tenant isolation, audit, consent verification, residency verification, and policy-bound processing.

Export completion requires `exportCompleted` and `exportPackageReference`.

Deletion requests require `legalDeletionPermitted` and `legalDeletionReference`.

## Events

- `data.access.requested`
- `data.export.completed`
