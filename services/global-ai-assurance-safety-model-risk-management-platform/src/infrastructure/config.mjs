export function loadGlobalAiAssuranceConfig(env = process.env) {
  return {
    serviceName: env.PANACEA_GLOBAL_AI_ASSURANCE_SERVICE_NAME ?? "panacea-global-ai-assurance-safety-model-risk-management-platform",
    port: Number(env.PANACEA_GLOBAL_AI_ASSURANCE_PORT ?? 8146),
    databaseUrl: env.GLOBAL_AI_ASSURANCE_DATABASE_URL ?? env.DATABASE_URL ?? "postgres://panacea:panacea@localhost:5432/panacea_global_ai_assurance",
    dependencies: {
      foundationPlatformUrl: env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      aiFoundationPlatformUrl: env.PANACEA_AI_FOUNDATION_URL ?? "http://localhost:8115",
      aiGovernancePlatformUrl: env.PANACEA_AI_GOVERNANCE_URL ?? "http://localhost:8120",
      clinicalIntelligencePlatformUrl: env.PANACEA_CLINICAL_INTELLIGENCE_URL ?? "http://localhost:8130",
      multiAgentPlatformUrl: env.PANACEA_MULTI_AGENT_URL ?? "http://localhost:8117",
      learningPlatformUrl: env.PANACEA_LEARNING_URL ?? "http://localhost:8120",
      compliancePlatformUrl: env.PANACEA_GLOBAL_COMPLIANCE_URL ?? "http://localhost:8145",
      securityPlatformUrl: env.PANACEA_SECURITY_URL ?? "http://localhost:8118",
      auditServiceUrl: env.PANACEA_AUDIT_URL ?? env.PANACEA_FOUNDATION_URL ?? "http://localhost:8080",
      notificationServiceUrl: env.PANACEA_NOTIFICATION_URL ?? "http://localhost:8081"
    }
  };
}
