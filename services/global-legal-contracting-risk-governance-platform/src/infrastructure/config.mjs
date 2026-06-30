export function loadGlobalLegalConfig(env = process.env) {
  return {
    serviceName: env.PANACEA_GLOBAL_LEGAL_SERVICE_NAME ?? "panacea-global-legal-contracting-risk-governance-platform",
    port: Number(env.PANACEA_GLOBAL_LEGAL_PORT ?? 8142),
    databaseUrl: env.GLOBAL_LEGAL_DATABASE_URL ?? env.DATABASE_URL ?? "postgres://panacea:panacea@localhost:5432/panacea_global_legal",
    dependencies: {
      foundationPlatformUrl: env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      securityPlatformUrl: env.PANACEA_SECURITY_URL ?? "http://localhost:8118",
      compliancePlatformUrl: env.PANACEA_COMPLIANCE_URL ?? "http://localhost:8118",
      qualityPlatformUrl: env.PANACEA_QUALITY_URL ?? "http://localhost:8098",
      workforcePlatformUrl: env.PANACEA_GLOBAL_WORKFORCE_URL ?? "http://localhost:8141",
      supplyChainPlatformUrl: env.PANACEA_GLOBAL_SUPPLY_CHAIN_URL ?? "http://localhost:8139",
      revenueCyclePlatformUrl: env.PANACEA_REVENUE_CYCLE_URL ?? "http://localhost:8095",
      enterprisePlatformUrl: env.PANACEA_ENTERPRISE_URL ?? "http://localhost:8119",
      auditServiceUrl: env.PANACEA_AUDIT_URL ?? env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      notificationServiceUrl: env.PANACEA_NOTIFICATION_URL ?? "http://localhost:8081"
    }
  };
}
