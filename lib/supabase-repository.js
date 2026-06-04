const {
  toCamelCustomer,
  toDbCustomer,
  toCamelActivity,
  toDbActivity,
  toCamelTask,
  toDbTask,
  toCamelOutreachActivity,
  toDbOutreachActivity,
  toCamelMockSent,
  toDbMockSent,
} = require("./shared-crm-mappers");

const OPEN_TASK_FILTER = "pending_review,approved,scheduled";

function createSupabaseRepository(env = process.env) {
  const url = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = String(env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || !key) {
    return {
      configured: false,
      async ensureConfigured() {
        throw Object.assign(new Error("SUPABASE_NOT_CONFIGURED"), { statusCode: 503, code: "SUPABASE_NOT_CONFIGURED" });
      },
    };
  }

  const baseUrl = `${url}/rest/v1`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  async function request(table, { method = "GET", query = "", body, prefer = "" } = {}) {
    const endpoint = `${baseUrl}/${table}${query ? `?${query}` : ""}`;
    const response = await fetch(endpoint, {
      method,
      headers: prefer ? { ...headers, Prefer: prefer } : headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message = payload?.message || payload?.hint || payload?.error || `Supabase ${method} ${table} failed`;
      const error = Object.assign(new Error(message), {
        statusCode: response.status,
        code: payload?.code || "SUPABASE_REQUEST_FAILED",
        detail: payload,
      });
      throw error;
    }

    return payload;
  }

  function clean(value) {
    if (Array.isArray(value)) return value.map(clean);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([itemKey, itemValue]) => [itemKey, clean(itemValue)])
    );
  }

  async function upsert(table, row, onConflict = "id") {
    const rows = await request(table, {
      method: "POST",
      query: `on_conflict=${encodeURIComponent(onConflict)}&select=*`,
      body: clean(row),
      prefer: "resolution=merge-duplicates,return=representation",
    });
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async function insert(table, row) {
    const rows = await request(table, {
      method: "POST",
      query: "select=*",
      body: clean(row),
      prefer: "return=representation",
    });
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async function patch(table, id, values) {
    const rows = await request(table, {
      method: "PATCH",
      query: `id=eq.${encodeURIComponent(id)}&select=*`,
      body: clean(values),
      prefer: "return=representation",
    });
    return Array.isArray(rows) ? rows[0] : rows;
  }

  return {
    configured: true,
    async ensureConfigured() {
      return true;
    },

    async upsertUser(actor = {}) {
      const id = actor.id || actor.email || "crm-local-user";
      return upsert(
        "users",
        {
          id,
          name: actor.name || actor.email || id,
          email: actor.email || `${id}@local.crm`,
          role: actor.role || "user",
          updated_by: id,
        },
        "id"
      );
    },

    async listCustomers() {
      const rows = await request("customers", { query: "select=*&order=updated_at.desc" });
      return rows.map(toCamelCustomer);
    },

    async getCustomer(id) {
      const rows = await request("customers", { query: `id=eq.${encodeURIComponent(id)}&select=*&limit=1` });
      return rows[0] ? toCamelCustomer(rows[0]) : null;
    },

    async upsertCustomer(customer, actor = {}) {
      await this.upsertUser(actor);
      const row = await upsert("customers", toDbCustomer(customer, actor), "id");
      return toCamelCustomer(row);
    },

    async bulkUpsertCustomers(customers = [], actor = {}) {
      if (!customers.length) return [];
      await this.upsertUser(actor);
      const rows = await request("customers", {
        method: "POST",
        query: "on_conflict=id&select=*",
        body: customers.map((customer) => toDbCustomer(customer, actor)).map(clean),
        prefer: "resolution=merge-duplicates,return=representation",
      });
      return rows.map(toCamelCustomer);
    },

    async patchCustomer(id, values, actor = {}) {
      await this.upsertUser(actor);
      const row = await patch("customers", id, clean({ ...values, updated_by: actor.id || null, updated_at: new Date().toISOString() }));
      return toCamelCustomer(row);
    },

    async listCustomerActivities(customerId = "") {
      const query = customerId
        ? `customer_id=eq.${encodeURIComponent(customerId)}&select=*&order=created_at.desc`
        : "select=*&order=created_at.desc";
      const rows = await request("customer_activities", { query });
      return rows.map(toCamelActivity);
    },

    async addCustomerActivity(activity, actor = {}) {
      await this.upsertUser(actor);
      const row = await insert("customer_activities", toDbActivity(activity, actor));
      return toCamelActivity(row);
    },

    async getSettings(scope = "email_outreach", keyName = "settings") {
      const rows = await request("crm_settings", {
        query: `scope=eq.${encodeURIComponent(scope)}&key=eq.${encodeURIComponent(keyName)}&select=*&limit=1`,
      });
      return rows[0]?.value || null;
    },

    async saveSettings(value, actor = {}, scope = "email_outreach", keyName = "settings") {
      await this.upsertUser(actor);
      const row = await upsert(
        "crm_settings",
        {
          scope,
          key: keyName,
          value: value || {},
          created_by: actor.id || null,
          updated_by: actor.id || null,
          updated_at: new Date().toISOString(),
        },
        "scope,key"
      );
      return row.value || {};
    },

    async listOutreachQueue() {
      const rows = await request("email_outreach_queue", { query: "select=*&order=created_at.desc" });
      return rows.map(toCamelTask);
    },

    async getOutreachTask(id) {
      const rows = await request("email_outreach_queue", { query: `id=eq.${encodeURIComponent(id)}&select=*&limit=1` });
      return rows[0] ? toCamelTask(rows[0]) : null;
    },

    async findOpenOutreachTaskForCustomer(customerId) {
      const rows = await request("email_outreach_queue", {
        query: `customer_id=eq.${encodeURIComponent(customerId)}&status=in.(${OPEN_TASK_FILTER})&select=*&limit=1`,
      });
      return rows[0] ? toCamelTask(rows[0]) : null;
    },

    async upsertOutreachTask(task, actor = {}) {
      await this.upsertUser(actor);
      const row = await upsert("email_outreach_queue", toDbTask(task, actor), "id");
      return toCamelTask(row);
    },

    async patchOutreachTask(id, values, actor = {}) {
      await this.upsertUser(actor);
      const row = await patch("email_outreach_queue", id, {
        ...values,
        updated_by: actor.id || null,
        updated_at: new Date().toISOString(),
      });
      return toCamelTask(row);
    },

    async stopOpenOutreachTasksForCustomer(customerId, reason = "", actor = {}) {
      await this.upsertUser(actor);
      const rows = await request("email_outreach_queue", {
        method: "PATCH",
        query: `customer_id=eq.${encodeURIComponent(customerId)}&status=in.(${OPEN_TASK_FILTER})&select=*`,
        body: {
          status: "stopped",
          stop_reason: reason,
          stopped_at: new Date().toISOString(),
          updated_by: actor.id || null,
          updated_at: new Date().toISOString(),
        },
        prefer: "return=representation",
      });
      return rows.map(toCamelTask);
    },

    async listOutreachActivity() {
      const rows = await request("email_outreach_activity", { query: "select=*&order=created_at.desc&limit=1000" });
      return rows.map(toCamelOutreachActivity);
    },

    async addOutreachActivity(event, actor = {}) {
      await this.upsertUser(actor);
      const row = await insert("email_outreach_activity", toDbOutreachActivity(event, actor));
      return toCamelOutreachActivity(row);
    },

    async addMockSentRecord(record, actor = {}) {
      await this.upsertUser(actor);
      const row = await insert("email_mock_sent_records", toDbMockSent(record, actor));
      return toCamelMockSent(row);
    },

    async listMockSentRecords() {
      const rows = await request("email_mock_sent_records", { query: "select=*&order=created_at.desc" });
      return rows.map(toCamelMockSent);
    },
  };
}

module.exports = { createSupabaseRepository };
