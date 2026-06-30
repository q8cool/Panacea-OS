# Remaining Work

Sprint 73 is complete.

No remaining implementation work is required for the Global Workforce, HR, Credentialing & Staff Experience Platform within the approved Sprint 73 scope.

Future work must be handled by the next approved sprint only. The next planned scope is Sprint 74: Global Legal, Contracting, Risk & Enterprise Governance Platform.

Operational follow-up for deployment teams:

- Provision the PostgreSQL database and set `GLOBAL_WORKFORCE_DATABASE_URL`.
- Apply `001_global_workforce_hr_credentialing_staff_experience.sql`.
- Configure upstream platform URLs for Foundation, Security, Scheduling, Nursing, Education, Quality, Enterprise, Analytics, Audit, and Notification services.
- Deploy the Kubernetes manifest with production image `panacea/global-workforce-hr-credentialing-staff-experience-platform:3.0.0`.
