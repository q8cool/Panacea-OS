export function loadGlobalProductManagementConfig(env = process.env) {
  return {
    serviceName: env.PANACEA_GLOBAL_PRODUCT_MANAGEMENT_SERVICE_NAME ?? "panacea-global-product-management-roadmap-innovation-portfolio-platform",
    port: Number(env.PANACEA_GLOBAL_PRODUCT_MANAGEMENT_PORT ?? 8144),
    databaseUrl: env.GLOBAL_PRODUCT_MANAGEMENT_DATABASE_URL ?? env.DATABASE_URL ?? "postgres://panacea:panacea@localhost:5432/panacea_global_product_management",
    dependencies: {
      foundationPlatformUrl: env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      developerPlatformUrl: env.PANACEA_DEVELOPER_PLATFORM_URL ?? "http://localhost:8138",
      marketplacePlatformUrl: env.PANACEA_MARKETPLACE_URL ?? "http://localhost:8138",
      customerSuccessPlatformUrl: env.PANACEA_GLOBAL_CUSTOMER_SUCCESS_URL ?? "http://localhost:8143",
      supportPlatformUrl: env.PANACEA_SUPPORT_URL ?? "http://localhost:8143",
      legalGovernancePlatformUrl: env.PANACEA_GLOBAL_LEGAL_GOVERNANCE_URL ?? "http://localhost:8142",
      enterpriseDataPlatformUrl: env.PANACEA_ENTERPRISE_DATA_URL ?? "http://localhost:8137",
      auditServiceUrl: env.PANACEA_AUDIT_URL ?? env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      notificationServiceUrl: env.PANACEA_NOTIFICATION_URL ?? "http://localhost:8081"
    }
  };
}
