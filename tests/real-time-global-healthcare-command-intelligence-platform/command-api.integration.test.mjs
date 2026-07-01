import assert from "node:assert/strict";
import test from "node:test";
import { createRealTimeGlobalCommandIntelligenceServer } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/command-domain.mjs";
import { writeWorkflowPermission } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/write-workflows.mjs";
import { baseRecord, baseWriteWorkflow, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createRealTimeGlobalCommandIntelligenceServer({ service });
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve({ server, repository, baseUrl: `http://127.0.0.1:${address.port}${API_BASE_PATH}` });
    });
  });
}

async function postJson(baseUrl, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer command-test-token",
      "x-tenant-id": "tenant-global-command",
      "x-actor-id": "api-command-actor-1",
      "x-roles": "global-command-intelligence-admin",
      "x-permissions": "global_command_intelligence.*",
      "x-country-codes": "KW,SA",
      "x-region-codes": "GCC,MENA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

async function getJson(baseUrl, path, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      authorization: "Bearer command-test-token",
      "x-tenant-id": "tenant-global-command",
      "x-actor-id": "api-command-actor-1",
      "x-roles": "global-command-intelligence-admin",
      "x-permissions": "global_command_intelligence.*",
      "x-country-codes": "KW,SA",
      "x-region-codes": "GCC,MENA",
      ...headers
    }
  });
  return { response, json: await response.json() };
}

