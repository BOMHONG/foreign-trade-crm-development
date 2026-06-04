const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEFAULT_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = parseBody(request.body);
    const headers = request.headers || {};
    const getHeader = (name) => headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "";
    const apiKey = String(body.apiKey || getHeader("x-deepseek-api-key") || process.env.DEEPSEEK_API_KEY || "").trim();
    const baseUrl = normalizeBaseUrl(body.baseUrl || getHeader("x-deepseek-base-url") || DEFAULT_BASE_URL);
    const model = normalizeModel(body.model || getHeader("x-deepseek-model") || DEFAULT_MODEL);
    const endpoint = `${baseUrl}/chat/completions`;
    const mode = String(body.mode || "compose");
    const userRequest = String(body.userRequest || "").slice(0, 12000);
    const customer = body.customer || {};
    const currentDraft = String(body.currentDraft || "").slice(0, 12000);
    const research = String(body.research || "").slice(0, 16000);
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!userRequest && !research && !currentDraft) {
      return response.status(400).json({ error: "EMPTY_PROMPT" });
    }

    if (!apiKey) {
      return response.status(503).json({ error: "DEEPSEEK_NOT_CONFIGURED" });
    }

    const websiteResearch = await collectWebsiteResearch({ userRequest, customer, research });
    const enrichedResearch = [research, websiteResearch].filter(Boolean).join("\n\n").slice(0, 22000);
    const prompt = buildPrompt({ mode, userRequest, customer, currentDraft, research: enrichedResearch, history });
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
              "You are an expert foreign-trade sales assistant for Aison, a Chinese coffee machine OEM/ODM manufacturer (brand: Aison; company: Demo Export Company). The user may paste noisy LinkedIn, Facebook, Instagram, company website pages, executive posts, comments, product reviews, or buyer complaints. Ignore navigation, menus, notifications, footers, suggested profiles, and unrelated recommendations.\n\nPRODUCT LINE:\n- CM-1600B: premium, TFT display, built-in grinder — for brands upgrading their product line or entering the high-end segment\n- CM-1700MY: best value, mainstream commercial — for importers/distributors scaling their core range\n- CM-1302MYC / CM-1302N: with milk frother — for cappuccino/latte home markets\n- SKD/CKD kits: available for Iran and markets with import restrictions\n\nPRODUCT RECOMMENDATION LOGIC:\n- If customer already sells coffee machines → start with CM-1600B as an upgrade/differentiation option\n- If customer is a large appliance brand → position as expanding into small-appliance/coffee-appliance line\n- If customer is procurement/supply-chain focused → lead with supply stability, compliance docs, alternative supplier value\n- If Iran or similar restricted market → mention SKD/CKD capability\n- Default: CM-1700MY for mainstream value\n\nFORBIDDEN PHRASES (never use these):\n- Hope this email finds you well\n- leading manufacturer\n- high quality and competitive price\n- one-stop solution\n- win-win cooperation\n- dear sir/madam\n- I am writing to introduce\n- Please kindly find\n- Looking forward to your early reply\n- We are pleased to inform\n- It is our honor to\n- Best regards (use 'Best' or 'Regards' instead)\n\nWRITING RULES:\n- Open with one specific observation about the customer's context (their market, role, product line, or a public signal from their materials)\n- One email = one main entry point. Do not list multiple value propositions.\n- Goal: get a reply, not close a deal. Keep the ask minimal.\n- Length: 60-90 words for cold outreach, 90-130 words for follow-up, 120-160 words for formal/quote emails.\n- Write like a real person who did 2 minutes of research. Short sentences. No corporate tone.\n- End with a soft, specific question: 'Would it help if I sent 1-2 model options?' / 'Is this category something your team is reviewing?' / 'May I send the spec sheet for your reference?'\n- The email subject and body must be English only and must not contain Chinese words or Chinese CRM labels.\n- Sign as the Aison team, e.g. 'Best,\\n[name]\\nDemo Export Company'\n- Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 2600,
        response_format: { type: "json_object" },
      }),
    });

    const result = await aiResponse.json();
    if (!aiResponse.ok) {
      return response.status(aiResponse.status).json({
        error: "DEEPSEEK_FAILED",
        message: result?.error?.message || "DeepSeek request failed",
      });
    }

    const rawText = extractResponseText(result);
    const normalized = normalizeAiEmailResult(rawText, mode, customer);

    if (!normalized.recommendedBody) {
      return response.status(200).json({
        ok: true,
        recommendedSubject: normalized.recommendedSubject || "Coffee machine cooperation",
        recommendedBody: "(AI returned empty content. Please try again or use the local template.)",
        angleNote: "AI returned empty content.",
        keyPoints: [],
        breakthroughAngles: [],
      });
    }

    // Sanitize customer-facing fields
    normalized.recommendedSubject = sanitizeEnglishEmailTextStrict(normalized.recommendedSubject);
    normalized.recommendedBody = sanitizeEnglishEmailTextStrict(normalized.recommendedBody);
    if (!normalized.recommendedSubject) normalized.recommendedSubject = "Coffee machine cooperation";
    if (!normalized.recommendedBody) normalized.recommendedBody = "(Could not generate valid English email. Please try again.)";

    return response.status(200).json({
      ok: true,
      ...normalized,
    });
  } catch (error) {
    return response.status(500).json({
      error: "AI_EMAIL_FAILED",
      message: error?.message || "Unable to generate email",
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

function normalizeModel(value) {
  const model = String(value || DEFAULT_MODEL).trim();
  return ["deepseek-chat", "deepseek-v4-flash", "deepseek-v4-pro"].includes(model) ? model : DEFAULT_MODEL;
}

function normalizeBaseUrl(value) {
  const text = String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  if (!/^https:\/\/api\.deepseek\.com(?:\/v1)?$/i.test(text)) return DEFAULT_BASE_URL;
  return text;
}

async function collectWebsiteResearch({ userRequest = "", customer = {}, research = "" }) {
  const candidates = [
    userRequest,
    research,
    customer.website,
    customer.url,
    customer.homepage,
    customer.linkedin,
    customer.instagram,
    customer.facebook,
    customer.youtube,
  ];
  const urls = [...new Set(candidates.flatMap(extractPublicUrls))].filter(isSafePublicHttpUrl).slice(0, 2);
  if (!urls.length) return "";

  const blocks = [];
  for (const url of urls) {
    const text = await fetchReadableWebsiteText(url);
    if (!text) continue;
    blocks.push([
      `Fetched website/social page URL: ${url}`,
      "Readable page text extracted by CRM server for DeepSeek email personalization:",
      text,
    ].join("\n"));
  }
  return blocks.length ? `CRM server fetched public web context:\n\n${blocks.join("\n\n---\n\n")}` : "";
}

function extractPublicUrls(value = "") {
  const text = String(value || "");
  const matches = text.match(/(?:https?:\/\/|www\.)[^\s<>"'`]+/gi) || [];
  return matches
    .map((url) => url.replace(/[),.;\]}]+$/g, ""))
    .map((url) => (url.startsWith("www.") ? `https://${url}` : url));
}

function isSafePublicHttpUrl(value = "") {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("169.254.") ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      host === "::1" ||
      host === "0.0.0.0"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function fetchReadableWebsiteText(url) {
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 9000) : null;
    const result = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PUBLIC-CRM-DEMO/1.0; +https://example.com)",
        Accept: "text/html,text/plain,application/xhtml+xml",
      },
      signal: controller?.signal,
    });
    if (timer) clearTimeout(timer);
    if (!result.ok) return "";
    const contentType = String(result.headers?.get?.("content-type") || "");
    if (contentType && !/text\/|html|xml|json/i.test(contentType)) return "";
    const html = await result.text();
    return htmlToReadableText(html).slice(0, 8000);
  } catch {
    return "";
  }
}

