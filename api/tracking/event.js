const { getTrackedFile, parseBody, saveTrackingEvent, sendError, sendJson } = require("../_tracking-store");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
    const body = parseBody(request.body);
    const id = String(body.id || "").trim();
    const eventType = String(body.eventType || "open").trim();
    if (!id) return response.status(400).json({ error: "MISSING_ID" });
    const file = await getTrackedFile(id);
    if (!file) return response.status(404).json({ error: "TRACKED_FILE_NOT_FOUND" });
    const event = await saveTrackingEvent(id, {
      eventType,
      activeSeconds: Number(body.activeSeconds || 0),
      userAgent: request.headers["user-agent"] || "",
      referrer: String(body.referrer || request.headers.referer || ""),
      timezone: String(body.timezone || ""),
    });
    sendJson(response, 200, { ok: true, event });
  } catch (error) {
    sendError(response, error);
  }
};