test("REST API records command center, operational, alert, crisis, decision, executive, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const command = await postJson(baseUrl, "/command-centers/global", baseRecord({ status: "created" }));
    assert.equal(command.response.status, 201);
    assert.equal(command.json.event.eventType, "command.center.created");

    const operational = await postJson(baseUrl, "/operational/capacity", baseRecord({ status: "updated" }));
    assert.equal(operational.response.status, 201);
    assert.equal(operational.json.event.eventType, "situation.updated");

    const alert = await postJson(baseUrl, "/alerts/correlation", baseRecord({ status: "correlated" }));
    assert.equal(alert.response.status, 201);
    assert.equal(alert.json.event.eventType, "alert.correlated");

    const crisis = await postJson(baseUrl, "/crisis/emergency-operations", baseRecord({ status: "started" }));
    assert.equal(crisis.response.status, 201);
    assert.equal(crisis.json.event.eventType, "emergency.coordination.started");

    const decision = await postJson(baseUrl, "/decision-support/capacity", baseRecord({ status: "generated" }));
    assert.equal(decision.response.status, 201);
    assert.equal(decision.json.event.eventType, "command.recommendation.generated");
    assert.equal(decision.json.data.governanceContext.advisoryOnly, true);

    const executive = await postJson(baseUrl, "/executive/briefings", baseRecord({ status: "generated" }));
    assert.equal(executive.response.status, 201);
    assert.equal(executive.json.event.eventType, "executive.briefing.generated");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-command",
      sourceSystem: "ahos_core",
      sourceResourceType: "enterprise_state",
      sourceResourceId: "state-001",
      commandResourceType: "real_time_situation_awareness",
      commandResourceId: "situation-001",
      countryCode: "KW",
      regionCode: "GCC"
    });
    assert.equal(integration.response.status, 201);
    assert.equal(repository.records.length, 6);
    assert.equal(repository.references.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API exposes tenant-scoped authenticated live read models without demo data", async () => {
  const { server, repository, baseUrl } = await startServer();
  repository.readModels.push(
    {
      id: "read-patient-001",
      tenantId: "tenant-global-command",
      workspace: "clinical",
      modelKey: "patients",
      subjectId: "patient-live-001",
      status: "active",
      title: "Live Patient Read Model",
      payload: { patientId: "patient-live-001", status: "active", source: "live-read-model" },
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:05:00.000Z"
    },
    {
      id: "read-patient-other-tenant",
      tenantId: "tenant-other",
      workspace: "clinical",
      modelKey: "patients",
      subjectId: "patient-other-001",
      status: "active",
      title: "Other Tenant Patient",
      payload: { patientId: "patient-other-001" },
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:05:00.000Z"
    }
  );
  try {
    const read = await getJson(baseUrl, "/read-models/clinical/patients?limit=10&offset=0");
    assert.equal(read.response.status, 200);
    assert.equal(read.json.data.source, "live-read-model");
    assert.equal(read.json.data.demoData, false);
    assert.equal(read.json.data.tenantId, "tenant-global-command");
    assert.equal(read.json.data.items.length, 1);
    assert.equal(read.json.data.items[0].id, "read-patient-001");
    assert.equal(read.json.data.items[0].payload.source, "live-read-model");
    assert.equal(repository.audits.at(-1).action, "global_command_intelligence.read_model.read");

    const isolated = await getJson(baseUrl, "/read-models/clinical/patients", { "x-tenant-id": "tenant-other" });
    assert.equal(isolated.response.status, 200);
    assert.equal(isolated.json.data.items.length, 1);
    assert.equal(isolated.json.data.items[0].id, "read-patient-other-tenant");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API scopes patient portal read models to the authenticated subject", async () => {
  const { server, repository, baseUrl } = await startServer();
  repository.readModels.push(
    {
      id: "patient-appointment-self",
      tenantId: "tenant-global-command",
      workspace: "patient_portal",
      modelKey: "appointments",
      subjectId: "patient-live-001",
      status: "scheduled",
      title: "Live Appointment",
      payload: { appointmentId: "appointment-live-001", status: "scheduled" },
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:05:00.000Z"
    },
    {
      id: "patient-appointment-other",
      tenantId: "tenant-global-command",
      workspace: "patient_portal",
      modelKey: "appointments",
      subjectId: "patient-live-002",
      status: "scheduled",
      title: "Other Patient Appointment",
      payload: { appointmentId: "appointment-live-002" },
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:05:00.000Z"
    }
  );
  try {
    const read = await getJson(baseUrl, "/read-models/patient-portal/me/appointments", {
      "x-actor-id": "patient-live-001",
      "x-roles": "patient",
      "x-permissions": "read"
    });
    assert.equal(read.response.status, 200);
    assert.equal(read.json.data.subjectId, "patient-live-001");
    assert.equal(read.json.data.items.length, 1);
    assert.equal(read.json.data.items[0].id, "patient-appointment-self");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API rejects missing authentication and incorrect workspace roles for read models", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const unauthenticated = await fetch(`${baseUrl}/read-models/clinical/patients`, { method: "GET" });
    assert.equal(unauthenticated.status, 401);

    const forbidden = await getJson(baseUrl, "/read-models/clinical/patients", {
      "x-roles": "patient",
      "x-permissions": "patient.read"
    });
    assert.equal(forbidden.response.status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API rejects unauthenticated requests and exposes OpenAPI", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const unauthenticated = await fetch(`${baseUrl}/command-centers/global`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "created" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "4.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/crisis/cross-region`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API accepts approved Sprint 113 transactional write workflows and rejects Demo Mode writes", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const created = await postJson(
      baseUrl,
      "/write-workflows/clinical/patients",
      baseWriteWorkflow(),
      {
        "x-roles": "doctor",
        "x-permissions": writeWorkflowPermission
      }
    );
    assert.equal(created.response.status, 201);
    assert.equal(created.json.event.eventType, "patient.created");
    assert.equal(created.json.data.workflowKey, "create_patient");
    assert.equal(created.json.data.workflowControls.demoData, false);
    assert.equal(repository.writeWorkflows.length, 1);
    assert.equal(repository.writeWorkflowEvents[0].eventType, "patient.created");
    assert.equal(repository.audits.at(-1).metadata.eventType, "patient.created");

    const forbidden = await postJson(
      baseUrl,
      "/write-workflows/clinical/patients",
      baseWriteWorkflow(),
      {
        "x-roles": "patient",
        "x-permissions": "read"
      }
    );
    assert.equal(forbidden.response.status, 403);

    const rejectedDemo = await postJson(
      baseUrl,
      "/write-workflows/clinical/patients",
      baseWriteWorkflow({ workflowControls: { ...baseWriteWorkflow().workflowControls, demoData: true } }),
      {
        "x-roles": "doctor",
        "x-permissions": writeWorkflowPermission
      }
    );
    assert.equal(rejectedDemo.response.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
