const { createSupabaseRepository } = require("../lib/supabase-repository");
const { createSharedCrmService } = require("../lib/shared-crm-service");
const {
  authenticateSharedCrmRequest,
  assertActionAllowed,
  getPublicAuthConfig,
  isPublicAction,
} = require("../lib/shared-crm-auth");

module.exports = async function handler(request, response) {
  setNoStore(response);

  if (!["GET", "POST", "PATCH"].includes(request.method)) {
    return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const repository = createSupabaseRepository(process.env);
  const service = createSharedCrmService(repository);

  try {
    const url = new URL(request.url || "/api/shared-crm", "http://localhost");
    const body = parseBody(request.body);
    const action = String(url.searchParams.get("action") || body.action || "").trim();
    const payload = body.payload || body;

    if (action === "health") {
      const publicConfig = getPublicAuthConfig(process.env);
      return response.status(200).json({
        ok: true,
        databaseConfigured: Boolean(repository.configured),
        authRequired: true,
        authConfigured: Boolean(publicConfig.supabaseUrl && publicConfig.supabaseAnonKey),
        allowlistConfigured: publicConfig.allowlistConfigured,
        transport: "mock",
      });
    }

    if (action === "publicConfig") {
      return response.status(200).json({ ok: true, data: getPublicAuthConfig(process.env) });
    }

    const actor = isPublicAction(action) ? null : await authenticateSharedCrmRequest(request, process.env);
    assertActionAllowed(action, request.method, actor, payload);
    const result = await dispatch({ action, method: request.method, payload, actor, service, url });
    return response.status(200).json({ ok: true, ...result });
  } catch (error) {
    const normalized = service.toApiError(error);
    return response.status(normalized.statusCode).json({
      ok: false,
      error: normalized.error,
      message: normalized.message,
    });
  }
};

async function dispatch({ action, method, payload, actor, service, url }) {
  if ((method === "GET" || method === "POST") && action === "snapshot") {
    const snapshot = await service.snapshot(actor);
    if (actor.role !== "admin") {
      snapshot.outreachActivity = [];
      snapshot.mockSentRecords = [];
    }
    return { data: snapshot };
  }
  if (method === "GET" && action === "listCustomers") return { data: await service.listCustomers() };
  if (method === "POST" && action === "saveCustomer") return { data: await service.saveCustomer(payload.customer, actor) };
  if (method === "POST" && action === "bulkUpsertCustomers") return { data: await service.bulkUpsertCustomers(payload.customers || [], actor) };
  if (method === "PATCH" && action === "updateCustomerFlags") {
    return { data: await service.updateCustomerFlags(payload.customerId, payload.flag || payload.action, actor, payload.taskId || "") };
  }
  if (method === "POST" && action === "updateCustomerFlags") {
    return { data: await service.updateCustomerFlags(payload.customerId, payload.flag || payload.action, actor, payload.taskId || "") };
  }

  if (method === "GET" && action === "listCustomerActivities") {
    return { data: await service.listCustomerActivities(url.searchParams.get("customerId") || payload.customerId || "") };
  }
  if (method === "POST" && action === "addCustomerActivity") return { data: await service.addCustomerActivity(payload.activity, actor) };

  if (method === "GET" && action === "loadOutreachSettings") return { data: await service.loadOutreachSettings() };
  if (method === "POST" && action === "saveOutreachSettings") return { data: await service.saveOutreachSettings(payload.settings || {}, actor) };

  if (method === "GET" && action === "listOutreachQueue") return { data: await service.listOutreachQueue() };
  if (method === "POST" && action === "createOutreachTask") return { data: await service.createOutreachTask(payload, actor) };
  if (method === "PATCH" && action === "updateOutreachTask") {
    return { data: await service.updateOutreachTask(payload.taskId || payload.id, payload.patch || {}, actor) };
  }
  if (method === "POST" && action === "updateOutreachTask") {
    return { data: await service.updateOutreachTask(payload.taskId || payload.id, payload.patch || {}, actor) };
  }
  if (method === "POST" && action === "approveOutreachTask") {
    return { data: await service.approveOutreachTask(payload.taskId || payload.id, actor) };
  }
  if (method === "POST" && action === "mockSendOutreachTask") {
    return { data: await service.mockSendOutreachTask(payload.taskId || payload.id, actor) };
  }

  throw Object.assign(new Error(`Unsupported shared CRM action: ${action || "(empty)"}`), {
    statusCode: 404,
    code: "ACTION_NOT_FOUND",
  });
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function setNoStore(response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
}
