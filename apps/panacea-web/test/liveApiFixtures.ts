import type { BrowserApiAllowlistEntry } from "../src/apiAllowlist";

export const allowedReadFixture: BrowserApiAllowlistEntry = {
  key: "fixture:GET:/api/v4/global-command-intelligence/live",
  method: "GET",
  path: "/api/v4/global-command-intelligence/live",
  url: "https://api.example.test/api/v4/global-command-intelligence/live",
  documentId: "fixture-openapi",
  documentTitle: "Fixture OpenAPI",
  summary: "Liveness probe",
  classification: "ALLOWED_READ",
  workspaceScopes: ["operator"],
  reason: "Governed fixture based on existing OpenAPI liveness endpoint shape."
};

export const operatorAuditFixture: BrowserApiAllowlistEntry = {
  key: "fixture:POST:/api/v1/audit-records",
  method: "POST",
  path: "/api/v1/audit-records",
  url: "https://foundation.utbe.ai/api/v1/audit-records",
  documentId: "foundation-provider-runtime-contract",
  documentTitle: "Foundation Provider Runtime Contract",
  summary: "Operator test audit append endpoint",
  classification: "ALLOWED_OPERATOR_TEST",
  workspaceScopes: ["operator"],
  reason: "Operator-only audit test fixture with testOnly payload."
};

export const blockedWriteFixture: BrowserApiAllowlistEntry = {
  key: "fixture:POST:/api/v4/global-command-intelligence/alerts",
  method: "POST",
  path: "/api/v4/global-command-intelligence/alerts",
  url: "https://api.example.test/api/v4/global-command-intelligence/alerts",
  documentId: "fixture-openapi",
  documentTitle: "Fixture OpenAPI",
  summary: "Create command alert",
  classification: "BLOCKED_WRITE",
  workspaceScopes: ["operator"],
  reason: "Non-GET browser request is blocked by default."
};
