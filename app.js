const STORAGE_KEY = "coffee-machine-crm-customers-v6";
const OLD_CUSTOMER_STORAGE_KEYS = [
  "coffee-machine-crm-customers-v1",
  "coffee-machine-crm-customers-v2",
  "coffee-machine-crm-customers-v3",
  "coffee-machine-crm-customers-v4",
  "coffee-machine-crm-customers-v5",
];
const MAIL_STORE_KEY = "coffee-machine-crm-mail-v1";
const AI_SETTINGS_KEY = "coffee-machine-crm-ai-settings-v1";
const CRM_USERS_KEY = "foryal-crm-users-v1";
const CURRENT_USER_KEY = "foryal-current-user-v1";
const AUTH_SESSION_KEY = "foryal-auth-session-v1";
const LOGIN_EMAIL_KEY = "foryal-login-email";
const SESSION_MAX_AGE_DAYS = 30;
const SIGNATURES_KEY = "foryal-email-signatures-v1";
const MAIL_ACCOUNTS_KEY = "foryal-mail-accounts-v1";
const FOLLOWUP_RESET_KEY = "foryal-followups-reset-v2";
const OUTREACH_QUEUE_KEY = "foryal-email-outreach-queue-v1";
const OUTREACH_ACTIVITY_KEY = "foryal-email-outreach-activity-v1";
const OUTREACH_SETTINGS_KEY = "foryal-email-outreach-settings-v1";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-chat";
const OWNER_ADMIN_EMAILS = ["admin@example.com", "sales.manager@example.com"];
const AI_DEFAULT_MESSAGE = "把你想表达的意思、客户资料、LinkedIn/FB/IG/官网内容粘贴在下面，我会帮你写成可发送的英文邮件。";
const AI_CONTEXT_PREVIEW_LIMIT = 180;
const AI_CHAT_PREVIEW_LIMIT = 160;
const OLD_MAIL_DAYS = 30;
const AI_CONTEXT_NOISE_LINES = new Set([
  "home",
  "my network",
  "jobs",
  "messaging",
  "notifications",
  "me",
  "for business",
  "message",
  "follow",
  "connect",
  "show all",
  "people you may know",
  "pages for you",
  "about",
  "accessibility",
  "careers",
  "privacy & terms",
  "ad choices",
  "advertising",
  "sales solutions",
  "mobile",
  "small business",
  "safety center",
  "questions?",
  "select language",
  "status is online",
  "compose message",
]);
const AI_CONTEXT_NOISE_PATTERNS = [
  /^\d+\s+notifications?$/i,
  /^linkedin corporation/i,
  /^visit our help center/i,
  /^manage your account/i,
  /^recommendation transparency/i,
  /^learn more about recommended content/i,
  /^you are on the messaging overlay/i,
  /^press enter to open/i,
  /^followed by\b/i,
  /^people who follow\b/i,
  /^more profiles for you\b/i,
  /^from .*industry$/i,
  /^[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Telugu}\p{Script=Gurmukhi}].*\)$/u,
];
const stages = ["新线索", "已联系", "已报价", "样品/测试", "谈判中", "已成交"];

const seedCustomers = [
  {
    id: "c-1001",
    company: "Nordic Brew Equipment AB",
    contact: "Erik Lind",
    title: "Sourcing Manager",
    country: "Sweden",
    segment: "经销商",
    stage: "已报价",
    priority: "A",
    owner: "Mia",
    linkedin: "https://www.linkedin.com/in/erik-lind-coffee",
    email: "demo.buyer1@example.com",
    whatsapp: "+1 555 010 1001",
    source: "LinkedIn",
    product: "商用全自动咖啡机",
    volume: "300 台/年",
    notes: "关注 CE 认证、低故障率和北欧售后配件响应。",
    followUps: [
      {
        date: "2026-05-18",
        channel: "Email",
        summary: "发送 20 页产品目录和 CE 文件。",
        nextStep: "补充 MOQ 与样机交期",
        nextDate: "2026-05-30"
      },
      {
        date: "2026-05-22",
        channel: "LinkedIn",
        summary: "确认对 2 款机型感兴趣。",
        nextStep: "整理 FOB 报价",
        nextDate: "2026-05-29"
      }
    ]
  },
  {
    id: "c-1002",
    company: "Cafe Route Trading LLC",
    contact: "Aisha Khan",
    title: "Import Director",
    country: "UAE",
    segment: "进口商",
    stage: "谈判中",
    priority: "A",
    owner: "Leo",
    linkedin: "https://www.linkedin.com/in/aisha-khan-trading",
    email: "demo.buyer2@example.com",
    whatsapp: "+1 555 010 1002",
    source: "Google",
    product: "半自动商用咖啡机",
    volume: "120 台/年",
    notes: "希望做中东区域代理，重视阿拉伯语包装和备件包。",
    followUps: [
      {
        date: "2026-05-20",
        channel: "WhatsApp",
        summary: "客户询问独家代理条件。",
        nextStep: "发送代理政策草案",
        nextDate: "2026-05-28"
      }
    ]
  },
  {
    id: "c-1003",
    company: "Roastline Market",
    contact: "Lucas Meyer",
    title: "Founder",
    country: "Germany",
    segment: "咖啡烘焙商",
    stage: "新线索",
    priority: "B",
    owner: "Nina",
    linkedin: "https://www.linkedin.com/in/lucas-meyer-roastline",
    email: "demo.buyer3@example.com",
    whatsapp: "+1 555 010 1003",
    source: "展会",
    product: "办公室咖啡机",
    volume: "60 台/年",
    notes: "LinkedIn 上提到正在扩展办公室咖啡服务。",
    followUps: []
  }
];

const importedCustomers = Array.isArray(window.CRM_IMPORTED_CUSTOMERS) ? window.CRM_IMPORTED_CUSTOMERS : [];
cleanupOldCustomerStorage();
const defaultCustomers = importedCustomers;
const SharedCrmStore = typeof window !== "undefined" ? window.FORYAL_CRM_DATA_STORE : null;
let sharedCrmDatabaseEnabled = false;
let sharedCrmHydrating = false;
let sharedCrmSyncTimer = null;
let sharedCrmNoticeShown = false;

let customers = loadCustomers();
let selectedId = customers[0]?.id || null;
let mailState = loadMailState();
resetFollowupDataOnce();
let aiSettings = loadAiSettings();
let crmUsers = loadCrmUsers();
let pendingInviteUser = processLoginInvite();
let mailAccounts = loadMailAccounts();
let signatures = loadSignatures();
let currentUser = loadCurrentUser();
let authSession = loadAuthSession();
if (!authSession) currentUser = null;
let activeMailbox = "inbox";
let selectedMailId = null;
let selectedMailIds = new Set();
let showOldMails = false;
let composeCustomerId = null;
let _currentDraftId = null;
let lastAiDraft = null;
let reminderCache = [];
let customerScopeFilter = "all";
const OutreachQueue = window.FORYAL_OUTREACH_QUEUE || {};
let outreachQueue = loadOutreachQueue();
let outreachActivityLog = loadOutreachActivityLog();
let outreachSettings = loadOutreachSettings();
let manualOutreachCustomerIds = new Set();
let selectedOutreachTaskId = outreachQueue[0]?.id || null;

const customerList = document.querySelector("#customerList");
const customerForm = document.querySelector("#customerForm");
const followForm = document.querySelector("#followForm");
const searchInput = document.querySelector("#searchInput");
const stageFilter = document.querySelector("#stageFilter");
const pipelineStats = document.querySelector("#pipelineStats");
const timeline = document.querySelector("#timeline");
const letterOutput = document.querySelector("#letterOutput");
const messageType = document.querySelector("#messageType");
const toast = document.querySelector("#toast");
const mailComposeForm = document.querySelector("#mailComposeForm");
const mailToInput = document.querySelector("#mailTo");
const mailSubjectInput = document.querySelector("#mailSubject");
const mailBodyInput = document.querySelector("#mailBody");
const mailList = document.querySelector("#mailList");
const mailReader = document.querySelector("#mailReader");
const mailStatus = document.querySelector("#mailStatus");
const mailSearchInput = document.querySelector("#mailSearchInput");
const mailSortSelect = document.querySelector("#mailSortSelect");
const selectAllVisibleMails = document.querySelector("#selectAllVisibleMails");
const selectedMailCount = document.querySelector("#selectedMailCount");
const deleteCheckedMailsBtn = document.querySelector("#deleteCheckedMailsBtn");
const toggleOldMailsBtn = document.querySelector("#toggleOldMailsBtn");
const aiThread = document.querySelector("#aiThread");
const aiContextInput = document.querySelector("#aiContextInput");
const aiPasteBox = document.querySelector("#aiPasteBox");
const aiContextPreview = document.querySelector("#aiContextPreview");
const aiPasteSummary = document.querySelector("#aiPasteSummary");
const aiArchivePanel = document.querySelector("#aiArchivePanel");
const aiArchiveSummary = document.querySelector("#aiArchiveSummary");
const aiArchiveList = document.querySelector("#aiArchiveList");
const aiMode = document.querySelector("#aiMode");
const reminderList = document.querySelector("#reminderList");
const aiSettingsForm = document.querySelector("#aiSettingsForm");
const aiProviderSelect = document.querySelector("#aiProviderSelect");
const deepseekApiKeyInput = document.querySelector("#deepseekApiKeyInput");
const deepseekBaseUrlInput = document.querySelector("#deepseekBaseUrlInput");
const deepseekModelInput = document.querySelector("#deepseekModelInput");
const aiSettingsStatus = document.querySelector("#aiSettingsStatus");
const importCustomersInput = document.querySelector("#importCustomersInput");
const userSettingsForm = document.querySelector("#userSettingsForm");
const userNameInput = document.querySelector("#userNameInput");
const userEmailInput = document.querySelector("#userEmailInput");
const userMailboxInput = document.querySelector("#userMailboxInput");
const userRoleInput = document.querySelector("#userRoleInput");
const settingsUsersTable = document.querySelector("#settingsUsersTable");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const loginEmailInput = document.querySelector("#loginEmailInput");
const loginPasswordInput = document.querySelector("#loginPasswordInput");
const loginError = document.querySelector("#loginError");
const logoutBtn = document.querySelector("#logoutBtn");
const currentUserChip = document.querySelector("#currentUserChip");
const userPasswordInput = document.querySelector("#userPasswordInput");
const signatureForm = document.querySelector("#signatureForm");
const signatureNameInput = document.querySelector("#signatureNameInput");
const signatureUserInput = document.querySelector("#signatureUserInput");
const signatureBodyInput = document.querySelector("#signatureBodyInput");
const signatureList = document.querySelector("#signatureList");
const outreachSection = document.querySelector("#outreachQueueSection");
const outreachSummary = document.querySelector("#outreachSummary");
const outreachEligibleList = document.querySelector("#outreachEligibleList");
const outreachEligibleCount = document.querySelector("#outreachEligibleCount");
const outreachQueueTable = document.querySelector("#outreachQueueTable");
const outreachTaskDetail = document.querySelector("#outreachTaskDetail");
const outreachActivityLogEl = document.querySelector("#outreachActivityLog");
const outreachSearchInput = document.querySelector("#outreachSearchInput");
const outreachStatusFilter = document.querySelector("#outreachStatusFilter");
const outreachBrandSender = document.querySelector("#outreachBrandSender");
const outreachDailyLimit = document.querySelector("#outreachDailyLimit");
const outreachAutoSend = document.querySelector("#outreachAutoSend");

applyPendingLoginInvite();
// Auto-fill remembered email (if no pending invite)
if (!pendingInviteUser && loginEmailInput && !loginEmailInput.value) {
  var savedEmail = localStorage.getItem(LOGIN_EMAIL_KEY);
  if (savedEmail) loginEmailInput.value = savedEmail;
}

loginForm?.addEventListener("submit", handleLogin);
logoutBtn?.addEventListener("click", logoutCurrentUser);
document.querySelector("#newCustomerBtn")?.addEventListener("click", createDraftCustomer);
document.querySelector("#newCustomerTableBtn")?.addEventListener("click", createDraftCustomer);
document.querySelector("#duplicateCheckBtn")?.addEventListener("click", runDuplicateCheck);
document.querySelector("#deleteCustomerBtn")?.addEventListener("click", deleteSelectedCustomer);
document.querySelector("#generateLetterBtn")?.addEventListener("click", renderGeneratedMessage);
document.querySelector("#copyLetterBtn")?.addEventListener("click", copyLetter);
document.querySelector("#sendEmailBtn")?.addEventListener("click", sendEmail);
document.querySelector("#exportBtn")?.addEventListener("click", exportCsv);
document.querySelector("#importCustomersBtn")?.addEventListener("click", () => importCustomersInput?.click());
importCustomersInput?.addEventListener("change", importCustomersCsv);
document.querySelector("#newMailBtn")?.addEventListener("click", openStandaloneComposer);
document.querySelector("#outreachGenerateSelectedBtn")?.addEventListener("click", generateSelectedOutreachTasks);
document.querySelector("#outreachRefreshBtn")?.addEventListener("click", () => {
  refreshOutreachComplianceFlags();
  renderOutreachQueue();
  showToast("开发信规则已刷新");
});
document.querySelector("#outreachSaveSettingsBtn")?.addEventListener("click", saveOutreachSettingsFromForm);
outreachSearchInput?.addEventListener("input", renderOutreachQueue);
outreachStatusFilter?.addEventListener("change", renderOutreachQueue);
outreachEligibleList?.addEventListener("change", handleOutreachEligibleChange);
outreachEligibleList?.addEventListener("click", handleOutreachEligibleAction);
outreachQueueTable?.addEventListener("click", handleOutreachTaskAction);
outreachTaskDetail?.addEventListener("click", handleOutreachDetailAction);
// Inline compose — Foxmail-style right pane
// --- Foxmail-style compose + AI modal ---
// Get default signature text for new compose emails
function _getDefaultSignatureHtml() {
  // Priority 1: default mail account's preferred signature
  var account = getDefaultMailAccount();
  var sigId = account?.defaultSignatureId || '';
  if (sigId) {
    var sig = signatures.find(function(s) { return s.id === sigId; });
    if (sig) return sig.html || sig.body || '';
  }
  // Priority 2: user's default signature
  var def = signatures.find(function(s) { return s.isDefault && (s.userId === currentUser?.id || s.scope === 'public'); });
  if (def) return def.html || def.body || '';
  // Priority 3: any signature for the current user
  var userSig = signatures.find(function(s) { return s.userId === currentUser?.id; });
  if (userSig) return userSig.html || userSig.body || '';
  return '';
}

// Strip AI-generated signature block from email body (text or HTML)
function _stripAiSignature(html) {
  if (!html) return '';
  var text = html;
  // Find common signature markers and truncate from the last one
  var markers = ['Best,', 'Best regards,', 'Regards,', 'Kind regards,', 'Sincerely,',
    'Warm regards,', 'Cheers,', 'Yours,', 'Thanks,', 'Thank you,',
    'Best<br>', 'Best regards<br>', 'Regards<br>', 'Kind regards<br>',
    'Sincerely<br>', 'Warm regards<br>', 'Cheers<br>', 'Thanks<br>',
  ];
  var nameAndCompany = ['Lina', 'Lina Mei', 'Demo Export Company', 'Aison', 'FORYAL'];
  // Find the LAST occurrence of any marker
  var cutPos = -1;
  for (var i = 0; i < markers.length; i++) {
    var pos = text.lastIndexOf(markers[i]);
    if (pos > cutPos) cutPos = pos;
  }
  // If marker found, try to include the full signature block (marker + name + company)
  if (cutPos > text.length * 0.6) {
    // Only truncate if the signature appears in the last ~40% of the body
    // (avoid cutting legitimate content that happens to contain these words)
    var signatureBlock = text.slice(cutPos);
    var hasName = false;
    for (var n = 0; n < nameAndCompany.length; n++) {
      if (signatureBlock.indexOf(nameAndCompany[n]) >= 0) { hasName = true; break; }
    }
    if (hasName) {
      text = text.slice(0, cutPos).replace(/<br\s*\/?>\s*<br\s*\/?>\s*$/i, '').trim();
      if (!text) text = html.slice(0, cutPos).trim(); // Fallback: keep something
    }
  }
  return text || html;
}

function _getComposeFormData() {
  var bodyEl = document.querySelector('#composeBody');
  var bodyHtml = bodyEl ? bodyEl.innerHTML : '';
  var bodyText = bodyEl ? (bodyEl.innerText || bodyEl.textContent || '') : '';
  var attachments = (window._inlineComposeAttachments || []).slice();
  return {
    to: (document.querySelector('#composeTo')?.value || '').trim(),
    cc: (document.querySelector('#composeCc')?.value || '').trim(),
    bcc: (document.querySelector('#composeBcc')?.value || '').trim(),
    subject: (document.querySelector('#composeSubject')?.value || '').trim(),
    body: bodyText,
    bodyHtml: bodyHtml,
    attachments: attachments
  };
}
function _saveComposeDraft() {
  var d = _getComposeFormData();
  if (_currentDraftId) {
    // Update existing draft
    var existing = (mailState.drafts || []).find(function(item) { return item.id === _currentDraftId; });
    if (existing) {
      existing.to = d.to; existing.cc = d.cc; existing.bcc = d.bcc;
      existing.subject = d.subject || 'Untitled'; existing.body = d.body;
      existing.bodyHtml = d.bodyHtml; existing.snippet = (d.body || '').slice(0, 120);
      existing.attachments = d.attachments; existing.date = new Date().toISOString();
      saveMailState(); renderMail(); showToast('草稿已更新');
      return;
    }
  }
  // Create new draft
  var draft = { id: crypto.randomUUID(), mailbox: 'drafts', direction: 'draft', from: getDefaultSenderEmail(), to: d.to, cc: d.cc, bcc: d.bcc, subject: d.subject || 'Untitled', body: d.body, bodyHtml: d.bodyHtml, snippet: (d.body || '').slice(0, 120), date: new Date().toISOString(), isRead: true, attachments: d.attachments };
  _currentDraftId = draft.id;
  mailState.drafts = [draft].concat(mailState.drafts || []);
  saveMailState(); renderMail(); showToast('草稿已保存');
}
// P0-1: Build HTML body from contenteditable (preserve HTML formatting)
function _buildEmailHtml(bodyHtml) {
  return '<div style="font-family:Arial,sans-serif;font-size:14px;color:#1e293b;line-height:1.7">'
    + (bodyHtml || '')
    + '</div>';
}
function _stripHtmlTags(text) {
  return text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

async function _sendComposeMail() {
  var d = _getComposeFormData();
  var cust = findCustomerByEmail(d.to);
  if (!d.to || !d.subject || !d.body) {
    showToast('请填写收件人、主题和正文');
    return;
  }

  var account = getDefaultMailAccount();
  if (!account?.email || !account?.password || !account?.smtpHost || !account?.smtpPort) {
    addDraftMail({ to: d.to, cc: d.cc, bcc: d.bcc, subject: d.subject || '(No subject)', text: d.body, from: getDefaultSenderEmail(), attachments: d.attachments }, cust);
    activeMailbox = 'drafts';
    selectedMailId = mailState.drafts[0]?.id || null;
    renderMail();
    showToast('尚未配置完整SMTP账户，已保存草稿，没有假发送');
    return;
  }

  if (!confirm('确认使用 ' + account.email + ' 发送到 ' + d.to + ' 吗？')) return;
  var buttons = [document.querySelector('#sendComposeMailBtn'), document.querySelector('#bottomSendBtn')].filter(Boolean);
  buttons.forEach(function(button) {
    button.disabled = true;
    button.textContent = '发送中...';
  });

  try {
    var htmlBody = _buildEmailHtml(d.bodyHtml || d.body);
    var plainText = d.body;
    var result = await sendMailPayload({ to: d.to, cc: d.cc, bcc: d.bcc, subject: d.subject || '(No subject)', text: plainText, html: htmlBody, from: account.email, attachments: d.attachments });
    // If this was a draft being sent, remove it from drafts
    if (_currentDraftId) {
      mailState.drafts = (mailState.drafts || []).filter(function(item) { return item.id !== _currentDraftId; });
      _currentDraftId = null;
    }
    addSentMail({ to: d.to, cc: d.cc, bcc: d.bcc, subject: d.subject || '(No subject)', text: plainText, html: htmlBody, from: account.email, messageId: result.messageId || '', transport: result.transport || '', attachments: d.attachments }, cust);
    activeMailbox = 'sent';
    selectedMailId = mailState.sent[0]?.id || null;
    renderMail();
    showToast('邮件已通过SMTP真实发送');
  } catch (error) {
    showToast('发送失败：' + (error.message || 'SMTP连接失败'));
  } finally {
    buttons.forEach(function(button) {
      button.disabled = false;
      button.textContent = '发送';
    });
  }
}

// Get customer context for AI
function _getCustomerContextForAI() {
  var toEmail = (document.querySelector('#composeTo')?.value || '').trim();
  var cust = findCustomerByEmail(toEmail);
  if (!cust) {
    // Try to find by composeCustomerId
    if (composeCustomerId) cust = customers.find(function(c) { return c.id === composeCustomerId; });
  }
  if (!cust) return null;
  return {
    company: cust.company || '',
    contact: cust.contact || '',
    country: cust.country || '',
    website: cust.website || '',
    product: cust.product || '',
    priority: cust.priority || 'B',
    stage: cust.stage || '',
    notes: (cust.notes || '').slice(0, 300),
    industry: cust.industry || '',
    customerType: cust.customerType || '',
    recentFollowups: (cust.followUps || []).slice(0, 5).map(function(f) { return f.date + ': ' + (f.summary || ''); }),
    recentEmails: _getRecentEmailsForCustomer(cust)
  };
}
function _getRecentEmailsForCustomer(cust) {
  var email = (cust.email || '').toLowerCase();
  var msgs = [];
  [].concat(mailState.sent || [], mailState.inbox || []).forEach(function(m) {
    if ((m.to || '').toLowerCase().indexOf(email) >= 0 || (m.from || '').toLowerCase().indexOf(email) >= 0) {
      msgs.push({ subject: m.subject || '', date: m.date, snippet: (m.snippet || m.body || '').slice(0, 150) });
    }
  });
  return msgs.slice(0, 5);
}

// Country → language mapping
function _countryToLang(country) {
  var map = {
    '伊朗': 'fa', 'iran': 'fa', '沙特': 'ar', 'saudi': 'ar', '阿联酋': 'ar', 'uae': 'ar', '埃及': 'ar', 'egypt': 'ar',
    '俄罗斯': 'ru', 'russia': 'ru', '土耳其': 'tr', 'turkey': 'tr', '巴西': 'pt', 'brazil': 'pt',
    '西班牙': 'es', 'spain': 'es', '墨西哥': 'es', 'mexico': 'es', '阿根廷': 'es', 'argentina': 'es',
    '法国': 'fr', 'france': 'fr', '德国': 'de', 'germany': 'de', '意大利': 'it', 'italy': 'it',
    '日本': 'ja', 'japan': 'ja', '韩国': 'ko', 'korea': 'ko', '葡萄牙': 'pt', 'portugal': 'pt',
  };
  var c = (country || '').toLowerCase();
  for (var k in map) { if (c.indexOf(k) >= 0) return map[k]; }
  return 'auto';
}

// AI modal
window._openAiModal = function() {
  var ctx = _getCustomerContextForAI();
  var ctxStr = ctx ? JSON.stringify(ctx).replace(/"/g, '&quot;') : '';
  var modal = document.createElement('div');
  modal.className = 'ai-modal-backdrop';
  modal.innerHTML = '<div class="ai-modal-card">' +
    '<div class="ai-modal-head"><h3>🤖 AI邮件助手</h3><button class="icon-close" id="closeAiModalBtn" type="button">&times;</button></div>' +
    '<div class="ai-modal-body">' +
      (ctx ? '<div class="ai-ctx-badge">📋 已关联: <strong>' + ctx.company + '</strong> (' + ctx.country + ')</div>' : '<div class="ai-ctx-badge" style="background:#fef2f2">⚠️ 未关联客户，请粘贴资料</div>') +
      '<textarea id="aiModalInput" rows="4" placeholder="粘贴客户资料、LinkedIn、WhatsApp、邮件原文作为补充..."></textarea>' +
      '<div class="ai-modal-row">' +
        '<label>邮件类型<select id="aiEmailType"><option value="cold">开发信</option><option value="followup">跟进邮件</option><option value="quote">报价邮件</option><option value="sample">样品推荐</option><option value="holiday">节日问候</option><option value="dormant">久未回复跟进</option><option value="reply">回复客户问题</option><option value="meeting">会议邀约</option><option value="thanks">感谢邮件</option></select></label>' +
        '<label>语气<select id="aiTone"><option>自然</option><option>专业</option><option>友好</option><option>简短</option></select></label>' +
        '<label>语言<select id="aiLang"><option value="auto">自动识别</option><option value="en">English</option><option value="zh">中文</option><option value="ar">العربية</option><option value="fa">فارسی</option><option value="ru">Русский</option><option value="es">Español</option><option value="pt">Português</option><option value="tr">Türkçe</option><option value="fr">Français</option><option value="de">Deutsch</option></select></label>' +
      '</div>' +
      '<div class="ai-modal-actions">' +
        '<button class="primary-btn" id="aiGenerateBody" type="button">生成邮件正文</button>' +
        '<button class="ghost-btn" id="aiGenerateSubject" type="button">生成标题</button>' +
        '<button class="ghost-btn" id="aiSummarize" type="button">总结需求</button>' +
        '<button class="ghost-btn" id="aiExtract" type="button">提取客户</button>' +
      '</div>' +
      '<div id="aiModalResult"></div>' +
    '</div>' +
  '</div>';
  document.body.appendChild(modal);

  modal.querySelector('#closeAiModalBtn').addEventListener('click', function() { modal.remove(); });
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

  function _safeAiStr(val, fallback) {
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join('\n');
    if (val && typeof val === 'object') return JSON.stringify(val);
    return fallback || '';
  }
  function aiResult(html) {
    var r = modal.querySelector('#aiModalResult');
    r.innerHTML = html;
  }
  function buildCustomerPrompt() {
    var ctx2 = _getCustomerContextForAI();
    var extra = (modal.querySelector('#aiModalInput')?.value || '').trim();
    var parts = [];
    if (ctx2) {
      parts.push('Company: ' + ctx2.company + '\nContact: ' + ctx2.contact + '\nCountry: ' + ctx2.country + '\nIndustry: ' + ctx2.industry + '\nProduct: ' + ctx2.product);
      if (ctx2.recentFollowups && ctx2.recentFollowups.length) parts.push('Recent Followups:\n' + ctx2.recentFollowups.join('\n'));
      if (ctx2.recentEmails && ctx2.recentEmails.length) parts.push('Recent Emails:\n' + ctx2.recentEmails.map(function(e) { return '[' + e.date + '] ' + e.subject + ': ' + e.snippet; }).join('\n'));
    }
    if (extra) parts.push('Additional Context:\n' + extra);
    return parts.join('\n\n');
  }

  var tpls = {
    cold: ['Coffee Machine OEM/ODM Cooperation — FORYAL', 'I am writing from Aison, a Chinese OEM/ODM coffee machine manufacturer with over 10 years of experience.\n\nI noticed your company is active in the home appliance sector and believe our product line could be a great fit.\n\nMay I share our product catalog and FOB quotation?\n\nBest regards,\nLina Mei\nDemo Export Company'],
    followup: ['Following up — Coffee Machine', 'Just a quick follow-up on our previous communication.\n\nPlease let me know if you have any questions about our coffee machine models, pricing, or delivery terms.\n\nLooking forward to hearing from you.\n\nBest regards,\nLina Mei'],
    quote: ['Quotation — Demo Export Company', 'Thank you for your interest.\n\nPlease find our quotation below:\n\nModel: CM-1700MY\nFOB Price: USD XX/set (MOQ 300)\nPayment: 30% deposit + 70% before shipment\nDelivery: 45 days\n\nAll models are CE / RoHS certified.\n\nBest regards,\nLina Mei'],
    sample: ['Sample Policy — FORYAL', 'We are pleased to inform you that we offer 1-2 evaluation samples for our coffee machine models.\n\nSample lead time: 7-10 days\nShipping: DHL / FedEx\n\nPlease let me know if you would like to proceed.\n\nBest regards,\nLina Mei'],
    holiday: ['Season\'s Greetings from Aison', 'Wishing you and your team a wonderful holiday season!\n\nAs we plan for the coming year, please let me know if there are any coffee machine projects we can support.\n\nWarm regards,\nLina Mei'],
    dormant: ['Checking in — Demo Export Company', 'It\'s been a while since we last connected.\n\nWe\'ve recently launched some new coffee machine models with improved features and competitive pricing.\n\nWould you be open to a quick update?\n\nBest regards,\nLina Mei'],
    reply: ['Re: Your Inquiry', 'Thank you for reaching out.\n\nRegarding your question, please find the information below:\n\n[Details]\n\nI hope this helps. Please let me know if you need anything else.\n\nBest regards,\nLina Mei'],
    meeting: ['Meeting Invitation — Demo Export Company', 'I would like to invite you for a brief video call to discuss potential cooperation.\n\nPlease let me know a time that works for you.\n\nBest regards,\nLina Mei'],
    thanks: ['Thank You', 'Thank you for your time and consideration.\n\nWe look forward to the opportunity to work together.\n\nBest regards,\nLina Mei']
  };

  // P0-2: Real DeepSeek API call — or clear "not configured" message
  function getAiApiKey() {
    try { return JSON.parse(localStorage.getItem('coffee-machine-crm-ai-settings-v1') || '{}')?.apiKey || ''; }
    catch { return ''; }
  }
  function getAiSettings() {
    try { return JSON.parse(localStorage.getItem('coffee-machine-crm-ai-settings-v1') || '{}'); }
    catch { return {}; }
  }

  modal.querySelector('#aiGenerateBody').addEventListener('click', async function() {
    var apiKey = getAiApiKey();
    if (!apiKey) {
      aiResult('<div class="ai-result-box" style="background:#fef2f2;border-color:#fecaca"><strong>⚠️ 未配置 DeepSeek API Key</strong><p style="margin-top:8px">请到 <b>设置 → AI设置</b> 填写 DeepSeek API Key 和 Model。</p><button class="ghost-btn" onclick="document.querySelector(\'[data-nav-target=settingsPanel]\')?.click()" style="margin-top:8px">前往设置</button></div>');
      return;
    }
    var settings = getAiSettings();
    var type = modal.querySelector('#aiEmailType').value;
    var prompt = buildCustomerPrompt();
    var btn = modal.querySelector('#aiGenerateBody');
    btn.disabled = true; btn.textContent = '生成中...';
    aiResult('<div class="ai-result-box">⏳ 正在调用 DeepSeek 生成邮件...</div>');

    try {
      var resp = await fetch('/api/ai-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: type, apiKey: apiKey,
          baseUrl: settings.baseUrl || 'https://api.deepseek.com',
          model: settings.model || 'deepseek-chat',
          userRequest: prompt,
          customer: _getCustomerContextForAI() || {},
          currentDraft: (document.querySelector('#composeBody')?.innerText || document.querySelector('#composeBody')?.textContent || '') || '',
          research: modal.querySelector('#aiModalInput')?.value || '',
          history: []
        })
      });
      var data;
      try {
        data = await resp.json();
      } catch (parseErr) {
        var rawText = await resp.text().catch(function() { return ''; });
        throw new Error('API 返回了非 JSON 响应 (' + resp.status + '): ' + rawText.slice(0, 120));
      }
      if (!resp.ok || data.error) throw new Error(data.message || data.error || 'API failed');

      // Use new field names with broad fallback
      var subj = data.recommendedSubject || data.subject || data.title || '';
      var body = data.recommendedBody || data.body || data.email || data.content || '';
      var angleNote = data.angleNote || '';
      var wasIncomplete = false;

      // Auto-fill empty subject/body from local template when AI returned incomplete data
      if (!subj || !body) {
        var fallback = buildLocalEmailAssistantDraft({ mode: type, userRequest: prompt, customer: _getCustomerContextForAI() || {} });
        if (!subj) subj = fallback.subject || 'Coffee machine cooperation';
        if (!body) body = fallback.body || '';
        wasIncomplete = true;
      }

      aiResult(
        (wasIncomplete ? '<div class="ai-result-box" style="background:#fffbeb;border-color:#fcd34d;margin-bottom:8px"><strong>⚠️ AI 返回内容不完整，已自动补全标题和正文。</strong></div>' : '') +
        '<div class="ai-result-box"><div class="ai-result-title">📧 推荐标题</div>' +
        '<input id="aiResultSubject" value="' + subj.replace(/"/g,'&quot;') + '" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px" />' +
        '<div class="ai-result-title" style="margin-top:12px">📝 推荐正文</div>' +
        '<textarea id="aiResultBody" rows="10" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;line-height:1.6">' + body.replace(/</g,'&lt;') + '</textarea>' +
        (angleNote ? '<div style="margin-top:6px;font-size:11px;color:#64748b">💡 ' + angleNote.replace(/</g,'&lt;') + '</div>' : '') +
        (_safeAiStr(data.keyPoints) ? '<div style="margin-top:8px;font-size:12px;color:#475569"><strong>关键点：</strong>' + _safeAiStr(data.keyPoints).replace(/</g,'&lt;') + '</div>' : '') +
        (_safeAiStr(data.breakthroughAngles) ? '<div style="margin-top:4px;font-size:12px;color:#475569"><strong>突破角度：</strong>' + _safeAiStr(data.breakthroughAngles).replace(/</g,'&lt;') + '</div>' : '') +
        '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="primary-btn ai-apply-btn" data-mode="replace">替换正文</button>' +
        '<button class="ghost-btn ai-apply-btn" data-mode="insert">插入光标处</button>' +
        '<button class="ghost-btn ai-apply-btn" data-mode="append">追加到末尾</button>' +
        '<button class="ghost-btn ai-apply-btn" data-mode="subject">应用标题</button>' +
        '</div></div>'
      );
      bindAiApplyButtons(modal);
    } catch (err) {
      // Auto-fallback to local template — never block the user on AI error
      var fallback = buildLocalEmailAssistantDraft({ mode: modal.querySelector('#aiEmailType')?.value || 'cold', userRequest: buildCustomerPrompt(), customer: _getCustomerContextForAI() || {} });
      aiResult(
        '<div class="ai-result-box" style="background:#fffbeb;border-color:#fcd34d"><strong>⚠️ AI 生成失败，已使用本地模板</strong><p style="margin-top:4px;font-size:12px;color:#92400e">' + (err.message || '未知错误') + '。你可以直接使用下方模板或重试。</p></div>' +
        '<div class="ai-result-box" style="margin-top:8px"><div class="ai-result-title">📧 推荐标题（本地）</div>' +
        '<input id="aiResultSubject" value="' + (fallback.subject || '').replace(/"/g,'&quot;') + '" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px" />' +
        '<div class="ai-result-title" style="margin-top:12px">📝 推荐正文（本地）</div>' +
        '<textarea id="aiResultBody" rows="10" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;line-height:1.6">' + (fallback.body || '').replace(/</g,'&lt;') + '</textarea>' +
        '<div style="margin-top:6px;font-size:11px;color:#64748b">💡 ' + (fallback.notes || '本地模板') + '</div>' +
        '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="primary-btn ai-apply-btn" data-mode="replace">替换正文</button>' +
        '<button class="ghost-btn ai-apply-btn" data-mode="insert">插入光标处</button>' +
        '<button class="ghost-btn ai-apply-btn" data-mode="append">追加到末尾</button>' +
        '<button class="ghost-btn ai-apply-btn" data-mode="subject">应用标题</button>' +
        '</div></div>'
      );
      bindAiApplyButtons(modal);
    } finally {
      btn.disabled = false; btn.textContent = '生成邮件正文';
    }
  });

  function bindAiApplyButtons(modal) {
    modal.querySelectorAll('.ai-apply-btn').forEach(function(b) {
      b.addEventListener('click', function() {
        var mode = b.dataset.mode;
        var txt = modal.querySelector('#aiResultBody')?.value || '';
        var subj = modal.querySelector('#aiResultSubject')?.value || '';

        // Subject-only: just set subject, keep modal open
        if (mode === 'subject' && subj) {
          var s = document.querySelector('#composeSubject');
          if (s) { s.value = subj; showToast('标题已应用'); }
          else { showToast('未找到主题输入框，请先在内联写邮件中打开'); }
          return;
        }

        // Body modes: replace / insert / append
        var bodyEl = document.querySelector('#composeBody');
        if (!bodyEl) {
          showToast('未找到邮件正文编辑框，请先在内联写邮件中打开再点击应用');
          return;
        }
        if (!txt) {
          showToast('没有可插入的正文内容，请先生成邮件');
          return;
        }
        var htmlToInsert = txt.replace(/\n/g, '<br>');
        // Always strip AI-generated signature and use system default signature
        htmlToInsert = _stripAiSignature(htmlToInsert);
        var defaultSig = _getDefaultSignatureHtml();
        if (defaultSig) htmlToInsert += '<br><br>' + defaultSig;

        if (mode === 'replace') {
          bodyEl.innerHTML = htmlToInsert;
        } else if (mode === 'insert') {
          // Keep existing signature in body, insert AI text before it
          var existingBody = _stripAiSignature(bodyEl.innerHTML);
          bodyEl.innerHTML = htmlToInsert + existingBody;
        } else {
          // Append: keep existing body, add AI text at end
          bodyEl.innerHTML = _stripAiSignature(bodyEl.innerHTML) + htmlToInsert;
        }

        // For replace mode: ask about subject sync
        if (mode === 'replace' && subj) {
          var currentSubject = (document.querySelector('#composeSubject')?.value || '').trim();
          if (!currentSubject || currentSubject !== subj) {
            if (confirm('是否同时替换邮件标题为 AI 推荐标题？\n\n' + subj)) {
              var se = document.querySelector('#composeSubject');
              if (se) se.value = subj;
            }
          }
        }

        // Close modal and focus body
        modal.remove();
        bodyEl.focus();
        // Place cursor at end
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(bodyEl);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);

        showToast('已' + (mode === 'replace' ? '替换' : mode === 'insert' ? '插入' : mode === 'append' ? '追加' : '应用') + '成功');
      });
    });
  }

  // Remove old tpls object — no longer needed
  var tpls = {};

  modal.querySelector('#aiGenerateSubject').addEventListener('click', async function() {
    var apiKey = getAiApiKey();
    var body = (document.querySelector('#composeBody')?.innerText || document.querySelector('#composeBody')?.textContent || '') || '';
    var prompt = buildCustomerPrompt();
    // Try real API first
    if (apiKey) {
      var btn = modal.querySelector('#aiGenerateSubject');
      btn.disabled = true; btn.textContent = '生成中...';
      aiResult('<div class="ai-result-box">⏳ 正在调用 DeepSeek 生成标题...</div>');
      try {
        var settings = getAiSettings();
        var resp = await fetch('/api/ai-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'subject',
            apiKey: apiKey,
            baseUrl: settings.baseUrl || 'https://api.deepseek.com',
            model: settings.model || 'deepseek-chat',
            userRequest: prompt,
            customer: _getCustomerContextForAI() || {},
            currentDraft: body,
            research: modal.querySelector('#aiModalInput')?.value || '',
            history: []
          })
        });
        var data;
        try { data = await resp.json(); } catch (parseErr) { throw new Error('API 返回了非 JSON 响应 (' + resp.status + ')'); }
        if (resp.ok && data.subject) {
          aiResult('<div class="ai-result-box"><div class="ai-result-title">📧 AI 推荐标题</div><input id="aiResultSubject" value="' + (data.subject || '').replace(/"/g,'&quot;') + '" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px" /><button class="primary-btn ai-apply-btn" data-mode="subject" style="margin-top:8px">应用标题</button></div>');
          modal.querySelector('.ai-apply-btn')?.addEventListener('click', function() {
            var s = document.querySelector('#composeSubject');
            var v = modal.querySelector('#aiResultSubject')?.value || '';
            if (s) s.value = v; showToast('标题已应用');
          });
          btn.disabled = false; btn.textContent = '生成标题';
          return;
        }
        throw new Error(data.error || 'API failed');
      } catch (err) {
        // Fallback to local extraction
      } finally {
        btn.disabled = false; btn.textContent = '生成标题';
      }
    }
    // Local fallback
    var subj = body ? body.split('\n')[0].slice(0, 80) : 'Coffee Machine Cooperation';
    aiResult('<div class="ai-result-box"><div class="ai-result-title">📧 推荐标题（本地提取）</div><input id="aiResultSubject" value="' + subj.replace(/"/g,'&quot;') + '" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px" /><button class="primary-btn ai-apply-btn" data-mode="subject" style="margin-top:8px">应用标题</button></div>');
    modal.querySelector('.ai-apply-btn')?.addEventListener('click', function() {
      var s = document.querySelector('#composeSubject');
      var v = modal.querySelector('#aiResultSubject')?.value || '';
      if (s) s.value = v; showToast('标题已应用');
    });
  });

  modal.querySelector('#aiSummarize').addEventListener('click', async function() {
    var apiKey = getAiApiKey();
    var prompt = buildCustomerPrompt();
    var body = (document.querySelector('#composeBody')?.innerText || document.querySelector('#composeBody')?.textContent || '') || '';
    // Try real API first
    if (apiKey) {
      var btn = modal.querySelector('#aiSummarize');
      btn.disabled = true; btn.textContent = '分析中...';
      aiResult('<div class="ai-result-box">⏳ 正在调用 DeepSeek 分析需求...</div>');
      try {
        var settings = getAiSettings();
        var resp = await fetch('/api/ai-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'summarize',
            apiKey: apiKey,
            baseUrl: settings.baseUrl || 'https://api.deepseek.com',
            model: settings.model || 'deepseek-chat',
            userRequest: prompt,
            customer: _getCustomerContextForAI() || {},
            currentDraft: body,
            research: modal.querySelector('#aiModalInput')?.value || '',
            history: []
          })
        });
        var data;
        try { data = await resp.json(); } catch (parseErr) { throw new Error('API 返回了非 JSON 响应 (' + resp.status + ')'); }
        if (resp.ok && (data.body || data.keyPoints)) {
          var summaryText = data.body || _safeAiStr(data.keyPoints).replace(/\n/g, '<br>');
          var baText = _safeAiStr(data.breakthroughAngles);
          aiResult('<div class="ai-result-box"><strong>📋 AI 需求摘要</strong><p style="margin-top:8px;line-height:1.6">' + summaryText + '</p>'
            + (baText ? '<p style="margin-top:8px;font-size:12px;color:#475569"><strong>突破建议：</strong>' + baText.replace(/\n/g, '<br>') + '</p>' : '')
            + '</div>');
          btn.disabled = false; btn.textContent = '总结需求';
          return;
        }
        throw new Error(data.error || 'API failed');
      } catch (err) {
        // Fallback to local template
      } finally {
        btn.disabled = false; btn.textContent = '总结需求';
      }
    }
    // Local fallback with customer context
    var ctx = _getCustomerContextForAI();
    var fallbackLines = ctx
      ? ['1. 产品认证和品质', '2. FOB价格竞争力', '3. MOQ灵活性', '4. 交货周期', '建议：发送认证文件 + FOB报价单，明确样机政策。']
      : ['1. 产品认证和品质', '2. FOB价格竞争力', '3. MOQ灵活性', '4. 交货周期', '建议：发送认证文件 + FOB报价单，明确样机政策。'];
    aiResult('<div class="ai-result-box"><strong>📋 需求摘要（本地模板）</strong><p style="margin-top:8px;line-height:1.6">' + fallbackLines.join('<br>') + '</p></div>');
  });

      modal.querySelector('#aiExtract').addEventListener('click', function() {
    var inputText = (modal.querySelector('#aiModalInput')?.value || '').trim();
    var d = _getComposeFormData();
    var ctx = _getCustomerContextForAI();

    // ===== LinkedIn Section Parsing =====
    function _parseLinkedInSections(text) {
      var sections = { header: '', about: '', experience: '', education: '', noise: '' };
      var lines = text.split(/\n/);
      var currentSection = 'header';
      var markers = {
        about: /^\s*(?:about|acerca de|summary|resumen|info)\s*$/i,
        experience: /^\s*(?:experience|experiencia|experiência|work experience|employment|experiencia laboral)\s*$/i,
        education: /^\s*(?:education|educaci[oó]n|educação|academic|formaci[oó]n acad[eé]mica)\s*$/i,
        skills: /^\s*(?:skills|habilidades|compet[eê]ncias|aptitudes|endorsements|licenses|certifications)\s*$/i,
        interests: /^\s*(?:interests|intereses)\s*$/i,
        more: /^\s*(?:more profiles|people also viewed|people you may know|people also search|pages for you|also viewed|recommendations)\s*$/i,
      };
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (markers.about.test(line)) { currentSection = 'about'; sections[currentSection] = ''; continue; }
        if (markers.experience.test(line)) { currentSection = 'experience'; sections[currentSection] = ''; continue; }
        if (markers.education.test(line)) { currentSection = 'education'; sections[currentSection] = ''; continue; }
        if (markers.skills.test(line) || markers.interests.test(line) || markers.more.test(line)) { currentSection = 'noise'; continue; }
        sections[currentSection] = (sections[currentSection] || '') + line + '\n';
      }
      return sections;
    }

    var sections = _parseLinkedInSections(inputText);
    var coreText = [sections.header, sections.about, sections.experience].filter(Boolean).join('\n');

    // ===== Helpers =====
    function _findEmail(text) { var m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i); return m ? m[0] : ''; }
    function _findLinkedInUrl(text) { var m = text.match(/(?:linkedin\.com\/in\/[A-Za-z0-9_-]+)/i); return m ? m[0] : ''; }
    function _findPhone(text) { var m = text.match(/(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,6}/); return m ? m[0] : ''; }

    function _findCountry(hdrText, expText) {
      var allCountries = ['Paraguay','Brazil','USA','United States','Mexico','Canada','UK','United Kingdom','Germany','France','Italy','Spain','Netherlands','Belgium','Sweden','Norway','Denmark','Finland','Poland','Turkey','UAE','Saudi Arabia','India','Japan','Korea','Australia','China','Russia','South Africa','Argentina','Chile','Colombia','Peru','Portugal','Switzerland','Indonesia','Malaysia','Thailand','Vietnam','Philippines','Singapore','Uruguay','Panama','Costa Rica','Ecuador','Bolivia','Venezuela','Austria'];
      var addrWords = /\b(?:casi|calle|street|st\.|avenue|ave\.|road|rd\.|ruta|esquina|san\s*martin|martin|av\b)/i;

      function extract(text, weight) {
        var results = [];
        var lower = text.toLowerCase();
        allCountries.forEach(function(c) {
          var cl = c.toLowerCase();
          var idx = lower.indexOf(cl);
          if (idx < 0) return;
          var before = lower.slice(Math.max(0, idx - 40), idx);
          if (addrWords.test(before)) return;
          results.push({ country: c, weight: weight, count: (lower.match(new RegExp(cl, 'gi')) || []).length });
        });
        return results;
      }

      var all = extract(hdrText, 3).concat(extract(expText, 2));
      var seen = {};
      all.forEach(function(item) {
        var key = item.country.toLowerCase();
        if (!seen[key] || seen[key].score < item.weight + Math.min(item.count, 3)) {
          seen[key] = { country: item.country, score: item.weight + Math.min(item.count, 3) };
        }
      });
      var sorted = Object.values(seen).sort(function(a, b) { return b.score - a.score; });
      return sorted.length > 0 ? sorted[0].country : '';
    }

    function _findCompanyFromSections(hdrText, expText) {
      var eduKw = /\b(?:universidad|university|universidade|college|school|institute|instituto|faculty|facultad|fundaci[oó]n|polytechnic)\b/i;
      var results = [];

      function extract(text, isExperience) {
        var lines = text.split(/\n/);
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line.length < 2 || line.length > 80) continue;
          if (eduKw.test(line)) continue;
          if (/^(?:\d{4}|\d+\s+(?:yr|year|month|mo|connection|follower|contact)|Home|My|Jobs|About|Activity|People|Pages|More|Show|Follow|Connect|Message|Say|Hi|Contact|Featured|Recommendations|Messaging|Notifications|Compose|Location|On-site|Hybrid|Remote|LinkedIn|Full-time|Part-time|Contract|Freelance|Internship|Encargado|Gerente|Director|Coordinador|Jefe|Supervisor|President|CEO|CTO|CFO|VP|Manager)/i.test(line)) continue;
          // Match company with entity suffix — capture FULL name including suffix
          var cm = line.match(/^([A-Za-zÀ-ÿ0-9\s&.,()_-]{2,60})\s+(S\.A\.|S\.R\.L\.|Ltd\.|Inc\.|Corp\.|GmbH|LLC|S\.A\.C\.|C\.I\.|E\.I\.R\.L\.)/);
          if (cm) {
            var cname = (cm[1].trim() + ' ' + cm[2].trim()).trim();
            if (!eduKw.test(cname)) {
              results.push({ name: cname, priority: isExperience ? 3 : 2 });
              continue;
            }
          }
        }
      }

      extract(expText, true);
      extract(hdrText, false);

      if (results.length > 0) {
        results.sort(function(a, b) { return b.priority - a.priority; });
        var unique = []; var s = {};
        results.forEach(function(r) {
          var k = r.name.toLowerCase();
          if (!s[k] && unique.length < 5) { s[k] = true; unique.push(r.name); }
        });
        return unique;
      }
      return [];
    }

    function _findPersonNameFromHeader(hdrText) {
      // Build combined search text: raw input first (highest priority), then header section
      var rawLines = (inputText || '').split(/[\r\n]+/);
      var combined = rawLines.concat(hdrText.split(/[\r\n]+/));
      var excludeLine = /^(?:Home|My Network|Jobs|Messaging|Notifications|Me|For Business|Message|Contact info|Show all|Follow|Connect|Say hello|Hi|Open to|\.\.\.|\d+\s*(?:connection|follower|yr|year|mo)|https?:)/i;
      var excludeName = /^(?:Newell|Coleman|Contigo|Rubbermaid|Bubba|Oster|Marmot|Cadence|Graco|NUK|Parker|Lenox|Paper|FORYAL|Aison|Nestlé|Unilever|Philips|Starbucks|Universidad|San Martin|Role S|Cafepar|Feria|Encargado|Gerente|Director|Coordinador|Jefe|Supervisor|President|CEO|CTO|CFO|VP|Manager|Engineer|Analyst|Specialist|Consultant|Paraguay|Brazil|Argentina|Skills|Experience|Education|LINA MEI|FORYAL ELECTRICAL)/i;
      var nameRegex = /^([A-Z][A-Za-zÀ-ÿ]+(?:\s+[A-Z][A-Za-zÀ-ÿ]+){1,3})$/;
      var companySuffix = /\b(?:S\.A\.|S\.R\.L\.|Ltd\.|Inc\.|Corp\.|GmbH|LLC|universidad|university|college|school)\b/i;

      for (var i = 0; i < Math.min(combined.length, 40); i++) {
        var line = combined[i].trim();
        if (!line || line.length > 60 || line.length < 4) continue;
        if (excludeLine.test(line)) continue;
        if (companySuffix.test(line)) continue;
        // Also skip lines with dots (URLs, ·) and numbers
        if (/[·\d]/.test(line) && line.length < 10) continue;
        var m = line.match(nameRegex);
        if (m) {
          var name = m[1].trim();
          if (!excludeName.test(name)) {
            // Validate: check that the next 1-4 lines contain a job title, country, company, or "· 1st"
            var hasContext = false;
            for (var k = i + 1; k < Math.min(combined.length, i + 5); k++) {
              var ctxLine = combined[k].trim();
              if (/·\s*1st|·\s*2nd|·\s*3rd/i.test(ctxLine)) { hasContext = true; break; }
              if (/^(?:Encargado|Gerente|Director|Coordinador|Jefe|Supervisor|President|CEO|CTO|CFO|VP|Manager|Supply Chain|Sourcing|Purchasing|Procurement|Import|Export|Category|Brand|Product|Marketing|Sales)/i.test(ctxLine)) { hasContext = true; break; }
              if (/^(?:Paraguay|Brazil|Argentina|Chile|Colombia|Peru|Uruguay|Mexico|USA|United|Canada|UK|Germany|France|Spain|Italy|Portugal)/i.test(ctxLine)) { hasContext = true; break; }
              if (companySuffix.test(ctxLine)) { hasContext = true; break; }
            }
            // If context found, or we're in the first 8 lines (profile top), accept it
            if (hasContext || i < 8) return name;
          }
        }
      }
      return ctx?.contact || '';
    }

    function _findPersonTitleFromSections(hdrText, expText) {
      // Match title on a SINGLE LINE only — prevent cross-line concatenation
      var linePattern = /(?:Encargado|Gerente|Director|Coordinador|Jefe|Supervisor|Responsable|Analista|Especialista|Asistente|T[eé]cnico|Ingeniero|Abogado)\s+(?:de\s+)?[A-Za-zÀ-ÿ ,&.]{3,80}$/i;
      var engPattern = /(?:Supply Chain|Sourcing|Purchasing|Procurement|Import|Export|Category|Brand|Product|Marketing|Sales|General|Country|Regional)\s*(?:Senior\s*)?(?:Manager|Director|VP|Head|Lead|Specialist|Coordinator|Analyst|Buyer)$/i;
      var execPattern = /^(?:CEO|CTO|COO|CFO|Founder|Owner|President|Managing\s+Director|Vice\s+President)$/i;

      // Noise words to exclude from title matches
      var noiseWords = /\b(?:logo|Message|Cafepar|Feria|S\.A\.|S\.R\.L\.|Ltd\.|Inc\.|Corp\.|Paraguay|Brazil|Argentina|Contact info|Experience|Education|Universidad|University|LinkedIn|Full-time|Part-time|\d{4}|\d+\s+(?:yr|year|mo)|\\d+\\s+(?:connections?|followers?))\b/i;

      function extractFromLines(text) {
        var results = [];
        var lines = text.split(/\n/);
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line.length > 120 || line.length < 5) continue;
          // Match single-line title patterns
          if (linePattern.test(line) || engPattern.test(line) || execPattern.test(line)) {
            // Filter noise
            if (!noiseWords.test(line)) {
              results.push(line);
            }
          }
        }
        return results;
      }

      // Header titles first (highest priority), then experience
      var hdrTitles = extractFromLines(hdrText);
      var expTitles = extractFromLines(expText);
      var all = hdrTitles.concat(expTitles);

      // Prefer shorter, cleaner titles from header
      var unique = []; var seen = {};
      all.forEach(function(t) {
        t = t.trim();
        // Limit to 120 chars
        if (t.length > 120) t = t.slice(0, 117) + '...';
        var k = t.toLowerCase();
        if (!seen[k] && unique.length < 3) { seen[k] = true; unique.push(t); }
      });
      return unique.join(' / ') || (ctx?.title || '');
    }

    function _findKeySignals(text) {
      var signals = ['sourcing','supplier development','cost reduction','import operations','supply chain','procurement','quality','compliance','customs clearance','logistics','direct import','spare parts','raw material','China supplier','India supplier','vendor management','contract manufacturing','OEM','private label','brand management','category management','product development','market expansion','new product line','compras','servicios generales','depósitos','almacén','bodega','warehouse','inventory','purchasing'];
      var lower = text.toLowerCase();
      var found = signals.filter(function(s) { return lower.indexOf(s) >= 0; });
      return found.slice(0, 8).join(', ');
    }

    function _findEducation(text) {
      var lines = text.split(/\n/);
      var edu = [];
      var kw = /\b(?:universidad|university|universidade|college|school|institute|instituto|faculty|facultad|fundaci[oó]n|polytechnic)\b/i;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (kw.test(line)) {
          var m = line.match(/^([A-Za-zÀ-ÿ0-9\s&.,()-]{4,80})\s*$/);
          if (m && !/^(?:Home|My|Jobs|About|Activity|People)/i.test(m[1])) {
            if (edu.indexOf(m[1].trim()) === -1) edu.push(m[1].trim());
          }
        }
      }
      return edu.slice(0, 3);
    }

    // ===== Execute =====
    var companyList = _findCompanyFromSections(sections.header, sections.experience);
    var company = companyList.length > 0 ? companyList[0] : (ctx?.company || '');
    var pastCompanies = companyList.length > 1 ? companyList.slice(1) : [];
    var contactName = _findPersonNameFromHeader(sections.header);
    var personTitle = _findPersonTitleFromSections(sections.header, sections.experience);
    var country = _findCountry(sections.header, sections.experience) || (ctx?.country || '');
    var keySignals = _findKeySignals([sections.about, sections.experience].join('\n'));
    var educationList = _findEducation(sections.education || '');

    var extracted = {
      company: company, contact: contactName,
      email: _findEmail(inputText) || (d.to || ''),
      whatsapp: _findPhone(inputText) || '',
      website: '', linkedin: _findLinkedInUrl(inputText) || (ctx?.linkedin || ''),
      country: country, title: personTitle,
      segment: ctx?.segment || ctx?.industry || '',
      product: ctx?.product || 'CM-1700MY',
      stage: '新线索',
      source: (inputText.toLowerCase().indexOf('linkedin') >= 0) ? 'LinkedIn' : '官网询盘',
      notes: '',
    };

    var notesParts = [];
    var isLI = inputText.toLowerCase().indexOf('linkedin') >= 0;
    notesParts.push('Source: AI Email Assistant / ' + (isLI ? 'LinkedIn profile' : 'pasted material'));
    if (contactName) notesParts.push('Contact: ' + contactName);
    if (personTitle) notesParts.push('Role: ' + personTitle);
    if (company) notesParts.push('Current company: ' + company);
    if (pastCompanies.length > 0) notesParts.push('Past companies: ' + pastCompanies.join('; '));
    if (educationList.length > 0) notesParts.push('Education: ' + educationList.join('; '));
    if (country) notesParts.push('Market: ' + country);
    if (keySignals) notesParts.push('Relevant signals: ' + keySignals);
    if (country && inputText.toLowerCase().indexOf('austria') >= 0 && country.toLowerCase() !== 'austria')
      notesParts.push('Ignored address phrase containing Austria (street context).');
    notesParts.push('Original input: ' + (isLI ? 'LinkedIn profile' : 'pasted material') + ', cleaned and summarized. Full raw text not stored.');
    extracted.notes = notesParts.join('\n').slice(0, 1200);

    // ===== Display =====
    function _esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function _fieldHtml(l, v) {
      if (!v || !v.trim()) return '<div><strong>' + _esc(l) + '：</strong><span style="color:#94a3b8">未识别</span></div>';
      return '<div><strong>' + _esc(l) + '：</strong>' + _esc(v) + '</div>';
    }
    var pastStr = pastCompanies.length > 0 ? pastCompanies.join('; ') : '';
    var eduStr = educationList.length > 0 ? educationList.join('; ') : '';

    var html = '<div class="ai-result-box"><strong>🔍 提取结果</strong><div style="margin-top:8px;font-size:12px;line-height:1.8">';
    html += _fieldHtml('公司名称', extracted.company);
    html += _fieldHtml('联系人', extracted.contact);
    html += _fieldHtml('职位', extracted.title);
    html += _fieldHtml('邮箱', extracted.email);
    html += _fieldHtml('国家/市场', extracted.country);
    if (pastStr) html += _fieldHtml('过往公司', pastStr);
    if (eduStr) html += _fieldHtml('教育', eduStr);
    html += _fieldHtml('推荐产品', extracted.product);
    if (keySignals) html += _fieldHtml('客户关心点', keySignals);
    html += _fieldHtml('线索备注', extracted.notes);

    var hasAny = extracted.company || extracted.contact || extracted.email;
    if (!hasAny) html += '<div style="margin-top:8px;color:#dc2626">⚠️ 未识别到有效公司/联系人，请补充公司名、官网、LinkedIn链接或邮箱。</div>';
    html += '</div>';

    if (hasAny) {
      html += '<div style="margin-top:10px;display:flex;gap:6px">';
      html += '<button class="primary-btn" id="aiCreateLead" type="button">一键创建线索</button>';
      html += '<button class="ghost-btn" id="aiCopyExtract" type="button">复制提取结果</button>';
      html += '</div>';
    } else {
      html += '<div style="margin-top:10px;color:#94a3b8;font-size:12px">缺少关键信息（公司名称/联系人/邮箱），暂无法创建线索</div>';
    }
    html += '</div>';
    aiResult(html);

    // Create lead
    modal.querySelector('#aiCreateLead')?.addEventListener('click', function() {
      if (!confirm('确认为以下信息创建线索？\n公司：' + (extracted.company || '未知') + '\n联系人：' + (extracted.contact || '未知') + '\n邮箱：' + (extracted.email || '未知') + '\n\n创建后可到「线索」菜单查看。')) return;
      try {
        var ms = JSON.parse(localStorage.getItem('foryal-crm-module-records-v1') || '{}');
        if (!ms || typeof ms !== 'object') ms = {};
        ms.leads = Array.isArray(ms.leads) ? ms.leads : [];
        var dup = ms.leads.find(function(l) { return l.company === extracted.company && l.country === extracted.country && l.product === extracted.product; });
        if (dup) {
          if (!confirm('已存在相同公司+国家+产品的线索。是否更新？')) return;
          if (dup.notes) dup.notes = dup.notes + '\n\n---\n' + extracted.notes; else dup.notes = extracted.notes;
          dup.updatedAt = new Date().toISOString();
          localStorage.setItem('foryal-crm-module-records-v1', JSON.stringify(ms));
          document.dispatchEvent(new CustomEvent('foryal:module-records-updated', { detail: { module: 'leads' } }));
          showToast('线索已更新'); return;
        }
        ms.leads.unshift({
          id: crypto.randomUUID(), company: extracted.company || '', contact: extracted.contact || '',
          email: extracted.email || '', whatsapp: extracted.whatsapp || '', website: extracted.website || '',
          linkedin: extracted.linkedin || '', country: extracted.country || '', title: extracted.title || '',
          product: extracted.product || 'CM-1700MY', grade: '', risk: '未知', stage: '新线索',
          source: extracted.source || '官网询盘', lastFollow: '', nextDate: '', quoted: '否', sample: '否',
          blacklisted: '否', notes: extracted.notes || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        localStorage.setItem('foryal-crm-module-records-v1', JSON.stringify(ms));
        document.dispatchEvent(new CustomEvent('foryal:module-records-updated', { detail: { module: 'leads' } }));
        showToast('线索已创建');
      } catch (e) { showToast('创建线索失败'); }
    });

    // Copy
    modal.querySelector('#aiCopyExtract')?.addEventListener('click', function() {
      var lines = ['公司：'+(extracted.company||'无'),'联系人：'+(extracted.contact||'无'),'职位：'+(extracted.title||'无'),'国家：'+(extracted.country||'无'),'过往公司：'+(pastStr||'无'),'教育：'+(eduStr||'无')];
      try { var ta = document.createElement('textarea'); ta.value = lines.join('\n'); document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast('已复制'); } catch (e) {}
    });
  });


};

