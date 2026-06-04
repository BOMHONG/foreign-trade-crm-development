const CUSTOMER_STORAGE_KEY = "coffee-machine-crm-customers-v6";
const MAIL_STORE_KEY = "coffee-machine-crm-mail-v1";
const AI_SETTINGS_KEY = "coffee-machine-crm-ai-settings-v1";
const CRM_USERS_KEY = "foryal-crm-users-v1";
const CURRENT_USER_KEY = "foryal-current-user-v1";
const AUTH_SESSION_KEY = "foryal-auth-session-v1";
const SIGNATURES_KEY = "foryal-email-signatures-v1";
const MAIL_ACCOUNTS_KEY = "foryal-mail-accounts-v1";
const COMPOSE_MEMORY_KEY = "foryal-compose-memory-v1";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-chat";
const FROM_EMAIL = "admin@example.com";
const PRODUCT_FALLBACK = "CM-1700MY Grinder Espresso Machine";
const MAX_DIRECT_SMTP_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_ASSISTANT_RESEARCH_FILE_BYTES = 20 * 1024 * 1024;
const VERCEL_FUNCTION_PAYLOAD_LIMIT_BYTES = 4.5 * 1024 * 1024;
const DIRECT_ATTACHMENT_SAFE_PAYLOAD_BYTES = 3.2 * 1024 * 1024;
const LOCAL_STORED_ATTACHMENT_BYTES = 1.2 * 1024 * 1024;
const MODULE_ATTACHMENT_INDEX_KEY = "foryal-crm-module-attachment-index-v1";
const MODULE_ATTACHMENT_DB_NAME = "foryal-crm-attachments-db";
const MODULE_ATTACHMENT_STORE = "files";
const TEXT_PREVIEW_EXTENSIONS = new Set(["txt", "csv", "json", "xml", "md", "log", "rtf"]);
const HTML_PREVIEW_EXTENSIONS = new Set(["html", "htm"]);
const IMAGE_PREVIEW_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);
const VIDEO_PREVIEW_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov"]);
const AUDIO_PREVIEW_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a"]);
const OFFICE_PREVIEW_EXTENSIONS = new Set(["doc", "docx", "xls", "xlsx", "xlsm", "xlsb", "ppt", "pptx"]);

const composeForm = document.querySelector("#composePageForm");
const composeTo = document.querySelector("#composeTo");
const composeCc = document.querySelector("#composeCc");
const composeBcc = document.querySelector("#composeBcc");
const composeSubject = document.querySelector("#composeSubject");
const composeEmailMemoryList = document.querySelector("#composeEmailMemoryList");
const composeSubjectMemoryList = document.querySelector("#composeSubjectMemoryList");
const composeEmailType = document.querySelector("#composeEmailType");
const composeBody = document.querySelector("#composeBody");
const composeStatus = document.querySelector("#composeStatus");
const saveComposeDraftBtn = document.querySelector("#saveComposeDraftBtn");
const topSaveDraftBtn = document.querySelector("#topSaveDraftBtn");
const sendComposeBtn = document.querySelector("#sendComposeBtn");
const copyComposeBtn = document.querySelector("#copyComposeBtn");
const copyComposeBodyBtn = document.querySelector("#copyComposeBodyBtn");
const copyToFoxmailBtn = document.querySelector("#copyToFoxmailBtn");
const clearComposePageBtn = document.querySelector("#clearComposePageBtn");
const topPreviewEmailBtn = document.querySelector("#topPreviewEmailBtn");
const deepseekComposeBtn = document.querySelector("#deepseekComposeBtn");
const customerName = document.querySelector("#composeCustomerName");
const customerSummary = document.querySelector("#composeCustomerSummary");
const aiInput = document.querySelector("#composeAiInput");
const aiPasteSummary = document.querySelector("#composeAiPasteSummary");
const aiPreview = document.querySelector("#composeAiPreview");
const toggleContextBtn = document.querySelector("#composeToggleContextBtn");
const assistantEmailType = document.querySelector("#assistantEmailType");
const assistantProduct = document.querySelector("#assistantProduct");
const assistantTone = document.querySelector("#assistantTone");
const assistantResult = document.querySelector("#assistantResult");
const insertAiResultBtn = document.querySelector("#insertAiResultBtn");
const replaceAiResultBtn = document.querySelector("#replaceAiResultBtn");
const copyAiResultBtn = document.querySelector("#copyAiResultBtn");
const assistantAttachBtn = document.querySelector("#assistantAttachBtn");
const assistantCrmMaterialBtn = document.querySelector("#assistantCrmMaterialBtn");
const assistantAttachmentInput = document.querySelector("#assistantAttachmentInput");
const assistantAttachmentList = document.querySelector("#assistantAttachmentList");
const historySearch = document.querySelector("#composeHistorySearch");
const historySummary = document.querySelector("#composeHistorySummary");
const historyList = document.querySelector("#composeHistoryList");
const historyDetail = document.querySelector("#composeHistoryDetail");
const summarizeHistoryBtn = document.querySelector("#summarizeHistoryBtn");
const fontFamilySelect = document.querySelector("#fontFamilySelect");
const fontSizeSelect = document.querySelector("#fontSizeSelect");
const fontColorPreset = document.querySelector("#fontColorPreset");
const fontColorInput = document.querySelector("#fontColorInput");
const insertLinkBtn = document.querySelector("#insertLinkBtn");
const insertImageUrlBtn = document.querySelector("#insertImageUrlBtn");
const insertLocalImageBtn = document.querySelector("#insertLocalImageBtn");
const insertTableBtn = document.querySelector("#insertTableBtn");
const localImageInput = document.querySelector("#localImageInput");
const addAttachmentBtn = document.querySelector("#addAttachmentBtn");
const attachmentInput = document.querySelector("#attachmentInput");
const attachmentList = document.querySelector("#attachmentList");
const sendAttachmentsAsTrackedLinks = document.querySelector("#sendAttachmentsAsTrackedLinks");
if (sendAttachmentsAsTrackedLinks) {
  sendAttachmentsAsTrackedLinks.defaultChecked = false;
  sendAttachmentsAsTrackedLinks.checked = false;
}
const chooseCrmMaterialBtn = document.querySelector("#chooseCrmMaterialBtn");
const crmMaterialDialog = document.querySelector("#crmMaterialDialog");
const crmMaterialSearch = document.querySelector("#crmMaterialSearch");
const crmMaterialList = document.querySelector("#crmMaterialList");
const closeCrmMaterialDialogBtn = document.querySelector("#closeCrmMaterialDialogBtn");
const composeSignatureSelect = document.querySelector("#composeSignatureSelect");
const previewEmailBtn = document.querySelector("#previewEmailBtn");
const emailPreviewDialog = document.querySelector("#emailPreviewDialog");
const emailPreviewBody = document.querySelector("#emailPreviewBody");
const closePreviewBtn = document.querySelector("#closePreviewBtn");
const toolbarCopyBtn = document.querySelector("#toolbarCopyBtn");
const toolbarPasteBtn = document.querySelector("#toolbarPasteBtn");
const toolbarCutBtn = document.querySelector("#toolbarCutBtn");
const toolbarUndoBtn = document.querySelector("#toolbarUndoBtn");
const toolbarRedoBtn = document.querySelector("#toolbarRedoBtn");
const toolbarSelectAllBtn = document.querySelector("#toolbarSelectAllBtn");
const toolbarClearFormatBtn = document.querySelector("#toolbarClearFormatBtn");
const toolbarPastePlainBtn = document.querySelector("#toolbarPastePlainBtn");
const toolbarMore = document.querySelector(".toolbar-more");
const toast = document.querySelector("#composeToast");
const composeMemoryPopup = document.createElement("div");
composeMemoryPopup.className = "compose-memory-popup";
composeMemoryPopup.hidden = true;
document.body.appendChild(composeMemoryPopup);

let customers = loadCustomers();
let mailState = loadMailState();
let aiSettings = loadAiSettings();
let crmUsers = loadUsers();
let currentUser = loadCurrentUser();
let mailAccounts = loadMailAccounts();
let signatures = loadSignatures();
let composeMemory = loadComposeMemory();
let attachments = [];
let moduleAttachments = loadModuleAttachmentIndex();
let currentCustomer = null;
let selectedHistoryId = "";
let editingDraftId = "";
let lastAssistantDraft = null;
let assistantResearchFiles = [];
let crmMaterialDialogMode = "email";
let activeMemoryInput = null;
let activeMemoryType = "";
let activeMemorySuggestions = [];
let activeMemoryIndex = -1;

installEditorValueBridge();
hydrateAiSettings();
hydrateComposeFromQuery();
renderSignatureOptions();
renderCustomerContext();
hydrateComposeMemory();
renderHistory();

composeForm.addEventListener("submit", saveDraftFromForm);
topSaveDraftBtn?.addEventListener("click", () => composeForm.requestSubmit());
sendComposeBtn?.addEventListener("click", handleSendEmail);
copyComposeBtn?.addEventListener("click", copyForExternalMail);
copyComposeBodyBtn?.addEventListener("click", copyForExternalMail);
copyToFoxmailBtn?.addEventListener("click", copyForExternalMail);
clearComposePageBtn?.addEventListener("click", clearComposePage);
deepseekComposeBtn.addEventListener("click", () => generateDraft("deepseek"));
composeEmailType.addEventListener("change", () => {
  if (assistantEmailType) assistantEmailType.value = composeEmailType.value;
  if (!composeBody.value.trim() || confirm("是否根据新的邮件类型重新生成本地模板？")) {
    const draft = buildTemplateDraft();
    setAssistantDraft(draft);
    replaceEditorWithDraft(draft);
  }
});
assistantEmailType?.addEventListener("change", () => {
  composeEmailType.value = assistantEmailType.value;
});
composeTo.addEventListener("input", () => {
  const primaryEmail = getPrimaryRecipientEmail(composeTo.value);
  currentCustomer = findCustomerByEmail(primaryEmail) || createAdHocCustomer(primaryEmail);
  renderCustomerContext();
  renderHistory();
});
historySearch.addEventListener("input", renderHistory);
summarizeHistoryBtn.addEventListener("click", summarizeHistory);
toggleContextBtn.addEventListener("click", toggleResearchBox);
aiInput.addEventListener("input", updateResearchPreview);
aiInput.addEventListener("paste", () => setTimeout(updateResearchPreview, 0));
document.querySelectorAll("[data-editor-command]").forEach((button) => {
  button.addEventListener("click", () => execEditorCommand(button.dataset.editorCommand, null, "格式已应用"));
});
fontFamilySelect?.addEventListener("change", () => execEditorCommand("fontName", fontFamilySelect.value, "字体已应用"));
fontSizeSelect?.addEventListener("change", () => execEditorCommand("fontSize", fontSizeSelect.value, "字号已应用"));
fontColorPreset?.addEventListener("change", () => applyFontColor(fontColorPreset.value));
fontColorInput?.addEventListener("input", () => applyFontColor(fontColorInput.value));
insertLinkBtn?.addEventListener("click", insertLink);
insertImageUrlBtn?.addEventListener("click", insertImageUrl);
insertLocalImageBtn?.addEventListener("click", () => localImageInput.click());
insertTableBtn?.addEventListener("click", insertTable);
localImageInput?.addEventListener("change", insertLocalImage);
addAttachmentBtn?.addEventListener("click", () => attachmentInput.click());
assistantAttachBtn?.addEventListener("click", () => assistantAttachmentInput?.click());
assistantCrmMaterialBtn?.addEventListener("click", () => openCrmMaterialDialog("assistant"));
attachmentInput?.addEventListener("change", addAttachments);
assistantAttachmentInput?.addEventListener("change", addAssistantResearchFiles);
chooseCrmMaterialBtn?.addEventListener("click", () => openCrmMaterialDialog("email"));
crmMaterialSearch?.addEventListener("input", renderCrmMaterialList);
closeCrmMaterialDialogBtn?.addEventListener("click", () => crmMaterialDialog?.close());
composeBody?.addEventListener("paste", handleEditorPaste);
composeSignatureSelect?.addEventListener("change", applySelectedSignature);
previewEmailBtn?.addEventListener("click", previewEmail);
topPreviewEmailBtn?.addEventListener("click", previewEmail);
closePreviewBtn?.addEventListener("click", () => emailPreviewDialog.close());
toolbarCopyBtn?.addEventListener("click", copyEditorSelectionOrBody);
toolbarPasteBtn?.addEventListener("click", () => pasteFromClipboard(false));
toolbarCutBtn?.addEventListener("click", cutEditorSelection);
toolbarUndoBtn?.addEventListener("click", () => execEditorCommand("undo", null, "已撤销"));
toolbarRedoBtn?.addEventListener("click", () => execEditorCommand("redo", null, "已重做"));
toolbarSelectAllBtn?.addEventListener("click", selectEditorAll);
toolbarClearFormatBtn?.addEventListener("click", clearEditorFormat);
toolbarPastePlainBtn?.addEventListener("click", () => pasteFromClipboard(true));
insertAiResultBtn?.addEventListener("click", insertAssistantResult);
replaceAiResultBtn?.addEventListener("click", replaceWithAssistantResult);
copyAiResultBtn?.addEventListener("click", copyAssistantResult);
setupComposeMemorySuggestions();
document.addEventListener("pointerdown", closeToolbarMoreOnOutsideClick);
document.addEventListener("keydown", closeToolbarMoreOnEscape);

function closeToolbarMoreOnOutsideClick(event) {
  if (!toolbarMore?.open) return;
  if (toolbarMore.contains(event.target)) return;
  toolbarMore.open = false;
}

function closeToolbarMoreOnEscape(event) {
  if (event.key !== "Escape" || !toolbarMore?.open) return;
  toolbarMore.open = false;
}

function loadCustomers() {
  try {
    const stored = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY) || "null");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    // Ignore broken localStorage data and use bundled import data.
  }
  return Array.isArray(window.CRM_IMPORTED_CUSTOMERS) ? window.CRM_IMPORTED_CUSTOMERS : [];
}

function saveCustomers() {
  if (!Array.isArray(customers)) return;
  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
}

function loadMailState() {
  try {
    const stored = JSON.parse(localStorage.getItem(MAIL_STORE_KEY) || "null") || {};
    return {
      inbox: Array.isArray(stored.inbox) ? stored.inbox : [],
      sent: Array.isArray(stored.sent) ? stored.sent : [],
      drafts: Array.isArray(stored.drafts) ? stored.drafts : [],
      trash: Array.isArray(stored.trash) ? stored.trash : [],
      hiddenInboxUids: Array.isArray(stored.hiddenInboxUids) ? stored.hiddenInboxUids : [],
      lastSync: stored.lastSync || "",
    };
  } catch {
    return { inbox: [], sent: [], drafts: [], trash: [], hiddenInboxUids: [], lastSync: "" };
  }
}

function saveMailState() {
  try {
    localStorage.setItem(MAIL_STORE_KEY, JSON.stringify(mailState));
  } catch (error) {
    mailState = sanitizeMailStateForStorage(mailState);
    localStorage.setItem(MAIL_STORE_KEY, JSON.stringify(mailState));
    if (/quota|exceeded|storage/i.test(String(error?.message || error))) {
      showToast("邮件附件较大，系统已只保留大附件元数据以保证草稿和历史记录可保存");
    }
  }
}

function loadComposeMemory() {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPOSE_MEMORY_KEY) || "null") || {};
    return {
      emails: Array.isArray(stored.emails) ? stored.emails : [],
      subjects: Array.isArray(stored.subjects) ? stored.subjects : [],
    };
  } catch {
    return { emails: [], subjects: [] };
  }
}

function saveComposeMemory() {
  composeMemory.emails = dedupeComposeValues(composeMemory.emails).slice(0, 500);
  composeMemory.subjects = dedupeComposeValues(composeMemory.subjects).slice(0, 500);
  localStorage.setItem(COMPOSE_MEMORY_KEY, JSON.stringify(composeMemory));
}

function hydrateComposeMemory() {
  const emailValues = [];
  const subjectValues = [];
  customers.forEach((customer) => {
    emailValues.push(customer.email);
    (customer.contacts || []).forEach((contact) => emailValues.push(contact.email));
    (customer.drafts || []).forEach((draft) => {
      emailValues.push(draft.to);
      subjectValues.push(draft.subject);
    });
  });
  mailAccounts.forEach((account) => emailValues.push(account.email));
  ["inbox", "sent", "drafts", "trash"].forEach((box) => {
    (mailState[box] || []).forEach((message) => {
      emailValues.push(...extractEmails([message.from, message.to, message.cc, message.bcc].filter(Boolean).join(" ")));
      subjectValues.push(message.subject);
    });
  });
  composeMemory.emails = dedupeComposeValues([...emailValues, ...composeMemory.emails]).slice(0, 500);
  composeMemory.subjects = dedupeComposeValues([...subjectValues, ...composeMemory.subjects]).slice(0, 500);
  saveComposeMemory();
  renderComposeMemoryOptions();
}

function rememberComposeFields() {
  composeMemory.emails = dedupeComposeValues([
    ...extractEmails([composeTo.value, composeCc.value, composeBcc.value].join(" ")),
    ...composeMemory.emails,
  ]).slice(0, 500);
  composeMemory.subjects = dedupeComposeValues([composeSubject.value.trim(), ...composeMemory.subjects]).slice(0, 500);
  saveComposeMemory();
  renderComposeMemoryOptions();
}