function htmlToReadableText(html = "") {
  return decodeHtmlEntities(
    String(html || "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ")
      .replace(/<(br|p|div|li|tr|h[1-6])\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t\f\v]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function decodeHtmlEntities(text = "") {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      const num = Number(code);
      return Number.isFinite(num) ? String.fromCharCode(num) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const num = Number.parseInt(code, 16);
      return Number.isFinite(num) ? String.fromCharCode(num) : "";
    });
}

function buildPrompt({ mode, userRequest, customer, currentDraft, research, history }) {
  return JSON.stringify(
    {
      company: {
        brand: "Aison",
        manufacturer: "Demo Export Company",
        type: "Chinese coffee machine OEM/ODM manufacturer",
        contactName: "Lina Mei",
        contactEmail: "admin@example.com",
      },
      task:
        mode === "followup"
          ? "Write a follow-up email based on the previous outreach and customer context."
          : mode === "holiday"
            ? "Write a short holiday greeting email that is warm, culturally careful, and not pushy."
          : mode === "subject"
            ? "Generate only an English email subject line based on the customer context. Return subject in the JSON."
            : mode === "summarize"
              ? "Analyze the customer material and return keyPoints, breakthroughAngles, and notes. Do NOT generate an email body."
              : "Draft an outbound sales email. Simultaneously generate recommendedSubject, recommendedBody, and angleNote.",
      required_output: {
        recommendedSubject: "English-only email subject. No Chinese characters or Chinese CRM labels. 4-8 words, specific to customer context.",
        recommendedBody: "English-only plain text email body. No Chinese characters or Chinese CRM labels. Follow the word count rule for this mode. Sign as 'Best,\\nLina Mei\\nDemo Export Company'",
        angleNote: "Brief Simplified Chinese explanation (1-2 sentences): which customer insight was used, which product was recommended, and why.",
        keyPoints: "array of 4-6 concise Simplified Chinese bullets extracting useful customer/profile/company facts from pasted material",
        breakthroughAngles: "array of 3-5 concise Simplified Chinese bullets identifying the customer's likely concerns and practical sales entry points",
        notes: "brief Simplified Chinese explanation of which key point and breakthrough angle were used in the email body",
      },
      user_request: userRequest,
      customer_context: {
        company: customer.company || "",
        contact: customer.contact || "",
        title: customer.title || "",
        country: customer.country || "",
        segment: customer.segment || "",
        product: customer.product || "",
        notes: customer.notes || "",
        website: customer.website || customer.url || "",
        linkedin: customer.linkedin || "",
        instagram: customer.instagram || "",
        facebook: customer.facebook || "",
        youtube: customer.youtube || "",
        email: customer.email || "",
      },
      pasted_research_material: research,
      current_draft: currentDraft,
      conversation_history: history,
      source_material_handling: [
        "Treat pasted_research_material as a raw copied web page that may contain a lot of irrelevant UI text.",
        "First filter out navigation, notifications, follower suggestions, footer links, language lists, and unrelated recommended profiles/pages.",
        "Focus on named person, current company, role/title, location/country, tenure, experience, skills, mutual connections, stated industry, company product lines, brands, posts, comments, reviews, and customer complaints.",
        "Separate confirmed facts from cautious business hypotheses. Never present a hypothesis as a fact.",
        "If posts, reviews, comments, or complaints are present, identify the practical business issue: product gap, low margin, quality concern, after-sales issue, missing premium option, weak differentiation, packaging issue, delivery concern, or spare-parts concern.",
        "Infer likely business concerns from the buyer's role and company context, but label uncertain points cautiously.",
        "Use the strongest 1-2 safe facts in the email body. Keep deeper analysis in keyPoints, breakthroughAngles, and notes.",
      ],
      email_strategy_requirements: [
        "Before drafting, choose one concrete keyPoint and one concrete breakthroughAngle; the final email body must clearly reflect both.",
        "The opening line must reference a specific useful detail from the pasted material, such as import coordination, purchasing analysis, logistics operations, legal/compliance background, country market, packaging analysis, long tenure, company category, product range, public product launch, review signal, or buyer comment.",
        "The value proposition must connect that detail to a practical buyer concern: supplier reliability, compliance documents, OEM packaging, differentiated coffee-machine models, clear FOB options, sample evaluation, logistics lead time, cost control, margin growth, fewer after-sales issues, or spare-parts planning.",
        "If consumer complaints or review problems are present, mention the underlying business issue tactfully without sounding like you are criticizing the customer, for example: 'If your team is reviewing ways to improve the coffee-appliance range...' rather than 'your customers complain...'.",
        "If profit-growth or premium-category opportunity is present, connect Aison's product to higher perceived value, product differentiation, private label, or model upgrade.",
        "If company/product details are limited, do not write a vague 'brief chat' email. Offer a concrete low-friction next step, such as sending 2-3 suitable models, FOB ranges, compliance files, or a short supplier capability sheet.",
        "Use a subject line that combines the customer context and the offered value, not a generic partnership subject.",
        "Avoid these generic phrases unless followed by a specific insight: 'I noticed your background', 'we are looking for partners', 'would you be open to a brief chat'.",
        "Do not over-personalize or mention private-feeling monitoring. Sound like a prepared supplier who did a quick professional market check.",
        "Write like a person: short sentences, one useful observation, one practical value point, one clear next step. Avoid robotic transitions and inflated praise.",
      ],
      rules: [
        "Subject and body must be English only. Translate Chinese CRM labels such as 品牌商, 进口商, 批发商, 连锁零售商, 电商卖家 into English before writing.",
        "Write keyPoints, breakthroughAngles, and notes in Simplified Chinese.",
        "Use the customer's public information only as context; do not say you are monitoring them.",
        "Personalize with 1-2 specific but safe observations from the useful provided material, not from noisy page furniture.",
        "Keep the email easy to skim: 80-140 words for first outreach, short paragraphs, no aggressive sales tone.",
        "Ask for one low-friction next step that is concrete and useful to the buyer.",
        "If the material shows a long tenure, senior import/procurement role, packaging skill, buyer country, or company product category, consider those as possible entry points.",
        "Avoid overpraising in a way that feels exaggerated. Respect experience, then quickly connect to procurement value.",
        "The body must not be a generic template. If it could be sent unchanged to any importer, rewrite it.",
        "Do not include markdown fences.",
        "Return valid JSON only.",
      ],
    },
    null,
    2,
  );
}