// Inline compose entry
window._openCompose = function(opts) {
  opts = opts || {};
  if (!mailReader) return;
  var toVal = (opts.to || '').replace(/"/g, '&quot;');
  var subjVal = (opts.subject || '').replace(/"/g, '&quot;');
  var bodyVal = (opts.body || '').replace(/"/g, '&quot;');
  // Auto-insert default signature for new compose (not draft editing)
  if (!bodyVal && !_currentDraftId) {
    var sigHtml = _getDefaultSignatureHtml();
    if (sigHtml) bodyVal = '<br><br>' + sigHtml.replace(/"/g, '&quot;');
  }
  mailReader.innerHTML =
    '<div class="mail-compose-foxmail">' +
    // Top bar
    '<div class="compose-toolbar">' +
      '<button class="ghost-btn" id="backFromComposeBtn" type="button">← 返回</button>' +
      '<span style="flex:1"></span>' +
      '<button class="ghost-btn" id="openAiModalFromComposeBtn" type="button">🤖 AI邮件助手</button>' +
      '<button class="ghost-btn" id="saveComposeDraftBtn" type="button">💾 保存草稿</button>' +
      '<button class="primary-btn" id="sendComposeMailBtn" type="button">发送</button>' +
    '</div>' +
    // Foxmail-style toolbar
    '<div class="foxmail-toolbar">' +
      // Font family dropdown
      '<div style="position:relative;display:inline-block">' +
        '<button class="ft-btn ft-menu-btn" id="ftFontMenuBtn" title="字体" style="min-width:90px">Arial ▾</button>' +
        '<div class="ft-dropdown" id="ftFontDropdown" style="display:none">' +
          '<button class="ft-drop-item ft-font-opt" data-font="Arial" style="font-family:Arial">Arial</button>' +
          '<button class="ft-drop-item ft-font-opt" data-font="Verdana" style="font-family:Verdana">Verdana</button>' +
          '<button class="ft-drop-item ft-font-opt" data-font="Times New Roman" style="font-family:Times New Roman">Times New Roman</button>' +
          '<button class="ft-drop-item ft-font-opt" data-font="Calibri" style="font-family:Calibri">Calibri</button>' +
          '<button class="ft-drop-item ft-font-opt" data-font="Microsoft YaHei" style="font-family:Microsoft YaHei">Microsoft YaHei</button>' +
          '<button class="ft-drop-item ft-font-opt" data-font="SimSun" style="font-family:SimSun">SimSun</button>' +
        '</div>' +
      '</div>' +
      // Font size dropdown
      '<div style="position:relative;display:inline-block">' +
        '<button class="ft-btn ft-menu-btn" id="ftSizeMenuBtn" title="字号" style="min-width:42px">14 ▾</button>' +
        '<div class="ft-dropdown" id="ftSizeDropdown" style="display:none">' +
          '<button class="ft-drop-item ft-size-opt" data-size="9px">9</button>' +
          '<button class="ft-drop-item ft-size-opt" data-size="10px">10</button>' +
          '<button class="ft-drop-item ft-size-opt" data-size="12px">12</button>' +
          '<button class="ft-drop-item ft-size-opt" data-size="14px">14</button>' +
          '<button class="ft-drop-item ft-size-opt" data-size="16px">16</button>' +
          '<button class="ft-drop-item ft-size-opt" data-size="18px">18</button>' +
          '<button class="ft-drop-item ft-size-opt" data-size="24px">24</button>' +
        '</div>' +
      '</div>' +
      '<span class="ft-sep"></span>' +
      // Text color button (color picker dialog built in JS)
      '<div style="position:relative;display:inline-block">' +
        '<button class="ft-btn ft-menu-btn" id="ftColorMenuBtn" title="字体颜色"><b>A</b><span style="display:inline-block;width:12px;height:3px;background:#1e293b;vertical-align:middle;margin-left:2px"></span></button>' +
      '</div>' +
      // Background color button
      '<div style="position:relative;display:inline-block">' +
        '<button class="ft-btn ft-menu-btn" id="ftBgColorMenuBtn" title="背景色"><b style="background:#fef08a;padding:0 2px">ab</b></button>' +
      '</div>' +
      '<span class="ft-sep"></span>' +
      // B/I/U/S
      '<button class="ft-btn ft-format-btn" title="加粗" data-cmd="bold"><b>B</b></button>' +
      '<button class="ft-btn ft-format-btn" title="斜体" data-cmd="italic"><i>I</i></button>' +
      '<button class="ft-btn ft-format-btn" title="下划线" data-cmd="underline"><u>U</u></button>' +
      '<button class="ft-btn ft-format-btn" title="删除线" data-cmd="strikeThrough"><s>S</s></button>' +
      '<span class="ft-sep"></span>' +
      // Lists
      '<button class="ft-btn ft-format-btn" title="无序列表" data-cmd="insertUnorderedList">•≡</button>' +
      '<button class="ft-btn ft-format-btn" title="有序列表" data-cmd="insertOrderedList">1≡</button>' +
      '<span class="ft-sep"></span>' +
      // Insert templates + attachment
      '<div style="position:relative;display:inline-block">' +
        '<button class="ft-btn" id="insertMenuBtn" title="插入资料">📎 ▾</button>' +
        '<div class="ft-dropdown" id="insertDropdown" style="display:none">' +
          '<button class="ft-drop-item insert-tpl" data-tpl="catalog">📄 产品画册</button>' +
          '<button class="ft-drop-item insert-tpl" data-tpl="quote">📋 报价单</button>' +
          '<button class="ft-drop-item insert-tpl" data-tpl="company">🏢 公司介绍</button>' +
          '<button class="ft-drop-item insert-tpl" data-tpl="sample">📦 样机政策</button>' +
          '<button class="ft-drop-item insert-tpl" data-tpl="payment">💳 付款条款</button>' +
          '<button class="ft-drop-item insert-tpl" data-tpl="delivery">🚚 交期说明</button>' +
        '</div>' +
      '</div>' +
      '<button class="ft-btn" id="composeAttachBtn" title="附件" type="button">📎 附件</button>' +
      '<input type="file" id="composeAttachmentInput" multiple hidden accept=".txt,.csv,.md,.html,.htm,.json,.xml,.rtf,.pdf,.doc,.docx,.docm,.xls,.xlsx,.xlsm,.xlsb,.ppt,.pptx,.pptm,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg" />' +
    '</div>' +
    '<div class="compose-fields">' +
      '<div class="compose-row"><label>收件人</label><input id="composeTo" placeholder="To" value="' + toVal + '" /></div>' +
      '<div class="compose-row" id="composeCcRow" style="display:none"><label>抄送</label><input id="composeCc" placeholder="Cc" /></div>' +
      '<div class="compose-row" id="composeBccRow" style="display:none"><label>密送</label><input id="composeBcc" placeholder="Bcc" /></div>' +
      '<div class="compose-row"><label>主题</label><input id="composeSubject" placeholder="Subject" value="' + subjVal + '" /></div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="ghost-btn" id="showCcBtn" type="button" style="font-size:11px">+ 抄送 Cc</button>' +
        '<button class="ghost-btn" id="showBccBtn" type="button" style="font-size:11px">+ 密送 Bcc</button>' +
      '</div>' +
    '</div>' +
    // Body
    '<div id="composeAttachmentList" class="compose-attachment-list" style="display:none"></div>' +
    // Body (contenteditable rich text)
    '<div id="composeBody" contenteditable="true" data-placeholder="邮件正文" style="flex:1;min-height:280px;margin:8px 16px;padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;line-height:1.7;outline:none;overflow-y:auto">' + bodyVal + '</div>' +
    // Bottom
    '<div class="compose-bottom-actions">' +
      '<button class="ghost-btn" id="cancelComposeBtn" type="button">取消</button>' +
      '<span style="flex:1"></span>' +
      '<button class="ghost-btn" id="bottomSaveDraftBtn" type="button">💾 保存草稿</button>' +
      '<button class="primary-btn" id="bottomSendBtn" type="button">发送</button>' +
    '</div>' +
    '</div>';

  // Events
  var evt = function(id, ev, fn) { document.querySelector(id)?.addEventListener(ev, fn); };
  evt('#backFromComposeBtn', 'click', function() { renderMail(); });
  evt('#cancelComposeBtn', 'click', function() { renderMail(); });
  evt('#saveComposeDraftBtn', 'click', _saveComposeDraft);
  evt('#bottomSaveDraftBtn', 'click', _saveComposeDraft);
  evt('#sendComposeMailBtn', 'click', _sendComposeMail);
  evt('#bottomSendBtn', 'click', _sendComposeMail);
  evt('#showCcBtn', 'click', function() { var r = document.querySelector('#composeCcRow'); if (r) r.style.display = 'flex'; });
  evt('#showBccBtn', 'click', function() { var r = document.querySelector('#composeBccRow'); if (r) r.style.display = 'flex'; });
  evt('#openAiModalFromComposeBtn', 'click', function() { window._openAiModal(); });


  // Foxmail toolbar — contenteditable rich text formatting
  var bodyEl = document.querySelector('#composeBody');
  function _getBodyEl() { return document.querySelector('#composeBody'); }
  function _focusBody() { var el = _getBodyEl(); if (el) el.focus(); }
  function _hasBodySelection() { var sel = window.getSelection(); return sel && sel.rangeCount && !sel.isCollapsed && _getBodyEl()?.contains(sel.anchorNode); }

  // Global selection tracking — save on every change inside composeBody
  var _lastComposeRange = null;
  function _saveRangeToVar() {
    var sel = window.getSelection();
    var body = _getBodyEl();
    if (!sel || !sel.rangeCount || sel.isCollapsed || !body) return;
    if (body.contains(sel.anchorNode) || body === sel.anchorNode) {
      _lastComposeRange = sel.getRangeAt(0).cloneRange();
    }
  }
  document.addEventListener('selectionchange', _saveRangeToVar);
  if (bodyEl) {
    bodyEl.addEventListener('mouseup', function() { setTimeout(_saveRangeToVar, 0); });
    bodyEl.addEventListener('keyup', function() { setTimeout(_saveRangeToVar, 0); });
  }

  // Prevent toolbar buttons from stealing focus
  document.querySelector('.foxmail-toolbar')?.addEventListener('mousedown', function(e) { e.preventDefault(); });

  // B/I/U/strikeThrough via execCommand
  ['bold','italic','underline','strikeThrough'].forEach(function(cmd) {
    document.querySelector('.ft-format-btn[data-cmd="' + cmd + '"]')?.addEventListener('click', function() {
      _focusBody();
      if (!_hasBodySelection()) { showToast('请先选中要格式化的文字'); return; }
      document.execCommand(cmd, false, null);
      _focusBody();
      setTimeout(_saveRangeToVar, 10);
    });
  });

  // Lists via execCommand
  document.querySelector('.ft-format-btn[data-cmd="insertUnorderedList"]')?.addEventListener('click', function() {
    _focusBody(); document.execCommand('insertUnorderedList', false, null); _focusBody();
  });
  document.querySelector('.ft-format-btn[data-cmd="insertOrderedList"]')?.addEventListener('click', function() {
    _focusBody(); document.execCommand('insertOrderedList', false, null); _focusBody();
  });

  // Core style applier — preserves selection after formatting
  function _applyInlineStyle(styleProp, styleVal) {
    var sel = window.getSelection();
    var body = _getBodyEl();
    if (!body) return;
    // Try to use live selection; fall back to last saved range
    var hasSel = sel && sel.rangeCount && !sel.isCollapsed && body.contains(sel.anchorNode);
    if (!hasSel && _lastComposeRange) {
      sel.removeAllRanges();
      sel.addRange(_lastComposeRange);
      hasSel = sel.rangeCount > 0 && !sel.isCollapsed;
    }
    if (!hasSel) { showToast('请先选中要格式化的文字'); return; }
    var range = sel.getRangeAt(0);
    if (range.collapsed) { showToast('请先选中要格式化的文字'); return; }

    var createdSpan = null;
    try {
      createdSpan = document.createElement('span');
      createdSpan.style.setProperty(styleProp, styleVal);
      range.surroundContents(createdSpan);
    } catch (e) {
      try {
        var frag = range.extractContents();
        createdSpan = document.createElement('span');
        createdSpan.style.setProperty(styleProp, styleVal);
        createdSpan.appendChild(frag);
        range.insertNode(createdSpan);
      } catch (e2) { showToast('无法格式化：选区跨越了不兼容的元素边界'); return; }
    }
    // CRITICAL: re-select the new span so user can chain formats
    if (createdSpan && body.contains(createdSpan)) {
      var newRange = document.createRange();
      newRange.selectNodeContents(createdSpan);
      sel.removeAllRanges();
      sel.addRange(newRange);
      _lastComposeRange = newRange.cloneRange();
    }
    _focusBody();
    // Directly update toolbar button after formatting — most reliable approach
    _updateToolbarAfterFormat(styleProp, styleVal);
  }

  // Direct toolbar update after formatting: immediate, no DOM traversal needed
  function _updateToolbarAfterFormat(prop, val) {
    if (prop === 'font-family') {
      var fb = document.querySelector('#ftFontMenuBtn');
      if (fb) fb.textContent = val + ' ▾';
    } else if (prop === 'font-size') {
      var sb = document.querySelector('#ftSizeMenuBtn');
      if (sb) sb.textContent = parseInt(val) + ' ▾';
    } else if (prop === 'color') {
      var cb = document.querySelector('#ftColorMenuBtn span');
      if (cb) cb.style.background = val;
    } else if (prop === 'background-color') {
      var bb = document.querySelector('#ftBgColorMenuBtn b');
      if (bb) bb.style.background = (val === 'transparent' ? '#fef08a' : val);
    }
  }

  // Lightweight toolbar state read from DOM (for cursor movement)
  function _updateToolbarState() {
    var body = _getBodyEl(); if (!body) return;
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    var node = sel.anchorNode;
    if (!node || !body.contains(node)) return;
    var el = node.nodeType === 3 ? node.parentElement : node;
    if (!el || el === body) return;
    var computed = getComputedStyle(el);
    var fontBtn = document.querySelector('#ftFontMenuBtn');
    if (fontBtn) {
      var ff = (computed.fontFamily || '').split(',')[0].replace(/['"]/g, '').trim();
      // Filter out UI fonts — show Arial as default
      if (!ff || ff === 'Inter' || ff === 'system-ui') ff = 'Arial';
      fontBtn.textContent = ff + ' ▾';
    }
    var sizeBtn = document.querySelector('#ftSizeMenuBtn');
    if (sizeBtn) {
      var px = parseInt(computed.fontSize || '0');
      if (px) sizeBtn.textContent = px + ' ▾';
    }
  }
  document.addEventListener('selectionchange', function() {
    var body = _getBodyEl();
    if (body && (document.activeElement === body || body.contains(document.activeElement))) {
      setTimeout(_updateToolbarState, 20);
    }
  });
  if (bodyEl) {
    bodyEl.addEventListener('keyup', function() { setTimeout(_updateToolbarState, 20); });
    bodyEl.addEventListener('mouseup', function() { setTimeout(_updateToolbarState, 20); });
    bodyEl.addEventListener('click', function() { setTimeout(_updateToolbarState, 20); });
  }
  // ---- Dropdown & popup management ----
  var _allDropdownIds = ['#ftFontDropdown','#ftSizeDropdown','#ftColorPanel','#ftBgColorPanel','#insertDropdown'];
  function _togglePanel(id) { var d = document.querySelector(id); if (d) d.style.display = d.style.display === 'block' ? 'none' : 'block'; }
  function _closeAllPanels() { _allDropdownIds.forEach(function(id) { var d = document.querySelector(id); if (d) d.style.display = 'none'; }); }
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.foxmail-toolbar')) _closeAllPanels();
  });
  // Helper: wire a menu button to toggle its panel
  function _wireMenuBtn(btnId, panelId) {
    var btn = document.querySelector(btnId);
    if (!btn) return;
    btn.addEventListener('mousedown', function(e) { e.preventDefault(); });
    btn.addEventListener('click', function(e) { e.stopPropagation(); _togglePanel(panelId); });
  }
  _wireMenuBtn('#ftFontMenuBtn', '#ftFontDropdown');
  _wireMenuBtn('#ftSizeMenuBtn', '#ftSizeDropdown');
  _wireMenuBtn('#ftColorMenuBtn', '#ftColorPanel');
  _wireMenuBtn('#ftBgColorMenuBtn', '#ftBgColorPanel');
  _wireMenuBtn('#insertMenuBtn', '#insertDropdown');

  // Wire dropdown option clicks
  function _wireOptions(selector, styleProp, dataAttr) {
    document.querySelectorAll(selector).forEach(function(btn) {
      btn.addEventListener('mousedown', function(e) { e.preventDefault(); });
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var val = btn.dataset[dataAttr];
        if (val) _applyInlineStyle(styleProp, val);
        _closeAllPanels();
      });
    });
  }
  _wireOptions('.ft-font-opt', 'font-family', 'font');
  _wireOptions('.ft-size-opt', 'font-size', 'size');

  // ===== Color Picker Dialog =====
  var _cpType = 'textColor';
  var _cpColor = '#1e293b';
  var _cpCustom = (function() { try { return JSON.parse(localStorage.getItem('foryal-custom-colors-v1') || '[]'); } catch(e) { return []; } })();
  var BASIC_COLORS = [
    '#000000','#ffffff','#7f7f7f','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff',
    '#0000ff','#ff00ff','#800000','#808000','#008000','#008080','#000080','#800080',
    '#ff9999','#ffff99','#99ff99','#99ffff','#9999ff','#ff99ff','#993300','#ff6600',
    '#99cc00','#339966','#33cccc','#3366ff','#800080','#ff0066','#666699','#969696',
    '#003366','#3399ff','#003300','#333300','#993333','#cc3300','#333399','#333333',
    '#660000','#006600','#663300','#996600','#003399','#9900cc','#cc0099','#336600'
  ];
  function _cpRgbToHex(r,g,b) { return '#' + [r,g,b].map(function(x) { var h = parseInt(x).toString(16); return h.length === 1 ? '0'+h : h; }).join(''); }
  function _cpHexToRgb(h) { h = h.replace('#',''); return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) }; }
  function _cpSaveCustom() { try { localStorage.setItem('foryal-custom-colors-v1', JSON.stringify(_cpCustom.slice(0,16))); } catch(e) {} }

  // Properly clear background-color from selection (surgical, not wrapping)
  function _clearBackground() {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) { showToast('请先选择要清除背景的文字'); return; }
    var body = _getBodyEl(); if (!body) return;
    var node = sel.anchorNode; if (!node || !body.contains(node)) return;
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== body) {
      if (el.style && el.style.backgroundColor && el.style.backgroundColor !== 'transparent' && el.style.backgroundColor !== '') {
        el.style.backgroundColor = '';
        _focusBody();
        return;
      }
      el = el.parentElement;
    }
    // If no bg found on ancestors, also check execCommand
    _focusBody();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('backColor', false, 'window');
  }

  function _openColorPicker(type) {
    _cpType = type || 'textColor';
    _closeAllPanels();
    var dlg = document.querySelector('#ftColorPickerDlg');
    if (!dlg) { dlg = document.createElement('div'); dlg.id = 'ftColorPickerDlg'; dlg.className = 'cp-dialog'; document.body.appendChild(dlg); }
    dlg.style.display = 'flex';
    _cpColor = type === 'textColor' ? '#1e293b' : '#fef08a';
    _renderColorPicker();
    dlg.onclick = function(e) { if (e.target === dlg) _closeColorPicker(); };
  }
  function _closeColorPicker() { var d = document.querySelector('#ftColorPickerDlg'); if (d) d.style.display = 'none'; _focusBody(); }
  function _setPickerColor(hex) {
    _cpColor = hex; var dlg = document.querySelector('#ftColorPickerDlg'); if (!dlg) return;
    var pv = dlg.querySelector('#cpPreview'); if (pv) pv.style.background = hex;
    var rgb = _cpHexToRgb(hex);
    ['R','G','B'].forEach(function(ch) { var inp = dlg.querySelector('#cp'+ch); if (inp && document.activeElement !== inp) inp.value = rgb[ch.toLowerCase()]; });
    dlg.querySelectorAll('.cp-basic-swatch').forEach(function(b) { b.classList.toggle('selected', b.dataset.color && b.dataset.color.toUpperCase() === hex.toUpperCase()); });
  }
  function _applyPickerColor() {
    var prop = _cpType === 'textColor' ? 'color' : 'background-color';
    _applyInlineStyle(prop, _cpColor);
    _updateToolbarAfterFormat(prop, _cpColor);
    _closeColorPicker();
  }

  function _renderColorPicker() {
    var dlg = document.querySelector('#ftColorPickerDlg'); if (!dlg) return;
    var rgb = _cpHexToRgb(_cpColor);
    dlg.innerHTML =
      '<div class="cp-card"><div class="cp-title">' + (_cpType === 'textColor' ? '文字颜色' : '背景色') + '<button id="cpCloseBtn" style="float:right;border:none;background:none;font-size:18px;cursor:pointer">&times;</button></div>' +
      '<div style="display:flex;gap:12px;padding:8px 12px">' +
      '<div>' +
        '<div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:4px">基本颜色</div>' +
        '<div class="cp-basic-grid">' + BASIC_COLORS.map(function(c) { return '<button class="cp-basic-swatch' + (c.toUpperCase() === _cpColor.toUpperCase() ? ' selected' : '') + '" style="background:' + c + '" data-color="' + c + '"></button>'; }).join('') + '</div>' +
        '<div style="font-size:11px;font-weight:600;color:#475569;margin:8px 0 4px">自定义颜色</div>' +
        '<div class="cp-custom-grid">' + Array.from({length:16}, function(_,i) { var c = _cpCustom[i] || ''; return '<button class="cp-basic-swatch" style="background:' + (c||'#fff') + '" data-cidx="' + i + '"></button>'; }).join('') + '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:180px">' +
        '<div style="width:100%;text-align:center;font-size:11px;color:#64748b">预览</div>' +
        '<div id="cpPreview" style="width:80px;height:40px;border:1px solid #d1d5db;border-radius:4px;background:' + _cpColor + '"></div>' +
        '<div style="display:flex;gap:4px;align-items:center;font-size:11px">' +
          '<span>R</span><input type="number" id="cpR" value="' + rgb.r + '" min="0" max="255" style="width:42px;padding:2px 4px;border:1px solid #d1d5db;border-radius:3px;font-size:11px">' +
          '<span>G</span><input type="number" id="cpG" value="' + rgb.g + '" min="0" max="255" style="width:42px;padding:2px 4px;border:1px solid #d1d5db;border-radius:3px;font-size:11px">' +
          '<span>B</span><input type="number" id="cpB" value="' + rgb.b + '" min="0" max="255" style="width:42px;padding:2px 4px;border:1px solid #d1d5db;border-radius:3px;font-size:11px">' +
        '</div>' +
      '</div>' +
      '</div>' +
      '<div style="border-top:1px solid #e2e8f0;padding:8px 12px;display:flex;gap:6px;align-items:center">' +
        '<button class="ghost-btn" id="cpAddCustom" style="font-size:11px">添加到自定义颜色</button>' +
        '<span style="flex:1"></span>' +
        (_cpType === 'backgroundColor' ? '<button class="ghost-btn" id="cpClearBg" style="color:#dc2626;font-size:11px">清除背景</button>' : '') +
        '<button class="ghost-btn" id="cpCancel" style="font-size:11px">取消</button>' +
        '<button class="primary-btn" id="cpOk" style="font-size:11px">确定</button>' +
      '</div></div>';

    dlg.querySelector('#cpCloseBtn').addEventListener('click', _closeColorPicker);
    dlg.querySelector('#cpCancel').addEventListener('click', _closeColorPicker);
    dlg.querySelector('#cpOk').addEventListener('click', _applyPickerColor);
    dlg.querySelector('#cpClearBg')?.addEventListener('click', function() {
      _clearBackground(); _updateToolbarAfterFormat('background-color', 'transparent'); _closeColorPicker();
    });
    dlg.querySelector('#cpAddCustom')?.addEventListener('click', function() { if (_cpCustom.length >= 16) _cpCustom.shift(); _cpCustom.push(_cpColor); _cpSaveCustom(); _renderColorPicker(); });
    dlg.querySelectorAll('.cp-basic-grid .cp-basic-swatch').forEach(function(b) { b.addEventListener('click', function() { _setPickerColor(b.dataset.color); }); });
    dlg.querySelectorAll('.cp-custom-grid .cp-basic-swatch').forEach(function(b) { b.addEventListener('click', function() { if (_cpCustom[b.dataset.cidx]) _setPickerColor(_cpCustom[b.dataset.cidx]); }); });
    ['R','G','B'].forEach(function(ch) {
      var inp = dlg.querySelector('#cp'+ch); if (!inp) return;
      inp.addEventListener('input', function() {
        var r = parseInt(dlg.querySelector('#cpR')?.value || 0), g = parseInt(dlg.querySelector('#cpG')?.value || 0), b = parseInt(dlg.querySelector('#cpB')?.value || 0);
        r = Math.max(0,Math.min(255,r)); g = Math.max(0,Math.min(255,g)); b = Math.max(0,Math.min(255,b));
        _setPickerColor(_cpRgbToHex(r,g,b));
      });
    });
  }

  // Wire color buttons
  document.querySelector('#ftColorMenuBtn')?.addEventListener('mousedown', function(e) { e.preventDefault(); });
  document.querySelector('#ftColorMenuBtn')?.addEventListener('click', function(e) { e.stopPropagation(); _openColorPicker('textColor'); });
  document.querySelector('#ftBgColorMenuBtn')?.addEventListener('mousedown', function(e) { e.preventDefault(); });
  document.querySelector('#ftBgColorMenuBtn')?.addEventListener('click', function(e) { e.stopPropagation(); _openColorPicker('backgroundColor'); });

    // Attachment handling
  window._inlineComposeAttachments = window._inlineComposeAttachments || [];
  var _composeAttachments = window._inlineComposeAttachments;
  _composeAttachments.length = 0;
  function _renderAttachmentList() {
    var listEl = document.querySelector('#composeAttachmentList');
    if (!listEl) return;
    if (!_composeAttachments.length) { listEl.style.display = 'none'; listEl.innerHTML = ''; return; }
    listEl.style.display = 'block';
    listEl.innerHTML = '<div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;padding:0 16px">📎 附件 (' + _composeAttachments.length + ')</div>' +
      _composeAttachments.map(function(file, idx) {
        return '<div class="compose-attach-item" style="display:flex;align-items:center;gap:8px;padding:6px 16px;font-size:12px;border-top:1px solid #f1f5f9">' +
          '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + file.name + '</span>' +
          '<span style="color:#94a3b8;white-space:nowrap">' + (typeof formatFileSize === 'function' ? formatFileSize(file.size) : (file.size + ' B')) + '</span>' +
          '<button class="ghost-btn" data-attach-remove="' + idx + '" style="font-size:11px;color:#dc2626;padding:2px 6px">✕</button>' +
          '</div>';
      }).join('');
    listEl.querySelectorAll('[data-attach-remove]').forEach(function(btn) {
      btn.addEventListener('click', function() { _composeAttachments.splice(parseInt(btn.dataset.attachRemove), 1); _renderAttachmentList(); });
    });
  }
  document.querySelector('#composeAttachBtn')?.addEventListener('click', function() { document.querySelector('#composeAttachmentInput')?.click(); });
  document.querySelector('#composeAttachmentInput')?.addEventListener('change', function() {
    var input = this;
    var files = Array.from(input.files || []); if (!files.length) return;
    files.forEach(function(file) {
      if (_composeAttachments.some(function(a) { return a.name === file.name && a.size === file.size; })) return;
      var reader = new FileReader();
      reader.onload = function() { _composeAttachments.push({ name: file.name, size: file.size, type: file.type, dataUrl: reader.result }); _renderAttachmentList(); };
      reader.readAsDataURL(file);
    });
    input.value = '';
  });
};

