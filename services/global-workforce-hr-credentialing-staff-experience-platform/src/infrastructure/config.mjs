export function loadGlobalWorkforceConfig(env = process.env) {
  return {
    serviceName: env.PANACEA_GLOBAL_WORKFORCE_SERVICE_NAME ?? "panacea-global-workforce-hr-credentialing-staff-experience-platform",
    port: Number(env.PANACEA_GLOBAL_WORKFORCE_PORT ?? 8141),
    databaseUrl: env.GLOBAL_WORKFORCE_DATABASE_URL ?? env.DATABASE_URL ?? "postgres://panacea:panacea@localhost:5432/panacea_global_workforce",
    dependencies: {
      foundationPlatformUrl: env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      securityPlatformUrl: env.PANACEA_SECURITY_URL ?? "http://localhost:8118",
      schedulingPlatformUrl: env.PANACEA_SCHEDULING_URL ?? "http://localhost:8090",
      nursingPlatformUrl: env.PANACEA_NURSING_URL ?? "http://localhost:8094",
      educationPlatformUrl: env.PANACEA_GLOBAL_EDUCATION_URL ?? "http://localhost:8136",
      qualityPlatformUrl: env.PANACEA_QUALITY_URL ?? "http://localhost:8098",
      enterprisePlatformUrl: env.PANACEA_ENTERPRISE_URL ?? "http://localhost:8119",
      analyticsPlatformUrl: env.PANACEA_ANALYTICS_URL ?? "http://localhost:8097",
      auditServiceUrl: env.PANACEA_AUDIT_URL ?? env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      notificationServiceUrl: env.PANACEA_NOTIFICATION_URL ?? "http://localhost:8081"
    }
  };
}
