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

    const url = String(body.url || "").trim();
    if (!url) return response.status(400).json({ error: "URL_REQUIRED" });

    const baseUrl = normalizeBaseUrl(body.baseUrl || DEFAULT_BASE_URL);
    const model = normalizeModel(body.model || DEFAULT_MODEL);
    const endpoint = `${baseUrl}/chat/completions`;

    // Attempt to fetch website content
    let websiteText = "";
    try {
      const fetchResult = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FORYAL-CRM/1.0)" },
        signal: AbortSignal.timeout(15000),
      });
      if (fetchResult.ok) {
        const html = await fetchResult.text();
        websiteText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 8000);
      }
    } catch {
      // Website fetch failed — AI will work with URL alone
    }

    const customerContext = body.customerContext ? JSON.parse(String(body.customerContext)) : {};

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
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: JSON.stringify({
              url,
              website_content: websiteText || "(无法获取网站内容，请基于URL和公司名分析)",
              company: customerContext.company || "",
              country: customerContext.country || "",
              product: customerContext.product || "咖啡机",
            }),
          },
        ],
        temperature: 0.25,
        max_tokens: 2500,
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

    const content = result?.choices?.[0]?.message?.content || "{}";
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      analysis = { summary: content, rawOutput: true };
    }
    if (analysis.importCapability && !analysis.importsFromChina) {
      analysis.importsFromChina = analysis.importCapability;
    }
    if (analysis.importsFromChina && !analysis.importCapability) {
      analysis.importCapability = analysis.importsFromChina;
    }

    // Filter out invalid keyPersons — never return placeholder contacts
    if (Array.isArray(analysis.keyPersons)) {
      const invalidNames = /^(未知|unknown|N\/A|none|null|产品经理|采购经理|CEO|CTO|CFO|经理|主管|负责人)$/i;
      analysis.keyPersons = analysis.keyPersons.filter(function(p) {
        if (!p || typeof p !== 'object') return false;
        var name = String(p.name || '').trim();
        if (!name || invalidNames.test(name)) return false;
        // Only keep linkedin if it's a real URL
        if (p.linkedin) {
          var li = String(p.linkedin).trim();
          if (!/^https?:\/\/(?:www\.)?linkedin\.com\//i.test(li)) p.linkedin = '';
        }
        return true;
      });
    }
    if (!analysis.keyPersons || !analysis.keyPersons.length) {
      analysis.keyPersons = [];
    }

    return response.status(200).json({
      ok: true,
      ...analysis,
    });
  } catch (error) {
    return response.status(500).json({
      error: "AI_WEBSITE_FAILED",
      message: error?.message || "Unable to analyze website",
    });
  }
};