document.querySelector("#inlineComposeBtn")?.addEventListener("click", function() {
  window._openCompose({});
});

// Connect reply/forward buttons in mail reader to inline compose
document.addEventListener("click", function(e) {
  if (e.target.id === 'replyMailBtn') {
    var msg = getSelectedMail();
    if (msg) window._openCompose({ to: extractEmail(msg.from || ''), subject: 'Re: ' + (msg.subject || '') });
  }
});
document.querySelector("#deleteSelectedMailBtn")?.addEventListener("click", deleteSelectedMail);
deleteCheckedMailsBtn?.addEventListener("click", deleteSelectedMail);
selectAllVisibleMails?.addEventListener("change", toggleSelectAllVisibleMails);
toggleOldMailsBtn?.addEventListener("click", toggleOldMails);
mailSearchInput?.addEventListener("input", renderMail);
mailSortSelect?.addEventListener("change", renderMail);
document.querySelector("#refreshInboxBtn")?.addEventListener("click", refreshInbox);
document.querySelector("#composeSelectedCustomerBtn")?.addEventListener("click", composeToSelectedCustomer);
document.querySelector("#openMailAccountSettingsBtn")?.addEventListener("click", () => {
  navigateToSectionById("settingsPanel");
  setTimeout(() => navigateSettingsTab("mail"), 0);
});
document.querySelector("#openSignatureSettingsBtn")?.addEventListener("click", () => {
  navigateToSectionById("settingsPanel");
  setTimeout(() => navigateSettingsTab("signatures"), 0);
});
document.querySelector("#askAiBtn")?.addEventListener("click", askAiEmailAssistant);
document.querySelector("#applyAiDraftBtn")?.addEventListener("click", applyAiDraft);
document.querySelector("#toggleAiContextBtn")?.addEventListener("click", toggleAiContext);
document.querySelector("#toggleAiArchiveBtn")?.addEventListener("click", toggleAiArchive);
document.querySelector("#clearAiArchiveBtn")?.addEventListener("click", clearAiArchive);
document.querySelector("#refreshRemindersBtn")?.addEventListener("click", refreshReminders);
document.querySelector("#clearDeepseekKeyBtn")?.addEventListener("click", clearAiSettings);
aiSettingsForm?.addEventListener("submit", saveAiSettingsFromForm);
userSettingsForm?.addEventListener("submit", saveUserSettingsFromForm);
signatureForm?.addEventListener("submit", saveSignatureFromForm);
document.querySelectorAll("[data-nav-target]").forEach((button) => {
  button.addEventListener("click", () => navigateToSection(button));
});
document.querySelectorAll("[data-customer-scope]").forEach((button) => {
  button.addEventListener("click", () => {
    customerScopeFilter = button.dataset.customerScope || "all";
    render();
  });
});
aiContextInput?.addEventListener("input", () => updateAiContextPreview());
aiContextInput?.addEventListener("paste", () => {
  setTimeout(() => {
    updateAiContextPreview();
    if (aiContextInput.value.length > 600) collapseAiContext();
  }, 0);
});
searchInput.addEventListener("input", render);
stageFilter.addEventListener("change", render);
messageType?.addEventListener("change", renderGeneratedMessage);
mailComposeForm?.addEventListener("submit", sendComposedEmail);
mailToInput?.addEventListener("input", clearComposerCustomerIfRecipientChanged);
document.querySelector(".mail-folders")?.addEventListener("click", (event) => {
  const button = event.target.closest(".mail-folder");
  if (!button) return;
  activeMailbox = button.dataset.mailbox || "inbox";
  selectedMailId = null;
  selectedMailIds.clear();
  showOldMails = activeMailbox !== "inbox";
  renderMail();
});

customerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(customerForm).entries());
  const existing = customers.find((customer) => customer.id === selectedId);
  const customer = existing || { id: crypto.randomUUID(), followUps: [] };
  const oldNotes = String(customer.notes || "").trim();
  if (existing && currentUser?.role !== "admin" && !canCurrentUserViewCustomer(existing)) {
    showToast("普通用户只能编辑自己负责的客户");
    return;
  }
  if (!existing) formData.owner = currentUser?.name || "Lina";
  if (existing && currentUser?.role !== "admin") formData.owner = existing.owner || currentUser?.name || "Lina";
  Object.assign(customer, formData);
  customer.followUps = customer.followUps || [];
  const newNotes = String(customer.notes || "").trim();
  if (newNotes && newNotes !== oldNotes) {
    customer.notesUpdatedAt = today();
  }

  if (!existing) {
    customers.unshift(customer);
    selectedId = customer.id;
  }

  saveCustomers();
  render();
  showToast("客户已保存");
});

followForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const customer = getSelectedCustomer();
  if (!customer) {
    showToast("请先选择客户");
    return;
  }

  const record = Object.fromEntries(new FormData(followForm).entries());
  record.date = record.date || today();
  record.createdBy = currentUser?.name || "Lina";
  record.updatedBy = currentUser?.name || "Lina";
  record.stage = record.stage || customer.stage || "已联系";
  const delay = getFollowCycleDelay(record) || getFollowUpDelay(record) || getFollowReminderSuggestion(customer, record);
  record.nextDate = record.nextDate || delay.date || "";
  record.nextAction = record.nextAction || record.nextStep || delay.action || "";
  record.nextStep = record.nextAction;
  record.autoReminder = Boolean(record.nextDate);
  customer.followUps = customer.followUps || [];
  customer.followUps.unshift(record);
  customer.stage = record.stage || customer.stage;
  customer.nextDate = record.nextDate || customer.nextDate || "";
  customer.updatedAt = today();
  followForm.reset();
  fillFollowFormDates();
  saveCustomers();
  render();
  showToast("跟进记录已添加");
});

function loadCustomers() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const rows = Array.isArray(stored) && stored.length ? stored : defaultCustomers;
    return normalizeCustomerSourcesForStorage(rows, Array.isArray(stored) && stored.length);
  } catch {
    return normalizeCustomerSourcesForStorage(defaultCustomers, false);
  }
}

function normalizeCustomerSource(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const compact = raw.replace(/\s+/g, "");
  if (/legacy CRM export|legacy CRM|sourcecrm/i.test(compact)) return "社媒";
  if (/社交平台|自主开发/.test(compact) && compact.length > 8) return "社媒";
  return raw;
}

