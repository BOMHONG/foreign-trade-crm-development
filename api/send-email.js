const nodemailer = require("nodemailer");

const MAX_BODY_LENGTH = 12000;
const MAX_ATTACHMENT_TOTAL_BYTES = 20 * 1024 * 1024;

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = parseBody(request.body);

    // Test mode: verify SMTP connectivity without sending
    if (body.mode === 'test') {
      const account = body.account || {};
      const configs = getSmtpConfigs(account);
      if (!configs.length) {
        return response.status(503).json({ error: "SMTP_NOT_CONFIGURED", message: "SMTP未配置" });
      }
      let testResult = null;
      for (const config of configs) {
        try {
          const transporter = nodemailer.createTransport({
            host: config.host, port: config.port, secure: config.secure,
            requireTLS: config.requireTLS, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000,
            auth: { user: config.user, pass: config.pass },
          });
          const verified = await transporter.verify();
          if (verified) {
            return response.status(200).json({ ok: true, message: "SMTP连接成功", transport: `${config.host}:${config.port}` });
          }
        } catch (err) {
          testResult = err;
          continue;
        }
      }
      var errMsg = testResult?.message || testResult?.code || 'SMTP连接失败';
      if (errMsg && /invalid login|authentication failed|535/i.test(errMsg)) errMsg = '邮箱密码或授权码错误 (Authentication failed)';
      else if (errMsg && /connect|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(errMsg)) errMsg = '无法连接到SMTP服务器，请检查服务器地址和端口';
      else if (errMsg && /certificate|SSL|TLS/i.test(errMsg)) errMsg = 'SSL/TLS连接失败，请检查端口和安全设置';
      return response.status(503).json({ error: "SMTP_TEST_FAILED", message: errMsg });
    }

    const configs = getSmtpConfigs(body.account);
    if (!configs.length) {
      return response.status(503).json({ error: "SMTP_NOT_CONFIGURED" });
    }

    const to = parseRecipientList(body.to);
    const cc = parseRecipientList(body.cc);
    const bcc = parseRecipientList(body.bcc);
    const subject = String(body.subject || "").trim();
    const text = String(body.text || "").trim();
    const html = String(body.html || "").trim();

    if (!to.length) {
      return response.status(400).json({ error: "INVALID_RECIPIENT" });
    }

    if (!subject || !text) {
      return response.status(400).json({ error: "EMPTY_MESSAGE" });
    }

    if (text.length > MAX_BODY_LENGTH) {
      return response.status(400).json({ error: "MESSAGE_TOO_LONG" });
    }

    const attachmentTotal = getAttachmentTotalBytes(body.attachments);
    if (attachmentTotal > MAX_ATTACHMENT_TOTAL_BYTES) {
      return response.status(413).json({
        error: "ATTACHMENT_TOO_LARGE",
        message: "附件超过线上CRM直发限制。当前线上直发支持 20 MB 以内附件；更大的资料请使用云端追踪链接、Foxmail/Gmail 手动添加附件，或改用网盘链接。",
      });
    }

    let lastError = null;

    for (const config of configs) {
      try {
        const transporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          requireTLS: config.requireTLS,
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 15000,
          auth: {
            user: config.user,
            pass: config.pass,
          },
        });

        const info = await transporter.sendMail({
          from: formatSender(config.from, config.senderName),
          to,
          cc: cc.length ? cc : undefined,
          bcc: bcc.length ? bcc : undefined,
          replyTo: config.replyTo || config.from,
          subject,
          text,
          html: html || undefined,
          attachments: normalizeAttachments(body.attachments),
        });

        return response.status(200).json({
          ok: true,
          messageId: info.messageId || "",
          transport: `${config.host}:${config.port}`,
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Unable to send email");
  } catch (error) {
    return response.status(500).json({
      error: "SEND_FAILED",
      message: error?.message || "Unable to send email",
    });
  }
};

function getSmtpConfigs(account = null) {
  const accountConfig = normalizeAccountSmtpConfig(account);
  if (accountConfig) return expandChinaEmailSmtpCandidates(accountConfig);

  const host = process.env.SMTP_HOST || "";
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || user;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "false" ? false : port === 465;

  if (!host || !user || !pass || !from) return [];

  return expandChinaEmailSmtpCandidates({
    host,
    port,
    secure,
    user,
    pass,
    from,
    replyTo: process.env.SMTP_REPLY_TO || "",
  });
}

function normalizeAccountSmtpConfig(account = null) {
  if (!account || typeof account !== "object") return null;
  const host = String(account.smtpHost || account.host || "").trim();
  const user = String(account.email || account.user || "").trim();
  const pass = String(account.password || account.pass || "").trim();
  const from = String(account.from || account.email || account.user || "").trim();
  const port = Number(account.smtpPort || account.port || 465);
  if (!host || !user || !pass || !from || !Number.isFinite(port)) return null;
  return {
    host,
    port,
    secure: Boolean(account.ssl) || port === 465,
    requireTLS: Boolean(account.tls),
    user,
    pass,
    from,
    senderName: String(account.senderName || "").trim(),
    replyTo: String(account.replyTo || "").trim(),
  };
}

function expandChinaEmailSmtpCandidates(base) {
  const candidates = [];

  if (/chinaemail\.cn$/i.test(base.host) && base.port === 25) {
    candidates.push({ ...base, port: 465, secure: true });
    candidates.push({ ...base, host: "f.chinaemail.cn", port: 465, secure: true });
    candidates.push({ ...base, host: "hw.chinaemail.cn", port: 465, secure: true });
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

function formatSender(email, name) {
  if (!name) return email;
  return `"${String(name).replace(/"/g, "'")}" <${email}>`;
}

function getAttachmentTotalBytes(attachments) {
  if (!Array.isArray(attachments)) return 0;
  return attachments.reduce((total, file) => {
    if (Number(file?.size || 0)) return total + Number(file.size || 0);
    const dataUrl = String(file?.dataUrl || "");
    const match = dataUrl.match(/^data:([^;,]+)?(?:;[^,]*)?;base64,(.+)$/);
    if (match) return total + Math.floor((match[2].length * 3) / 4);
    return total + Buffer.byteLength(String(file?.content || ""), "utf8");
  }, 0);
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map((file) => {
      const filename = file?.name || file?.filename || "attachment";
      const dataUrl = String(file?.dataUrl || "");
      const match = dataUrl.match(/^data:([^;,]+)?(?:;[^,]*)?;base64,(.+)$/);
      if (match) {
        return {
          filename,
          content: Buffer.from(match[2], "base64"),
          contentType: match[1] || file.type || undefined,
        };
      }
      if (file?.content) {
        return {
          filename,
          content: String(file.content),
          contentType: file.type || undefined,
        };
      }
      return null;
    })
    .filter(Boolean);
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

function parseRecipientList(value) {
  const emails = String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  const seen = new Set();
  return emails
    .map((email) => email.toLowerCase())
    .filter((email) => {
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });
}