function renderComposeMemoryOptions() {
  if (composeEmailMemoryList) {
    composeEmailMemoryList.innerHTML = composeMemory.emails
      .filter(Boolean)
      .map((email) => `<option value="${escapeAttr(email)}"></option>`)
      .join("");
  }
  if (composeSubjectMemoryList) {
    composeSubjectMemoryList.innerHTML = composeMemory.subjects
      .filter(Boolean)
      .map((subject) => `<option value="${escapeAttr(subject)}"></option>`)
      .join("");
  }
}

function dedupeComposeValues(values = []) {
  const seen = new Set();
  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function setupComposeMemorySuggestions() {
  [
    { input: composeTo, type: "email" },
    { input: composeCc, type: "email" },
    { input: composeBcc, type: "email" },
    { input: composeSubject, type: "subject" },
  ].forEach(({ input, type }) => {
    if (!input) return;
    input.removeAttribute("list");
    input.setAttribute("autocomplete", "off");
    input.addEventListener("focus", () => openComposeMemorySuggestions(input, type));
    input.addEventListener("input", () => openComposeMemorySuggestions(input, type));
    input.addEventListener("change", rememberComposeFields);
    input.addEventListener("keydown", handleComposeMemoryKeydown);
  });

  composeMemoryPopup.addEventListener("mousedown", (event) => event.preventDefault());
  composeMemoryPopup.addEventListener("click", (event) => {
    const item = event.target.closest("[data-memory-index]");
    if (!item) return;
    applyComposeMemorySuggestion(Number(item.dataset.memoryIndex || 0));
  });
  document.addEventListener("pointerdown", (event) => {
    if (composeMemoryPopup.hidden) return;
    if (composeMemoryPopup.contains(event.target) || activeMemoryInput?.contains(event.target)) return;
    closeComposeMemorySuggestions();
  });
  window.addEventListener("resize", closeComposeMemorySuggestions);
  window.addEventListener("scroll", closeComposeMemorySuggestions, true);
}

function openComposeMemorySuggestions(input, type) {
  activeMemoryInput = input;
  activeMemoryType = type;
  activeMemoryIndex = -1;
  const query = type === "email" ? getActiveEmailToken(input.value) : input.value;
  activeMemorySuggestions = buildComposeMemorySuggestions(type, query).slice(0, 9);
  renderComposeMemoryPopup();
}

function buildComposeMemorySuggestions(type, query = "") {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const rows = type === "subject" ? getSubjectSuggestionRows() : getEmailSuggestionRows();
  return rows.filter((row) => {
    if (!normalizedQuery) return true;
    return [row.value, row.label, row.meta].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
  });
}

function getEmailSuggestionRows() {
  const rows = [];
  const add = (value, label = "", meta = "") => {
    const email = extractEmails(value)[0] || String(value || "").trim().toLowerCase();
    if (!email) return;
    rows.push({ value: email, label: label || email, meta });
  };

  customers.forEach((customer) => {
    add(customer.email, customer.contact || customer.company, [customer.company, customer.country, customer.recommendedProduct].filter(Boolean).join(" · "));
    (customer.contacts || []).forEach((contact) => {
      add(contact.email, contact.name || customer.company, [contact.position, customer.company, customer.country].filter(Boolean).join(" · "));
    });
  });
  ["inbox", "sent", "drafts", "trash"].forEach((box) => {
    (mailState[box] || []).forEach((message) => {
      extractEmails([message.from, message.to, message.cc, message.bcc].filter(Boolean).join(" ")).forEach((email) => {
        add(email, email, [message.subject, getMailboxLabel(box)].filter(Boolean).join(" · "));
      });
    });
  });
  mailAccounts.forEach((account) => add(account.email, account.senderName || account.email, "邮箱账户"));
  composeMemory.emails.forEach((email) => add(email, email, "历史输入"));
  return dedupeSuggestionRows(rows);
}

function getSubjectSuggestionRows() {
  const rows = [];
  const add = (value, meta = "历史主题") => {
    const subject = String(value || "").trim();
    if (!subject) return;
    rows.push({ value: subject, label: subject, meta });
  };

  composeMemory.subjects.forEach((subject) => add(subject));
  ["inbox", "sent", "drafts", "trash"].forEach((box) => {
    (mailState[box] || []).forEach((message) => add(message.subject, getMailboxLabel(box)));
  });
  customers.forEach((customer) => {
    (customer.drafts || []).forEach((draft) => add(draft.subject, customer.company || "客户草稿"));
  });
  if (lastAssistantDraft?.subject) add(lastAssistantDraft.subject, "AI生成");
  return dedupeSuggestionRows(rows);
}

function dedupeSuggestionRows(rows = []) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = String(row.value || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderComposeMemoryPopup() {
  if (!activeMemoryInput || !activeMemorySuggestions.length) {
    closeComposeMemorySuggestions();
    return;
  }
  composeMemoryPopup.innerHTML = activeMemorySuggestions.map((row, index) => `
    <button type="button" class="${index === activeMemoryIndex ? "is-active" : ""}" data-memory-index="${index}">
      <strong>${escapeHtml(row.label || row.value)}</strong>
      ${activeMemoryType === "email" && row.label !== row.value ? `<span>${escapeHtml(row.value)}</span>` : ""}
      ${row.meta ? `<small>${escapeHtml(row.meta)}</small>` : ""}
    </button>
  `).join("");
  positionComposeMemoryPopup(activeMemoryInput);
  composeMemoryPopup.hidden = false;
}

function positionComposeMemoryPopup(input) {
  const rect = input.getBoundingClientRect();
  composeMemoryPopup.style.left = `${Math.max(8, rect.left)}px`;
  composeMemoryPopup.style.top = `${rect.bottom + 4}px`;
  composeMemoryPopup.style.width = `${Math.max(rect.width, 360)}px`;
}

function handleComposeMemoryKeydown(event) {
  if (composeMemoryPopup.hidden || !activeMemorySuggestions.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeMemoryIndex = (activeMemoryIndex + 1) % activeMemorySuggestions.length;
    renderComposeMemoryPopup();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    activeMemoryIndex = (activeMemoryIndex - 1 + activeMemorySuggestions.length) % activeMemorySuggestions.length;
    renderComposeMemoryPopup();
    return;
  }
  if (event.key === "Enter" && activeMemoryIndex >= 0) {
    event.preventDefault();
    applyComposeMemorySuggestion(activeMemoryIndex);
    return;
  }
  if (event.key === "Escape") {
    closeComposeMemorySuggestions();
  }
}

function applyComposeMemorySuggestion(index) {
  const selected = activeMemorySuggestions[index];
  if (!selected || !activeMemoryInput) return;
  activeMemoryInput.value = selected.value;
  activeMemoryInput.dispatchEvent(new Event("input", { bubbles: true }));
  activeMemoryInput.focus();
  closeComposeMemorySuggestions();
}

function closeComposeMemorySuggestions() {
  composeMemoryPopup.hidden = true;
  composeMemoryPopup.innerHTML = "";
  activeMemoryIndex = -1;
}

function getActiveEmailToken(value) {
  return String(value || "").split(/[;,，；]/).pop().trim();
}

function loadUsers() {
  try {
    const rows = JSON.parse(localStorage.getItem(CRM_USERS_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function loadCurrentUser() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    const sessionUser = session?.userId ? crmUsers.find((user) => user.id === session.userId && !user.disabled) : null;
    if (sessionUser) return sessionUser;
    const stored = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
    return crmUsers.find((user) => user.id === stored?.id && !user.disabled) || stored || crmUsers[0] || { id: "user-lina", name: "Lina", email: "sales.manager@example.com" };
  } catch {
    return crmUsers[0] || { id: "user-lina", name: "Lina", email: "sales.manager@example.com" };
  }
}

function loadMailAccounts() {
  try {
    const rows = JSON.parse(localStorage.getItem(MAIL_ACCOUNTS_KEY) || "[]");
    if (Array.isArray(rows) && rows.length) return rows.map(normalizeMailAccount);
  } catch {
    // Use fallback below.
  }
  return [normalizeMailAccount({ id: "mail-demo", userId: "user-lina", email: FROM_EMAIL, senderName: "Lina Mei", isDefault: true })];
}

function normalizeMailAccount(account = {}) {
  const createdAt = account.createdAt || new Date().toISOString();
  return {
    id: account.id || createId(),
    userId: account.userId || "",
    type: account.type || "enterprise",
    email: String(account.email || "").trim().toLowerCase(),
    password: account.password || "",
    smtpHost: account.smtpHost || "",
    smtpPort: String(account.smtpPort || ""),
    imapHost: account.imapHost || "",
    imapPort: String(account.imapPort || ""),
    ssl: Boolean(account.ssl),
    tls: Boolean(account.tls),
    senderName: account.senderName || "",
    defaultSignatureId: account.defaultSignatureId || "",
    isDefault: Boolean(account.isDefault),
    testStatus: account.testStatus || "",
    createdAt,
    updatedAt: account.updatedAt || createdAt,
  };
}

function getVisibleMailAccounts() {
  if (currentUser?.role === "admin") return mailAccounts;
  return mailAccounts.filter((account) => account.userId === currentUser?.id || account.email === currentUser?.email);
}

function getDefaultMailAccount() {
  const rows = getVisibleMailAccounts();
  return rows.find((account) => account.isDefault) || rows[0] || mailAccounts.find((account) => account.isDefault) || mailAccounts[0] || null;
}

function getSenderEmail() {
  return getDefaultMailAccount()?.email || currentUser?.email || FROM_EMAIL;
}

function getMailAccountTransportPayload(account = {}) {
  return {
    email: account.email || "",
    password: account.password || "",
    senderName: account.senderName || "",
    smtpHost: account.smtpHost || "",
    smtpPort: account.smtpPort || "",
    imapHost: account.imapHost || "",
    imapPort: account.imapPort || "",
    ssl: Boolean(account.ssl),
    tls: Boolean(account.tls),
  };
}

function loadSignatures() {
  try {
    const rows = JSON.parse(localStorage.getItem(SIGNATURES_KEY) || "[]");
    if (Array.isArray(rows) && rows.length) return rows.map(normalizeSignature);
  } catch {
    // Use fallback below.
  }
  return [{
    id: "default-signature",
    name: "默认签名",
    userId: currentUser?.id || "user-lina",
    isDefault: true,
    body: "Lina Mei\nSales Director\nDemo Export Company\nEmail: admin@example.com\nWhatsApp: +1 555 010 1000",
  }];
}

function normalizeSignature(signature = {}) {
  const html = signature.html || (signature.body ? textToEditorHtml(signature.body) : "");
  return {
    id: signature.id || createId(),
    name: signature.name || "默认签名",
    type: signature.type || "default",
    scope: signature.scope || (signature.userId ? "personal" : "public"),
    userId: signature.userId || "",
    createdBy: signature.createdBy || signature.userId || "",
    isDefault: Boolean(signature.isDefault),
    html,
    body: signature.body || stripHtml(html),
  };
}

function loadAiSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(AI_SETTINGS_KEY) || "null") || {};
    return {
      provider: stored.provider || "deepseek",
      apiKey: stored.apiKey || "",
      baseUrl: stored.baseUrl || DEEPSEEK_BASE_URL,
      model: stored.model || DEEPSEEK_MODEL,
    };
  } catch {
    return { provider: "deepseek", apiKey: "", baseUrl: DEEPSEEK_BASE_URL, model: DEEPSEEK_MODEL };
  }
}

function saveAiSettings() {
  aiSettings = loadAiSettings();
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(aiSettings));
  showToast("AI设置请在设置页维护");
}

function hydrateAiSettings() {
  aiSettings = loadAiSettings();
  if (assistantEmailType && composeEmailType) assistantEmailType.value = composeEmailType.value;
  if (assistantProduct && currentCustomer?.product) assistantProduct.value = normalizeAssistantProduct(currentCustomer.product);
}

function installEditorValueBridge() {
  if (!composeBody || "value" in composeBody) return;
  Object.defineProperty(composeBody, "value", {
    get() {
      return getEditorText();
    },
    set(value) {
      composeBody.innerHTML = textToEditorHtml(value || "");
    },
  });
}

function getEditorText() {
  return String(composeBody.innerText || "").replace(/\u00a0/g, " ").trim();
}

function getEditorHtml() {
  return composeBody.innerHTML.trim();
}

function setEditorText(text) {
  composeBody.innerHTML = textToEditorHtml(text || "");
}

function textToEditorHtml(text) {
  return escapeHtml(text).replace(/\r?\n/g, "<br>");
}

function stripHtml(html) {
  const node = document.createElement("div");
  node.innerHTML = html || "";
  return node.innerText || "";
}

function renderSignatureOptions() {
  if (!composeSignatureSelect) return;
  const account = getDefaultMailAccount();
  const rows = signatures.filter((item) => item.scope === "public" || !item.userId || item.userId === currentUser?.id || item.createdBy === currentUser?.id || item.userId === "user-lina");
  composeSignatureSelect.innerHTML = rows.map((signature) => `<option value="${escapeAttr(signature.id)}">${escapeHtml(signature.name)}${signature.isDefault ? "（默认）" : ""}</option>`).join("");
  const defaultSignature = rows.find((item) => item.id === account?.defaultSignatureId) || rows.find((item) => item.userId === currentUser?.id && item.isDefault) || rows.find((item) => item.scope === "public" && item.isDefault) || rows[0];
  if (defaultSignature) composeSignatureSelect.value = defaultSignature.id;
}

function getSelectedSignature() {
  const id = composeSignatureSelect?.value;
  return signatures.find((item) => item.id === id) || signatures.find((item) => item.userId === currentUser?.id && item.isDefault) || signatures[0] || null;
}

function applySelectedSignature() {
  const signature = getSelectedSignature();
  if (!signature) return;
  const withoutOldSignature = getEditorText().replace(/\n{0,2}-- \n[\s\S]*$/m, "").trim();
  const bodyHtml = textToEditorHtml(withoutOldSignature);
  composeBody.innerHTML = `${bodyHtml}${bodyHtml ? "<br><br>" : ""}-- <br>${replaceSignatureVariables(signature.html || textToEditorHtml(signature.body || ""))}`;
  showToast("签名已插入正文");
}

function replaceSignatureVariables(html) {
  const account = getDefaultMailAccount();
  const values = {
    UserName: currentUser?.name || "",
    Position: currentUser?.role === "admin" ? "Sales Director" : "Sales",
    Company: "Demo Export Company",
    Email: account?.email || currentUser?.email || FROM_EMAIL,
    Phone: "",
    WhatsApp: "+1 555 010 1000",
    Website: "https://example.com",
  };
  return String(html || "").replace(/\{(UserName|Position|Company|Email|Phone|WhatsApp|Website)\}/g, (_, key) => escapeHtml(values[key] || ""));
}

function hydrateComposeFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("to") || "";
  const customerId = params.get("customerId") || "";
  const draftId = params.get("draftId") || "";

  if (draftId) {
    const draft = findDraftById(draftId);
    if (draft) {
      editingDraftId = draft.id;
      currentCustomer = findCustomerById(draft.customerId) || findCustomerByEmail(draft.to) || createAdHocCustomer(draft.to);
      composeTo.value = draft.to || "";
      composeCc.value = draft.cc || "";
      composeBcc.value = draft.bcc || "";
      composeSubject.value = draft.subject || "";
      composeEmailType.value = normalizeEmailType(draft.emailType || params.get("type"));
      if (assistantEmailType) assistantEmailType.value = composeEmailType.value;
      if (assistantProduct) assistantProduct.value = normalizeAssistantProduct(currentCustomer?.product || draft.product || "");
      attachments = Array.isArray(draft.attachments) ? draft.attachments.slice() : [];
      if (draft.bodyHtml) composeBody.innerHTML = draft.bodyHtml;
      else composeBody.value = draft.body || "";
      renderAttachments();
      composeStatus.textContent = "正在编辑已保存草稿，保存后会覆盖原草稿。";
      return;
    }
  }

  currentCustomer = findCustomerById(customerId) || findCustomerByEmail(email) || createAdHocCustomer(email);
  composeTo.value = email || currentCustomer?.email || "";
  composeEmailType.value = normalizeEmailType(params.get("type"));
  if (assistantEmailType) assistantEmailType.value = composeEmailType.value;
  if (assistantProduct) assistantProduct.value = normalizeAssistantProduct(currentCustomer?.product || "");

  const subject = params.get("subject") || "";
  const body = params.get("body") || "";
  if (subject || body) {
    composeSubject.value = subject;
    composeBody.value = body;
  } else if (composeTo.value || currentCustomer?.company) {
    applyDraft(buildTemplateDraft(), { silent: true });
  }
}

function findDraftById(id) {
  const draft = (mailState.drafts || []).find((item) => item.id === id);
  if (draft) return draft;
  for (const customer of customers) {
    const customerDraft = (customer.drafts || []).find((item) => item.id === id);
    if (customerDraft) return { ...customerDraft, customerId: customer.id, to: customerDraft.to || customer.email };
  }
  return null;
}