const SYSTEM_PROMPT = `You are a senior B2B foreign trade analyst specializing in the coffee machine and small appliance industry. Your client is FORYAL, a Chinese OEM/ODM coffee machine factory (Demo Export Company) that targets overseas importers, distributors, brand owners, and chain retailers.

## Your Task

Analyze the provided website content and URL to extract structured business intelligence. Be factual and rigorous. If you cannot determine something, say "未知".

## CRITICAL: 100% Chinese Output — NO Foreign Language

The website may contain text in ANY language (Hebrew, Arabic, Farsi, Spanish, Turkish, German, French, Portuguese, etc.).
You MUST translate EVERYTHING into Simplified Chinese (简体中文).
**DO NOT output any foreign language text.** No original script. No Arabic. No Hebrew. No exceptions.

Product names must be translated into Chinese CATEGORIES, not literal translations:
- "מכונת אספרסו" → "浓缩咖啡机"
- "מכשירי חשמל למטבח" → "厨房小家电"
- "مكواة بخار" → "蒸汽熨斗"
- "licuadora profesional" → "商用搅拌机"
- "Küchengeräte" → "厨房电器"
- "aspirateur sans fil" → "无线吸尘器"

Valid product categories (pick the closest match):
咖啡机 / 磨豆机 / 厨房小家电 / 榨汁机 / 搅拌机 / 电热水壶 / 烤面包机 / 微波炉 / 吸尘器 / 电风扇 / 个人护理电器 / 大家电 / 商用厨房设备 / 咖啡器具 / 咖啡豆 / 烘焙设备 / 制冷设备 / 其他小家电

If you cannot determine the exact product, output: "未明确（网站显示家电/电器类产品）"

## Coffee Machine Opportunity Assessment

When evaluating whether this company is a good fit for FORYAL's coffee machine business, do NOT just check if they already sell coffee machines. Evaluate ALL of the following:

### Primary Indicators (High Weight):
1. ☕ Currently sells coffee machines or espresso equipment
2. 🏪 Sells kitchen appliances (coffee makers, blenders, toasters, ovens, food processors, etc.)
3. 🔌 Sells small household appliances (small home appliances, home electronics)
4. 🇨🇳 Already imports from China (look for: "China", "import", "sourcing", "supply chain", "Asia", "Far East", "OEM", "ODM")
5. 🌐 Has national/regional distribution channels (dealers, retail network, multiple locations, nationwide delivery)

### Secondary Indicators (Medium Weight):
6. 🏷️ Has own brand(s) or private label business
7. 📦 Offers after-sales service or spare parts
8. 🏭 Has own warehouse or logistics infrastructure
9. 📱 Active on social media or B2B platforms (LinkedIn, Alibaba, Made-in-China)
10. 🌍 Serves multiple countries or regions

### Opportunity Level Calculation:
- **高 (High)**: 3+ primary indicators met, OR 2 primary + 3+ secondary
- **中 (Medium)**: 1-2 primary indicators met, OR 1 primary + 2+ secondary
- **低 (Low)**: 0 primary indicators met, OR only secondary indicators

## FORYAL Product Portfolio

FORYAL's coffee machine models and their target markets:

| Model | Type | Target Customer |
|-------|------|----------------|
| CM-1600B | Entry-level commercial | Small cafes, offices, budget-conscious importers |
| CM-1700MY | Mid-range commercial | Medium cafes, restaurant chains, distributors |
| CM-1302MYC | High-end commercial | Premium cafes, hotels, specialty coffee shops |
| OEM Project | Custom manufacturing | Brand owners, private label, chain standardization |
| Private Label Project | White-label | Retailers, e-commerce brands, regional distributors |
| SKD Project | Semi-knocked-down kit | Local assemblers in emerging markets |
| CKD Project | Completely-knocked-down kit | Large importers with local assembly capability |

## Development Suggestions — FORYAL 5-Step Format

Generate 3 specific, actionable development suggestions in Chinese. Each must follow this 5-step structure:

1. **联系人**: 建议联系谁（采购经理 / CEO / 产品经理 / 进口负责人）
2. **切入型号**: 推荐FORAYL哪个型号切入，为什么
3. **沟通话术**: 具体说什么（1-2句话即可）
4. **合作模式**: 适合 OEM / ODM / Private Label / 品牌代理 / 独家代理
5. **下一步动作**: 发目录 / 寄样品 / 视频会议 / 展会邀约 / 发FOB报价单

FORBIDDEN:
- "可以发送邮件联系客户" ❌
- "建立长期合作关系" ❌
- "了解客户需求" ❌

REQUIRED format:
"联系采购经理，推荐CM-1700MY切入（中端商用适合该客户定位）。话术：强调FORYAL的CE认证和欧洲已有3个经销商案例。适合OEM合作模式。下一步：发送产品目录+FOB报价单，邀约视频会议。"

## Output Format

Return a JSON object with these EXACT keys. All Chinese text must be in Simplified Chinese (简体中文):

{
  "companySize": "公司规模描述，如'中型(50-200人)'或'未知'",
  "mainProducts": ["产品1的简体中文类别", "产品2的简体中文类别", ...],
  "businessModel": "品牌商/进口商/批发商/连锁零售商/电商卖家/制造商/其他",
  "importCapability": "描述其进口能力和经验，如'有丰富中国进口经验，主要从宁波/深圳港进口家电'或'未发现进口中国产品迹象'或'可能通过贸易公司间接进口'",
  "importsFromChina": "是否可能/已经从中国进口。必须用简体中文说明证据，例如'可能从中国进口，小家电品类适合中国供应链'或'未发现中国进口迹象'",
  "coffeeOpportunity": "高/中/低",
  "opportunityReason": "用1-2句话解释为什么给出这个评级，列出命中的指标",
  "recommendedModel": "推荐的FORYAL型号（必选：CM-1600B/CM-1700MY/CM-1302MYC/OEM Project/Private Label Project/SKD Project/CKD Project）",
  "modelReason": "用2-3句话解释推荐理由：为什么这个型号适合该客户？价格定位如何匹配？市场同类竞品对比？",
  "developmentSuggestions": ["建议1（5步骤完整格式）", "建议2", "建议3"],
  "keyPersons": "Array of real contacts found on the website. CRITICAL: Only include someone if you found an ACTUAL PERSON NAME (not 'unknown', '未知', 'N/A', title-only) AND a verifiable source (About page, Team page, Contact page, LinkedIn profile link). If you cannot find real names, return an EMPTY ARRAY []. Do NOT invent contacts. Do NOT use placeholder names like '未知' or '产品经理'. Each entry format: {\"name\": \"Real Name\", \"title\": \"Real Title\", \"linkedin\": \"https://www.linkedin.com/in/real-profile OR empty string\"}. Only include linkedin URL if it is a valid https://www.linkedin.com/in/... or https://linkedin.com/in/... URL.",
  "summary": "公司整体中文概述，50-100字"
}

IMPORTANT: Return ONLY the JSON object. No markdown formatting. No code fences. No extra text.`;


function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try { return JSON.parse(body); } catch { return {}; }
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
