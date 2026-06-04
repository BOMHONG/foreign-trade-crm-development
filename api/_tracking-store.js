const TRACKING_PREFIX = "foryal-crm-tracking";

async function getBlobSdk() {
  try {
    return await import("@vercel/blob");
  } catch (error) {
    throw new Error("BLOB_SDK_NOT_INSTALLED");
  }
}

function isBlobConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_OIDC_TOKEN
  );
}

function assertBlobConfigured() {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_STORAGE_NOT_CONFIGURED");
  }
}

async function putJson(path, data) {
  assertBlobConfigured();
  const { put } = await getBlobSdk();
  const body = JSON.stringify(data, null, 2);
  return await put(path, body, {
    access: "public",
    contentType: "application/json; charset=utf-8",
    allowOverwrite: true,
  });
}

async function listJson(prefix) {
  assertBlobConfigured();
  const { list } = await getBlobSdk();
  const result = await list({ prefix });
  const rows = [];
  for (const blob of result.blobs || []) {
    try {
      const response = await fetch(blob.url, { cache: "no-store" });
      if (response.ok) rows.push(await response.json());
    } catch {
      // Ignore a single bad tracking object so the rest of the history stays usable.
    }
  }
  return rows;
}

function getFilePath(id) {
  return `${TRACKING_PREFIX}/files/${safePathPart(id)}.json`;
}

function getEventPath(id, eventId) {
  return `${TRACKING_PREFIX}/events/${safePathPart(id)}/${safePathPart(eventId)}.json`;
}

function safePathPart(value) {
  return String(value || "item").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "item";
}

function buildId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function saveTrackedFile(record) {
  const now = new Date().toISOString();
  const id = record.id || buildId();
  const file = {
    id,
    fileName: record.fileName || "attachment",
    size: Number(record.size || 0),
    type: record.type || "application/octet-stream",
    blobUrl: record.blobUrl || "",
    downloadUrl: record.downloadUrl || record.blobUrl || "",
    recipientEmail: record.recipientEmail || "",
    senderEmail: record.senderEmail || "",
    subject: record.subject || "",
    customerName: record.customerName || "",
    emailId: record.emailId || "",
    createdBy: record.createdBy || "",
    createdAt: record.createdAt || now,
    updatedAt: now,
  };
  await putJson(getFilePath(id), file);
  return file;
}

async function getTrackedFile(id) {
  const rows = await listJson(`${TRACKING_PREFIX}/files/`);
  return rows.find((row) => row.id === id) || null;
}

async function saveTrackingEvent(id, event = {}) {
  const now = new Date().toISOString();
  const eventId = event.eventId || buildId();
  const row = {
    eventId,
    id,
    eventType: event.eventType || "open",
    activeSeconds: Math.max(0, Number(event.activeSeconds || 0)),
    userAgent: event.userAgent || "",
    referrer: event.referrer || "",
    timezone: event.timezone || "",
    createdAt: event.createdAt || now,
  };
  await putJson(getEventPath(id, eventId), row);
  return row;
}

async function getTrackingEvents(id) {
  return await listJson(`${TRACKING_PREFIX}/events/${safePathPart(id)}/`);
}

function summarizeEvents(events = []) {
  const sorted = events.slice().sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  const opens = sorted.filter((event) => event.eventType === "open");
  const downloads = sorted.filter((event) => event.eventType === "download");
  const closes = sorted.filter((event) => event.eventType === "close");
  const heartbeats = sorted.filter((event) => event.eventType === "heartbeat");
  const activeSeconds = Math.max(0, ...sorted.map((event) => Number(event.activeSeconds || 0)));
  return {
    openCount: opens.length,
    downloadCount: downloads.length,
    firstOpenedAt: opens[0]?.createdAt || "",
    lastOpenedAt: opens[opens.length - 1]?.createdAt || "",
    lastDownloadedAt: downloads[downloads.length - 1]?.createdAt || "",
    lastClosedAt: closes[closes.length - 1]?.createdAt || "",
    heartbeatCount: heartbeats.length,
    maxActiveSeconds: activeSeconds,
    eventCount: sorted.length,
  };
}

function sendJson(response, status, data) {
  response.status(status).json(data);
}

function sendError(response, error) {
  const message = error?.message || "TRACKING_ERROR";
  const status = message === "BLOB_STORAGE_NOT_CONFIGURED" ? 503 : 500;
  sendJson(response, status, { error: message, message: toUserMessage(message) });
}

function toUserMessage(message) {
  if (message === "BLOB_STORAGE_NOT_CONFIGURED") {
    return "尚未配置 Vercel Blob Storage。请在 Vercel 项目 Storage 中创建 Blob，并把 BLOB_READ_WRITE_TOKEN 加到 Production 环境变量。";
  }
  if (message === "BLOB_SDK_NOT_INSTALLED") return "缺少 @vercel/blob 依赖。";
  return message;
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

module.exports = {
  buildId,
  getTrackedFile,
  getTrackingEvents,
  isBlobConfigured,
  parseBody,
  saveTrackedFile,
  saveTrackingEvent,
  sendError,
  sendJson,
  summarizeEvents,
};