function extractResponseText(result) {
  return result?.choices?.[0]?.message?.content || "";
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function stripCodeFence(text = "") {
  let t = String(text || "").trim();
  // Remove ```json ... ``` or ``` ... ``` wrappers
  t = t.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  return t.trim();
}

function safeJsonParse(text = "") {
  // Try direct parse
  try { const obj = JSON.parse(text); if (obj && typeof obj === "object") return obj; } catch {}
  // Strip code fences and retry
  const stripped = stripCodeFence(text);
  if (stripped !== text) {
    try { const obj = JSON.parse(stripped); if (obj && typeof obj === "object") return obj; } catch {}
  }
  // Try extracting JSON object with regex
  const match = (text.match(/\{[\s\S]*\}/) || [])[0];
  if (match) {
    try { const obj = JSON.parse(match); if (obj && typeof obj === "object") return obj; } catch {}
    // Try with stripped code fence
    const strippedMatch = stripCodeFence(match);
    try { const obj = JSON.parse(strippedMatch); if (obj && typeof obj === "object") return obj; } catch {}
  }
  return null;
}

function normalizeAiEmailResult(rawText = "", mode = "compose", customer = {}) {
  const json = safeJsonParse(rawText);

  // Field name aliases: map whatever DeepSeek returns to our standard names
  const subject = json?.recommendedSubject || json?.subject || json?.title || json?.recommended_subject || "";
  const body = json?.recommendedBody || json?.body || json?.email || json?.content || json?.text || "";
  const angleNote = json?.angleNote || json?.notes || json?.explanation || "";
  const keyPoints = Array.isArray(json?.keyPoints) ? json.keyPoints : (Array.isArray(json?.key_points) ? json.key_points : []);
  const breakthroughAngles = Array.isArray(json?.breakthroughAngles) ? json.breakthroughAngles : (Array.isArray(json?.breakthrough_angles) ? json.breakthrough_angles : []);

  // If we got valid subject+body from JSON, return normalized
  if (subject && body) {
    return { recommendedSubject: subject, recommendedBody: body, angleNote: angleNote || "AI returned structured JSON; normalized fields.", keyPoints, breakthroughAngles };
  }

  // JSON exists but with partial fields
  if (body) {
    const genSubject = generateSubjectFromBody(body, customer);
    return { recommendedSubject: genSubject, recommendedBody: body, angleNote: "AI returned JSON with body only; subject generated locally.", keyPoints, breakthroughAngles };
  }

  // Body is empty but we have analysis data — synthesize a body
  if (keyPoints.length > 0 || angleNote) {
    const synthesized = synthesizeBodyFromAnalysis({ keyPoints, angleNote, customer, mode });
    return {
      recommendedSubject: synthesized.subject,
      recommendedBody: synthesized.body,
      angleNote: angleNote || "AI returned analysis without email body; body synthesized locally.",
      keyPoints,
      breakthroughAngles,
    };
  }

  // No valid JSON — treat raw text as email body
  return fallbackPlainTextToEmailResult(rawText, mode, customer);
}

function synthesizeBodyFromAnalysis({ keyPoints = [], angleNote = "", customer = {}, mode = "compose" }) {
  const company = customer.company || "";
  const contact = customer.contact || "";
  const country = customer.country || "";
  const product = customer.product || "CM-1700MY";

  // Build subject
  let subject = "Coffee machine option";
  if (company) subject += ` for ${company}`;
  if (country) subject += ` ${country}`;

  // Extract brand clues from analysis data
  const allAnalysis = [angleNote, ...keyPoints].filter(Boolean).join(" ");
  const brandMatch = allAnalysis.match(/(?:Brand clues|品牌线索|brands? like)[:\s]*([A-Za-z][A-Za-z\s,]+?)(?:\.|$|\n)/i);
  const brandClues = brandMatch ? brandMatch[1].replace(/\s+/g, " ").trim() : "";

  // Build natural observation
  let observation = "";
  if (company && country) {
    if (brandClues) {
      observation = `I noticed ${company} works across brands like ${brandClues}, with sourcing activity in ${country}`;
    } else {
      observation = `I noticed ${company} has sourcing activity in ${country}`;
    }
  } else if (company) {
    observation = `I came across ${company} and wanted to reach out`;
  } else if (country) {
    observation = `I've been looking at the market in ${country}`;
  } else {
    observation = `I wanted to reach out about a coffee machine option`;
  }

  const greeting = contact ? `Hi ${contact},` : `Hi,`;

  const body = `${greeting}

${observation}.

For coffee appliances, Aison may be able to support a practical option like ${product}${country ? ", especially if your team is reviewing cost-effective models for a new or refreshed line" : ""}.

Would it be useful if I send 1-2 model options with FOB range and key specs first?

Best,
Lina
Demo Export Company`;

  return { subject, body };
}

function generateSubjectFromBody(body = "", customer = {}) {
  const text = String(body || "").trim();
  if (!text) {
    // Generate from customer context
    const company = customer.company || "";
    const product = customer.product || "coffee machine";
    return company ? `${product} option for ${company}` : "Coffee machine cooperation";
  }
  // Take first line, remove Hi/Hello salutation, cap at 60 chars
  let firstLine = text.split(/\n/)[0].replace(/^(Hi|Hello|Dear|Hey)\s+[^,\n]*[,;]?\s*/i, "").trim();
  if (!firstLine) firstLine = text.split(/\n/)[1] || text.slice(0, 60);
  firstLine = firstLine.replace(/[,.!;:]$/g, "").trim();
  if (firstLine.length > 60) firstLine = firstLine.slice(0, 57) + "...";
  return firstLine || generateSubjectFromBody("", customer);
}

function fallbackPlainTextToEmailResult(rawText = "", mode = "compose", customer = {}) {
  const text = String(rawText || "").trim();
  // If the text looks like an email (has greeting or signature), use it directly
  const looksLikeEmail = /^(Hi|Hello|Hey|Dear|Good (morning|afternoon|evening))/im.test(text);
  if (looksLikeEmail && text.length > 30) {
    const subject = generateSubjectFromBody(text, customer);
    return { recommendedSubject: subject, recommendedBody: text, angleNote: "AI returned plain text email; normalized locally.", keyPoints: [], breakthroughAngles: [] };
  }
  // Text is too short or doesn't look like email
  if (text.length > 30) {
    const subject = generateSubjectFromBody(text, customer);
    return { recommendedSubject: subject, recommendedBody: text, angleNote: "AI returned plain text; normalized locally.", keyPoints: [], breakthroughAngles: [] };
  }
  // If text looks like pure JSON (had keyPoints but no body), synthesize instead of returning empty
  if (text.startsWith("{") && text.includes("keyPoints")) {
    // Already handled earlier by synthesizeBodyFromAnalysis — this is last resort
    const synthesized = synthesizeBodyFromAnalysis({ keyPoints: [], angleNote: "", customer, mode });
    return { recommendedSubject: synthesized.subject, recommendedBody: synthesized.body, angleNote: "AI response was JSON-only analysis; body synthesized.", keyPoints: [], breakthroughAngles: [] };
  }
  // Last resort: synthesize from customer context only
  const synthesized = synthesizeBodyFromAnalysis({ keyPoints: [], angleNote: "", customer, mode });
  return { recommendedSubject: synthesized.subject, recommendedBody: synthesized.body, angleNote: "AI returned unparseable response; body synthesized from context.", keyPoints: [], breakthroughAngles: [] };
}

function sanitizeEnglishEmailTextStrict(value = "") {
  let text = String(value || "");
  const labelMap = [
    ["\u5c0f\u5bb6\u7535\u54c1\u54c1\u724c\u5546", "small appliance brand owner"],
    ["\u5bb6\u7535\u54c1\u724c\u5546", "home appliance brand owner"],
    ["\u5496\u5561\u8bbe\u5907\u54c1\u724c\u5546", "coffee equipment brand owner"],
    ["\u5496\u5561\u8bbe\u5907\u4f9b\u5e94\u5546", "coffee equipment supplier"],
    ["\u5bb6\u7535\u8fdb\u53e3\u5546", "home appliance importer"],
    ["\u5496\u5561\u8bbe\u5907\u8fdb\u53e3\u5546", "coffee equipment importer"],
    ["\u53a8\u623f\u7535\u5668\u6279\u53d1\u5546", "kitchen appliance wholesaler"],
    ["\u8fde\u9501\u96f6\u552e\u5546", "retail chain"],
    ["\u7535\u5546\u5356\u5bb6", "e-commerce seller"],
    ["\u8de8\u5883\u7535\u5546", "cross-border e-commerce seller"],
    ["\u533a\u57df\u578b\u54c1\u724c\u5546", "regional brand owner"],
    ["\u54c1\u724c\u5546", "brand owner"],
    ["\u8fdb\u53e3\u5546", "importer"],
    ["\u6279\u53d1\u5546", "wholesaler"],
    ["\u96f6\u552e\u5546", "retailer"],
    ["\u4ee3\u7406\u5546", "distributor"],
    ["\u81ea\u4e3b\u5f00\u53d1", "self-developed lead"],
    ["\u793e\u4ea4\u5e73\u53f0", "social media"],
    ["\u793e\u5a92", "social media"],
    ["\u5f00\u53d1\u4fe1", "outreach email"],
    ["\u8ddf\u8fdb\u90ae\u4ef6", "follow-up email"],
    ["\u62a5\u4ef7\u540e\u8ddf\u8fdb", "quotation follow-up"],
    ["\u6837\u54c1\u8ddf\u8fdb", "sample follow-up"],
    ["\u6c89\u7761\u5ba2\u6237\u5524\u9192", "dormant customer reactivation"],
    ["\u63a8\u8350\u4ea7\u54c1", "recommended product"],
    ["\u5ba2\u6237\u6765\u6e90", "customer source"],
    ["\u5ba2\u6237\u7b49\u7ea7", "customer level"],
    ["\u4ed8\u6b3e\u98ce\u9669", "payment risk"],
    ["小家电品牌商", "small appliance brand owner"],
    ["家电品牌商", "home appliance brand owner"],
    ["咖啡设备品牌商", "coffee equipment brand owner"],
    ["咖啡设备供应商", "coffee equipment supplier"],
    ["家电进口商", "home appliance importer"],
    ["咖啡设备进口商", "coffee equipment importer"],
    ["厨房电器批发商", "kitchen appliance wholesaler"],
    ["连锁零售商", "retail chain"],
    ["电商卖家", "e-commerce seller"],
    ["跨境电商", "cross-border e-commerce seller"],
    ["区域型品牌商", "regional brand owner"],
    ["品牌商", "brand owner"],
    ["进口商", "importer"],
    ["批发商", "wholesaler"],
    ["零售商", "retailer"],
    ["代理商", "distributor"],
    ["自主开发", "self-developed lead"],
    ["社交平台", "social media"],
    ["社媒", "social media"],
    ["开发信", "outreach email"],
    ["跟进邮件", "follow-up email"],
    ["报价后跟进", "quotation follow-up"],
    ["样品跟进", "sample follow-up"],
    ["沉睡客户唤醒", "dormant customer reactivation"],
    ["推荐产品", "recommended product"],
    ["客户来源", "customer source"],
    ["客户等级", "customer level"],
    ["付款风险", "payment risk"],
  ];
  labelMap.sort((a, b) => b[0].length - a[0].length).forEach(([from, to]) => {
    text = text.replaceAll(from, to);
  });
  text = text
    .replace(/[，]/g, ",")
    .replace(/[。]/g, ".")
    .replace(/[；]/g, ";")
    .replace(/[：]/g, ":")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
  return text
    .split(/\r?\n/)
    .map((line) => {
      const cjkCount = (line.match(/[\u3400-\u9fff]/g) || []).length;
      const latinCount = (line.match(/[A-Za-z]/g) || []).length;
      if (!cjkCount) return line;
      if (latinCount === 0 || cjkCount > latinCount) return "";
      return line.replace(/[\u3400-\u9fff]+/g, "").replace(/\s{2,}/g, " ").trim();
    })
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeEnglishEmailText(value = "") {
  const replacements = [
    ["品牌商", "brand owner"],
    ["进口商", "importer"],
    ["批发商", "wholesaler"],
    ["连锁零售商", "retail chain"],
    ["零售商", "retailer"],
    ["电商卖家", "e-commerce seller"],
    ["咖啡设备供应商", "coffee equipment supplier"],
    ["小家电品牌商", "small appliance brand owner"],
    ["家电品牌商", "home appliance brand owner"],
    ["厨房电器批发商", "kitchen appliance wholesaler"],
    ["开发信", "outreach email"],
    ["跟进邮件", "follow-up email"],
  ];
  let text = String(value || "");
  replacements.sort((a, b) => b[0].length - a[0].length).forEach(([from, to]) => {
    text = text.replaceAll(from, to);
  });
  return text.replace(/[，。；：、]/g, (mark) => ({ "，": ",", "。": ".", "；": ";", "：": ":", "、": "," })[mark] || mark);
}
