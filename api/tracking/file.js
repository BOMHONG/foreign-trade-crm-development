const { getTrackedFile, sendError, sendJson } = require("../_tracking-store");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
    const id = String(request.query?.id || "").trim();
    if (!id) return response.status(400).json({ error: "MISSING_ID" });
    const file = await getTrackedFile(id);
    if (!file) return response.status(404).json({ error: "TRACKED_FILE_NOT_FOUND" });
    sendJson(response, 200, {
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
  } catch (error) {
    sendError(response, error);
  }
};