function normalizeCustomerSourcesForStorage(rows, shouldPersist = false) {
  let changed = false;
  const normalized = (Array.isArray(rows) ? rows : []).map((customer) => {
    if (!customer || typeof customer !== "object") return customer;
    const source = normalizeCustomerSource(customer.source);
    if (source && source !== customer.source) {
      changed = true;
      return { ...customer, source };
    }
    return customer;
  });
  if (changed && shouldPersist) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

function cleanupOldCustomerStorage() {
  try {
    OLD_CUSTOMER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // localStorage may be unavailable in restricted browser modes.
  }
}

function saveCustomers() {
  customers.forEach((customer) => {
    customer.source = normalizeCustomerSource(customer.source) || customer.source;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  syncSharedCustomersDebounced();
}

function loadMailState() {
  try {
    const stored = JSON.parse(localStorage.getItem(MAIL_STORE_KEY) || "null");
    return {
      inbox: Array.isArray(stored?.inbox) ? stored.inbox : [],
      sent: Array.isArray(stored?.sent) ? stored.sent : [],
      drafts: Array.isArray(stored?.drafts) ? stored.drafts : [],
      trash: Array.isArray(stored?.trash) ? stored.trash : [],
      hiddenInboxUids: Array.isArray(stored?.hiddenInboxUids) ? stored.hiddenInboxUids : [],
      lastSync: stored?.lastSync || "",
    };
  } catch {
    return { inbox: [], sent: [], drafts: [], trash: [], hiddenInboxUids: [], lastSync: "" };
  }
}

function saveMailState() {
  localStorage.setItem(MAIL_STORE_KEY, JSON.stringify(mailState));
}

function loadOutreachQueue() {
  try {
    const stored = JSON.parse(localStorage.getItem(OUTREACH_QUEUE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveOutreachQueue() {
  localStorage.setItem(OUTREACH_QUEUE_KEY, JSON.stringify(outreachQueue));
}

function loadOutreachActivityLog() {
  try {
    const stored = JSON.parse(localStorage.getItem(OUTREACH_ACTIVITY_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveOutreachActivityLog() {
  localStorage.setItem(OUTREACH_ACTIVITY_KEY, JSON.stringify(outreachActivityLog.slice(0, 1000)));
}

function loadOutreachSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(OUTREACH_SETTINGS_KEY) || "null") || {};
    return OutreachQueue.normalizeSettings ? OutreachQueue.normalizeSettings(stored) : {
      dailyLimitPerAccount: Number(stored.dailyLimitPerAccount) || 20,
      autoSendApprovedTemplates: Boolean(stored.autoSendApprovedTemplates),
      brandName: stored.brandName || "FORYAL",
      senderName: stored.senderName || "Lina Mei",
    };
  } catch {
    return { dailyLimitPerAccount: 20, autoSendApprovedTemplates: false, brandName: "FORYAL", senderName: "Lina Mei" };
  }
}

function saveOutreachSettings() {
  localStorage.setItem(OUTREACH_SETTINGS_KEY, JSON.stringify(outreachSettings));
  syncSharedOutreachSettings();
}

function getSharedCrmActor() {
  return {
    id: currentUser?.id || currentUser?.email || "crm-local-user",
    name: currentUser?.name || currentUser?.email || "CRM User",
    email: currentUser?.email || `${currentUser?.id || "crm-local-user"}@local.crm`,
    role: currentUser?.role || "user",
  };
}

function isSharedCrmEnabled() {
  return Boolean(SharedCrmStore && sharedCrmDatabaseEnabled);
}

function syncSharedCustomersDebounced() {
  if (!isSharedCrmEnabled() || sharedCrmHydrating || !SharedCrmStore.saveCustomersBulk) return;
  clearTimeout(sharedCrmSyncTimer);
  sharedCrmSyncTimer = setTimeout(() => {
    SharedCrmStore.saveCustomersBulk(customers, getSharedCrmActor()).catch((error) => {
      console.warn("Shared CRM customer sync failed", error);
    });
  }, 700);
}

function syncSharedOutreachSettings() {
  if (!isSharedCrmEnabled() || sharedCrmHydrating || !SharedCrmStore.saveOutreachSettings) return;
  SharedCrmStore.saveOutreachSettings(outreachSettings, getSharedCrmActor()).catch((error) => {
    console.warn("Shared CRM outreach settings sync failed", error);
  });
}

function replaceSharedOutreachTask(task) {
  if (!task?.id) return;
  const index = outreachQueue.findIndex((item) => item.id === task.id);
  if (index >= 0) outreachQueue[index] = { ...outreachQueue[index], ...task };
  else outreachQueue.unshift(task);
  selectedOutreachTaskId = task.id;
}

function appendSharedOutreachEvent(event) {
  if (!event?.id) return;
  if (!outreachActivityLog.some((item) => item.id === event.id)) outreachActivityLog.unshift(event);
}

function replaceSharedCustomer(customer) {
  if (!customer?.id) return;
  const index = customers.findIndex((item) => item.id === customer.id);
  if (index >= 0) customers[index] = { ...customers[index], ...customer };
  else customers.unshift(customer);
}

async function hydrateSharedCrmData() {
  if (!SharedCrmStore || sharedCrmHydrating) return;
  sharedCrmHydrating = true;
  try {
    const snapshot = await SharedCrmStore.loadSharedSnapshot(
      { customers, outreachSettings, outreachQueue, outreachActivityLog, mailState },
      getSharedCrmActor()
    );
    if (snapshot?.source === "database") {
      sharedCrmDatabaseEnabled = true;
      customers = Array.isArray(snapshot.customers) && snapshot.customers.length ? snapshot.customers : customers;
      outreachSettings = snapshot.outreachSettings || outreachSettings;
      outreachQueue = Array.isArray(snapshot.outreachQueue) ? snapshot.outreachQueue : outreachQueue;
      outreachActivityLog = Array.isArray(snapshot.outreachActivity) ? snapshot.outreachActivity : outreachActivityLog;
      selectedId = customers[0]?.id || selectedId;
      selectedOutreachTaskId = outreachQueue[0]?.id || selectedOutreachTaskId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
      localStorage.setItem(OUTREACH_SETTINGS_KEY, JSON.stringify(outreachSettings));
      localStorage.setItem(OUTREACH_QUEUE_KEY, JSON.stringify(outreachQueue));
      localStorage.setItem(OUTREACH_ACTIVITY_KEY, JSON.stringify(outreachActivityLog.slice(0, 1000)));
      render();
      if (!sharedCrmNoticeShown) {
        sharedCrmNoticeShown = true;
        showToast("已连接共享数据库");
      }
    }
  } catch (error) {
    sharedCrmDatabaseEnabled = false;
    console.warn("Shared CRM database unavailable; using localStorage fallback", error);
  } finally {
    sharedCrmHydrating = false;
  }
}

function resetFollowupDataOnce() {
  try {
    if (localStorage.getItem(FOLLOWUP_RESET_KEY) === "done") return;
    customers.forEach((customer) => {
      customer.followUps = [];
      customer.timeline = Array.isArray(customer.timeline)
        ? customer.timeline.filter((item) => !/跟进|follow/i.test(`${item.type || ""} ${item.content || ""}`))
        : [];
    });
    saveCustomers();

    const moduleStore = JSON.parse(localStorage.getItem("foryal-crm-module-records-v1") || "{}") || {};
    moduleStore.followups = [];
    localStorage.setItem("foryal-crm-module-records-v1", JSON.stringify(moduleStore));

    [
      "followups",
      "followupRecords",
      "foryal-followups",
      "foryal-followup-records",
      "activities",
      "foryal-activities",
      "coffee-machine-crm-followups-v1",
    ].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(FOLLOWUP_RESET_KEY, "done");
  } catch {
    // Ignore restricted storage modes; the app will still run with in-memory data.
  }
}

function loadAiSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(AI_SETTINGS_KEY) || "null") || {};
    return {
      provider: stored.provider || (stored.apiKey ? "deepseek" : "template"),
      apiKey: stored.apiKey || "",
      baseUrl: stored.baseUrl || DEEPSEEK_BASE_URL,
      model: stored.model || DEEPSEEK_MODEL,
    };
  } catch {
    return { provider: "template", apiKey: "", baseUrl: DEEPSEEK_BASE_URL, model: DEEPSEEK_MODEL };
  }
}

function saveAiSettingsFromForm(event) {
  event.preventDefault();
  if (!requireAdmin("只有管理员可以修改 DeepSeek API 设置")) return;
  aiSettings = {
    provider: aiProviderSelect?.value || "deepseek",
    apiKey: deepseekApiKeyInput.value.trim(),
    baseUrl: deepseekBaseUrlInput.value.trim() || DEEPSEEK_BASE_URL,
    model: deepseekModelInput.value || DEEPSEEK_MODEL,
  };
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(aiSettings));
  renderAiSettings();
  showToast("AI 设置已保存");
}

function clearAiSettings() {
  if (!requireAdmin("只有管理员可以清除 DeepSeek Key")) return;
  aiSettings = { provider: "template", apiKey: "", baseUrl: DEEPSEEK_BASE_URL, model: DEEPSEEK_MODEL };
  localStorage.removeItem(AI_SETTINGS_KEY);
  renderAiSettings();
  showToast("DeepSeek Key 已清除");
}

function renderAiSettings() {
  if (aiProviderSelect) aiProviderSelect.value = aiSettings.provider || (aiSettings.apiKey ? "deepseek" : "template");
  if (deepseekApiKeyInput) deepseekApiKeyInput.value = aiSettings.apiKey || "";
  if (deepseekBaseUrlInput) deepseekBaseUrlInput.value = aiSettings.baseUrl || DEEPSEEK_BASE_URL;
  if (deepseekModelInput) deepseekModelInput.value = aiSettings.model || DEEPSEEK_MODEL;
  const providerText = (aiSettings.provider || "template") === "template" ? "Template Only" : "DeepSeek";
  if (aiSettingsStatus) {
    aiSettingsStatus.textContent = aiSettings.apiKey
      ? `${providerText} 已保存到当前浏览器`
      : `${providerText}：未保存 API Key，将使用本地模板`;
  }
}

function loadCrmUsers() {
  const defaults = [
    { id: "user-lina", name: "Lina", email: "sales.manager@example.com", password: "", mailbox: "admin@example.com", role: "admin", disabled: false },
    { id: "user-mia", name: "Mia", email: "sales.rep@example.com", password: "", mailbox: "", role: "user", disabled: false },
  ];
  try {
    const stored = JSON.parse(localStorage.getItem(CRM_USERS_KEY) || "null");
    const rows = Array.isArray(stored) && stored.length ? stored.map(normalizeCrmUser) : defaults.map(normalizeCrmUser);
    const normalized = ensureOwnerAdminUsers(rows);
    localStorage.setItem(CRM_USERS_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const normalized = ensureOwnerAdminUsers(defaults.map(normalizeCrmUser));
    localStorage.setItem(CRM_USERS_KEY, JSON.stringify(normalized));
    return normalized;
  }
}

function normalizeCrmUser(user) {
  const email = String(user.email || "").trim().toLowerCase();
  const rawPassword = String(user.password || "").trim();
  return {
    id: user.id || crypto.randomUUID(),
    name: user.name || user.email || "User",
    email,
    password: rawPassword || "123456",
    mailbox: user.mailbox || "",
    role: OWNER_ADMIN_EMAILS.includes(email) ? "admin" : (user.role === "user" ? "user" : "admin"),
    disabled: Boolean(user.disabled),
    sessionVersion: Number(user.sessionVersion) || 1,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || user.createdAt || new Date().toISOString(),
  };
}

function saveCrmUsers() {
  // ---- Central password-change detection ----
  // Read old users from localStorage to detect password changes
  var oldUsers = [];
  try { oldUsers = JSON.parse(localStorage.getItem(CRM_USERS_KEY) || '[]'); } catch(e) {}
  var oldMap = {};
  oldUsers.forEach(function(u) { if (u.id) oldMap[u.id] = u; });

  var passwordChangedIds = [];
  crmUsers.forEach(function(user) {
    var old = oldMap[user.id];
    if (!old) return;
    // Compare password: if changed, increment sessionVersion
    var oldPw = String(old.password || '');
    var newPw = String(user.password || '');
    if (oldPw !== newPw) {
      user.sessionVersion = (Number(user.sessionVersion) || 1) + 1;
      user.passwordChangedAt = new Date().toISOString();
      passwordChangedIds.push(user.id);
    }
  });

  localStorage.setItem(CRM_USERS_KEY, JSON.stringify(crmUsers));

  // If current user's password changed, force logout immediately
  if (currentUser && passwordChangedIds.indexOf(currentUser.id) >= 0) {
    localStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    authSession = null;
    currentUser = null;
    if (loginPasswordInput) loginPasswordInput.value = '';
    if (authScreen) authScreen.hidden = false;
    if (appShell) appShell.hidden = true;
    showToast('密码已修改，请使用新密码重新登录');
  }
}

function encodeLoginInvite(user) {
  const payload = {
    name: user.name || user.email || "User",
    email: String(user.email || "").trim().toLowerCase(),
    password: String(user.password || "").trim(),
    role: user.role === "user" ? "user" : "admin",
    disabled: Boolean(user.disabled),
    createdAt: user.createdAt || new Date().toISOString(),
  };
  const json = JSON.stringify(payload);
  const binary = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeLoginInvite(token = "") {
  const padded = String(token || "").replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(String(token || "").length / 4) * 4, "=");
  const binary = atob(padded);
  const json = decodeURIComponent(Array.from(binary, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
  return JSON.parse(json);
}

function processLoginInvite() {
  try {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("invite");
    if (!token) return null;
    const payload = decodeLoginInvite(token);
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "").trim();
    if (!email || password.length < 6) return null;

    const existing = crmUsers.find((user) => String(user.email || "").trim().toLowerCase() === email);
    const user = normalizeCrmUser({
      ...(existing || {}),
      name: payload.name || existing?.name || email,
      email,
      password,
      role: payload.role === "user" ? "user" : "admin",
      disabled: Boolean(payload.disabled),
      createdAt: existing?.createdAt || payload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (existing) {
      Object.assign(existing, user);
    } else {
      crmUsers.unshift(user);
    }
    saveCrmUsers();
    url.searchParams.delete("invite");
    const clean = `${url.origin}${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", clean);
    return user;
  } catch {
    return null;
  }
}

function applyPendingLoginInvite() {
  if (!pendingInviteUser) return;
  if (loginEmailInput) loginEmailInput.value = pendingInviteUser.email || "";
  if (loginPasswordInput) loginPasswordInput.value = pendingInviteUser.password || "";
  if (loginError) loginError.textContent = "授权账号已写入当前浏览器，请直接点击登录。";
}

function loadAuthSession() {
  try {
    // Check localStorage first (rememberMe=true), then sessionStorage (rememberMe=false)
    var raw = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
    var stored = JSON.parse(raw || "null");
    if (!stored?.userId) return null;
    // Check session expiry (30 days)
    if (stored.loggedInAt) {
      var loginTime = new Date(stored.loggedInAt).getTime();
      var now = Date.now();
      var maxAge = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
      if (now - loginTime > maxAge) {
        localStorage.removeItem(AUTH_SESSION_KEY);
        sessionStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      }
    }
    var user = crmUsers.find(function(item) { return item.id === stored.userId && !item.disabled; });
    if (!user) return null;
    // Validate session version — any password change invalidates old sessions
    if (!stored.sessionVersion || stored.sessionVersion !== user.sessionVersion) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

function loadCurrentUser() {
  try {
    const session = loadAuthSession();
    const sessionUser = session?.userId ? crmUsers.find((user) => user.id === session.userId && !user.disabled) : null;
    if (sessionUser) return sessionUser;
    // CURRENT_USER_KEY is only a cache — NEVER use it as a login credential
    // Without a valid auth session, return null (login required)
    return null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  currentUser = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
}

function loadSignatures() {
  try {
    const stored = JSON.parse(localStorage.getItem(SIGNATURES_KEY) || "null");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    // Use default signatures.
  }
  return [
    {
      id: crypto.randomUUID(),
      name: "Lina 默认签名",
      userId: "user-lina",
      body: "Lina Mei\nSales Director\nDemo Export Company\nEmail: admin@example.com\nWhatsApp: +1 555 010 1000",
      isDefault: true,
    },
  ];
}

function saveSignatures() {
  localStorage.setItem(SIGNATURES_KEY, JSON.stringify(signatures));
}

function saveSignatureFromForm(event) {
  event.preventDefault();
  const userId = signatureUserInput.value || currentUser?.id || "";
  const signature = {
    id: crypto.randomUUID(),
    name: signatureNameInput.value.trim(),
    userId,
    body: signatureBodyInput.value.trim(),
    isDefault: !signatures.some((item) => item.userId === userId),
  };
  if (!signature.name || !signature.body) {
    showToast("请填写签名名称和内容");
    return;
  }
  signatures.unshift(signature);
  saveSignatures();
  signatureForm.reset();
  renderSignatureSettings();
  showToast("邮箱签名已保存");
}

function renderSignatureSettings() {
  if (!signatureUserInput || !signatureList) return;
  signatureUserInput.innerHTML = crmUsers
    .map((user) => `<option value="${escapeAttr(user.id)}" ${user.id === currentUser?.id ? "selected" : ""}>${escapeHtml(user.name)} (${escapeHtml(user.email)})</option>`)
    .join("");
  signatureList.innerHTML = signatures.map((signature) => {
    const user = crmUsers.find((item) => item.id === signature.userId);
    return `<article class="signature-card">
      <div>
        <strong>${escapeHtml(signature.name)}</strong>
        <span>${escapeHtml(user?.name || "全部用户")}${signature.isDefault ? " · 默认" : ""}</span>
      </div>
      <pre>${escapeHtml(signature.body)}</pre>
      <div class="signature-actions">
        <button class="ghost-btn" type="button" data-signature-action="default" data-signature-id="${escapeAttr(signature.id)}">设为默认</button>
        <button class="ghost-btn danger" type="button" data-signature-action="delete" data-signature-id="${escapeAttr(signature.id)}">删除</button>
      </div>
    </article>`;
  }).join("") || `<div class="empty-state">暂无签名</div>`;
  signatureList.querySelectorAll("[data-signature-action]").forEach((button) => {
    button.addEventListener("click", () => handleSignatureAction(button.dataset.signatureAction, button.dataset.signatureId));
  });
}

function handleSignatureAction(action, id) {
  const signature = signatures.find((item) => item.id === id);
  if (!signature) return;
  if (action === "default") {
    signatures.forEach((item) => {
      if (item.userId === signature.userId) item.isDefault = item.id === id;
    });
    saveSignatures();
    renderSignatureSettings();
    showToast("默认签名已更新");
    return;
  }
  if (action === "delete") {
    signatures = signatures.filter((item) => item.id !== id);
    saveSignatures();
    renderSignatureSettings();
    showToast("签名已删除");
  }
}

function handleLogin(event) {
  event.preventDefault();
  const email = String(loginEmailInput.value || "").trim().toLowerCase();
  const password = String(loginPasswordInput.value || "").trim();
  const candidates = crmUsers.filter((item) => String(item.email || "").trim().toLowerCase() === email);
  if (!candidates.length) {
    loginError.textContent = "账号不存在，请管理员在设置 → 用户管理中新增该登录邮箱。";
    return;
  }
  if (!candidates.some((item) => !item.disabled)) {
    loginError.textContent = "账号已禁用，请管理员先启用该账号。";
    return;
  }
  const user = candidates.find((item) => !item.disabled && String(item.password || "").trim() === password);
  if (!user) {
    loginError.textContent = "密码错误，请管理员在设置 → 用户管理中重置密码，或编辑用户后重新保存密码。";
    return;
  }
  var rememberMe = document.querySelector("#loginRememberMe")?.checked !== false;
  authSession = { userId: user.id, email: user.email, role: user.role, loggedInAt: new Date().toISOString(), rememberMe: rememberMe, sessionVersion: user.sessionVersion || 1 };
  // Persistent session (rememberMe=true) → localStorage; temporary → sessionStorage
  if (rememberMe) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
  } else {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
  }
  // Remember email for next visit
  if (rememberMe) {
    localStorage.setItem(LOGIN_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(LOGIN_EMAIL_KEY);
  }
  saveCurrentUser(user);
  loginError.textContent = "";
  loginPasswordInput.value = "";
  applyAuthState();
  render();
  hydrateSharedCrmData();
  document.dispatchEvent(new CustomEvent("foryal:users-updated"));
  if (/^(123456|12345678|password|admin|111111|000000)$/i.test(password)) {
    setTimeout(() => showToast("⚠️ 密码过于简单，请在设置中修改密码"), 2000);
  }
  showToast("登录成功");
}

function logoutCurrentUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  authSession = null;
  currentUser = null;
  // Auto-fill remembered email back into login form
  var savedEmail = localStorage.getItem(LOGIN_EMAIL_KEY);
  if (loginEmailInput && savedEmail) loginEmailInput.value = savedEmail;
  // Clear cached in-memory data from previous user session
  selectedId = customers[0]?.id || null;
  selectedMailId = null;
  selectedMailIds.clear();
  composeCustomerId = null;
  lastAiDraft = null;
  reminderCache = [];
  showOldMails = false;
  activeMailbox = "inbox";
  applyAuthState();
  render();
}

function applyAuthState() {
  const loggedIn = Boolean(authSession && currentUser && !currentUser.disabled);
  if (authScreen) authScreen.hidden = loggedIn;
  if (appShell) appShell.hidden = !loggedIn;
  if (currentUserChip) currentUserChip.textContent = loggedIn ? `${currentUser.name} · ${currentUser.role === "admin" ? "管理员" : "普通用户"}` : "未登录";
  document.body.classList.toggle("is-authenticated", loggedIn);
  applyPermissionState();
}

function requireAdmin(actionText = "此操作仅管理员可用") {
  if (currentUser?.role === "admin") return true;
  showToast(actionText);
  return false;
}

function applyPermissionState() {
  const isAdmin = currentUser?.role === "admin";
  document.querySelectorAll("[data-admin-only]").forEach((item) => {
    item.disabled = !isAdmin;
    item.classList.toggle("is-disabled", !isAdmin);
  });
  if (aiSettingsForm) {
    aiSettingsForm.querySelectorAll("input, select, button").forEach((item) => {
      if (["aiProviderSelect", "deepseekApiKeyInput", "deepseekBaseUrlInput", "deepseekModelInput", "clearDeepseekKeyBtn"].includes(item.id) || item.type === "submit") {
        item.disabled = !isAdmin;
      }
    });
  }
  if (userSettingsForm) userSettingsForm.querySelectorAll("input, select, button").forEach((item) => (item.disabled = !isAdmin));
}

function saveUserSettingsFromForm(event) {
  event.preventDefault();
  if (!requireAdmin("只有管理员可以添加用户")) return;
  const user = {
    id: crypto.randomUUID(),
    name: userNameInput.value.trim(),
    email: userEmailInput.value.trim().toLowerCase(),
    password: userPasswordInput.value.trim(),
    mailbox: userMailboxInput.value.trim(),
    role: userRoleInput.value,
    disabled: false,
  };
  if (!user.name || !user.email) return;
  if (user.password.length < 8) {
    showToast("初始密码至少 8 位");
    return;
  }
  if (/^(123456|12345678|password|admin|111111|000000|abcdef|abc123)$/i.test(user.password)) {
    showToast("请使用更安全的密码，避免使用常见弱密码");
    return;
  }
  if (crmUsers.some((item) => item.email === user.email)) {
    showToast("该登录邮箱已存在");
    return;
  }
  crmUsers.unshift(user);
  saveCrmUsers();
  userSettingsForm.reset();
  renderUserSettings();
  renderSignatureSettings();
  showToast("用户已添加");
}

function renderUserSettings() {
  if (!settingsUsersTable) return;
  const isAdmin = currentUser?.role === "admin";
  settingsUsersTable.innerHTML = `<table>
    <thead><tr><th>当前</th><th>姓名</th><th>登录邮箱</th><th>绑定邮箱</th><th>角色</th><th>状态</th><th>操作</th></tr></thead>
    <tbody>${crmUsers.map(renderUserRow).join("")}</tbody>
  </table>`;
  settingsUsersTable.querySelectorAll("button[data-user-action]").forEach((button) => {
    button.addEventListener("click", () => handleUserAction(button.dataset.userAction, button.dataset.userId));
  });
  settingsUsersTable.querySelectorAll("select[data-user-action='role']").forEach((select) => {
    select.addEventListener("change", () => handleUserAction("role", select.dataset.userId));
  });
  settingsUsersTable.querySelectorAll("input[data-user-action]").forEach((input) => {
    input.addEventListener("change", () => handleUserAction(input.dataset.userAction, input.dataset.userId));
  });
  if (!isAdmin) {
    settingsUsersTable.querySelectorAll("input, select, button").forEach((item) => (item.disabled = true));
  }
}

function renderUserRow(user) {
  const isCurrent = currentUser?.id === user.id;
  const disabled = currentUser?.role !== "admin" ? "disabled" : "";
  return `<tr>
    <td>${isCurrent ? "是" : "-"}</td>
    <td><input value="${escapeAttr(user.name)}" data-user-action="name" data-user-id="${escapeAttr(user.id)}" ${disabled} /></td>
    <td><input value="${escapeAttr(user.email)}" data-user-action="email" data-user-id="${escapeAttr(user.id)}" ${disabled} /></td>
    <td><input value="${escapeAttr(user.mailbox || "")}" data-user-action="mailbox" data-user-id="${escapeAttr(user.id)}" ${disabled} /></td>
    <td>
      <select data-user-action="role" data-user-id="${escapeAttr(user.id)}" ${disabled}>
        <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理员</option>
        <option value="user" ${user.role === "user" ? "selected" : ""}>普通用户</option>
      </select>
    </td>
    <td>${user.disabled ? "禁用" : "启用"}</td>
    <td class="settings-user-actions">
      <button class="ghost-btn" type="button" data-user-action="current" data-user-id="${escapeAttr(user.id)}" ${user.disabled ? "disabled" : ""}>设为当前</button>
      <button class="ghost-btn" type="button" data-user-action="reset" data-user-id="${escapeAttr(user.id)}" ${disabled}>重置密码</button>
      <button class="ghost-btn" type="button" data-user-action="toggle" data-user-id="${escapeAttr(user.id)}" ${disabled}>${user.disabled ? "启用" : "禁用"}</button>
      <button class="ghost-btn danger" type="button" data-user-action="delete" data-user-id="${escapeAttr(user.id)}" ${disabled}>删除</button>
    </td>
  </tr>`;
}

function handleUserAction(action, id) {
  const user = crmUsers.find((item) => item.id === id);
  if (!user) return;
  if (action === "current" && !user.disabled) {
    if (user.id !== currentUser?.id && !requireAdmin("只有管理员可以切换当前用户")) return;
    saveCurrentUser(user);
    authSession = { userId: user.id, loggedInAt: new Date().toISOString() };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
  } else if (action === "toggle") {
    if (!requireAdmin("只有管理员可以禁用用户")) return;
    user.disabled = !user.disabled;
    if (currentUser?.id === user.id && user.disabled) logoutCurrentUser();
    saveCrmUsers();
  } else if (action === "delete") {
    if (!requireAdmin("只有管理员可以删除用户")) return;
    if (crmUsers.length <= 1) {
      showToast("至少保留一个用户");
      return;
    }
    crmUsers = crmUsers.filter((item) => item.id !== id);
    if (currentUser?.id === id) saveCurrentUser(loadCurrentUser());
    saveCrmUsers();
  } else if (action === "role") {
    if (!requireAdmin("只有管理员可以修改角色")) return;
    const select = settingsUsersTable.querySelector(`select[data-user-id="${CSS.escape(id)}"]`);
    user.role = select?.value || user.role;
    if (currentUser?.id === id) saveCurrentUser(user);
    saveCrmUsers();
  } else if (["name", "email", "mailbox"].includes(action)) {
    if (!requireAdmin("只有管理员可以编辑用户")) return;
    const input = settingsUsersTable.querySelector(`[data-user-action="${action}"][data-user-id="${CSS.escape(id)}"]`);
    const value = input?.value?.trim() || "";
    if (action === "email") {
      const email = value.toLowerCase();
      if (!email || crmUsers.some((item) => item.id !== id && item.email === email)) {
        showToast("登录邮箱无效或重复");
        renderUserSettings();
        return;
      }
      user.email = email;
    } else {
      user[action] = value;
    }
    if (currentUser?.id === id) saveCurrentUser(user);
    saveCrmUsers();
  } else if (action === "reset") {
    if (!requireAdmin("只有管理员可以重置密码")) return;
    const next = prompt(`请输入 ${user.name} 的新密码（至少6位）`, "123456");
    if (!next) return;
    if (next.length < 6) {
      showToast("密码至少 6 位");
      return;
    }
    user.password = next;
    saveCrmUsers();
    showToast("密码已重置");
  }
  renderUserSettings();
  renderSignatureSettings();
  render();
  document.dispatchEvent(new CustomEvent("foryal:users-updated"));
  showToast("权限设置已更新");
}

function canCurrentUserViewCustomer(customer) {
  if (!currentUser || currentUser.role === "admin") return true;
  const owner = String(customer.owner || "").trim().toLowerCase();
  return owner === String(currentUser.name || "").toLowerCase() || owner === String(currentUser.email || "").toLowerCase();
}

function mergeCustomers(items) {
  const merged = new Map();

  items.forEach((customer) => {
    if (!customer?.company) return;
    const key = getCustomerKey(customer);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...customer, source: normalizeCustomerSource(customer.source), followUps: customer.followUps || [] });
      return;
    }

    [
      "contact",
      "title",
      "country",
      "segment",
      "stage",
      "priority",
      "owner",
      "website",
      "linkedin",
      "instagram",
      "facebook",
      "youtube",
      "email",
      "whatsapp",
      "source",
      "product",
      "volume",
      "paymentRisk",
      "isQuoted",
      "isSample",
      "isBlacklisted",
      "notes"
    ].forEach((field) => {
      if (!existing[field] && customer[field]) {
        existing[field] = customer[field];
      }
    });

    existing.source = combineUniqueText(normalizeCustomerSource(existing.source), normalizeCustomerSource(customer.source), " / ");
    existing.notes = combineUniqueText(existing.notes, customer.notes, " | ");
    existing.followUps = [...(existing.followUps || []), ...(customer.followUps || [])];
  });

  return Array.from(merged.values());
}

function getCustomerKey(customer) {
  const company = String(customer.company || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim();
  if (company) return `company:${company}`;

  const email = String(customer.email || "").trim().toLowerCase();
  if (email) return `email:${email}`;

  return `id:${customer.id || crypto.randomUUID()}`;
}

function combineUniqueText(first, second, separator) {
  const left = String(first || "").trim();
  const right = String(second || "").trim();
  if (!left) return right;
  if (!right || left.includes(right)) return left;
  return `${left}${separator}${right}`;
}

function today() {
  return formatDateInput(new Date());
}

function formatDateInput(date) {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
}

function getDefaultNextFollowDate() {
  const customer = getSelectedCustomer();
  return getFollowReminderSuggestion(customer || {}, { stage: customer?.stage || "首次开发" }).date;
}

function getFollowUpDelay(record) {
  const text = [record.summary, record.feedback, record.concerns, record.nextAction, record.nextStep].filter(Boolean).join(" ");
  const match = text.match(/(\d{1,3})\s*(?:天|day|days)\s*(?:后|later)?/i);
  if (!match) return null;
  const days = Number(match[1]);
  if (!Number.isFinite(days) || days <= 0) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return { days, date: formatDateInput(date), action: `${days}天后再次联系客户` };
}

function getFollowCycleDelay(record) {
  const value = record.reminderCycle;
  if (!value || value === "custom") return null;
  const days = Number(value);
  if (!Number.isFinite(days) || days <= 0) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return { days, date: formatDateInput(date), action: `${days}天后再次联系客户` };
}

function getFollowReminderSuggestion(customer = {}, record = {}) {
  const text = [
    record.stage,
    customer.stage,
    record.summary,
    record.feedback,
    record.concerns,
    record.nextAction,
    customer.notes,
  ].filter(Boolean).join(" ").toLowerCase();
  let days = 7;
  let action = "7天内再次联系客户";

  if (/报价|quote|quoted/.test(text)) {
    days = 6;
    action = "报价后5-7天跟进价格、MOQ和样品安排";
  }
  if (/样品寄出|sample sent|sample shipped/.test(text)) {
    days = 8;
    action = "样品寄出后7-10天确认收样和测试计划";
  }
  if (/样品测试|sample test|testing/.test(text)) {
    days = 10;
    action = "样品测试10天后确认测试结果和改进点";
  }
  if (/未回复|no reply|no response/.test(text)) {
    days = 7;
    action = "未回复客户7天后用短邮件或WhatsApp再次触达";
  }
  if (/沉睡|dormant|sleep/.test(text)) {
    days = 30;
    action = "沉睡客户30天后用新品或市场机会重新唤醒";
  }
  if (String(customer.priority || "").toUpperCase() === "A") {
    days = Math.min(days, 7);
    action = action.includes("7天") ? action : `${action}；A类客户必须7天内再次联系`;
  }

  const date = new Date();
  date.setDate(date.getDate() + days);
  return { days, date: formatDateInput(date), action };
}

function getSelectedCustomer() {
  return customers.find((customer) => customer.id === selectedId) || null;
}

function navigateToSection(button) {
  navigateToSectionById(button.dataset.navTarget, button);
}

function navigateToSectionById(targetName, sourceButton = null) {
  const target = document.querySelector(`#${targetName}`);
  if (!target) return;

  const sideItems = [...document.querySelectorAll(".nav-item[data-nav-target]")];
  const moduleItems = [...document.querySelectorAll(".wk-module-item[data-nav-target]")];
  const activeSide = sourceButton?.classList.contains("nav-item")
    ? sourceButton
    : sideItems.find((item) => item.dataset.navTarget === targetName);
  const activeModule = sourceButton?.classList.contains("wk-module-item")
    ? sourceButton
    : moduleItems.find((item) => item.dataset.navTarget === targetName);

  sideItems.forEach((item) => {
    item.classList.toggle("active", item === activeSide);
  });
  moduleItems.forEach((item) => {
    item.classList.toggle("active", item === activeModule);
  });

  setStandaloneSection(targetName);
  if (targetName === "outreachQueueSection") renderOutreachQueue();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setStandaloneSection(targetName) {
  document.body.classList.toggle("is-mail-view", targetName === "mailSection");
  document.querySelector("#moduleWorkbench")?.setAttribute("hidden", "");
  ["customerSection", "mailSection", "outreachQueueSection", "settingsPanel", "reminderPanel"].forEach((id) => {
    document.querySelector(`#${id}`)?.classList.toggle("is-page-hidden", id !== targetName);
  });
  document.querySelector(".bottom-grid")?.classList.add("is-page-hidden");
}

function getFilteredCustomers() {
  const keyword = searchInput.value.trim().toLowerCase();
  const stage = stageFilter.value;

  return customers.filter((customer) => {
    if (!canCurrentUserViewCustomer(customer)) return false;
    const text = [
      customer.company,
      customer.contact,
      customer.country,
      customer.segment,
      customer.product,
      customer.website,
      customer.instagram,
      customer.facebook,
      customer.youtube,
      customer.paymentRisk,
      customer.isQuoted,
      customer.isSample,
      customer.isBlacklisted,
      customer.email,
      customer.whatsapp
    ]
      .join(" ")
      .toLowerCase();
    const matchKeyword = !keyword || text.includes(keyword);
    const matchStage = stage === "all" || customer.stage === stage;
    const matchScope =
      customerScopeFilter === "all" ||
      (customerScopeFilter === "hot" && customer.priority === "A") ||
      (customerScopeFilter === "due" && isCustomerDue(customer)) ||
      (customerScopeFilter === "won" && customer.stage === "已成交");
    return matchKeyword && matchStage && matchScope;
  });
}

function isCustomerCRMActive() {
  const section = document.querySelector("#customerSection");
  return section && section.classList.contains("foryal-customer-section");
}

function render() {
  if (!isCustomerCRMActive()) {
    renderStats();
    renderCustomerScopeBar();
    renderPipeline();
    renderCustomerList();
    renderDetail();
    renderTimeline();
    renderGeneratedMessage();
  }
  renderMail();
  renderOutreachQueue();
  renderReminders();
  renderAiSettings();
  renderUserSettings();
  renderSignatureSettings();
  applyAuthState();
  updateAiContextPreview();
}

function getOutreachStatusLabel(status) {
  return OutreachQueue.STATUS_LABELS?.[status] || status || "-";
}

function getOutreachStatusKeys() {
  const status = OutreachQueue.STATUS || {};
  return [
    status.TO_GENERATE || "to_generate",
    status.PENDING_REVIEW || "pending_review",
    status.APPROVED || "approved",
    status.SCHEDULED || "scheduled",
    status.SENT || "sent",
    status.FAILED || "failed",
    status.STOPPED || "stopped",
  ];
}

function getOutreachActivityLabel(type) {
  const labels = {
    draft_generated: "已生成草稿",
    approved_scheduled: "已批准并排期",
    rejected: "已拒绝",
    stopped: "已停止",
    mock_sent: "模拟发送",
    failed: "发送失败",
    edited: "已编辑",
    marked_dne: "已标记禁止发送",
    marked_unsubscribe: "已标记退订",
    marked_bounce: "已标记退信",
    marked_replied: "已标记已回复",
  };
  return labels[type] || "操作记录";
}

function getOutreachActionLabel(action) {
  const labels = {
    dne: "禁止发送",
    unsubscribe: "退订",
    bounce: "退信",
    replied: "已回复",
  };
  return labels[action] || action || "合规标记";
}

function getOutreachContext(manualSelected = false) {
  return {
    queue: outreachQueue,
    activityLog: outreachActivityLog,
    mailState,
    now: new Date(),
    manualSelected,
  };
}

function isOutreachCustomerVisible(customer) {
  return customer && canCurrentUserViewCustomer(customer);
}

function getOutreachEligibility(customer, manualSelected = false) {
  if (!OutreachQueue.getEligibility) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer.email || "").trim());
    return emailOk ? { eligible: true, reason: "可开发" } : { eligible: false, reason: "邮箱无效或缺失" };
  }
  return OutreachQueue.getEligibility(customer, getOutreachContext(manualSelected));
}

function getOutreachCustomer(task = {}) {
  return customers.find((customer) => customer.id === task.customerId) ||
    customers.find((customer) => String(customer.email || "").trim().toLowerCase() === String(task.email || "").trim().toLowerCase()) ||
    null;
}

function getOutreachCustomerLastContact(customer) {
  if (!customer) return null;
  if (OutreachQueue.getLastContactAt) return OutreachQueue.getLastContactAt(customer, mailState);
  return null;
}

function isHiddenFromOutreachCandidates(customer = {}) {
  return Boolean(
    customer.doNotEmail ||
    customer.unsubscribed ||
    customer.unsubscribe ||
    customer.emailBounced ||
    customer.bounced ||
    customer.bounce ||
    customer.outreachReplied ||
    customer.replied ||
    customer.stopOutreach
  );
}

function formatOutreachCandidateProduct(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const normalized = raw.toLowerCase();
  const translations = {
    "private label project": "私标项目",
    "private label": "私标客户",
    "oem / private label": "OEM / 私标",
    "oem/private label": "OEM / 私标",
    "premium chain": "高端连锁",
    "high-end chain": "高端连锁",
    "price sensitive importer": "价格敏感型进口商",
    "price-sensitive importer": "价格敏感型进口商",
    "built-in grinder espresso machine": "内置研磨意式咖啡机",
    "milk tank model": "奶箱机型",
  };
  return translations[normalized] || raw;
}

function getOutreachCandidateProduct(customer = {}) {
  if (OutreachQueue.getOutreachProductPreference) {
    const product = OutreachQueue.getOutreachProductPreference(customer);
    if (product) return product;
  }
  return customer.product || "";
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function formatOutreachDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", { hour12: false });
}

function saveOutreachSettingsFromForm() {
  const next = {
    ...outreachSettings,
    brandName: outreachBrandSender?.value || "FORYAL",
    dailyLimitPerAccount: Number(outreachDailyLimit?.value || 20),
    autoSendApprovedTemplates: Boolean(outreachAutoSend?.checked),
  };
  outreachSettings = OutreachQueue.normalizeSettings ? OutreachQueue.normalizeSettings(next) : next;
  saveOutreachSettings();
  renderOutreachQueue();
  showToast("开发信设置已保存");
}

function refreshOutreachSettingsForm() {
  if (outreachBrandSender) outreachBrandSender.value = outreachSettings.brandName || "FORYAL";
  if (outreachDailyLimit) outreachDailyLimit.value = outreachSettings.dailyLimitPerAccount || 20;
  if (outreachAutoSend) outreachAutoSend.checked = Boolean(outreachSettings.autoSendApprovedTemplates);
}

function getFilteredOutreachCustomers() {
  const keyword = String(outreachSearchInput?.value || "").trim().toLowerCase();
  return customers
    .filter(isOutreachCustomerVisible)
    .filter((customer) => {
      if (!keyword) return true;
      return [
        customer.company,
        customer.email,
        customer.country,
        customer.priority,
        customer.grade,
        customer.product,
        customer.segment,
      ].join(" ").toLowerCase().includes(keyword);
    })
    .slice(0, 120);
}

function renderOutreachQueue() {
  if (!outreachSection) return;
  refreshOutreachComplianceFlags(true);
  refreshOutreachSettingsForm();
  renderOutreachSummary();
  renderOutreachEligibleCustomers();
  renderOutreachTasks();
  renderOutreachTaskDetail();
  renderOutreachActivityLog();
}

function renderOutreachSummary() {
  if (!outreachSummary) return;
  const counts = Object.fromEntries(getOutreachStatusKeys().map((key) => [key, 0]));
  outreachQueue.forEach((task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
  });
  outreachSummary.innerHTML = getOutreachStatusKeys().map((status) => `
    <div class="outreach-stat">
      <span>${escapeHtml(getOutreachStatusLabel(status))}</span>
      <strong>${counts[status] || 0}</strong>
    </div>
  `).join("");
}

function renderOutreachEligibleCustomers() {
  if (!outreachEligibleList) return;
  const rows = getFilteredOutreachCustomers()
    .filter((customer) => !isHiddenFromOutreachCandidates(customer))
    .map((customer) => {
      const manualSelected = manualOutreachCustomerIds.has(customer.id);
      const eligibility = getOutreachEligibility(customer, manualSelected);
      const lastContact = getOutreachCustomerLastContact(customer);
      return { customer, manualSelected, eligibility, lastContact };
    });
  const eligibleCount = rows.filter((row) => row.eligibility.eligible).length;
  if (outreachEligibleCount) outreachEligibleCount.textContent = `${eligibleCount} 个可开发`;
  if (!rows.length) {
    outreachEligibleList.innerHTML = `<div class="empty-state compact">没有匹配当前搜索的客户。</div>`;
    return;
  }
  outreachEligibleList.innerHTML = rows.map(({ customer, manualSelected, eligibility, lastContact }) => {
    const eligibleClass = eligibility.eligible ? "eligible" : "blocked";
    return `<article class="outreach-candidate ${eligibleClass}">
      <label class="outreach-candidate-check">
        <input type="checkbox" data-outreach-select="${escapeAttr(customer.id)}" ${manualSelected ? "checked" : ""} />
        <span></span>
      </label>
      <div class="outreach-candidate-main">
        <strong>${escapeHtml(customer.company || "未命名客户")}</strong>
        <span>${escapeHtml(customer.email || "-")} · ${escapeHtml(customer.country || "-")} · ${escapeHtml(customer.priority || customer.grade || "-")} · ${escapeHtml(formatOutreachCandidateProduct(getOutreachCandidateProduct(customer)))}</span>
        <em>${escapeHtml(eligibility.reason)}${lastContact ? ` · 最后联系 ${escapeHtml(formatOutreachDateTime(lastContact))}` : ""}</em>
      </div>
      <div class="outreach-candidate-actions">
        <button class="ghost-btn" type="button" data-outreach-customer-action="generate" data-customer-id="${escapeAttr(customer.id)}">生成开发信</button>
        <button class="ghost-btn" type="button" data-outreach-customer-action="dne" data-customer-id="${escapeAttr(customer.id)}">禁止发送</button>
        <button class="ghost-btn" type="button" data-outreach-customer-action="unsubscribe" data-customer-id="${escapeAttr(customer.id)}">退订</button>
      </div>
    </article>`;
  }).join("");
}

function renderOutreachTasks() {
  if (!outreachQueueTable) return;
  const statusFilter = outreachStatusFilter?.value || "all";
  const keyword = String(outreachSearchInput?.value || "").trim().toLowerCase();
  const rows = outreachQueue.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (!keyword) return true;
    return [
      task.company,
      task.email,
      task.country,
      task.grade,
      task.recommendedProduct,
      task.subject,
      task.status,
    ].join(" ").toLowerCase().includes(keyword);
  });
  if (!rows.length) {
    outreachQueueTable.innerHTML = `<tbody><tr><td><div class="empty-state compact">暂无开发信任务。</div></td></tr></tbody>`;
    return;
  }
  outreachQueueTable.innerHTML = `<thead>
    <tr>
      <th>客户名称</th>
      <th>邮箱</th>
      <th>国家</th>
      <th>客户等级</th>
      <th>推荐产品</th>
      <th>邮件主题</th>
      <th>状态</th>
      <th>计划发送时间</th>
      <th>最后联系时间</th>
      <th>操作</th>
    </tr>
  </thead>
  <tbody>${rows.map((task) => {
    const customer = getOutreachCustomer(task);
    const lastContact = task.lastContactAt || getOutreachCustomerLastContact(customer);
    return `<tr class="${task.id === selectedOutreachTaskId ? "active" : ""}">
      <td><button class="link-button" type="button" data-outreach-action="view" data-task-id="${escapeAttr(task.id)}">${escapeHtml(task.company || "-")}</button></td>
      <td>${escapeHtml(task.email || "-")}</td>
      <td>${escapeHtml(task.country || "-")}</td>
      <td>${escapeHtml(task.grade || "-")}</td>
      <td>${escapeHtml(task.recommendedProduct || "-")}</td>
      <td>${escapeHtml(task.subject || "-")}</td>
      <td><span class="outreach-status outreach-status-${escapeAttr(task.status || "unknown")}">${escapeHtml(getOutreachStatusLabel(task.status))}</span></td>
      <td>${escapeHtml(formatOutreachDateTime(task.scheduledAt))}</td>
      <td>${escapeHtml(formatOutreachDateTime(lastContact))}</td>
      <td class="outreach-row-actions">
        <button class="ghost-btn" type="button" data-outreach-action="view" data-task-id="${escapeAttr(task.id)}">查看邮件</button>
        <button class="ghost-btn" type="button" data-outreach-action="approve" data-task-id="${escapeAttr(task.id)}">批准</button>
        <button class="ghost-btn" type="button" data-outreach-action="edit" data-task-id="${escapeAttr(task.id)}">编辑</button>
        <button class="ghost-btn" type="button" data-outreach-action="send-now" data-task-id="${escapeAttr(task.id)}">立即发送</button>
        <button class="ghost-btn danger" type="button" data-outreach-action="reject" data-task-id="${escapeAttr(task.id)}">拒绝</button>
        <button class="ghost-btn danger" type="button" data-outreach-action="stop" data-task-id="${escapeAttr(task.id)}">停止跟进</button>
      </td>
    </tr>`;
  }).join("")}</tbody>`;
}

function renderOutreachTaskDetail() {
  if (!outreachTaskDetail) return;
  const task = outreachQueue.find((item) => item.id === selectedOutreachTaskId) || outreachQueue[0] || null;
  if (!task) {
    outreachTaskDetail.innerHTML = `<div class="empty-state compact">请选择或生成一个开发信任务，用于审核纯文本邮件。</div>`;
    return;
  }
  selectedOutreachTaskId = task.id;
  outreachTaskDetail.innerHTML = `<div class="outreach-card-head">
    <div>
      <p class="eyebrow">邮件审核</p>
      <h4>${escapeHtml(task.company || "开发信任务")}</h4>
    </div>
    <span class="outreach-status outreach-status-${escapeAttr(task.status || "unknown")}">${escapeHtml(getOutreachStatusLabel(task.status))}</span>
  </div>
  <div class="outreach-detail-form">
    <label>邮件主题
      <input id="outreachDetailSubject" value="${escapeAttr(task.subject || "")}" />
    </label>
    <label>计划发送时间
      <input id="outreachDetailSchedule" type="datetime-local" value="${escapeAttr(toDateTimeLocal(task.scheduledAt))}" />
    </label>
    <label>邮件正文
      <textarea id="outreachDetailBody" rows="14">${escapeHtml(task.body || "")}</textarea>
    </label>
    <div class="outreach-detail-actions">
      <button class="primary-btn" type="button" data-outreach-detail-action="save" data-task-id="${escapeAttr(task.id)}">保存修改</button>
      <button class="ghost-btn" type="button" data-outreach-detail-action="copy" data-task-id="${escapeAttr(task.id)}">复制正文</button>
      <button class="ghost-btn" type="button" data-outreach-detail-action="mark-replied" data-task-id="${escapeAttr(task.id)}">标记已回复</button>
      <button class="ghost-btn danger" type="button" data-outreach-detail-action="mark-bounce" data-task-id="${escapeAttr(task.id)}">标记退信</button>
    </div>
  </div>`;
}

function renderOutreachActivityLog() {
  if (!outreachActivityLogEl) return;
  const rows = outreachActivityLog.slice(0, 80);
  if (!rows.length) {
    outreachActivityLogEl.innerHTML = `<div class="empty-state compact">暂无开发信操作记录。</div>`;
    return;
  }
  outreachActivityLogEl.innerHTML = rows.map((event) => `<article class="outreach-activity-item">
    <strong>${escapeHtml(getOutreachActivityLabel(event.type))}</strong>
    <span>${escapeHtml(event.company || "-")} · ${escapeHtml(event.email || "-")} · ${escapeHtml(formatOutreachDateTime(event.at))}</span>
    <p>${escapeHtml(event.note || event.subject || "")}</p>
  </article>`).join("");
}

function handleOutreachEligibleChange(event) {
  const checkbox = event.target.closest("[data-outreach-select]");
  if (!checkbox) return;
  const id = checkbox.dataset.outreachSelect;
  if (checkbox.checked) manualOutreachCustomerIds.add(id);
  else manualOutreachCustomerIds.delete(id);
  renderOutreachQueue();
}

function handleOutreachEligibleAction(event) {
  const button = event.target.closest("[data-outreach-customer-action]");
  if (!button) return;
  const customerId = button.dataset.customerId;
  const action = button.dataset.outreachCustomerAction;
  if (action === "generate") {
    manualOutreachCustomerIds.add(customerId);
    generateOutreachTasksForCustomers([customerId]);
    return;
  }
  markOutreachCustomerFlag(customerId, action);
}

function handleOutreachTaskAction(event) {
  const button = event.target.closest("[data-outreach-action]");
  if (!button) return;
  const task = outreachQueue.find((item) => item.id === button.dataset.taskId);
  if (!task) return;
  const action = button.dataset.outreachAction;
  selectedOutreachTaskId = task.id;
  if (action === "view" || action === "edit") {
    renderOutreachQueue();
    document.querySelector("#outreachTaskDetail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  if (action === "approve") approveOutreachTask(task);
  if (action === "reject") rejectOutreachTask(task);
  if (action === "send-now") sendOutreachTaskNow(task);
  if (action === "stop") stopOutreachTask(task, true);
}

function handleOutreachDetailAction(event) {
  const button = event.target.closest("[data-outreach-detail-action]");
  if (!button) return;
  const task = outreachQueue.find((item) => item.id === button.dataset.taskId);
  if (!task) return;
  const action = button.dataset.outreachDetailAction;
  if (action === "save") saveOutreachTaskDetail(task);
  if (action === "copy") copyOutreachTaskBody(task);
  if (action === "mark-replied") markOutreachCustomerFlag(task.customerId, "replied", task);
  if (action === "mark-bounce") markOutreachCustomerFlag(task.customerId, "bounce", task);
}

async function generateSelectedOutreachTasks() {
  const checked = [...document.querySelectorAll("[data-outreach-select]:checked")].map((item) => item.dataset.outreachSelect);
  const ids = checked.length ? checked : (selectedId ? [selectedId] : []);
  if (!ids.length) {
    showToast("请至少选择一个客户");
    return;
  }
  ids.forEach((id) => manualOutreachCustomerIds.add(id));
  await generateOutreachTasksForCustomers(ids);
}

async function generateOutreachTasksForCustomers(ids = []) {
  if (isSharedCrmEnabled() && SharedCrmStore.createOutreachTask) {
    await generateSharedOutreachTasksForCustomers(ids);
    return;
  }
  const uniqueIds = Array.from(new Set(ids));
  const senderEmail = getDefaultSenderEmail();
  const created = [];
  const skipped = [];
  uniqueIds.forEach((id) => {
    const customer = customers.find((item) => item.id === id);
    if (!customer) return;
    const eligibility = getOutreachEligibility(customer, manualOutreachCustomerIds.has(id));
    if (!eligibility.eligible) {
      skipped.push(`${customer.company || customer.email}: ${eligibility.reason}`);
      return;
    }
    const task = OutreachQueue.createTask(customer, {
      queue: outreachQueue,
      settings: outreachSettings,
      senderEmail,
      lastContactAt: getOutreachCustomerLastContact(customer),
    });
    outreachQueue.unshift(task);
    created.push(task);
    recordOutreachActivity("draft_generated", task, customer, "已生成纯文本草稿，等待人工审核");
  });
  if (created.length) {
    selectedOutreachTaskId = created[0].id;
    saveOutreachQueue();
    saveOutreachActivityLog();
  }
  renderOutreachQueue();
  const message = created.length ? `已生成 ${created.length} 个开发信任务` : "未生成开发信任务";
  showToast(skipped.length ? `${message}，已跳过 ${skipped.length} 个` : message);
}

async function generateSharedOutreachTasksForCustomers(ids = []) {
  const uniqueIds = Array.from(new Set(ids));
  const senderEmail = getDefaultSenderEmail();
  const created = [];
  const skipped = [];
  for (const id of uniqueIds) {
    const customer = customers.find((item) => item.id === id);
    if (!customer) continue;
    try {
      const result = await SharedCrmStore.createOutreachTask({
        customerId: id,
        customer,
        settings: outreachSettings,
        senderEmail,
        lastContactAt: getOutreachCustomerLastContact(customer),
        manualSelected: manualOutreachCustomerIds.has(id),
      }, getSharedCrmActor());
      replaceSharedOutreachTask(result.task);
      appendSharedOutreachEvent(result.outreachEvent);
      created.push(result.task);
    } catch (error) {
      skipped.push(`${customer.company || customer.email}: ${error.message || error.code || "skipped"}`);
    }
  }
  if (created.length) {
    saveOutreachQueue();
    saveOutreachActivityLog();
  }
  renderOutreachQueue();
  const message = created.length ? `已生成 ${created.length} 个开发信任务` : "未生成开发信任务";
  showToast(skipped.length ? `${message}，已跳过 ${skipped.length} 个` : message);
}

async function approveOutreachTask(task) {
  if (isSharedCrmEnabled() && SharedCrmStore.approveOutreachTask) {
    try {
      const result = await SharedCrmStore.approveOutreachTask(task.id, getSharedCrmActor());
      replaceSharedOutreachTask(result.task);
      appendSharedOutreachEvent(result.outreachEvent);
      saveOutreachQueue();
      saveOutreachActivityLog();
      renderOutreachQueue();
      showToast("任务已批准并进入待发送");
    } catch (error) {
      showToast(error.message || "任务批准失败");
    }
    return;
  }
  const status = OutreachQueue.STATUS || {};
  if (task.status !== (status.PENDING_REVIEW || "pending_review") && task.status !== (status.APPROVED || "approved")) {
    showToast("只有待审核或已批准任务可以排期");
    return;
  }
  task.status = status.SCHEDULED || "scheduled";
  task.approvedAt = new Date().toISOString();
  task.updatedAt = task.approvedAt;
  if (!task.scheduledAt && OutreachQueue.findNextScheduleAt) {
    task.scheduledAt = OutreachQueue.findNextScheduleAt(outreachQueue, task.senderEmail || getDefaultSenderEmail(), outreachSettings).toISOString();
  }
  recordOutreachActivity("approved_scheduled", task, getOutreachCustomer(task), "已人工批准并进入待发送");
  saveOutreachQueue();
  saveOutreachActivityLog();
  renderOutreachQueue();
  showToast("任务已批准并进入待发送");
}

async function rejectOutreachTask(task) {
  if (isSharedCrmEnabled() && SharedCrmStore.updateOutreachTask) {
    try {
      const result = await SharedCrmStore.updateOutreachTask(task.id, { status: "stopped", stopReason: "审核拒绝" }, getSharedCrmActor());
      replaceSharedOutreachTask(result.task);
      appendSharedOutreachEvent(result.outreachEvent);
      saveOutreachQueue();
      saveOutreachActivityLog();
      renderOutreachQueue();
      showToast("任务已拒绝");
    } catch (error) {
      showToast(error.message || "任务拒绝失败");
    }
    return;
  }
  task.status = OutreachQueue.STATUS?.STOPPED || "stopped";
  task.rejectedAt = new Date().toISOString();
  task.stopReason = "审核时已拒绝";
  task.updatedAt = task.rejectedAt;
  recordOutreachActivity("rejected", task, getOutreachCustomer(task), "人工审核时已拒绝");
  saveOutreachQueue();
  saveOutreachActivityLog();
  renderOutreachQueue();
  showToast("任务已拒绝");
}

async function stopOutreachTask(task, stopCustomer = false) {
  const customer = getOutreachCustomer(task);
  if (isSharedCrmEnabled() && SharedCrmStore.updateOutreachTask) {
    if (stopCustomer && customer) {
      await markOutreachCustomerFlag(customer.id, "stop", task);
      return;
    }
    try {
      const result = await SharedCrmStore.updateOutreachTask(task.id, { status: "stopped", stopReason: task.stopReason || "停止跟进" }, getSharedCrmActor());
      replaceSharedOutreachTask(result.task);
      appendSharedOutreachEvent(result.outreachEvent);
      saveOutreachQueue();
      saveOutreachActivityLog();
      renderOutreachQueue();
      showToast("开发信跟进已停止");
    } catch (error) {
      showToast(error.message || "停止跟进失败");
    }
    return;
  }
  task.status = OutreachQueue.STATUS?.STOPPED || "stopped";
  task.stoppedAt = new Date().toISOString();
  task.stopReason = stopCustomer ? "已选择停止跟进" : task.stopReason || "已停止";
  task.updatedAt = task.stoppedAt;
  if (stopCustomer && customer) {
    customer.stopOutreach = true;
    customer.outreachStoppedAt = task.stoppedAt;
    customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
    customer.timeline.unshift({ id: crypto.randomUUID(), date: today(), type: "开发信", content: "自动开发信跟进已停止" });
    saveCustomers();
  }
  recordOutreachActivity("stopped", task, customer, task.stopReason);
  saveOutreachQueue();
  saveOutreachActivityLog();
  renderOutreachQueue();
  showToast("开发信跟进已停止");
}

async function sendOutreachTaskNow(task) {
  if (isSharedCrmEnabled() && SharedCrmStore.mockSendOutreachTask) {
    try {
      const result = await SharedCrmStore.mockSendOutreachTask(task.id, getSharedCrmActor());
      replaceSharedOutreachTask(result.task);
      if (result.customer) replaceSharedCustomer(result.customer);
      appendSharedOutreachEvent(result.outreachEvent);
      saveOutreachQueue();
      saveOutreachActivityLog();
      saveCustomers();
      renderOutreachQueue();
      renderMail();
      showToast("模拟发送已记录");
    } catch (error) {
      showToast(error.message || "模拟发送失败");
    }
    return;
  }
  const allowedStatuses = [OutreachQueue.STATUS?.APPROVED || "approved", OutreachQueue.STATUS?.SCHEDULED || "scheduled"];
  if (!allowedStatuses.includes(task.status)) {
    showToast("请先批准任务再发送");
    return;
  }
  const customer = getOutreachCustomer(task);
  if (!task.email || !task.subject || !task.body) {
    markOutreachTaskFailed(task, customer, "客户邮箱、邮件主题或正文缺失");
    return;
  }
  const now = new Date().toISOString();
  task.status = OutreachQueue.STATUS?.SENT || "sent";
  task.sentAt = now;
  task.updatedAt = now;
  task.mockProvider = "local-mock-email-provider";
  mailState.sent = Array.isArray(mailState.sent) ? mailState.sent : [];
  mailState.sent.unshift({
    id: crypto.randomUUID(),
    mailbox: "sent",
    direction: "outbound",
    from: task.senderEmail || getDefaultSenderEmail(),
    to: task.email,
    cc: "",
    bcc: "",
    subject: task.subject,
    body: task.body,
    bodyHtml: "",
    snippet: String(task.body || "").replace(/\s+/g, " ").slice(0, 180),
    date: now,
    customerId: customer?.id || task.customerId || "",
    company: task.company || customer?.company || "",
    country: task.country || customer?.country || "",
    createdBy: currentUser?.name || "Lina",
    isRealSent: false,
    messageId: "",
    transport: "mock",
    status: "模拟发送 - 未真实投递",
    outreachTaskId: task.id,
    followStatus: "开发信队列模拟发送",
    attachments: [],
  });
  saveMailState();
  if (customer) {
    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + (Number(task.followupDelayDays) || 7));
    customer.followUps = Array.isArray(customer.followUps) ? customer.followUps : [];
    customer.followUps.unshift({
      id: crypto.randomUUID(),
      date: today(),
      contact: customer.contact || "",
      channel: "邮件",
      followType: "开发信队列",
      summary: `模拟发送开发信：${task.subject}`,
      feedback: "",
      concerns: "",
      stage: customer.stage || "",
      nextAction: "等待客户回复；如客户回复、退订或退信，停止自动跟进",
      nextStep: "等待客户回复；如客户回复、退订或退信，停止自动跟进",
      nextDate: formatDateInput(followupDate),
      result: "模拟发送",
      createdBy: currentUser?.name || "Lina",
      updatedBy: currentUser?.name || "Lina",
    });
    customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
    customer.timeline.unshift({ id: crypto.randomUUID(), date: today(), type: "开发信", content: `模拟发送开发信：${task.subject}` });
    customer.lastOutreachAt = now;
    customer.updatedAt = today();
    saveCustomers();
  }
  recordOutreachActivity("mock_sent", task, customer, "模拟邮件服务已记录发送，没有真实投递");
  saveOutreachQueue();
  saveOutreachActivityLog();
  renderOutreachQueue();
  renderMail();
  showToast("模拟发送已记录");
}

function markOutreachTaskFailed(task, customer = null, reason = "模拟发送失败") {
  const now = new Date().toISOString();
  task.status = OutreachQueue.STATUS?.FAILED || "failed";
  task.failedAt = now;
  task.failureReason = reason;
  task.updatedAt = now;
  recordOutreachActivity("failed", task, customer, `发送失败：${reason}`);
  saveOutreachQueue();
  saveOutreachActivityLog();
  renderOutreachQueue();
  showToast(`发送失败：${reason}`);
}

async function saveOutreachTaskDetail(task) {
  const subject = document.querySelector("#outreachDetailSubject")?.value || "";
  const body = document.querySelector("#outreachDetailBody")?.value || "";
  const scheduledAt = fromDateTimeLocal(document.querySelector("#outreachDetailSchedule")?.value || "");
  if (isSharedCrmEnabled() && SharedCrmStore.updateOutreachTask) {
    try {
      const result = await SharedCrmStore.updateOutreachTask(task.id, {
        subject: subject.trim() || task.subject,
        body: OutreachQueue.sanitizePlainText ? OutreachQueue.sanitizePlainText(body) : body.trim(),
        scheduledAt: scheduledAt || task.scheduledAt || "",
      }, getSharedCrmActor());
      replaceSharedOutreachTask(result.task);
      appendSharedOutreachEvent(result.outreachEvent);
      saveOutreachQueue();
      saveOutreachActivityLog();
      renderOutreachQueue();
      showToast("任务已更新");
    } catch (error) {
      showToast(error.message || "任务更新失败");
    }
    return;
  }
  task.subject = subject.trim() || task.subject;
  task.body = OutreachQueue.sanitizePlainText ? OutreachQueue.sanitizePlainText(body) : body.trim();
  if (scheduledAt) task.scheduledAt = scheduledAt;
  task.updatedAt = new Date().toISOString();
  recordOutreachActivity("edited", task, getOutreachCustomer(task), "邮件主题、正文或计划发送时间已修改");
  saveOutreachQueue();
  saveOutreachActivityLog();
  renderOutreachQueue();
  showToast("任务已更新");
}

async function copyOutreachTaskBody(task) {
  const text = `${task.subject || ""}\n\n${task.body || ""}`.trim();
  try {
    await navigator.clipboard?.writeText(text);
    showToast("纯文本正文已复制");
  } catch {
    showToast("复制失败，请手动选择正文");
  }
}

async function markOutreachCustomerFlag(customerId, action, task = null) {
  if (isSharedCrmEnabled() && SharedCrmStore.updateCustomerFlags) {
    try {
      const result = await SharedCrmStore.updateCustomerFlags(customerId, action, task?.id || "", getSharedCrmActor());
      if (result.customer) replaceSharedCustomer(result.customer);
      (result.stoppedTasks || []).forEach(replaceSharedOutreachTask);
      appendSharedOutreachEvent(result.outreachEvent);
      saveCustomers();
      saveOutreachQueue();
      saveOutreachActivityLog();
      renderOutreachQueue();
      showToast("客户合规状态已更新");
    } catch (error) {
      showToast(error.message || "客户状态更新失败");
    }
    return;
  }
  const customer = customers.find((item) => item.id === customerId) || (task ? getOutreachCustomer(task) : null);
  if (!customer) return;
  const at = new Date().toISOString();
  const actionLabel = getOutreachActionLabel(action);
  if (action === "dne") {
    customer.doNotEmail = true;
    customer.doNotEmailAt = at;
  }
  if (action === "unsubscribe") {
    customer.unsubscribed = true;
    customer.unsubscribedAt = at;
  }
  if (action === "bounce") {
    customer.emailBounced = true;
    customer.emailBouncedAt = at;
  }
  if (action === "replied") {
    customer.outreachReplied = true;
    customer.outreachRepliedAt = at;
  }
  outreachQueue.forEach((row) => {
    if (row.customerId === customer.id && [OutreachQueue.STATUS?.PENDING_REVIEW || "pending_review", OutreachQueue.STATUS?.APPROVED || "approved", OutreachQueue.STATUS?.SCHEDULED || "scheduled"].includes(row.status)) {
      row.status = OutreachQueue.STATUS?.STOPPED || "stopped";
      row.stoppedAt = at;
      row.stopReason = actionLabel;
      row.updatedAt = at;
    }
  });
  customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
  customer.timeline.unshift({ id: crypto.randomUUID(), date: today(), type: "开发信", content: `开发信合规标记：${actionLabel}` });
  saveCustomers();
  saveOutreachQueue();
  recordOutreachActivity(`marked_${action}`, task || { customerId: customer.id, company: customer.company, email: customer.email }, customer, `客户已标记：${actionLabel}`);
  saveOutreachActivityLog();
  renderOutreachQueue();
  showToast(`客户已标记：${actionLabel}`);
}

function recordOutreachActivity(type, task = {}, customer = null, note = "") {
  outreachActivityLog.unshift({
    id: crypto.randomUUID(),
    type,
    taskId: task.id || "",
    customerId: customer?.id || task.customerId || "",
    company: customer?.company || task.company || "",
    email: customer?.email || task.email || "",
    subject: task.subject || "",
    status: task.status || "",
    at: new Date().toISOString(),
    note,
    createdBy: currentUser?.name || "Lina",
  });
  outreachActivityLog = outreachActivityLog.slice(0, 1000);
}

function refreshOutreachComplianceFlags(silent = false) {
  let changed = false;
  customers.forEach((customer) => {
    if (!customer.email) return;
    if (detectOutreachBounce(customer)) {
      customer.emailBounced = true;
      customer.emailBouncedAt = customer.emailBouncedAt || new Date().toISOString();
      changed = true;
    }
    if (detectOutreachReply(customer)) {
      customer.outreachReplied = true;
      customer.outreachRepliedAt = customer.outreachRepliedAt || new Date().toISOString();
      changed = true;
    }
    if (customer.emailBounced || customer.outreachReplied || customer.unsubscribed || customer.doNotEmail || customer.stopOutreach) {
      outreachQueue.forEach((task) => {
        if (task.customerId !== customer.id) return;
        if (![OutreachQueue.STATUS?.PENDING_REVIEW || "pending_review", OutreachQueue.STATUS?.APPROVED || "approved", OutreachQueue.STATUS?.SCHEDULED || "scheduled"].includes(task.status)) return;
        task.status = OutreachQueue.STATUS?.STOPPED || "stopped";
        task.stoppedAt = task.stoppedAt || new Date().toISOString();
        task.stopReason = customer.emailBounced ? "检测到退信" : customer.outreachReplied ? "客户已回复" : "合规停止";
        task.updatedAt = task.stoppedAt;
        changed = true;
      });
    }
  });
  if (changed) {
    saveCustomers();
    saveOutreachQueue();
    if (!silent) showToast("合规标记已更新");
  }
}

function detectOutreachBounce(customer) {
  const email = String(customer.email || "").trim().toLowerCase();
  if (!email) return false;
  return (mailState.inbox || []).some((message) => {
    const from = String(message.from || "").toLowerCase();
    const text = [message.subject, message.body, message.snippet].join(" ").toLowerCase();
    return /mailer-daemon|postmaster|delivery/.test(from) && /bounce|undeliver|delivery failed|returned mail/.test(text) && text.includes(email);
  });
}

function detectOutreachReply(customer) {
  const email = String(customer.email || "").trim().toLowerCase();
  if (!email) return false;
  const relatedTask = outreachQueue.find((task) => task.customerId === customer.id && (task.sentAt || task.createdAt));
  if (!relatedTask) return false;
  const since = new Date(relatedTask.sentAt || relatedTask.createdAt);
  return (mailState.inbox || []).some((message) => {
    const from = String(message.from || "").toLowerCase();
    const date = new Date(message.date || 0);
    if (!from.includes(email) || Number.isNaN(date.getTime()) || date < since) return false;
    const text = [message.subject, message.body, message.snippet].join(" ").toLowerCase();
    return !/bounce|undeliver|delivery failed|mailer-daemon|postmaster/.test(text);
  });
}

function renderCustomerScopeBar() {
  const counts = {
    all: customers.length,
    hot: customers.filter((customer) => customer.priority === "A").length,
    due: customers.filter(isCustomerDue).length,
    won: customers.filter((customer) => customer.stage === "已成交").length,
  };

  const countElements = {
    all: document.querySelector("#scopeAllCount"),
    hot: document.querySelector("#scopeHotCount"),
    due: document.querySelector("#scopeDueCount"),
    won: document.querySelector("#scopeWonCount"),
  };

  Object.entries(countElements).forEach(([scope, element]) => {
    if (element) element.textContent = counts[scope];
  });

  document.querySelectorAll("[data-customer-scope]").forEach((button) => {
    button.classList.toggle("active", button.dataset.customerScope === customerScopeFilter);
  });
}

function renderStats() {
  const dueCount = customers.filter((customer) =>
    (customer.followUps || []).some((item) => item.nextDate && item.nextDate <= today())
  ).length;

  const statTotal = document.querySelector("#statTotal");
  const statHot = document.querySelector("#statHot");
  const statDue = document.querySelector("#statDue");
  if (statTotal) statTotal.textContent = customers.length;
  if (statHot) statHot.textContent = customers.filter((customer) => customer.priority === "A").length;
  if (statDue) statDue.textContent = dueCount;
}

function renderPipeline() {
  if (!pipelineStats) return;
  pipelineStats.innerHTML = stages
    .map((stage) => {
      const count = customers.filter((customer) => customer.stage === stage).length;
      return `<button class="stage-tile" type="button" data-stage="${stage}">
        <span>${stage}</span>
        <strong>${count}</strong>
      </button>`;
    })
    .join("");

  pipelineStats.querySelectorAll(".stage-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      stageFilter.value = tile.dataset.stage;
      render();
    });
  });
}

function renderCustomerList() {
  if (!customerList) return;
  const visible = getFilteredCustomers();
  if (!visible.length) {
    customerList.innerHTML = `<div class="empty-state">没有匹配客户</div>`;
    return;
  }

  customerList.innerHTML = `<div class="customer-table-wrap">
    <table class="customer-table">
      <thead>
        <tr>
          <th>客户名称</th>
          <th>客户来源</th>
          <th>手机/WhatsApp</th>
          <th>邮箱</th>
          <th>客户级别</th>
          <th>客户行业</th>
          <th>推荐产品</th>
          <th>付款风险</th>
          <th>下次联系时间</th>
          <th>黑名单</th>
          <th>备注</th>
          <th>负责人</th>
          <th>更新时间</th>
        </tr>
      </thead>
      <tbody>
        ${visible
          .map(
            (customer) => `<tr class="customer-row ${customer.id === selectedId ? "active" : ""}" data-id="${customer.id}" tabindex="0">
              <td>
                <strong>${escapeHtml(customer.company || "未命名公司")}</strong>
                <span>${escapeHtml(customer.contact || "-")} · ${escapeHtml(customer.title || "联系人")} · ${escapeHtml(customer.country || "-")}</span>
              </td>
              <td>${escapeHtml(normalizeCustomerSource(customer.source) || "-")}</td>
              <td>${escapeHtml(customer.whatsapp || "-")}</td>
              <td>${customer.email ? `<a href="${escapeAttr(getComposeUrl(customer))}">${escapeHtml(customer.email)}</a>` : "-"}</td>
              <td><span class="priority">${escapeHtml(customer.priority || "B")}</span></td>
              <td>${escapeHtml(customer.segment || "-")}</td>
              <td>${escapeHtml(customer.product || "-")}</td>
              <td>${escapeHtml(customer.paymentRisk || "未知")}</td>
              <td>${escapeHtml(getCustomerNextDate(customer) || "待安排")}</td>
              <td>${escapeHtml(customer.isBlacklisted || "否")}</td>
              <td>${escapeHtml(getLatestFollowSummary(customer))}</td>
              <td>${escapeHtml(customer.owner || "-")}</td>
              <td>${escapeHtml(getCustomerUpdatedAt(customer) || "-")}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;

  customerList.querySelectorAll(".customer-row").forEach((item) => {
    item.addEventListener("click", () => selectCustomer(item.dataset.id));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        selectCustomer(item.dataset.id);
      }
    });
  });
}