async function generateDraft(provider) {
  aiSettings = loadAiSettings();
  composeEmailType.value = getEffectiveEmailType();
  const useTemplate = provider === "template" || aiSettings.provider === "template" || !aiSettings.apiKey;
  if (useTemplate) {
    const draft = buildTemplateDraft();
    setAssistantDraft(draft);
    showToast("已使用本地模板生成邮件");
    return;
  }

  if (location.protocol === "file:") {
    setAssistantDraft(buildTemplateDraft());
    showToast("本地文件模式下已使用模板生成，线上可调用DeepSeek");
    return;
  }

  deepseekComposeBtn.disabled = true;
  deepseekComposeBtn.textContent = "生成中";
  composeStatus.textContent = "正在调用 DeepSeek 生成草稿...";

  try {
    const response = await fetch("/api/ai-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: composeEmailType.value,
        userRequest: buildAssistantPrompt(),
        customer: getCustomerPromptContext(),
        currentDraft: getCurrentDraftText(),
        research: [aiInput.value.trim(), getAssistantAttachmentResearchText(), getLatestAiResearch(currentCustomer)].filter(Boolean).join("\n\n"),
        history: getHistoryMessages().slice(0, 8).map((message) => ({
          role: message.mailbox === "inbox" ? "customer" : "user",
          text: `${message.date || ""} ${message.subject || ""}\n${message.body || message.snippet || ""}`.slice(0, 1200),
        })),
        apiKey: aiSettings.apiKey,
        baseUrl: normalizeBaseUrl(aiSettings.baseUrl),
        model: aiSettings.model || DEEPSEEK_MODEL,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "DEEPSEEK_FAILED");
    setAssistantDraft(sanitizeGeneratedEmailDraft({ subject: result.subject, body: result.body }));
    showToast("DeepSeek邮件已生成，可插入或替换正文");
  } catch {
    setAssistantDraft(buildTemplateDraft());
    showToast("DeepSeek不可用，已自动使用本地模板");
  } finally {
    deepseekComposeBtn.disabled = false;
    deepseekComposeBtn.textContent = "生成邮件";
    composeStatus.textContent = "当前不会真实发送邮件；可保存草稿、复制到 Foxmail/Gmail，或保存为模拟发件记录。";
  }
}

function buildTemplateDraft() {
  const customer = currentCustomer || createAdHocCustomer(composeTo.value);
  const product = getAssistantProduct();
  const contact = customer.contact || customer.contacts?.[0]?.name || "";
  const greeting = contact ? `Hi ${contact},` : "Hi,";
  const company = customer.company || getCompanyFromEmail(composeTo.value) || "your team";
  const country = customer.country ? ` in ${customer.country}` : "";
  const type = toEnglishCustomerType(customer.customerType || customer.industry || customer.segment || "home appliance importing");
  const lastFollow = getLastFollowText(customer);
  const research = [aiInput?.value?.trim(), getAssistantAttachmentResearchText(), getLatestAiResearch(customer)].filter(Boolean).join("\n\n");
  const researchBrief = analyzeCustomerResearch(customer, research);
  const insight = getResearchInsight(customer, research, researchBrief);
  const emailType = getEffectiveEmailType();
  const toneLine = getToneLine();

  if (emailType === "followup") {
    return {
      subject: `Follow-up: ${insight.subjectHook.replace(/\s+-\s+.*$/, "")}`,
      body: `${greeting}\n\nI wanted to follow up on our previous conversation${lastFollow ? `: ${lastFollow}` : ""}.\n\n${insight.opening}\n\n${insight.valuePoint} ${product} may be worth a quick review, especially if you are comparing stable factory-direct suppliers for OEM / private label projects.\n\n${toneLine}${insight.nextStep}\n\nBest regards,\nLina Mei\nDemo Export Company`,
    };
  }

  if (emailType === "quote") {
    return {
      subject: `Checking your feedback on ${product} quotation`,
      body: `${greeting}\n\nI am checking whether you had a chance to review our quotation for ${product}.\n\n${insight.opening}\n\nWith that context, if the target price, MOQ, packaging requirement or certification documents need adjustment, I can help revise the proposal and prepare a clearer comparison for your internal review.\n\n${toneLine}Would you like me to resend the quotation together with the main specs and available OEM options?\n\nBest regards,\nLina Mei\nDemo Export Company`,
    };
  }

  if (emailType === "sample") {
    return {
      subject: `Sample follow-up: ${product}`,
      body: `${greeting}\n\nI am following up on the sample evaluation for ${product}.\n\n${insight.opening}\n\nCould you share whether your team has any feedback on product appearance, coffee performance, packaging, certification documents or target cost? Your comments will help us adjust the OEM solution around the points that matter most for your market.\n\n${toneLine}If helpful, I can also prepare a short checklist for testing and comparison.\n\nBest regards,\nLina Mei\nDemo Export Company`,
    };
  }

  if (emailType === "dormant") {
    return {
      subject: `A fresh coffee-machine angle for ${company}`,
      body: `${greeting}\n\nIt has been a while since we last connected, so I wanted to share a more practical angle rather than just another catalogue.\n\n${insight.opening}\n\nFORYAL has updated coffee machine OEM / private label options, including ${product}. For importers and appliance brands${country}, we can support model selection, packaging customization, export documents and stable factory-direct supply.\n\n${toneLine}Would you like me to send a short updated product summary matched to that angle?\n\nBest regards,\nLina Mei\nDemo Export Company`,
    };
  }

  return {
    subject: `${insight.subjectHook} - ${product}`,
    body: `${greeting}\n\n${insight.opening}\n\n${insight.valuePoint} Aison can support ${product}, private label packaging, export documents, SKD / CKD discussion, and stable factory-direct supply without adding trading-company layers.\n\n${toneLine}${insight.nextStep}\n\nBest regards,\nLina Mei\nDemo Export Company`,
  };
}

function analyzeCustomerResearch(customer = {}, research = "") {
  const raw = cleanResearchText(research);
  const text = `${customer.company || ""} ${customer.country || ""} ${customer.industry || ""} ${customer.customerType || ""} ${customer.segment || ""} ${raw}`.toLowerCase();
  const hasUsefulResearch = Boolean(raw.trim());
  const products = detectResearchSignals(text, [
    [/coffee|espresso|cappuccino|咖啡|意式/i, "coffee appliances"],
    [/grinder|grind|burr|磨豆|研磨/i, "grinder coffee machines"],
    [/kitchen|cooking|cookware|厨房/i, "kitchen appliances"],
    [/small appliance|home appliance|家电|小家电/i, "small home appliances"],
    [/juicer|blender|meat grinder|fan|heater|air fryer|榨汁|搅拌|绞肉|风扇|空气炸锅/i, "adjacent small appliances"],
  ]);
  const painPoints = detectResearchSignals(text, [
    [/complaint|bad review|negative review|refund|return|投诉|差评|退货/i, "consumer feedback or return risk"],
    [/after.?sales|warranty|repair|spare parts|service|售后|维修|配件/i, "after-sales and spare-parts pressure"],
    [/missing|lack|gap|缺少|没有|不足/i, "missing product option or range gap"],
    [/supplier|unstable|delay|lead time|late|供应链不稳定|延迟|交期/i, "supplier stability or delivery concern"],
    [/moq|minimum order|起订/i, "MOQ flexibility concern"],
    [/certification|ce|gs|lfgb|cb|etl|认证/i, "certification and compliance requirement"],
    [/packaging|package|logo|private label|包装|标识/i, "packaging or private label requirement"],
  ]);
  const growthAngles = detectResearchSignals(text, [
    [/premium|higher.?end|upgrade|margin|profit|growth|高端|升级|利润|增长/i, "higher-value product upgrade"],
    [/differentiat|unique|new model|innovation|差异化|新品/i, "differentiated model story"],
    [/private label|own brand|brand owner|oem|odm|自有品牌|品牌|贴牌/i, "private label or own-brand expansion"],
    [/retail|chain|marketplace|amazon|e-?commerce|store|零售|连锁|电商|平台/i, "retail sell-through improvement"],
    [/import|procurement|sourcing|buyer|采购|进口|寻源/i, "factory-direct sourcing option"],
  ]);
  const procurementConcerns = detectResearchSignals(text, [
    [/price|fob|cost|target price|价格|报价|成本/i, "FOB cost and target price"],
    [/moq|起订/i, "MOQ"],
    [/sample|样品/i, "sample evaluation"],
    [/certification|ce|gs|lfgb|认证/i, "certification files"],
    [/delivery|lead time|shipment|交期|出货/i, "lead time"],
    [/packaging|logo|包装|标识/i, "packaging and logo customization"],
    [/spare parts|warranty|售后|配件/i, "spare parts and warranty support"],
  ]);
  const productPhrase = products[0] || "home-appliance product development";
  const painPhrase = painPoints[0] || growthAngles[0] || procurementConcerns[0] || inferEnglishResearchSnippet(raw);
  return {
    hasUsefulResearch,
    products,
    painPoints,
    growthAngles,
    procurementConcerns,
    safeObservation: sanitizeEnglishEmailText(`${productPhrase} appears connected with ${painPhrase}`),
    entryPoint: sanitizeEnglishEmailText(buildEntryPoint({ painPoints, growthAngles, procurementConcerns })),
    valuePoint: sanitizeEnglishEmailText(buildValuePoint({ painPoints, growthAngles, procurementConcerns })),
    nextStep: sanitizeEnglishEmailText(buildResearchNextStep({ painPoints, growthAngles, procurementConcerns })),
  };
}

function detectResearchSignals(text, rules) {
  const hits = [];
  for (const [pattern, label] of rules) {
    if (pattern.test(text) && !hits.includes(label)) hits.push(label);
  }
  return hits;
}

function buildEntryPoint({ painPoints, growthAngles, procurementConcerns }) {
  if (painPoints.includes("after-sales and spare-parts pressure") || painPoints.includes("consumer feedback or return risk")) {
    return "That makes reliability, spare-parts planning, and clear service documentation a better entry point than a generic catalogue.";
  }
  if (painPoints.includes("missing product option or range gap")) {
    return "That makes a focused model recommendation more useful than sending a broad catalogue.";
  }
  if (growthAngles.includes("higher-value product upgrade") || growthAngles.includes("differentiated model story")) {
    return "That makes product differentiation and margin improvement a practical discussion point.";
  }
  if (growthAngles.includes("private label or own-brand expansion")) {
    return "That makes private label execution, packaging, and model positioning the most relevant entry point.";
  }
  if (procurementConcerns.includes("certification files")) {
    return "That makes compliance documents and export-ready specifications important for the first review.";
  }
  return "That makes a short, concrete model comparison more useful than a generic introduction.";
}

function buildValuePoint({ painPoints, growthAngles, procurementConcerns }) {
  if (painPoints.includes("after-sales and spare-parts pressure") || painPoints.includes("consumer feedback or return risk")) {
    return "If your team wants to reduce after-sales risk while testing a coffee-machine option,";
  }
  if (growthAngles.includes("higher-value product upgrade")) {
    return "If your team is looking for a product line that can improve perceived value and category margin,";
  }
  if (growthAngles.includes("private label or own-brand expansion")) {
    return "If your team wants to add or refresh a branded coffee-machine model with factory-direct support,";
  }
  if (procurementConcerns.includes("FOB cost and target price")) {
    return "If your team needs a realistic FOB reference before deeper evaluation,";
  }
  if (procurementConcerns.includes("certification files")) {
    return "If your team needs export-ready product documents for internal review,";
  }
  return "If your team is reviewing ways to expand or refresh the coffee-appliance line,";
}

function buildResearchNextStep({ painPoints, growthAngles, procurementConcerns }) {
  if (painPoints.includes("after-sales and spare-parts pressure") || painPoints.includes("consumer feedback or return risk")) {
    return "Would it be useful if I send 2-3 suitable models with key parts, certification status, spare-parts support, MOQ and FOB reference?";
  }
  if (growthAngles.includes("higher-value product upgrade") || growthAngles.includes("differentiated model story")) {
    return "Would it be useful if I send 2-3 differentiated coffee-machine options with positioning, main selling points, MOQ and FOB reference?";
  }
  if (growthAngles.includes("private label or own-brand expansion")) {
    return "Would it be useful if I prepare 2-3 private label options with packaging direction, MOQ, key specifications and FOB reference?";
  }
  if (procurementConcerns.includes("certification files")) {
    return "Would it be useful if I send a short supplier capability sheet with CE/GS/LFGB status, model options, MOQ and FOB reference?";
  }
  return "Would it be useful if I send 2-3 suitable model options with key specifications, MOQ and FOB reference for your review?";
}

function getResearchInsight(customer, research = "", brief = null) {
  brief = brief || analyzeCustomerResearch(customer, research);
  const company = customer.company || getCompanyFromEmail(composeTo.value) || "your team";
  const country = customer.country ? ` in ${customer.country}` : "";
  const usefulLine = pickUsefulResearchLine(research);
  const hasResearch = Boolean(cleanResearchText(research));
  const lower = `${customer.company || ""} ${customer.industry || ""} ${customer.customerType || ""} ${customer.segment || ""} ${research || ""}`.toLowerCase();

  const base = {
    subjectHook: `Coffee machine OEM options for ${company}`,
    opening: hasResearch
      ? `I reviewed the public company/profile information for ${company}${country}. One practical point stood out: ${usefulLine}.`
      : `I am writing because ${company}${country} looks like a practical fit for coffee machine OEM / private label cooperation.`,
    valuePoint: "If your team is reviewing ways to expand or refresh the coffee-appliance line,",
    nextStep: "Would it be useful if I send 2-3 suitable model options with key specifications, MOQ and FOB reference for your review?",
  };

  if (brief.hasUsefulResearch) {
    base.opening = `I reviewed the public company/profile information for ${company}${country}. The useful business signal is that ${brief.safeObservation}.`;
    base.valuePoint = brief.valuePoint;
    base.nextStep = brief.nextStep;
  }

  if (/complaint|review|negative|refund|broken|warranty|after.?sales|spare parts|repair|差评|投诉|售后|维修|配件/.test(lower)) {
    return {
      subjectHook: `Reducing after-sales risk for ${company}`,
      opening: hasResearch
        ? `I reviewed the public company/profile information for ${company}${country}. The practical signal is that ${brief.safeObservation || usefulLine}.`
        : base.opening,
      valuePoint: brief.valuePoint || "If your team wants a coffee-machine option with clearer component control, spare-parts planning and documentation support,",
      nextStep: brief.nextStep || "I can send a short comparison of 2-3 models focused on reliability, key parts, certifications and after-sales support. Would that be useful?",
    };
  }

  if (/premium|margin|profit|growth|higher.?end|upgrade|高端|利润|增长|升级|差异化/.test(lower)) {
    return {
      subjectHook: `A higher-value coffee machine line for ${company}`,
      opening: hasResearch
        ? `I reviewed the public company/profile information for ${company}${country}. It suggests a possible opportunity around ${brief.growthAngles[0] || usefulLine}.`
        : base.opening,
      valuePoint: brief.valuePoint || "If your team is looking for a product line that can improve perceived value and margin,",
      nextStep: brief.nextStep || "I can send 2-3 models with the main selling points, target positioning and FOB reference so you can judge whether the category is worth testing.",
    };
  }

  if (/private label|own brand|brand owner|brand|品牌|自有品牌|oem|odm/.test(lower)) {
    return {
      subjectHook: `Private label coffee machine options for ${company}`,
      opening: hasResearch
        ? `I reviewed the public company/profile information for ${company}${country}. The strongest angle appears to be ${usefulLine}, which is closer to brand-controlled product expansion than a standard catalogue item.`
        : base.opening,
      valuePoint: "If your team wants to add or refresh a branded coffee-machine model with factory-direct support,",
      nextStep: "I can prepare 2-3 private label options with packaging direction, MOQ, key specifications and FOB reference for your review.",
    };
  }

  if (/import|procurement|sourcing|buyer|logistics|进口|采购|供应链|物流/.test(lower)) {
    return {
      subjectHook: `Factory-direct coffee machine supply for ${company}`,
      opening: hasResearch
        ? `I reviewed the public company/profile information for ${company}${country}. From the import/procurement angle, ${usefulLine} points to a practical issue beyond price: supplier stability, documents and predictable delivery.`
        : base.opening,
      valuePoint: "If your team is comparing factory-direct supply options for coffee machines,",
      nextStep: "I can send a concise supplier capability sheet together with 2-3 suitable models, MOQ and FOB reference.",
    };
  }

  if (/retail|chain|store|supermarket|marketplace|amazon|e-?commerce|shop|零售|连锁|电商|平台/.test(lower)) {
    return {
      subjectHook: `Coffee machine options for retail channels`,
      opening: hasResearch
        ? `I reviewed the public company/profile information for ${company}${country}. The useful angle is ${usefulLine}, connected to retail sell-through, clear product stories, stable packaging and fewer after-sales surprises.`
        : base.opening,
      valuePoint: "If your team is reviewing coffee-machine models for retail or online channels,",
      nextStep: "I can send 2-3 options with selling points, carton information, MOQ and FOB reference for a quick internal check.",
    };
  }

  return base;
}

