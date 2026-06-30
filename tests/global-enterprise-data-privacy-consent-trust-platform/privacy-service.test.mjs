import assert from "node:assert/strict";
import test from "node:test";
import {
  PrivacyAuthorizationError,
  PrivacyValidationError
} from "../../services/global-enterprise-data-privacy-consent-trust-platform/src/domain/privacy-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 79 service persists required privacy events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordGlobalConsent(baseRecord({ recordType: "consent_capture", status: "captured" }), actor);
  await service.recordGlobalConsent(baseRecord({ recordType: "consent_lifecycle", status: "updated" }), actor);
  await service.recordGlobalConsent(baseRecord({ recordType: "consent_withdrawal", status: "withdrawn" }), actor);
  await service.recordPatientDataRights(baseRecord({ recordType: "data_access_requests", status: "requested" }), actor);
  await service.recordPatientDataRights(baseRecord({ recordType: "data_export_requests", status: "completed" }), actor);
  await service.recordPrivacyPolicyEngine(baseRecord({ recordType: "privacy_policy_registry", status: "updated" }), actor);
  await service.recordDataSharingGovernance(baseRecord({ recordType: "sharing_approval_workflow", status: "approved" }), actor);
  await service.recordPrivacyMonitoring(baseRecord({ recordType: "policy_violation_detection", status: "detected" }), actor);
  await service.recordTrustPlatform(baseRecord({ recordType: "trust_registry", status: "registered" }), actor);
  await service.recordTrustPlatform(baseRecord({ recordType: "trust_expiration_tracking", status: "expired" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "consent.created",
      "consent.updated",
      "consent.withdrawn",
      "data.access.requested",
      "data.export.completed",
      "privacy.policy.updated",
      "data.sharing.approved",
      "privacy.violation.detected",
      "trust.relationship.created",
      "trust.relationship.expired"
    ]
  );
  assert.equal(repository.records.length, 10);
  assert.equal(repository.audits.length, 10);
  assert.ok(repository.audits.every((entry) => entry.tenantId === "tenant-global-privacy"));
});

test("consent withdrawal, data export, and data deletion require dedicated controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordGlobalConsent(
        baseRecord({
          recordType: "consent_withdrawal",
          status: "withdrawn",
          workflowControls: {
            ...baseRecord().workflowControls,
            withdrawalVerified: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("withdrawalVerified")
  );
  await assert.rejects(
    () =>
      service.recordPatientDataRights(
        baseRecord({
          recordType: "data_export_requests",
          status: "completed",
          workflowControls: {
            ...baseRecord().workflowControls,
            exportCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("exportCompleted")
  );
  await assert.rejects(
    () =>
      service.recordPatientDataRights(
        baseRecord({
          recordType: "data_deletion_requests",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            legalDeletionPermitted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("legalDeletionPermitted")
  );
});

test("privacy policy, sharing, trust, and monitoring controls are enforced", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordPrivacyPolicyEngine(
        baseRecord({
          recordType: "purpose_based_access_control",
          workflowControls: {
            ...baseRecord().workflowControls,
            purposeAccessControlVerified: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("purposeAccessControlVerified")
  );
  await assert.rejects(
    () =>
      service.recordDataSharingGovernance(
        baseRecord({
          recordType: "cross_border_sharing_controls",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            crossBorderApprovalReference: ""
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("crossBorderApprovalReference")
  );
  await assert.rejects(
    () =>
      service.recordTrustPlatform(
        baseRecord({
          recordType: "trust_expiration_tracking",
          status: "expired",
          workflowControls: {
            ...baseRecord().workflowControls,
            expirationNoticeSent: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("expirationNoticeSent")
  );
  await assert.rejects(
    () =>
      service.recordPrivacyMonitoring(
        baseRecord({
          recordType: "consent_violation_detection",
          status: "detected",
          workflowControls: {
            ...baseRecord().workflowControls,
            violationReviewed: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("violationReviewed")
  );
});

test("tenant, country, consent, and policy-boundary controls are enforced", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordGlobalConsent(
        baseRecord({
          recordType: "consent_registry",
          governanceContext: {
            ...baseRecord().governanceContext,
            consentRequired: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("consentRequired")
  );
  await assert.rejects(
    () =>
      service.recordGlobalConsent(
        baseRecord({
          recordType: "consent_registry",
          policyControls: {
            ...baseRecord().policyControls,
            noUnauthorizedDisclosure: false
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("noUnauthorizedDisclosure")
  );
  await assert.rejects(
    () => service.recordGlobalConsent(baseRecord({ recordType: "consent_registry" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof PrivacyAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () =>
      service.recordGlobalConsent(
        baseRecord({
          recordType: "consent_registry",
          countryCode: "BH",
          governanceContext: {
            ...baseRecord().governanceContext,
            approvedCountries: ["KW", "SA", "BH"]
          }
        }),
        principal()
      ),
    (error) => error instanceof PrivacyAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () =>
      service.recordGlobalConsent(
        baseRecord({
          recordType: "consent_registry",
          description: "This request attempts to bypass consent controls."
        }),
        principal()
      ),
    (error) => error instanceof PrivacyValidationError && error.message.includes("policy-boundary")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-privacy",
      sourceSystem: "patient_portal_platform",
      sourceResourceType: "consent_capture",
      sourceResourceId: "portal-consent-001",
      privacyResourceType: "consent_capture",
      privacyResourceId: "consent-record-001",
      countryCode: "KW",
      metadata: { integration: "patient-consent" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "patient_portal_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_privacy.integration_reference.created");
});
