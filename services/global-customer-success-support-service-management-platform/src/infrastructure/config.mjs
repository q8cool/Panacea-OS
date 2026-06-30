export function loadGlobalCustomerSuccessConfig(env = process.env) {
  return {
    serviceName: env.PANACEA_GLOBAL_CUSTOMER_SUCCESS_SERVICE_NAME ?? "panacea-global-customer-success-support-service-management-platform",
    port: Number(env.PANACEA_GLOBAL_CUSTOMER_SUCCESS_PORT ?? 8143),
    databaseUrl: env.GLOBAL_CUSTOMER_SUCCESS_DATABASE_URL ?? env.DATABASE_URL ?? "postgres://panacea:panacea@localhost:5432/panacea_global_customer_success",
    dependencies: {
      foundationPlatformUrl: env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      enterprisePlatformUrl: env.PANACEA_ENTERPRISE_URL ?? "http://localhost:8119",
      devopsPlatformUrl: env.PANACEA_DEVOPS_URL ?? "http://localhost:8121",
      securityPlatformUrl: env.PANACEA_SECURITY_URL ?? "http://localhost:8118",
      ltsMaintenancePlatformUrl: env.PANACEA_LTS_MAINTENANCE_URL ?? "http://localhost:8123",
      legalGovernancePlatformUrl: env.PANACEA_GLOBAL_LEGAL_GOVERNANCE_URL ?? "http://localhost:8142",
      auditServiceUrl: env.PANACEA_AUDIT_URL ?? env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      notificationServiceUrl: env.PANACEA_NOTIFICATION_URL ?? "http://localhost:8081"
    }
  };
}
