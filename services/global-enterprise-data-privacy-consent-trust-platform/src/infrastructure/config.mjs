export function loadGlobalPrivacyConfig(env = process.env) {
  return {
    serviceName: env.PANACEA_GLOBAL_PRIVACY_SERVICE_NAME ?? "panacea-global-enterprise-data-privacy-consent-trust-platform",
    port: Number(env.PANACEA_GLOBAL_PRIVACY_PORT ?? 8147),
    databaseUrl: env.GLOBAL_PRIVACY_DATABASE_URL ?? env.DATABASE_URL ?? "postgres://panacea:panacea@localhost:5432/panacea_global_privacy_consent_trust",
    dependencies: {
      foundationPlatformUrl: env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      securityPlatformUrl: env.PANACEA_SECURITY_URL ?? "http://localhost:8118",
      compliancePlatformUrl: env.PANACEA_GLOBAL_COMPLIANCE_URL ?? "http://localhost:8145",
      globalHealthcarePlatformUrl: env.PANACEA_GLOBAL_HEALTHCARE_URL ?? "http://localhost:8131",
      federatedPlatformUrl: env.PANACEA_FEDERATED_URL ?? "http://localhost:8133",
      researchPlatformUrl: env.PANACEA_RESEARCH_URL ?? "http://localhost:8098",
      patientPortalPlatformUrl: env.PANACEA_PATIENT_PORTAL_URL ?? "http://localhost:8107",
      aiAssurancePlatformUrl: env.PANACEA_AI_ASSURANCE_URL ?? "http://localhost:8146",
      auditServiceUrl: env.PANACEA_AUDIT_URL ?? env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      notificationServiceUrl: env.PANACEA_NOTIFICATION_URL ?? "http://localhost:8081"
    }
  };
}
