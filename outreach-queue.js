(function initOutreachQueue(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORYAL_OUTREACH_QUEUE = api;
})(typeof window !== "undefined" ? window : globalThis, function buildOutreachQueueApi() {
  const STATUS = {
    TO_GENERATE: "to_generate",
    PENDING_REVIEW: "pending_review",
    APPROVED: "approved",
    SCHEDULED: "scheduled",
    SENT: "sent",
    FAILED: "failed",
    STOPPED: "stopped",
  };

  const STATUS_LABELS = {
    [STATUS.TO_GENERATE]: "待生成",
    [STATUS.PENDING_REVIEW]: "待审核",
    [STATUS.APPROVED]: "已批准",
    [STATUS.SCHEDULED]: "待发送",
    [STATUS.SENT]: "已发送",
    [STATUS.FAILED]: "发送失败",
    [STATUS.STOPPED]: "已停止",
  };

  const DEFAULT_SETTINGS = {
    dailyLimitPerAccount: 20,
    autoSendApprovedTemplates: false,
    brandName: "FORYAL",
    senderName: "Lina Mei",
  };

  function normalizeSettings(settings = {}) {
    const limit = Number(settings.dailyLimitPerAccount);
    const requestedBrand = String(settings.brandName || "").trim();
    const brandName = ["FORYAL", "AISON"].includes(requestedBrand) ? requestedBrand : DEFAULT_SETTINGS.brandName;
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      dailyLimitPerAccount: Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_SETTINGS.dailyLimitPerAccount,
      autoSendApprovedTemplates: Boolean(settings.autoSendApprovedTemplates),
      brandName,
      senderName: settings.senderName || DEFAULT_SETTINGS.senderName,
    };
  }

  function createId(prefix = "outreach") {
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}-${Date.now().toString(36)}-${random}`;
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
  }

  function normalizeGrade(value) {
    return String(value || "").trim().toUpperCase();
  }

  function isPriorityEligible(customer, manualSelected = false) {
    if (manualSelected) return true;
    return ["A+", "A", "B+"].includes(normalizeGrade(customer.priority || customer.grade));
  }

  function toDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function startOfDay(value) {
    const date = toDate(value) || new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dateKey(value) {
    const date = toDate(value);
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function daysBetween(left, right) {
    const a = startOfDay(left).getTime();
    const b = startOfDay(right).getTime();
    return Math.floor((b - a) / 86400000);
  }

  function isBusinessDay(value) {
    const day = (toDate(value) || new Date()).getDay();
    return day >= 1 && day <= 5;
  }

  function addDays(value, days) {
    const date = new Date((toDate(value) || new Date()).getTime());
    date.setDate(date.getDate() + days);
    return date;
  }

  function matchesCompany(left, right) {
    const a = String(left || "").trim().toLowerCase();
    const b = String(right || "").trim().toLowerCase();
    return Boolean(a && b && a === b);
  }

  function isActiveQueueStatus(status) {
    return [STATUS.PENDING_REVIEW, STATUS.APPROVED, STATUS.SCHEDULED].includes(status);
  }

  function getCustomerEmail(customer = {}) {
    return normalizeEmail(customer.email || customer.contactEmail || customer.mail);
  }

  function getLastContactAt(customer = {}, mailState = {}) {
    const email = getCustomerEmail(customer);
    const dates = [];
    ["sent", "inbox", "drafts"].forEach((box) => {
      (mailState[box] || []).forEach((message) => {
        const parties = [message.to, message.from, message.cc, message.bcc].join(" ").toLowerCase();
        if (email && parties.includes(email) && message.date) dates.push(message.date);
      });
    });
    (customer.followUps || []).forEach((item) => {
      if (item.date) dates.push(item.date);
    });
    return dates.map(toDate).filter(Boolean).sort((a, b) => b - a)[0] || null;
  }

  function getTaskCustomerEmail(task = {}) {
    return normalizeEmail(task.email || task.to || task.customerEmail);
  }

  function hasRecentEmailOutreach(customer, context = {}, days = 30) {
    const email = getCustomerEmail(customer);
    if (!email) return false;
    const now = toDate(context.now) || new Date();
    const queue = context.queue || [];
    const activityLog = context.activityLog || [];
    const sent = context.mailState?.sent || [];
    const recentQueue = queue.some((task) => {
      if (getTaskCustomerEmail(task) !== email) return false;
      if ([STATUS.STOPPED, STATUS.FAILED].includes(task.status)) return false;
      const value = task.sentAt || task.scheduledAt || task.createdAt;
      const date = toDate(value);
      return date && daysBetween(date, now) < days;
    });
    const recentActivity = activityLog.some((event) => {
      if (normalizeEmail(event.email) !== email) return false;
      if (!/outreach|sent|scheduled|mock/i.test(String(event.type || ""))) return false;
      const date = toDate(event.at || event.date);
      return date && daysBetween(date, now) < days;
    });
    const recentSent = sent.some((message) => {
      if (!message.outreachTaskId && !/outreach|development/i.test(String(message.followStatus || message.status || ""))) return false;
      if (!String(message.to || "").toLowerCase().includes(email)) return false;
      const date = toDate(message.date);
      return date && daysBetween(date, now) < days;
    });
    return recentQueue || recentActivity || recentSent;
  }

  function hasRecentCompanyOutreach(customer, context = {}, days = 7) {
    const company = customer.company || customer.customer || "";
    const now = toDate(context.now) || new Date();
    return (context.queue || []).some((task) => {
      if (!matchesCompany(task.company, company)) return false;
      if ([STATUS.STOPPED, STATUS.FAILED].includes(task.status)) return false;
      const date = toDate(task.sentAt || task.scheduledAt || task.createdAt);
      return date && daysBetween(date, now) < days;
    }) || (context.activityLog || []).some((event) => {
      if (!matchesCompany(event.company, company)) return false;
      if (!/outreach|sent|scheduled|mock/i.test(String(event.type || ""))) return false;
      const date = toDate(event.at || event.date);
      return date && daysBetween(date, now) < days;
    });
  }

  function isAlreadyQueued(customer, queue = []) {
    const email = getCustomerEmail(customer);
    return queue.some((task) => getTaskCustomerEmail(task) === email && isActiveQueueStatus(task.status));
  }

  function getEligibility(customer = {}, context = {}) {
    const manualSelected = Boolean(context.manualSelected);
    if (!isValidEmail(customer.email)) return { eligible: false, reason: "邮箱无效或缺失" };
    if (customer.doNotEmail) return { eligible: false, reason: "禁止发送" };
    if (customer.unsubscribed || customer.unsubscribe) return { eligible: false, reason: "已退订" };
    if (customer.emailBounced || customer.bounced || customer.bounce) return { eligible: false, reason: "已退信" };
    if (customer.outreachReplied || customer.replied) return { eligible: false, reason: "客户已回复" };
    if (customer.stopOutreach) return { eligible: false, reason: "已停止开发" };
    if (isAlreadyQueued(customer, context.queue || [])) return { eligible: false, reason: "已在任务队列中" };
    if (hasRecentEmailOutreach(customer, context, 30)) return { eligible: false, reason: "30天内已发送开发信" };
    if (hasRecentCompanyOutreach(customer, context, 7)) return { eligible: false, reason: "同公司7天内已联系" };
    if (!isPriorityEligible(customer, manualSelected)) return { eligible: false, reason: "等级不符合，需手动选择" };
    return { eligible: true, reason: manualSelected ? "手动选择" : "可开发" };
  }

  function getOutreachProductPreference(customer = {}) {
    const exactFields = [
      customer.outreachProduct,
      customer.emailOutreachProduct,
      customer.outreachRecommendedProduct,
      customer.preferredOutreachProduct,
      customer.targetOutreachProduct,
    ];
    const exact = exactFields.map((item) => String(item || "").trim()).find(Boolean);
    if (exact) return exact;
    return [
      customer.recommendedProduct,
      customer.recommendedModel,
      customer.targetProduct,
      customer.preferredProduct,
      customer.product,
    ].map((item) => String(item || "").trim()).find(Boolean) || "";
  }

  function recommendProduct(customer = {}) {
    const productPreference = getOutreachProductPreference(customer);
    const text = [
      customer.customerType,
      customer.segment,
      customer.type,
      customer.notes,
      productPreference,
      customer.country,
      customer.stage,
    ].join(" ").toLowerCase();
    const raw = productPreference.toUpperCase();
    if (/\bCM-1600B\b/.test(raw)) return "CM-1600B";
    if (/\bCM-1302NB\b/.test(raw)) return "CM-1302NB";
    if (/\bCM-1302MYC\b/.test(raw)) return "CM-1302MYC";
    if (/\bCM-1302N\b/.test(raw)) return "CM-1302N";
    if (/\bCM-1302MYB?\b/.test(raw)) return "CM-1302MY / CM-1302MYB";
    if (/milk|latte|cappuccino|奶咖|奶箱|milk\s*tank/.test(text)) return "CM-1302NB";
    if (/premium|high.?end|brand|chain|retail|store|department|高端|品牌|连锁/.test(text)) return "CM-1600B";
    if (/price|cost|value|private label|importer|wholesale|budget|价格|私标|进口|批发/.test(text)) return "CM-1302MY / CM-1302MYB";
    return "CM-1600B";
  }

  function getProductAngle(product) {
    if (product === "CM-1600B") {
      return "premium TFT espresso machine positioning for brand owners, retail chains, and higher-end appliance channels";
    }
    if (product === "CM-1302NB") {
      return "milk tank model positioning for buyers who need latte or cappuccino use cases";
    }
    if (product === "CM-1302MYC" || product === "CM-1302N") {
      return "grinder espresso positioning without a milk tank, suitable when the buyer wants grinding function but not milk coffee";
    }
    return "cost-effective built-in grinder espresso machine positioning for importers, private label programs, and price-sensitive channels";
  }

  function sanitizePlainText(value) {
    return String(value || "")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function buildSubject(customer = {}, product = "") {
    const company = String(customer.company || customer.customer || "Your Company").trim();
    const name = product || recommendProduct(customer);
    if (name === "CM-1600B") return `CM-1600B Premium TFT Espresso Machine for ${company}`;
    if (name === "CM-1302NB") return `CM-1302NB Milk Tank Espresso Machine for ${company}`;
    if (name === "CM-1302MYC" || name === "CM-1302N") return `${name} Grinder Espresso Machine for ${company}`;
    return `CM-1302MY Cost-effective Built-in Grinder Espresso Machine for ${company}`;
  }

  function buildPlainTextEmail(customer = {}, options = {}) {
    const settings = normalizeSettings(options.settings || {});
    const product = options.product || recommendProduct(customer);
    const company = String(customer.company || customer.customer || "your company").trim();
    const contact = String(customer.contact || customer.name || "").trim();
    const greeting = contact ? `Hi ${contact},` : "Hi there,";
    const countryLine = customer.country ? ` for your ${customer.country} market` : "";
    const angle = getProductAngle(product);
    const body = `${greeting}

I am Lina from ${settings.brandName}, a coffee machine OEM and private label supplier.

I checked ${company} and thought ${product} may be a practical fit${countryLine}. The main angle is ${angle}.

For a first review, I can send a short model sheet with key specifications, MOQ, packing options, certification status, and FOB reference. We can also discuss OEM packaging, logo, spare parts, and SKD or CKD cooperation if needed.

Would it be useful if I send 2-3 suitable options for your team to compare?

Best regards,
${settings.senderName}
${settings.brandName} Coffee Machines

If this is not relevant, please let me know and I will not contact you again.`;
    return sanitizePlainText(body);
  }

  function countScheduledForDay(queue = [], senderEmail = "", key = "") {
    const sender = normalizeEmail(senderEmail);
    return queue.filter((task) => {
      if (![STATUS.PENDING_REVIEW, STATUS.APPROVED, STATUS.SCHEDULED, STATUS.SENT].includes(task.status)) return false;
      if (sender && normalizeEmail(task.senderEmail) !== sender) return false;
      return dateKey(task.scheduledAt || task.sentAt) === key;
    }).length;
  }

  function randomTimeOnBusinessDay(day, rng = Math.random) {
    const windows = [
      [9 * 60 + 30, 11 * 60 + 30],
      [14 * 60, 17 * 60 + 30],
    ];
    const windowIndex = rng() < 0.5 ? 0 : 1;
    const [start, end] = windows[windowIndex];
    let minutes = start + Math.floor(rng() * (end - start + 1));
    if (minutes % 60 === 0) minutes += 7;
    if (minutes > end) minutes = end - 5;
    const date = startOfDay(day);
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return date;
  }

  function findNextScheduleAt(queue = [], senderEmail = "", settings = {}, now = new Date(), rng = Math.random) {
    const normalized = normalizeSettings(settings);
    let day = startOfDay(now);
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (isBusinessDay(day)) {
        const key = dateKey(day);
        const count = countScheduledForDay(queue, senderEmail, key);
        if (count < normalized.dailyLimitPerAccount) {
          const scheduled = randomTimeOnBusinessDay(day, rng);
          if (scheduled > now) return scheduled;
        }
      }
      day = addDays(day, 1);
    }
    return randomTimeOnBusinessDay(addDays(now, 1), rng);
  }

  function getFollowupDelayDays(rng = Math.random) {
    return 5 + Math.floor(rng() * 3);
  }

  function createTask(customer = {}, options = {}) {
    const settings = normalizeSettings(options.settings || {});
    const product = options.product || recommendProduct(customer);
    const scheduledAt = options.scheduledAt || findNextScheduleAt(options.queue || [], options.senderEmail || "", settings, options.now || new Date(), options.rng || Math.random);
    const subject = options.subject || buildSubject(customer, product);
    const body = options.body || buildPlainTextEmail(customer, { product, settings });
    return {
      id: options.id || createId(),
      customerId: customer.id || "",
      company: customer.company || customer.customer || "",
      contact: customer.contact || customer.name || "",
      email: getCustomerEmail(customer),
      country: customer.country || "",
      grade: customer.priority || customer.grade || "",
      recommendedProduct: product,
      subject,
      body,
      status: STATUS.PENDING_REVIEW,
      scheduledAt: scheduledAt.toISOString(),
      lastContactAt: options.lastContactAt ? new Date(options.lastContactAt).toISOString() : "",
      senderEmail: normalizeEmail(options.senderEmail || ""),
      createdAt: new Date(options.now || Date.now()).toISOString(),
      updatedAt: new Date(options.now || Date.now()).toISOString(),
      followupDelayDays: getFollowupDelayDays(options.rng || Math.random),
      source: "开发信队列",
      reviewRequired: true,
      autoSendAllowed: Boolean(settings.autoSendApprovedTemplates),
    };
  }

  return {
    STATUS,
    STATUS_LABELS,
    DEFAULT_SETTINGS,
    normalizeSettings,
    createId,
    normalizeEmail,
    isValidEmail,
    isBusinessDay,
    dateKey,
    daysBetween,
    getLastContactAt,
    getEligibility,
    recommendProduct,
    buildSubject,
    buildPlainTextEmail,
    sanitizePlainText,
    countScheduledForDay,
    findNextScheduleAt,
    getFollowupDelayDays,
    getOutreachProductPreference,
    createTask,
  };
});