function isCustomerDue(customer) {
  return (customer.followUps || []).some((item) => item.nextDate && item.nextDate <= today());
}

function getCustomerNextDate(customer) {
  const records = customer.followUps || [];
  return records.find((item) => item.nextDate)?.nextDate || "";
}

function getLatestFollowSummary(customer) {
  const record = (customer.followUps || [])[0];
  return record?.summary || customer.notes || "-";
}

function getCustomerUpdatedAt(customer) {
  const dates = [
    customer.notesUpdatedAt,
    ...(customer.followUps || []).map((record) => record.date),
  ].filter(Boolean);

  return dates.sort().at(-1) || "";
}

function renderDetail() {
  if (!customerForm) return;
  const customer = getSelectedCustomer();
  const fields = customerForm.elements || {};
  const detailTitle = document.querySelector("#detailTitle");
  const detailStage = document.querySelector("#detailStage");

  if (!customer) {
    customerForm.reset();
    if (detailTitle) detailTitle.textContent = "选择或新增客户";
    if (detailStage) detailStage.textContent = "新线索";
    updateContactLinks(null);
    return;
  }

  if (detailTitle) detailTitle.textContent = customer.company || "未命名公司";
  if (detailStage) detailStage.textContent = customer.stage || "新线索";

  [
    "company",
    "contact",
    "title",
    "country",
    "website",
    "segment",
    "stage",
    "priority",
    "owner",
    "linkedin",
    "instagram",
    "facebook",
    "youtube",
    "email",
    "whatsapp",
    "source",
    "product",
    "volume",
    "paymentRisk",
    "isQuoted",
    "isSample",
    "isBlacklisted",
    "notes"
  ].forEach((field) => {
    if (fields[field]) fields[field].value = customer[field] || "";
  });
  if (fields.owner) fields.owner.disabled = currentUser?.role !== "admin";

  updateContactLinks(customer);
}

function updateContactLinks(customer) {
  const linkedin = document.querySelector("#linkedinLink");
  const email = document.querySelector("#emailLink");
  const whatsapp = document.querySelector("#whatsappLink");
  setLinkState(linkedin, customer?.linkedin || "", customer?.linkedin || "#");
  setLinkState(email, customer?.email || "", customer?.email ? getComposeUrl(customer) : "#");
  setLinkState(whatsapp, customer?.whatsapp || "", getWhatsAppLink(customer?.whatsapp || ""));
}

function setLinkState(element, value, href) {
  if (!element) return;
  element.href = href || "#";
  element.classList.toggle("disabled", !value);
}

function getWhatsAppLink(value) {
  const digits = String(value).replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function renderTimeline() {
  if (!timeline) return;
  const customer = getSelectedCustomer();
  fillFollowFormDates();

  if (!customer) {
    timeline.innerHTML = `<div class="empty-state">选择客户后添加备注</div>`;
    return;
  }

  if (String(customer.notes || "").trim() && !customer.notesUpdatedAt) {
    customer.notesUpdatedAt = today();
    saveCustomers();
  }

  const entries = getCustomerTimelineEntries(customer);

  if (!entries.length) {
    timeline.innerHTML = `<div class="empty-state">暂无备注记录</div>`;
    return;
  }

  timeline.innerHTML = entries.map(renderCustomerTimelineEntry).join("");
}

function getCustomerTimelineEntries(customer) {
  const notes = String(customer.notes || "").trim()
    ? [
        {
          type: "note",
          channel: "客户备注",
          date: customer.notesUpdatedAt || today(),
          summary: customer.notes,
          nextStep: "",
        },
      ]
    : [];

  const followUps = (customer.followUps || []).map((item) => ({
    type: "follow",
    channel: item.channel || "Follow-up",
    date: item.date || "",
    summary: item.summary || "",
    followType: item.followType || "",
    feedback: item.feedback || "",
    concerns: item.concerns || "",
    stage: item.stage || "",
    nextStep: item.nextAction || item.nextStep || "",
    nextDate: item.nextDate || "",
    reminderCycle: item.reminderCycle || "",
    completed: item.completed || "",
    result: item.result || "",
    createdBy: item.createdBy || "",
  }));

  const mails = getSentMailsForCustomer(customer).map((mail) => ({
    type: "mail",
    channel: "邮件备注",
    date: mail.date || "",
    summary: mail.subject || "(No subject)",
    body: mail.body || mail.snippet || "",
  }));

  return [...notes, ...followUps, ...mails].sort((a, b) => {
    if (a.type === "note") return -1;
    if (b.type === "note") return 1;
    return new Date(b.date || 0) - new Date(a.date || 0);
  });
}

function getSentMailsForCustomer(customer) {
  const email = String(customer.email || "").trim().toLowerCase();
  return mailState.sent.filter((mail) => {
    const to = String(mail.to || "").trim().toLowerCase();
    return mail.customerId === customer.id || (email && to === email);
  });
}

function renderCustomerTimelineEntry(item) {
  if (item.type === "mail") {
    return `<details class="timeline-item timeline-mail">
      <summary>
        <div class="timeline-head">
          <strong>${escapeHtml(item.channel)}</strong>
          <span>${escapeHtml(formatMailDate(item.date))}</span>
        </div>
        <p>备注：给客户发送邮件</p>
        <p>备注日期：${escapeHtml(formatMailDate(item.date))}</p>
        <p>主题：${escapeHtml(item.summary)}</p>
      </summary>
      <div class="timeline-mail-body">${escapeHtml(item.body || "")}</div>
    </details>`;
  }

  return `<div class="timeline-item ${item.type === "note" ? "timeline-note" : ""}">
        <div class="timeline-head">
          <strong>${escapeHtml(item.type === "follow" ? `${item.channel || "Follow-up"} 备注` : item.channel || "备注")}</strong>
          <span>${escapeHtml(item.date || "")}</span>
        </div>
        <p>备注日期：${escapeHtml(item.date || today())}</p>
        <p>备注：${escapeHtml(item.summary || "")}</p>
        ${item.type === "note" ? "" : `
          ${item.feedback ? `<p>客户反馈：${escapeHtml(item.feedback)}</p>` : ""}
          ${item.concerns ? `<p>客户关心点：${escapeHtml(item.concerns)}</p>` : ""}
          ${item.followType ? `<p>跟进类型：${escapeHtml(item.followType)}</p>` : ""}
          ${item.stage ? `<p>当前阶段：${escapeHtml(item.stage)}</p>` : ""}
          <p>推荐下一步：${escapeHtml(item.nextStep || "待确认")} ${item.nextDate ? `· ${escapeHtml(item.nextDate)}` : ""}</p>
          ${item.reminderCycle ? `<p>提醒周期：${escapeHtml(item.reminderCycle)}${item.reminderCycle === "custom" ? "" : "天"}</p>` : ""}
          ${item.completed ? `<p>是否完成：${escapeHtml(item.completed)} ${item.result ? `· ${escapeHtml(item.result)}` : ""}</p>` : ""}
          ${item.createdBy ? `<p>创建人：${escapeHtml(item.createdBy)}</p>` : ""}
        `}
      </div>`;
}

function fillFollowFormDates() {
  if (!followForm?.elements) return;
  followForm.elements.date.value = followForm.elements.date.value || today();
  followForm.elements.nextDate.value = followForm.elements.nextDate.value || getDefaultNextFollowDate();
}

function openComposePageForCustomer(customer) {
  const params = new URLSearchParams();
  if (customer.email) params.set("to", customer.email);
  if (customer.company) params.set("subject", `Coffee machine supply for ${customer.company}`);
  window.location.href = `compose.html?${params.toString()}`;
}

function openExternalUrl(url) {
  if (!url || url === "#") {
    showToast("暂无可打开的链接");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

async function copyText(text, message) {
  if (!text) {
    showToast("暂无可复制内容");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  showToast(message);
}

function renderGeneratedMessage() {
  if (!letterOutput || !messageType) return;
  const customer = getSelectedCustomer();
  if (!customer) {
    letterOutput.value = "";
    return;
  }

  const generators = {
    email: generateEmail,
    linkedin: generateLinkedInMessage,
    whatsapp: generateWhatsAppMessage
  };

  const generator = generators[messageType.value] || generators.email;
  letterOutput.value = generator(customer);
}

function generateEmail(customer) {
  const product = customer.product || "commercial coffee machines";
  const segment = customer.segment || "coffee equipment business";
  const country = customer.country || "your market";
  const volume = customer.volume || "your target volume";
  const owner = customer.owner || "Sales Team";

  return `Subject: Coffee machine supply for ${customer.company || "your team"}

Hi ${customer.contact || "there"},

I noticed ${customer.company || "your company"} is active in the ${segment} segment in ${country}. We manufacture ${product} for importers, distributors and hospitality operators who need stable quality, clear certification documents and responsive spare parts support.

Based on your current direction, I think we may help with:
1. Flexible models for ${volume}
2. OEM branding, packaging and plug customization
3. CE-ready documentation, QC reports and shipment photos before delivery

Would it be useful if I send you our latest catalogue and a quick FOB price range for the models that match your market?

Best regards,
${owner}`;
}

function generateLinkedInMessage(customer) {
  return `Hi ${customer.contact || "there"}, thanks for connecting. I saw ${customer.company || "your company"} works with ${customer.segment || "coffee equipment"} in ${customer.country || "your market"}. We manufacture ${customer.product || "commercial coffee machines"} with OEM options and export documentation. Would it be helpful if I share 2-3 models suitable for your channel?`;
}

function generateWhatsAppMessage(customer) {
  return `Hi ${customer.contact || "there"}, this is ${customer.owner || "from a coffee machine manufacturer in China"}. I prepared a short recommendation for ${customer.product || "coffee machines"} based on ${customer.company || "your company's"} market. May I send the catalogue and FOB price range here?`;
}

function getNextStep(customer) {
  const records = customer.followUps || [];
  const withNext = records.find((item) => item.nextAction || item.nextStep || item.nextDate);
  if (!withNext) {
    return "待安排跟进";
  }
  return `${withNext.nextAction || withNext.nextStep || "下一步"}${withNext.nextDate ? ` · ${withNext.nextDate}` : ""}`;
}

function selectCustomer(id) {
  selectedId = id;
  followForm.reset();
  render();
}

function createDraftCustomer() {
  const draft = {
    id: crypto.randomUUID(),
    company: "新客户",
    contact: "",
    title: "",
    country: "",
    segment: "进口商",
    stage: "新线索",
    priority: "B",
    owner: currentUser?.name || "Lina",
    website: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    youtube: "",
    email: "",
    whatsapp: "",
    source: "LinkedIn",
    product: "CM-1700MY",
    volume: "",
    paymentRisk: "未知",
    isQuoted: "否",
    isSample: "否",
    isBlacklisted: "否",
    notes: "",
    followUps: []
  };
  customers.unshift(draft);
  selectedId = draft.id;
  saveCustomers();
  render();
  customerForm.elements.company.focus();
  showToast("已创建新客户");
}

function runDuplicateCheck() {
  const groups = new Map();

  customers.forEach((customer) => {
    const keys = [
      customer.email ? `邮箱：${String(customer.email).trim().toLowerCase()}` : "",
      customer.company ? `公司：${normalizeDuplicateText(customer.company)}` : "",
      customer.whatsapp ? `WhatsApp：${String(customer.whatsapp).replace(/\D/g, "")}` : "",
    ].filter((key) => key && !key.endsWith("："));

    keys.forEach((key) => {
      const list = groups.get(key) || [];
      list.push(customer);
      groups.set(key, list);
    });
  });

  const duplicates = [...groups.entries()].filter(([, list]) => new Set(list.map((customer) => customer.id)).size > 1);

  if (!duplicates.length) {
    showToast("没有发现重复客户");
    return;
  }

  const [reason, list] = duplicates[0];
  selectedId = list[0].id;
  render();
  alert(
    `发现 ${duplicates.length} 组可能重复客户。\n\n第一组重复依据：${reason}\n${list
      .map((customer) => `- ${customer.company || "未命名公司"} / ${customer.contact || "未填联系人"}`)
      .join("\n")}`,
  );
}

function normalizeDuplicateText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(ltd|limited|llc|inc|gmbh|sarl|s\.a\.|sa|co|company)\b/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim();
}

function deleteSelectedCustomer() {
  if (!requireAdmin("普通用户不能删除客户")) return;
  const customer = getSelectedCustomer();
  if (!customer) return;
  const ok = confirm(`确认删除 ${customer.company || "该客户"}？`);
  if (!ok) return;

  const deletedId = customer.id;
  const deletedEmail = customer.email || "";
  const deletedCompany = customer.company || "";

  // Clean customer from main array
  customers = customers.filter((item) => item.id !== deletedId);
  selectedId = customers[0]?.id || null;
  saveCustomers();

  // Clean mail data associated with this customer's email
  if (deletedEmail) {
    const emailLower = deletedEmail.trim().toLowerCase();
    ["inbox", "sent", "drafts", "trash"].forEach((folder) => {
      if (Array.isArray(mailState[folder])) {
        mailState[folder] = mailState[folder].filter((mail) => {
          if (!mail) return false;
          const mailTo = String(mail.to || "").toLowerCase();
          const mailFrom = String(mail.from || "").toLowerCase();
          return !mailTo.includes(emailLower) && !mailFrom.includes(emailLower);
        });
      }
    });
    saveMailState();
  }

  // Clean moduleStore records (followups, leads, quotes, attachments)
  window.FORYAL_CRM?.cleanupCustomerAssociations?.(deletedId, deletedEmail, deletedCompany);

  render();
  showToast("客户已删除");
}

async function copyLetter() {
  if (!letterOutput) return;
  const text = letterOutput.value.trim();
  if (!text) {
    showToast("暂无可复制内容");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    letterOutput.select();
    document.execCommand("copy");
  }

  showToast("开发信已复制");
}

async function sendEmail() {
  if (!letterOutput) return;
  const customer = getSelectedCustomer();
  if (!customer) {
    showToast("请先选择客户");
    return;
  }

  if (!customer.email) {
    showToast("这个客户还没有邮箱");
    return;
  }

  const payload = getEmailPayload(customer);
  if (!payload.text) {
    showToast("邮件内容为空");
    return;
  }

  addDraftMail(payload, customer);
  customer.drafts = Array.isArray(customer.drafts) ? customer.drafts : [];
  customer.drafts.unshift({ id: crypto.randomUUID(), subject: payload.subject, date: today(), status: "草稿", body: payload.text, createdBy: currentUser?.name || customer.owner || "Lina", to: payload.to });
  customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
  customer.timeline.unshift({ id: crypto.randomUUID(), date: today(), type: "邮件草稿", content: `保存开发信草稿：${payload.subject}` });
  saveCustomers();
  render();
  showToast("邮件草稿已保存，不会自动发送");
}

function getEmailPayload(customer) {
  if (!letterOutput) return { to: customer.email, subject: "", text: "" };
  const draft = letterOutput.value.trim();
  const lines = draft.split(/\r?\n/);
  const subjectLine = lines[0] || "";
  const hasSubject = /^subject\s*:/i.test(subjectLine);
  const subject = hasSubject
    ? subjectLine.replace(/^subject\s*:\s*/i, "").trim()
    : `Coffee machine supply for ${customer.company || "your team"}`;
  const text = hasSubject ? lines.slice(1).join("\n").trim() : draft;

  return {
    to: customer.email,
    subject,
    text,
  };
}

async function sendComposedEmail(event) {
  event.preventDefault();

  const payload = {
    to: mailToInput.value.trim(),
    subject: mailSubjectInput.value.trim(),
    text: mailBodyInput.value.trim(),
  };

  if (!payload.to || !payload.subject || !payload.text) {
    showToast("请填写收件人、主题和正文");
    return;
  }

  const button = document.querySelector("#sendComposedMailBtn");
  button.disabled = true;
  button.textContent = "保存中";
  addDraftMail(payload, findCustomerByEmail(payload.to));
  activeMailbox = "drafts";
  selectedMailId = mailState.drafts[0]?.id || null;
  saveMailState();
  renderMail();
  mailStatus.textContent = "草稿已保存，不会自动发送";
  showToast("邮件草稿已保存");
  button.disabled = false;
  button.textContent = "保存草稿";
}

async function sendMailPayload(payload) {
  const account = getDefaultMailAccount();
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      account: account ? getMailAccountTransportPayload(account) : undefined,
    }),
  });
  // Safe JSON parse with clear fallback
  var result;
  try {
    result = await response.json();
  } catch (parseErr) {
    throw new Error('邮件发送接口返回异常 (HTTP ' + response.status + ')，请检查 API 服务是否正常');
  }

  if (!response.ok) {
    var errMsg = result.message || result.error || 'SEND_FAILED';
    // Map known errors to user-friendly Chinese
    if (errMsg === 'SMTP_NOT_CONFIGURED') errMsg = 'SMTP 未配置，请在设置中配置邮箱账户';
    else if (errMsg === 'INVALID_RECIPIENT') errMsg = '收件人邮箱格式无效';
    else if (errMsg === 'EMPTY_MESSAGE') errMsg = '邮件主题或正文不能为空';
    else if (errMsg === 'MESSAGE_TOO_LONG') errMsg = '邮件正文过长';
    else if (errMsg === 'ATTACHMENT_TOO_LARGE') errMsg = '附件超过 20MB 限制';
    throw new Error(errMsg);
  }

  return result;
}





function findCustomerByEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  if (!value) return null;
  return customers.find((customer) => String(customer.email || "").trim().toLowerCase() === value) || null;
}

function openComposer(options = {}) {
  const customer = options.customer || null;
  if (!mailToInput || !mailSubjectInput || !mailBodyInput) {
    window.location.href = getComposeUrl(customer, options);
    return;
  }
  composeCustomerId = customer?.id || null;
  mailToInput.value = options.to || customer?.email || "";
  mailSubjectInput.value = options.subject || (customer ? `Coffee machine supply for ${customer.company}` : "");
  mailBodyInput.value = options.body || (customer ? stripSubject(generateEmail(customer)) : "");
  mailToInput.focus();
}

function resetNewMailComposer() {
  openComposer({ to: "", subject: "", body: "" });
  if (aiContextInput) aiContextInput.value = "";
  if (aiMode) aiMode.value = "compose";
  lastAiDraft = null;
  collapseAiContext();
  clearAiArchive();
  resetAiThread();
  if (mailStatus) mailStatus.textContent = "邮箱已绑定：admin@example.com";
}

function openStandaloneComposer(options = {}) {
  const customer = options.customer || null;
  window.location.href = customer || options.to ? getComposeUrl(customer, options) : "compose.html";
}

function getComposeUrl(customer, options = {}) {
  const params = new URLSearchParams();
  if (customer?.id) params.set("customerId", customer.id);
  if (options.to || customer?.email) params.set("to", options.to || customer.email);
  if (options.type) params.set("type", options.type);
  if (options.subject) params.set("subject", options.subject);
  if (options.body) params.set("body", options.body);
  return `compose.html?${params.toString()}`;
}

function resetAiThread() {
  if (!aiThread) return;
  aiThread.innerHTML = "";
  appendAiMessage("assistant", AI_DEFAULT_MESSAGE);
}

async function askAiEmailAssistant() {
  if (!aiContextInput || !aiMode || !mailBodyInput || !aiThread) {
    openStandaloneComposer();
    return;
  }
  const userRequest = aiContextInput.value.trim();
  const customer = getComposerCustomer();
  const mode = aiMode.value;

  if (!userRequest && !mailBodyInput.value.trim()) {
    showToast("先输入你的想法或粘贴客户资料");
    return;
  }

  const canUseDeepSeek = aiSettings.provider !== "template" && aiSettings.apiKey && location.protocol !== "file:";
  lastAiDraft = null;
  archiveCurrentAiThread();
  appendAiMessage("user", userRequest ? formatChatResearchPreview(userRequest) : "请优化当前邮件草稿。");

  if (!canUseDeepSeek) {
    lastAiDraft = buildLocalEmailAssistantDraft({ mode, userRequest, customer });
    appendAiMessage("assistant", `${formatAiResultMessage(lastAiDraft)}\n\n（当前使用本地模板，保存 DeepSeek API Key 后可生成更自然版本。）`);
    aiContextInput.value = "";
    collapseAiContext();
    showToast("已用本地模板生成草稿");
    return;
  }

  const button = document.querySelector("#askAiBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "生成中";
  }

  try {
    const response = await fetch("/api/ai-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        userRequest,
        customer,
        currentDraft: getCurrentMailDraftText(),
        research: userRequest,
        history: getAiHistory(),
        apiKey: aiSettings.apiKey,
        baseUrl: aiSettings.baseUrl || DEEPSEEK_BASE_URL,
        model: aiSettings.model || DEEPSEEK_MODEL,
      }),
    });
    let result;
    try { result = await response.json(); } catch (parseErr) { throw new Error('AI API 返回了非 JSON 响应 (' + response.status + ')，请检查 API 服务是否启动'); }
    if (!response.ok) throw new Error(result.error || "AI_EMAIL_FAILED");

    lastAiDraft = result;
    appendAiMessage("assistant", formatAiResultMessage(result));
    aiContextInput.value = "";
    collapseAiContext();
  } catch (error) {
    appendAiMessage("assistant", getAiErrorMessage(error.message));
    showToast(getAiErrorMessage(error.message));
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "生成";
    }
  }
}

function buildLocalEmailAssistantDraft({ mode, userRequest, customer }) {
  const fallbackCustomer = customer || findCustomerByEmail(mailToInput.value) || {
    company: extractEmailDomainCompany(mailToInput.value) || "your company",
    contact: "",
    country: "",
    segment: "home appliance importer",
    product: "CM-1700MY",
    owner: currentUser?.name || "Lina Mei",
  };
  const lines = getMeaningfulResearchLines(userRequest, 8);
  const product = fallbackCustomer.product || "CM-1700MY";
  const company = fallbackCustomer.company || "";
  const country = fallbackCustomer.country || "";
  const contact = fallbackCustomer.contact || "";

  const subject = mode === "followup"
    ? `Quick follow-up — coffee machine option for ${company || "your team"}`
    : mode === "quote"
      ? `${product} FOB reference for ${company || "your review"}`
      : `Coffee machine option for ${company || "your team"}${country ? " " + country : ""}`;

  // Extract brand clues from user input
  const brandMatch = userRequest.match(/(?:Brand clues|品牌线索|brands? like)[:\s]*([A-Za-z][A-Za-z\s,]+?)(?:\.|$|\n)/i);
  const brandClues = brandMatch ? brandMatch[1].replace(/\s+/g, " ").trim() : "";
  // Also try to parse comma-separated brand names from input
  const inputBrands = !brandClues ? userRequest.split(/[,，]/).map(function(s) { return s.trim(); }).filter(function(s) { return /^[A-Z][A-Za-z\s&.-]{3,30}$/.test(s) && !/market|manager|sourcing|line|appliance/i.test(s); }) : [];

  // Build natural observation
  let observation = "";
  if (company && country) {
    if (brandClues) {
      observation = `I noticed ${company} works across brands like ${brandClues}, with sourcing activity in ${country}`;
    } else if (inputBrands.length > 1) {
      var others = inputBrands.slice(1).slice(0, 3);
      observation = `I noticed ${company} works across brands like ${others.join(", ").replace(/, ([^,]+)$/, " and $1")}, with sourcing activity in ${country}`;
    } else if (lines.length > 0) {
      observation = `I noticed ${company} has activity in ${country} — ${lines[0]}`;
    } else {
      observation = `I noticed ${company} has sourcing activity in ${country}`;
    }
  } else if (country) {
    observation = `I've been looking at the market in ${country}`;
  } else if (company) {
    observation = `I came across ${company} and wanted to reach out`;
  } else {
    observation = `I wanted to reach out about a coffee machine option`;
  }

  const greeting = contact ? `Hi ${contact},` : `Hi,`;

  const body = `${greeting}

${observation}.

For coffee appliances, Aison may be able to support a practical option like ${product}${country ? ", especially if your team is reviewing cost-effective models for a new or refreshed line" : ""}.

Would it be useful if I send 1-2 model options with FOB range and key specs first?

Best,
${currentUser?.name || fallbackCustomer.owner || "Lina Mei"}
Demo Export Company`;

  return {
    subject,
    body,
    keyPoints: [
      `${company} · ${country || "country unknown"}`,
      `${fallbackCustomer.customerType || fallbackCustomer.segment || "Target segment"} · ${product}`,
      lines.length ? "已读取粘贴资料并提取可用线索" : "使用客户字段生成本地模板",
    ],
    breakthroughAngles: [
      "从客户所在市场和品类切入，避免群发感",
      "突出推荐型号的差异化特点而非通用OEM能力",
      "结尾使用低压力询问，降低回复门槛",
    ],
    notes: "本地模板保守使用已知信息，不编造公司背景。配置 DeepSeek API Key 可获得更个性化版本。",
  };
}

function extractEmailDomainCompany(value) {
  const email = extractEmail(value);
  const domain = email.split("@")[1] || "";
  return domain ? domain.split(".")[0].replace(/[-_]/g, " ") : "";
}

function applyAiDraft() {
  if (!lastAiDraft) {
    showToast("还没有可填入的 AI 草稿");
    return;
  }

  if (!mailSubjectInput || !mailBodyInput) {
    openStandaloneComposer({
      subject: lastAiDraft.subject || "",
      body: lastAiDraft.body || "",
    });
    return;
  }
  mailSubjectInput.value = lastAiDraft.subject || mailSubjectInput.value;
  mailBodyInput.value = lastAiDraft.body || mailBodyInput.value;
  showToast("AI 草稿已填入邮件");
}

function appendAiMessage(role, text) {
  if (!aiThread) return;
  const message = document.createElement("div");
  message.className = `ai-message ${role}`;
  message.textContent = text;
  aiThread.appendChild(message);
  aiThread.scrollTop = aiThread.scrollHeight;
}

