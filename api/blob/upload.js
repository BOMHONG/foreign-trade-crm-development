const { isBlobConfigured, parseBody, saveTrackedFile, sendError } = require("../_tracking-store");

const MAX_TRACKED_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/plain",
  "text/csv",
  "text/html",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];

module.exports = async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
    if (!isBlobConfigured()) throw new Error("BLOB_STORAGE_NOT_CONFIGURED");
    const { handleUpload } = await import("@vercel/blob/client");
    const body = parseBody(request.body);
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!isAuthorized(request)) throw new Error("UNAUTHORIZED_UPLOAD");
        const payload = safeJson(clientPayload);
        const contentType = payload.contentType || "application/octet-stream";
        return {
          allowedContentTypes: ALLOWED_TYPES.includes(contentType) ? [contentType] : [contentType],
          maximumSizeInBytes: MAX_TRACKED_FILE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            trackingId: payload.trackingId || "",
            fileName: payload.fileName || pathname || "attachment",
            size: Number(payload.size || 0),
            type: contentType,
            recipientEmail: payload.recipientEmail || "",
            senderEmail: payload.senderEmail || "",
            subject: payload.subject || "",
            customerName: payload.customerName || "",
            createdBy: payload.createdBy || "",
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = safeJson(tokenPayload);
        if (!payload.trackingId || !blob?.url) return;
        await saveTrackedFile({
          id: payload.trackingId,
          fileName: payload.fileName,
          size: payload.size,
          type: payload.type,
          blobUrl: blob.url,
          downloadUrl: blob.downloadUrl || blob.url,
          recipientEmail: payload.recipientEmail,
          senderEmail: payload.senderEmail,
          subject: payload.subject,
          customerName: payload.customerName,
          createdBy: payload.createdBy,
        });
      },
    });
    response.status(200).json(jsonResponse);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED_UPLOAD") return response.status(401).json({ error: "UNAUTHORIZED_UPLOAD" });
    sendError(response, error);
  }
};

function safeJson(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function isAuthorized(request) {
  const username = process.env.CRM_AUTH_USER || "";
  const password = process.env.CRM_AUTH_PASSWORD || "";
  if (!username && !password) return isSameOriginRequest(request);
  if (!username || !password) return false;
  const authHeader = request.headers.authorization || request.headers.Authorization || "";
  const [scheme, encoded] = String(authHeader).split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const index = decoded.indexOf(":");
    return decoded.slice(0, index) === username && decoded.slice(index + 1) === password;
  } catch {
    return false;
  }
}

function isSameOriginRequest(request) {
  const origin = request.headers.origin || request.headers.Origin || "";
  const host = request.headers.host || request.headers.Host || request.headers["x-forwarded-host"] || "";
  if (!origin) return true;
  if (!host) return false;
  try {
    return new URL(origin).host === String(host).split(",")[0].trim();
  } catch {
    return false;
  }
}