function pickUsefulResearchLine(research = "") {
  const cleaned = cleanResearchText(research);
  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line.length > 8 && line.length < 220)
    .filter((line) => !/^(home|search|message|notifications|follow|connect|show all|about|privacy|terms|language|footer)$/i.test(line));
  const priority = lines.find((line) => isSafeEnglishSnippet(line) && /coffee|espresso|appliance|kitchen|brand|import|procurement|sourcing|retail|review|complaint|warranty|private label|oem|odm/i.test(line));
  const readable = priority || lines.find(isSafeEnglishSnippet);
  return sanitizeEnglishEmailText(readable || inferEnglishResearchSnippet(cleaned)).slice(0, 180);
}

function isSafeEnglishSnippet(value = "") {
  const text = String(value || "");
  if (/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0590-\u05ff\u0600-\u06ff\u0400-\u04ff]/.test(text)) return false;
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  return letters >= 6;
}

function inferEnglishResearchSnippet(text = "") {
  const lower = String(text || "").toLowerCase();
  if (/投诉|差评|售后|维修|配件|complaint|review|warranty|after.?sales|spare parts/.test(lower)) return "after-sales reliability and customer feedback appear to be important buying concerns";
  if (/高端|升级|利润|增长|差异化|premium|margin|profit|growth|upgrade/.test(lower)) return "there may be room for a more differentiated coffee-machine product line";
  if (/自有品牌|品牌|private label|own brand|brand owner|oem|odm/.test(lower)) return "brand-controlled product development and private label support seem relevant";
  if (/进口|采购|物流|供应链|import|procurement|sourcing|logistics/.test(lower)) return "supplier stability, export documents and predictable delivery appear to matter";
  if (/零售|连锁|电商|平台|retail|chain|e-?commerce|marketplace|amazon/.test(lower)) return "retail sell-through, packaging consistency and clear product stories seem relevant";
  if (/咖啡|coffee|espresso/.test(lower)) return "coffee-appliance category expansion appears relevant";
  return "your business seems connected to home-appliance product development and sourcing";
}

function cleanResearchText(research = "") {
  return String(research || "")
    .replace(/AI research attachments uploaded by user\.[\s\S]*?(?=File:|$)/g, "")
    .replace(/Read status: .+/g, "")
    .replace(/Extracted text:/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function applyDraft(draft, options = {}) {
  draft = sanitizeGeneratedEmailDraft(draft);
  composeSubject.value = draft.subject || composeSubject.value;
  if (draft.body) setEditorText(withSignature(draft.body));
  if (!options.silent) showToast("草稿已填入邮件编辑区");
}

function setAssistantDraft(draft = {}) {
  draft = sanitizeGeneratedEmailDraft(draft);
  lastAssistantDraft = {
    subject: draft.subject || composeSubject.value || "",
    body: draft.body || "",
  };
  if (assistantResult) {
    assistantResult.value = [`Subject: ${lastAssistantDraft.subject}`, "", lastAssistantDraft.body].join("\n").trim();
  }
  if (lastAssistantDraft.subject && !composeSubject.value.trim()) composeSubject.value = lastAssistantDraft.subject;
}

function insertAssistantResult() {
  const draft = getAssistantDraftFromResult();
  if (!draft.body) {
    showToast("请先生成邮件");
    return;
  }
  replaceEditorWithDraft(draft);
  showToast("AI结果已替换正文");
}

function replaceWithAssistantResult() {
  const draft = getAssistantDraftFromResult();
  if (!draft.body) {
    showToast("请先生成邮件");
    return;
  }
  replaceEditorWithDraft(draft);
  showToast("AI结果已替换正文");
}

async function copyAssistantResult() {
  const text = assistantResult?.value.trim() || "";
  if (!text) {
    showToast("请先生成邮件");
    return;
  }
  await navigator.clipboard?.writeText(text);
  showToast("AI结果已复制");
}

function replaceEditorWithDraft(draft = {}) {
  draft = sanitizeGeneratedEmailDraft(draft);
  if (draft.subject) composeSubject.value = draft.subject;
  setEditorText(withSignature(draft.body || ""));
  focusEditor();
}

function getAssistantDraftFromResult() {
  const raw = assistantResult?.value.trim() || "";
  if (!raw && lastAssistantDraft) return lastAssistantDraft;
  const lines = raw.split(/\r?\n/);
  const first = lines[0] || "";
  const hasSubject = /^subject\s*:/i.test(first);
  return {
    subject: hasSubject ? first.replace(/^subject\s*:\s*/i, "").trim() : (lastAssistantDraft?.subject || composeSubject.value.trim()),
    body: hasSubject ? lines.slice(1).join("\n").trim() : raw,
  };
}

function getEffectiveEmailType() {
  return normalizeEmailType(assistantEmailType?.value || composeEmailType.value);
}

function getAssistantProduct() {
  return assistantProduct?.value || currentCustomer?.product || PRODUCT_FALLBACK;
}

function normalizeAssistantProduct(value) {
  const text = String(value || "");
  if (/1600/i.test(text)) return "CM-1600B";
  if (/1700/i.test(text)) return "CM-1700MY";
  if (/1302/i.test(text)) return "CM-1302MYC";
  if (/skd|ckd/i.test(text)) return "SKD / CKD";
  if (/oem|private/i.test(text)) return "OEM / Private Label";
  return "CM-1700MY";
}

function toEnglishCustomerType(value = "") {
  const text = String(value || "").trim();
  const map = [
    [/\u5c0f\u5bb6\u7535\u54c1\u54c1\u724c\u5546|\u5bb6\u7535\u54c1\u724c\u5546|\u5496\u5561\u8bbe\u5907\u54c1\u724c\u5546|\u54c1\u724c\u5546/i, "appliance brand owners"],
    [/\u5bb6\u7535\u8fdb\u53e3\u5546|\u5496\u5561\u8bbe\u5907\u8fdb\u53e3\u5546|\u8fdb\u53e3\u5546/i, "appliance importers"],
    [/\u53a8\u623f\u7535\u5668\u6279\u53d1\u5546|\u6279\u53d1\u5546/i, "kitchen appliance wholesalers"],
    [/\u8fde\u9501\u96f6\u552e\u5546|\u96f6\u552e\u5546/i, "retail chains"],
    [/\u7535\u5546\u5356\u5bb6|\u8de8\u5883\u7535\u5546/i, "e-commerce sellers"],
    [/\u5496\u5561\u8bbe\u5907\u4f9b\u5e94\u5546/i, "coffee equipment suppliers"],
    [/\u4ee3\u7406\u5546/i, "brand distributors"],
    [/小家电品牌商|家电品牌商|咖啡设备品牌商|品牌商/i, "appliance brand owners"],
    [/家电进口商|咖啡设备进口商|进口商/i, "appliance importers"],
    [/厨房电器批发商|批发商/i, "kitchen appliance wholesalers"],
    [/连锁零售商|零售商/i, "retail chains"],
    [/电商卖家|跨境电商|amazon|ecommerce/i, "e-commerce sellers"],
    [/咖啡设备供应商/i, "coffee equipment suppliers"],
    [/代理商/i, "brand distributors"],
  ];
  const found = map.find(([pattern]) => pattern.test(text));
  if (found) return found[1];
  return sanitizeEnglishEmailText(text || "home appliance importers");
}

function sanitizeGeneratedEmailDraft(draft = {}) {
  return {
    subject: sanitizeEnglishEmailText(draft.subject || ""),
    body: sanitizeEnglishEmailText(draft.body || ""),
  };
}

function sanitizeEnglishEmailText(value = "") {
  const replacements = [
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
    ["品牌商", "brand owner"],
    ["进口商", "importer"],
    ["批发商", "wholesaler"],
    ["连锁零售商", "retail chain"],
    ["零售商", "retailer"],
    ["电商卖家", "e-commerce seller"],
    ["咖啡设备供应商", "coffee equipment supplier"],
    ["小家电品牌", "small appliance brand"],
    ["家电品牌", "home appliance brand"],
    ["厨房电器", "kitchen appliance"],
    ["开发信", "outreach email"],
    ["跟进邮件", "follow-up email"],
  ];
  let text = String(value || "");
  replacements.sort((a, b) => b[0].length - a[0].length).forEach(([from, to]) => {
    text = text.replaceAll(from, to);
  });
  return text.replace(/[，。；：、]/g, (mark) => ({ "，": ",", "。": ".", "；": ";", "：": ":", "、": "," })[mark] || mark);
}

function getToneLine() {
  const tone = assistantTone?.value || "brief";
  const map = {
    brief: "",
    formal: "I will keep this brief and professional. ",
    "old-customer": "Since we have communicated before, I will keep the next step practical. ",
    "fair-followup": "It was useful to connect after the exhibition, and I wanted to continue the discussion with a clear next step. ",
    price: "If pricing is the key point, we can review MOQ, configuration and FOB range together. ",
  };
  return map[tone] || "";
}

function withSignature(body) {
  if (/--\s*\n|Best regards,\s*\n/i.test(body)) return body;
  const signature = getSelectedSignature();
  return signature ? `${body.trim()}\n\n-- \n${stripHtml(replaceSignatureVariables(signature.html || textToEditorHtml(signature.body || "")))}` : body;
}

function saveDraftFromForm(event) {
  event.preventDefault();
  const recipients = getComposeRecipients();
  if (!recipients) return;
  const { to, cc, bcc, primaryEmail } = recipients;
  const subject = composeSubject.value.trim();
  const body = getEditorText();
  const bodyHtml = getEditorHtml();
  if (!to || !subject || !body) {
    showToast("请填写收件人、主题和正文");
    return;
  }

  const customer = currentCustomer?.id ? findCustomerById(currentCustomer.id) : findCustomerByEmail(primaryEmail);
  const existingDraft = editingDraftId ? (mailState.drafts || []).find((item) => item.id === editingDraftId) : null;
  composeEmailType.value = getEffectiveEmailType();
  const draft = {
    id: existingDraft?.id || editingDraftId || createId(),
    mailbox: "drafts",
    direction: "draft",
    from: getSenderEmail(),
    to,
    cc,
    bcc,
    subject,
    body,
    bodyHtml,
    snippet: compactText(body).slice(0, 180),
    date: existingDraft?.date || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: serializeAttachmentsForStorage(attachments),
    hasAttachments: attachments.length > 0,
    followStatus: "草稿",
    createdBy: getCurrentUserName(),
    customerId: customer?.id || currentCustomer?.id || "",
    company: customer?.company || currentCustomer?.company || getCompanyFromEmail(to),
    country: customer?.country || currentCustomer?.country || "",
    emailType: getEffectiveEmailType(),
    tracking: existingDraft?.tracking || createTrackingState(to),
  };
  draft.tracking.emailId = draft.id;

  mailState.drafts = Array.isArray(mailState.drafts) ? mailState.drafts : [];
  if (existingDraft) {
    Object.assign(existingDraft, draft);
  } else {
    mailState.drafts.unshift(draft);
  }
  mailState.drafts = mailState.drafts.slice(0, 300);
  saveMailState();
  rememberComposeFields();

  if (customer) {
    customer.drafts = Array.isArray(customer.drafts) ? customer.drafts : [];
    customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
    const customerDraft = {
      id: draft.id,
      subject,
      date: toDateOnly(draft.date),
      status: "草稿",
      body,
      bodyHtml,
      createdBy: draft.createdBy,
      to,
      attachments: attachments.slice(),
      tracking: draft.tracking,
    };
    const existingCustomerDraft = customer.drafts.find((item) => item.id === draft.id);
    if (existingCustomerDraft) Object.assign(existingCustomerDraft, customerDraft);
    else customer.drafts.unshift(customerDraft);
    if (!existingDraft) {
      customer.timeline.unshift({
        id: createId(),
        date: toDateOnly(draft.date),
        type: "邮件草稿",
        content: `保存${getEmailTypeLabel(composeEmailType.value)}草稿：${subject}`,
      });
    }
    customer.updatedAt = toDateOnly(draft.date);
    saveCustomers();
  }

  selectedHistoryId = draft.id;
  editingDraftId = draft.id;
  renderHistory();
  showToast(existingDraft ? "草稿已更新" : "草稿已保存到草稿箱");
}

async function copyCurrentDraft() {
  const text = `To: ${composeTo.value.trim()}\nCC: ${composeCc.value.trim()}\nBCC: ${composeBcc.value.trim()}\nSubject: ${composeSubject.value.trim()}\n\n${getEditorText()}`;
  if (!text.trim()) {
    showToast("没有可复制的内容");
    return;
  }
  await navigator.clipboard?.writeText(text);
  showToast("已复制邮件内容");
}

async function copyForExternalMail(overrides = {}) {
  const subject = overrides.subject ?? composeSubject.value.trim();
  const html = overrides.html ?? getEditorHtml();
  const text = overrides.text ?? getEditorText();
  if (!text && !subject) {
    showToast("没有可复制的内容");
    return;
  }
  const fullText = [`To: ${composeTo.value.trim()}`, `CC: ${composeCc.value.trim()}`, `BCC: ${composeBcc.value.trim()}`, `Subject: ${subject}`, "", text].join("\n");
  try {
    if (navigator.clipboard?.write && window.ClipboardItem && html) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([fullText], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard?.writeText(fullText);
    }
    showToast("已复制，可粘贴到 Foxmail/Gmail 发送");
  } catch {
    await navigator.clipboard?.writeText(fullText);
    showToast("已复制纯文本，可粘贴到 Foxmail/Gmail");
  }
}

async function handleSendEmail() {
  const recipients = getComposeRecipients();
  if (!recipients) return;
  const { to, cc, bcc } = recipients;
  const subject = composeSubject.value.trim();
  const body = getEditorText();
  if (!to || !subject || !body) {
    showToast("请填写收件人、主题和正文");
    return;
  }
  const account = getDefaultMailAccount();
  if (account?.email && account?.password && account?.smtpHost && account?.smtpPort) {
    let outgoingAttachments = attachments;
    let outgoingText = body;
    let outgoingHtml = getEditorHtml();
    let trackingLinks = [];
    const forcedTrackedLinks = shouldForceTrackedAttachmentLinks();
    const useTrackedLinks = Boolean((sendAttachmentsAsTrackedLinks?.checked || forcedTrackedLinks) && attachments.length);
    const attachmentLimitMessage = useTrackedLinks ? getTrackedAttachmentLimitMessage() : getAttachmentApiLimitMessage();
    if (attachmentLimitMessage) {
      composeStatus.textContent = attachmentLimitMessage;
      showToast("附件超过线上CRM可处理范围，请改用 Foxmail/Gmail 或网盘");
      return;
    }
    if (!confirm(`确认使用 ${account.email} 发送到 ${to} 吗？`)) return;
    sendComposeBtn.disabled = true;
    sendComposeBtn.textContent = "发送中...";
    composeStatus.textContent = useTrackedLinks ? "正在上传附件并生成云端追踪链接..." : "正在通过 SMTP 发送邮件...";
    try {
      if (useTrackedLinks) {
        if (forcedTrackedLinks && sendAttachmentsAsTrackedLinks) sendAttachmentsAsTrackedLinks.checked = true;
        trackingLinks = await createTrackedAttachmentLinks(to, subject);
        const linkBlocks = buildTrackedAttachmentBlocks(trackingLinks);
        outgoingText = [body, linkBlocks.text].filter(Boolean).join("\n\n");
        outgoingHtml = [outgoingHtml, linkBlocks.html].filter(Boolean).join("");
        outgoingAttachments = [];
        composeStatus.textContent = "云端追踪链接已生成，正在通过 SMTP 发送邮件...";
      }
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: getMailAccountTransportPayload(account),
          to,
          cc,
          bcc,
          subject,
          text: outgoingText,
          html: outgoingHtml,
          attachments: outgoingAttachments,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 413) throw new Error("附件超过 Vercel 线上接口请求体限制。请复制到 Foxmail/Gmail 手动添加附件发送，或改用网盘链接。");
        throw new Error(result.message || result.error || "SEND_FAILED");
      }
      const sent = saveSimulatedSentRecord({
        direction: "sent",
        followStatus: "已真实发送",
        status: "已发送",
        isRealSent: true,
        messageId: result.messageId || "",
        transport: result.transport || "",
        body: outgoingText,
        bodyHtml: outgoingHtml,
        attachments: outgoingAttachments,
        trackingLinks,
      });
      selectedHistoryId = sent.id;
      renderHistory();
      composeStatus.textContent = `邮件已发送：${result.transport || account.smtpHost}`;
      showToast("邮件已真实发送并保存到发件记录");
    } catch (error) {
      if (useTrackedLinks && isBlobStorageConfigError(error)) {
        saveDraft();
        composeStatus.textContent = "云端附件存储未配置，无法在CRM里发送大附件追踪链接。已自动保存草稿；请配置 Vercel Blob 后重试，或复制正文到 Foxmail/Gmail 手动添加附件发送。";
        showToast("已保存草稿；需要配置 Vercel Blob 才能发送大附件链接");
        return;
      }
      composeStatus.textContent = `发送失败：${error.message || "SMTP连接失败"}`;
      showToast(`发送失败：${error.message || "SMTP连接失败"}`);
    } finally {
      sendComposeBtn.disabled = false;
      sendComposeBtn.textContent = "发送邮件";
    }
    return;
  }

  const ok = confirm("当前没有完整的 SMTP 账户配置，尚不能真实发送。你可以先保存草稿或复制到Foxmail/Gmail发送。\n\n点击“确定”：保存为发件记录（模拟发送）并标记为待发送，同时复制到剪贴板。\n点击“取消”：不保存发件记录。");
  if (!ok) return;
  let trackingLinks = [];
  let outgoingText = body;
  let outgoingHtml = getEditorHtml();
  let outgoingAttachments = attachments;
  const forcedTrackedLinks = shouldForceTrackedAttachmentLinks();
  if ((sendAttachmentsAsTrackedLinks?.checked || forcedTrackedLinks) && attachments.length) {
    try {
      if (forcedTrackedLinks && sendAttachmentsAsTrackedLinks) sendAttachmentsAsTrackedLinks.checked = true;
      composeStatus.textContent = "正在上传附件并生成云端追踪链接...";
      trackingLinks = await createTrackedAttachmentLinks(to, subject);
      const linkBlocks = buildTrackedAttachmentBlocks(trackingLinks);
      outgoingText = [body, linkBlocks.text].filter(Boolean).join("\n\n");
      outgoingHtml = [outgoingHtml, linkBlocks.html].filter(Boolean).join("");
      outgoingAttachments = [];
    } catch (error) {
      if (!isBlobStorageConfigError(error)) {
        composeStatus.textContent = `追踪链接生成失败：${error.message || "BLOB_STORAGE_NOT_CONFIGURED"}`;
        showToast(composeStatus.textContent);
        return;
      }
      if (forcedTrackedLinks) {
        composeStatus.textContent = "云端附件存储未配置，不能生成大附件链接。已保留本地附件并保存为待发送记录；请在 Foxmail/Gmail 手动添加附件发送，或配置 Vercel Blob 后重试。";
      } else {
        composeStatus.textContent = "云端附件存储未配置，已保留本地附件并保存为待发送记录。";
      }
      showToast("云端附件未配置，已改为本地待发送记录");
      trackingLinks = [];
      outgoingText = body;
      outgoingHtml = getEditorHtml();
      outgoingAttachments = attachments;
    }
  }
  const sent = saveSimulatedSentRecord({
    body: outgoingText,
    bodyHtml: outgoingHtml,
    attachments: outgoingAttachments,
    trackingLinks,
  });
  selectedHistoryId = sent.id;
  await copyForExternalMail({ text: outgoingText, html: outgoingHtml });
  renderHistory();
  showToast("已保存为发件记录（模拟发送/待发送），并已复制");
}