function archiveCurrentAiThread() {
  if (!aiThread || !aiArchiveList) return;
  const messages = Array.from(aiThread.querySelectorAll(".ai-message"))
    .map((message) => ({
      role: message.classList.contains("user") ? "我" : "DeepSeek",
      text: (message.textContent || "").trim(),
    }))
    .filter((message) => message.text && message.text !== AI_DEFAULT_MESSAGE);

  if (!messages.length) return;

  const archivedText = messages.map((message) => `${message.role}：${message.text}`).join("\n\n");
  const item = document.createElement("article");
  item.className = "ai-archive-item";
  item.textContent = `${formatArchiveTime(new Date())}\n${archivedText.length > 900 ? `${archivedText.slice(0, 900)}\n...` : archivedText}`;
  aiArchiveList.prepend(item);

  while (aiArchiveList.children.length > 8) {
    aiArchiveList.lastElementChild.remove();
  }

  updateAiArchiveState();
  resetAiThread();
}

function toggleAiArchive() {
  if (!aiArchivePanel) return;
  const button = document.querySelector("#toggleAiArchiveBtn");
  const collapsed = aiArchivePanel.classList.toggle("collapsed");
  if (button) button.textContent = collapsed ? "查看" : "收起";
}

function clearAiArchive() {
  if (!aiArchiveList) return;
  aiArchiveList.innerHTML = "";
  updateAiArchiveState();
}

function updateAiArchiveState() {
  if (!aiArchiveList || !aiArchivePanel) return;
  const count = aiArchiveList.children.length;
  aiArchivePanel.classList.toggle("is-empty", count === 0);
  aiArchivePanel.classList.add("collapsed");
  const button = document.querySelector("#toggleAiArchiveBtn");
  if (button) button.textContent = "查看";
  if (aiArchiveSummary) aiArchiveSummary.textContent = count ? `旧内容已隐藏：${count} 轮历史` : "历史记录已隐藏";
}

function formatArchiveTime(date) {
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toggleAiContext() {
  if (!aiPasteBox) return;
  if (aiPasteBox.classList.contains("collapsed")) {
    expandAiContext();
  } else {
    collapseAiContext();
  }
}

function expandAiContext() {
  if (!aiPasteBox || !aiContextInput) return;
  aiPasteBox.classList.remove("collapsed");
  aiPasteBox.classList.add("expanded");
  const button = document.querySelector("#toggleAiContextBtn");
  if (button) button.textContent = "收起";
  aiContextInput.focus();
}

function collapseAiContext() {
  if (!aiPasteBox) return;
  aiPasteBox.classList.add("collapsed");
  aiPasteBox.classList.remove("expanded");
  const button = document.querySelector("#toggleAiContextBtn");
  if (button) button.textContent = "展开";
  updateAiContextPreview();
}

function updateAiContextPreview() {
  if (!aiContextInput || !aiPasteSummary || !aiContextPreview) return;
  const text = aiContextInput.value.trim();

  if (!text) {
    aiPasteSummary.textContent = "客户资料 / 想法";
    aiContextPreview.textContent = "粘贴客户社媒/官网资料，或写：想约客户看目录，语气自然一点";
    return;
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const isLongPaste = text.length > AI_CONTEXT_PREVIEW_LIMIT || lines.length > 10;
  aiPasteSummary.textContent = isLongPaste
    ? `已隐藏大部分内容：${text.length} 字符，${lines.length} 行资料`
    : `${text.length} 字符，${lines.length} 行客户资料`;
  aiContextPreview.textContent = formatPastedResearchPreview(text);
}

function formatPastedResearchPreview(text) {
  const source = String(text || "").trim();
  if (!source) return "";

  const rawLines = source.split(/\r?\n/).filter((line) => line.trim());
  if (source.length <= AI_CONTEXT_PREVIEW_LIMIT && rawLines.length <= 10) return source;

  const meaningfulLines = getMeaningfulResearchLines(source, 4);
  const previewSource = meaningfulLines.length ? meaningfulLines.join("\n") : source.replace(/\n{3,}/g, "\n\n");
  const preview = previewSource.length > AI_CONTEXT_PREVIEW_LIMIT ? `${previewSource.slice(0, AI_CONTEXT_PREVIEW_LIMIT)}\n...` : previewSource;
  const hiddenCount = Math.max(0, source.length - preview.length);
  return `已粘贴 ${source.length} 字 / ${rawLines.length} 行资料，已自动折叠。DeepSeek 生成时会分析完整内容。\n\n${preview}\n\n已隐藏约 ${hiddenCount} 字。`;
}

function formatChatResearchPreview(text) {
  const source = String(text || "").trim();
  if (!source) return "";

  const rawLines = source.split(/\r?\n/).filter((line) => line.trim());
  if (source.length <= AI_CHAT_PREVIEW_LIMIT && rawLines.length <= 6) return source;

  const preview = getMeaningfulResearchLines(source, 3).join(" / ").slice(0, AI_CHAT_PREVIEW_LIMIT);
  return `已粘贴 ${source.length} 字 / ${rawLines.length} 行资料，已收起。DeepSeek 会分析完整内容。\n预览：${preview || "完整资料已进入分析"}`;
}

function getMeaningfulResearchLines(text, limit = 10) {
  const seen = new Set();
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => {
      const key = line.toLowerCase();
      if (line.length <= 1) return false;
      if (AI_CONTEXT_NOISE_LINES.has(key)) return false;
      if (AI_CONTEXT_NOISE_PATTERNS.some((pattern) => pattern.test(line))) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function formatAiResultMessage(result) {
  const keyPoints = normalizeAiList(result.keyPoints || result.key_points);
  const breakthroughAngles = normalizeAiList(result.breakthroughAngles || result.breakthrough_angles);
  const sections = [`主题：${result.subject}`, result.body];

  if (keyPoints.length) {
    sections.push(`关键信息：\n- ${keyPoints.join("\n- ")}`);
  }

  if (breakthroughAngles.length) {
    sections.push(`突破口：\n- ${breakthroughAngles.join("\n- ")}`);
  }

  if (result.notes) {
    sections.push(`策略建议：${result.notes}`);
  }

  return sections.filter(Boolean).join("\n\n");
}

function normalizeAiList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 6);
  if (!value) return [];
  return String(value)
    .split(/\r?\n|；|;/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function getAiHistory() {
  if (!aiThread) return [];
  return Array.from(aiThread.querySelectorAll(".ai-message"))
    .slice(-8)
    .map((item) => ({
      role: item.classList.contains("user") ? "user" : "assistant",
      text: item.textContent || "",
    }));
}

function getCurrentMailDraftText() {
  if (!mailSubjectInput || !mailBodyInput) return "";
  return [`Subject: ${mailSubjectInput.value.trim()}`, "", mailBodyInput.value.trim()].join("\n");
}

function getComposerCustomer() {
  clearComposerCustomerIfRecipientChanged();
  if (!composeCustomerId) return null;
  return customers.find((customer) => customer.id === composeCustomerId) || null;
}

function clearComposerCustomerIfRecipientChanged() {
  if (!composeCustomerId) return;
  const customer = customers.find((item) => item.id === composeCustomerId);
  const expectedEmail = String(customer?.email || "").trim().toLowerCase();
  const currentEmail = String(mailToInput?.value || "").trim().toLowerCase();
  if (!expectedEmail || currentEmail !== expectedEmail) {
    composeCustomerId = null;
  }
}

function getAiErrorMessage(code) {
  const messages = {
    DEEPSEEK_NOT_CONFIGURED: "DeepSeek 还没绑定 API Key",
    EMPTY_PROMPT: "请输入你的需求或客户资料",
    DEEPSEEK_FAILED: "DeepSeek 请求失败",
    AI_FORMAT_FAILED: "AI 返回格式异常，请再试一次",
    AI_EMAIL_FAILED: "DeepSeek 邮件助手暂时不可用",
  };
  return messages[code] || "DeepSeek 邮件助手暂时不可用";
}

function composeToSelectedCustomer() {
  const customer = getSelectedCustomer();
  if (!customer) {
    showToast("请先选择客户");
    return;
  }
  if (!customer.email) {
    showToast("这个客户还没有邮箱");
    return;
  }
  openStandaloneComposer({ customer });
}

async function refreshInbox() {
  if (location.protocol === "file:") {
    if (mailStatus) mailStatus.textContent = "请在 Vercel 线上地址刷新收件箱";
    showToast("请在 Vercel 线上地址刷新收件箱");
    return;
  }

  const account = getDefaultMailAccount();
  if (!account?.email || !account?.password) {
    if (mailStatus) mailStatus.textContent = "请先在邮箱账户设置里填写默认邮箱和授权码";
    showToast("请先完善默认邮箱账户的邮箱地址和密码");
    return;
  }
  if (!account?.imapHost || !account?.imapPort) {
    if (mailStatus) mailStatus.textContent = "仅配置了发件 SMTP，还需要配置收件服务器（IMAP/POP3）才能同步收件箱";
    showToast("仅配置了发件SMTP，还需要配置IMAP/POP3收件服务器才能同步收件箱");
    return;
  }

  const button = document.querySelector("#refreshInboxBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "收取中...";
  }
  if (mailStatus) mailStatus.textContent = "正在读取收件箱...";

  try {
    const response = await fetch(`/api/mail/inbox?t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: getMailAccountTransportPayload(account) }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || result.error || "INBOX_FAILED");

    const hidden = new Set(mailState.hiddenInboxUids);
    const existing = new Map(mailState.inbox.map((message) => [message.uid, message]));
    result.messages.forEach((message) => {
      existing.set(message.uid, {
        ...existing.get(message.uid),
        ...normalizeMailForDisplay(message),
        id: message.uid,
        mailbox: "inbox",
      });
    });

    mailState.inbox = Array.from(existing.values())
      .filter((message) => !hidden.has(message.uid))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 100);
    mailState.lastSync = new Date().toISOString();
    activeMailbox = "inbox";
    selectedMailId = mailState.inbox[0]?.id || null;
    saveMailState();
    renderMail();
    if (mailStatus) mailStatus.textContent = `收件箱已刷新：${result.transport || ""}`;
    showToast("收件箱已刷新");
  } catch (error) {
    if (mailStatus) mailStatus.textContent = getInboxErrorMessage(error.message);
    showToast(getInboxErrorMessage(error.message));
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "收取";
    }
  }
}

function renderMail() {
  if (!mailList || !mailReader) return;
  if (normalizeMailStateForDisplay()) saveMailState();
  const folders = getMailFolders();
  const inbox = folders.inbox;
  const visible = filterAndSortMails(folders[activeMailbox] || []);
  const view = getMailboxView(visible);
  const renderedMessages = view.rendered;

  const historyCount = (folders.history || []).length;
  const folderCounts = {
    historyCount,
    inboxCount: inbox.length,
    draftsCount: (folders.drafts || []).length,
    sentCount: (folders.sent || []).length,
    trashCount: (folders.trash || []).length,
  };
  Object.entries(folderCounts).forEach(([id, value]) => {
    const element = document.querySelector(`#${id}`);
    if (element) element.textContent = value;
  });
  document.querySelectorAll(".mail-folder").forEach((button) => {
    button.classList.toggle("active", button.dataset.mailbox === activeMailbox);
  });

  if (!visible.length) {
    updateBulkMailToolbar([], 0);
    hideMailContextMenu();
    mailList.innerHTML = `<div class="empty-state">${activeMailbox === "inbox" ? "暂无收件箱邮件" : activeMailbox === "drafts" ? "暂无草稿" : activeMailbox === "history" ? "暂无历史邮件" : "这个文件夹是空的"}</div>`;
    mailReader.innerHTML = `<div class="empty-state">选择一封邮件查看内容</div>`;
    return;
  }

  syncSelectedMailIds(renderedMessages);

  if (!selectedMailId || !renderedMessages.some((message) => message.id === selectedMailId)) {
    selectedMailId = renderedMessages[0]?.id || null;
  }

  updateBulkMailToolbar(renderedMessages, view.old.length);
  mailList.innerHTML = renderMailListHtml(view);

  mailList.querySelectorAll(".mail-item-foxmail").forEach((item) => {
    const selectItem = () => {
      selectedMailId = item.dataset.id;
      // Drafts: directly open inline compose editor, skip preview
      if (activeMailbox === 'drafts') {
        var draftMsg = (getMailFolders().drafts || []).find(function(m) { return m.id === selectedMailId; });
        if (draftMsg) {
          _currentDraftId = draftMsg.id;
          var draftBody = draftMsg.bodyHtml || draftMsg.body || '';
          window._openCompose({
            to: draftMsg.to || '', subject: draftMsg.subject || '',
            body: draftBody, cc: draftMsg.cc || '', bcc: draftMsg.bcc || '',
          });
          // Restore attachments from draft
          if (Array.isArray(draftMsg.attachments) && draftMsg.attachments.length) {
            window._inlineComposeAttachments = window._inlineComposeAttachments || [];
            var a = window._inlineComposeAttachments; a.length = 0;
            draftMsg.attachments.forEach(function(att) { a.push(att); });
            setTimeout(function() {
              var listEl = document.querySelector('#composeAttachmentList');
              if (listEl && a.length) {
                listEl.style.display = 'block';
                listEl.innerHTML = '<div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;padding:0 16px">📎 附件 (' + a.length + ')</div>' +
                  a.map(function(f, i) {
                    return '<div class="compose-attach-item" style="display:flex;align-items:center;gap:8px;padding:6px 16px;font-size:12px;border-top:1px solid #f1f5f9"><span style="flex:1">' + f.name + '</span><span style="color:#94a3b8">' + (f.dataUrl ? (typeof formatFileSize === 'function' ? formatFileSize(f.size) : (f.size + ' B')) : '需重新选择') + '</span></div>';
                  }).join('');
              }
            }, 100);
          }
          return;
        }
      }
      renderMail();
    };

    item.addEventListener("click", (event) => {
      if (event.target.closest("[data-mail-delete]")) return;
      if (event.target.closest("[data-mail-select]")) return;
      selectItem();
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectItem();
      }
    });
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      selectedMailId = item.dataset.id;
      renderMail();
      showMailContextMenu(event, renderedMessages.find((message) => message.id === item.dataset.id));
    });
  });

  mailList.querySelectorAll("[data-mail-select]").forEach((checkbox) => {
    checkbox.addEventListener("click", (event) => event.stopPropagation());
    checkbox.addEventListener("change", () => {
      toggleMailSelection(checkbox.dataset.mailSelect, checkbox.checked);
    });
  });

  mailList.querySelectorAll("[data-mail-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedMailId = button.dataset.mailDelete;
      deleteSelectedMail();
    });
  });

  mailList.querySelectorAll("[data-toggle-old-mails]").forEach((button) => {
    button.addEventListener("click", toggleOldMails);
  });

  renderSelectedMail(renderedMessages.find((message) => message.id === selectedMailId));
}

function filterAndSortMails(messages) {
  const keyword = String(mailSearchInput?.value || "").trim().toLowerCase();
  const filtered = messages.filter((message) => {
    const clean = normalizeMailForDisplay(message);
    if (!keyword) return true;
    const text = [
      clean.from,
      clean.to,
      clean.cc,
      clean.bcc,
      clean.subject,
      clean.snippet,
      clean.body,
      clean.date,
      formatMailDate(clean.date),
    ].join(" ").toLowerCase();
    return text.includes(keyword);
  });
  const direction = mailSortSelect?.value === "asc" ? 1 : -1;
  return filtered.sort((a, b) => direction * (new Date(a.date || 0) - new Date(b.date || 0)));
}

function normalizeMailStateForDisplay() {
  let changed = false;
  ["inbox", "sent", "drafts", "trash"].forEach((box) => {
    mailState[box] = (mailState[box] || []).map((message) => {
      const normalized = normalizeMailForDisplay(message);
      if (normalized !== message) changed = true;
      return normalized;
    });
  });
  return changed;
}

function normalizeMailForDisplay(message = {}) {
  const decodedBody = decodeStoredMailContent(message.body || message.bodyHtml || "");
  const decodedSnippet = decodeStoredMailContent(message.snippet || "");
  const rawHtmlBody = isRawMailPayload(message.bodyHtml || "");
  const readableBody = decodedBody || decodedSnippet;

  if (!readableBody && !rawHtmlBody) return message;

  const next = { ...message };
  if (readableBody) {
    next.body = readableBody;
    next.snippet = makeMailSnippet(readableBody);
  }
  if (rawHtmlBody) next.bodyHtml = "";
  return next;
}

function decodeStoredMailContent(value = "") {
  const raw = String(value || "");
  if (!raw.trim()) return "";
  if (!isRawMailPayload(raw) && !isLikelyBase64Body(raw)) return "";

  const decoded = parseStoredMimePayload(raw) || (isLikelyBase64Body(raw) ? decodeMailTransfer(raw, "base64") : "");
  return sanitizeDecodedMailText(decoded);
}

function parseStoredMimePayload(raw) {
  const source = String(raw || "");
  const boundary =
    (source.match(/^--([^\r\n-][^\r\n]*)/m) || [])[1] ||
    (source.match(/boundary="?([^";\r\n]+)"?/i) || [])[1] ||
    "";

  const parts = boundary ? splitStoredMimeBody(source, boundary).map(parseStoredMimePart).filter(Boolean) : [parseStoredMimePart(source)].filter(Boolean);
  if (!parts.length) return "";

  const best = parts.find((part) => part.mime === "text/plain" && part.body) || parts.find((part) => part.mime === "text/html" && part.body) || parts[0];
  return best?.body || "";
}

function splitStoredMimeBody(source, boundary) {
  const marker = `--${boundary}`;
  return String(source || "")
    .split(marker)
    .map((part) => part.replace(/^\r?\n/, "").replace(/\r?\n--\s*$/, "").trim())
    .filter((part) => part && part !== "--");
}

function parseStoredMimePart(partText) {
  const source = String(partText || "").trim();
  if (!source || source === "--") return null;

  const sections = source.split(/\r?\n\r?\n/);
  const headerText = sections.length > 1 ? sections.shift() : "";
  const bodyText = sections.length > 1 || headerText ? sections.join("\n\n") : source;
  const headers = parseStoredMailHeaders(headerText);
  const contentType = parseStoredContentType(headers["content-type"] || "text/plain");

  if (contentType.mime.startsWith("multipart/") && contentType.boundary) {
    return (
      splitStoredMimeBody(bodyText, contentType.boundary)
        .map(parseStoredMimePart)
        .filter(Boolean)
        .find((part) => part.mime === "text/plain" && part.body) ||
      splitStoredMimeBody(bodyText, contentType.boundary)
        .map(parseStoredMimePart)
        .filter(Boolean)
        .find((part) => part.body) ||
      null
    );
  }

  if (!contentType.mime.startsWith("text/") && !isLikelyBase64Body(bodyText)) return null;

  const body = decodeMailTransfer(bodyText, headers["content-transfer-encoding"] || (isLikelyBase64Body(bodyText) ? "base64" : ""), contentType.charset);
  return { mime: contentType.mime, body: contentType.mime === "text/html" ? stripMailHtmlForDisplay(body) : body };
}

function parseStoredMailHeaders(headerText = "") {
  const lines = String(headerText || "").split(/\r?\n/);
  const unfolded = [];
  lines.forEach((line) => {
    if (/^\s/.test(line) && unfolded.length) unfolded[unfolded.length - 1] += ` ${line.trim()}`;
    else unfolded.push(line);
  });
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

function parseStoredContentType(value = "") {
  const [mimePart, ...params] = String(value || "").split(";");
  const result = { mime: (mimePart || "text/plain").trim().toLowerCase(), charset: "utf-8", boundary: "" };
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

function isRawMailPayload(value = "") {
  const raw = String(value || "");
  return /Content-Transfer-Encoding:|Content-Type:|MIME-Version:|^--[^\r\n]+/im.test(raw);
}

function isLikelyBase64Body(value = "") {
  const compact = String(value || "").replace(/\s+/g, "");
  return compact.length > 120 && compact.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(compact);
}

function decodeMailTransfer(value = "", encoding = "", charset = "utf-8") {
  const normalized = String(encoding || "").toLowerCase();
  if (normalized.includes("base64")) return decodeMailBytes(base64ToBytes(value), charset);
  if (normalized.includes("quoted-printable")) return decodeMailBytes(quotedPrintableToBytes(value), charset);
  return String(value || "");
}

function base64ToBytes(value = "") {
  const clean = String(value || "").replace(/\s+/g, "");
  try {
    if (typeof atob === "function") {
      const binary = atob(clean);
      return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    }
    if (typeof Buffer !== "undefined") return Uint8Array.from(Buffer.from(clean, "base64"));
  } catch {
    return new Uint8Array();
  }
  return new Uint8Array();
}

function quotedPrintableToBytes(value = "") {
  const source = String(value || "").replace(/=\r?\n/g, "");
  const bytes = [];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "=" && /^[0-9a-f]{2}$/i.test(source.slice(index + 1, index + 3))) {
      bytes.push(parseInt(source.slice(index + 1, index + 3), 16));
      index += 2;
    } else {
      bytes.push(source.charCodeAt(index));
    }
  }
  return Uint8Array.from(bytes);
}

function decodeMailBytes(bytes, charset = "utf-8") {
  if (!bytes?.length) return "";
  const normalized = String(charset || "utf-8").toLowerCase();
  try {
    const label = normalized.includes("gb") ? "gb18030" : "utf-8";
    if (typeof TextDecoder !== "undefined") return new TextDecoder(label).decode(bytes);
  } catch {
    // Fall through to a byte-for-byte fallback.
  }
  return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
}

function stripMailHtmlForDisplay(value = "") {
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

function sanitizeDecodedMailText(value = "") {
  return stripMailHtmlForDisplay(value)
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeMailSnippet(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 180);
}

function renderMailListHtml(view) {
  const parts = [];

  if (view.recent.length) {
    parts.push(renderMailItems(view.recent));
  } else if (view.old.length && !showOldMails) {
    parts.push(`<div class="empty-state compact">近期没有邮件</div>`);
  }

  if (view.old.length) {
    parts.push(
      `<button class="old-mail-toggle" type="button" data-toggle-old-mails>
        <span>${showOldMails ? "收起旧邮件" : "旧邮件已隐藏"}</span>
        <strong>${view.old.length} 封</strong>
      </button>`,
    );
    if (showOldMails) parts.push(renderMailItems(view.old));
  }

  return parts.join("") || `<div class="empty-state">这个文件夹是空的</div>`;
}

function renderMailItems(messages) {
  return messages
    .map(
      (message) => {
        var custLabel = message.company || "";
        return '<article class="mail-item-foxmail ' + (message.id === selectedMailId ? "active" : "") + ' ' + (message.isRead === false ? "unread" : "") + '" data-id="' + escapeHtml(message.id) + '">' +
        '<div><div class="mail-from">' + escapeHtml(getMailParty(message)) + '</div>' +
        '<div class="mail-subject">' + escapeHtml(message.subject || "(No subject)") + '</div>' +
        '<div class="mail-snippet">' + escapeHtml(message.snippet || "") + (custLabel ? ' · <strong>' + escapeHtml(custLabel) + '</strong>' : '') + '</div></div>' +
        '<div class="mail-meta">' + escapeHtml(formatMailDate(message.date)) + (message.attachments?.length || message.hasAttachments ? ' 📎' : '') + (message.isRead === false ? '<br>未读' : '') + '</div>' +
        '</article>';
      }
    )
    .join("");
}

function renderSelectedMail(message) {
  if (!message) {
    mailReader.innerHTML = '<div class="mail-reader-empty">选择一封邮件查看内容</div>';
    return;
  }

  message = normalizeMailForDisplay(message);
  const replyTo = extractEmail(message.from || message.to || "");
  const canReply = activeMailbox === "inbox" && replyTo;
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];

  var custLink = message.company ? '<button class="ghost-btn" id="gotoCustomerBtn" data-customer-id="' + escapeHtml(message.customerId || '') + '">🔗 ' + escapeHtml(message.company) + '</button>' : '';
  var showLinkBtn = !message.customerId;
  mailReader.innerHTML = '<div class="mail-reader-content"><div class="mail-subject-line">' + escapeHtml(message.subject || "(No subject)") + '</div>' +
    '<div class="mail-meta-line">发件人：' + escapeHtml(message.from || "-") + ' · 收件人：' + escapeHtml(message.to || "-") + ' · ' + escapeHtml(formatMailDate(message.date)) + '</div>' +
    '<div class="mail-reader-actions">' +
      (canReply ? '<button class="ghost-btn" id="replyMailBtn" type="button">↩ 回复</button>' : '') +
      '<button class="ghost-btn" id="toggleReadMailBtn" type="button">' + (message.isRead === false ? '✓ 标记已读' : '○ 标记未读') + '</button>' +
      '<button class="ghost-btn danger" id="trashMailBtn" type="button">🗑 ' + (activeMailbox === "trash" ? "彻底删除" : "删除") + '</button>' +
      custLink +
      (showLinkBtn ? '<button class="ghost-btn" id="linkCustomerBtn" type="button">🔗 关联客户</button>' : '') +
    '</div>' +
    '<div class="mail-attachments">' + (attachments.length ? attachments.map(function(file) { return renderMailAttachment(file, message.id); }).join("") : "") + '</div>' +
    renderMailTrackingLinks(message.trackingLinks || []) +
    '<div class="mail-reader-body">' + (message.bodyHtml || escapeHtml(message.body || message.snippet || "")) + '</div></div>';

  const replyButton = document.querySelector("#replyMailBtn");
  if (replyButton) {
    replyButton.addEventListener("click", () => {
      openComposer({
        to: replyTo,
        subject: message.subject?.toLowerCase().startsWith("re:") ? message.subject : `Re: ${message.subject || ""}`,
        body: `\n\n----- Original Message -----\n${message.body || message.snippet || ""}`,
      });
    });
  }

  document.querySelector("#toggleReadMailBtn")?.addEventListener("click", () => updateMailMessage(message.id, { isRead: message.isRead === false }));
  mailReader.querySelector("[data-refresh-tracking]")?.addEventListener("click", () => refreshTrackingStatsForMail(message.id));
  document.querySelector("#trashMailBtn").addEventListener("click", () => deleteMail(message));
  // P0-3: Navigate to linked customer
  document.querySelector("#gotoCustomerBtn")?.addEventListener("click", () => {
    var custId = message.customerId;
    if (custId && customers.some(function(c) { return c.id === custId; })) {
      selectCustomer(custId);
      navigateToSectionById("customerSection");
      render();
    } else {
      showToast('客户记录不存在或已删除');
    }
  });
  // P0-3: Link customer to email
  document.querySelector("#linkCustomerBtn")?.addEventListener("click", () => {
    var email = extractEmail(message.from || message.to || "");
    if (!email) {
      showToast('无法从该邮件提取邮箱地址，请手动创建客户后在客户详情中关联');
      return;
    }
    var domain = email.split('@')[1] || '';
    var matches = customers.filter(function(c) {
      var ce = (c.email || '').toLowerCase();
      var cw = (c.website || '').toLowerCase();
      return ce.indexOf(email.toLowerCase()) >= 0 || (domain && cw.indexOf(domain) >= 0);
    });
    if (matches.length === 1) {
      updateMailMessage(message.id, { customerId: matches[0].id, company: matches[0].company });
      showToast('已关联: ' + matches[0].company);
      renderMail();
    } else if (matches.length > 1) {
      var list = matches.map(function(c, i) { return (i+1) + '. ' + c.company + ' (' + c.email + ')'; }).join('\n');
      var idx = parseInt(prompt('找到多个匹配客户，输入序号选择：\n' + list + '\n0. 创建新客户')) || 0;
      if (idx > 0 && idx <= matches.length) {
        updateMailMessage(message.id, { customerId: matches[idx-1].id, company: matches[idx-1].company });
        showToast('已关联'); renderMail();
      } else if (idx === 0) {
        var name = email ? email.split('@')[0] : 'New Contact';
        var c = window.FORYAL_CRM?.addCustomer({ company: name, email: email });
        if (c) { updateMailMessage(message.id, { customerId: c.id, company: c.company }); showToast('客户已创建并关联'); renderMail(); }
      }
    } else {
      if (confirm('未找到匹配客户。创建新客户 "' + email + '" 吗？')) {
        var nm = email ? email.split('@')[0] : 'New Contact';
        var nc = window.FORYAL_CRM?.addCustomer({ company: nm, email: email });
        if (nc) { updateMailMessage(message.id, { customerId: nc.id, company: nc.company }); showToast('客户已创建并关联'); renderMail(); }
      }
    }
  });
}

function renderMailTrackingLinks(links) {
  if (!Array.isArray(links) || !links.length) return "";
  return `<section class="tracked-link-list">
    <div class="history-detail-head">
      <div>
        <p class="eyebrow">Cloud Tracking</p>
        <h4>云端追踪附件</h4>
      </div>
      <button class="ghost-btn" type="button" data-refresh-tracking>刷新追踪</button>
    </div>
    ${links.map((link) => {
      const stats = link.stats || {};
      return `<article class="tracked-link-card">
        <strong>${escapeHtml(link.fileName || "Tracked attachment")}</strong>
        <a href="${escapeAttr(link.previewUrl || "#")}" target="_blank" rel="noreferrer">${escapeHtml(link.previewUrl || "")}</a>
        <span>${escapeHtml(formatFileSize(link.size || 0))} · ${escapeHtml(link.type || "unknown")}</span>
        <span>预览页打开 ${escapeHtml(stats.openCount || 0)} 次 · 下载 ${escapeHtml(stats.downloadCount || 0)} 次 · 预览最长停留 ${escapeHtml(formatDuration(stats.maxActiveSeconds || 0))} · 最近预览 ${escapeHtml(stats.lastOpenedAt ? formatMailDate(stats.lastOpenedAt) : "-")}</span>
      </article>`;
    }).join("")}
  </section>`;
}

