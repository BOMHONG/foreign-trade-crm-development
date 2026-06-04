const {
  getTrackedFile,
  getTrackingEvents,
  parseBody,
  saveTrackedFile,
  saveTrackingEvent,
  sendError,
  sendJson,
  summarizeEvents,
} = require("../_tracking-store");

module.exports = async function handler(request, response) {
  const action = getAction(request);
  try {
    if (action === "register") return await handleRegister(request, response);
    if (action === "file") return await handleFile(request, response);
    if (action === "event") return await handleEvent(request, response);
    if (action === "download") return await handleDownload(request, response);
    if (action === "stats") return await handleStats(request, response);
    return response.status(404).json({ error: "TRACKING_ACTION_NOT_FOUND" });
  } catch (error) {
    return sendError(response, error);
  }
};

function getAction(request) {
  const queryAction = request.query?.action;
  if (Array.isArray(queryAction)) return String(queryAction[0] || "").trim();
  if (queryAction) return String(queryAction).trim();
  try {
    const url = new URL(request.url || "", "https://local.crm");
    return decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "").trim();
  } catch {
    return "";
  }
}

async function handleRegister(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  const body = parseBody(request.body);
  const file = body.file || {};
  const blob = body.blob || {};
  const email = body.email || {};
  const id = body.trackingId || file.id || "";
  if (!id || !blob.url) return response.status(400).json({ error: "INVALID_TRACKING_FILE" });
  const record = await saveTrackedFile({
    id,
    fileName: file.name || file.filename || blob.pathname || "attachment",
    size: Number(file.size || 0),
    type: file.type || "application/octet-stream",
    blobUrl: blob.url,
    downloadUrl: blob.downloadUrl || blob.url,
    recipientEmail: email.to || "",
    senderEmail: email.from || "",
    subject: email.subject || "",
    customerName: email.customerName || "",
    createdBy: email.createdBy || "",
  });
  return sendJson(response, 200, {
    ok: true,
    file: {
      ...record,
      previewUrl: `/track.html?id=${encodeURIComponent(record.id)}`,
      downloadUrl: `/api/tracking/download?id=${encodeURIComponent(record.id)}`,
    },
  });
}

async function handleFile(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  const id = String(request.query?.id || "").trim();
  if (!id) return response.status(400).json({ error: "MISSING_ID" });
  const file = await getTrackedFile(id);
  if (!file) return response.status(404).json({ error: "TRACKED_FILE_NOT_FOUND" });
  return sendJson(response, 200, {
    ok: true,
    file: {
      id: file.id,
      fileName: file.fileName,
      size: file.size,
      type: file.type,
      blobUrl: file.blobUrl,
      recipientEmail: file.recipientEmail,
      subject: file.subject,
      customerName: file.customerName,
      createdAt: file.createdAt,
    },
  });
}

async function handleEvent(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  const body = parseBody(request.body);
  const id = String(body.id || "").trim();
  const eventType = String(body.eventType || "open").trim();
  if (!id) return response.status(400).json({ error: "MISSING_ID" });
  const file = await getTrackedFile(id);
  if (!file) return response.status(404).json({ error: "TRACKED_FILE_NOT_FOUND" });
  const event = await saveTrackingEvent(id, {
    eventType,
    activeSeconds: Number(body.activeSeconds || 0),
    userAgent: request.headers?.["user-agent"] || "",
    referrer: String(body.referrer || request.headers?.referer || ""),
    timezone: String(body.timezone || ""),
  });
  return sendJson(response, 200, { ok: true, event });
}

async function handleDownload(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  const id = String(request.query?.id || "").trim();
  if (!id) return response.status(400).json({ error: "MISSING_ID" });
  const file = await getTrackedFile(id);
  if (!file) return response.status(404).json({ error: "TRACKED_FILE_NOT_FOUND" });
  await saveTrackingEvent(id, {
    eventType: "download",
    userAgent: request.headers?.["user-agent"] || "",
    referrer: request.headers?.referer || "",
  });
  response.writeHead(302, { Location: file.downloadUrl || file.blobUrl });
  return response.end();
}

async function handleStats(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  const ids = String(request.query?.ids || request.query?.id || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
  if (!ids.length) return response.status(400).json({ error: "MISSING_ID" });
  const stats = {};
  for (const id of ids) {
    const events = await getTrackingEvents(id);
    stats[id] = summarizeEvents(events);
  }
  return sendJson(response, 200, { ok: true, stats });
}