function saveSimulatedSentRecord(options = {}) {
  const recipients = getComposeRecipients({ silent: true }) || {
    to: composeTo.value.trim(),
    cc: composeCc.value.trim(),
    bcc: composeBcc.value.trim(),
    primaryEmail: getPrimaryRecipientEmail(composeTo.value),
  };
  const { to, cc, bcc, primaryEmail } = recipients;
  const customer = currentCustomer?.id ? findCustomerById(currentCustomer.id) : findCustomerByEmail(primaryEmail);
  const sent = {
    id: createId(),
    mailbox: "sent",
    direction: options.direction || "sent-simulated",
    from: getSenderEmail(),
    to,
    cc,
    bcc,
    subject: composeSubject.value.trim(),
    body: options.body || getEditorText(),
    bodyHtml: options.bodyHtml || getEditorHtml(),
    snippet: compactText(options.body || getEditorText()).slice(0, 180),
    date: new Date().toISOString(),
    attachments: serializeAttachmentsForStorage(Array.isArray(options.attachments) ? options.attachments : attachments),
    hasAttachments: Array.isArray(options.attachments) ? options.attachments.length > 0 : attachments.length > 0,
    trackingLinks: Array.isArray(options.trackingLinks) ? options.trackingLinks : [],
    followStatus: options.followStatus || "待发送（本地模拟）",
    status: options.status || "待发送",
    isRealSent: Boolean(options.isRealSent),
    messageId: options.messageId || "",
    transport: options.transport || "",
    createdBy: getCurrentUserName(),
    customerId: customer?.id || currentCustomer?.id || "",
    company: customer?.company || currentCustomer?.company || getCompanyFromEmail(to),
    country: customer?.country || currentCustomer?.country || "",
    emailType: getEffectiveEmailType(),
    tracking: createTrackingState(to),
  };
  sent.tracking.emailId = sent.id;
  mailState.sent = Array.isArray(mailState.sent) ? mailState.sent : [];
  mailState.sent.unshift(sent);
  // If this was a draft being sent, remove it from drafts
  if (editingDraftId) {
    mailState.drafts = (mailState.drafts || []).filter(function(d) { return d.id !== editingDraftId; });
    editingDraftId = "";
  }
  saveMailState();
  rememberComposeFields();
  if (customer) {
    customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
    customer.timeline.unshift({
      id: createId(),
      date: toDateOnly(sent.date),
      type: options.isRealSent ? "邮件已发送" : "邮件待发送",
      content: options.isRealSent ? `已真实发送邮件：${sent.subject}` : `本地保存发件记录（未真实发送）：${sent.subject}`,
    });
    customer.updatedAt = toDateOnly(sent.date);
    saveCustomers();
  }
  return sent;
}

function isBlobStorageConfigError(error) {
  const message = String(error?.message || error || "");
  return /BLOB_STORAGE_NOT_CONFIGURED|Vercel Blob|Blob Storage|云端附件|云端存储|Storage/i.test(message);
}

function serializeAttachmentsForStorage(files = []) {
  return (Array.isArray(files) ? files : []).map((file) => {
    const size = Number(file?.size || 0);
    const encodedSize = getDataUrlEncodedSize(file?.dataUrl || "");
    const canStoreData = file?.dataUrl && encodedSize > 0 && encodedSize <= LOCAL_STORED_ATTACHMENT_BYTES;
    return {
      id: file?.id || createId(),
      name: file?.name || file?.filename || "attachment",
      filename: file?.filename || file?.name || "attachment",
      size,
      type: file?.type || "application/octet-stream",
      addedAt: file?.addedAt || new Date().toISOString(),
      storage: canStoreData ? "local-data" : (file?.storage || "metadata-only"),
      dataUrl: canStoreData ? file.dataUrl : "",
      metadataOnly: !canStoreData,
      note: canStoreData ? "" : "仅保存附件元数据；再次发送时请重新选择原文件，或配置云端附件链接。",
    };
  });
}

function getDataUrlEncodedSize(dataUrl = "") {
  const text = String(dataUrl || "");
  const commaIndex = text.indexOf(",");
  if (commaIndex < 0) return 0;
  return text.length - commaIndex - 1;
}

function sanitizeMailStateForStorage(state = {}) {
  const sanitizeMessage = (message) => ({
    ...message,
    attachments: serializeAttachmentsForStorage(message?.attachments || []),
  });
  return {
    inbox: (Array.isArray(state.inbox) ? state.inbox : []).map(sanitizeMessage),
    sent: (Array.isArray(state.sent) ? state.sent : []).map(sanitizeMessage),
    drafts: (Array.isArray(state.drafts) ? state.drafts : []).map(sanitizeMessage),
    trash: (Array.isArray(state.trash) ? state.trash : []).map(sanitizeMessage),
    hiddenInboxUids: Array.isArray(state.hiddenInboxUids) ? state.hiddenInboxUids : [],
    lastSync: state.lastSync || "",
  };
}

function clearComposePage() {
  if (!confirm("确定清空邮件正文吗？收件人、主题、抄送/密送、邮件类型和签名选择会保留。")) return;
  focusEditor();
  document.execCommand("selectAll", false, null);
  document.execCommand("delete", false, null);
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(composeBody);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  composeStatus.textContent = "邮件已清空，可按 Ctrl+Z 撤销。";
  showToast("邮件已清空");
}

function renderCustomerContext() {
  const customer = currentCustomer || createAdHocCustomer(composeTo.value);
  if (assistantProduct && customer.product) assistantProduct.value = normalizeAssistantProduct(customer.product);
  if (!customerName || !customerSummary) return;
  const lastFollow = getLastFollowText(customer);
  const research = getLatestAiResearch(customer);
  const historyCount = getHistoryMessages({ ignoreSearch: true }).length;

  customerName.textContent = customer.company || "新客户";
  customerSummary.innerHTML = `
    ${renderContextItem("公司名称", customer.company)}
    ${renderContextItem("联系人", customer.contact || customer.contacts?.[0]?.name)}
    ${renderContextItem("国家", customer.country)}
    ${renderContextItem("客户等级", customer.priority)}
    ${renderContextItem("推荐产品", customer.product)}
    ${renderContextItem("最近跟进记录", lastFollow)}
    ${renderContextItem("最近AI调研结果", research)}
    ${renderContextItem("历史邮件", historyCount ? `发现 ${historyCount} 封历史邮件` : "暂无匹配历史邮件")}
  `;
}

