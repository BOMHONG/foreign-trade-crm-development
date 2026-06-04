const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEFAULT_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = parseBody(request.body);
    const apiKey = String(body.apiKey || process.env.DEEPSEEK_API_KEY || "").trim();
    if (!apiKey) return response.status(503).json({ error: "DEEPSEEK_NOT_CONFIGURED" });

    const baseUrl = normalizeBaseUrl(body.baseUrl || DEFAULT_BASE_URL);
    const model = normalizeModel(body.model || DEFAULT_MODEL);
    const endpoint = `${baseUrl}/chat/completions`;
    const task = String(body.task || "").trim();

    // --- Website analysis special path ---
    if (task === "analyze-website") {
      const url = String(body.url || body.input || "").trim();
      if (!url) return response.status(400).json({ error: "URL_REQUIRED" });

      let websiteText = "";
      try {
        const fetchResult = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; FORYAL-CRM/1.0)" },
          signal: AbortSignal.timeout(15000),
        });
        if (fetchResult.ok) {
          const html = await fetchResult.text();
          websiteText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
            .replace(/\s+/g, " ").trim().slice(0, 6000);
        }
      } catch { /* proceed without content */ }

      const customerContext = body.customerContext ? JSON.parse(String(body.customerContext)) : {};

      const aiResponse = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: WEBSITE_ANALYSIS_SYSTEM_PROMPT },
            { role: "user", content: JSON.stringify({
              url, website_content: websiteText || "(无法获取网站内容，请基于URL和公司名分析)",
              company: customerContext.company || "", country: customerContext.country || "",
              product: customerContext.product || "咖啡机",
            })},
          ],
          temperature: 0.25, max_tokens: 2000, response_format: { type: "json_object" },
        }),
      });

      const result = await aiResponse.json();
      if (!aiResponse.ok) {
        return response.status(aiResponse.status).json({ error: "DEEPSEEK_FAILED", message: result?.error?.message || "DeepSeek request failed" });
      }
      const content = result?.choices?.[0]?.message?.content || "{}";
      let analysis;
      try { analysis = JSON.parse(content); }
      catch { analysis = { summary: content, rawOutput: true }; }
      return response.status(200).json({ ok: true, ...analysis });
    }

    // --- Customer profile parsing ---
    if (task === "parse-customer-profile") {
      const inputText = String(body.input || "").trim();
      if (!inputText) return response.status(400).json({ error: "INPUT_REQUIRED" });

      const aiResponse = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: PARSE_PROFILE_SYSTEM_PROMPT },
            { role: "user", content: inputText.slice(0, 8000) },
          ],
          temperature: 0.1, max_tokens: 1500, response_format: { type: "json_object" },
        }),
      });
      const result = await aiResponse.json();
      if (!aiResponse.ok) {
        return response.status(aiResponse.status).json({ error: "DEEPSEEK_FAILED", message: result?.error?.message || "DeepSeek request failed" });
      }
      const content = result?.choices?.[0]?.message?.content || "{}";
      let parsed;
      try { parsed = JSON.parse(content); }
      catch { parsed = { notes: content, rawOutput: true }; }
      return response.status(200).json({ ok: true, ...parsed });
    }

    // --- Generic AI task path (existing behavior) ---
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
              "You are a pragmatic FORYAL foreign-trade CRM assistant for a Chinese coffee machine OEM/ODM factory. Return concise Simplified Chinese output. Do not claim an action was saved; the front-end will ask user confirmation separately.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: body.task || "",
              customer_or_company: body.customer || "",
              product: body.product || "",
              user_input: body.input || "",
              local_rule_output: body.localOutput || "",
              required: [
                "Use structure with clear sections.",
                "Keep output actionable for a 2-person foreign trade team.",
                "For emails or WhatsApp, only draft content. Never say it was sent.",
                "For risk/value/product judgments, include reason and next action.",
              ],
            }),
          },
        ],
        temperature: 0.25,
        max_tokens: 1400,
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
      output: result?.choices?.[0]?.message?.content || "",
    });
  } catch (error) {
    return response.status(500).json({
      error: "AI_TASK_FAILED",
      message: error?.message || "Unable to run AI task",
    });
  }
};

