const { getTrackedFile, saveTrackingEvent, sendError } = require("../_tracking-store");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
    const id = String(request.query?.id || "").trim();
    if (!id) return response.status(400).json({ error: "MISSING_ID" });
    const file = await getTrackedFile(id);
    if (!file) return response.status(404).json({ error: "TRACKED_FILE_NOT_FOUND" });
    await saveTrackingEvent(id, {
      eventType: "download",
      userAgent: request.headers["user-agent"] || "",
      referrer: request.headers.referer || "",
    });
    response.writeHead(302, { Location: file.downloadUrl || file.blobUrl });
    response.end();
  } catch (error) {
    sendError(response, error);
  }
};
