const net = require("net");
const tls = require("tls");

const MAX_MESSAGES = 30;
const MAX_LINES = 140;

module.exports = async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const body = request.method === "POST" ? parseBody(request.body) : {};
  const configs = getPop3Configs(body.account);
  if (!configs.length) {
    return response.status(503).json({ error: "POP3_NOT_CONFIGURED" });
  }

  let lastError = null;

  for (const config of configs) {
    try {
      const messages = await fetchInbox(config);
      return response.status(200).json({
        ok: true,
        transport: `${config.host}:${config.port}`,
        messages,
      });
    } catch (error) {
      lastError = error;
    }
  }

  return response.status(500).json({
    error: "INBOX_FAILED",
    message: lastError?.message || "Unable to load inbox",
  });
};

function getPop3Configs(account = null) {
  const accountConfig = normalizeAccountPop3Config(account);
  if (accountConfig) return expandChinaEmailPop3Candidates(accountConfig);

  const host = process.env.POP3_HOST || "";
  const user = process.env.POP3_USER || process.env.SMTP_USER || "";
  const pass = process.env.POP3_PASS || process.env.SMTP_PASS || "";
  const port = Number(process.env.POP3_PORT || 110);
  const secure = String(process.env.POP3_SECURE || "").toLowerCase() === "true";

  if (!host || !user || !pass) return [];

  return expandChinaEmailPop3Candidates({ host, port, secure, user, pass });
}

function normalizeAccountPop3Config(account = null) {
  if (!account || typeof account !== "object") return null;
  const host = String(account.pop3Host || account.popHost || account.imapHost || account.host || "").trim();
  const user = String(account.email || account.user || "").trim();
  const pass = String(account.password || account.pass || "").trim();
  const port = Number(account.pop3Port || account.popPort || account.imapPort || account.port || 110);
  if (!host || !user || !pass || !Number.isFinite(port)) return null;
  return {
    host,
    port,
    secure: Boolean(account.ssl) || port === 995,
    user,
    pass,
  };
}