const WEBSITE_ANALYSIS_SYSTEM_PROMPT = `You are a senior B2B foreign trade analyst specializing in coffee machines and small appliances. Your client is FORYAL, a Chinese OEM/ODM coffee machine factory.

Analyze the provided website content and URL to extract structured business intelligence. Be factual. If something cannot be determined, write "未知".

CRITICAL LANGUAGE RULE:
- Output Simplified Chinese only for all analysis fields.
- The source website may contain Hebrew, Arabic, Farsi, Spanish, German, French, Portuguese, Turkish, Russian, Japanese, Korean, etc.
- Translate every product/category/business-model term into Simplified Chinese.
- Do not output original foreign scripts such as Hebrew or Arabic.
- Product names should be converted into Chinese product categories, not copied literally.

Use these product-category translations when relevant:
- espresso machine / coffee machine / מכונת אספרסו / מוצרי קפה -> 咖啡机 / 咖啡相关产品
- kitchen appliances / מכשירי חשמל למטבח -> 厨房小家电
- household appliances / מכשירי חשמל ביתיים -> 家用电器
- large kitchen appliances / מוצרי מטבח גדולים -> 大型厨房电器
- small kitchen appliances / מוצרי מטבח קטנים -> 厨房小家电
- heating/cooling / חימום וקירור הבית -> 取暖与制冷电器
- hair care / טיפוח ועיצוב השיער -> 个人护理电器
- cleaning/laundry/ironing / ניקיון וגיהוץ כביסה -> 清洁、熨烫与洗衣电器

Return your analysis as a JSON object with these exact keys:
- companySize: "小型(<50人)" / "中型(50-200人)" / "大型(200+人)" / "未知"
- mainProducts: array of Simplified Chinese product categories only
- importsFromChina: "是" / "否" / "可能" / "未知"
- importCategories: array of Simplified Chinese product categories
- keyPersons: array of {name, title, linkedin}; title must be Simplified Chinese where possible
- businessModel: 品牌商 / 进口商 / 批发商 / 分销商 / 连锁零售商 / 电商卖家 / 制造商 / 其他
- coffeeRelevance: "高" / "中" / "低"
- recommendedProduct: best FORYAL product match from [CM-1600B, CM-1700MY, CM-1302MYC, OEM Project, Private Label Project, SKD Project, CKD Project]
- developmentSuggestions: 2-3 specific suggestions in Simplified Chinese
- summary: brief Simplified Chinese summary of the company and its relevance to FORYAL

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code fences.`;

const PARSE_PROFILE_SYSTEM_PROMPT = `You are a data extraction assistant for a CRM system. Extract structured contact and company information from the provided text.

The text may contain: business cards, LinkedIn profiles, WhatsApp messages, company introductions, email signatures, trade show badge info, or copied web content.

Return a JSON object with these keys (use "" or [] for missing values):
{
  "company": "Company name in its original language",
  "country": "Country name in Chinese (e.g., 德国, 阿联酋, 伊朗)",
  "website": "Company website URL if found",
  "contactName": "Primary contact person's full name",
  "contactTitle": "Job title (e.g., CEO, Sourcing Manager, Purchasing Director)",
  "email": "Email address",
  "phone": "Phone number",
  "whatsapp": "WhatsApp number",
  "linkedin": "LinkedIn profile URL",
  "instagram": "Instagram profile URL",
  "source": "Best guess at how this lead was found (社媒/LinkedIn/展会/Google/海关数据/官网询盘/转介绍)",
  "industry": "Industry category from: 小家电品牌商/家电进口商/厨房电器批发商/区域型品牌商/连锁零售商/电商卖家/咖啡烘焙商",
  "customerType": "从以下选择: 品牌商/进口商/批发商/连锁零售商/电商卖家/咖啡设备供应商/咖啡设备进口商",
  "product": "Suggested FORYAL product from: CM-1600B/CM-1700MY/CM-1302MYC/OEM Project/Private Label Project",
  "notes": "Any additional useful information",
  "contacts": [{"name":"","title":"","email":"","phone":"","whatsapp":"","linkedin":""}]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code fences. Use Simplified Chinese for country, industry, and customerType.`;

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