function renderContextItem(label, value) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`;
}

function renderHistory() {
  mailState = loadMailState();
  const messages = getHistoryMessages();
  const total = getHistoryMessages({ ignoreSearch: true }).length;
  const email = getPrimaryRecipientEmail(composeTo.value);
  historySummary.textContent = email ? `当前匹配：${email}，共 ${total} 封本地历史邮件 / 草稿 / 跟进记录。` : "输入邮箱后自动匹配本地草稿、发件箱、收件箱和跟进记录。";

  if (!messages.length) {
    historyList.innerHTML = `<div class="empty-state">暂无匹配历史邮件</div>`;
    historyDetail.innerHTML = `<div class="empty-state">选择一封历史邮件查看详情</div>`;
    return;
  }

  if (!selectedHistoryId || !messages.some((message) => message.id === selectedHistoryId)) {
    selectedHistoryId = messages[0].id;
  }

  historyList.innerHTML = messages.map(renderHistoryItem).join("");
  historyList.querySelectorAll("[data-history-id]").forEach((item) => {
    item.addEventListener("click", () => {
      selectedHistoryId = item.dataset.historyId;
      renderHistory();
    });
  });

  renderHistoryDetail(messages.find((message) => message.id === selectedHistoryId));
}

function renderHistoryItem(message) {
  return `<article class="compose-history-item ${message.id === selectedHistoryId ? "active" : ""}" data-history-id="${escapeAttr(message.id)}">
    <div>
      <strong>${escapeHtml(message.subject || "(No subject)")}</strong>
      <span>${escapeHtml(formatDateTime(message.date))}</span>
    </div>
    <p>${escapeHtml(message.snippet || compactText(message.body).slice(0, 160) || "-")}</p>
    <dl>
      <div><dt>发件人</dt><dd>${escapeHtml(message.from || "-")}</dd></div>
      <div><dt>收件人</dt><dd>${escapeHtml(message.to || "-")}</dd></div>
      <div><dt>附件</dt><dd>${message.hasAttachments || message.attachments?.length ? "有" : "无"}</dd></div>
      <div><dt>状态</dt><dd>${escapeHtml(message.followStatus || getMailboxLabel(message.mailbox))}</dd></div>
      <div><dt>创建人</dt><dd>${escapeHtml(message.createdBy || "-")}</dd></div>
    </dl>
  </article>`;
}

function renderHistoryDetail(message) {
  if (!message) {
    historyDetail.innerHTML = `<div class="empty-state">选择一封历史邮件查看详情</div>`;
    return;
  }

  const attachments = Array.isArray(message.attachments) && message.attachments.length
    ? message.attachments.map((item) => escapeHtml(item.name || item.filename || String(item))).join(", ")
    : message.hasAttachments
      ? "有附件"
      : "无";

  historyDetail.innerHTML = `<div class="history-detail-head">
    <div>
      <p class="eyebrow">${escapeHtml(getMailboxLabel(message.mailbox))}</p>
      <h4>${escapeHtml(message.subject || "(No subject)")}</h4>
    </div>
    <div class="history-detail-actions">
      <button class="ghost-btn" type="button" data-history-action="copy">复制</button>
      <button class="ghost-btn" type="button" data-history-action="reply">回复草稿</button>
      <button class="ghost-btn" type="button" data-history-action="forward">转发草稿</button>
    </div>
  </div>
  <div class="history-detail-meta">
    ${renderContextItem("Date", formatDateTime(message.date))}
    ${renderContextItem("From", message.from)}
    ${renderContextItem("To", message.to)}
    ${renderContextItem("CC", message.cc)}
    ${renderContextItem("BCC", message.bcc)}
    ${renderContextItem("Attachments", attachments)}
  </div>
  ${renderHistoryAttachments(message.attachments || [])}
  ${renderHistoryTrackingLinks(message.trackingLinks || [])}
  <div class="history-detail-body">${message.bodyHtml || textToEditorHtml(message.body || message.snippet || "")}</div>`;

  historyDetail.querySelectorAll("[data-history-action]").forEach((button) => {
    button.addEventListener("click", () => handleHistoryAction(button.dataset.historyAction, message));
  });
}

function renderHistoryTrackingLinks(links) {
  if (!Array.isArray(links) || !links.length) return "";
  return `<div class="tracked-link-list">${links.map((link) => `<article class="tracked-link-card">
    <strong>${escapeHtml(link.fileName || "Tracked attachment")}</strong>
    <a href="${escapeAttr(link.previewUrl || "#")}" target="_blank" rel="noreferrer">${escapeHtml(link.previewUrl || "")}</a>
    <span>${escapeHtml(formatFileSize(link.size || 0))} · ${escapeHtml(link.type || "unknown")}</span>
  </article>`).join("")}</div>`;
}

function renderHistoryAttachments(files) {
  if (!Array.isArray(files) || !files.length) return "";
  return `<div class="history-attachment-list">${files.map((file) => {
    const name = file.name || file.filename || "attachment";
    const meta = `${formatFileSize(file.size || 0)} · ${file.type || "unknown"}`;
    return file.dataUrl
      ? `<a href="${escapeAttr(file.dataUrl)}" download="${escapeAttr(name)}">${escapeHtml(name)}<span>${escapeHtml(meta)}</span></a>`
      : `<span>${escapeHtml(name)}<small>${escapeHtml(meta)}</small></span>`;
  }).join("")}</div>`;
}

async function handleHistoryAction(action, message) {
  if (action === "copy") {
    await navigator.clipboard?.writeText(`${message.subject || ""}\n\n${message.body || message.snippet || ""}`);
    showToast("历史邮件内容已复制");
    return;
  }

  if (action === "reply") {
    const replyTo = getReplyTarget(message);
    composeTo.value = replyTo || composeTo.value;
    currentCustomer = findCustomerByEmail(composeTo.value) || currentCustomer;
    composeEmailType.value = "followup";
    composeSubject.value = prefixSubject(message.subject, "Re:");
    setEditorText(`Hi,\n\n\n\nBest regards,\nLina Mei\nDemo Export Company\n\n----- Original Message -----\n${message.body || message.snippet || ""}`);
    renderCustomerContext();
    renderHistory();
    showToast("已生成回复草稿，请编辑后保存");
    return;
  }

  if (action === "forward") {
    composeSubject.value = prefixSubject(message.subject, "Fwd:");
    setEditorText(`Hi,\n\nPlease see the forwarded email below.\n\nBest regards,\nLina Mei\n\n----- Forwarded Message -----\nFrom: ${message.from || ""}\nTo: ${message.to || ""}\nDate: ${formatDateTime(message.date)}\nSubject: ${message.subject || ""}\n\n${message.body || message.snippet || ""}`);
    showToast("已生成转发草稿，请填写收件人后保存");
    return;
  }

  return;
}

function safeAttachmentName(value) {
  return String(value || "email")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "") || "email";
}

function getHistoryMessages(options = {}) {
  const email = getPrimaryRecipientEmail(composeTo.value);
  const customer = currentCustomer?.id ? findCustomerById(currentCustomer.id) : findCustomerByEmail(email);
  const search = options.ignoreSearch ? "" : historySearch.value.trim().toLowerCase();
  const messages = [];

  ["inbox", "sent", "drafts"].forEach((mailbox) => {
    const rows = Array.isArray(mailState[mailbox]) ? mailState[mailbox] : [];
    rows.forEach((message) => {
      if (isMessageRelated(message, email, customer)) messages.push(normalizeMailMessage(message, mailbox));
    });
  });

  if (customer) {
    (customer.drafts || []).forEach((draft) => {
      messages.push(normalizeMailMessage({
        ...draft,
        id: draft.id || `customer-draft-${draft.subject}-${draft.date}`,
        mailbox: "drafts",
        from: getSenderEmail(),
        to: draft.to || customer.email || email,
        body: draft.body || "",
        snippet: compactText(draft.body || "").slice(0, 180),
        followStatus: draft.status || "草稿",
        createdBy: draft.createdBy || getCurrentUserName(),
        customerId: customer.id,
      }, "drafts"));
    });
    (customer.followUps || []).forEach((item, index) => {
      if (item.channel && !/email|邮件/i.test(item.channel)) return;
      messages.push(normalizeMailMessage({
        id: `follow-${customer.id}-${index}`,
        mailbox: "followups",
        from: getCurrentUserName(),
        to: customer.email || email,
        subject: item.summary ? `跟进记录：${item.summary.slice(0, 30)}` : "Email follow-up record",
        body: [`跟进内容：${item.summary || ""}`, `进展/下一步：${item.nextStep || ""}`, item.nextDate ? `下次联系：${item.nextDate}` : ""].filter(Boolean).join("\n"),
        snippet: item.summary || item.nextStep || "",
        date: item.date || customer.updatedAt || customer.createdAt || "",
        followStatus: item.nextDate ? `下次联系 ${item.nextDate}` : "跟进记录",
        createdBy: item.createdBy || customer.owner || "Lina",
        customerId: customer.id,
      }, "followups"));
    });
  }

  const unique = new Map();
  messages.forEach((message) => {
    const key = message.id || `${message.mailbox}-${message.subject}-${message.date}`;
    if (!unique.has(key)) unique.set(key, message);
  });

  return Array.from(unique.values())
    .filter((message) => !search || `${message.subject} ${message.body} ${message.snippet} ${message.from} ${message.to}`.toLowerCase().includes(search))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function normalizeMailMessage(message, mailbox) {
  return {
    id: message.id || message.uid || createId(),
    mailbox: message.mailbox || mailbox,
    from: message.from || (mailbox === "inbox" ? "" : getSenderEmail()),
    to: message.to || "",
    cc: message.cc || "",
    bcc: message.bcc || "",
    subject: message.subject || "(No subject)",
    body: message.body || message.text || message.html || message.snippet || "",
    bodyHtml: message.bodyHtml || message.html || "",
    snippet: message.snippet || compactText(message.body || message.text || "").slice(0, 180),
    date: message.date || message.createdAt || new Date().toISOString(),
    attachments: Array.isArray(message.attachments) ? message.attachments : [],
    hasAttachments: Boolean(message.hasAttachments || message.attachments?.length),
    trackingLinks: Array.isArray(message.trackingLinks) ? message.trackingLinks : [],
    followStatus: message.followStatus || message.status || getMailboxLabel(message.mailbox || mailbox),
    createdBy: message.createdBy || "",
    customerId: message.customerId || "",
    company: message.company || "",
    country: message.country || "",
    tracking: message.tracking || createTrackingState(message.to || ""),
  };
}

function isMessageRelated(message, email, customer) {
  if (customer?.id && message.customerId === customer.id) return true;
  if (!email) return false;
  return [message.from, message.to, message.cc, message.bcc]
    .filter(Boolean)
    .some((value) => extractEmails(value).includes(email));
}

async function summarizeHistory() {
  const messages = getHistoryMessages({ ignoreSearch: true });
  if (!messages.length) {
    showToast("没有可总结的历史邮件");
    return;
  }

  summarizeHistoryBtn.disabled = true;
  summarizeHistoryBtn.textContent = "总结中";

  try {
    const summary = shouldUseDeepSeek()
      ? await summarizeHistoryWithDeepSeek(messages)
      : buildLocalHistorySummary(messages);
    saveSummaryToCustomer(summary);
    renderCustomerContext();
    showToast("历史邮件总结已保存到客户备注");
  } catch {
    const summary = buildLocalHistorySummary(messages);
    saveSummaryToCustomer(summary);
    renderCustomerContext();
    showToast("DeepSeek不可用，已用本地规则总结并保存");
  } finally {
    summarizeHistoryBtn.disabled = false;
    summarizeHistoryBtn.textContent = "AI总结历史邮件";
  }
}

function shouldUseDeepSeek() {
  aiSettings = loadAiSettings();
  return aiSettings.provider !== "template" && aiSettings.apiKey && location.protocol !== "file:";
}

async function summarizeHistoryWithDeepSeek(messages) {
  const response = await fetch("/api/ai-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: aiSettings.apiKey,
      baseUrl: normalizeBaseUrl(aiSettings.baseUrl),
      model: aiSettings.model || DEEPSEEK_MODEL,
      customer: getCustomerPromptContext(),
      messages: messages.slice(0, 20).map((message) => ({
        date: message.date,
        from: message.from,
        to: message.to,
        subject: message.subject,
        body: (message.body || message.snippet || "").slice(0, 1800),
        status: message.followStatus,
      })),
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "SUMMARY_FAILED");
  return result.summary || buildLocalHistorySummary(messages);
}

function buildLocalHistorySummary(messages) {
  const text = messages.map((message) => `${message.subject}\n${message.body || message.snippet || ""}`).join("\n").toLowerCase();
  const concerns = [];
  if (/price|fob|cost|报价|价格/.test(text)) concerns.push("价格/FOB");
  if (/moq|起订/.test(text)) concerns.push("MOQ");
  if (/sample|样品/.test(text)) concerns.push("样品测试");
  if (/ce|gs|lfgb|cert|认证/.test(text)) concerns.push("认证文件");
  if (/delivery|lead time|交期/.test(text)) concerns.push("交期");
  if (/package|packaging|logo|包装/.test(text)) concerns.push("包装/Logo");
  const hasQuote = /quote|quotation|报价|fob/.test(text);
  const hasSample = /sample|样品/.test(text);
  const hasReply = messages.some((message) => message.mailbox === "inbox");
  return [
    `客户最关心：${concerns.length ? concerns.join("、") : "需要进一步确认，历史邮件中未出现明显高频关注点"}`,
    `客户反对点：${/too high|expensive|贵|高/.test(text) ? "可能关注价格偏高" : "暂无明确反对点"}`,
    `采购进度：${hasQuote ? "已进入报价/价格沟通" : hasReply ? "已有邮件互动，仍需推进需求确认" : "主要为我方草稿或跟进记录"}`,
    `是否测试过样品：${hasSample ? "邮件中出现样品相关内容，需要确认测试反馈" : "未发现样品测试记录"}`,
    `是否收到报价：${hasQuote ? "邮件中出现报价/FOB相关内容" : "未发现明确报价记录"}`,
    `下次跟进建议：围绕${concerns[0] || "推荐产品和采购需求"}发一封短邮件，提供2-3款适合型号、MOQ、FOB区间和认证文件。`,
  ].join("\n");
}

function saveSummaryToCustomer(summary) {
  const customer = currentCustomer?.id ? findCustomerById(currentCustomer.id) : findCustomerByEmail(getPrimaryRecipientEmail(composeTo.value));
  if (!customer) return;
  const date = toDateOnly(new Date().toISOString());
  const block = `【AI邮件历史总结-${date}】\n${summary}`;
  customer.notes = [customer.notes || "", block].filter(Boolean).join("\n\n");
  customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
  customer.timeline.unshift({
    id: createId(),
    date,
    type: "AI总结历史邮件",
    content: summary.split(/\r?\n/)[0] || "已总结历史邮件。",
  });
  customer.updatedAt = date;
  saveCustomers();
  currentCustomer = customer;
}

function findCustomerById(id) {
  if (!id) return null;
  return customers.find((customer) => customer.id === id) || null;
}

function findCustomerByEmail(email) {
  const targets = extractEmails(email);
  const fallback = String(email || "").trim().toLowerCase();
  if (!targets.length && fallback) targets.push(fallback);
  if (!targets.length) return null;
  return customers.find((customer) => {
    const emails = [customer.email, ...(customer.contacts || []).map((contact) => contact.email)].filter(Boolean);
    return emails.some((value) => targets.includes(String(value).trim().toLowerCase()));
  }) || null;
}

function createAdHocCustomer(email) {
  const cleanEmail = String(email || "").trim();
  return {
    id: "",
    company: getCompanyFromEmail(cleanEmail),
    contact: "",
    country: "",
    priority: "",
    product: PRODUCT_FALLBACK,
    email: cleanEmail,
    contacts: [],
    followUps: [],
    drafts: [],
    timeline: [],
    notes: "",
  };
}

function getCustomerPromptContext() {
  const primaryEmail = getPrimaryRecipientEmail(composeTo.value);
  const customer = currentCustomer || createAdHocCustomer(primaryEmail);
  return {
    company: customer.company || "",
    contact: customer.contact || customer.contacts?.[0]?.name || "",
    title: customer.title || customer.contacts?.[0]?.title || "",
    country: customer.country || "",
    priority: customer.priority || "",
    segment: customer.segment || customer.industry || customer.customerType || "",
    product: getAssistantProduct(),
    notes: customer.notes || "",
    website: customer.website || customer.url || "",
    linkedin: customer.linkedin || "",
    instagram: customer.instagram || "",
    facebook: customer.facebook || "",
    youtube: customer.youtube || "",
    email: primaryEmail || customer.email || "",
    lastFollow: getLastFollowText(customer),
    latestResearch: getLatestAiResearch(customer),
  };
}

function getLastFollowText(customer) {
  const record = (customer?.followUps || []).find((item) => item.summary || item.nextStep);
  if (!record) return "";
  return [record.date, record.channel, record.summary, record.nextStep].filter(Boolean).join(" / ");
}

function getLatestAiResearch(customer) {
  const notes = String(customer?.notes || "");
  const matches = [...notes.matchAll(/【AI自动调研-[^】]+】([\s\S]*?)(?=\n【|$)/g)];
  if (matches.length) return matches[matches.length - 1][0].trim().slice(0, 900);
  const mailMatches = [...notes.matchAll(/【AI邮件历史总结-[^】]+】([\s\S]*?)(?=\n【|$)/g)];
  if (mailMatches.length) return mailMatches[mailMatches.length - 1][0].trim().slice(0, 900);
  return "";
}

function getCustomerAngle(customer, research) {
  const text = `${customer.company || ""} ${customer.industry || ""} ${customer.customerType || ""} ${customer.segment || ""} ${research || ""}`;
  if (/complaint|review|negative|refund|poor|broken|delay|warranty|after.?sales|spare parts|消费者|投诉|差评|售后|维修|配件/i.test(text)) return "The strongest entry point is to offer a coffee machine program that reduces after-sales risk through stable components, spare-parts planning and clear quality documents.";
  if (/profit|margin|growth|premium|upgrade|higher.?end|利润|增长|高端|升级|差异化/i.test(text)) return "The strongest entry point is a more differentiated mid-to-premium coffee machine line that can improve category value instead of competing only on low price.";
  if (/post|comment|社媒|帖子|留言|campaign|launch|new product/i.test(text)) return "Their market communication suggests a need for product stories that are easy to explain online, so a private-label coffee machine with clear selling points may fit better than a standard catalogue item.";
  if (/品牌|brand/i.test(text)) return "Because you work with branded appliance lines, a factory-direct OEM option may help you add a differentiated coffee machine model without adding supplier complexity.";
  if (/进口|import/i.test(text)) return "For import teams, the practical value is stable production, clear export documents, packaging support and predictable lead time.";
  if (/零售|retail|连锁/i.test(text)) return "For retail channels, model differentiation, packaging consistency and after-sales parts planning are usually important before listing a new appliance.";
  if (/电商|amazon|ecommerce/i.test(text)) return "For e-commerce channels, compact selling points, packaging, review stability and replacement parts support usually matter as much as FOB cost.";
  return "Your business profile suggests that supplier reliability, product fit and clear OEM options would be more useful than a generic catalogue.";
}

function getEmailTypeInstruction() {
  const map = {
    first: "Write a first outreach email.",
    followup: "Write a follow-up email based on recent CRM notes and email history.",
    quote: "Write a quotation follow-up email.",
    sample: "Write a sample evaluation follow-up email.",
    dormant: "Write a dormant customer reactivation email.",
  };
  return map[getEffectiveEmailType()] || map.first;
}

function buildAssistantPrompt() {
  const toneMap = {
    brief: "Keep it short, direct, and easy to reply to.",
    formal: "Use a professional and formal business tone.",
    "old-customer": "Write as an old customer follow-up. Be respectful and refer to prior cooperation without sounding pushy.",
    "fair-followup": "Write as a trade fair follow-up. Mention continuing the discussion after the fair.",
    price: "Focus on price, MOQ, FOB reference, configuration and value without sounding cheap.",
  };
  return [
    getEmailTypeInstruction(),
    `Recommended product: ${getAssistantProduct()}.`,
    `Tone: ${toneMap[assistantTone?.value || "brief"] || toneMap.brief}`,
    "Write a targeted English-only email for Aison coffee machine OEM/ODM business. Do not include any Chinese words in the subject or email body.",
    "Before writing, use the pasted company website, social media, executive posts, comments, reviews, and CRM notes to identify: product pain points, profit-growth angles, consumer complaints, missing product lines, after-sales risks, or procurement concerns.",
    "The email must use one concrete insight from that research in the opening or value proposition. Avoid machine-like wording, generic partnership language, and empty phrases like 'I noticed your background' unless followed by a specific business reason.",
    aiInput.value.trim() ? `Customer research / user's idea:\n${aiInput.value.trim()}` : "",
    getAssistantAttachmentResearchText(),
  ].filter(Boolean).join("\n\n");
}

function getEmailTypeLabel(value) {
  const map = {
    first: "首次开发信",
    followup: "跟进邮件",
    quote: "报价后跟进",
    sample: "样品跟进",
    dormant: "沉睡客户唤醒",
  };
  return map[value] || "邮件";
}

function normalizeEmailType(value) {
  return ["first", "followup", "quote", "sample", "dormant"].includes(value) ? value : "first";
}

function updateResearchPreview() {
  const text = aiInput.value.trim();
  if (!text && !assistantResearchFiles.length) {
    aiPasteSummary.textContent = "客户资料 / 想法";
    aiPreview.textContent = "可粘贴 LinkedIn/官网/社媒内容，DeepSeek 或模板会结合客户信息生成草稿。";
    return;
  }
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const fileSummary = assistantResearchFiles.length ? `，${assistantResearchFiles.length} 个AI资料附件` : "";
  aiPasteSummary.textContent = lines.length > 8 || text.length > 300 || assistantResearchFiles.length
    ? `已隐藏大部分内容：${text.length} 字，${lines.length} 行${fileSummary}`
    : `${text.length} 字，${lines.length} 行`;
  const previewText = [
    lines.slice(0, 4).join("\n").slice(0, 220),
    assistantResearchFiles.length ? `AI资料附件：${assistantResearchFiles.map((file) => file.name).join(" / ")}` : "",
  ].filter(Boolean).join("\n");
  aiPreview.textContent = previewText + (text.length > 220 ? "\n..." : "");
}

function toggleResearchBox() {
  const expanded = aiInput.classList.toggle("expanded");
  toggleContextBtn.textContent = expanded ? "收起" : "展开";
  aiInput.style.display = expanded ? "block" : "none";
}

async function addAssistantResearchFiles(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const oversized = files.find((file) => Number(file.size || 0) > MAX_ASSISTANT_RESEARCH_FILE_BYTES);
  if (oversized) {
    showToast(`AI资料附件 ${oversized.name || "未命名文件"} 超过 ${formatFileSize(MAX_ASSISTANT_RESEARCH_FILE_BYTES)}，请压缩或改用CRM资料备注。`);
    event.target.value = "";
    return;
  }
  assistantAttachBtn.disabled = true;
  assistantAttachBtn.textContent = "读取中...";
  try {
    const rows = [];
    for (const file of files) {
      rows.push(await buildAssistantResearchFile(file));
    }
    assistantResearchFiles.push(...rows);
    renderAssistantResearchFiles();
    updateResearchPreview();
    showToast(`已加入 ${rows.length} 个AI分析附件`);
  } finally {
    assistantAttachBtn.disabled = false;
    assistantAttachBtn.textContent = "+ 附件";
    event.target.value = "";
  }
}

async function buildAssistantResearchFile(file) {
  const extracted = await extractAssistantFileText(file);
  return {
    id: createId(),
    name: file.name,
    size: file.size,
    type: file.type || getFileExtension(file.name) || "unknown",
    addedAt: new Date().toISOString(),
    extractedText: extracted.text.slice(0, 6000),
    extractionStatus: extracted.status,
  };
}

function renderAssistantResearchFiles() {
  if (!assistantAttachmentList) return;
  assistantAttachmentList.innerHTML = assistantResearchFiles.map((file) => `
    <article>
      <div>
        <strong>${escapeHtml(file.name)}</strong>
        <span>${escapeHtml(formatFileSize(file.size))} · ${escapeHtml(file.type || "unknown")}</span>
        <small>${escapeHtml(getAssistantFileReadStatus(file))}</small>
        ${file.extractedText ? `<small class="assistant-file-snippet">${escapeHtml(getAssistantFileSnippet(file))}</small>` : ""}
      </div>
      <button class="ghost-btn danger" type="button" data-assistant-file-delete="${escapeAttr(file.id)}">删除</button>
    </article>
  `).join("");
  assistantAttachmentList.querySelectorAll("[data-assistant-file-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      assistantResearchFiles = assistantResearchFiles.filter((file) => file.id !== button.dataset.assistantFileDelete);
      renderAssistantResearchFiles();
      updateResearchPreview();
    });
  });
}

function getAssistantFileReadStatus(file) {
  const chars = String(file.extractedText || "").length;
  return chars
    ? `${file.extractionStatus}，已提取 ${chars} 字用于AI分析`
    : file.extractionStatus;
}

function getAssistantFileSnippet(file) {
  return String(file.extractedText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" / ")
    .slice(0, 180);
}

