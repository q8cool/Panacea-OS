export function loadGlobalComplianceConfig(env = process.env) {
  return {
    serviceName: env.PANACEA_GLOBAL_COMPLIANCE_SERVICE_NAME ?? "panacea-global-compliance-automation-regulatory-intelligence-platform",
    port: Number(env.PANACEA_GLOBAL_COMPLIANCE_PORT ?? 8145),
    databaseUrl: env.GLOBAL_COMPLIANCE_DATABASE_URL ?? env.DATABASE_URL ?? "postgres://panacea:panacea@localhost:5432/panacea_global_compliance",
    dependencies: {
      foundationPlatformUrl: env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      securityPlatformUrl: env.PANACEA_SECURITY_URL ?? "http://localhost:8118",
      legalGovernancePlatformUrl: env.PANACEA_GLOBAL_LEGAL_GOVERNANCE_URL ?? "http://localhost:8142",
      qualityPlatformUrl: env.PANACEA_QUALITY_URL ?? "http://localhost:8099",
      productManagementPlatformUrl: env.PANACEA_GLOBAL_PRODUCT_MANAGEMENT_URL ?? "http://localhost:8144",
      enterpriseDataPlatformUrl: env.PANACEA_ENTERPRISE_DATA_URL ?? "http://localhost:8137",
      auditServiceUrl: env.PANACEA_AUDIT_URL ?? env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      notificationServiceUrl: env.PANACEA_NOTIFICATION_URL ?? "http://localhost:8081"
    }
  };
}