async function refreshTrackingStatsForMail(messageId) {
  const message = findMailById(messageId);
  const links = Array.isArray(message?.trackingLinks) ? message.trackingLinks : [];
  const ids = links.map((link) => link.id).filter(Boolean);
  if (!ids.length) return;
  try {
    const response = await fetch(`/api/tracking/stats?ids=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || result.error || "TRACKING_STATS_FAILED");
    links.forEach((link) => {
      link.stats = result.stats?.[link.id] || link.stats || null;
    });
    saveMailState();
    renderMail();
    showToast("云端追踪已刷新");
  } catch (error) {
    showToast(`追踪刷新失败：${error.message || "请检查 Blob Storage 配置"}`);
  }
}

function findMailById(id) {
  for (const box of ["inbox", "sent", "drafts", "trash"]) {
    const row = (mailState[box] || []).find((message) => message.id === id);
    if (row) return row;
  }
  return null;
}

function formatDuration(seconds) {
  const value = Math.max(0, Number(seconds || 0));
  if (value >= 3600) return `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`;
  if (value >= 60) return `${Math.floor(value / 60)}m ${value % 60}s`;
  return `${value}s`;
}

function getMailFolders() {
  const inbox = mailState.inbox.filter((message) => !mailState.hiddenInboxUids.includes(message.uid)).filter(canCurrentUserViewMail);
  const drafts = (mailState.drafts || []).filter(canCurrentUserViewMail);
  const sent = mailState.sent.filter(canCurrentUserViewMail);
  const trash = mailState.trash.filter(canCurrentUserViewMail);
  return {
    history: [...inbox, ...sent, ...drafts],
    inbox,
    sent,
    drafts,
    trash,
  };
}

function renderMailAttachment(file, messageId = "") {
  const name = file.name || file.filename || "attachment";
  const meta = `${formatFileSize(Number(file.size || 0))} · ${file.type || "unknown"}`;
  if (file.dataUrl) {
    return `<a class="mail-attachment-chip" href="${escapeAttr(file.dataUrl)}" download="${escapeAttr(name)}">${escapeHtml(name)}<span>${escapeHtml(meta)}</span></a>`;
  }
  return `<span class="mail-attachment-chip">${escapeHtml(name)}<span>${escapeHtml(meta)}</span></span>`;
}

function canCurrentUserViewMail(message) {
  if (currentUser?.role === "admin") return true;
  const userEmails = [currentUser?.email, currentUser?.mailbox].filter(Boolean).map((item) => String(item).toLowerCase());
  const parties = [message.from, message.to, message.cc, message.bcc].join(" ").toLowerCase();
  return userEmails.some((email) => email && parties.includes(email)) || String(message.createdBy || "") === currentUser?.name;
}

function updateMailMessage(id, patch) {
  ["inbox", "sent", "drafts", "trash"].forEach((box) => {
    const row = (mailState[box] || []).find((message) => message.id === id);
    if (row) Object.assign(row, patch);
  });
  saveMailState();
  renderMail();
}

function getMailboxView(messages) {
  const recent = [];
  const old = [];

  messages.forEach((message) => {
    if (isOldMail(message)) {
      old.push(message);
    } else {
      recent.push(message);
    }
  });

  return {
    recent,
    old,
    rendered: showOldMails ? [...recent, ...old] : recent,
  };
}

function isOldMail(message) {
  const date = new Date(message.deletedAt || message.date || "");
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > OLD_MAIL_DAYS * 24 * 60 * 60 * 1000;
}

function syncSelectedMailIds(renderedMessages) {
  const renderedIds = new Set(renderedMessages.map((message) => message.id));
  selectedMailIds = new Set([...selectedMailIds].filter((id) => renderedIds.has(id)));
}

function updateBulkMailToolbar(renderedMessages, oldCount) {
  const selectedCount = selectedMailIds.size;
  const allShownSelected = renderedMessages.length > 0 && renderedMessages.every((message) => selectedMailIds.has(message.id));
  const someShownSelected = renderedMessages.some((message) => selectedMailIds.has(message.id));

  if (selectAllVisibleMails) {
    selectAllVisibleMails.disabled = renderedMessages.length === 0;
    selectAllVisibleMails.checked = allShownSelected;
    selectAllVisibleMails.indeterminate = someShownSelected && !allShownSelected;
  }
  if (selectedMailCount) selectedMailCount.textContent = selectedCount ? `已选择 ${selectedCount} 封` : "未选择邮件";

  const deleteText = activeMailbox === "trash" ? "彻底删除" : "删除所选";
  if (deleteCheckedMailsBtn) {
    deleteCheckedMailsBtn.disabled = selectedCount === 0;
    deleteCheckedMailsBtn.textContent = selectedCount ? `${deleteText} ${selectedCount} 封` : deleteText;
  }

  const selectedButton = document.querySelector("#deleteSelectedMailBtn");
  if (selectedButton) {
    selectedButton.disabled = selectedCount === 0 && renderedMessages.length === 0;
    selectedButton.textContent =
      activeMailbox === "trash"
        ? selectedCount
          ? `彻底删除 ${selectedCount} 封`
          : "彻底删除"
        : selectedCount
          ? `删除所选 ${selectedCount} 封`
          : "删除选中邮件";
  }

  if (toggleOldMailsBtn) {
    toggleOldMailsBtn.disabled = oldCount === 0;
    toggleOldMailsBtn.textContent = oldCount ? `${showOldMails ? "收起旧邮件" : "展开旧邮件"}（${oldCount}）` : "没有旧邮件";
  }
}

function toggleSelectAllVisibleMails() {
  const view = getMailboxView(filterAndSortMails(getMailFolders()[activeMailbox] || []));
  if (selectAllVisibleMails.checked) {
    view.rendered.forEach((message) => selectedMailIds.add(message.id));
  } else {
    view.rendered.forEach((message) => selectedMailIds.delete(message.id));
  }
  renderMail();
}

function toggleMailSelection(id, checked) {
  if (checked) {
    selectedMailIds.add(id);
    selectedMailId = id;
  } else {
    selectedMailIds.delete(id);
  }
  renderMail();
}

function toggleOldMails() {
  showOldMails = !showOldMails;
  if (!showOldMails) {
    const view = getMailboxView(filterAndSortMails(getMailFolders()[activeMailbox] || []));
    const recentIds = new Set(view.recent.map((message) => message.id));
    selectedMailIds = new Set([...selectedMailIds].filter((id) => recentIds.has(id)));
    if (selectedMailId && !recentIds.has(selectedMailId)) selectedMailId = null;
  }
  renderMail();
}

function getSelectedMessages() {
  const folder = getMailFolders()[activeMailbox] || [];
  return folder.filter((message) => selectedMailIds.has(message.id));
}

function deleteSelectedMail() {
  const checkedMessages = getSelectedMessages();
  if (checkedMessages.length) {
    deleteMails(checkedMessages);
    return;
  }

  const message = (getMailFolders()[activeMailbox] || []).find((item) => item.id === selectedMailId);
  if (!message) {
    showToast("请先选择一封邮件");
    return;
  }

  deleteMail(message);
}

function deleteMail(message) {
  hideMailContextMenu();
  const permanently = activeMailbox === "trash";
  const ok = confirm(permanently ? "确认彻底删除这封邮件？此操作不能恢复。" : "确认把这封邮件移到垃圾箱？");
  if (!ok) return;

  moveMailsToTrash([message], permanently);
}

function deleteMails(messages) {
  hideMailContextMenu();
  if (!messages.length) {
    showToast("请先选择邮件");
    return;
  }

  const permanently = activeMailbox === "trash";
  const ok = confirm(permanently ? `确认彻底删除选中的 ${messages.length} 封邮件？此操作不能恢复。` : `确认把选中的 ${messages.length} 封邮件移到垃圾箱？`);
  if (!ok) return;

  moveMailsToTrash(messages, permanently);
}

function moveMailsToTrash(messages, permanently = activeMailbox === "trash") {
  const ids = new Set(messages.map((message) => message.id));
  if (permanently) {
    mailState.trash = mailState.trash.filter((item) => !ids.has(item.id));
  } else {
    const deletedAt = new Date().toISOString();
    const existingTrashIds = new Set((mailState.trash || []).map((message) => message.id));
    mailState.trash.unshift(
      ...messages
        .filter((message) => !existingTrashIds.has(message.id))
        .map((message) => ({ ...message, deletedFrom: message.mailbox || activeMailbox, deletedAt })),
    );
    const uids = messages.map((message) => message.uid).filter(Boolean);
    mailState.hiddenInboxUids = Array.from(new Set([...(mailState.hiddenInboxUids || []), ...uids]));
    removeMailIdsFromActiveStores(ids);
  }
  selectedMailId = null;
  selectedMailIds.clear();
  saveMailState();
  renderMail();
  showToast(permanently ? `已彻底删除 ${messages.length} 封邮件` : `已移到垃圾箱 ${messages.length} 封邮件`);
}

function removeMailIdsFromActiveStores(ids) {
  mailState.inbox = (mailState.inbox || []).filter((item) => !ids.has(item.id));
  mailState.sent = (mailState.sent || []).filter((item) => !ids.has(item.id));
  mailState.drafts = (mailState.drafts || []).filter((item) => !ids.has(item.id));
}

function showMailContextMenu(event, message) {
  if (!message) return;
  hideMailContextMenu();

  const checkedMessages = getSelectedMessages();
  const useSelection = selectedMailIds.has(message.id) && checkedMessages.length > 1;
  const menu = document.createElement("div");
  menu.className = "mail-context-menu";
  menu.innerHTML = `<button type="button">${
    useSelection
      ? activeMailbox === "trash"
        ? `彻底删除所选 ${checkedMessages.length} 封`
        : `删除所选 ${checkedMessages.length} 封`
      : activeMailbox === "trash"
        ? "彻底删除"
        : "移到垃圾箱"
  }</button>`;
  document.body.appendChild(menu);

  const x = Math.min(event.clientX, window.innerWidth - 148);
  const y = Math.min(event.clientY, window.innerHeight - 46);
  menu.style.left = `${Math.max(8, x)}px`;
  menu.style.top = `${Math.max(8, y)}px`;
  menu.querySelector("button").addEventListener("click", () => (useSelection ? deleteMails(checkedMessages) : deleteMail(message)));

  setTimeout(() => document.addEventListener("click", hideMailContextMenu, { once: true }), 0);
}

function hideMailContextMenu() {
  document.querySelector(".mail-context-menu")?.remove();
}

function stripSubject(text) {
  return String(text || "")
    .replace(/^Subject:.*(?:\r?\n){1,2}/i, "")
    .trim();
}

function getMailParty(message) {
  if (activeMailbox === "sent" || activeMailbox === "drafts") return `To: ${message.to || ""}`;
  return `From: ${message.from || ""}`;
}

function formatMailDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatFileSize(size) {
  const value = Number(size || 0);
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function getMailboxLabel(mailbox) {
  const labels = {
    history: "历史邮件",
    inbox: "收件箱",
    sent: "发件箱",
    drafts: "草稿箱",
    trash: "垃圾箱",
  };
  return labels[mailbox] || "邮件";
}

function extractEmail(value) {
  return String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
}

function getInboxErrorMessage(code) {
  var m = String(code || '');
  var messages = {
    POP3_NOT_CONFIGURED: "请先在邮箱账户设置里填写收件服务器（IMAP/POP3）、端口、邮箱和授权码",
    INBOX_FAILED: "收件箱读取失败，请检查服务器地址、端口、密码是否正确",
    'Invalid login': "邮箱密码或授权码错误",
    'Login failed': "邮箱密码或授权码错误",
    'Authentication failed': "邮箱密码或授权码错误",
    'timed out': "收件服务器连接超时，请检查网络和服务器地址",
    'ECONNREFUSED': "无法连接到收件服务器，请检查服务器地址和端口",
    'ENOTFOUND': "找不到收件服务器地址，请检查域名是否正确",
    'certificate': "SSL/TLS连接失败，请检查端口和安全设置",
  };
  for (var key in messages) {
    if (m.indexOf(key) >= 0) return messages[key];
  }
  return '收件箱读取失败：' + m;
}

async function refreshReminders() {
  if (location.protocol === "file:") {
    showToast("请在 Vercel 线上地址刷新提醒");
    return;
  }

  const button = document.querySelector("#refreshRemindersBtn");
  button.disabled = true;
  button.textContent = "刷新中";

  try {
    const countries = getReminderCountries();
    const holidayMap = {};
    const years = [new Date().getFullYear(), new Date().getFullYear() + 1];

    for (const country of countries) {
      holidayMap[country] = [];
      for (const year of years) {
        const response = await fetch(`/api/holidays?country=${encodeURIComponent(country)}&year=${year}`);
        const result = await response.json().catch(() => ({ holidays: [] }));
        holidayMap[country].push(...(result.holidays || []));
      }
    }

    reminderCache = buildReminders(holidayMap);
    renderReminders();
    showToast("提醒已刷新");
  } catch {
    showToast("提醒刷新失败");
  } finally {
    button.disabled = false;
    button.textContent = "刷新提醒";
  }
}

function getReminderCountries() {
  const selected = getSelectedCustomer()?.country || "";
  const sentCountries = mailState.sent.map((mail) => mail.country).filter(Boolean);
  const priorityCountries = customers
    .filter((customer) => customer.email && customer.priority === "A")
    .map((customer) => customer.country)
    .filter(Boolean)
    .slice(0, 40);
  return Array.from(new Set([selected, ...sentCountries, ...priorityCountries].map(normalizeCountryText).filter(Boolean))).slice(0, 30);
}

function buildReminders(holidayMap = {}) {
  const reminders = [];
  const todayDate = startOfDay(new Date());
  const sentByRecipient = new Map();

  for (const mail of mailState.sent) {
    const key = String(mail.to || "").toLowerCase();
    if (!key || sentByRecipient.has(key)) continue;
    sentByRecipient.set(key, mail);
  }

  for (const mail of sentByRecipient.values()) {
    const customer = mail.customerId ? customers.find((item) => item.id === mail.customerId) : findCustomerByEmail(mail.to);
    const country = normalizeCountryText(mail.country || customer?.country || "");
    const holidays = holidayMap[country] || [];
    const sentDate = startOfDay(new Date(mail.date));
    const dueDate = addBusinessDays(sentDate, 8, holidays);
    const daysUntil = daysBetween(todayDate, dueDate);

    if (daysUntil <= 3) {
      reminders.push({
        type: "followup",
        urgent: daysUntil <= 0,
        title: `${customer?.company || mail.company || mail.to} 跟进`,
        date: dueDate.toISOString(),
        description:
          daysUntil <= 0
            ? `首封邮件已到跟进时间。建议根据上一封邮件继续确认客户是否愿意看目录、型号或报价。`
            : `${daysUntil} 天后需要跟进。`,
        customer,
        mail,
      });
    }
  }

  for (const customer of customers) {
    for (const record of customer.followUps || []) {
      if (!record.nextDate) continue;
      const dueDate = startOfDay(new Date(record.nextDate));
      if (Number.isNaN(dueDate.getTime())) continue;
      const daysUntil = daysBetween(todayDate, dueDate);

      if (daysUntil <= 3) {
        reminders.push({
          type: "manual-followup",
          urgent: daysUntil <= 0,
          title: `${customer.company || customer.contact || "客户"} 再次联系`,
          date: dueDate.toISOString(),
          description:
            daysUntil <= 0
              ? `备注提醒已到期：${record.nextAction || record.nextStep || record.summary || "请再次联系客户"}`
              : `${daysUntil} 天后需要联系客户：${record.nextAction || record.nextStep || record.summary || "跟进客户"}`,
          customer,
          record,
        });
      }
    }
  }

  // Dormant customer reminders (30/60/90 day thresholds)
  for (const customer of customers) {
    if (customer.isBlacklisted === "是" || customer.stage === "已成交") continue;
    const lastDate = getCustomerLastActivityDate(customer);
    if (!lastDate) continue;
    const daysSince = daysBetween(startOfDay(new Date(lastDate)), todayDate);
    if (daysSince < 30) continue;

    const level = daysSince > 90 ? "深度沉睡" : daysSince > 60 ? "中度沉睡" : "轻度沉睡";
    const channel = daysSince > 90 ? "WhatsApp" : daysSince > 60 ? "LinkedIn" : "Email";
    reminders.push({
      type: "dormant",
      urgent: daysSince > 60,
      title: `${customer.company || customer.contact || "客户"} 沉睡提醒`,
      date: today(),
      description: `${level} (${daysSince}天未联系)，建议通过${channel}重新触达。`,
      customer,
    });
  }

  const holidayCustomers = customers
    .filter((customer) => customer.email && (customer.priority === "A" || customer.id === selectedId))
    .slice(0, 80);

  for (const customer of holidayCustomers) {
    const country = normalizeCountryText(customer.country || "");
    const holidays = holidayMap[country] || [];
    for (const holiday of holidays) {
      const holidayDate = startOfDay(new Date(holiday.date));
      const daysUntil = daysBetween(todayDate, holidayDate);
      if (daysUntil >= 1 && daysUntil <= 2) {
        reminders.push({
          type: "holiday",
          urgent: false,
          title: `${customer.company} 节日祝福`,
          date: holiday.date,
          description: `${customer.country} 即将迎来 ${holiday.localName || holiday.name}，可以提前发一封简短祝福邮件。`,
          customer,
          holiday,
        });
      }
    }
  }

  return reminders
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 40);
}

function renderReminders() {
  if (!reminderList) return;
  const reminders = reminderCache.length ? reminderCache : buildReminders({});

  if (!reminders.length) {
    reminderList.innerHTML = `<div class="empty-state">暂无提醒。发出开发信后，系统会按 7-10 天生成跟进提醒；点击刷新提醒可检查客户国家节假日。</div>`;
    return;
  }

  reminderList.innerHTML = reminders
    .map(
      (reminder, index) => `<article class="reminder-card ${reminder.urgent ? "urgent" : ""}">
        <h4>${escapeHtml(reminder.title)}</h4>
        <p>${escapeHtml(formatMailDate(reminder.date))}</p>
        <p>${escapeHtml(reminder.description)}</p>
        <div class="reminder-actions">
          <button class="ghost-btn" type="button" data-reminder-action="draft" data-index="${index}">生成邮件</button>
          ${reminder.customer?.email ? `<button class="ghost-btn" type="button" data-reminder-action="compose" data-index="${index}">打开写信</button>` : ""}
        </div>
      </article>`,
    )
    .join("");

  reminderList.querySelectorAll("[data-reminder-action]").forEach((button) => {
    button.addEventListener("click", () => handleReminderAction(button.dataset.reminderAction, reminders[Number(button.dataset.index)]));
  });
}

function handleReminderAction(action, reminder) {
  if (!reminder) return;
  const customer = reminder.customer || findCustomerByEmail(reminder.mail?.to);

  if (action === "compose") {
    openComposer({ customer });
    return;
  }

  const holidayText = reminder.holiday ? `${reminder.holiday.localName || reminder.holiday.name} on ${reminder.holiday.date}` : "";
  const subject =
    reminder.type === "holiday"
      ? `Warm wishes for ${reminder.holiday?.name || "the holiday"}`
      : reminder.type === "manual-followup"
        ? `Follow-up: ${customer?.company || "coffee machine supply"}`
        : `Follow-up: ${reminder.mail?.subject || "coffee machine supply"}`;
  const body =
    reminder.type === "holiday"
      ? `Hi ${customer?.contact || "there"},\n\nWarm wishes for ${reminder.holiday?.name || "the holiday"}. I hope everything is going well for your team.\n\nBest regards,\n${currentUser?.name || "Lina Mei"}\nDemo Export Company`
      : `Hi ${customer?.contact || "there"},\n\nI wanted to follow up on our previous communication${reminder.record?.summary ? `: ${reminder.record.summary}` : ""}.\n\nWould it be useful if I resend the coffee machine catalog, suitable models, MOQ and FOB reference for your review?\n\nBest regards,\n${currentUser?.name || "Lina Mei"}\nDemo Export Company`;

  if (!aiMode || !aiContextInput || !mailBodyInput) {
    openStandaloneComposer({ customer, subject, body, type: reminder.type === "holiday" ? "holiday" : "followup" });
    return;
  }

  aiMode.value = reminder.type === "holiday" ? "holiday" : "followup";
  aiContextInput.value =
    reminder.type === "holiday"
      ? `Please write a short holiday greeting email for ${customer?.company || "this customer"}. Holiday: ${holidayText}. Keep it warm, brief, and not salesy.`
      : reminder.type === "manual-followup"
        ? `Please write a follow-up email for ${customer?.company || "this customer"} based on this CRM note:\n\n${reminder.record?.summary || ""}\n\nNext step/reminder:\n${reminder.record?.nextAction || reminder.record?.nextStep || reminder.description || ""}`
      : `Please write a follow-up email based on my first email below. Ask politely whether they would like to review catalog, suitable models, or price range.\n\nFirst email:\n${reminder.mail?.body || ""}`;
  openComposer({
    customer,
    subject,
  });
  askAiEmailAssistant();
}

function addBusinessDays(date, days, holidays = []) {
  const holidaySet = new Set(holidays.map((holiday) => holiday.date));
  const result = new Date(date);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    const iso = result.toISOString().slice(0, 10);
    if (day !== 0 && day !== 6 && !holidaySet.has(iso)) added++;
  }

  return result;
}

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function daysBetween(from, to) {
  return Math.ceil((startOfDay(to) - startOfDay(from)) / 86400000);
}

function getCustomerLastActivityDate(customer) {
  if (!customer) return "";
  const dates = [];
  // Last followup date
  (customer.followUps || []).forEach((f) => { if (f.date) dates.push(f.date); });
  // Last sent mail to this customer
  const email = (customer.email || "").trim().toLowerCase();
  if (email) {
    mailState.sent.forEach((m) => {
      if ((m.to || "").toLowerCase().includes(email) && m.date) dates.push(m.date);
    });
    mailState.inbox.forEach((m) => {
      if ((m.from || "").toLowerCase().includes(email) && m.date) dates.push(m.date);
    });
  }
  // Last update
  if (customer.updatedAt) dates.push(customer.updatedAt);
  // Return most recent date
  if (!dates.length) return "";
  dates.sort().reverse();
  return dates[0];
}

function normalizeCountryText(value) {
  return String(value || "")
    .split(/[\/,;]/)[0]
    .trim();
}

function getEmailErrorMessage(code) {
  const messages = {
    SMTP_NOT_CONFIGURED: "邮箱还没绑定",
    INVALID_RECIPIENT: "客户邮箱格式不对",
    EMPTY_MESSAGE: "邮件内容为空",
    MESSAGE_TOO_LONG: "邮件内容太长",
    SEND_FAILED: "邮件发送失败",
  };

  return messages[code] || "邮件发送失败";
}

function setModuleModeFromBridge(enabled) {
  if (enabled) document.body.classList.remove("is-mail-view");
  document.querySelector("#moduleWorkbench")?.toggleAttribute("hidden", !enabled);
  ["#customerSection", ".bottom-grid", "#mailSection", "#reminderPanel", "#settingsPanel"].forEach((selector) => {
    document.querySelector(selector)?.classList.toggle("is-module-hidden", enabled);
  });
  document.querySelectorAll(".wk-module-item, .nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelector('[data-nav-target="customerSection"]')?.classList.add("active");
}

function createTrackingState(recipientEmail) {
  return {
    trackingId: crypto.randomUUID(),
    emailId: "",
    recipientEmail,
    opened: false,
    openCount: 0,
    lastOpenedAt: "",
    linkClicks: 0,
    attachmentOpens: 0,
    lastAttachmentOpenedAt: "",
    deviceInfo: "模拟追踪",
    locationApprox: "模拟位置",
    createdAt: new Date().toISOString(),
  };
}

function importCustomersCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsvRows(String(reader.result || ""));
    if (rows.length < 2) {
      showToast("CSV 没有可导入的数据");
      return;
    }

    const headers = rows[0].map((item) => item.trim());
    const fieldMap = {
      company: ["公司", "公司名", "公司名称", "company"],
      contact: ["联系人", "contact"],
      title: ["职位", "title"],
      country: ["国家", "国家/地区", "country"],
      website: ["官网", "website"],
      source: ["客户来源", "来源", "source"],
      segment: ["客户类型", "客户行业", "segment"],
      stage: ["阶段", "跟进阶段", "stage"],
      priority: ["优先级", "客户等级", "grade", "priority"],
      owner: ["负责人", "owner"],
      linkedin: ["LinkedIn", "linkedin"],
      instagram: ["Instagram", "instagram"],
      facebook: ["Facebook", "facebook"],
      youtube: ["YouTube", "youtube"],
      email: ["邮箱", "email"],
      whatsapp: ["WhatsApp", "手机", "whatsapp"],
      product: ["推荐产品", "意向产品", "product"],
      volume: ["预计年需求", "volume"],
      paymentRisk: ["付款风险", "paymentRisk", "risk"],
      isQuoted: ["是否已报价", "isQuoted"],
      isSample: ["是否样品客户", "isSample"],
      isBlacklisted: ["是否黑名单", "blacklisted", "isBlacklisted"],
      notes: ["备注", "notes"],
    };

    const imported = rows
      .slice(1)
      .filter((row) => row.some(Boolean))
      .map((row) => {
        const customer = {
          id: crypto.randomUUID(),
          followUps: [],
          segment: "进口商",
          stage: "新线索",
          priority: "B",
          owner: currentUser?.name || "Lina",
          product: "CM-1700MY",
          paymentRisk: "未知",
          isQuoted: "否",
          isSample: "否",
          isBlacklisted: "否",
        };
        Object.entries(fieldMap).forEach(([field, labels]) => {
          const index = headers.findIndex((header) => labels.some((label) => label.toLowerCase() === header.toLowerCase()));
          if (index >= 0) customer[field] = row[index] || customer[field] || "";
        });
        return customer;
      });

    customers = mergeCustomers([...imported, ...customers]);
    selectedId = imported[0]?.id || selectedId;
    saveCustomers();
    render();
    importCustomersInput.value = "";
    showToast(`已导入 ${imported.length} 个客户`);
  };
  reader.readAsText(file, "utf-8");
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows.filter((items) => items.some((item) => item.trim()));
}

function exportCsv() {
  const header = [
    "公司",
    "联系人",
    "职位",
    "国家",
    "官网",
    "客户来源",
    "客户类型",
    "阶段",
    "优先级",
    "LinkedIn",
    "Instagram",
    "Facebook",
    "YouTube",
    "邮箱",
    "WhatsApp",
    "推荐产品",
    "预计年需求",
    "付款风险",
    "是否已报价",
    "是否样品客户",
    "是否黑名单",
    "备注"
  ];
  const rows = customers.map((customer) => [
    customer.company,
    customer.contact,
    customer.title,
    customer.country,
    customer.website,
    customer.source,
    customer.segment,
    customer.stage,
    customer.priority,
    customer.linkedin,
    customer.instagram,
    customer.facebook,
    customer.youtube,
    customer.email,
    customer.whatsapp,
    customer.product,
    customer.volume,
    customer.paymentRisk,
    customer.isQuoted,
    customer.isSample,
    customer.isBlacklisted,
    customer.notes
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `coffee-machine-crm-${today()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("CSV 已导出");
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
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

window.FORYAL_CRM = {
  getCustomers: () => customers,
  getSelectedCustomer: () => getSelectedCustomer(),
  getMailState: () => mailState,
  getCurrentUser: () => currentUser,
  getUsers: () => crmUsers,
  getSignatures: () => signatures,
  canViewCustomer: canCurrentUserViewCustomer,
  saveCustomers: () => saveCustomers(),
  replaceCustomers(nextCustomers = []) {
    customers.splice(0, customers.length, ...(Array.isArray(nextCustomers) ? nextCustomers : []));
    if (!customers.some((item) => item.id === selectedId)) selectedId = customers[0]?.id || null;
    saveCustomers();
    render();
    return customers;
  },
  selectCustomer(id) {
    if (!id) return null;
    selectedId = id;
    setModuleModeFromBridge(false);
    setStandaloneSection("customerSection");
    render();
    document.querySelector("#customerSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return getSelectedCustomer();
  },
  updateCustomer(id, patch = {}) {
    const customer = customers.find((item) => item.id === id);
    if (!customer) return null;
    Object.assign(customer, patch, { updatedAt: today() });
    saveCustomers();
    render();
    return customer;
  },
  appendCustomerNote(id, title, body) {
    const customer = customers.find((item) => item.id === id);
    if (!customer) return null;
    const block = `【${title || "AI助手备注"}-${today()}】\n${body || ""}`;
    customer.notes = [customer.notes || "", block].filter(Boolean).join("\n\n");
    customer.updatedAt = today();
    saveCustomers();
    render();
    return customer;
  },
  addFollowUp(customerId, record = {}) {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return null;
    const follow = {
      id: crypto.randomUUID(),
      date: record.date || today(),
      contact: record.contact || customer.contact || "",
      channel: record.channel || "Email",
      summary: record.summary || "已联系客户",
      feedback: record.feedback || "",
      concerns: record.concerns || "",
      stage: record.stage || customer.stage || "已联系",
      nextAction: record.nextAction || record.nextStep || "继续跟进客户反馈",
      nextStep: record.nextAction || record.nextStep || "继续跟进客户反馈",
      nextDate: record.nextDate || "",
      createdBy: currentUser?.name || "Lina",
      updatedBy: currentUser?.name || "Lina",
    };
    customer.followUps = Array.isArray(customer.followUps) ? customer.followUps : [];
    customer.followUps.unshift(follow);
    customer.stage = follow.stage || customer.stage;
    customer.nextDate = follow.nextDate || customer.nextDate || "";
    customer.updatedAt = today();
    customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
    customer.timeline.unshift({ id: crypto.randomUUID(), date: today(), type: "跟进记录", content: follow.summary });
    saveCustomers();
    render();
    return follow;
  },
  addCustomer(record = {}) {
    const withIds = (items) => Array.isArray(items)
      ? items.map((item) => ({ ...item, id: item?.id || crypto.randomUUID() }))
      : [];
    const timeline = withIds(record.timeline);
    const customer = {
      id: record.id || crypto.randomUUID(),
      company: record.company || record.name || "未命名客户",
      contact: record.contact || "",
      title: record.title || "",
      country: record.country || "",
      industry: record.industry || "",
      tags: record.tags || "",
      segment: record.segment || record.customerType || "进口商",
      customerType: record.customerType || record.segment || "进口商",
      stage: record.stage || "新线索",
      priority: record.priority || record.grade || "B",
      owner: record.owner || currentUser?.name || "Lina",
      website: record.website || "",
      officialWebsite: record.officialWebsite || record.website || "",
      linkedin: record.linkedin || "",
      instagram: record.instagram || "",
      facebook: record.facebook || "",
      youtube: record.youtube || "",
      email: record.email || "",
      whatsapp: record.whatsapp || "",
      phone: record.phone || "",
      source: record.source || "AI助手",
      product: record.product || "CM-1700MY",
      paymentRisk: record.paymentRisk || record.risk || "未知",
      isQuoted: record.isQuoted || "否",
      isSample: record.isSample || "否",
      isBlacklisted: record.isBlacklisted || "否",
      hasOwnBrand: record.hasOwnBrand || "未知",
      hasCoffeeCategory: record.hasCoffeeCategory || "未知",
      hasChinaImport: record.hasChinaImport || "未知",
      nextDate: record.nextDate || "",
      notes: record.notes || "",
      contacts: withIds(record.contacts),
      followUps: withIds(record.followUps),
      opportunities: withIds(record.opportunities),
      quotes: withIds(record.quotes),
      contracts: withIds(record.contracts),
      payments: withIds(record.payments),
      invoices: withIds(record.invoices),
      attachments: withIds(record.attachments),
      letters: withIds(record.letters),
      drafts: withIds(record.drafts),
      timeline: timeline.length ? timeline : [{ id: crypto.randomUUID(), date: today(), type: "AI助手创建", content: "从AI助手确认保存到客户池" }],
      inPool: record.inPool || "否",
      createdAt: record.createdAt || today(),
      updatedAt: record.updatedAt || today(),
    };
    customers.unshift(customer);
    selectedId = customer.id;
    saveCustomers();
    render();
    return customer;
  },
  addMailDraft(record = {}) {
    const draft = {
      id: record.id || crypto.randomUUID(),
      mailbox: "drafts",
      direction: "draft",
      from: record.from || getDefaultSenderEmail(),
      to: record.to || "",
      cc: record.cc || "",
      bcc: record.bcc || "",
      subject: record.subject || "Untitled draft",
      body: record.body || "",
      snippet: String(record.body || "").replace(/\s+/g, " ").slice(0, 180),
      date: new Date().toISOString(),
      attachments: Array.isArray(record.attachments) ? record.attachments : [],
      hasAttachments: Boolean(record.attachments?.length),
      followStatus: "草稿",
      createdBy: currentUser?.name || "Lina",
      customerId: record.customerId || "",
      company: record.company || "",
      country: record.country || "",
      tracking: createTrackingState(record.to || ""),
    };
    mailState.drafts = Array.isArray(mailState.drafts) ? mailState.drafts : [];
    mailState.drafts.unshift(draft);
    saveMailState();
    return draft;
  },
  findDuplicate(record = {}) {
    const company = String(record.company || "").trim().toLowerCase();
    const email = String(record.email || "").trim().toLowerCase();
    const website = String(record.website || "").trim().replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
    return customers.find((customer) => {
      const customerWebsite = String(customer.website || "").trim().replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
      return (company && String(customer.company || "").trim().toLowerCase() === company) ||
        (email && String(customer.email || "").trim().toLowerCase() === email) ||
        (website && customerWebsite === website);
    }) || null;
  },
  notify: showToast,
};

function generateSecurePassword(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join("");
}

function ensureOwnerAdminUsers(users = []) {
  const rows = Array.isArray(users) ? users : [];
  const now = new Date().toISOString();
  OWNER_ADMIN_EMAILS.forEach((email) => {
    const existing = rows.find((user) => user.email === email);
    if (existing) {
      existing.role = "admin";
      existing.disabled = false;
      existing.updatedAt = now;
      return;
    }
    rows.unshift(normalizeCrmUser({
      id: email === "admin@example.com" ? "user-bom" : `user-${email.split("@")[0]}`,
      name: email === "admin@example.com" ? "Bom" : "Lina",
      email,
      password: "",
      role: "admin",
      disabled: false,
      createdAt: now,
      updatedAt: now,
    }));
  });
  return rows;
}

function loadMailAccounts() {
  try {
    const stored = JSON.parse(localStorage.getItem(MAIL_ACCOUNTS_KEY) || "null");
    if (Array.isArray(stored) && stored.length) return stored.map(normalizeMailAccount);
  } catch {
    // Use fallback below.
  }
  return [
    normalizeMailAccount({
      id: "mail-demo",
      userId: "user-lina",
      type: "enterprise",
      email: "admin@example.com",
      password: "",
      smtpHost: "s406k.chinaemail.cn",
      smtpPort: "25",
      imapHost: "p406k.chinaemail.cn",
      imapPort: "110",
      ssl: false,
      tls: false,
      senderName: "Lina Mei",
      isDefault: true,
      createdAt: new Date().toISOString(),
    }),
  ];
}

function normalizeMailAccount(account = {}) {
  const createdAt = account.createdAt || new Date().toISOString();
  return {
    id: account.id || crypto.randomUUID(),
    userId: account.userId || currentUser?.id || "user-lina",
    type: account.type || "enterprise",
    email: String(account.email || "").trim().toLowerCase(),
    password: account.password || "",
    smtpHost: account.smtpHost || "",
    smtpPort: String(account.smtpPort || ""),
    imapHost: account.imapHost || account.pop3Host || "",
    imapPort: String(account.imapPort || account.pop3Port || ""),
    pop3Host: account.pop3Host || account.imapHost || "",
    pop3Port: String(account.pop3Port || account.imapPort || ""),
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

function saveMailAccounts() {
  localStorage.setItem(MAIL_ACCOUNTS_KEY, JSON.stringify(mailAccounts.map(normalizeMailAccount)));
}

function getVisibleMailAccounts() {
  if (currentUser?.role === "admin") return mailAccounts;
  return mailAccounts.filter((account) => account.userId === currentUser?.id || account.email === currentUser?.email);
}

function getDefaultMailAccount() {
  const visible = getVisibleMailAccounts();
  return visible.find((account) => account.isDefault) || visible[0] || mailAccounts.find((account) => account.isDefault) || mailAccounts[0] || null;
}

function getMailAccountTransportPayload(account = {}) {
  return {
    email: account.email || "",
    password: account.password || "",
    senderName: account.senderName || "",
    smtpHost: account.smtpHost || "",
    smtpPort: account.smtpPort || "",
    imapHost: account.imapHost || account.pop3Host || "",
    imapPort: account.imapPort || account.pop3Port || "",
    pop3Host: account.pop3Host || account.imapHost || "",
    pop3Port: account.pop3Port || account.imapPort || "",
    ssl: Boolean(account.ssl),
    tls: Boolean(account.tls),
  };
}

function getDefaultSenderEmail() {
  return getDefaultMailAccount()?.email || currentUser?.email || "admin@example.com";
}

function getCurrentUserMailAddresses() {
  const values = new Set();
  if (currentUser?.email) values.add(String(currentUser.email).toLowerCase());
  mailAccounts.forEach((account) => {
    if (currentUser?.role === "admin" || account.userId === currentUser?.id || account.email === currentUser?.email) {
      if (account.email) values.add(String(account.email).toLowerCase());
    }
  });
  return [...values];
}

function normalizeSignature(signature = {}) {
  const createdAt = signature.createdAt || new Date().toISOString();
  const html = signature.html || (signature.body ? textToHtml(signature.body) : "");
  return {
    id: signature.id || crypto.randomUUID(),
    name: signature.name || "默认签名",
    type: signature.type || "default",
    scope: signature.scope || (signature.userId ? "personal" : "public"),
    userId: signature.userId || "",
    createdBy: signature.createdBy || signature.userId || "user-lina",
    isDefault: Boolean(signature.isDefault),
    html,
    body: signature.body || htmlToPlainText(html),
    logo: signature.logo || null,
    qr: signature.qr || null,
    createdAt,
    updatedAt: signature.updatedAt || createdAt,
  };
}

function loadSignatures() {
  try {
    const stored = JSON.parse(localStorage.getItem(SIGNATURES_KEY) || "null");
    if (Array.isArray(stored) && stored.length) return stored.map(normalizeSignature);
  } catch {
    // Use default signatures.
  }
  return [
    normalizeSignature({
      id: "signature-lina-default",
      name: "Lina 默认签名",
      type: "default",
      scope: "personal",
      userId: "user-lina",
      createdBy: "user-lina",
      isDefault: true,
      html: `<div><strong>Lina Mei</strong><br>Sales Director | Demo Export Company<br>Email: admin@example.com<br>WhatsApp: +1 555 010 1000<br>Website: https://example.com</div>`,
    }),
  ];
}

function saveSignatures() {
  localStorage.setItem(SIGNATURES_KEY, JSON.stringify(signatures.map(normalizeSignature)));
}

function ensureAdvancedSettingsUi() {
  const panel = document.querySelector("#settingsPanel");
  if (!panel || document.querySelector("#settingsAdvancedTabs")) return;

  document.querySelector(".settings-users")?.setAttribute("hidden", "");
  document.querySelector(".settings-signatures")?.setAttribute("hidden", "");

  const wrapper = document.createElement("section");
  wrapper.className = "settings-advanced";
  wrapper.innerHTML = `
    <div class="settings-tabs" id="settingsAdvancedTabs" role="tablist">
      <button class="settings-tab active" type="button" data-settings-tab="ai">AI设置</button>
      <button class="settings-tab" type="button" data-settings-tab="users">用户管理</button>
      <button class="settings-tab" type="button" data-settings-tab="mail">邮箱账户设置</button>
      <button class="settings-tab" type="button" data-settings-tab="signatures">签名管理</button>
    </div>

    <section class="settings-tab-panel active" data-settings-panel="ai">
      <p class="settings-note">DeepSeek API Key、Base URL、Model 仍在上方 AI 设置表单中维护。普通用户不可修改。</p>
    </section>

    <section class="settings-tab-panel" data-settings-panel="users">
      <div class="settings-card current-user-card">
        <p class="eyebrow">Current User</p>
        <div id="advancedCurrentUser"></div>
      </div>
      <div class="section-head compact-head">
        <div>
          <p class="eyebrow">Users</p>
          <h3>用户管理</h3>
        </div>
        <input id="advancedUserSearch" dir="ltr" autocomplete="off" placeholder="搜索姓名 / 登录邮箱" />
      </div>
      <form class="settings-user-form" id="advancedUserForm">
        <input id="advancedUserId" type="hidden" />
        <label>姓名<input id="advancedUserName" required placeholder="Lina" /></label>
        <label>登录邮箱<input id="advancedUserEmail" type="email" required placeholder="sales@example.com" /></label>
        <label>登录密码<input id="advancedUserPassword" type="text" required placeholder="至少 6 位" /></label>
        <label>角色
          <select id="advancedUserRole">
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
        </label>
        <label>状态
          <select id="advancedUserStatus">
            <option value="enabled">启用</option>
            <option value="disabled">禁用</option>
          </select>
        </label>
        <div class="settings-actions">
          <button class="ghost-btn" id="generateUserPasswordBtn" type="button">自动生成密码</button>
          <button class="ghost-btn" id="resetUserFormBtn" type="button">新建</button>
          <button class="primary-btn" type="submit">保存用户</button>
        </div>
      </form>
      <div class="settings-users-table" id="advancedUsersTable"></div>
    </section>

    <section class="settings-tab-panel" data-settings-panel="mail">
      <div class="section-head compact-head">
        <div>
          <p class="eyebrow">Mail Accounts</p>
          <h3>邮箱账户设置</h3>
        </div>
        <select id="mailAccountSwitcher"></select>
      </div>
      <form class="mail-account-form" id="mailAccountForm">
        <input id="mailAccountId" type="hidden" />
        <label>邮箱类型
          <select id="mailAccountType">
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
            <option value="qq">QQ邮箱</option>
            <option value="163">163邮箱</option>
            <option value="enterprise" selected>企业邮箱</option>
            <option value="other">其他IMAP/SMTP邮箱</option>
          </select>
        </label>
        <label>邮箱地址<input id="mailAccountEmail" type="email" required placeholder="admin@example.com" /></label>
        <label>密码或授权码<input id="mailAccountPassword" type="password" placeholder="授权码 / App Password" /></label>
        <label>发件人名称<input id="mailSenderName" placeholder="Lina Mei" /></label>
        <label>发件服务器 SMTP<input id="mailSmtpHost" required placeholder="smtp.example.com" /></label>
        <label>SMTP端口<input id="mailSmtpPort" required inputmode="numeric" placeholder="465 / 587 / 25" /></label>
        <label>收件服务器 POP3 <span style="font-weight:400;font-size:11px;color:#94a3b8">（当前同步使用POP3）</span><input id="mailImapHost" required placeholder="pop.example.com" /></label>
        <label>POP3端口<input id="mailImapPort" required inputmode="numeric" placeholder="995 / 110" /></label>
        <label>默认签名<select id="mailDefaultSignature"></select></label>
        <label class="checkbox-line"><input id="mailUseSsl" type="checkbox" /> SSL</label>
        <label class="checkbox-line"><input id="mailUseTls" type="checkbox" /> TLS / STARTTLS</label>
        <label class="checkbox-line"><input id="mailAccountDefault" type="checkbox" /> 设为默认账户</label>
        <div class="settings-actions">
          <button class="ghost-btn" id="newMailAccountBtn" type="button">新建账户</button>
          <button class="ghost-btn" id="testMailAccountBtn" type="button">测试连接</button>
          <span id="mailAccountStatus"></span>
          <button class="primary-btn" type="submit">保存账户</button>
        </div>
      </form>
      <div class="mail-account-list" id="mailAccountList"></div>
    </section>

    <section class="settings-tab-panel" data-settings-panel="signatures">
      <div class="section-head compact-head">
        <div>
          <p class="eyebrow">Email Signature</p>
          <h3>邮箱签名管理</h3>
        </div>
      </div>
      <form class="signature-advanced-form" id="advancedSignatureForm">
        <input id="advancedSignatureId" type="hidden" />
        <div class="signature-meta-grid">
          <label>签名名称<input id="advancedSignatureName" required placeholder="开发信签名" /></label>
          <label>签名类型
            <select id="advancedSignatureType">
              <option value="default">默认签名</option>
              <option value="outreach">开发信签名</option>
              <option value="quote">报价签名</option>
              <option value="fair">展会签名</option>
              <option value="vip">VIP客户签名</option>
              <option value="aftersales">售后签名</option>
            </select>
          </label>
          <label>权限范围
            <select id="advancedSignatureScope">
              <option value="personal">我的签名</option>
              <option value="public">公共模板（管理员）</option>
            </select>
          </label>
          <label class="checkbox-line"><input id="advancedSignatureDefault" type="checkbox" /> 设为默认</label>
        </div>
        <div class="signature-editor-toolbar" aria-label="签名富文本工具栏">
          <select id="signatureFontName">
            <option value="Arial">Arial</option>
            <option value="Calibri">Calibri</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
          <select id="signatureFontSize">
            <option value="2">12px</option>
            <option value="3" selected>14px</option>
            <option value="4">16px</option>
            <option value="5">18px</option>
          </select>
          <input id="signatureForeColor" type="color" value="#202522" title="字体颜色" />
          <input id="signatureBackColor" type="color" value="#fff4b8" title="背景颜色" />
          <button type="button" data-signature-command="bold"><strong>B</strong></button>
          <button type="button" data-signature-command="italic"><em>I</em></button>
          <button type="button" data-signature-command="underline"><u>U</u></button>
          <button type="button" data-signature-command="strikeThrough"><s>S</s></button>
          <button type="button" data-signature-command="justifyLeft">左对齐</button>
          <button type="button" data-signature-command="justifyCenter">居中</button>
          <button type="button" data-signature-command="justifyRight">右对齐</button>
          <button type="button" data-signature-command="insertUnorderedList">项目符号</button>
          <button type="button" data-signature-command="insertOrderedList">编号列表</button>
          <button type="button" id="signatureInsertTableBtn">表格</button>
          <button type="button" id="signatureInsertLinkBtn">超链接</button>
          <button type="button" id="signatureInsertImageUrlBtn">图片URL</button>
          <button type="button" id="signatureInsertHrBtn">分割线</button>
        </div>
        <div id="signatureEditor" class="signature-rich-editor" contenteditable="true" data-placeholder="在这里编辑邮箱签名，支持变量、Logo、二维码、社媒链接。"></div>
        <div class="signature-tools-grid">
          <fieldset>
            <legend>公司Logo</legend>
            <input id="signatureLogoUrl" placeholder="Logo 图片URL" />
            <input id="signatureLogoFile" type="file" accept="image/*" />
            <input id="signatureLogoWidth" inputmode="numeric" value="160" />
            <button class="ghost-btn" id="signatureInsertLogoBtn" type="button">插入Logo</button>
          </fieldset>
          <fieldset>
            <legend>二维码</legend>
            <select id="signatureQrType">
              <option value="WhatsApp">WhatsApp二维码</option>
              <option value="WeChat">WeChat二维码</option>
              <option value="Website">Website二维码</option>
              <option value="Catalog">产品目录二维码</option>
            </select>
            <input id="signatureQrUrl" placeholder="二维码图片URL" />
            <input id="signatureQrFile" type="file" accept="image/*" />
            <input id="signatureQrWidth" inputmode="numeric" value="110" />
            <button class="ghost-btn" id="signatureInsertQrBtn" type="button">插入二维码</button>
          </fieldset>
          <fieldset>
            <legend>电子名片</legend>
            <input id="cardNameInput" placeholder="姓名" />
            <input id="cardPositionInput" placeholder="职位" />
            <input id="cardCompanyInput" placeholder="公司" value="Demo Export Company" />
            <input id="cardEmailInput" placeholder="邮箱" />
            <input id="cardPhoneInput" placeholder="电话" />
            <input id="cardWhatsappInput" placeholder="WhatsApp" />
            <input id="cardWebsiteInput" placeholder="Website" />
            <button class="ghost-btn" id="signatureInsertCardBtn" type="button">插入电子名片</button>
          </fieldset>
          <fieldset>
            <legend>社媒链接</legend>
            <input id="socialLinkedinInput" placeholder="LinkedIn URL" />
            <input id="socialInstagramInput" placeholder="Instagram URL" />
            <input id="socialFacebookInput" placeholder="Facebook URL" />
            <input id="socialYoutubeInput" placeholder="YouTube URL" />
            <input id="socialTiktokInput" placeholder="TikTok URL" />
            <input id="socialWebsiteInput" placeholder="Website URL" />
            <button class="ghost-btn" id="signatureInsertSocialBtn" type="button">插入社媒</button>
          </fieldset>
        </div>
        <div class="signature-variable-row">
          ${["UserName", "Position", "Company", "Email", "Phone", "WhatsApp", "Website"].map((name) => `<button class="ghost-btn" type="button" data-signature-variable="{${name}}">{${name}}</button>`).join("")}
        </div>
        <div class="settings-actions">
          <button class="ghost-btn" id="newSignatureBtn" type="button">新建签名</button>
          <button class="ghost-btn" id="copyEditingSignatureBtn" type="button">复制当前签名</button>
          <button class="primary-btn" type="submit">保存签名</button>
        </div>
      </form>
      <div class="signature-preview-box">
        <p class="eyebrow">实时预览</p>
        <div id="signaturePreview"></div>
      </div>
      <div class="signature-list" id="advancedSignatureList"></div>
    </section>
  `;
  panel.appendChild(wrapper);
  const aiPanel = wrapper.querySelector('[data-settings-panel="ai"]');
  if (aiPanel && aiSettingsForm) {
    aiPanel.appendChild(aiSettingsForm);
  }
  bindAdvancedSettingsEvents();
}

function bindAdvancedSettingsEvents() {
  document.querySelector("#settingsAdvancedTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-settings-tab]");
    if (!button) return;
    const tab = button.dataset.settingsTab;
    document.querySelectorAll("[data-settings-tab]").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll("[data-settings-panel]").forEach((item) => item.classList.toggle("active", item.dataset.settingsPanel === tab));
  });

  document.querySelector("#advancedUserForm")?.addEventListener("submit", saveAdvancedUser);
  document.querySelector("#generateUserPasswordBtn")?.addEventListener("click", () => {
    const input = document.querySelector("#advancedUserPassword");
    if (input) input.value = generatePassword();
    showToast("已生成初始密码");
  });
  document.querySelector("#resetUserFormBtn")?.addEventListener("click", resetAdvancedUserForm);
  document.querySelector("#advancedUserSearch")?.addEventListener("input", renderUserSettings);
  document.querySelector("#advancedUsersTable")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-user-action]");
    if (button) handleUserAction(button.dataset.userAction, button.dataset.userId);
  });

  document.querySelector("#mailAccountForm")?.addEventListener("submit", saveMailAccountFromForm);
  document.querySelector("#mailAccountType")?.addEventListener("change", applyMailPreset);
  document.querySelector("#testMailAccountBtn")?.addEventListener("click", testMailAccountFromForm);
  document.querySelector("#newMailAccountBtn")?.addEventListener("click", resetMailAccountForm);
  document.querySelector("#mailAccountSwitcher")?.addEventListener("change", (event) => editMailAccount(event.target.value));
  document.querySelector("#mailAccountList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mail-account-action]");
    if (button) handleMailAccountAction(button.dataset.mailAccountAction, button.dataset.mailAccountId);
  });

  document.querySelector("#advancedSignatureForm")?.addEventListener("submit", saveAdvancedSignature);
  document.querySelector("#newSignatureBtn")?.addEventListener("click", resetSignatureForm);
  document.querySelector("#copyEditingSignatureBtn")?.addEventListener("click", copyEditingSignature);
  document.querySelector("#advancedSignatureList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-signature-action]");
    if (button) handleSignatureAction(button.dataset.signatureAction, button.dataset.signatureId);
  });
  document.querySelector("#signatureEditor")?.addEventListener("input", renderSignaturePreview);
  document.querySelector("#signatureFontName")?.addEventListener("change", (event) => runSignatureCommand("fontName", event.target.value));
  document.querySelector("#signatureFontSize")?.addEventListener("change", (event) => runSignatureCommand("fontSize", event.target.value));
  document.querySelector("#signatureForeColor")?.addEventListener("input", (event) => runSignatureCommand("foreColor", event.target.value));
  document.querySelector("#signatureBackColor")?.addEventListener("input", (event) => runSignatureCommand("hiliteColor", event.target.value));
  document.querySelector(".signature-editor-toolbar")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-signature-command]");
    if (button) runSignatureCommand(button.dataset.signatureCommand);
  });
  document.querySelector("#signatureInsertTableBtn")?.addEventListener("click", insertSignatureTable);
  document.querySelector("#signatureInsertLinkBtn")?.addEventListener("click", insertSignatureLink);
  document.querySelector("#signatureInsertImageUrlBtn")?.addEventListener("click", insertSignatureImageUrl);
  document.querySelector("#signatureInsertHrBtn")?.addEventListener("click", () => insertSignatureHtml("<hr>"));
  document.querySelector("#signatureInsertLogoBtn")?.addEventListener("click", insertSignatureLogo);
  document.querySelector("#signatureInsertQrBtn")?.addEventListener("click", insertSignatureQr);
  document.querySelector("#signatureInsertCardBtn")?.addEventListener("click", insertSignatureBusinessCard);
  document.querySelector("#signatureInsertSocialBtn")?.addEventListener("click", insertSignatureSocialLinks);
  document.querySelector(".signature-variable-row")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-signature-variable]");
    if (button) insertSignatureHtml(escapeHtml(button.dataset.signatureVariable));
  });
}