function getAssistantAttachmentResearchText() {
  if (!assistantResearchFiles.length) return "";
  let remaining = 14000;
  const blocks = [];
  for (const file of assistantResearchFiles) {
    const header = [
      `File: ${file.name}`,
      `Type: ${file.type || "unknown"}`,
      `Size: ${formatFileSize(file.size)}`,
      `Read status: ${file.extractionStatus}`,
    ].join("\n");
    const body = file.extractedText
      ? `Extracted text:\n${file.extractedText}`
      : "Only file metadata was available locally. Do not invent the file content; use the file name/type as cautious context.";
    const block = `${header}\n${body}`.slice(0, remaining);
    blocks.push(block);
    remaining -= block.length;
    if (remaining <= 0) break;
  }
  return `AI research attachments uploaded by user. Use them to identify customer/product pain points, profit-growth angles, complaints, procurement concerns, and practical entry points. Do not treat these as email attachments unless the user separately adds them to the email attachment list.\n\n${blocks.join("\n\n---\n\n")}`;
}

async function extractAssistantFileText(file) {
  const ext = getFileExtension(file.name);
  try {
    if (file.type.startsWith("video/")) return { text: "", status: "视频文件：已读取文件信息，当前本地版本不解析视频内容" };
    if (file.type.startsWith("image/")) return { text: "", status: "图片文件：已读取文件信息，当前本地版本不做图片OCR" };
    if (isPlainReadableFile(file, ext)) return { text: cleanupExtractedText(await file.text()), status: "已读取文本内容" };
    if (["docx", "docm", "xlsx", "xlsm", "pptx", "pptm"].includes(ext)) {
      const text = await extractOfficeZipText(file, ext);
      return text ? { text: cleanupExtractedText(text), status: "已读取Office文本内容" } : { text: "", status: "Office文件：未能提取文本，仅使用文件信息" };
    }
    if (ext === "pdf" || file.type === "application/pdf") {
      const text = await extractPdfTextLite(file) || await extractBinaryStrings(file);
      return text ? { text: cleanupExtractedText(text), status: "已尝试读取PDF文本内容" } : { text: "", status: "PDF文件：未能提取文本，仅使用文件信息" };
    }
    if (["doc", "xls", "xlsb", "ppt"].includes(ext)) {
      const text = await extractBinaryStrings(file);
      return text ? { text: cleanupExtractedText(text), status: "已尝试读取旧版Office文本片段" } : { text: "", status: "旧版Office文件：未能提取文本，仅使用文件信息" };
    }
    return { text: "", status: "已读取文件信息，当前本地版本不解析该格式内容" };
  } catch {
    return { text: "", status: "读取失败，仅使用文件信息" };
  }
}

function isPlainReadableFile(file, ext) {
  return file.type.startsWith("text/") || ["txt", "csv", "md", "html", "htm", "json", "xml", "rtf", "log"].includes(ext);
}

async function extractOfficeZipText(file, ext) {
  const buffer = await file.arrayBuffer();
  const entries = parseZipEntries(buffer).filter((entry) => shouldReadOfficeXml(entry.name, ext));
  const chunks = [];
  for (const entry of entries.slice(0, 80)) {
    const content = await readZipEntryText(buffer, entry);
    if (content) chunks.push(xmlToReadableText(content));
  }
  return chunks.join("\n").slice(0, 20000);
}

function shouldReadOfficeXml(name, ext) {
  if (!/\.xml$/i.test(name)) return false;
  if (["docx", "docm"].includes(ext)) return /^word\/(document|header|footer|footnotes|endnotes)/i.test(name);
  if (["xlsx", "xlsm"].includes(ext)) return /^xl\/(sharedStrings|worksheets\/sheet|comments|drawings)/i.test(name);
  if (["pptx", "pptm"].includes(ext)) return /^ppt\/(slides\/slide|notesSlides|comments|slideMasters)/i.test(name);
  return false;
}

function parseZipEntries(buffer) {
  const view = new DataView(buffer);
  const eocd = findZipEnd(view);
  if (eocd < 0) return [];
  const total = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries = [];
  for (let i = 0; i < total && offset + 46 < buffer.byteLength; i += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(buffer, offset + 46, fileNameLength));
    entries.push({ name, method, compressedSize, localOffset });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  return entries;
}

function findZipEnd(view) {
  const start = Math.max(0, view.byteLength - 66000);
  for (let offset = view.byteLength - 22; offset >= start; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  return -1;
}

async function readZipEntryText(buffer, entry) {
  const view = new DataView(buffer);
  const offset = entry.localOffset;
  if (view.getUint32(offset, true) !== 0x04034b50) return "";
  const fileNameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const dataStart = offset + 30 + fileNameLength + extraLength;
  const compressed = buffer.slice(dataStart, dataStart + entry.compressedSize);
  let content = null;
  if (entry.method === 0) content = compressed;
  if (entry.method === 8) content = await inflateDeflateRaw(compressed);
  if (!content) return "";
  return new TextDecoder("utf-8").decode(content);
}

async function inflateDeflateRaw(buffer) {
  if (!("DecompressionStream" in window)) return null;
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return await new Response(stream).arrayBuffer();
}

async function extractPdfTextLite(file) {
  const text = await readFileAsLatin1(file);
  const matches = [];
  text.replace(/\(([^()]{3,})\)\s*Tj/g, (_, value) => {
    matches.push(value);
    return "";
  });
  text.replace(/\[((?:.|\n){3,}?)\]\s*TJ/g, (_, value) => {
    matches.push(value.replace(/\(([^()]*)\)/g, " $1 "));
    return "";
  });
  return matches.join("\n").slice(0, 12000);
}

async function extractBinaryStrings(file) {
  const buffer = await file.arrayBuffer();
  const latinText = new TextDecoder("latin1").decode(buffer);
  const utf16Text = extractUtf16LeReadableStrings(buffer);
  const asciiText = (latinText.match(/[A-Za-z0-9][A-Za-z0-9\s.,;:()/%&+\-@#]{5,}/g) || []).join("\n");
  return dedupeReadableLines(`${asciiText}\n${utf16Text}`).slice(0, 16000);
}

async function readFileAsLatin1(file) {
  const buffer = await file.arrayBuffer();
  return new TextDecoder("latin1").decode(buffer);
}

function extractUtf16LeReadableStrings(buffer) {
  const view = new Uint8Array(buffer);
  const chunks = [];
  for (const start of [0, 1]) {
    let current = "";
    for (let i = start; i + 1 < view.length; i += 2) {
      const code = view[i] | (view[i + 1] << 8);
      const char = code ? String.fromCharCode(code) : "\n";
      if (isReadableBinaryChar(char)) {
        current += char;
        continue;
      }
      if (current.trim().length >= 4) chunks.push(current.trim());
      current = "";
    }
    if (current.trim().length >= 4) chunks.push(current.trim());
  }
  return chunks.join("\n");
}

function isReadableBinaryChar(char) {
  return /[\w\s.,;:()/%&+\-@#\u3400-\u9fff]/.test(char);
}

function dedupeReadableLines(value) {
  const seen = new Set();
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => {
      if (line.length < 4) return false;
      if (/^[^A-Za-z0-9\u3400-\u9fff]+$/.test(line)) return false;
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 300)
    .join("\n");
}

function xmlToReadableText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanupExtractedText(value) {
  return String(value || "")
    .replace(/\u0000/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 20000);
}

function getFileExtension(name) {
  return String(name || "").split(".").pop().toLowerCase();
}

function focusEditor() {
  composeBody.focus();
}

function execEditorCommand(command, value = null, message = "") {
  focusEditor();
  document.execCommand(command, false, value);
  if (message) showToast(message);
}

function applyFontColor(color) {
  execEditorCommand("foreColor", color, "字体颜色已应用");
}

async function copyEditorSelectionOrBody() {
  const selection = window.getSelection();
  const selectedText = selection && !selection.isCollapsed ? selection.toString() : "";
  if (selectedText) {
    await navigator.clipboard?.writeText(selectedText);
  } else {
    await copyForExternalMail();
    return;
  }
  showToast("已复制");
}

async function pasteFromClipboard(plainOnly = false) {
  focusEditor();
  try {
    if (!plainOnly && navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("text/html")) {
          const html = await (await item.getType("text/html")).text();
          document.execCommand("insertHTML", false, html);
          showToast("已粘贴");
          return;
        }
      }
    }
    const text = await navigator.clipboard?.readText();
    if (!text) {
      showToast("剪贴板为空或浏览器未授权");
      return;
    }
    document.execCommand("insertHTML", false, plainOnly ? textToEditorHtml(text) : textToEditorHtml(text));
    showToast(plainOnly ? "已粘贴为纯文本" : "已粘贴");
  } catch {
    showToast("浏览器未授权读取剪贴板，请用 Ctrl+V 粘贴");
  }
}

function cutEditorSelection() {
  focusEditor();
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    showToast("请先选中文字");
    return;
  }
  document.execCommand("cut", false, null);
  showToast("已剪切");
}

function selectEditorAll() {
  focusEditor();
  document.execCommand("selectAll", false, null);
  showToast("已全选正文");
}

function clearEditorFormat() {
  focusEditor();
  document.execCommand("removeFormat", false, null);
  document.execCommand("unlink", false, null);
  showToast("已清除格式");
}

function insertLink() {
  const url = prompt("请输入链接URL", "https://");
  if (!url) return;
  const text = window.getSelection()?.toString() || prompt("请输入链接文本", url) || url;
  focusEditor();
  document.execCommand("insertHTML", false, `<a href="${escapeAttr(url)}" target="_blank" rel="noreferrer">${escapeHtml(text)}</a>`);
  showToast("超链接已插入");
}

function insertImageUrl() {
  const url = prompt("请输入图片URL", "https://");
  if (!url) return;
  focusEditor();
  document.execCommand("insertHTML", false, `<img src="${escapeAttr(url)}" alt="Inserted image" style="max-width: 480px; width: 100%; height: auto;" />`);
  showToast("图片已插入正文");
}

function insertTable() {
  focusEditor();
  document.execCommand("insertHTML", false, `<table style="border-collapse: collapse; width: 100%; margin: 12px 0;">
    <tbody>
      <tr><td style="border: 1px solid #cfd8d3; padding: 8px;">Item</td><td style="border: 1px solid #cfd8d3; padding: 8px;">Details</td></tr>
      <tr><td style="border: 1px solid #cfd8d3; padding: 8px;">MOQ</td><td style="border: 1px solid #cfd8d3; padding: 8px;"></td></tr>
      <tr><td style="border: 1px solid #cfd8d3; padding: 8px;">FOB</td><td style="border: 1px solid #cfd8d3; padding: 8px;"></td></tr>
    </tbody>
  </table>`);
  showToast("表格已插入正文");
}

function insertLocalImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    focusEditor();
    document.execCommand("insertHTML", false, `<img src="${reader.result}" alt="${escapeAttr(file.name)}" style="max-width: 480px; width: 100%; height: auto;" />`);
    showToast("图片已插入正文");
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function handleEditorPaste(event) {
  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type?.startsWith("image/"));
  if (!imageItem) return;
  const file = imageItem.getAsFile();
  if (!file) return;
  event.preventDefault();
  const reader = new FileReader();
  reader.onload = () => {
    focusEditor();
    document.execCommand("insertHTML", false, `<img src="${reader.result}" alt="Pasted image" style="max-width: 480px; width: 100%; height: auto;" />`);
    showToast("粘贴图片已插入正文");
  };
  reader.readAsDataURL(file);
}

function loadModuleAttachmentIndex() {
  try {
    const rows = JSON.parse(localStorage.getItem(MODULE_ATTACHMENT_INDEX_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function getCallableCrmMaterials() {
  return moduleAttachments
    .filter((item) => ["products", "quotes"].includes(item.moduleId))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function openCrmMaterialDialog(mode = "email") {
  crmMaterialDialogMode = mode === "assistant" ? "assistant" : "email";
  moduleAttachments = loadModuleAttachmentIndex();
  if (crmMaterialSearch) crmMaterialSearch.value = "";
  renderCrmMaterialList();
  crmMaterialDialog?.showModal();
}

function renderCrmMaterialList() {
  if (!crmMaterialList) return;
  const keyword = String(crmMaterialSearch?.value || "").trim().toLowerCase();
  const rows = getCallableCrmMaterials().filter((file) => {
    const haystack = [
      file.name,
      file.type,
      file.tags,
      file.note,
      file.moduleId === "quotes" ? "quotation quote 报价" : "product company 公司 产品",
    ].join(" ").toLowerCase();
    return !keyword || haystack.includes(keyword);
  });
  crmMaterialList.innerHTML = rows.length ? rows.map((file) => `
    <article class="crm-material-card">
      <div>
        <strong title="${escapeAttr(file.name || "")}">${escapeHtml(file.name || "附件")}</strong>
        <span>${escapeHtml(file.moduleId === "quotes" ? "报价单资料" : "公司和产品资料")} · ${escapeHtml(formatFileSize(file.size))} · ${escapeHtml(file.type || "unknown")}</span>
        <small>${escapeHtml(file.storage === "metadata-only" ? "仅保存元数据：大文件请在 Foxmail/Gmail 手动添加原文件" : "小文件：可加入邮件附件")}</small>
      </div>
      <div class="crm-material-actions">
        <button class="ghost-btn" type="button" data-crm-material-action="research" data-crm-material-id="${escapeAttr(file.id)}">${crmMaterialDialogMode === "assistant" ? "加入AI分析" : "给AI分析"}</button>
        <button class="ghost-btn" type="button" data-crm-material-action="insert" data-crm-material-id="${escapeAttr(file.id)}">插入说明</button>
        <button class="primary-btn" type="button" data-crm-material-action="attach" data-crm-material-id="${escapeAttr(file.id)}">加入附件</button>
      </div>
    </article>`).join("") : `<div class="empty-state compact">暂无可调用资料。请先在“公司和产品”上传资料。</div>`;
  crmMaterialList.querySelectorAll("[data-crm-material-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const file = moduleAttachments.find((item) => item.id === button.dataset.crmMaterialId);
      if (!file) return;
      if (button.dataset.crmMaterialAction === "insert") {
        insertCrmMaterialInfo(file);
      } else if (button.dataset.crmMaterialAction === "attach") {
        await attachCrmMaterial(file);
      } else if (button.dataset.crmMaterialAction === "research") {
        await addCrmMaterialToAssistant(file);
      }
    });
  });
}

async function addCrmMaterialToAssistant(file) {
  let row = null;
  const dataUrl = file.storage === "metadata-only" ? "" : await getModuleAttachmentData(file.id);
  const blob = dataUrl ? dataUrlToBlob(dataUrl) : null;

  if (blob && Number(file.size || blob.size || 0) <= MAX_ASSISTANT_RESEARCH_FILE_BYTES && typeof File !== "undefined") {
    const sourceFile = new File([blob], file.name || "CRM-Material", {
      type: file.type || blob.type || "application/octet-stream",
    });
    row = await buildAssistantResearchFile(sourceFile);
    row.fromCrmMaterial = true;
    row.sourceAttachmentId = file.id;
    row.extractionStatus = `CRM资料：${row.extractionStatus}`;
  }

  if (!row) {
    row = {
      id: createId(),
      fromCrmMaterial: true,
      sourceAttachmentId: file.id,
      name: file.name || "CRM-Material",
      size: Number(file.size || 0),
      type: file.type || "application/octet-stream",
      addedAt: new Date().toISOString(),
      extractedText: buildCrmMaterialResearchText(file),
      extractionStatus: file.storage === "metadata-only"
        ? "CRM资料仅保存元数据，已把文件名、标签和备注加入AI分析"
        : "CRM资料未能读取正文，已把文件名、标签和备注加入AI分析",
    };
  }

  assistantResearchFiles.push(row);
  renderAssistantResearchFiles();
  updateResearchPreview();
  showToast("CRM资料已加入DeepSeek分析资料");
}

function buildCrmMaterialResearchText(file) {
  return [
    "CRM material selected for AI email research.",
    `Module: ${file.moduleId === "quotes" ? "Quotation" : "Company and Products"}`,
    `File name: ${file.name || "Attachment"}`,
    `Type: ${file.type || "unknown"}`,
    `Size: ${formatFileSize(file.size)}`,
    `Storage: ${file.storage === "metadata-only" ? "metadata-only" : "local IndexedDB file"}`,
    file.tags ? `Tags: ${file.tags}` : "",
    file.note ? `Note: ${file.note}` : "",
    file.uploadedBy ? `Uploaded by: ${file.uploadedBy}` : "",
    file.uploadedAt ? `Uploaded at: ${file.uploadedAt}` : "",
    "Use this as cautious business context. If file text is unavailable, do not invent exact file content; use the file name, type, tags and notes only.",
  ].filter(Boolean).join("\n");
}

async function attachCrmMaterial(file) {
  const dataUrl = file.storage === "metadata-only" ? "" : await getModuleAttachmentData(file.id);
  if (!dataUrl) {
    insertCrmMaterialInfo(file);
    showToast("该资料只有本地元数据，已插入文件说明。真实发送时请在 Foxmail/Gmail 手动添加原文件。");
    return;
  }
  attachments.push({
    id: createId(),
    sourceAttachmentId: file.id,
    fromCrmMaterial: true,
    name: file.name || "CRM-Material",
    size: file.size || 0,
    type: file.type || "application/octet-stream",
    addedAt: new Date().toISOString(),
    dataUrl,
  });
  renderAttachments();
  const limitMessage = getAttachmentApiLimitMessage();
  if (limitMessage) composeStatus.textContent = limitMessage;
  showToast("CRM资料已加入邮件附件");
}

function insertCrmMaterialInfo(file) {
  const lines = [
    "Attached/Reference material:",
    `- File: ${file.name || "Attachment"}`,
    `- Type: ${file.type || "unknown"}`,
    `- Size: ${formatFileSize(file.size)}`,
    file.tags ? `- Tags: ${file.tags}` : "",
    file.note ? `- Note: ${file.note}` : "",
  ].filter(Boolean).join("\n");
  focusEditor();
  document.execCommand("insertHTML", false, `<p>${textToEditorHtml(lines)}</p>`);
  showToast("资料说明已插入正文");
}

function openModuleAttachmentDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return resolve(null);
    const request = indexedDB.open(MODULE_ATTACHMENT_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MODULE_ATTACHMENT_STORE)) db.createObjectStore(MODULE_ATTACHMENT_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getModuleAttachmentData(id) {
  try {
    const db = await openModuleAttachmentDb();
    if (!db) return "";
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(MODULE_ATTACHMENT_STORE, "readonly");
      const request = tx.objectStore(MODULE_ATTACHMENT_STORE).get(id);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) return resolve("");
        if (typeof result === "string") return resolve(result);
        if (typeof result.dataUrl === "string") return resolve(result.dataUrl);
        resolve("");
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return "";
  }
}

async function addAttachments(event) {
  const files = Array.from(event.target.files || []);
  const rows = await Promise.all(files.map(async (file) => ({
    id: createId(),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    addedAt: new Date().toISOString(),
    dataUrl: await readFileAsDataUrl(file),
  })));
  attachments.push(...rows);
  renderAttachments();
  const limitMessage = getAttachmentApiLimitMessage();
  if (limitMessage) {
    composeStatus.textContent = limitMessage;
    showToast(shouldForceTrackedAttachmentLinks() ? "附件将自动改为云端链接发送" : "附件超过线上CRM可处理范围");
  } else if (rows.length) {
    showToast(`已添加 ${rows.length} 个附件`);
  }
  event.target.value = "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function renderAttachments() {
  if (!attachmentList) return;
  attachmentList.innerHTML = attachments.map((file) => `<article class="attachment-openable" data-attachment-open-card="${escapeAttr(file.id)}" tabindex="0" title="双击打开附件">
    <div class="attachment-summary">
      <strong>${escapeHtml(file.name)}</strong>
      <span>${escapeHtml(formatFileSize(file.size))} · ${escapeHtml(file.type || "unknown")} · 双击打开</span>
    </div>
    <div class="attachment-actions">
      <button class="ghost-btn" type="button" data-attachment-open="${escapeAttr(file.id)}">打开</button>
      ${file.dataUrl ? `<a class="ghost-btn" href="${escapeAttr(file.dataUrl)}" download="${escapeAttr(file.name)}">下载</a>` : ""}
      <button class="ghost-btn danger" type="button" data-attachment-id="${escapeAttr(file.id)}">删除</button>
    </div>
  </article>`).join("");
  attachmentList.querySelectorAll("[data-attachment-open]").forEach((button) => {
    button.addEventListener("click", () => openAttachmentFile(getAttachmentById(button.dataset.attachmentOpen)));
  });
  attachmentList.querySelectorAll("[data-attachment-open-card]").forEach((card) => {
    card.addEventListener("dblclick", (event) => {
      if (event.target.closest("button, a")) return;
      openAttachmentFile(getAttachmentById(card.dataset.attachmentOpenCard));
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      openAttachmentFile(getAttachmentById(card.dataset.attachmentOpenCard));
    });
  });
  attachmentList.querySelectorAll("[data-attachment-id]").forEach((button) => {
    button.addEventListener("click", () => {
      attachments = attachments.filter((item) => item.id !== button.dataset.attachmentId);
      renderAttachments();
    });
  });
}

function getAttachmentById(id) {
  return attachments.find((item) => String(item.id) === String(id));
}

async function createTrackedAttachmentLinks(to, subject) {
  if (!attachments.length) return [];
  const uploadClient = await loadBlobUploadClient();
  const rows = [];
  for (const file of attachments) {
    if (!file.dataUrl) {
      throw new Error(`附件 ${file.name || "attachment"} 只有本地元数据，无法生成云端追踪链接。请重新上传原文件。`);
    }
    const blob = dataUrlToBlob(file.dataUrl);
    if (!blob) throw new Error(`附件 ${file.name || "attachment"} 无法读取内容。`);
    const trackingId = createId();
    const fileName = file.name || file.filename || "attachment";
    const uploadFile = new File([blob], fileName, { type: file.type || blob.type || "application/octet-stream" });
    const payload = {
      trackingId,
      fileName,
      size: file.size || blob.size || 0,
      contentType: file.type || blob.type || "application/octet-stream",
      recipientEmail: to,
      senderEmail: getSenderEmail(),
      subject,
      customerName: currentCustomer?.company || "",
      createdBy: getCurrentUserName(),
    };
    const blobResult = await uploadClient.upload(`foryal-crm-tracked/${trackingId}/${safeAttachmentName(fileName)}`, uploadFile, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      clientPayload: JSON.stringify(payload),
    });
    const response = await fetch("/api/tracking/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId,
        blob: blobResult,
        file: {
          name: fileName,
          size: file.size || blob.size || 0,
          type: file.type || blob.type || "application/octet-stream",
        },
        email: {
          to,
          from: getSenderEmail(),
          subject,
          customerName: currentCustomer?.company || "",
          createdBy: getCurrentUserName(),
        },
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || result.error || "云端追踪链接生成失败");
    rows.push({
      id: result.file.id,
      fileName: result.file.fileName,
      size: result.file.size,
      type: result.file.type,
      previewUrl: new URL(result.file.previewUrl, window.location.origin).toString(),
      downloadUrl: new URL(result.file.downloadUrl, window.location.origin).toString(),
      createdAt: result.file.createdAt || new Date().toISOString(),
      stats: null,
    });
    composeStatus.textContent = `已生成 ${rows.length}/${attachments.length} 个云端追踪链接...`;
  }
  return rows;
}

async function loadBlobUploadClient() {
  try {
    return await import("https://esm.sh/@vercel/blob@2.4.0/client");
  } catch {
    throw new Error("无法加载 Vercel Blob 上传组件。请检查网络，或改用普通附件发送。");
  }
}

function buildTrackedAttachmentBlocks(links = []) {
  if (!links.length) return { text: "", html: "" };
  const text = [
    "Online attachment links:",
    ...links.map((link) => `- ${link.fileName}: ${link.previewUrl}`),
  ].join("\n");
  const html = `<div style="margin-top:16px;padding:12px;border:1px solid #d8e1dc;border-radius:8px;background:#fbfcfa">
    <p><strong>Online attachment links</strong></p>
    <ul>${links.map((link) => `<li><a href="${escapeAttr(link.previewUrl)}">${escapeHtml(link.fileName)}</a></li>`).join("")}</ul>
  </div>`;
  return { text, html };
}

function getAttachmentExtension(file = {}) {
  const name = String(file.name || file.filename || "").toLowerCase();
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index + 1) : "";
}

