const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEFAULT_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = parseBody(request.body);
    const apiKey = String(body.apiKey || request.headers["x-deepseek-api-key"] || process.env.DEEPSEEK_API_KEY || "").trim();
    if (!apiKey) return response.status(503).json({ error: "DEEPSEEK_NOT_CONFIGURED" });

    const baseUrl = normalizeBaseUrl(body.baseUrl || request.headers["x-deepseek-base-url"] || DEFAULT_BASE_URL);
    const model = normalizeModel(body.model || request.headers["x-deepseek-model"] || DEFAULT_MODEL);
    const endpoint = `${baseUrl}/chat/completions`;
    const customer = body.customer || {};
    const messages = Array.isArray(body.messages) ? body.messages.slice(0, 30) : [];

    if (!messages.length) return response.status(400).json({ error: "EMPTY_HISTORY" });

    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You summarize foreign trade CRM email history for a Chinese coffee machine OEM/ODM factory. Return concise Simplified Chinese text only. Do not invent facts.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Summarize this customer's email history for sales follow-up.",
              customer,
              required_sections: [
                "客户最关心什么",
                "客户反对点",
                "客户采购进度",
                "客户是否测试过样品",
                "客户是否收到报价",
                "下次跟进建议",
              ],
              messages,
            }),
          },
        ],
        temperature: 0.25,
        max_tokens: 1200,
      }),
    });

    const result = await aiResponse.json();
    if (!aiResponse.ok) {
      return response.status(aiResponse.status).json({
        error: "DEEPSEEK_FAILED",
        message: result?.error?.message || "DeepSeek request failed",
      });
    }

    return response.status(200).json({
      ok: true,
      summary: result?.choices?.[0]?.message?.content || "",
    });
  } catch (error) {
    return response.status(500).json({
      error: "AI_SUMMARY_FAILED",
      message: error?.message || "Unable to summarize history",
    });
  }
};

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function normalizeBaseUrl(value) {
  const text = String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  if (!/^https:\/\/api\.deepseek\.com(?:\/v1)?$/i.test(text)) return DEFAULT_BASE_URL;
  return text;
}

function normalizeModel(value) {
  const model = String(value || DEFAULT_MODEL).trim();
  return ["deepseek-chat", "deepseek-v4-flash", "deepseek-v4-pro"].includes(model) ? model : DEFAULT_MODEL;
}