function render() {
  ensureAdvancedSettingsUi();
  renderStats();
  renderCustomerScopeBar();
  renderPipeline();
  renderCustomerList();
  renderDetail();
  renderTimeline();
  renderGeneratedMessage();
  renderMail();
  renderReminders();
  renderAiSettings();
  renderUserSettings();
  renderMailAccountSettings();
  renderSignatureSettings();
  applyAuthState();
  updateAiContextPreview();
}

function applyPermissionState() {
  const isAdmin = currentUser?.role === "admin";
  document.querySelectorAll("[data-admin-only]").forEach((item) => {
    item.disabled = !isAdmin;
    item.classList.toggle("is-disabled", !isAdmin);
  });
  if (aiSettingsForm) {
    aiSettingsForm.querySelectorAll("input, select, button").forEach((item) => {
      if (["aiProviderSelect", "deepseekApiKeyInput", "deepseekBaseUrlInput", "deepseekModelInput", "clearDeepseekKeyBtn"].includes(item.id) || item.type === "submit") {
        item.disabled = !isAdmin;
      }
    });
  }
  document.querySelectorAll("#advancedUserForm input, #advancedUserForm select, #advancedUserForm button, #advancedUsersTable input, #advancedUsersTable select, #advancedUsersTable button").forEach((item) => {
    item.disabled = !isAdmin;
  });
  const scope = document.querySelector("#advancedSignatureScope");
  if (scope && currentUser?.role !== "admin" && scope.value === "public") scope.value = "personal";
  document.querySelectorAll("#advancedSignatureScope option[value='public']").forEach((item) => {
    item.disabled = !isAdmin;
  });
}

function renderUserSettings() {
  const current = document.querySelector("#advancedCurrentUser");
  if (current) {
    current.innerHTML = currentUser ? `
      <strong>${escapeHtml(currentUser.name)}</strong>
      <span>${escapeHtml(currentUser.email)}</span>
      <span>${currentUser.role === "admin" ? "管理员" : "普通用户"}</span>
    ` : "未登录";
  }

  const table = document.querySelector("#advancedUsersTable") || settingsUsersTable;
  if (!table) return;
  const keyword = String(document.querySelector("#advancedUserSearch")?.value || "").trim().toLowerCase();
  const rows = crmUsers
    .filter((user) => !keyword || [user.name, user.email].join(" ").toLowerCase().includes(keyword))
    .map((user) => {
      const isCurrent = currentUser?.id === user.id;
      return `<tr>
        <td>${isCurrent ? "是" : "-"}</td>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${user.role === "admin" ? "管理员" : "普通用户"}</td>
        <td>${user.disabled ? "禁用" : "启用"}</td>
        <td>${escapeHtml(formatDateTime(user.createdAt || ""))}</td>
        <td class="settings-user-actions">
          <button class="ghost-btn" type="button" data-user-action="edit" data-user-id="${escapeAttr(user.id)}">编辑</button>
          <button class="ghost-btn" type="button" data-user-action="current" data-user-id="${escapeAttr(user.id)}" ${user.disabled ? "disabled" : ""}>设为当前</button>
          <button class="ghost-btn" type="button" data-user-action="reset" data-user-id="${escapeAttr(user.id)}">重置密码</button>
          <button class="ghost-btn" type="button" data-user-action="invite" data-user-id="${escapeAttr(user.id)}" ${user.disabled ? "disabled" : ""}>复制登录链接</button>
          <button class="ghost-btn" type="button" data-user-action="toggle" data-user-id="${escapeAttr(user.id)}">${user.disabled ? "启用" : "禁用"}</button>
          <button class="ghost-btn danger" type="button" data-user-action="delete" data-user-id="${escapeAttr(user.id)}">删除</button>
        </td>
      </tr>`;
    })
    .join("");

  table.innerHTML = `<table>
    <thead><tr><th>当前</th><th>姓名</th><th>登录邮箱</th><th>角色</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="7">暂无用户</td></tr>`}</tbody>
  </table>`;
}

function saveAdvancedUser(event) {
  event.preventDefault();
  if (!requireAdmin("只有管理员可以保存用户")) return;
  const id = document.querySelector("#advancedUserId")?.value || "";
  const name = document.querySelector("#advancedUserName")?.value.trim() || "";
  const email = String(document.querySelector("#advancedUserEmail")?.value || "").trim().toLowerCase();
  const password = document.querySelector("#advancedUserPassword")?.value.trim() || "";
  const role = document.querySelector("#advancedUserRole")?.value === "user" ? "user" : "admin";
  const disabled = document.querySelector("#advancedUserStatus")?.value === "disabled";

  if (!name || !email) {
    showToast("请填写姓名和登录邮箱");
    return;
  }
  if (!id && password.length < 6) {
    showToast("初始密码至少 6 位");
    return;
  }
  if (id && password && password.length < 6) {
    showToast("新密码至少 6 位；不修改密码时请留空");
    return;
  }
  if (crmUsers.some((item) => item.id !== id && item.email === email)) {
    showToast("该登录邮箱已存在");
    return;
  }

  if (id) {
    const user = crmUsers.find((item) => item.id === id);
    if (!user) return;
    Object.assign(user, { name, email, role, disabled, updatedAt: new Date().toISOString() });
    if (password) user.password = password;
    if (currentUser?.id === user.id) saveCurrentUser(user);
  } else {
    crmUsers.unshift(normalizeCrmUser({ name, email, password, role, disabled }));
  }
  saveCrmUsers();
  // Force-logout for own password change is handled centrally in saveCrmUsers()
  resetAdvancedUserForm();
  renderUserSettings();
  applyPermissionState();
  document.dispatchEvent(new CustomEvent("foryal:users-updated"));
  showToast("用户已保存");
}

function resetAdvancedUserForm() {
  const form = document.querySelector("#advancedUserForm");
  form?.reset();
  document.querySelector("#advancedUserId").value = "";
  document.querySelector("#advancedUserPassword").required = true;
  document.querySelector("#advancedUserStatus").value = "enabled";
}

function copyUserInviteLink(user) {
  const password = String(user.password || "").trim();
  if (!user.email || password.length < 6) {
    showToast("请先为该用户设置至少 6 位登录密码");
    return;
  }
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.set("invite", encodeLoginInvite(user));
  copyText(url.toString(), "登录授权链接已复制。对方第一次登录必须先打开这个链接。");
}

function handleUserAction(action, id) {
  const user = crmUsers.find((item) => item.id === id);
  if (!user) return;
  if (action === "edit") {
    document.querySelector("#advancedUserId").value = user.id;
    document.querySelector("#advancedUserName").value = user.name;
    document.querySelector("#advancedUserEmail").value = user.email;
    document.querySelector("#advancedUserPassword").value = "";
    document.querySelector("#advancedUserPassword").required = false;
    document.querySelector("#advancedUserRole").value = user.role;
    document.querySelector("#advancedUserStatus").value = user.disabled ? "disabled" : "enabled";
    navigateSettingsTab("users");
    return;
  }
  if (action === "invite") {
    if (!requireAdmin("只有管理员可以复制登录授权链接")) return;
    copyUserInviteLink(user);
    return;
  }
  if (action === "current" && !user.disabled) {
    if (user.id !== currentUser?.id && !requireAdmin("只有管理员可以切换当前用户")) return;
    authSession = { userId: user.id, email: user.email, role: user.role, loggedInAt: new Date().toISOString(), rememberMe: true, sessionVersion: user.sessionVersion || 1 };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
    saveCurrentUser(user);
  } else if (action === "toggle") {
    if (!requireAdmin("只有管理员可以禁用用户")) return;
    user.disabled = !user.disabled;
    user.updatedAt = new Date().toISOString();
    if (currentUser?.id === user.id && user.disabled) logoutCurrentUser();
    saveCrmUsers();
  } else if (action === "delete") {
    if (!requireAdmin("只有管理员可以删除用户")) return;
    if (crmUsers.length <= 1) {
      showToast("至少保留一个用户");
      return;
    }
    if (!confirm("确定删除该用户吗？")) return;
    const ownerKeys = [user.id, user.name, user.email].filter(Boolean).map((item) => String(item).toLowerCase());
    customers.forEach((customer) => {
      const owner = String(customer.owner || "").toLowerCase();
      if (ownerKeys.includes(owner)) customer.owner = "";
    });
    saveCustomers();
    crmUsers = crmUsers.filter((item) => item.id !== id);
    if (currentUser?.id === id) {
      const next = crmUsers.find((item) => item.role === "admin" && !item.disabled) || crmUsers.find((item) => !item.disabled) || crmUsers[0];
      if (next) {
        authSession = { userId: next.id, loggedInAt: new Date().toISOString() };
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession));
        saveCurrentUser(next);
      } else {
        logoutCurrentUser();
      }
    }
    saveCrmUsers();
  } else if (action === "reset") {
    if (!requireAdmin("只有管理员可以重置密码")) return;
    const next = prompt(`请输入 ${user.name} 的新密码（至少 6 位）`, generatePassword());
    if (!next) return;
    if (next.length < 6) {
      showToast("密码至少 6 位");
      return;
    }
    user.password = next;
    user.updatedAt = new Date().toISOString();
    saveCrmUsers();
    showToast(`新密码：${next}`);
  }
  renderUserSettings();
  renderCustomerList();
  renderDetail();
  applyAuthState();
  document.dispatchEvent(new CustomEvent("foryal:users-updated"));
  showToast("用户设置已更新");
}

function saveUserSettingsFromForm(event) {
  event.preventDefault();
  saveAdvancedUser(event);
}

function navigateSettingsTab(tab) {
  document.querySelector(`[data-settings-tab="${tab}"]`)?.click();
}

function generatePassword() {
  return `Fy${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function renderMailAccountSettings() {
  const list = document.querySelector("#mailAccountList");
  const switcher = document.querySelector("#mailAccountSwitcher");
  if (!list || !switcher) return;
  const visible = getVisibleMailAccounts();
  switcher.innerHTML = visible.map((account) => `<option value="${escapeAttr(account.id)}" ${account.isDefault ? "selected" : ""}>${escapeHtml(account.email)}${account.isDefault ? "（默认）" : ""}</option>`).join("") || `<option value="">暂无邮箱账户</option>`;
  fillSignatureSelect(document.querySelector("#mailDefaultSignature"));
  list.innerHTML = `<table>
    <thead><tr><th>默认</th><th>邮箱地址</th><th>类型</th><th>SMTP</th><th>IMAP</th><th>SSL/TLS</th><th>发件人</th><th>测试</th><th>操作</th></tr></thead>
    <tbody>${visible.map((account) => `<tr>
      <td>${account.isDefault ? "是" : "-"}</td>
      <td>${escapeHtml(account.email)}</td>
      <td>${escapeHtml(getMailTypeLabel(account.type))}</td>
      <td>${escapeHtml(account.smtpHost)}:${escapeHtml(account.smtpPort)}</td>
      <td>${escapeHtml(account.imapHost)}:${escapeHtml(account.imapPort)}</td>
      <td>${account.ssl ? "SSL" : ""}${account.ssl && account.tls ? " / " : ""}${account.tls ? "TLS" : ""}</td>
      <td>${escapeHtml(account.senderName || "-")}</td>
      <td>${escapeHtml(account.testStatus || "未测试")}</td>
      <td class="settings-user-actions">
        <button class="ghost-btn" type="button" data-mail-account-action="edit" data-mail-account-id="${escapeAttr(account.id)}">编辑</button>
        <button class="ghost-btn" type="button" data-mail-account-action="test" data-mail-account-id="${escapeAttr(account.id)}">测试</button>
        <button class="ghost-btn" type="button" data-mail-account-action="default" data-mail-account-id="${escapeAttr(account.id)}">设为默认</button>
        <button class="ghost-btn danger" type="button" data-mail-account-action="delete" data-mail-account-id="${escapeAttr(account.id)}">删除</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="9">暂无邮箱账户</td></tr>`}</tbody>
  </table>`;
}

function saveMailAccountFromForm(event) {
  event.preventDefault();
  const id = document.querySelector("#mailAccountId")?.value || "";
  const account = normalizeMailAccount({
    id: id || crypto.randomUUID(),
    userId: id ? (mailAccounts.find((item) => item.id === id)?.userId || currentUser?.id) : currentUser?.id,
    type: document.querySelector("#mailAccountType")?.value || "enterprise",
    email: document.querySelector("#mailAccountEmail")?.value || "",
    password: document.querySelector("#mailAccountPassword")?.value || "",
    smtpHost: document.querySelector("#mailSmtpHost")?.value || "",
    smtpPort: document.querySelector("#mailSmtpPort")?.value || "",
    imapHost: document.querySelector("#mailImapHost")?.value || "",
    imapPort: document.querySelector("#mailImapPort")?.value || "",
    pop3Host: document.querySelector("#mailImapHost")?.value || "",
    pop3Port: document.querySelector("#mailImapPort")?.value || "",
    ssl: document.querySelector("#mailUseSsl")?.checked,
    tls: document.querySelector("#mailUseTls")?.checked,
    senderName: document.querySelector("#mailSenderName")?.value || "",
    defaultSignatureId: document.querySelector("#mailDefaultSignature")?.value || "",
    isDefault: document.querySelector("#mailAccountDefault")?.checked,
  });

  const validation = validateMailAccount(account);
  if (!validation.ok) {
    showToast(validation.message);
    return;
  }
  if (mailAccounts.some((item) => item.id !== account.id && item.email === account.email && item.userId === account.userId)) {
    showToast("该用户已存在同一邮箱账户");
    return;
  }
  if (account.isDefault || !getVisibleMailAccounts().length) {
    mailAccounts.forEach((item) => {
      if (item.userId === account.userId) item.isDefault = false;
    });
    account.isDefault = true;
  }
  const existing = mailAccounts.find((item) => item.id === account.id);
  if (existing) Object.assign(existing, account, { updatedAt: new Date().toISOString() });
  else mailAccounts.unshift(account);
  saveMailAccounts();
  resetMailAccountForm();
  renderMailAccountSettings();
  showToast("邮箱账户已保存");
}

function resetMailAccountForm() {
  const form = document.querySelector("#mailAccountForm");
  form?.reset();
  document.querySelector("#mailAccountId").value = "";
  document.querySelector("#mailAccountType").value = "enterprise";
  document.querySelector("#mailAccountStatus").textContent = "";
  fillSignatureSelect(document.querySelector("#mailDefaultSignature"));
}

function editMailAccount(id) {
  const account = mailAccounts.find((item) => item.id === id);
  if (!account) return;
  document.querySelector("#mailAccountId").value = account.id;
  document.querySelector("#mailAccountType").value = account.type;
  document.querySelector("#mailAccountEmail").value = account.email;
  document.querySelector("#mailAccountPassword").value = account.password || "";
  document.querySelector("#mailSmtpHost").value = account.smtpHost;
  document.querySelector("#mailSmtpPort").value = account.smtpPort;
  document.querySelector("#mailImapHost").value = account.imapHost;
  document.querySelector("#mailImapPort").value = account.imapPort;
  document.querySelector("#mailUseSsl").checked = account.ssl;
  document.querySelector("#mailUseTls").checked = account.tls;
  document.querySelector("#mailSenderName").value = account.senderName;
  fillSignatureSelect(document.querySelector("#mailDefaultSignature"), account.defaultSignatureId);
  document.querySelector("#mailAccountDefault").checked = account.isDefault;
  document.querySelector("#mailAccountStatus").textContent = account.testStatus || "";
  navigateSettingsTab("mail");
}

function handleMailAccountAction(action, id) {
  const account = mailAccounts.find((item) => item.id === id);
  if (!account) return;
  if (action === "edit") return editMailAccount(id);
  if (action === "test") {
    const result = validateMailAccount(account);
    account.testStatus = result.ok ? `本地参数校验通过：${new Date().toLocaleString()}` : `失败：${result.message}`;
    saveMailAccounts();
    renderMailAccountSettings();
    showToast(account.testStatus);
    return;
  }
  if (action === "default") {
    mailAccounts.forEach((item) => {
      if (item.userId === account.userId) item.isDefault = item.id === id;
    });
    saveMailAccounts();
    renderMailAccountSettings();
    showToast("默认邮箱账户已更新");
    return;
  }
  if (action === "delete") {
    if (!confirm("确定删除该邮箱账户吗？")) return;
    mailAccounts = mailAccounts.filter((item) => item.id !== id);
    if (!mailAccounts.some((item) => item.isDefault) && mailAccounts[0]) mailAccounts[0].isDefault = true;
    saveMailAccounts();
    resetMailAccountForm();
    renderMailAccountSettings();
    showToast("邮箱账户已删除");
  }
}

async function testMailAccountFromForm() {
  var statusEl = document.querySelector("#mailAccountStatus");
  var btn = document.querySelector("#testMailAccountBtn");
  // Build account from form
  var account = {
    email: document.querySelector("#mailAccountEmail")?.value || "",
    password: document.querySelector("#mailAccountPassword")?.value || "",
    senderName: document.querySelector("#mailSenderName")?.value || "",
    smtpHost: document.querySelector("#mailSmtpHost")?.value || "",
    smtpPort: document.querySelector("#mailSmtpPort")?.value || "",
    ssl: document.querySelector("#mailUseSsl")?.checked,
    tls: document.querySelector("#mailUseTls")?.checked,
  };
  // Basic validation
  if (!account.email || !account.smtpHost || !account.smtpPort) {
    statusEl.textContent = '请填写邮箱地址、SMTP服务器和端口';
    showToast('请填写邮箱地址、SMTP服务器和端口');
    return;
  }
  if (!account.password) {
    statusEl.textContent = '请填写密码或授权码';
    showToast('请填写密码或授权码');
    return;
  }
  statusEl.textContent = '正在测试连接...';
  if (btn) { btn.disabled = true; btn.textContent = '测试中...'; }
  try {
    var resp = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'test',
        account: {
          email: account.email, password: account.password, senderName: account.senderName,
          smtpHost: account.smtpHost, smtpPort: account.smtpPort, ssl: account.ssl, tls: account.tls,
        },
      }),
    });
    var data;
    try { data = await resp.json(); } catch(e) { throw new Error('API 返回异常 (HTTP ' + resp.status + ')'); }
    if (resp.ok && data.ok) {
      statusEl.textContent = '✅ 连接成功 — SMTP 配置正确';
      showToast('SMTP 连接测试成功');
    } else {
      var err = data.message || data.error || '未知错误';
      statusEl.textContent = '❌ ' + err;
      showToast('测试失败：' + err);
    }
  } catch (e) {
    statusEl.textContent = '❌ ' + (e.message || '网络连接失败');
    showToast('测试失败：' + (e.message || '网络连接失败'));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '测试连接'; }
  }
}

function validateMailAccount(account) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email || "");
  if (!emailOk) return { ok: false, message: "邮箱地址无效" };
  if (!account.smtpHost || !account.imapHost) return { ok: false, message: "请填写SMTP和IMAP服务器" };
  const smtp = Number(account.smtpPort);
  const imap = Number(account.imapPort);
  if (!Number.isInteger(smtp) || smtp <= 0 || smtp > 65535) return { ok: false, message: "SMTP端口无效" };
  if (!Number.isInteger(imap) || imap <= 0 || imap > 65535) return { ok: false, message: "IMAP端口无效" };
  return { ok: true, message: "成功" };
}

function applyMailPreset() {
  const type = document.querySelector("#mailAccountType")?.value || "enterprise";
  const presets = {
    gmail: ["smtp.gmail.com", "465", "pop.gmail.com", "995", true, false],
    outlook: ["smtp.office365.com", "587", "outlook.office365.com", "995", false, true],
    qq: ["smtp.qq.com", "465", "pop.qq.com", "995", true, false],
    "163": ["smtp.163.com", "465", "pop.163.com", "995", true, false],
    enterprise: ["s406k.chinaemail.cn", "25", "p406k.chinaemail.cn", "110", false, false],
    other: ["", "", "", "", false, false],
  };
  const [smtpHost, smtpPort, pop3Host, pop3Port, ssl, tls] = presets[type] || presets.other;
  document.querySelector("#mailSmtpHost").value = smtpHost;
  document.querySelector("#mailSmtpPort").value = smtpPort;
  document.querySelector("#mailImapHost").value = pop3Host;
  document.querySelector("#mailImapPort").value = pop3Port;
  document.querySelector("#mailUseSsl").checked = ssl;
  document.querySelector("#mailUseTls").checked = tls;
}

function getMailTypeLabel(type) {
  return ({ gmail: "Gmail", outlook: "Outlook", qq: "QQ邮箱", "163": "163邮箱", enterprise: "企业邮箱", other: "其他" })[type] || type;
}

function fillSignatureSelect(select, selectedId = "") {
  if (!select) return;
  const visible = getVisibleSignatures();
  select.innerHTML = `<option value="">不指定</option>${visible.map((signature) => `<option value="${escapeAttr(signature.id)}" ${signature.id === selectedId ? "selected" : ""}>${escapeHtml(signature.name)}</option>`).join("")}`;
}

function getVisibleSignatures() {
  return signatures.filter((signature) => {
    if (signature.scope === "public") return true;
    if (currentUser?.role === "admin") return true;
    return signature.userId === currentUser?.id || signature.createdBy === currentUser?.id;
  });
}

function canEditSignature(signature) {
  return currentUser?.role === "admin" || signature.userId === currentUser?.id || signature.createdBy === currentUser?.id;
}

function renderSignatureSettings() {
  const list = document.querySelector("#advancedSignatureList") || signatureList;
  if (!list) return;
  const visible = getVisibleSignatures();
  list.innerHTML = visible.map((signature) => {
    const owner = crmUsers.find((user) => user.id === signature.userId || user.id === signature.createdBy);
    const editable = canEditSignature(signature);
    return `<article class="signature-card">
      <div>
        <strong>${escapeHtml(signature.name)}</strong>
        <span>${escapeHtml(owner?.name || (signature.scope === "public" ? "公共模板" : "未指定用户"))}${signature.isDefault ? " · 默认" : ""} · ${escapeHtml(getSignatureTypeLabel(signature.type))}</span>
      </div>
      <div class="signature-card-preview">${signature.html || textToHtml(signature.body || "")}</div>
      <div class="signature-actions">
        <button class="ghost-btn" type="button" data-signature-action="edit" data-signature-id="${escapeAttr(signature.id)}">编辑</button>
        <button class="ghost-btn" type="button" data-signature-action="copy" data-signature-id="${escapeAttr(signature.id)}">复制</button>
        <button class="ghost-btn" type="button" data-signature-action="default" data-signature-id="${escapeAttr(signature.id)}">设为默认</button>
        <button class="ghost-btn danger" type="button" data-signature-action="delete" data-signature-id="${escapeAttr(signature.id)}" ${editable ? "" : "disabled"}>删除</button>
      </div>
    </article>`;
  }).join("") || `<div class="empty-state">暂无签名</div>`;
  renderSignaturePreview();
  fillSignatureSelect(document.querySelector("#mailDefaultSignature"));
}

function saveAdvancedSignature(event) {
  event.preventDefault();
  const id = document.querySelector("#advancedSignatureId")?.value || "";
  const editor = document.querySelector("#signatureEditor");
  const scope = document.querySelector("#advancedSignatureScope")?.value || "personal";
  if (scope === "public" && currentUser?.role !== "admin") {
    showToast("普通用户只能管理自己的签名");
    return;
  }
  const existing = id ? signatures.find((item) => item.id === id) : null;
  if (existing && !canEditSignature(existing)) {
    showToast("无权编辑该签名");
    return;
  }
  const name = document.querySelector("#advancedSignatureName")?.value.trim() || "";
  const html = editor?.innerHTML.trim() || "";
  if (!name || !html) {
    showToast("请填写签名名称和内容");
    return;
  }
  const signature = normalizeSignature({
    id: existing?.id || crypto.randomUUID(),
    name,
    type: document.querySelector("#advancedSignatureType")?.value || "default",
    scope,
    userId: scope === "public" ? "" : currentUser?.id,
    createdBy: existing?.createdBy || currentUser?.id,
    html,
    body: htmlToPlainText(html),
    isDefault: document.querySelector("#advancedSignatureDefault")?.checked,
    logo: existing?.logo || null,
    qr: existing?.qr || null,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  if (signature.isDefault) {
    signatures.forEach((item) => {
      if ((signature.scope === "public" && item.scope === "public") || (signature.scope !== "public" && item.userId === signature.userId)) item.isDefault = false;
    });
  }
  if (existing) Object.assign(existing, signature);
  else signatures.unshift(signature);
  saveSignatures();
  resetSignatureForm();
  renderSignatureSettings();
  showToast("邮箱签名已保存");
}

function resetSignatureForm() {
  document.querySelector("#advancedSignatureForm")?.reset();
  document.querySelector("#advancedSignatureId").value = "";
  document.querySelector("#signatureEditor").innerHTML = "";
  document.querySelector("#advancedSignatureDefault").checked = !getVisibleSignatures().some((item) => item.userId === currentUser?.id && item.isDefault);
  renderSignaturePreview();
}

function handleSignatureAction(action, id) {
  const signature = signatures.find((item) => item.id === id);
  if (!signature) return;
  if (action === "edit") {
    document.querySelector("#advancedSignatureId").value = signature.id;
    document.querySelector("#advancedSignatureName").value = signature.name;
    document.querySelector("#advancedSignatureType").value = signature.type || "default";
    document.querySelector("#advancedSignatureScope").value = signature.scope || "personal";
    document.querySelector("#advancedSignatureDefault").checked = Boolean(signature.isDefault);
    document.querySelector("#signatureEditor").innerHTML = signature.html || textToHtml(signature.body || "");
    navigateSettingsTab("signatures");
    renderSignaturePreview();
    return;
  }
  if (action === "copy") {
    const copy = normalizeSignature({ ...signature, id: crypto.randomUUID(), name: `${signature.name} 副本`, isDefault: false, userId: currentUser?.id, scope: "personal", createdBy: currentUser?.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    signatures.unshift(copy);
    saveSignatures();
    renderSignatureSettings();
    showToast("签名已复制");
    return;
  }
  if (action === "default") {
    if (!canEditSignature(signature) && signature.scope !== "public") {
      showToast("无权设置该签名");
      return;
    }
    signatures.forEach((item) => {
      if ((signature.scope === "public" && item.scope === "public") || (signature.scope !== "public" && item.userId === signature.userId)) item.isDefault = item.id === id;
    });
    saveSignatures();
    renderSignatureSettings();
    showToast("默认签名已更新");
    return;
  }
  if (action === "delete") {
    if (!canEditSignature(signature)) {
      showToast("无权删除该签名");
      return;
    }
    if (!confirm("确定删除该签名吗？")) return;
    signatures = signatures.filter((item) => item.id !== id);
    saveSignatures();
    renderSignatureSettings();
    showToast("签名已删除");
  }
}

function copyEditingSignature() {
  const editor = document.querySelector("#signatureEditor");
  const html = editor?.innerHTML.trim() || "";
  if (!html) {
    showToast("当前没有可复制的签名内容");
    return;
  }
  document.querySelector("#advancedSignatureId").value = "";
  document.querySelector("#advancedSignatureName").value = `${document.querySelector("#advancedSignatureName").value || "签名"} 副本`;
  document.querySelector("#advancedSignatureDefault").checked = false;
  showToast("已复制为新签名，点击保存生效");
}

function runSignatureCommand(command, value = null) {
  const editor = document.querySelector("#signatureEditor");
  editor?.focus();
  document.execCommand(command, false, value);
  renderSignaturePreview();
}

function insertSignatureHtml(html) {
  const editor = document.querySelector("#signatureEditor");
  editor?.focus();
  document.execCommand("insertHTML", false, html);
  renderSignaturePreview();
}

function insertSignatureTable() {
  insertSignatureHtml(`<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;"><tr><td>Item</td><td>Info</td></tr><tr><td>Website</td><td>{Website}</td></tr></table>`);
}

function insertSignatureLink() {
  const text = prompt("链接显示文字", "FORYAL Website");
  const url = prompt("链接URL", "https://");
  if (!text || !url) return;
  insertSignatureHtml(`<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`);
}

function insertSignatureImageUrl() {
  const url = prompt("图片URL", "https://");
  if (!url) return;
  insertSignatureHtml(`<img src="${escapeAttr(url)}" alt="signature image" style="max-width:180px;height:auto;">`);
}

function insertSignatureLogo() {
  const fileInput = document.querySelector("#signatureLogoFile");
  const url = document.querySelector("#signatureLogoUrl")?.value.trim();
  const width = Math.max(40, Number(document.querySelector("#signatureLogoWidth")?.value || 160));
  if (fileInput?.files?.[0]) {
    insertImageFileIntoSignature(fileInput.files[0], width, "Company Logo");
    return;
  }
  if (url) insertSignatureHtml(`<img src="${escapeAttr(url)}" alt="Company Logo" style="width:${width}px;max-width:100%;height:auto;">`);
}

function insertSignatureQr() {
  const fileInput = document.querySelector("#signatureQrFile");
  const url = document.querySelector("#signatureQrUrl")?.value.trim();
  const width = Math.max(40, Number(document.querySelector("#signatureQrWidth")?.value || 110));
  const type = document.querySelector("#signatureQrType")?.value || "QR";
  if (fileInput?.files?.[0]) {
    insertImageFileIntoSignature(fileInput.files[0], width, type);
    return;
  }
  if (url) insertSignatureHtml(`<img src="${escapeAttr(url)}" alt="${escapeAttr(type)}" style="width:${width}px;max-width:100%;height:auto;">`);
}

function insertImageFileIntoSignature(file, width, alt) {
  const reader = new FileReader();
  reader.onload = () => {
    insertSignatureHtml(`<img src="${escapeAttr(reader.result)}" alt="${escapeAttr(alt)}" style="width:${width}px;max-width:100%;height:auto;">`);
  };
  reader.readAsDataURL(file);
}

function insertSignatureBusinessCard() {
  const values = {
    name: document.querySelector("#cardNameInput")?.value || "{UserName}",
    position: document.querySelector("#cardPositionInput")?.value || "{Position}",
    company: document.querySelector("#cardCompanyInput")?.value || "{Company}",
    email: document.querySelector("#cardEmailInput")?.value || "{Email}",
    phone: document.querySelector("#cardPhoneInput")?.value || "{Phone}",
    whatsapp: document.querySelector("#cardWhatsappInput")?.value || "{WhatsApp}",
    website: document.querySelector("#cardWebsiteInput")?.value || "{Website}",
  };
  insertSignatureHtml(`<div class="signature-card-block"><strong>${escapeHtml(values.name)}</strong><br>${escapeHtml(values.position)}<br>${escapeHtml(values.company)}<br>Email: ${escapeHtml(values.email)}<br>Phone: ${escapeHtml(values.phone)}<br>WhatsApp: ${escapeHtml(values.whatsapp)}<br>Website: ${escapeHtml(values.website)}</div>`);
}

function insertSignatureSocialLinks() {
  const links = [
    ["LinkedIn", document.querySelector("#socialLinkedinInput")?.value],
    ["Instagram", document.querySelector("#socialInstagramInput")?.value],
    ["Facebook", document.querySelector("#socialFacebookInput")?.value],
    ["YouTube", document.querySelector("#socialYoutubeInput")?.value],
    ["TikTok", document.querySelector("#socialTiktokInput")?.value],
    ["Website", document.querySelector("#socialWebsiteInput")?.value],
  ].filter(([, url]) => String(url || "").trim());
  if (!links.length) {
    showToast("请先填写社媒链接");
    return;
  }
  insertSignatureHtml(`<div>${links.map(([label, url]) => `<a href="${escapeAttr(url)}" target="_blank" rel="noopener" style="margin-right:10px;">${escapeHtml(label)}</a>`).join("")}</div>`);
}

function renderSignaturePreview() {
  const preview = document.querySelector("#signaturePreview");
  const editor = document.querySelector("#signatureEditor");
  if (preview && editor) preview.innerHTML = replaceSignatureVariables(editor.innerHTML || "");
}

function getSignatureTypeLabel(type) {
  return ({ default: "默认签名", outreach: "开发信签名", quote: "报价签名", fair: "展会签名", vip: "VIP客户签名", aftersales: "售后签名" })[type] || type;
}

function replaceSignatureVariables(html, user = currentUser) {
  const account = getDefaultMailAccount();
  const values = {
    UserName: user?.name || "",
    Position: user?.role === "admin" ? "Sales Director" : "Sales",
    Company: "Demo Export Company",
    Email: account?.email || user?.email || "",
    Phone: "",
    WhatsApp: "+1 555 010 1000",
    Website: "https://example.com",
  };
  return String(html || "").replace(/\{(UserName|Position|Company|Email|Phone|WhatsApp|Website)\}/g, (_, key) => escapeHtml(values[key] || ""));
}

function textToHtml(text) {
  return escapeHtml(String(text || "")).replace(/\r?\n/g, "<br>");
}

function htmlToPlainText(html) {
  const node = document.createElement("div");
  node.innerHTML = html || "";
  return node.innerText || "";
}

function canCurrentUserViewMail(message) {
  if (currentUser?.role === "admin") return true;
  const userEmails = getCurrentUserMailAddresses();
  const parties = [message.from, message.to, message.cc, message.bcc].join(" ").toLowerCase();
  return userEmails.some((email) => email && parties.includes(email)) || String(message.createdBy || "") === currentUser?.name;
}

function addSentMail(payload, customer = null) {
  mailState.sent.unshift({
    id: crypto.randomUUID(),
    mailbox: "sent",
    to: payload.to,
    cc: payload.cc || "",
    bcc: payload.bcc || "",
    from: payload.from || getDefaultSenderEmail(),
    subject: payload.subject,
    body: payload.text,
    bodyHtml: payload.html || payload.bodyHtml || "",
    snippet: payload.text.replace(/\s+/g, " ").slice(0, 180),
    date: new Date().toISOString(),
    customerId: customer?.id || "",
    company: customer?.company || "",
    country: customer?.country || "",
    createdBy: currentUser?.name || "",
    isRealSent: Boolean(payload.messageId || payload.transport),
    messageId: payload.messageId || "",
    transport: payload.transport || "",
    status: payload.messageId || payload.transport ? "已真实发送" : "已保存发件记录",
    attachments: Array.isArray(payload.attachments) ? payload.attachments.slice() : [],
  });
  mailState.sent = mailState.sent.slice(0, 200);
  saveMailState();
}

function addDraftMail(payload, customer = null) {
  mailState.drafts = Array.isArray(mailState.drafts) ? mailState.drafts : [];
  const draft = {
    id: crypto.randomUUID(),
    mailbox: "drafts",
    to: payload.to,
    cc: payload.cc || "",
    bcc: payload.bcc || "",
    from: payload.from || getDefaultSenderEmail(),
    subject: payload.subject,
    body: payload.text,
    snippet: payload.text.replace(/\s+/g, " ").slice(0, 180),
    date: new Date().toISOString(),
    customerId: customer?.id || "",
    company: customer?.company || "",
    country: customer?.country || "",
    followStatus: "草稿",
    createdBy: currentUser?.name || customer?.owner || "Lina",
    bodyHtml: payload.html || payload.bodyHtml || "",
    attachments: Array.isArray(payload.attachments) ? payload.attachments.slice() : [],
  };
  mailState.drafts.unshift(draft);
  mailState.drafts = mailState.drafts.slice(0, 300);

  if (customer) {
    customer.drafts = Array.isArray(customer.drafts) ? customer.drafts : [];
    customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
    customer.drafts.unshift({ id: draft.id, subject: draft.subject, date: today(), status: "草稿", body: draft.body, createdBy: draft.createdBy, to: draft.to });
    customer.timeline.unshift({ id: crypto.randomUUID(), date: today(), type: "邮件草稿", content: `保存邮件草稿：${draft.subject}` });
    saveCustomers();
  }

  saveMailState();
}

setStandaloneSection("customerSection");
render();
hydrateSharedCrmData();
