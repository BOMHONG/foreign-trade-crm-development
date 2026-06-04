const { getTrackingEvents, sendError, sendJson, summarizeEvents } = require("../_tracking-store");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
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
    sendJson(response, 200, { ok: true, stats });
  } catch (error) {
    sendError(response, error);
  }
};