function getAttachmentMime(file = {}) {
  return String(file.type || "").toLowerCase();
}

function isImageAttachment(file) {
  const mime = getAttachmentMime(file);
  return mime.startsWith("image/") || IMAGE_PREVIEW_EXTENSIONS.has(getAttachmentExtension(file));
}

function isPdfAttachment(file) {
  const mime = getAttachmentMime(file);
  return mime.includes("pdf") || getAttachmentExtension(file) === "pdf";
}

function isVideoAttachment(file) {
  const mime = getAttachmentMime(file);
  return mime.startsWith("video/") || VIDEO_PREVIEW_EXTENSIONS.has(getAttachmentExtension(file));
}

function isAudioAttachment(file) {
  const mime = getAttachmentMime(file);
  return mime.startsWith("audio/") || AUDIO_PREVIEW_EXTENSIONS.has(getAttachmentExtension(file));
}

function isHtmlAttachment(file) {
  const mime = getAttachmentMime(file);
  return mime.includes("html") || HTML_PREVIEW_EXTENSIONS.has(getAttachmentExtension(file));
}

function isTextAttachment(file) {
  const mime = getAttachmentMime(file);
  return mime.startsWith("text/") || TEXT_PREVIEW_EXTENSIONS.has(getAttachmentExtension(file));
}

function isOfficeAttachment(file) {
  return OFFICE_PREVIEW_EXTENSIONS.has(getAttachmentExtension(file));
}

function canOpenAttachmentInBrowser(file) {
  if (!file?.dataUrl || isOfficeAttachment(file)) return false;
  return isImageAttachment(file) ||
    isPdfAttachment(file) ||
    isVideoAttachment(file) ||
    isAudioAttachment(file) ||
    isHtmlAttachment(file) ||
    isTextAttachment(file);
}

function dataUrlToBlob(dataUrl = "") {
  try {
    const match = String(dataUrl).match(/^data:([^,]*),(.*)$/);
    if (!match) return null;
    const meta = match[1] || "";
    const mime = meta.split(";")[0] || "application/octet-stream";
    const body = match[2] || "";
    if (meta.toLowerCase().includes(";base64")) {
      const binary = atob(body);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(body)], { type: mime });
  } catch {
    return null;
  }
}

function openAttachmentFile(file) {
  if (!file?.dataUrl) {
    showToast("该附件只保存了元数据，无法直接打开。请重新上传原文件。");
    return;
  }

  if (canOpenAttachmentInBrowser(file)) {
    openAttachmentOnline(file);
    return;
  }

  downloadAttachment(file);
  const ext = getAttachmentExtension(file).toUpperCase();
  const officeText = isOfficeAttachment(file)
    ? `已下载 ${ext || "Office"} 文件，请在浏览器下载栏打开，系统会用 Excel / WPS / Office 处理。`
    : "已下载附件，请在浏览器下载栏用本机软件打开。";
  showToast(officeText);
}

function downloadAttachment(file) {
  if (!file?.dataUrl) return;
  const link = document.createElement("a");
  link.href = file.dataUrl;
  link.download = file.name || file.filename || "attachment";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openAttachmentOnline(file) {
  if (!file?.dataUrl) {
    showToast("该附件没有保存文件内容，无法在线打开");
    return;
  }
  if (!canOpenAttachmentInBrowser(file)) {
    showToast("该文件类型不能在浏览器中稳定在线打开，请下载后用本机软件检查");
    return;
  }
  const blob = dataUrlToBlob(file.dataUrl);
  const objectUrl = blob ? URL.createObjectURL(blob) : file.dataUrl;
  const link = document.createElement("a");
  link.href = objectUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    if (blob) URL.revokeObjectURL(objectUrl);
  }, 60000);
  showToast("已在新标签打开附件");
}

function getAttachmentApiLimitMessage() {
  const stats = getAttachmentTransferStats();
  if (!stats.total) return "";
  const oversized = getOversizedTrackedAttachment();
  if (oversized) {
    return `附件 ${oversized.name || "未命名附件"} 为 ${formatFileSize(oversized.size)}，超过线上CRM单个云端附件 ${formatFileSize(MAX_DIRECT_SMTP_ATTACHMENT_BYTES)} 上限。请用 Foxmail/Gmail 手动添加该附件，或改用网盘链接。`;
  }
  if (stats.encodedSize > DIRECT_ATTACHMENT_SAFE_PAYLOAD_BYTES) {
    return `附件合计 ${formatFileSize(stats.total)}，网页接口传输后约 ${formatFileSize(stats.encodedSize)}，超过直接SMTP请求安全范围；发送时将自动改为云端附件链接。`;
  }
  return "";
}

function getTrackedAttachmentLimitMessage() {
  const oversized = getOversizedTrackedAttachment();
  if (!oversized) return "";
  return `附件 ${oversized.name || "未命名附件"} 为 ${formatFileSize(oversized.size)}，超过线上CRM单个云端附件 ${formatFileSize(MAX_DIRECT_SMTP_ATTACHMENT_BYTES)} 上限。请用 Foxmail/Gmail 手动添加该附件，或改用网盘链接。`;
}

function shouldForceTrackedAttachmentLinks() {
  const stats = getAttachmentTransferStats();
  return Boolean(stats.total && stats.encodedSize > DIRECT_ATTACHMENT_SAFE_PAYLOAD_BYTES);
}

function getOversizedTrackedAttachment() {
  return attachments.find((file) => Number(file.size || 0) > MAX_DIRECT_SMTP_ATTACHMENT_BYTES);
}

function getAttachmentTransferStats() {
  const total = attachments.reduce((sum, file) => sum + Number(file.size || 0), 0);
  return {
    total,
    encodedSize: Math.ceil(total * 4 / 3),
  };
}

function previewEmail() {
  emailPreviewBody.innerHTML = `
    <dl class="history-detail-meta">
      ${renderContextItem("To", composeTo.value.trim())}
      ${renderContextItem("CC", composeCc.value.trim())}
      ${renderContextItem("BCC", composeBcc.value.trim())}
      ${renderContextItem("Subject", composeSubject.value.trim())}
      ${renderContextItem("Attachments", attachments.length ? attachments.map((item) => item.name).join(", ") : "无")}
    </dl>
    <div class="email-preview-content">${getEditorHtml() || "<p>正文为空</p>"}</div>`;
  emailPreviewDialog.showModal();
}

function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function createTrackingState(recipientEmail) {
  return {
    trackingId: createId(),
    emailId: "",
    recipientEmail,
    opened: false,
    openCount: 0,
    lastOpenedAt: "",
    linkClicks: 0,
    attachmentOpens: 0,
    deviceInfo: "模拟追踪",
    locationApprox: "模拟位置",
    createdAt: new Date().toISOString(),
  };
}

function getReplyTarget(message) {
  const from = extractEmails(message.from || "")[0];
  const to = extractEmails(message.to || "")[0];
  if (from && from !== FROM_EMAIL.toLowerCase()) return from;
  return to || composeTo.value.trim();
}

function prefixSubject(subject, prefix) {
  const cleanSubject = String(subject || "").trim();
  return cleanSubject.toLowerCase().startsWith(prefix.toLowerCase()) ? cleanSubject : `${prefix} ${cleanSubject}`.trim();
}

function getMailboxLabel(mailbox) {
  const map = {
    inbox: "收件邮件",
    sent: "已发邮件",
    drafts: "草稿邮件",
    followups: "跟进记录",
    trash: "垃圾箱",
  };
  return map[mailbox] || mailbox || "邮件";
}

function getCompanyFromEmail(email) {
  const domain = String(email || "").split("@")[1] || "";
  const base = domain.split(".")[0] || "";
  if (!base || /gmail|hotmail|outlook|yahoo|icloud|qq|163|126/i.test(base)) return "";
  return base.replace(/[-_]+/g, " ").replace(/\b[a-z]/g, (m) => m.toUpperCase());
}

function getCurrentUserName() {
  try {
    const current = JSON.parse(localStorage.getItem("foryal-current-user-v1") || "null");
    return current?.name || current?.email || "Lina";
  } catch {
    return "Lina";
  }
}

function normalizeBaseUrl(value) {
  const text = String(value || DEEPSEEK_BASE_URL).trim().replace(/\/+$/, "");
  return text || DEEPSEEK_BASE_URL;
}

function getCurrentDraftText() {
  return [`To: ${composeTo.value.trim()}`, `CC: ${composeCc.value.trim()}`, `BCC: ${composeBcc.value.trim()}`, `Subject: ${composeSubject.value.trim()}`, "", composeBody.value.trim()].join("\n");
}

function compactText(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractEmails(value) {
  return dedupeComposeValues((String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((email) => email.toLowerCase()));
}

function getPrimaryRecipientEmail(value) {
  return extractEmails(value)[0] || String(value || "").trim().toLowerCase();
}

function normalizeRecipientField(value) {
  return extractEmails(value).join(", ");
}

function getComposeRecipients(options = {}) {
  const to = normalizeRecipientField(composeTo.value);
  const cc = normalizeRecipientField(composeCc.value);
  const bcc = normalizeRecipientField(composeBcc.value);
  const hasInvalidTo = composeTo.value.trim() && !to;
  const hasInvalidCc = composeCc.value.trim() && !cc;
  const hasInvalidBcc = composeBcc.value.trim() && !bcc;
  if (!to || hasInvalidTo || hasInvalidCc || hasInvalidBcc) {
    if (!options.silent) {
      if (!to) showToast("请填写有效收件人邮箱");
      else if (hasInvalidCc) showToast("抄送邮箱格式不正确");
      else if (hasInvalidBcc) showToast("密送邮箱格式不正确");
      else showToast("收件人邮箱格式不正确");
    }
    return null;
  }
  return { to, cc, bcc, primaryEmail: extractEmails(to)[0] || "" };
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "").slice(0, 10);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Final email-body sanitizer. It is intentionally declared at the end so every
// caller uses this stricter version before content reaches the compose editor.
function sanitizeEnglishEmailText(value = "") {
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
