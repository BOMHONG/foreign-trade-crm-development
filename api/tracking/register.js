const { parseBody, saveTrackedFile, sendError, sendJson } = require("../_tracking-store");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
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
    sendJson(response, 200, {
      ok: true,
      file: {
        ...record,
        previewUrl: `/track.html?id=${encodeURIComponent(record.id)}`,
        downloadUrl: `/api/tracking/download?id=${encodeURIComponent(record.id)}`,
      },
    });
  } catch (error) {
    sendError(response, error);
  }
};