function expandChinaEmailPop3Candidates(base) {
  const candidates = [];

  if (/chinaemail\.cn$/i.test(base.host)) {
    candidates.push({ ...base, port: 995, secure: true });
    candidates.push({ ...base, host: "f.chinaemail.cn", port: 995, secure: true });
    candidates.push({ ...base, host: "hw.chinaemail.cn", port: 995, secure: true });
  }

  candidates.push(base);

  const seen = new Set();
  return candidates.filter((config) => {
    const key = `${config.host}:${config.port}:${config.secure}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

async function fetchInbox(config) {
  const client = new Pop3Client(config);
  await client.connect();

  try {
    await client.command(`USER ${config.user}`);
    await client.command(`PASS ${config.pass}`);
    const stat = await client.command("STAT");
    const total = Number(stat.line.split(/\s+/)[1] || 0);
    const start = Math.max(1, total - MAX_MESSAGES + 1);
    const messages = [];

    for (let number = total; number >= start; number--) {
      const uid = await client.uid(number);
      const raw = await client.top(number, MAX_LINES);
      const parsed = parseEmail(raw);

      messages.push({
        uid,
        number,
        from: parsed.from,
        subject: parsed.subject || "(No subject)",
        date: parsed.date,
        snippet: parsed.snippet,
        body: parsed.body,
        bodyHtml: parsed.bodyHtml || null,
        attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
      });
    }

    await client.command("QUIT", { allowNegative: true });
    return messages;
  } finally {
    client.close();
  }
}

class Pop3Client {
  constructor(config) {
    this.config = config;
    this.socket = null;
    this.buffer = "";
  }

  connect() {
    return new Promise((resolve, reject) => {
      const options = {
        host: this.config.host,
        port: this.config.port,
        servername: this.config.host,
        timeout: 9000,
      };
      this.socket = this.config.secure ? tls.connect(options) : net.connect(options);
      this.socket.setEncoding("utf8");
      this.socket.on("data", (chunk) => {
        this.buffer += chunk;
      });
      this.socket.on("timeout", () => reject(new Error("POP3 connection timed out")));
      this.socket.on("error", reject);
      this.socket.on(this.config.secure ? "secureConnect" : "connect", async () => {
        try {
          const greeting = await this.readLine();
          if (!greeting.startsWith("+OK")) throw new Error(greeting);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async command(command, options = {}) {
    this.socket.write(`${command}\r\n`);
    const line = await this.readLine();

    if (!line.startsWith("+OK") && !options.allowNegative) {
      throw new Error(line);
    }

    return { line };
  }

  async uid(number) {
    const result = await this.command(`UIDL ${number}`);
    return result.line.split(/\s+/)[2] || String(number);
  }

  async top(number, lines) {
    this.socket.write(`TOP ${number} ${lines}\r\n`);
    const line = await this.readLine();

    if (!line.startsWith("+OK")) {
      this.socket.write(`RETR ${number}\r\n`);
      const retry = await this.readLine();
      if (!retry.startsWith("+OK")) throw new Error(retry);
    }

    return this.readMultiline();
  }

  readLine() {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        const index = this.buffer.indexOf("\r\n");
        if (index >= 0) {
          const line = this.buffer.slice(0, index);
          this.buffer = this.buffer.slice(index + 2);
          resolve(line);
          return;
        }
        if (Date.now() - started > 12000) {
          reject(new Error("POP3 response timed out"));
          return;
        }
        setTimeout(tick, 20);
      };
      tick();
    });
  }

  async readMultiline() {
    const lines = [];
    const started = Date.now();

    while (Date.now() - started < 15000) {
      const line = await this.readLine();
      if (line === ".") return lines.join("\r\n");
      lines.push(line.startsWith("..") ? line.slice(1) : line);
    }

    throw new Error("POP3 multiline response timed out");
  }

  close() {
    if (this.socket) this.socket.destroy();
  }
}

function parseEmail(raw) {
  const parts = raw.split(/\r?\n\r?\n/);
  const headerText = parts.shift() || "";
  const bodyText = parts.join("\n\n");
  const headers = parseHeaders(headerText);
  const extracted = extractBodyAndAttachments(bodyText, headers);
  const cleanBody = normalizeWhitespace(stripHtml(extracted.body)).trim();
  const bodyHtml = extracted.bodyHtml || null;

  return {
    from: decodeMime(headers.from || ""),
    subject: decodeMime(headers.subject || ""),
    date: headers.date || "",
    body: cleanBody,
    bodyHtml: bodyHtml,
    snippet: cleanBody.replace(/\s+/g, " ").slice(0, 180),
    attachments: extracted.attachments || [],
  };
}

function extractBodyAndAttachments(bodyText, headers = {}) {
  const contentType = parseContentType(headers["content-type"] || "");
  if (contentType.mime.startsWith("multipart/") && contentType.boundary) {
    const parts = splitMultipartBody(bodyText, contentType.boundary).map(parseMimePartFull);
    const plain = parts.find(function(p) { return p.mime === "text/plain" && p.body; });
    const html = parts.find(function(p) { return p.mime === "text/html" && p.body; });
    const attachments = parts.filter(function(p) { return p.isAttachment && p.filename; }).map(function(p) { return { name: p.filename, size: p.size || 0, type: p.mime || "" }; });
    return {
      body: plain?.body || html?.body || parts.find(function(p) { return p.body; })?.body || "",
      bodyHtml: html?.body || null,
      attachments: attachments,
    };
  }
  return {
    body: decodeBody(bodyText, headers["content-transfer-encoding"], contentType.charset),
    bodyHtml: null,
    attachments: [],
  };
}

function parseMimePartFull(partText) {
  var separator = partText.indexOf("\r\n\r\n");
  if (separator === -1) separator = partText.indexOf("\n\n");
  var headerText = separator !== -1 ? partText.slice(0, separator) : partText;
  var bodyText = separator !== -1 ? partText.slice(separator).replace(/^\r?\n\r?\n?/, "") : "";
  var headers = parseHeaders(headerText);
  var contentType = parseContentType(headers["content-type"] || "text/plain");
  var disposition = parseContentDisposition(headers["content-disposition"] || "");

  if (contentType.mime.startsWith("multipart/") && contentType.boundary) {
    var children = splitMultipartBody(bodyText, contentType.boundary).map(parseMimePartFull);
    var plain = children.find(function(p) { return p.mime === "text/plain" && p.body; });
    var html = children.find(function(p) { return p.mime === "text/html" && p.body; });
    var childAttachments = children.filter(function(p) { return p.isAttachment && p.filename; });
    return {
      mime: contentType.mime,
      body: plain?.body || html?.body || children.find(function(p) { return p.body; })?.body || "",
      bodyHtml: html?.body || null,
      isAttachment: false,
      filename: "",
      size: 0,
      attachments: childAttachments,
    };
  }

  var isAttachment = disposition === "attachment" || (contentType.mime && !contentType.mime.startsWith("text/") && headers["content-disposition"]);
  return {
    mime: contentType.mime,
    body: isAttachment ? "" : decodeBody(bodyText, headers["content-transfer-encoding"], contentType.charset),
    bodyHtml: null,
    isAttachment: isAttachment,
    filename: decodeMime(extractFilename(headers["content-disposition"] || headers["content-type"] || "")) || "",
    size: 0,
    attachments: [],
  };
}

function parseContentDisposition(value) {
  var match = String(value || "").match(/^\s*(inline|attachment)/i);
  return match ? match[1].toLowerCase() : "";
}

function extractFilename(value) {
  var match = String(value || "").match(/filename\s*=\s*(?:"([^"]*)"|([^\s;]*))/i);
  return match ? (match[1] || match[2] || "") : "";
}

function extractReadableBody(bodyText, headers = {}) {
  const contentType = parseContentType(headers["content-type"] || "");
  if (contentType.mime.startsWith("multipart/") && contentType.boundary) {
    const parts = splitMultipartBody(bodyText, contentType.boundary).map(parseMimePart);
    const plain = parts.find((part) => part.mime === "text/plain" && part.body)?.body;
    const html = parts.find((part) => part.mime === "text/html" && part.body)?.body;
    return plain || html || parts.find((part) => part.body)?.body || "";
  }
  return decodeBody(bodyText, headers["content-transfer-encoding"], contentType.charset);
}

function parseMimePart(partText) {
  const parts = String(partText || "").split(/\r?\n\r?\n/);
  const headerText = parts.shift() || "";
  const bodyText = parts.join("\n\n");
  const headers = parseHeaders(headerText);
  const contentType = parseContentType(headers["content-type"] || "text/plain");

  if (contentType.mime.startsWith("multipart/") && contentType.boundary) {
    const children = splitMultipartBody(bodyText, contentType.boundary).map(parseMimePart);
    return (
      children.find((part) => part.mime === "text/plain" && part.body) ||
      children.find((part) => part.mime === "text/html" && part.body) ||
      children.find((part) => part.body) ||
      { mime: contentType.mime, body: "" }
    );
  }

  return {
    mime: contentType.mime,
    body: decodeBody(bodyText, headers["content-transfer-encoding"], contentType.charset),
  };
}

function splitMultipartBody(body, boundary) {
  if (!boundary) return [];
  const marker = `--${boundary}`;
  return String(body || "")
    .split(marker)
    .map((part) => part.replace(/^\r?\n/, "").replace(/\r?\n$/, ""))
    .filter((part) => part && part.trim() !== "--" && !part.trim().startsWith("--"));
}

function parseContentType(value) {
  const source = String(value || "");
  const [mimePart, ...params] = source.split(";");
  const result = {
    mime: (mimePart || "text/plain").trim().toLowerCase(),
    charset: "utf-8",
    boundary: "",
  };
  params.forEach((param) => {
    const index = param.indexOf("=");
    if (index < 0) return;
    const key = param.slice(0, index).trim().toLowerCase();
    const rawValue = param.slice(index + 1).trim().replace(/^"|"$/g, "");
    if (key === "charset") result.charset = rawValue.toLowerCase();
    if (key === "boundary") result.boundary = rawValue;
  });
  return result;
}

function parseHeaders(text) {
  const lines = text.split(/\r?\n/);
  const unfolded = [];

  for (const line of lines) {
    if (/^\s/.test(line) && unfolded.length) unfolded[unfolded.length - 1] += ` ${line.trim()}`;
    else unfolded.push(line);
  }

  return Object.fromEntries(
    unfolded
      .map((line) => {
        const index = line.indexOf(":");
        if (index < 0) return null;
        return [line.slice(0, index).toLowerCase(), line.slice(index + 1).trim()];
      })
      .filter(Boolean),
  );
}

function decodeMime(value) {
  return String(value || "").replace(/=\?([^?]+)\?([QB])\?([^?]+)\?=/gi, (_, charset, encoding, text) => {
    const normalizedCharset = charset.toLowerCase();
    const source =
      encoding.toUpperCase() === "B"
        ? Buffer.from(text, "base64")
        : Buffer.from(text.replace(/_/g, " ").replace(/=([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))), "binary");

    if (normalizedCharset.includes("utf-8") || normalizedCharset.includes("utf8")) {
      return source.toString("utf8");
    }
    return source.toString("latin1");
  });
}

function decodeBody(value, encoding = "", charset = "utf-8") {
  const normalized = String(encoding || "").toLowerCase();
  const targetCharset = String(charset || "utf-8").toLowerCase();
  let buffer = null;
  if (normalized.includes("base64")) {
    buffer = Buffer.from(String(value || "").replace(/\s+/g, ""), "base64");
  } else if (normalized.includes("quoted-printable")) {
    buffer = Buffer.from(
      String(value || "")
        .replace(/=\r?\n/g, "")
        .replace(/=([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))),
      "binary",
    );
  } else {
    buffer = Buffer.from(String(value || ""), "utf8");
  }

  if (targetCharset.includes("utf-8") || targetCharset.includes("utf8")) {
    return buffer.toString("utf8");
  }
  if (targetCharset.includes("gb18030") || targetCharset.includes("gbk") || targetCharset.includes("gb2312")) {
    return buffer.toString("latin1");
  }
  return buffer.toString("utf8");
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
