(function initCrmDataStore(root) {
  const STORAGE_KEY = "coffee-machine-crm-customers-v6";
  const MAIL_STORE_KEY = "coffee-machine-crm-mail-v1";
  const OUTREACH_QUEUE_KEY = "foryal-email-outreach-queue-v1";
  const OUTREACH_ACTIVITY_KEY = "foryal-email-outreach-activity-v1";
  const OUTREACH_SETTINGS_KEY = "foryal-email-outreach-settings-v1";
  const API_URL = "/api/shared-crm";

  let healthCache = null;

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(root.localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    root.localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeActor(actor = {}) {
    return {
      id: actor.id || actor.email || "crm-local-user",
      name: actor.name || actor.email || actor.id || "CRM User",
      email: actor.email || `${actor.id || "crm-local-user"}@local.crm`,
      role: actor.role || "user",
    };
  }

  async function apiRequest(action, { method = "GET", payload = {}, actor = {} } = {}) {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    const url = method === "GET" ? `${API_URL}?action=${encodeURIComponent(action)}` : API_URL;
    if (method !== "GET") {
      options.body = JSON.stringify({ action, payload, actor: normalizeActor(actor) });
    }
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      const error = new Error(result.message || result.error || `Shared CRM API failed: ${action}`);
      error.code = result.error || "SHARED_CRM_API_FAILED";
      error.statusCode = response.status;
      throw error;
    }
    return result.data === undefined ? result : result.data;
  }

  async function health() {
    if (healthCache) return healthCache;
    try {
      const response = await fetch(`${API_URL}?action=health`, { cache: "no-store" });
      healthCache = await response.json();
      return healthCache;
    } catch {
      healthCache = { ok: false, databaseConfigured: false };
      return healthCache;
    }
  }

  async function hasDatabase() {
    const state = await health();
    return Boolean(state.ok && state.databaseConfigured);
  }

  function localSnapshot() {
    return {
      source: "localStorage",
      customers: readJson(STORAGE_KEY, []),
      customerActivities: [],
      outreachSettings: readJson(OUTREACH_SETTINGS_KEY, {}),
      outreachQueue: readJson(OUTREACH_QUEUE_KEY, []),
      outreachActivity: readJson(OUTREACH_ACTIVITY_KEY, []),
      mockSentRecords: readJson(MAIL_STORE_KEY, { sent: [] }).sent || [],
    };
  }

  async function loadSharedSnapshot(_currentState = {}, actor = {}) {
    if (!(await hasDatabase())) return localSnapshot();
    return apiRequest("snapshot", { method: "POST", payload: {}, actor });
  }

  async function loadCustomers(actor = {}) {
    if (!(await hasDatabase())) return readJson(STORAGE_KEY, []);
    return apiRequest("listCustomers", { method: "GET", actor });
  }

  async function saveCustomer(customer, actor = {}) {
    if (!(await hasDatabase())) {
      const customers = readJson(STORAGE_KEY, []);
      const index = customers.findIndex((item) => item.id === customer.id);
      if (index >= 0) customers[index] = { ...customers[index], ...customer };
      else customers.unshift(customer);
      writeJson(STORAGE_KEY, customers);
      return customer;
    }
    return apiRequest("saveCustomer", { method: "POST", payload: { customer }, actor });
  }

  async function saveCustomersBulk(customers = [], actor = {}) {
    if (!(await hasDatabase())) {
      writeJson(STORAGE_KEY, customers);
      return customers;
    }
    return apiRequest("bulkUpsertCustomers", { method: "POST", payload: { customers }, actor });
  }

  async function updateCustomerFlags(customerId, action, taskId = "", actor = {}) {
    if (!(await hasDatabase())) return { source: "localStorage" };
    return apiRequest("updateCustomerFlags", {
      method: "POST",
      payload: { customerId, action, taskId },
      actor,
    });
  }

  async function loadCustomerActivities(customerId = "", actor = {}) {
    if (!(await hasDatabase())) return [];
    const action = customerId ? `listCustomerActivities&customerId=${encodeURIComponent(customerId)}` : "listCustomerActivities";
    const response = await fetch(`${API_URL}?action=${action}`, { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) throw new Error(result.message || "Unable to load customer activities");
    return result.data || [];
  }

  async function addCustomerActivity(activity, actor = {}) {
    if (!(await hasDatabase())) return activity;
    return apiRequest("addCustomerActivity", { method: "POST", payload: { activity }, actor });
  }

  async function loadOutreachSettings(actor = {}) {
    if (!(await hasDatabase())) return readJson(OUTREACH_SETTINGS_KEY, {});
    return apiRequest("loadOutreachSettings", { method: "GET", actor });
  }

  async function saveOutreachSettings(settings, actor = {}) {
    if (!(await hasDatabase())) {
      writeJson(OUTREACH_SETTINGS_KEY, settings);
      return settings;
    }
    return apiRequest("saveOutreachSettings", { method: "POST", payload: { settings }, actor });
  }

  async function loadOutreachQueue(actor = {}) {
    if (!(await hasDatabase())) return readJson(OUTREACH_QUEUE_KEY, []);
    return apiRequest("listOutreachQueue", { method: "GET", actor });
  }

  async function createOutreachTask(payload, actor = {}) {
    if (!(await hasDatabase())) return { source: "localStorage" };
    return apiRequest("createOutreachTask", { method: "POST", payload, actor });
  }

  async function updateOutreachTask(taskId, patch, actor = {}) {
    if (!(await hasDatabase())) return { source: "localStorage" };
    return apiRequest("updateOutreachTask", { method: "PATCH", payload: { taskId, patch }, actor });
  }

  async function approveOutreachTask(taskId, actor = {}) {
    if (!(await hasDatabase())) return { source: "localStorage" };
    return apiRequest("approveOutreachTask", { method: "POST", payload: { taskId }, actor });
  }

  async function mockSendOutreachTask(taskId, actor = {}) {
    if (!(await hasDatabase())) return { source: "localStorage", transport: "mock", isRealSent: false };
    return apiRequest("mockSendOutreachTask", { method: "POST", payload: { taskId }, actor });
  }

  root.FORYAL_CRM_DATA_STORE = {
    health,
    hasDatabase,
    loadSharedSnapshot,
    loadCustomers,
    saveCustomer,
    saveCustomersBulk,
    updateCustomerFlags,
    loadCustomerActivities,
    addCustomerActivity,
    loadOutreachSettings,
    saveOutreachSettings,
    loadOutreachQueue,
    createOutreachTask,
    updateOutreachTask,
    approveOutreachTask,
    mockSendOutreachTask,
  };
})(typeof window !== "undefined" ? window : globalThis);
