const PUBLIC_ACTIONS = new Set(["health", "publicConfig"]);
const ADMIN_ACTIONS = new Set([
  "saveCustomer",
  "bulkUpsertCustomers",
  "saveOutreachSettings",
  "updateCustomerFlags",
  "approveOutreachTask",
  "mockSendOutreachTask",
]);
const AUTHENTICATED_ACTIONS = new Set([
  "snapshot",
  "listCustomers",
  "listCustomerActivities",
  "addCustomerActivity",
  "loadOutreachSettings",
  "listOutreachQueue",
  "createOutreachTask",
  "updateOutreachTask",
]);

async function authenticateSharedCrmRequest(request, env = process.env, options = {}) {
  const token = getBearerToken(request.headers || {});
  if (!token) fail(401, "AUTH_REQUIRED", "Authentication required");

  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const authApiKey = String(env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !authApiKey) fail(503, "SUPABASE_AUTH_NOT_CONFIGURED", "Supabase Auth is not configured");

  const fetchImpl = options.fetch || globalThis.fetch;
  if (typeof fetchImpl !== "function") fail(500, "FETCH_UNAVAILABLE", "Server fetch is unavailable");

  const userResponse = await fetchImpl(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: authApiKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const user = await readJson(userResponse);
  if (!userResponse.ok || !user?.id || !user?.email) fail(401, "AUTH_INVALID", "Invalid or expired Supabase token");

  const role = resolveAllowedRole(user.email, env);
  if (!role) fail(403, "AUTH_FORBIDDEN", "User is not allowed to access shared CRM");

  return {
    id: user.id,
    email: String(user.email || "").trim().toLowerCase(),
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
    role,
    supabaseUser: user,
  };
}

function assertActionAllowed(action, method, actor, payload = {}) {
  if (PUBLIC_ACTIONS.has(action)) return;
  if (!actor?.id) fail(401, "AUTH_REQUIRED", "Authentication required");
  if (!AUTHENTICATED_ACTIONS.has(action) && !ADMIN_ACTIONS.has(action)) {
    fail(404, "ACTION_NOT_FOUND", `Unsupported shared CRM action: ${action || "(empty)"}`);
  }
  if (ADMIN_ACTIONS.has(action) && actor.role !== "admin") {
    fail(403, "AUTH_FORBIDDEN", "Admin permission required");
  }
  if (action === "updateCustomerFlags" && payload?.clear === true) {
    fail(403, "AUTH_FORBIDDEN", "Clearing compliance flags is not allowed in this API");
  }
}

function getPublicAuthConfig(env = process.env) {
  return {
    supabaseUrl: env.SUPABASE_URL || "",
    supabaseAnonKey: env.SUPABASE_ANON_KEY || "",
    authRequired: true,
    allowlistConfigured: hasAllowedUsers(env),
  };
}

function isPublicAction(action) {
  return PUBLIC_ACTIONS.has(action);
}

function getBearerToken(headers = {}) {
  const value = getHeader(headers, "authorization");
  const match = String(value || "").match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function getHeader(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") return headers.get(name) || headers.get(name.toLowerCase()) || headers.get(name.toUpperCase()) || "";
  const target = name.toLowerCase();
  const key = Object.keys(headers).find((item) => item.toLowerCase() === target);
  return key ? headers[key] : "";
}

function resolveAllowedRole(email, env = process.env) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return "";
  const configured = parseAllowedUsers(env);
  return configured.get(normalized) || "";
}

function hasAllowedUsers(env = process.env) {
  return parseAllowedUsers(env).size > 0;
}

function parseAllowedUsers(env = process.env) {
  const map = new Map();
  parseAllowedUsersJson(env.SHARED_CRM_ALLOWED_USERS, map);
  parseEmailList(env.SHARED_CRM_ADMIN_EMAILS).forEach((email) => map.set(email, "admin"));
  parseEmailList(env.SHARED_CRM_USER_EMAILS).forEach((email) => {
    if (!map.has(email)) map.set(email, "user");
  });
  return map;
}

function parseAllowedUsersJson(value, map) {
  const raw = String(value || "").trim();
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      parsed.forEach((item) => {
        const email = String(item.email || "").trim().toLowerCase();
        const role = item.role === "admin" ? "admin" : "user";
        if (email) map.set(email, role);
      });
      return;
    }
    Object.entries(parsed).forEach(([email, role]) => {
      const normalized = String(email || "").trim().toLowerCase();
      if (normalized) map.set(normalized, role === "admin" ? "admin" : "user");
    });
  } catch {
    raw.split(/[,\n]/).forEach((entry) => {
      const [email, role] = entry.split(":").map((part) => String(part || "").trim().toLowerCase());
      if (email) map.set(email, role === "admin" ? "admin" : "user");
    });
  }
}

function parseEmailList(value) {
  return String(value || "")
    .split(/[,\n;]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function fail(statusCode, code, message) {
  throw Object.assign(new Error(message), { statusCode, code });
}

module.exports = {
  authenticateSharedCrmRequest,
  assertActionAllowed,
  getPublicAuthConfig,
  getBearerToken,
  isPublicAction,
  parseAllowedUsers,
  resolveAllowedRole,
};
