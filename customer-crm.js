(function initForyalCustomerModule() {
  const CUSTOMER_UI_KEY = "foryal-customer-ui-v1";
  const CHECKIN_KEY = "foryal-customer-checkins-v1";
  const VIEW_KEYS = ["customer", "followups"];
  const PRODUCT_OPTIONS = ["CM-1600B", "CM-1700MY", "CM-1302MYC", "OEM Project", "Private Label Project", "SKD Project", "CKD Project"];
  const RISK_OPTIONS = ["TT", "30% deposit + 70% before shipment", "OA风险", "60/90/120 days credit风险", "寄售风险", "未知"];
  const CUSTOMER_TYPES = ["品牌商", "进口商", "批发商", "连锁零售商", "电商卖家", "咖啡设备供应商", "咖啡设备品牌商", "咖啡设备进口商"];
  const SOURCES = ["社媒", "LinkedIn", "Instagram", "Facebook", "Google", "展会", "海关数据", "官网询盘", "转介绍"];
  const STAGES = ["新线索", "已联系", "已报价", "样品/测试", "谈判中", "已成交", "沉睡", "黑名单"];
  const INDUSTRIES = ["小家电品牌商", "家电进口商", "厨房电器批发商", "区域型品牌商", "连锁零售商", "电商卖家", "咖啡烘焙商"];
  const COUNTRIES = [
    "United States","Germany","Italy","France","Spain","Portugal","Netherlands","Belgium","Switzerland","Austria",
    "United Kingdom","Ireland","Sweden","Norway","Denmark","Finland","Poland","Czech Republic","Slovakia","Hungary",
    "Romania","Bulgaria","Greece","Croatia","Slovenia","Serbia","Ukraine","Russia","Belarus","Lithuania","Latvia","Estonia",
    "Turkey","Israel","Iran","Saudi Arabia","United Arab Emirates","Qatar","Kuwait","Oman","Bahrain","Jordan","Lebanon","Iraq",
    "China","Japan","South Korea","Taiwan","Hong Kong","India","Pakistan","Bangladesh","Vietnam","Thailand","Indonesia",
    "Malaysia","Singapore","Philippines","Australia","New Zealand",
    "Brazil","Mexico","Argentina","Chile","Colombia","Peru","Paraguay","Uruguay","Costa Rica","Panama","Ecuador","Bolivia","Venezuela",
    "Canada","South Africa","Egypt","Morocco","Nigeria","Kenya","Ghana","Ethiopia","Tunisia","Algeria",
    "Kazakhstan","Azerbaijan","Georgia","Armenia","Uzbekistan",
  ];
  const COUNTRY_DATALIST_ID = "countryDatalistOptions";
  const ALL_COLUMNS = [
    { key: "select", label: "" },
    { key: "company", label: "客户名称" },
    { key: "country", label: "国家/地区" },
    { key: "source", label: "客户来源" },
    { key: "whatsapp", label: "手机 / WhatsApp" },
    { key: "phone", label: "电话" },
    { key: "email", label: "邮箱" },
    { key: "website", label: "网址" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "instagram", label: "Instagram" },
    { key: "priority", label: "客户级别" },
    { key: "industry", label: "客户行业" },
    { key: "product", label: "推荐产品" },
    { key: "paymentRisk", label: "付款风险" },
    { key: "stage", label: "跟进阶段" },
    { key: "nextDate", label: "下次联系时间" },
    { key: "owner", label: "负责人" },
    { key: "createdAt", label: "创建时间" },
    { key: "lastFollowDate", label: "最后跟进时间" },
    { key: "notes", label: "备注" },
  ];
  const DEFAULT_COLUMNS = [
    "select",
    "company",
    "country",
    "source",
    "whatsapp",
    "phone",
    "email",
    "website",
    "linkedin",
    "instagram",
    "priority",
    "industry",
    "product",
    "paymentRisk",
    "stage",
    "nextDate",
    "owner",
    "createdAt",
    "lastFollowDate",
    "notes",
  ];
  const DETAIL_TABS = [
    ["base", "基础信息"],
    ["contacts", "联系人"],
    ["followups", "跟进记录"],
    ["timeline", "时间轴"],
    ["quotes", "报价单"],
    ["attachments", "附件"],
    ["drafts", "邮件草稿"],
  ];

  const section = document.querySelector("#customerSection");
  if (!section) return;

  let customers = window.FORYAL_CRM?.getCustomers?.() || [];
  let selectedId = window.FORYAL_CRM?.getSelectedCustomer?.()?.id || customers[0]?.id || null;
  let ui = loadCustomerUi();
  let checkins = loadCheckins();
  let selectedCustomers = new Set();
  let modalContacts = [];
  let modalLogoData = "";
  let timelineFilter = "all";
  let pendingAiParseData = null;
  let pendingAiParseDraft = null;
  let recentSearches = loadRecentSearches();

  function loadRecentSearches() {
    try { return JSON.parse(localStorage.getItem("foryal-recent-searches-v1") || "[]").slice(0, 10); }
    catch { return []; }
  }
  function saveRecentSearches() {
    localStorage.setItem("foryal-recent-searches-v1", JSON.stringify(recentSearches));
  }
  function addRecentSearch(term) {
    if (!term || !term.trim()) return;
    var t = term.trim();
    recentSearches = [t].concat(recentSearches.filter(function(s) { return s !== t; })).slice(0, 10);
    saveRecentSearches();
  }
  function clearRecentSearches() {
    recentSearches = [];
    saveRecentSearches();
  }

  normalizeCustomers();
  mountCustomerShell();
  replaceTopCustomerButtons();
  wireCustomerSideMenus();
  renderCustomerModule();
  document.addEventListener("foryal:users-updated", renderCustomerModule);

  function loadCustomerUi() {
    try {
      const stored = {
        view: "table",
        subview: "customer",
        search: "",
        detailTab: "base",
        columns: DEFAULT_COLUMNS,
        filters: {
          stage: "all",
          priority: "all",
          source: "all",
          product: "all",
          paymentRisk: "all",
          isBlacklisted: "all",
          isQuoted: "all",
          isSample: "all",
          country: "all",
        },
        ...(JSON.parse(localStorage.getItem(CUSTOMER_UI_KEY) || "{}") || {}),
      };
      if (!VIEW_KEYS.includes(stored.subview)) stored.subview = "customer";
      if (!DETAIL_TABS.some(([key]) => key === stored.detailTab)) stored.detailTab = "base";
      return stored;
    } catch {
      return {
        view: "table",
        subview: "customer",
        search: "",
        detailTab: "base",
        columns: DEFAULT_COLUMNS,
        filters: {},
      };
    }
  }

  function saveCustomerUi() {
    localStorage.setItem(CUSTOMER_UI_KEY, JSON.stringify(ui));
  }

  function loadCheckins() {
    try {
      const rows = JSON.parse(localStorage.getItem(CHECKIN_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function saveCheckins() {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins));
  }

  function saveCustomers() {
    if (window.FORYAL_CRM?.replaceCustomers) {
      window.FORYAL_CRM.replaceCustomers(customers);
      customers = window.FORYAL_CRM.getCustomers?.() || customers;
      return;
    }
    localStorage.setItem("coffee-machine-crm-customers-v6", JSON.stringify(customers));
  }

  function normalizeCustomerSource(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const compact = raw.replace(/\s+/g, "");
    if (/legacy CRM export|legacy CRM|sourcecrm/i.test(compact)) return "社媒";
    if (/社交平台|自主开发/.test(compact) && compact.length > 8) return "社媒";
    return raw;
  }

  function normalizeCustomers() {
    customers.forEach((customer) => {
      customer.id = customer.id || newId();
      customer.company = customer.company || "未命名客户";
      customer.owner = customer.owner || "Lina";
      customer.source = normalizeCustomerSource(customer.source) || "LinkedIn";
      customer.priority = customer.priority || customer.grade || "B";
      customer.industry = customer.industry || customer.segment || "家电进口商";
      customer.segment = customer.segment || "进口商";
      customer.customerType = customer.customerType || mapCustomerType(customer.segment);
      customer.product = normalizeProduct(customer.product);
      customer.paymentRisk = customer.paymentRisk || customer.risk || "未知";
      customer.stage = customer.stage || "新线索";
      customer.website = customer.website || customer.url || "";
      customer.phone = customer.phone || "";
      customer.instagram = customer.instagram || "";
      customer.facebook = customer.facebook || "";
      customer.youtube = customer.youtube || "";
      customer.tags = customer.tags || "";
      customer.hasOwnBrand = customer.hasOwnBrand || "未知";
      customer.hasCoffeeCategory = customer.hasCoffeeCategory || "未知";
      customer.hasChinaImport = customer.hasChinaImport || "未知";
      customer.isQuoted = customer.isQuoted || (customer.stage === "已报价" ? "是" : "否");
      customer.isSample = customer.isSample || (customer.stage === "样品/测试" ? "是" : "否");
      customer.isBlacklisted = customer.isBlacklisted || (customer.stage === "黑名单" ? "是" : "否");
      customer.createdAt = customer.createdAt || todayString();
      customer.updatedAt = customer.updatedAt || todayString();
      customer.contacts = Array.isArray(customer.contacts) ? customer.contacts : [];
      customer.contacts = customer.contacts.map((contact) => ({ ...contact, id: contact.id || newId() }));
      if (!customer.contacts.length && (customer.contact || customer.email || customer.whatsapp || customer.linkedin)) {
        customer.contacts.push({
          id: newId(),
          name: customer.contact || "",
          title: customer.title || "",
          email: customer.email || "",
          phone: customer.phone || "",
          whatsapp: customer.whatsapp || "",
          linkedin: customer.linkedin || "",
          notes: "",
        });
      }
      customer.followUps = Array.isArray(customer.followUps) ? customer.followUps : [];
      customer.opportunities = Array.isArray(customer.opportunities) ? customer.opportunities : [];
      customer.quotes = Array.isArray(customer.quotes) ? customer.quotes : [];
      customer.contracts = Array.isArray(customer.contracts) ? customer.contracts : [];
      customer.payments = Array.isArray(customer.payments) ? customer.payments : [];
      customer.invoices = Array.isArray(customer.invoices) ? customer.invoices : [];
      customer.attachments = Array.isArray(customer.attachments) ? customer.attachments : [];
      customer.letters = Array.isArray(customer.letters) ? customer.letters : [];
      customer.drafts = Array.isArray(customer.drafts) ? customer.drafts : [];
      customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
      customer.inPool = customer.inPool || "否";
      if (!customer.timeline.length) {
        customer.timeline.push({
          id: newId(),
          date: customer.createdAt,
          type: "导入/初始化",
          content: "客户资料进入 FORYAL CRM。",
        });
      }
    });
    saveCustomers();
  }

  function mountCustomerShell() {
    section.className = "foryal-customer-section";
    section.innerHTML = `
      <div class="foryal-customer-layout">
        <div class="foryal-customer-main">
          <div class="customer-module-head">
            <div>
              <p class="eyebrow">FORYAL CUSTOMER CRM</p>
              <h3 id="customerSubviewTitle">客户管理</h3>
              <p id="customerSubviewDesc">管理国外小家电品牌商、进口商、批发商、连锁零售商和电商卖家。</p>
            </div>
            <div class="customer-module-actions">
              <button class="ghost-btn" id="customerImportBtn" type="button">导入 CSV</button>
              <input id="customerImportInput" type="file" accept=".csv,text/csv" hidden />
              <button class="ghost-btn" id="customerExportBtn" type="button">导出 CSV</button>
              <button class="primary-btn" id="customerNewBtn" type="button">新建客户</button>
            </div>
          </div>
          <div id="customerSubviewHost"></div>
        </div>
        <aside class="customer-detail-drawer" id="customerDetailDrawer"></aside>
      </div>
      <div class="customer-modal-backdrop" id="customerModal" hidden></div>
      <div class="legacy-customer-compat" hidden>
        <span id="detailTitle"></span>
        <span id="detailStage"></span>
        <a id="linkedinLink" href="#"></a>
        <a id="emailLink" href="#"></a>
        <a id="whatsappLink" href="#"></a>
      </div>
    `;

    section.querySelector("#customerNewBtn")?.addEventListener("click", () => openCustomerModal());
    section.querySelector("#customerExportBtn")?.addEventListener("click", () => exportCustomersCsv(getVisibleCustomers()));
    section.querySelector("#customerImportBtn")?.addEventListener("click", () => section.querySelector("#customerImportInput")?.click());
    section.querySelector("#customerImportInput")?.addEventListener("change", importCustomerCsv);
  }

  function replaceTopCustomerButtons() {
    replaceButton("#newCustomerBtn", () => openCustomerModal());
    replaceButton("#exportBtn", () => exportCustomersCsv(getVisibleCustomers()));
    replaceButton("#importCustomersBtn", () => section.querySelector("#customerImportInput")?.click());
  }

  function replaceButton(selector, handler) {
    const oldButton = document.querySelector(selector);
    if (!oldButton) return;
    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);
    button.addEventListener("click", handler);
  }

  function wireCustomerSideMenus() {
    const map = {
      followups: "followups",
    };
    document.querySelectorAll(".nav-item").forEach((button) => {
      const target = button.dataset.module || button.dataset.navTarget;
      button.addEventListener(
        "click",
        (event) => {
          if (target === "customerSection") {
            event.stopImmediatePropagation();
            event.preventDefault();
            openCustomerSubview("customer", button);
          } else if (map[target]) {
            event.stopImmediatePropagation();
            event.preventDefault();
            openCustomerSubview(map[target], button);
          } else if (target === "mailSection" || target === "settingsPanel") {
            ui.subview = "customer";
            saveCustomerUi();
          }
        },
        true,
      );
    });

    document.querySelectorAll(".wk-module-item[data-nav-target='customerSection']").forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.stopImmediatePropagation();
          event.preventDefault();
          openCustomerSubview("customer", button);
        },
        true,
      );
    });
  }

  function openCustomerSubview(subview, sourceButton) {
    ui.subview = subview;
    saveCustomerUi();
    document.querySelector("#moduleWorkbench")?.setAttribute("hidden", "");
    ["#customerSection", ".bottom-grid", "#mailSection", "#reminderPanel", "#settingsPanel"].forEach((selector) => {
      document.querySelector(selector)?.classList.remove("is-module-hidden");
    });
    document.querySelector("#customerSection")?.classList.remove("is-page-hidden");
    ["#mailSection", "#reminderPanel", "#settingsPanel", ".bottom-grid"].forEach((selector) => {
      document.querySelector(selector)?.classList.add("is-page-hidden");
    });
    document.querySelectorAll(".wk-module-item, .nav-item").forEach((item) => item.classList.toggle("active", item === sourceButton));
    renderCustomerModule();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderCustomerModule() {
    normalizeCustomers();
    const host = section.querySelector("#customerSubviewHost");
    const title = section.querySelector("#customerSubviewTitle");
    const desc = section.querySelector("#customerSubviewDesc");
    const viewMeta = getSubviewMeta(ui.subview);
    title.textContent = viewMeta.title;
    desc.textContent = viewMeta.desc;

    if (ui.subview === "customer") renderCustomerListView(host);
    if (ui.subview === "followups") renderFollowupsSubview(host);
    renderCustomerDetail();
  }

  function _refreshListOnly(host) {
    refreshCustomerResults(host);
  }

  function renderCustomerListView(host) {
    const visible = getVisibleCustomers();
    // If toolbar already exists, only refresh list — never destroy search input
    if (host.querySelector("#customerToolbarHost")) {
      _refreshListOnly(host);
      return;
    }
    host.innerHTML = `
    <div id="customerToolbarHost">
      <div class="customer-toolbar">
        <label class="search-box customer-search">
          <input id="customerSearchInput" type="search" dir="ltr" autocomplete="off" value="${escapeAttr(ui.search || "")}" placeholder="搜索客户名称 / 联系人 / 邮箱 / 电话 / WhatsApp / 国家 / 网站 / 产品" />
        </label>
        <select id="customerCountryFilter" class="filter-select" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;color:#475569;background:#fff">${renderCountryFilterOptions()}</select>
        <button class="ghost-btn" id="customerAdvancedBtn" type="button">高级筛选</button>
        <button class="ghost-btn" id="customerColumnBtn" type="button">字段配置</button>
        <button class="ghost-btn" id="customerDuplicateBtn" type="button">黑名单去重</button>
        <div class="view-switch">
          <button class="${ui.view === "table" ? "active" : ""}" type="button" data-view="table">列表</button>
          <button class="${ui.view === "card" ? "active" : ""}" type="button" data-view="card">卡片</button>
        </div>
      </div>
      <div class="customer-advanced ${ui.advancedOpen ? "open" : ""}" id="customerAdvancedPanel">
        ${renderAdvancedFilters()}
      </div>
      <div class="customer-column-panel ${ui.columnOpen ? "open" : ""}" id="customerColumnPanel">
        ${ALL_COLUMNS.filter((col) => col.key !== "select").map((col) => `
          <label><input type="checkbox" data-column-key="${col.key}" ${ui.columns.includes(col.key) ? "checked" : ""} /> ${escapeHtml(col.label)}</label>
        `).join("")}
      </div>
      </div>
      <div class="customer-bulkbar">
        <label><input id="selectAllCustomers" type="checkbox" ${visible.length && visible.every((customer) => selectedCustomers.has(customer.id)) ? "checked" : ""} /> 全选当前结果</label>
        <span>已选 ${selectedCustomers.size} 个客户</span>
        <button class="ghost-btn" id="batchExportCustomers" type="button">批量导出 CSV</button>
        <button class="ghost-btn danger" id="batchDeleteCustomers" type="button">批量删除</button>
      </div>
      <div id="customerResultsHost">${ui.view === "card" ? renderCustomerCards(visible) : renderCustomerTable(visible)}</div>
    `;

    var searchInput = host.querySelector("#customerSearchInput");
    var searchTimer = null;
    // Add search history dropdown
    var searchWrapper = searchInput.parentNode;
    if (searchWrapper && !searchWrapper.querySelector(".search-history-drop")) {
      var drop = document.createElement("div");
      drop.className = "search-history-drop";
      drop.style.display = "none";
      drop.style.position = "absolute";
      drop.style.top = "100%";
      drop.style.left = "0";
      drop.style.right = "0";
      drop.style.background = "#fff";
      drop.style.border = "1px solid var(--line)";
      drop.style.borderRadius = "0 0 8px 8px";
      drop.style.zIndex = "50";
      drop.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
      drop.style.maxHeight = "260px";
      drop.style.overflowY = "auto";
      searchWrapper.style.position = "relative";
      searchWrapper.appendChild(drop);
    }

    function renderSearchDropdown() {
      var drop = searchWrapper.querySelector(".search-history-drop");
      if (!drop || !recentSearches.length) return;
      drop.innerHTML = '<div style="padding:6px 10px;font-size:11px;color:var(--muted);display:flex;justify-content:space-between">最近搜索<span style="cursor:pointer;color:#dc2626" id="clearRecentSearches">清空</span></div>' +
        recentSearches.map(function(s) {
          return '<div class="search-hist-item" style="padding:6px 10px;cursor:pointer;font-size:13px;border-top:1px solid #f1f5f9">' + s.replace(/</g,'&lt;') + '</div>';
        }).join("");
      drop.querySelectorAll(".search-hist-item").forEach(function(item) {
        item.addEventListener("click", function() {
          searchInput.value = item.textContent;
          ui.search = item.textContent;
          saveCustomerUi();
          drop.style.display = "none";
          addRecentSearch(item.textContent);
          renderCustomerModule();
        });
      });
      var clearBtn = drop.querySelector("#clearRecentSearches");
      if (clearBtn) clearBtn.addEventListener("click", function(e) { e.stopPropagation(); clearRecentSearches(); drop.style.display = "none"; });
    }

    searchInput.addEventListener("focus", function() {
      if (!ui.search && recentSearches.length) {
        renderSearchDropdown();
        var drop = searchWrapper.querySelector(".search-history-drop");
        if (drop) drop.style.display = "block";
      }
    });
    searchInput.addEventListener("blur", function() {
      setTimeout(function() {
        var drop = searchWrapper.querySelector(".search-history-drop");
        if (drop) drop.style.display = "none";
      }, 200);
    });

    searchInput.addEventListener("input", function(event) {
      ui.search = event.target.value;
      saveCustomerUi();
      // Hide dropdown when typing
      var drop = searchWrapper.querySelector(".search-history-drop");
      if (drop) drop.style.display = "none";
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() {
        addRecentSearch(ui.search);
      }, 300);
      refreshCustomerResults(host);
    });
    // Country filter change handler
    host.querySelector("#customerCountryFilter")?.addEventListener("change", function(e) {
      ui.filters = ui.filters || {};
      ui.filters.country = e.target.value || "all";
      saveCustomerUi();
      refreshCustomerResults(host);
    });
    var filterSelect = host.querySelector("#customerCountryFilter");
    if (filterSelect && ui.filters && ui.filters.country) filterSelect.value = ui.filters.country;

    host.querySelector("#customerAdvancedBtn").addEventListener("click", () => {
      ui.advancedOpen = !ui.advancedOpen;
      saveCustomerUi();
      renderCustomerModule();
    });
    host.querySelector("#customerColumnBtn").addEventListener("click", () => {
      ui.columnOpen = !ui.columnOpen;
      saveCustomerUi();
      renderCustomerModule();
    });
    host.querySelector("#customerDuplicateBtn").addEventListener("click", runBlacklistDedupe);
    host.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.view = button.dataset.view;
        saveCustomerUi();
        renderCustomerModule();
      });
    });
    host.querySelectorAll("[data-filter]").forEach((control) => {
      control.addEventListener("change", () => {
        ui.filters[control.dataset.filter] = control.value;
        saveCustomerUi();
        renderCustomerModule();
      });
    });
    host.querySelectorAll("[data-column-key]").forEach((control) => {
      control.addEventListener("change", () => {
        const key = control.dataset.columnKey;
        ui.columns = control.checked ? Array.from(new Set([...ui.columns, key])) : ui.columns.filter((item) => item !== key);
        if (!ui.columns.includes("select")) ui.columns.unshift("select");
        saveCustomerUi();
        renderCustomerModule();
      });
    });
    bindCustomerResultEvents(host, visible);
  }

  function refreshCustomerResults(host) {
    const visible = getVisibleCustomers();
    const bulkbar = host.querySelector(".customer-bulkbar");
    if (bulkbar) {
      bulkbar.innerHTML = `
        <label><input id="selectAllCustomers" type="checkbox" ${visible.length && visible.every((customer) => selectedCustomers.has(customer.id)) ? "checked" : ""} /> 全选当前结果</label>
        <span>已选 ${selectedCustomers.size} 个客户</span>
        <button class="ghost-btn" id="batchExportCustomers" type="button">批量导出 CSV</button>
        <button class="ghost-btn danger" id="batchDeleteCustomers" type="button">批量删除</button>
      `;
    }
    let resultsHost = host.querySelector("#customerResultsHost");
    if (!resultsHost) {
      resultsHost = document.createElement("div");
      resultsHost.id = "customerResultsHost";
      host.appendChild(resultsHost);
    }
    if (resultsHost) resultsHost.innerHTML = ui.view === "card" ? renderCustomerCards(visible) : renderCustomerTable(visible);
    bindCustomerResultEvents(host, visible);
    renderCustomerDetail();
  }

  function bindCustomerResultEvents(host, visible) {
    host.querySelector("#selectAllCustomers")?.addEventListener("change", (event) => {
      if (event.target.checked) visible.forEach((customer) => selectedCustomers.add(customer.id));
      else visible.forEach((customer) => selectedCustomers.delete(customer.id));
      refreshCustomerResults(host);
    });
    host.querySelector("#batchExportCustomers")?.addEventListener("click", () => exportCustomersCsv(getSelectedOrVisible(visible)));
    host.querySelector("#batchDeleteCustomers")?.addEventListener("click", () => batchDeleteCustomers());
    host.querySelectorAll("[data-customer-id]").forEach((row) => {
      row.addEventListener("click", (event) => {
        if (event.target.closest("input,button,a")) return;
        selectCustomerById(row.dataset.customerId);
      });
    });
    host.querySelectorAll("[data-customer-check]").forEach((input) => {
      input.addEventListener("change", () => {
        input.checked ? selectedCustomers.add(input.value) : selectedCustomers.delete(input.value);
        refreshCustomerResults(host);
      });
    });
    host.querySelectorAll("[data-edit-customer]").forEach((button) => {
      button.addEventListener("click", () => openCustomerModal(getCustomerById(button.dataset.editCustomer)));
    });
  }

  function renderCountryFilterOptions() {
    var countries = [];
    var seen = {};
    customers.forEach(function(c) {
      var v = (c.country || '').trim();
      if (!v || v === '-' || v === '未知') {
        if (!seen['__empty__']) { seen['__empty__'] = true; countries.push({ label: '未填写国家', value: '__empty__' }); }
        return;
      }
      if (!seen[v]) { seen[v] = true; countries.push({ label: v, value: v }); }
    });
    countries.sort(function(a, b) { return a.label.localeCompare(b.label); });
    var html = '<option value="all">全部国家</option>';
    countries.forEach(function(c) {
      html += '<option value="' + escapeHtml(c.value) + '">' + escapeHtml(c.label) + '</option>';
    });
    return html;
  }

  function renderAdvancedFilters() {
    return `
      ${renderFilterSelect("stage", "跟进阶段", STAGES)}
      ${renderFilterSelect("priority", "客户级别", ["A+", "A", "A-待补关键人", "B+", "B", "B-", "C-待补资料", "D-不导入"])}
      ${renderFilterSelect("source", "客户来源", SOURCES)}
      ${renderFilterSelect("product", "推荐产品", PRODUCT_OPTIONS)}
      ${renderFilterSelect("paymentRisk", "付款风险", RISK_OPTIONS)}
      ${renderFilterSelect("isBlacklisted", "黑名单", ["否", "是"])}
      ${renderFilterSelect("isQuoted", "已报价", ["否", "是"])}
      ${renderFilterSelect("isSample", "样品客户", ["否", "是"])}
    `;
  }

  function renderFilterSelect(key, label, options) {
    return `<label>${label}<select data-filter="${key}">
      <option value="all">全部</option>
      ${options.map((option) => `<option ${ui.filters[key] === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    </select></label>`;
  }

  function renderCustomerTable(visible) {
    const columns = ALL_COLUMNS.filter((column) => ui.columns.includes(column.key));
    return `<div class="foryal-customer-table-wrap">
      <table class="foryal-customer-table">
        <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}<th>操作</th></tr></thead>
        <tbody>
          ${visible.map((customer) => {
            const pc = customer.priority === "A" ? "priority-a" : customer.priority === "C" ? "priority-c" : "";
            return `<tr class="${pc} ${customer.id === selectedId ? "active" : ""}" data-customer-id="${customer.id}">
            ${columns.map((column) => `<td>${renderCustomerCell(customer, column.key)}</td>`).join("")}
            <td><button class="module-row-btn" type="button" data-edit-customer="${customer.id}">编辑</button></td>
          </tr>`;
          }).join("") || `<tr><td colspan="${columns.length + 1}" class="module-empty">没有匹配客户</td></tr>`}
        </tbody>
      </table>
    </div>`;
  }

  function renderCustomerCards(visible) {
    return `<div class="customer-card-grid">
      ${visible.map((customer) => {
        const pc = customer.priority === "A" ? "card-priority-a" : customer.priority === "C" ? "card-priority-c" : "";
        return `<article class="customer-card ${pc} ${customer.id === selectedId ? "active" : ""}" data-customer-id="${customer.id}">
        <div class="customer-card-head">
          ${renderLogo(customer)}
          <div>
            <h4>${escapeHtml(customer.company)}</h4>
            <p>${escapeHtml(customer.country || "-")} · ${escapeHtml(customer.industry || customer.segment || "-")}</p>
          </div>
          <input type="checkbox" data-customer-check value="${customer.id}" ${selectedCustomers.has(customer.id) ? "checked" : ""} />
        </div>
        <div class="customer-card-meta">
          <span>${escapeHtml(customer.priority || "B")}</span>
          <span>${escapeHtml(customer.product || "-")}</span>
          <span>${escapeHtml(customer.stage || "-")}</span>
          <span>${escapeHtml(customer.nextDate || getNextDate(customer) || "待安排")}</span>
        </div>
        <p>${escapeHtml(customer.notes || "暂无备注")}</p>
        <button class="ghost-btn" type="button" data-edit-customer="${customer.id}">编辑</button>
      </article>`;
      }).join("") || `<div class="empty-state">没有匹配客户</div>`}
    </div>`;
  }

  function renderCustomerCell(customer, key) {
    if (key === "select") return `<input type="checkbox" data-customer-check value="${customer.id}" ${selectedCustomers.has(customer.id) ? "checked" : ""} />`;
    if (key === "logo") return renderLogo(customer);
    if (key === "company") return `<strong>${escapeHtml(customer.company)}</strong><span>${escapeHtml(customer.contact || customer.contacts?.[0]?.name || "")}</span>`;
    if (key === "email") return customer.email ? `<a class="customer-email-link" href="${escapeAttr(getComposeUrl(customer))}">${escapeHtml(customer.email)}</a>` : "-";
    if (["website", "linkedin", "instagram"].includes(key)) return customer[key] ? `<a href="${escapeAttr(customer[key])}" target="_blank" rel="noreferrer">打开</a>` : "-";
    if (key === "nextDate") return escapeHtml(customer.nextDate || getNextDate(customer) || "-");
    if (key === "lastFollowDate") return escapeHtml(getLastFollowDate(customer) || "-");
    if (key === "notes") return `<span class="truncate-cell">${escapeHtml(customer.notes || "-")}</span>`;
    return escapeHtml(customer[key] || "-");
  }

  function renderLogo(customer) {
    if (customer.logoData) return `<img class="customer-logo" src="${escapeAttr(customer.logoData)}" alt="" />`;
    return `<span class="customer-logo placeholder">${escapeHtml((customer.company || "F").slice(0, 1).toUpperCase())}</span>`;
  }

  function renderCustomerDetail() {
    const drawer = section.querySelector("#customerDetailDrawer");
    const customer = getCustomerById(selectedId) || getVisibleCustomers()[0] || customers[0];
    if (customer && selectedId !== customer.id) selectedId = customer.id;

    if (!customer) {
      drawer.innerHTML = `<div class="empty-state">选择客户后查看详情</div>`;
      return;
    }

    drawer.innerHTML = `
      <div class="customer-detail-head">
        <div class="customer-detail-title">
          ${renderLogo(customer)}
          <div>
            <p class="eyebrow">${escapeHtml(customer.stage || "新线索")}</p>
            <h3>${escapeHtml(customer.company)}</h3>
            <p>${escapeHtml(customer.country || "-")} · ${escapeHtml(customer.industry || customer.segment || "-")}</p>
          </div>
        </div>
        <div class="customer-detail-actions">
          <button class="ghost-btn" id="detailEditCustomer" type="button">编辑</button>
          <button class="ghost-btn" id="detailAiAnalyzeBtn" type="button" data-detail-action="analyzeWebsite" title="AI自动分析客户网站，提取公司规模、主营产品、是否进口中国货、负责人信息">🤖 AI网站分析</button>
          <button class="ghost-btn danger" id="detailDeleteCustomer" type="button">删除</button>
        </div>
      </div>
      <div class="detail-tabs">
        ${DETAIL_TABS.map(([key, label]) => `<button class="${ui.detailTab === key ? "active" : ""}" type="button" data-detail-tab="${key}">${label}</button>`).join("")}
      </div>
      <div class="detail-tab-body">${renderDetailTab(customer, ui.detailTab)}</div>
    `;

    drawer.querySelector("#detailEditCustomer").addEventListener("click", () => openCustomerModal(customer));
    drawer.querySelector("#detailDeleteCustomer").addEventListener("click", () => deleteCustomer(customer.id));
    drawer.querySelectorAll("[data-detail-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.detailTab = button.dataset.detailTab;
        saveCustomerUi();
        renderCustomerDetail();
      });
    });
    drawer.querySelectorAll("[data-detail-action]").forEach((button) => {
      button.addEventListener("click", () => handleDetailAction(button.dataset.detailAction, customer));
    });
    drawer.querySelectorAll("[data-detail-follow-action]").forEach((button) => {
      button.addEventListener("click", () => handleCustomerFollowAction(button.dataset.detailFollowAction, customer, button.dataset.followId));
    });
    drawer.querySelectorAll("[data-detail-contact-action]").forEach((button) => {
      button.addEventListener("click", () => handleCustomerContactAction(button.dataset.detailContactAction, customer, button.dataset.contactId));
    });
    drawer.querySelectorAll("[data-detail-contact-delete-check]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (!checkbox.checked) return;
        const deleted = handleCustomerContactAction("delete", customer, checkbox.dataset.contactId);
        if (!deleted) checkbox.checked = false;
      });
    });

    // Timeline filter buttons
    drawer.querySelectorAll("[data-tl-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        timelineFilter = btn.dataset.tlFilter;
        renderCustomerDetail();
      });
    });
    // Timeline action buttons (edit/delete)
    drawer.querySelectorAll("[data-tl-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleTimelineAction(btn.dataset.tlAction, btn.dataset.tlId, btn.dataset.tlSource, btn.dataset.tlSourceId, customer);
      });
    });
  }

  function renderDetailTab(customer, tab) {
    if (tab === "base") return renderBaseDetail(customer);
    if (tab === "contacts") return renderContactsDetail(customer);
    if (tab === "followups") return renderFollowupsDetail(customer);
    if (tab === "timeline") return renderUnifiedTimeline(customer);
    if (tab === "quotes") return renderSimpleRelation(customer, "quotes", "报价单", ["quoteNo", "product", "amount"], ["编号", "产品", "金额"]);
    if (tab === "contracts") return renderSimpleRelation(customer, "contracts", "合同", ["contractNo", "amount", "status"], ["编号", "金额", "状态"]);
    if (tab === "payments") return renderSimpleRelation(customer, "payments", "回款", ["amount", "dueDate", "status"], ["金额", "日期", "状态"]);
    if (tab === "invoices") return renderSimpleRelation(customer, "invoices", "发票", ["invoiceNo", "amount", "status"], ["编号", "金额", "状态"]);
    if (tab === "attachments") return renderSimpleRelation(customer, "attachments", "附件", ["name", "type", "date"], ["名称", "类型", "日期"]);
    if (tab === "mailTimeline") return renderMailTimeline(customer);
    if (tab === "drafts") return renderSimpleRelation(customer, "drafts", "邮件草稿", ["subject", "date", "status"], ["主题", "日期", "状态"]);
    return "";
  }

  function renderBaseDetail(customer) {
    const items = [
      ["客户来源", customer.source],
      ["负责人", customer.owner],
      ["客户级别", customer.priority],
      ["推荐产品", customer.product],
      ["付款风险", customer.paymentRisk],
      ["下次联系", customer.nextDate || getNextDate(customer)],
      ["网址", customer.website],
      ["LinkedIn", customer.linkedin],
      ["Instagram", customer.instagram],
      ["WhatsApp", customer.whatsapp],
      ["邮箱", customer.email],
      ["自有品牌", customer.hasOwnBrand],
      ["咖啡机品类", customer.hasCoffeeCategory],
      ["中国进口经验", customer.hasChinaImport],
      ["黑名单", customer.isBlacklisted],
    ];
    return `<div class="detail-info-grid">${items.map(([label, value]) => `<div><span>${label}</span><strong>${label === "邮箱" && value ? `<a href="${escapeAttr(getComposeUrl(customer))}">${escapeHtml(value)}</a>` : escapeHtml(value || "-")}</strong></div>`).join("")}</div>
      <div class="detail-note"><strong>备注</strong><p>${escapeHtml(customer.notes || "暂无备注")}</p></div>`;
  }

  function renderContactsDetail(customer) {
    const contacts = ensureCustomerContactIds(customer);
    const rows = contacts.length
      ? `<table class="detail-relation-table detail-contact-table">
          <thead><tr><th class="contact-delete-cell">删除</th><th>姓名</th><th>职位</th><th>邮箱</th><th>电话</th><th>WhatsApp</th><th>LinkedIn</th><th>备注</th><th>操作</th></tr></thead>
          <tbody>${contacts.map((contact) => `<tr>
            <td class="contact-delete-cell">
              <input type="checkbox" data-detail-contact-delete-check data-contact-id="${escapeAttr(contact.id)}" title="勾选删除该联系人" aria-label="删除联系人 ${escapeAttr(contact.name || contact.email || "")}" />
            </td>
            <td>${escapeHtml(contact.name || "-")}</td>
            <td>${escapeHtml(contact.title || "-")}</td>
            <td>${escapeHtml(contact.email || "-")}</td>
            <td>${escapeHtml(contact.phone || "-")}</td>
            <td>${escapeHtml(contact.whatsapp || "-")}</td>
            <td>${contact.linkedin ? `<a href="${escapeAttr(contact.linkedin)}" target="_blank" rel="noreferrer">打开</a>` : "-"}</td>
            <td>${escapeHtml(contact.notes || "-")}</td>
            <td class="detail-contact-actions">
              <button class="module-row-btn" type="button" data-detail-contact-action="edit" data-contact-id="${escapeAttr(contact.id)}">编辑</button>
              <button class="module-row-btn danger" type="button" data-detail-contact-action="delete" data-contact-id="${escapeAttr(contact.id)}">删除</button>
            </td>
          </tr>`).join("")}</tbody>
        </table>`
      : `<div class="empty-state compact">暂无联系人</div>`;
    return `<div class="detail-section-head"><h4>联系人</h4><button class="ghost-btn" type="button" data-detail-action="addContact">添加联系人</button></div>
      ${rows}`;
  }

  function renderFollowupsDetail(customer) {
    const rows = (customer.followUps || []).slice().sort((a, b) => String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || "")));
    if (!rows.length) {
      return `<div class="detail-section-head"><h4>跟进记录</h4><button class="ghost-btn" type="button" data-detail-action="addFollow">添加跟进</button></div>
        <div class="empty-state compact">暂无跟进记录</div>`;
    }
    return `<div class="detail-section-head"><h4>跟进记录</h4><button class="ghost-btn" type="button" data-detail-action="addFollow">添加跟进</button></div>
      <table class="detail-relation-table detail-followup-table">
        <thead><tr><th>日期</th><th>联系人</th><th>方式</th><th>类型</th><th>跟进内容</th><th>当前阶段</th><th>下次联系</th><th>创建人</th><th>操作</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td>${escapeHtml(row.date || "-")}</td>
          <td>${escapeHtml(row.contact || "-")}</td>
          <td>${escapeHtml(row.channel || "-")}</td>
          <td>${escapeHtml(row.followType || "-")}</td>
          <td>${escapeHtml(row.summary || "-")}</td>
          <td>${escapeHtml(row.stage || "-")}</td>
          <td>${escapeHtml(row.nextDate || "-")}</td>
          <td>${escapeHtml(row.createdBy || "-")}</td>
          <td class="detail-follow-actions">
            <button class="module-row-btn" type="button" data-detail-follow-action="edit" data-follow-id="${escapeAttr(row.id)}">编辑</button>
            <button class="module-row-btn danger" type="button" data-detail-follow-action="delete" data-follow-id="${escapeAttr(row.id)}">删除</button>
          </td>
        </tr>`).join("")}</tbody>
      </table>`;
  }

  function renderSimpleRelation(customer, key, title, fields, labels) {
    const actionMap = {
      opportunities: "addOpportunity",
      quotes: "addQuote",
      contracts: "addContract",
      payments: "addPayment",
      invoices: "addInvoice",
      attachments: "addAttachment",
      letters: "generateLetter",
      drafts: "saveDraft",
    };
    return `<div class="detail-section-head"><h4>${title}</h4><button class="ghost-btn" type="button" data-detail-action="${actionMap[key] || ""}">新增</button></div>
      ${renderRelationTable(customer[key] || [], fields, labels)}`;
  }

  function renderRelationTable(rows, fields, labels) {
    if (!rows.length) return `<div class="empty-state compact">暂无记录</div>`;
    return `<table class="detail-relation-table"><thead><tr>${labels.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${fields.map((field) => `<td>${escapeHtml(row[field] || "-")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function ensureCustomerContactIds(customer) {
    customer.contacts = Array.isArray(customer.contacts) ? customer.contacts : [];
    let changed = false;
    customer.contacts = customer.contacts.map((contact) => {
      if (contact.id) return contact;
      changed = true;
      return { ...contact, id: newId() };
    });
    if (changed) saveCustomers();
    return customer.contacts;
  }

  function renderTimelineList(rows) {
    if (!rows.length) return `<div class="empty-state compact">暂无时间轴</div>`;
    return `<div class="customer-timeline-list">${rows
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .map((item) => `<article><strong>${escapeHtml(item.type || "记录")}</strong><span>${escapeHtml(item.date || "")}</span><p>${escapeHtml(item.content || "")}</p></article>`)
      .join("")}</div>`;
  }

  function renderMailTimeline(customer) {
    const rows = getCustomerMailTimeline(customer);
    if (!rows.length) return `<div class="empty-state compact">暂无邮件活动</div>`;
    return `<div class="customer-timeline-list">${rows
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .map((item) => `<article><strong>${escapeHtml(item.type)}</strong><span>${escapeHtml(item.date || "")}</span><p>${escapeHtml(item.content || "")}</p></article>`)
      .join("")}</div>`;
  }

  function renderUnifiedTimeline(customer) {
    const seen = new Set();
    const entries = [];
    let idx = 0;

    // 1. Customer timeline entries (from addTimeline calls)
    // Dedup: same date + same type + same content prefix = duplicate
    // For AI/system types, same date + same type alone = duplicate (one per type per day)
    const systemTypes = new Set(["AI网站分析", "AI自动调研", "AI识别客户资料", "AI助手创建", "导入/初始化"]);
    (customer.timeline || []).forEach((item) => {
      if (!item) return;
      const ct = (item.content || "").slice(0, 60).replace(/\s+/g, " ");
      const strictKey = `${item.date || ""}|${item.type || ""}|${ct}`;
      // For system types, also check date+type alone to avoid same-type duplicates on one day
      const typeKey = systemTypes.has(item.type) ? `${item.date || ""}|${item.type || ""}` : "";
      if (seen.has(strictKey) || (typeKey && seen.has(typeKey))) return;
      seen.add(strictKey);
      if (typeKey) seen.add(typeKey);
      entries.push({
        id: item.id || `tl-${idx++}`,
        date: item.date || "", category: "system",
        typeLabel: item.type || "系统记录", content: item.content || "",
        cssClass: "timeline-system", icon: "📌", source: "timeline", sourceId: item.id
      });
    });

    // 2. Followup records
    (customer.followUps || []).forEach((f) => {
      if (!f) return;
      const key = `${f.date || ""}|跟进·${f.channel || ""}|${(f.summary || "").slice(0, 50)}`;
      if (seen.has(key)) return; seen.add(key);
      const ch = f.channel || "";
      entries.push({
        id: f.id || `fl-${idx++}`,
        date: f.date || "", category: "followup",
        typeLabel: "跟进" + (ch ? " · " + ch : ""),
        content: [f.summary, f.feedback ? "反馈: " + f.feedback : "", f.nextAction ? "下一步: " + f.nextAction : ""].filter(Boolean).join(" | "),
        cssClass: "timeline-followup", icon: ch === "WhatsApp" ? "💬" : ch === "LinkedIn" ? "🔗" : ch === "电话" ? "📞" : ch === "展会" ? "🎪" : "📝",
        source: "followup", sourceId: f.id
      });
    });

    // 3. Quote records
    (customer.quotes || []).forEach((q) => {
      if (!q) return;
      const key = `${q.date || q.createdAt || ""}|报价|${(q.quoteNo || q.product || "").slice(0, 40)}`;
      if (seen.has(key)) return; seen.add(key);
      entries.push({
        id: q.id || `qt-${idx++}`,
        date: q.date || q.createdAt || "", category: "quote",
        typeLabel: "报价单", content: [q.quoteNo, q.product, q.amount || q.fob, q.quantity].filter(Boolean).join(" · "),
        cssClass: "timeline-quote", icon: "📋", source: "quote", sourceId: q.id
      });
    });

    // 4. Attachment records
    (customer.attachments || []).forEach((a) => {
      if (!a) return;
      const key = `${a.date || ""}|附件|${(a.name || "").slice(0, 40)}`;
      if (seen.has(key)) return; seen.add(key);
      entries.push({
        id: a.id || `at-${idx++}`,
        date: a.date || a.createdAt || "", category: "attachment",
        typeLabel: "附件", content: [a.name, a.type].filter(Boolean).join(" · "),
        cssClass: "timeline-attachment", icon: "📎", source: "attachment", sourceId: a.id
      });
    });

    // 5. Mail events
    const mailEntries = getCustomerMailTimeline(customer);
    mailEntries.forEach((item) => {
      if (!item) return;
      const key = `${item.date || ""}|${item.type || ""}|${(item.content || "").slice(0, 50)}`;
      if (seen.has(key)) return; seen.add(key);
      entries.push({
        id: `ml-${idx++}`,
        date: item.date || "", category: "mail",
        typeLabel: item.type || "邮件", content: item.content || "",
        cssClass: "timeline-mail", icon: item.type === "收件" ? "📥" : item.type === "发件" ? "📤" : "📧",
        source: "mail"
      });
    });

    entries.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    // Category filter
    const filter = (typeof timelineFilter === "undefined" ? "all" : timelineFilter) || "all";
    const cats = [
      ["all", "全部"], ["mail", "邮件"], ["followup", "跟进"],
      ["quote", "报价"], ["attachment", "附件"], ["system", "AI分析"]
    ];
    const filterBar = `<div class="timeline-filter-bar">${cats.map(([k, label]) =>
      `<button class="tl-filter-btn ${filter === k ? "active" : ""}" type="button" data-tl-filter="${k}">${label}</button>`
    ).join("")}<button class="tl-clean-btn" type="button" data-tl-action="cleanup" title="扫描所有客户，清理重复的时间轴记录">🧹 清理重复</button></div>`;

    const filtered = filter === "all" ? entries : entries.filter((e) => e.category === filter);

    const cleanBtn = `<button class="ghost-btn tl-clean-btn" type="button" data-tl-action="cleanup" title="扫描所有客户，清理重复的时间轴记录">🧹 清理重复</button>`;
    if (!filtered.length) return filterBar + cleanBtn + `<div class="empty-state compact">${filter === "all" ? "暂无时间轴记录" : "该分类下暂无记录"}</div>`;

    return filterBar + `<div class="customer-timeline-list">${filtered.map((item) => `
      <article class="timeline-item ${item.cssClass}" data-tl-id="${escapeHtml(item.id)}" data-tl-source="${escapeHtml(item.source)}" data-tl-source-id="${escapeHtml(item.sourceId || "")}">
        <div class="timeline-icon">${item.icon}</div>
        <div class="timeline-body">
          <div class="timeline-top-row">
            <strong>${escapeHtml(item.typeLabel)}</strong>
            <span class="timeline-date">${escapeHtml(item.date || "")}</span>
            <span class="timeline-actions">
              <button class="tl-edit-btn" type="button" data-tl-action="edit" data-tl-id="${escapeHtml(item.id)}" title="编辑">✏️</button>
              <button class="tl-del-btn" type="button" data-tl-action="delete" data-tl-id="${escapeHtml(item.id)}" data-tl-source="${escapeHtml(item.source)}" data-tl-source-id="${escapeHtml(item.sourceId || "")}" title="删除">🗑️</button>
            </span>
          </div>
          <p>${escapeHtml(item.content || "")}</p>
        </div>
      </article>`).join("")}</div>`;
  }

  function handleTimelineAction(action, entryId, source, sourceId, customer) {
    if (action === "cleanup") {
      if (confirm("扫描所有客户的时间轴，清理重复记录？\n\n只删除时间轴中的重复显示，不影响原始客户、邮件、报价、跟进数据。")) {
        cleanupTimelineDuplicates();
      }
      return;
    }
    if (action === "edit") {
      const newContent = prompt("编辑时间轴内容", "");
      if (!newContent) return;
      // Update in customer.timeline if that's the source
      const entry = (customer.timeline || []).find((t) => t.id === entryId);
      if (entry) { entry.content = newContent; entry.updatedAt = todayString(); }
      else { customer.timeline = customer.timeline || []; customer.timeline.unshift({ id: newId(), date: todayString(), type: "手动编辑", content: newContent }); }
      saveCustomers(); renderCustomerDetail();
      return;
    }
    if (action === "delete") {
      const sourceLabels = { timeline: "时间轴记录", followup: "跟进记录", quote: "报价单", attachment: "附件", mail: "邮件记录" };
      const label = sourceLabels[source] || "记录";
      const msg = source !== "timeline" && sourceId
        ? `「${label}」关联了原始${label}。\n\n确定 → 仅从时间轴隐藏\n取消 → 返回`
        : `确定删除这条时间轴记录？`;
      if (!confirm(msg)) return;
      // If source is timeline, delete from customer.timeline
      if (source === "timeline" || !sourceId) {
        customer.timeline = (customer.timeline || []).filter((t) => t.id !== entryId);
      } else {
        // Hide: only remove from timeline array, keep original
        customer.timeline = (customer.timeline || []).filter((t) => t.id !== entryId);
      }
      saveCustomers(); renderCustomerDetail();
    }
  }

  function cleanupTimelineDuplicates() {
    const systemTypes = new Set(["AI网站分析", "AI自动调研", "AI识别客户资料", "AI助手创建", "导入/初始化"]);
    let totalRemoved = 0;
    let customersAffected = 0;
    customers.forEach((customer) => {
      const tl = customer.timeline || [];
      if (!tl.length) return;
      const seen = new Set();
      const kept = [];
      let removed = 0;
      tl.forEach((item) => {
        if (!item) { removed++; return; }
        const ct = (item.content || "").slice(0, 60).replace(/\s+/g, " ");
        const strictKey = `${item.date || ""}|${item.type || ""}|${ct}`;
        const typeKey = systemTypes.has(item.type) ? `${item.date || ""}|${item.type || ""}` : "";
        if (seen.has(strictKey) || (typeKey && seen.has(typeKey))) {
          removed++;
        } else {
          seen.add(strictKey);
          if (typeKey) seen.add(typeKey);
          kept.push(item);
        }
      });
      if (removed > 0) {
        customer.timeline = kept;
        totalRemoved += removed;
        customersAffected++;
      }
    });
    if (totalRemoved > 0) {
      saveCustomers();
      notify(`清理完成：移除 ${totalRemoved} 条重复记录，涉及 ${customersAffected} 个客户`);
    } else {
      notify("未发现重复的时间轴记录");
    }
    renderCustomerDetail();
  }

  function handleCustomerFollowAction(action, customer, followId) {
    const record = (customer.followUps || []).find((item) => item.id === followId);
    if (!record) return;

    if (action === "delete") {
      const ok = confirm("确定删除这条跟进记录吗？");
      if (!ok) return;
      customer.followUps = (customer.followUps || []).filter((item) => item.id !== followId);
      addTimeline(customer, "删除跟进", record.summary || record.date || "删除跟进记录");
      customer.updatedAt = todayString();
      saveCustomers();
      document.dispatchEvent(new CustomEvent("foryal:customer-followup-deleted", { detail: { id: followId, customerId: customer.id } }));
      renderCustomerModule();
      notify("跟进记录已删除");
      return;
    }

    if (action === "edit") {
      openQuickRecordModal("编辑跟进记录", getFollowupModalFields(customer, record), (values) => {
        Object.assign(record, values, {
          updatedBy: window.FORYAL_CRM?.getCurrentUser?.()?.name || customer.owner || "Lina",
          updatedAt: todayString(),
        });
        customer.nextDate = values.nextDate || customer.nextDate || "";
        customer.stage = values.stage || customer.stage;
        addTimeline(customer, "编辑跟进", values.summary || "更新跟进记录");
        document.dispatchEvent(new CustomEvent("foryal:customer-followup-saved", {
          detail: { customerId: customer.id, company: customer.company, record },
        }));
      }, customer);
    }
  }

  function handleCustomerContactAction(action, customer, contactId) {
    const contacts = ensureCustomerContactIds(customer);
    const contact = contacts.find((item) => item.id === contactId);
    if (!contact) return;

    if (action === "delete") {
      const ok = confirm(`确定删除联系人「${contact.name || contact.email || "未命名"}」吗？\n\n如果该联系人已离职，删除后不会影响客户公司资料和历史跟进记录。`);
      if (!ok) return;
      const deletedIndex = contacts.findIndex((item) => item.id === contactId);
      customer.contacts = contacts.filter((item) => item.id !== contactId);
      syncPrimaryContactFromContacts(customer, deletedIndex === 0 || contact.name === customer.contact || contact.email === customer.email);
      addTimeline(customer, "删除联系人", `删除联系人：${contact.name || contact.email || "未命名"}`);
      customer.updatedAt = todayString();
      saveCustomers();
      renderCustomerModule();
      notify("联系人已删除");
      return true;
    }

    if (action === "edit") {
      openQuickRecordModal("编辑联系人", getContactModalFields(contact), (values) => {
        Object.assign(contact, values);
        const index = contacts.findIndex((item) => item.id === contactId);
        syncPrimaryContactFromContacts(customer, index === 0 || contact.name === customer.contact || contact.email === customer.email);
        addTimeline(customer, "编辑联系人", `编辑联系人：${values.name || values.email || "未命名"}`);
      }, customer);
      return true;
    }
    return false;
  }

  function getContactModalFields(contact = {}) {
    return [
      { key: "name", label: "姓名", required: true, value: contact.name || "" },
      { key: "title", label: "职位", value: contact.title || "" },
      { key: "email", label: "邮箱", type: "email", value: contact.email || "" },
      { key: "phone", label: "电话", value: contact.phone || "" },
      { key: "whatsapp", label: "WhatsApp", value: contact.whatsapp || "" },
      { key: "linkedin", label: "LinkedIn", type: "url", value: contact.linkedin || "" },
      { key: "notes", label: "备注", type: "textarea", value: contact.notes || "" },
    ];
  }

  function syncPrimaryContactFromContacts(customer, force = false) {
    if (!force) return;
    const primary = (customer.contacts || [])[0];
    customer.contact = primary?.name || "";
    customer.title = primary?.title || "";
    customer.email = primary?.email || "";
    customer.phone = primary?.phone || "";
    customer.whatsapp = primary?.whatsapp || "";
    customer.linkedin = primary?.linkedin || "";
  }

  function getFollowupModalFields(customer, record = {}) {
    const suggested = getSuggestedNextFollow(customer);
    return [
      { key: "date", label: "跟进日期", type: "date", value: record.date || todayString() },
      { key: "contact", label: "联系人", value: record.contact || customer.contact || customer.contacts?.[0]?.name || "" },
      { key: "channel", label: "跟进方式", type: "select", value: record.channel || "Email", options: ["Email", "WhatsApp", "LinkedIn", "Instagram", "电话", "展会", "拜访", "其他"] },
      { key: "followType", label: "跟进类型", type: "select", value: record.followType || "首次开发", options: ["首次开发", "已发送资料", "已报价", "样品沟通", "样品测试中", "客户反馈", "价格谈判", "等待回复", "沉睡唤醒", "成交维护"] },
      { key: "summary", label: "跟进内容", type: "textarea", required: true, value: record.summary || "" },
      { key: "feedback", label: "客户反馈", type: "textarea", value: record.feedback || "" },
      { key: "concerns", label: "客户关心点", value: record.concerns || "" },
      { key: "stage", label: "当前阶段", type: "select", value: record.stage || customer.stage || suggested.stage || "新客户", options: ["新客户", "已联系", "已发资料", "已报价", "样品中", "谈判中", "等待回复", "已成交", "暂停"] },
      { key: "nextAction", label: "下一步动作", value: record.nextAction || suggested.action || "" },
      { key: "nextDate", label: "下次联系时间", type: "date", value: record.nextDate || customer.nextDate || suggested.date || "" },
      { key: "reminderCycle", label: "提醒周期", type: "select", value: record.reminderCycle || "7天", options: ["3天", "7天", "10天", "14天", "30天", "自定义"] },
      { key: "completed", label: "是否完成", type: "select", value: record.completed || "否", options: ["否", "是"] },
      { key: "result", label: "跟进结果", value: record.result || "" },
      { key: "comments", label: "备注", type: "textarea", value: record.comments || "" },
    ];
  }

  function handleDetailAction(action, customer) {
    const today = todayString();
    if (action === "addContact") {
      openQuickRecordModal("添加联系人", getContactModalFields(), (values) => {
        customer.contacts = Array.isArray(customer.contacts) ? customer.contacts : [];
        customer.contacts.push({ id: newId(), ...values });
        syncPrimaryContactFromContacts(customer, customer.contacts.length === 1 || !customer.contact);
        addTimeline(customer, "新增联系人", `添加联系人：${values.name}`);
      }, customer);
      return;
    } else if (action === "addFollow") {
      openQuickRecordModal("添加跟进记录", getFollowupModalFields(customer), (values) => {
        customer.followUps = Array.isArray(customer.followUps) ? customer.followUps : [];
        const record = {
          id: newId(),
          customer: customer.company,
          customerId: customer.id,
          ...values,
          createdAt: today,
          updatedAt: today,
          createdBy: window.FORYAL_CRM?.getCurrentUser?.()?.name || customer.owner || "Lina",
          updatedBy: window.FORYAL_CRM?.getCurrentUser?.()?.name || customer.owner || "Lina",
        };
        customer.followUps.unshift(record);
        customer.nextDate = values.nextDate || customer.nextDate || "";
        customer.stage = values.stage || customer.stage;
        addTimeline(customer, "新增跟进", values.summary);
        document.dispatchEvent(new CustomEvent("foryal:customer-followup-saved", {
          detail: { customerId: customer.id, company: customer.company, record },
        }));
      }, customer);
      return;
    } else if (action === "addOpportunity") {
      const name = prompt("商机名称", `${customer.product || "咖啡机"} 项目`);
      if (!name) return;
      customer.opportunities.unshift({ id: newId(), name, stage: "需求确认", amount: "", date: today });
      addTimeline(customer, "新增商机", name);
    } else if (action === "addQuote") {
      const amount = prompt("报价金额/说明", `${customer.product || "产品"} FOB`);
      if (!amount) return;
      customer.quotes.unshift({ id: newId(), quoteNo: `Q-${today.replaceAll("-", "")}-${customer.quotes.length + 1}`, product: customer.product, amount, date: today });
      customer.isQuoted = "是";
      customer.stage = "已报价";
      addTimeline(customer, "新增报价", amount);
    } else if (action === "addContract") {
      const contractNo = prompt("合同/PI 编号", `PI-${today.replaceAll("-", "")}`);
      if (!contractNo) return;
      customer.contracts.unshift({ id: newId(), contractNo, amount: "", status: "草稿", date: today });
      addTimeline(customer, "新增合同", contractNo);
    } else if (action === "addPayment") {
      const amount = prompt("回款金额");
      if (!amount) return;
      customer.payments.unshift({ id: newId(), amount, dueDate: today, status: "未收" });
      addTimeline(customer, "新增回款计划", amount);
    } else if (action === "addInvoice") {
      const invoiceNo = prompt("发票编号", `INV-${today.replaceAll("-", "")}`);
      if (!invoiceNo) return;
      customer.invoices.unshift({ id: newId(), invoiceNo, amount: "", status: "草稿" });
      addTimeline(customer, "新增发票", invoiceNo);
    } else if (action === "addAttachment") {
      const name = prompt("附件名称");
      if (!name) return;
      customer.attachments.unshift({ id: newId(), name, type: "资料", date: today });
      addTimeline(customer, "新增附件", name);
    } else if (action === "generateLetter") {
      const draft = buildCustomerLetter(customer);
      customer.letters.unshift({ id: newId(), title: `${customer.company} 开发信`, channel: "Email", date: today, body: draft });
      addTimeline(customer, "生成开发信", "根据客户信息生成模板开发信。");
      navigator.clipboard?.writeText(draft);
      notify("开发信已生成并复制");
    } else if (action === "saveDraft") {
      const subject = prompt("邮件主题", `${customer.product || "Coffee Machine"} OEM / ODM Cooperation`);
      if (!subject) return;
      customer.drafts.unshift({ id: newId(), subject, date: today, status: "草稿", body: buildCustomerLetter(customer) });
      addTimeline(customer, "保存邮件草稿", subject);
    } else if (action === "analyzeWebsite") {
      openWebsiteAnalysisModal(customer);
      return;
    }
    customer.updatedAt = today;
    saveCustomers();
    renderCustomerModule();
    notify("已保存");
  }

  function extractBusinessDomain(email) {
    if (!email) return "";
    const match = String(email).match(/@([^@\s]+)$/i);
    if (!match) return "";
    const domain = match[1].toLowerCase().trim();
    const publicDomains = new Set([
      "gmail.com","googlemail.com","outlook.com","hotmail.com","live.com","msn.com",
      "yahoo.com","yahoo.co.jp","qq.com","163.com","126.com","139.com","aliyun.com",
      "foxmail.com","icloud.com","aol.com","proton.me","protonmail.com"
    ]);
    if (publicDomains.has(domain)) return "";
    return domain;
  }

  function openWebsiteAnalysisModal(customer) {
    let websiteUrl = customer.website || "";
    // Auto-extract from email if no website
    if (!websiteUrl && customer.email) {
      const domain = extractBusinessDomain(customer.email);
      if (domain) websiteUrl = "https://" + domain;
    }
    const domainHint = (!customer.website && websiteUrl) ? `<small class="website-analysis-hint ok">已从邮箱自动提取企业域名</small>` : "";
    const noDomainHint = (!customer.website && !websiteUrl && customer.email) ? `<small class="website-analysis-hint warn">邮箱为公共邮箱，请手动输入公司网址</small>` : "";

    const modal = document.querySelector("#customerModal");
    modal.hidden = false;
    modal.innerHTML = `
      <div class="customer-modal-card website-analysis-card">
        <div class="customer-modal-head">
          <div>
            <h3>🤖 AI 网站分析</h3>
            <p>输入网址，AI 自动分析公司规模、主营产品、是否进口中国货、负责人信息</p>
          </div>
          <button class="icon-close" id="closeWebsiteAnalysisModal" type="button">&times;</button>
        </div>
        <div class="customer-modal-body">
          <label class="website-analysis-field">公司网址
            ${domainHint}${noDomainHint}
            <div class="website-analysis-url-row">
              <input id="websiteAnalysisUrl" type="url" value="${escapeHtml(websiteUrl)}" placeholder="https://www.example.com" />
              <button class="primary-btn" id="startWebsiteAnalysis" type="button">分析</button>
            </div>
          </label>
          <div id="websiteAnalysisResult" class="website-analysis-result"></div>
        </div>
      </div>
    `;
    modal.querySelector("#closeWebsiteAnalysisModal").addEventListener("click", () => { modal.hidden = true; });
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

    // If customer already has a valid URL, auto-start analysis
    var urlInputRef = modal.querySelector("#websiteAnalysisUrl");
    if (urlInputRef && urlInputRef.value && /^https?:\/\//i.test(urlInputRef.value.trim())) {
      setTimeout(function() { modal.querySelector("#startWebsiteAnalysis").click(); }, 300);
    }

    modal.querySelector("#startWebsiteAnalysis").addEventListener("click", async () => {
      const urlInput = modal.querySelector("#websiteAnalysisUrl");
      const resultDiv = modal.querySelector("#websiteAnalysisResult");
      const url = urlInput.value.trim();
      if (!url) { notify("请输入网址"); return; }
      if (!/^https?:\/\//i.test(url)) { notify("网址需以 http:// 或 https:// 开头"); return; }

      // Check API key
      const aiKey = (() => {
        try { return JSON.parse(localStorage.getItem("coffee-machine-crm-ai-settings-v1") || "{}")?.apiKey || ""; }
        catch { return ""; }
      })();
      if (!aiKey) { resultDiv.innerHTML = `<div class="empty-state compact">请先在「设置 → AI 配置」中配置 DeepSeek API Key</div>`; return; }

      resultDiv.innerHTML = `<div class="empty-state compact">⏳ AI 正在分析 ${escapeHtml(url)}...</div>`;
      const btn = modal.querySelector("#startWebsiteAnalysis");
      btn.disabled = true;
      btn.textContent = "分析中...";

      try {
        const resp = await fetch("/api/ai-website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            apiKey: aiKey,
            customerContext: JSON.stringify({
              company: customer.company || "",
              country: customer.country || "",
              product: customer.product || "CM-1700MY",
            }),
          }),
        });
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.message || data.error || "Analysis failed");

        // Attach company context for search link generation
        data._companyName = customer.company || '';
        data._analysisUrl = url;
        resultDiv.innerHTML = buildWebsiteAnalysisResult(data);
        // Wire apply button
        modal.querySelector("#applyWebsiteAnalysis")?.addEventListener("click", () => {
          applyWebsiteAnalysisToCustomer(customer, data, url);
          modal.hidden = true;
        });
      } catch (err) {
        resultDiv.innerHTML = `<div class="empty-state compact">❌ 分析失败：${escapeHtml(err.message)}<br><small>请检查网址是否可访问，或稍后重试</small></div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = "分析";
      }
    });
  }

  function normalizeWebsiteAnalysisData(raw) {
    const data = Object.assign({}, raw || {});
    data.companySize = toChineseAnalysisText(data.companySize, "未知");
    data.summary = toChineseAnalysisText(data.summary, "AI 已完成分析，但返回摘要包含非中文内容，已隐藏。请重新分析获取中文摘要。");
    data.businessModel = translateBusinessModel(data.businessModel);
    data.importCapability = toChineseAnalysisText(data.importCapability, "");
    data.importsFromChina = toChineseAnalysisText(data.importsFromChina, "");
    if (!data.importsFromChina && data.importCapability) data.importsFromChina = data.importCapability;
    if (!data.importCapability && data.importsFromChina) data.importCapability = data.importsFromChina;
    data.coffeeOpportunity = translateOpportunityLevel(data.coffeeOpportunity || data.coffeeRelevance || "");
    data.coffeeRelevance = data.coffeeOpportunity;
    data.opportunityReason = toChineseAnalysisText(data.opportunityReason, "");
    data.recommendedModel = normalizeProduct(data.recommendedModel || data.recommendedProduct || "");
    data.recommendedProduct = data.recommendedModel;
    data.modelReason = toChineseAnalysisText(data.modelReason, "");
    data.mainProducts = uniqueCleanList(toArray(data.mainProducts).map(translateProductCategory));
    data.developmentSuggestions = uniqueCleanList(toArray(data.developmentSuggestions).map(function(item) {
      return toChineseAnalysisText(item, "建议从客户现有产品结构切入，强调 FORYAL 咖啡机 OEM/ODM、稳定供货和差异化型号。");
    }));
    data.keyPersons = toArray(data.keyPersons).map(function(person) {
      return {
        name: toChineseAnalysisText(person?.name || "", ""),
        title: toChineseAnalysisText(person?.title || "", "职位未知"),
        linkedin: person?.linkedin || "",
      };
    }).filter(function(person) { return person.name || person.title !== "职位未知"; });
    return data;
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return [value];
  }

  function uniqueCleanList(items) {
    const seen = new Set();
    return items.map(function(item) { return String(item || "").trim(); })
      .filter(Boolean)
      .filter(function(item) {
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function hasUnsupportedScript(value) {
    return /[\u0370-\u03ff\u0400-\u04ff\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\u0900-\u097f\u3040-\u30ff\uac00-\ud7af]/.test(String(value || ""));
  }

  function toChineseAnalysisText(value, fallback) {
    let text = String(value || "").trim();
    if (!text) return fallback || "";
    text = replaceKnownForeignTerms(text);
    return hasUnsupportedScript(text) ? (fallback || "未明确") : text;
  }

  function replaceKnownForeignTerms(value) {
    let text = String(value || "");
    const replacements = [
      ["מכשירי חשמל ביתיים", "家用电器"],
      ["מוצרי קפה", "咖啡相关产品"],
      ["מוצרי מטבח גדולים", "大型厨房电器"],
      ["מוצרי מטבח קטנים", "厨房小家电"],
      ["חימום וקירור הבית", "家庭取暖与制冷电器"],
      ["טיפוח ועיצוב השיער", "头发护理与造型电器"],
      ["ניקיון וגיהוץ כביסה", "清洁、熨烫与洗衣电器"],
      ["יבואן/מפיץ/קמעונאי", "进口商 / 分销商 / 零售商"],
      ["יבואן", "进口商"],
      ["מפיץ", "分销商"],
      ["קמעונאי", "零售商"],
    ];
    replacements.forEach(function(pair) {
      text = text.replaceAll(pair[0], pair[1]);
    });
    return text;
  }

  function translateBusinessModel(value) {
    const text = replaceKnownForeignTerms(String(value || "").trim());
    if (!text) return "";
    if (hasUnsupportedScript(text)) return "进口商 / 分销商 / 零售商";
    const lower = text.toLowerCase();
    if (lower.includes("brand") || text.includes("品牌")) return "品牌商";
    if (lower.includes("import") || text.includes("进口")) return "进口商";
    if (lower.includes("distributor") || lower.includes("wholesale") || text.includes("分销") || text.includes("批发")) return "批发商 / 分销商";
    if (lower.includes("retail") || text.includes("零售")) return "零售商";
    if (lower.includes("ecommerce") || lower.includes("e-commerce") || text.includes("电商")) return "电商卖家";
    if (lower.includes("manufacturer") || text.includes("制造")) return "制造商";
    return text;
  }

  function translateOpportunityLevel(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (text.includes("高") || /^high$/i.test(text)) return "高";
    if (text.includes("中") || /^medium$/i.test(text)) return "中";
    if (text.includes("低") || /^low$/i.test(text)) return "低";
    return hasUnsupportedScript(text) ? "中" : text;
  }

  function translateProductCategory(value) {
    const original = replaceKnownForeignTerms(String(value || "").trim());
    if (!original) return "";
    const lower = original.toLowerCase();
    if (original.includes("咖啡") || /coffee|espresso|cappuccino|barista|grinder/.test(lower)) return "咖啡机 / 咖啡相关产品";
    if (original.includes("厨房") || /kitchen|cooking|cookware/.test(lower)) return "厨房小家电";
    if (original.includes("家用电器") || original.includes("电器") || /home appliance|household appliance|electrical appliance/.test(lower)) return "家用电器";
    if (original.includes("清洁") || /vacuum|cleaning|laundry|iron|garment/.test(lower)) return "清洁、熨烫与洗衣电器";
    if (original.includes("制冷") || original.includes("取暖") || /cooling|heating|air conditioner|fan/.test(lower)) return "取暖与制冷电器";
    if (original.includes("护理") || /hair|beauty|personal care/.test(lower)) return "个人护理电器";
    if (/juicer|blender|mixer/.test(lower)) return "榨汁机 / 搅拌机";
    if (/toaster|kettle|oven|microwave/.test(lower)) return "厨房小家电";
    return hasUnsupportedScript(original) ? "未明确（网站显示家电/电器类产品）" : original;
  }

  function buildWebsiteAnalysisResult(data) {
    data = normalizeWebsiteAnalysisData(data);
    var cards = [];

    function card(title, body, cls) {
      return '<div class="ai-card' + (cls ? ' ' + cls : '') + '"><div class="ai-card-title">' + title + '</div><div class="ai-card-body">' + body + '</div></div>';
    }

    // Summary
    if (data.summary) cards.push(card('📝 公司概况', escapeHtml(data.summary)));
    if (data.companySize) cards.push(card('🏢 公司规模', escapeHtml(data.companySize)));

    // Coffee opportunity with badge
    var opp = data.coffeeOpportunity || data.coffeeRelevance || '';
    if (opp) {
      var oppColors = { '高': '#059669', '中': '#d4a017', '低': '#9ca3af' };
      var oppColor = oppColors[opp] || '#64748b';
      var oppHtml = '<span class="ai-badge" style="background:' + oppColor + '">' + escapeHtml(opp) + '</span>';
      if (data.opportunityReason) oppHtml += '<p style="margin-top:8px;color:#475569">' + escapeHtml(data.opportunityReason) + '</p>';
      cards.push(card('☕ 咖啡机机会等级', oppHtml, 'ai-card-opp'));
    }

    // Products
    if (data.mainProducts && data.mainProducts.length) {
      cards.push(card('📦 主营产品', data.mainProducts.map(function(p) { return '<span class="ai-tag">' + escapeHtml(p) + '</span>'; }).join('')));
    }

    if (data.businessModel) cards.push(card('💼 商业模式', escapeHtml(data.businessModel)));
    if (data.importCapability) cards.push(card('🇨🇳 进口能力', escapeHtml(data.importCapability)));
    if (!data.importCapability && data.importsFromChina) cards.push(card('🇨🇳 从中国进口', escapeHtml(data.importsFromChina)));

    // Model recommendation
    var model = data.recommendedModel || data.recommendedProduct || '';
    if (model) {
      var modelHtml = '<strong style="font-size:15px;color:#0f172a">' + escapeHtml(model) + '</strong>';
      if (data.modelReason) modelHtml += '<p style="margin-top:6px;color:#475569">' + escapeHtml(data.modelReason) + '</p>';
      cards.push(card('💡 推荐型号', modelHtml, 'ai-card-model'));
    }

    // Key persons — validate and filter
    function _isValidContactName(n) {
      if (!n || typeof n !== 'string') return false;
      var s = n.trim();
      if (!s) return false;
      if (/^(未知|unknown|N\/A|none|null|联系人|产品经理|采购经理|CEO|CTO|CFO|经理|主管|负责人)$/i.test(s)) return false;
      if (s.length < 2 || s.length > 40) return false;
      return true;
    }
    function _isValidLinkedInUrl(u) {
      if (!u || typeof u !== 'string') return false;
      var s = u.trim();
      if (!s) return false;
      if (/^(未知|unknown|none|null|\/|\/未知)$/i.test(s)) return false;
      return /^https?:\/\/(?:www\.)?linkedin\.com\//i.test(s);
    }
    var validPersons = [];
    if (Array.isArray(data.keyPersons)) {
      validPersons = data.keyPersons.filter(function(p) { return p && _isValidContactName(p.name); });
    }
    if (validPersons.length) {
      cards.push(card('👤 关键联系人', validPersons.map(function(p) {
        var line = escapeHtml((p.name || '') + ' · ' + (p.title || ''));
        if (_isValidLinkedInUrl(p.linkedin)) {
          line += ' <a href="' + escapeHtml(p.linkedin) + '" target="_blank" rel="noopener noreferrer" style="font-size:12px">LinkedIn</a>';
        }
        return '<div style="margin-bottom:4px">' + line + '</div>';
      }).join('')));
    } else {
      // No valid contacts — provide LinkedIn/Google search entry points
      var companyName = (data._companyName || '').trim();
      if (!companyName) {
        // Derive from URL: extract domain
        var urlMatch = (data._analysisUrl || '').match(/https?:\/\/(?:www\.)?([^\/]+)/);
        companyName = urlMatch ? urlMatch[1].replace(/\.[^.]+$/, '') : '';
      }
      if (!companyName) companyName = 'the company';
      var encoded = encodeURIComponent(companyName);
      var searchLinks = [
        { label: 'LinkedIn 搜索采购负责人', href: 'https://www.linkedin.com/search/results/people/?keywords=' + encoded + '%20purchasing%20manager' },
        { label: 'LinkedIn 搜索产品负责人', href: 'https://www.linkedin.com/search/results/people/?keywords=' + encoded + '%20product%20manager' },
        { label: 'LinkedIn 搜索品类负责人', href: 'https://www.linkedin.com/search/results/people/?keywords=' + encoded + '%20category%20manager' },
        { label: 'LinkedIn 搜索 CEO / Founder', href: 'https://www.linkedin.com/search/results/people/?keywords=' + encoded + '%20CEO%20Founder' },
        { label: 'Google 搜索 LinkedIn 采购负责人', href: 'https://www.google.com/search?q=site%3Alinkedin.com%2Fin%20' + encoded + '%20purchasing%20manager' },
        { label: 'Google 搜索官网联系人', href: 'https://www.google.com/search?q=' + encoded + '%20buyer%20purchasing%20product%20manager' },
      ];
      var searchHtml = '<span style="color:#94a3b8">未找到可验证关键联系人。</span>' +
        '<div style="font-size:12px;color:#64748b;margin-top:4px">可通过以下搜索入口继续查找：</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">' +
        searchLinks.map(function(s) {
          return '<a href="' + escapeHtml(s.href) + '" target="_blank" rel="noopener noreferrer" style="font-size:11px;padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;text-decoration:none;color:#475569;background:#f8fafc">' + escapeHtml(s.label) + '</a>';
        }).join('') +
        '</div>' +
      cards.push(card('👤 关键联系人', searchHtml));
    }
    if (data.developmentSuggestions) {
      var tips = Array.isArray(data.developmentSuggestions) ? data.developmentSuggestions : [data.developmentSuggestions];
      var tipsHtml = tips.map(function(t, i) {
        return '<div class="ai-step"><span class="ai-step-num">' + (i + 1) + '</span><span>' + escapeHtml(t) + '</span></div>';
      }).join('');
      cards.push(card('🎯 开发建议', tipsHtml, 'ai-card-suggestions'));
    }

    if (!cards.length) return '<div class="ai-empty">分析完成但无结构化数据</div>';
    return '<div class="ai-result-cards">' + cards.join('') + '</div><button class="primary-btn" id="applyWebsiteAnalysis" type="button" style="width:100%;margin-top:16px;padding:12px;font-size:14px">应用到客户资料</button>';
  }

  function applyWebsiteAnalysisToCustomer(customer, data, url) {
    data = normalizeWebsiteAnalysisData(data);
    const patch = {};
    const importInfo = data.importCapability || data.importsFromChina || "";
    if (importInfo.includes("是") || importInfo.includes("中国进口") || importInfo.includes("进口中国") || importInfo.includes("import")) {
      patch.hasChinaImport = "是";
    }
    const opp = data.coffeeOpportunity || data.coffeeRelevance || "";
    const model = data.recommendedModel || data.recommendedProduct || "";

    const analysisNotes = [
      `【AI网站分析 V2 ${todayString()}】`,
      `网址: ${url}`,
      `公司规模: ${data.companySize || "未知"}`,
      `主营产品: ${(data.mainProducts || []).join(", ")}`,
      `商业模式: ${data.businessModel || "未知"}`,
      `进口能力: ${importInfo || "未知"}`,
      `咖啡机机会: ${opp || "未知"}`,
      `推荐型号: ${model || "待定"}`,
      `开发建议: ${(data.developmentSuggestions || []).join("; ")}`,
    ].filter(Boolean).join("\n");

    patch.notes = (customer.notes || "") + "\n" + analysisNotes;
    if (model) patch.product = model;
    if (data.businessModel) patch.customerType = data.businessModel;
    if (opp === "高") patch.priority = "A";

    if (window.FORYAL_CRM?.updateCustomer) {
      window.FORYAL_CRM.updateCustomer(customer.id, patch);
    }
    addTimeline(customer, "AI网站分析", `完成网站 ${url} 的AI分析(V2)。机会等级: ${opp || "未知"}。${data.summary || ""}`.slice(0, 200));
    notify("网站分析结果已应用到客户资料");
  }

  function getSuggestedNextFollow(customer) {
    const stage = customer.stage || "首次开发";
    let days = 7;
    if (stage === "已报价" || stage === "报价后未回复") days = 6;
    if (stage === "样品寄出") days = 8;
    if (stage === "样品测试") days = 10;
    if (stage === "未回复") days = 7;
    if (stage === "沉睡") days = 30;
    if (customer.priority === "A") days = Math.min(days, 7);
    return {
      stage,
      date: addDays(todayString(), days),
      action: getRecommendedAction(customer, stage),
    };
  }

  function getRecommendedAction(customer, stage) {
    if (stage === "已报价" || stage === "报价后未回复") return "跟进报价反馈，确认目标价、MOQ、认证和包装要求";
    if (stage === "样品寄出") return "确认样品是否收到，并提醒测试重点";
    if (stage === "样品测试") return "询问样品测试反馈，收集外观、性能、包装和目标成本意见";
    if (stage === "沉睡") return "用新型号或Backup Supplier角度重新唤醒";
    if (customer.priority === "A") return "7天内再次联系，优先用Email+LinkedIn双渠道";
    return "发送简短目录/FOB范围，确认是否愿意评估推荐型号";
  }

  function addDays(dateText, days) {
    const date = new Date(dateText);
    date.setDate(date.getDate() + days);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  }

  function openQuickRecordModal(title, fields, onSave, customer) {
    const modal = document.querySelector("#customerModal");
    modal.hidden = false;
    modal.innerHTML = `
      <div class="customer-modal-card quick-record-card">
        <div class="customer-modal-head">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(customer?.company || "")}</p>
          </div>
          <button class="icon-close" id="closeQuickRecordModal" type="button">×</button>
        </div>
        <form class="customer-modal-form" id="quickRecordForm">
          <div class="modal-grid">
            ${fields.map((field) => renderQuickField(field)).join("")}
          </div>
          <div class="customer-modal-actions">
            <button class="ghost-btn" id="cancelQuickRecord" type="button">取消</button>
            <button class="primary-btn" type="submit">保存</button>
          </div>
        </form>
      </div>
    `;
    modal.querySelector("#closeQuickRecordModal").addEventListener("click", closeCustomerModal);
    modal.querySelector("#cancelQuickRecord").addEventListener("click", closeCustomerModal);
    modal.querySelector("#quickRecordForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      onSave(values);
      customer.updatedAt = todayString();
      saveCustomers();
      closeCustomerModal();
      renderCustomerModule();
      notify("已保存");
    });
  }

  function renderQuickField(field) {
    if (field.type === "textarea") return textareaField(field.key, field.label, field.value || "");
    if (field.type === "select") return selectField(field.key, field.label, field.value || field.options?.[0] || "", field.options || []);
    return inputField(field.key, field.label, field.value || "", field.required, field.type || "text");
  }

  function openCustomerModal(customer = null) {
    const modal = document.querySelector("#customerModal");
    const isEdit = !!customer;
    const draft = customer ? cloneCustomer(customer) : createEmptyCustomer();
    modalContacts = Array.isArray(draft.contacts) ? draft.contacts.map((item) => ({ ...item, id: item.id || newId() })) : [];
    modalLogoData = draft.logoData || "";
    modal.hidden = false;
    modal.innerHTML = `
      <div class="customer-modal-card">
        <div class="customer-modal-head">
          <div>
            <h3>${isEdit ? "编辑客户" : "新建客户"}</h3>
            <p>保存国外客户、社媒链接、联系人和外贸判断字段。</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="ghost-btn" id="openAiParseModal" type="button" title="粘贴客户资料文本，AI自动识别并填入表单">🤖 AI识别客户资料</button>
            <button class="icon-close" id="closeCustomerModal" type="button">×</button>
          </div>
        </div>
        <form class="customer-modal-form" id="customerModalForm">
          <section>
            <h4>基础信息</h4>
            <div class="modal-grid">
              ${inputField("company", "客户名称", draft.company, true)}
              ${inputField("owner", "负责人", draft.owner || "Lina")}
              ${selectField("source", "客户来源", draft.source, SOURCES)}
              ${logoField(draft)}
              ${inputField("whatsapp", "手机 / WhatsApp", draft.whatsapp)}
              ${inputField("phone", "电话", draft.phone)}
              ${inputField("email", "邮箱", draft.email, false, "email")}
              ${selectField("priority", "客户级别", draft.priority || "B", ["A+", "A", "A-待补关键人", "B+", "B", "B-", "C-待补资料", "D-不导入"])}
              ${selectField("industry", "客户行业", draft.industry || draft.segment, INDUSTRIES)}
              ${inputField("tags", "自定义标签", draft.tags)}
              ${inputField("nextDate", "下次联系时间", draft.nextDate || getNextDate(draft), false, "date")}
              ${inputField("website", "网址", draft.website, false, "url")}
              ${textareaField("notes", "备注", draft.notes)}
            </div>
          </section>
          <section>
            <h4>外贸专用信息</h4>
            <div class="modal-grid">
              ${countryInputField("country", "国家/地区", draft.country)}
              ${inputField("officialWebsite", "官网", draft.officialWebsite || draft.website, false, "url")}
              ${inputField("linkedin", "LinkedIn", draft.linkedin, false, "url")}
              ${inputField("instagram", "Instagram", draft.instagram, false, "url")}
              ${inputField("facebook", "Facebook", draft.facebook, false, "url")}
              ${inputField("youtube", "YouTube", draft.youtube, false, "url")}
              ${selectField("hasOwnBrand", "是否有自有品牌", draft.hasOwnBrand, ["未知", "是", "否"])}
              ${selectField("hasCoffeeCategory", "是否有咖啡机品类", draft.hasCoffeeCategory, ["未知", "是", "否"])}
              ${selectField("hasChinaImport", "是否有中国进口经验", draft.hasChinaImport, ["未知", "是", "否"])}
              ${selectField("product", "推荐产品", draft.product, PRODUCT_OPTIONS)}
              ${selectField("paymentRisk", "付款风险", draft.paymentRisk, RISK_OPTIONS)}
              ${selectField("customerType", "客户类型", draft.customerType, CUSTOMER_TYPES)}
              ${selectField("isQuoted", "是否已报价", draft.isQuoted, ["否", "是"])}
              ${selectField("isSample", "是否样品客户", draft.isSample, ["否", "是"])}
              ${selectField("isBlacklisted", "是否黑名单", draft.isBlacklisted, ["否", "是"])}
              ${selectField("stage", "跟进阶段", draft.stage, STAGES)}
            </div>
          </section>
          <section>
            <div class="modal-section-head">
              <h4>客户关系 / 联系人</h4>
              <button class="ghost-btn" id="modalAddContact" type="button">添加联系人</button>
            </div>
            <div id="modalContactsHost"></div>
          </section>
          <div class="customer-modal-actions">
            <button class="ghost-btn" id="cancelCustomerModal" type="button">取消</button>
            <button class="ghost-btn" id="saveAndNewContact" type="button">保存并新建联系人</button>
            <button class="primary-btn" type="submit">保存客户</button>
          </div>
        </form>
      </div>
    `;
    renderModalContacts();
    setTimeout(function() { _wireCountrySearchDropdowns(); }, 50);

    modal.querySelector("#closeCustomerModal").addEventListener("click", closeCustomerModal);
    modal.querySelector("#cancelCustomerModal").addEventListener("click", closeCustomerModal);
    modal.querySelector("#openAiParseModal")?.addEventListener("click", () => openAiParseModal(draft));
    modal.querySelector("#modalAddContact").addEventListener("click", () => {
      modalContacts.push(emptyContact());
      renderModalContacts();
    });
    modal.querySelector("#customerLogoInput").addEventListener("change", handleLogoUpload);
    modal.querySelector("#saveAndNewContact").addEventListener("click", () => {
      const saved = saveCustomerFromModal(customer);
      if (!saved) return;
      openCustomerModal(saved);
      modalContacts.push(emptyContact());
      renderModalContacts();
      notify("客户已保存，可继续添加联系人");
    });
    modal.querySelector("#customerModalForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const saved = saveCustomerFromModal(customer);
      if (!saved) return;
      closeCustomerModal();
      selectCustomerById(saved.id);
      notify(isEdit ? "客户已更新" : "客户已创建");
    });

  }

  function renderModalContacts() {
    const host = document.querySelector("#modalContactsHost");
    host.innerHTML = modalContacts.map((contact, index) => `
      <div class="modal-contact-card" data-modal-contact="${index}">
        <div class="modal-contact-head">
          <strong>联系人 ${index + 1}</strong>
          <button class="ghost-btn danger" type="button" data-remove-contact="${index}">删除</button>
        </div>
        <div class="modal-grid">
          ${inputField(`contact_name_${index}`, "姓名", contact.name)}
          ${inputField(`contact_title_${index}`, "职位", contact.title)}
          ${inputField(`contact_email_${index}`, "邮箱", contact.email, false, "email")}
          ${inputField(`contact_phone_${index}`, "电话", contact.phone)}
          ${inputField(`contact_whatsapp_${index}`, "WhatsApp", contact.whatsapp)}
          ${inputField(`contact_linkedin_${index}`, "LinkedIn", contact.linkedin, false, "url")}
          ${textareaField(`contact_notes_${index}`, "备注", contact.notes)}
        </div>
      </div>
    `).join("") || `<div class="empty-state compact">暂未添加联系人</div>`;
    host.querySelectorAll("[data-remove-contact]").forEach((button) => {
      button.addEventListener("click", () => {
        modalContacts.splice(Number(button.dataset.removeContact), 1);
        renderModalContacts();
      });
    });
  }

  function openAiParseModal(draft) {
    const modal = document.querySelector("#customerModal");
    const original = modal.innerHTML;
    modal.innerHTML = `
      <div class="customer-modal-card" style="max-width:600px">
        <div class="customer-modal-head">
          <div><h3>🤖 AI识别客户资料</h3><p>粘贴名片、LinkedIn、WhatsApp、邮件签名、展会信息等文本</p></div>
          <button class="icon-close" id="closeAiParseModal" type="button">×</button>
        </div>
        <div class="customer-modal-body">
          <label>粘贴客户资料文本
            <textarea id="aiParseInput" rows="8" style="width:100%;font-size:13px" placeholder="粘贴名片内容、LinkedIn资料、WhatsApp消息、公司简介、邮件签名、展会名片等...&#10;&#10;支持：英文、中文、波斯语、阿拉伯语、西班牙语等各种语言"></textarea>
          </label>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="primary-btn" id="startAiParse" type="button">🔍 开始识别</button>
            <button class="ghost-btn" id="cancelAiParse" type="button">返回</button>
          </div>
          <div id="aiParseResult" style="margin-top:14px"></div>
        </div>
      </div>
    `;
    modal.querySelector("#closeAiParseModal").addEventListener("click", () => { modal.hidden = true; });
    modal.querySelector("#cancelAiParse").addEventListener("click", () => { modal.hidden = true; });

    modal.querySelector("#startAiParse").addEventListener("click", async () => {
      const input = modal.querySelector("#aiParseInput").value.trim();
      if (!input) { notify("请粘贴客户资料文本"); return; }
      const resultDiv = modal.querySelector("#aiParseResult");
      resultDiv.innerHTML = `<div class="empty-state compact">⏳ AI 正在识别客户资料...</div>`;
      const btn = modal.querySelector("#startAiParse"); btn.disabled = true; btn.textContent = "识别中...";

      const aiKey = (() => { try { return JSON.parse(localStorage.getItem("coffee-machine-crm-ai-settings-v1") || "{}")?.apiKey || ""; } catch { return ""; } })();
      if (!aiKey) { resultDiv.innerHTML = `<div class="empty-state compact">请先在「设置 → AI 配置」中配置 DeepSeek API Key</div>`; btn.disabled = false; btn.textContent = "🔍 开始识别"; return; }

      try {
        const resp = await fetch("/api/ai-task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: "parse-customer-profile", input, apiKey: aiKey }) });
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.message || data.error || "Parse failed");
        if (data.rawOutput) { resultDiv.innerHTML = `<div class="empty-state compact">⚠️ AI返回了非结构化数据：<br><pre style="font-size:11px;text-align:left">${escapeHtml(data.notes || JSON.stringify(data))}</pre></div>`; btn.disabled = false; btn.textContent = "🔍 开始识别"; return; }

        // Store data globally for onclick access
        pendingAiParseData = data;
        pendingAiParseDraft = draft;
        // Use inline onclick which reliably fires in any browser
        resultDiv.innerHTML = buildAiParsePreview(data);
      } catch (err) {
        resultDiv.innerHTML = `<div class="empty-state compact">❌ 识别失败：${escapeHtml(err.message)}</div>`;
      } finally { btn.disabled = false; btn.textContent = "🔍 开始识别"; }
    });
  }

  function buildAiParsePreview(data) {
    const fields = [
      ["🏢 公司名称", data.company],
      ["🇨🇳 国家", data.country],
      ["🌐 网站", data.website],
      ["👤 联系人", data.contactName],
      ["💼 职位", data.contactTitle],
      ["📧 邮箱", data.email],
      ["📱 电话", data.phone],
      ["💬 WhatsApp", data.whatsapp],
      ["🔗 LinkedIn", data.linkedin],
      ["📸 Instagram", data.instagram],
      ["📍 来源", data.source],
      ["🏭 行业", data.industry],
      ["📦 客户类型", data.customerType],
      ["☕ 推荐产品", data.product],
      ["📝 备注", data.notes],
    ];
    const rows = fields.filter(([, v]) => v).map(([label, value]) => `<tr><td style="font-weight:600;white-space:nowrap;padding:3px 8px">${label}</td><td style="padding:3px 8px">${escapeHtml(value)}</td></tr>`).join("");
    return `<div class="ai-analysis-result"><table style="width:100%;font-size:13px">${rows}</table></div>
      ${data.contacts?.length ? `<div style="margin-top:8px"><strong>👥 联系人 (${data.contacts.length})</strong><ul>${data.contacts.map((c) => `<li>${escapeHtml(c.name || "")} · ${escapeHtml(c.title || "")} · ${escapeHtml(c.email || "")}</li>`).join("")}</ul></div>` : ""}
      <button class="primary-btn" id="applyAiParse" type="button" style="margin-top:14px" onclick="window._aiParseApply()">应用到客户资料</button>
      <small style="display:block;margin-top:4px;color:var(--muted)">不会自动保存，您可以检查后再手动保存</small>`;
  }

  function applyAiParseToForm(data, draft) {
    const modal = document.querySelector("#customerModal");
    if (!modal || modal.hidden) { console.error("[AI Parse] Customer modal not found or hidden"); return; }
    var form = modal.querySelector("#customerModalForm");
    if (!form) { console.error("[AI Parse] customerModalForm not found in modal"); return; }
    console.log("[AI Parse] Applying data to form, fields found:", form.querySelectorAll("input, select, textarea").length);
    var setVal = function(name, value) {
      if (!value) return;
      var el = modal.querySelector('[name="' + name + '"]');
      if (!el) { console.warn("[AI Parse] Field not found: " + name); return; }
      if (!el.value || confirm("字段「" + name + "」已有内容\"" + el.value + "\"，是否覆盖为\"" + value + "\"？")) {
        el.value = value;
        console.log("[AI Parse] Set " + name + " = " + value);
      }
    };
    setVal("company", data.company);
    setVal("country", data.country);
    setVal("website", data.website);
    setVal("email", data.email);
    setVal("phone", data.phone);
    setVal("whatsapp", data.whatsapp);
    setVal("linkedin", data.linkedin);
    setVal("instagram", data.instagram);
    setVal("source", data.source);
    setVal("industry", data.industry);
    setVal("customerType", data.customerType);
    setVal("product", data.product);
    if (data.notes) { const el = modal.querySelector("[name='notes']"); if (el) { el.value = el.value ? el.value + "\\n【AI识别】" + data.notes : data.notes; } }
    // Auto-extract domain from email if no website
    if (!data.website && data.email) {
      const domain = extractBusinessDomain(data.email);
      if (domain) { const el = modal.querySelector("[name='website']"); if (el && !el.value) el.value = "https://" + domain; }
    }
    // Add primary contact if name found
    if (data.contactName || data.contactTitle || data.email || data.phone || data.whatsapp || data.linkedin) {
      if (modalContacts.length === 0 || (modalContacts[0] && !modalContacts[0].name && !modalContacts[0].email)) {
        // Replace empty first contact
        if (modalContacts.length === 0) modalContacts.push(emptyContact());
        const c = modalContacts[0];
        if (data.contactName && (!c.name || confirm("联系人姓名已有内容，是否覆盖？"))) c.name = data.contactName;
        if (data.contactTitle && (!c.title || confirm("联系人职位已有内容，是否覆盖？"))) c.title = data.contactTitle;
        if (data.email && (!c.email || confirm("联系人邮箱已有内容，是否覆盖？"))) c.email = data.email;
        if (data.phone && (!c.phone || confirm("联系人电话已有内容，是否覆盖？"))) c.phone = data.phone;
        if (data.whatsapp && (!c.whatsapp || confirm("联系人WhatsApp已有内容，是否覆盖？"))) c.whatsapp = data.whatsapp;
        if (data.linkedin && (!c.linkedin || confirm("联系人LinkedIn已有内容，是否覆盖？"))) c.linkedin = data.linkedin;
      }
    }
    // Add additional contacts
    if (data.contacts?.length) {
      data.contacts.forEach((c) => {
        if (c.name || c.email) {
          modalContacts.push({ id: newId(), name: c.name || "", title: c.title || "", email: c.email || "", phone: c.phone || "", whatsapp: c.whatsapp || "", linkedin: c.linkedin || "", notes: "" });
        }
      });
      if (typeof renderModalContacts === "function") renderModalContacts();
    }
    addTimeline(draft, "AI识别客户资料", "通过AI识别客户资料：" + (data.company || data.contactName || "未知公司"));
    notify("AI识别结果已填入表单，请检查后保存");
  }

  function saveCustomerFromModal(original) {
    const form = document.querySelector("#customerModalForm");
    const data = Object.fromEntries(new FormData(form).entries());
    if (!String(data.company || "").trim()) {
      notify("客户名称必填");
      return null;
    }
    const now = todayString();
    const customer = original || { id: newId(), createdAt: now, followUps: [], timeline: [] };
    const beforePriority = customer.priority;
    const before = original ? JSON.stringify(original) : "";
    Object.assign(customer, data);
    customer.website = customer.website || customer.officialWebsite || "";
    customer.logoData = modalLogoData;
    customer.contacts = deduplicateContacts(readModalContacts(form));
    customer.updatedAt = now;
    customer.nextDate = customer.nextDate || "";
    if (customer.isBlacklisted === "是") customer.stage = "黑名单";
    if (customer.isQuoted === "是" && customer.stage === "新线索") customer.stage = "已报价";
    if (!Array.isArray(customer.timeline)) customer.timeline = [];
    // Auto-grade only if user did NOT manually change priority in this save
    if (String(customer.priority).trim() === String(beforePriority).trim()) {
      customer.priority = autoGradeCustomer(customer);
    }
    if (!original) {
      customer.followUps = [];
      customer.opportunities = [];
      customer.quotes = [];
      customer.contracts = [];
      customer.payments = [];
      customer.invoices = [];
      customer.attachments = [];
      customer.letters = [];
      customer.drafts = [];
      customer.inPool = "否";
      customers.unshift(customer);
      addTimeline(customer, "新增客户", "创建客户资料。");
    } else if (before !== JSON.stringify(customer)) {
      addTimeline(customer, "编辑客户", "更新客户资料。");
    }
    selectedId = customer.id;
    saveCustomers();
    renderCustomerModule();
    return customer;
  }

  function readModalContacts(form) {
    return modalContacts.map((contact, index) => ({
      id: contact.id || newId(),
      name: form.elements[`contact_name_${index}`]?.value || "",
      title: form.elements[`contact_title_${index}`]?.value || "",
      email: form.elements[`contact_email_${index}`]?.value || "",
      phone: form.elements[`contact_phone_${index}`]?.value || "",
      whatsapp: form.elements[`contact_whatsapp_${index}`]?.value || "",
      linkedin: form.elements[`contact_linkedin_${index}`]?.value || "",
      notes: form.elements[`contact_notes_${index}`]?.value || "",
    })).filter((contact) => contact.name || contact.email || contact.whatsapp || contact.linkedin);
  }

  // P0-1: Contact dedup — email is unique key; same email = update, don't create new
  function deduplicateContacts(contacts) {
    if (!contacts || !contacts.length) return contacts || [];
    var seen = {};
    var result = [];
    contacts.forEach(function(c) {
      var email = (c.email || "").trim().toLowerCase();
      if (email && seen[email]) {
        // Merge: update existing contact with new data
        var existing = seen[email];
        if (c.name && !existing.name) existing.name = c.name;
        if (c.title && !existing.title) existing.title = c.title;
        if (c.phone && !existing.phone) existing.phone = c.phone;
        if (c.whatsapp && !existing.whatsapp) existing.whatsapp = c.whatsapp;
        if (c.linkedin && !existing.linkedin) existing.linkedin = c.linkedin;
        if (c.notes && !existing.notes) existing.notes = c.notes;
      } else {
        if (email) seen[email] = c;
        result.push(c);
      }
    });
    return result;
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      modalLogoData = String(reader.result || "");
      const preview = document.querySelector("#customerLogoPreview");
      if (preview) preview.innerHTML = `<img src="${escapeAttr(modalLogoData)}" alt="" />`;
    };
    reader.readAsDataURL(file);
  }

  function closeCustomerModal() {
    const modal = document.querySelector("#customerModal");
    modal.hidden = true;
    modal.innerHTML = "";
  }

  function inputField(name, label, value = "", required = false, type = "text") {
    return `<label>${escapeHtml(label)}<input name="${name}" type="${type}" value="${escapeAttr(value || "")}" ${required ? "required" : ""} /></label>`;
  }

  function countryInputField(name, label, value = "") {
    var cls = "country-search-input";
    return '<label style="position:relative">' + escapeHtml(label) +
      '<input name="' + name + '" type="text" class="' + cls + '" value="' + escapeAttr(value || "") + '" autocomplete="off" placeholder="输入国家名筛选..." />' +
      '<div class="country-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:50;background:#fff;border:1px solid #d1d5db;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,0.1);max-height:260px;overflow-y:auto;font-size:13px"></div>' +
      '</label>';
  }

  function _filterCountryOptions(query) {
    if (!query || !query.trim()) return [];
    var q = query.trim().toLowerCase();
    var starts = []; var contains = [];
    COUNTRIES.forEach(function(c) {
      var cl = c.toLowerCase();
      if (cl.indexOf(q) === 0) starts.push(c);
      else if (cl.indexOf(q) > 0) contains.push(c);
    });
    starts.sort();
    contains.sort();
    return starts.concat(contains).slice(0, 20);
  }

  function _wireCountrySearchDropdowns() {
    document.querySelectorAll('.country-search-input').forEach(function(input) {
      if (input.dataset.wired === '1') return;
      input.dataset.wired = '1';
      var dropdown = input.parentNode.querySelector('.country-dropdown');
      if (!dropdown) return;

      input.addEventListener('focus', function() { _renderCountryDropdown(input, dropdown, input.value); });
      input.addEventListener('input', function() { _renderCountryDropdown(input, dropdown, input.value); });
      input.addEventListener('keydown', function(e) { if (e.key === 'Escape') { dropdown.style.display = 'none'; input.blur(); } });
      input.addEventListener('blur', function() { setTimeout(function() { dropdown.style.display = 'none'; }, 150); });
    });
  }

  function _renderCountryDropdown(input, dropdown, query) {
    var options = _filterCountryOptions(query);
    if (!options.length) { dropdown.style.display = 'none'; return; }
    dropdown.innerHTML = options.map(function(c) {
      return '<div class="country-option" style="padding:6px 10px;cursor:pointer;color:#1e293b" data-value="' + escapeAttr(c) + '">' + escapeHtml(c) + '</div>';
    }).join('');
    dropdown.style.display = 'block';
    dropdown.querySelectorAll('.country-option').forEach(function(opt) {
      opt.addEventListener('mousedown', function(e) { e.preventDefault(); });
      opt.addEventListener('click', function() {
        input.value = opt.dataset.value;
        dropdown.style.display = 'none';
      });
    });
  }

  function selectField(name, label, value = "", options = []) {
    return `<label>${escapeHtml(label)}<select name="${name}">${options.map((option) => `<option ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
  }

  function textareaField(name, label, value = "") {
    return `<label class="wide-field">${escapeHtml(label)}<textarea name="${name}" rows="3">${escapeHtml(value || "")}</textarea></label>`;
  }

  function logoField(customer) {
    return `<label class="logo-upload-field">企业Logo上传
      <span class="logo-upload-preview" id="customerLogoPreview">${customer.logoData ? `<img src="${escapeAttr(customer.logoData)}" alt="" />` : "+"}</span>
      <input id="customerLogoInput" type="file" accept="image/*" />
    </label>`;
  }

  function renderTimelineSubview(host) {
    const rows = customers.flatMap((customer) => (customer.timeline || []).map((item) => ({ ...item, customer: customer.company, customerId: customer.id })));
    host.innerHTML = `<div class="subview-actions"><button class="ghost-btn" id="timelineExport" type="button">导出时间轴 CSV</button></div>
      <div class="customer-subview-list">${rows
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .map((item) => `<article data-customer-id="${item.customerId}"><strong>${escapeHtml(item.customer)}</strong><span>${escapeHtml(item.date || "")} · ${escapeHtml(item.type || "")}</span><p>${escapeHtml(item.content || "")}</p></article>`)
        .join("") || `<div class="empty-state">暂无时间轴</div>`}</div>`;
    host.querySelector("#timelineExport").addEventListener("click", () => exportRowsCsv("客户时间轴.csv", ["客户", "日期", "类型", "内容"], rows.map((row) => [row.customer, row.date, row.type, row.content])));
    host.querySelectorAll("[data-customer-id]").forEach((item) => item.addEventListener("click", () => selectCustomerById(item.dataset.customerId)));
  }

  function renderPoolSubview(host) {
    const rows = customers.filter((customer) => customer.inPool === "是" || customer.stage === "沉睡" || customer.isBlacklisted === "是");
    host.innerHTML = `<div class="subview-actions"><button class="ghost-btn" id="moveSelectedToPool" type="button">当前客户转入公海</button></div>
      ${renderMiniCustomerRows(rows, "转入客户", "restoreFromPool")}`;
    host.querySelector("#moveSelectedToPool").addEventListener("click", () => {
      const customer = getCustomerById(selectedId);
      if (!customer) return;
      customer.inPool = "是";
      customer.stage = customer.stage === "黑名单" ? customer.stage : "沉睡";
      addTimeline(customer, "转入公海", "客户进入公海客户池。");
      saveCustomers();
      renderCustomerModule();
      notify("已转入公海");
    });
    wireMiniCustomerActions(host, "restoreFromPool", (customer) => {
      customer.inPool = "否";
      if (customer.stage === "沉睡") customer.stage = "已联系";
      addTimeline(customer, "转出公海", "客户重新进入正式客户池。");
    });
  }

  function renderNearbySubview(host) {
    const rows = customers.filter((customer) => customer.country);
    host.innerHTML = `<div class="region-summary">${renderRegionSummary(rows)}</div>${renderMiniCustomerRows(rows, "打开客户", "openCustomer")}`;
    wireMiniCustomerActions(host, "openCustomer", () => {});
  }

  function renderFollowupsSubview(host) {
    const rows = customers.flatMap((customer) => (customer.followUps || []).map((item) => ({ ...item, customer: customer.company, customerId: customer.id })));
    host.innerHTML = `<div class="subview-actions"><button class="primary-btn" id="addSubviewFollow" type="button">给当前客户新增跟进</button></div>
      <div class="customer-subview-list">${rows.map((item) => `<article data-customer-id="${item.customerId}"><strong>${escapeHtml(item.customer)}</strong><span>${escapeHtml(item.date || "")} · ${escapeHtml(item.channel || "")}</span><p>${escapeHtml(item.summary || "")}</p><p>下次联系：${escapeHtml(item.nextDate || "-")}</p></article>`).join("") || `<div class="empty-state">暂无跟进记录</div>`}</div>`;
    host.querySelector("#addSubviewFollow").addEventListener("click", () => handleDetailAction("addFollow", getCustomerById(selectedId)));
    host.querySelectorAll("[data-customer-id]").forEach((item) => item.addEventListener("click", () => selectCustomerById(item.dataset.customerId)));
  }

  function renderVisitPlansSubview(host) {
    const rows = customers.flatMap((customer) => (customer.followUps || []).filter((item) => item.nextDate).map((item) => ({ ...item, customer: customer.company, customerId: customer.id })));
    host.innerHTML = `<div class="subview-actions"><button class="primary-btn" id="addVisitPlan" type="button">新增提醒</button></div>
      <div class="customer-subview-list">${rows.map((item) => `<article data-customer-id="${item.customerId}"><strong>${escapeHtml(item.customer)}</strong><span>${escapeHtml(item.nextDate || "")}</span><p>${escapeHtml(item.nextStep || item.summary || "")}</p></article>`).join("") || `<div class="empty-state">暂无拜访/提醒计划</div>`}</div>`;
    host.querySelector("#addVisitPlan").addEventListener("click", () => handleDetailAction("addFollow", getCustomerById(selectedId)));
    host.querySelectorAll("[data-customer-id]").forEach((item) => item.addEventListener("click", () => selectCustomerById(item.dataset.customerId)));
  }

  function renderCheckinsSubview(host) {
    host.innerHTML = `<div class="subview-actions"><button class="primary-btn" id="addCheckin" type="button">新增外勤签到</button></div>
      <div class="customer-subview-list">${checkins.map((item) => `<article><strong>${escapeHtml(item.customer || "")}</strong><span>${escapeHtml(item.date || "")} · ${escapeHtml(item.location || "")}</span><p>${escapeHtml(item.result || "")}</p></article>`).join("") || `<div class="empty-state">暂无外勤签到</div>`}</div>`;
    host.querySelector("#addCheckin").addEventListener("click", () => {
      const customer = getCustomerById(selectedId);
      const location = prompt("签到地点 / 展会名称");
      if (!location) return;
      checkins.unshift({ id: newId(), customer: customer?.company || "", date: todayString(), location, result: "已拜访" });
      saveCheckins();
      if (customer) addTimeline(customer, "外勤签到", location);
      saveCustomers();
      renderCustomerModule();
      notify("外勤签到已保存");
    });
  }

  function renderLettersSubview(host) {
    const customer = getCustomerById(selectedId) || customers[0];
    const draft = customer ? buildCustomerLetter(customer) : "";
    host.innerHTML = `<div class="letter-generator">
      <div>
        <h4>${escapeHtml(customer?.company || "请选择客户")}</h4>
        <p>根据客户类型、国家、推荐产品和付款风险生成模板开发信。不依赖 API，不自动发送。</p>
      </div>
      <textarea id="customerLetterDraft" rows="14">${escapeHtml(draft)}</textarea>
      <div class="subview-actions">
        <button class="primary-btn" id="saveCustomerLetter" type="button">保存到客户开发信</button>
        <button class="ghost-btn" id="copyCustomerLetter" type="button">复制草稿</button>
      </div>
    </div>`;
    host.querySelector("#saveCustomerLetter").addEventListener("click", () => {
      if (!customer) return;
      customer.letters.unshift({ id: newId(), title: `${customer.company} 开发信`, channel: "Email", date: todayString(), body: host.querySelector("#customerLetterDraft").value });
      addTimeline(customer, "保存开发信", "保存开发信草稿。");
      saveCustomers();
      notify("开发信已保存");
      renderCustomerModule();
    });
    host.querySelector("#copyCustomerLetter").addEventListener("click", async () => {
      await navigator.clipboard.writeText(host.querySelector("#customerLetterDraft").value);
      notify("开发信已复制");
    });
  }

  function getVisibleCustomers() {
    const keyword = String(ui.search || "").trim().toLowerCase();
    return customers.filter((customer) => {
      if (window.FORYAL_CRM?.canViewCustomer && !window.FORYAL_CRM.canViewCustomer(customer)) return false;
      // Include contacts array in search
      var contactText = (customer.contacts || []).map(function(c) {
        return [c.name, c.email, c.phone, c.whatsapp].filter(Boolean).join(" ");
      }).join(" ");
      const searchText = [
        customer.company,
        customer.whatsapp,
        customer.phone,
        customer.email,
        customer.country,
        customer.product,
        customer.contact,
        customer.website,
        contactText,
      ].join(" ").toLowerCase();
      const searchMatch = !keyword || searchText.includes(keyword);
      const filterMatch = Object.entries(ui.filters || {}).every(([key, value]) => {
        if (!value || value === "all") return true;
        if (key === "country" && value === "__empty__") {
          var cv = (customer.country || "").trim();
          return !cv || cv === "-" || cv === "未知";
        }
        return String(customer[key] || "") === value;
      });
      return searchMatch && filterMatch;
    });
  }

  function getSelectedOrVisible(visible) {
    const selected = visible.filter((customer) => selectedCustomers.has(customer.id));
    return selected.length ? selected : visible;
  }

  function selectCustomerById(id) {
    selectedId = id;
    renderCustomerModule();
  }

  function getCustomerById(id) {
    return customers.find((customer) => customer.id === id) || null;
  }

  function deleteCustomer(id) {
    const customer = getCustomerById(id);
    if (!customer) return;
    var contactCount = (customer.contacts || []).length;
    var msg = '确认删除 ' + customer.company + '？';
    if (contactCount > 0) msg += '\n\n该客户下有 ' + contactCount + ' 个联系人，将同时删除。';
    openConfirmModal(msg, () => {
      const deletedId = customer.id;
      const deletedEmail = customer.email || "";
      const deletedCompany = customer.company || "";

      customers = customers.filter((item) => item.id !== id);
      selectedCustomers.delete(id);
      selectedId = customers[0]?.id || null;
      saveCustomers();

      // Clean moduleStore records (followups, leads, quotes, attachments)
      window.FORYAL_CRM?.cleanupCustomerAssociations?.(deletedId, deletedEmail, deletedCompany);

      renderCustomerModule();
      notify("客户已删除");
    });
  }

  function batchDeleteCustomers() {
    if (!selectedCustomers.size) {
      notify("请先选择客户");
      return;
    }
    const toDelete = customers.filter((c) => selectedCustomers.has(c.id));
    var totalContacts = toDelete.reduce(function(sum, c) { return sum + (c.contacts || []).length; }, 0);
    var msg = '确认删除选中的 ' + selectedCustomers.size + ' 个客户？';
    if (totalContacts > 0) msg += '\n\n共 ' + totalContacts + ' 个联系人将同时删除。';
    openConfirmModal(msg, () => {
      toDelete.forEach((customer) => {
        window.FORYAL_CRM?.cleanupCustomerAssociations?.(customer.id, customer.email || "", customer.company || "");
      });
      customers = customers.filter((customer) => !selectedCustomers.has(customer.id));
      selectedCustomers.clear();
      selectedId = customers[0]?.id || null;
      saveCustomers();
      renderCustomerModule();
      notify("批量删除完成");
    });
  }

  function openConfirmModal(message, onConfirm) {
    const modal = document.querySelector("#customerModal");
    modal.hidden = false;
    modal.innerHTML = `
      <div class="customer-modal-card confirm-card">
        <div class="customer-modal-head">
          <div>
            <h3>确认操作</h3>
            <p>${escapeHtml(message)}</p>
          </div>
          <button class="icon-close" id="closeConfirmModal" type="button">×</button>
        </div>
        <div class="confirm-actions">
          <button class="ghost-btn" id="cancelConfirmModal" type="button">取消</button>
          <button class="primary-btn danger-confirm" id="confirmModalAction" type="button">确认</button>
        </div>
      </div>
    `;
    modal.querySelector("#closeConfirmModal").addEventListener("click", closeCustomerModal);
    modal.querySelector("#cancelConfirmModal").addEventListener("click", closeCustomerModal);
    modal.querySelector("#confirmModalAction").addEventListener("click", () => {
      closeCustomerModal();
      onConfirm();
    });
  }

  function runBlacklistDedupe() {
    const blacklistKeys = new Set(customers.filter((customer) => customer.isBlacklisted === "是").flatMap((customer) => [customer.email, customer.whatsapp, customer.company].filter(Boolean).map(normalizeKey)));
    const matched = customers.filter((customer) => customer.isBlacklisted !== "是" && [customer.email, customer.whatsapp, customer.company].filter(Boolean).some((value) => blacklistKeys.has(normalizeKey(value))));
    if (!matched.length) {
      notify("未发现与黑名单重复的客户");
      return;
    }
    matched.forEach((customer) => {
      customer.isBlacklisted = "是";
      customer.stage = "黑名单";
      addTimeline(customer, "黑名单去重", "与黑名单客户信息重复，已标记。");
    });
    saveCustomers();
    renderCustomerModule();
    alert(`发现并标记 ${matched.length} 个黑名单重复客户。`);
  }

  function importCustomerCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result || ""));
      if (rows.length < 2) {
        notify("CSV 没有可导入的数据");
        return;
      }
      const headers = rows[0].map((header) => header.trim());
      const imported = rows.slice(1).filter((row) => row.some(Boolean)).map((row) => csvRowToCustomer(headers, row));
      customers = mergeCustomers([...imported, ...customers]);
      selectedId = imported[0]?.id || selectedId;
      saveCustomers();
      renderCustomerModule();
      notify(`已导入 ${imported.length} 个客户`);
      event.target.value = "";
    };
    reader.readAsText(file, "utf-8");
  }

  function csvRowToCustomer(headers, row) {
    const aliases = {
      company: ["客户名称", "公司", "公司名", "公司名称", "company"],
      country: ["国家/地区", "国家", "country"],
      source: ["客户来源", "来源", "source"],
      whatsapp: ["手机 / WhatsApp", "WhatsApp", "手机", "whatsapp"],
      phone: ["电话", "phone"],
      email: ["邮箱", "email"],
      website: ["网址", "官网", "website"],
      linkedin: ["LinkedIn", "linkedin"],
      instagram: ["Instagram", "instagram"],
      priority: ["客户级别", "客户等级", "priority"],
      industry: ["客户行业", "industry", "segment"],
      product: ["推荐产品", "product"],
      paymentRisk: ["付款风险", "risk"],
      stage: ["跟进阶段", "阶段", "stage"],
      nextDate: ["下次联系时间", "nextDate"],
      owner: ["负责人", "owner"],
      notes: ["备注", "notes"],
    };
    const customer = createEmptyCustomer();
    Object.entries(aliases).forEach(([field, labels]) => {
      const index = headers.findIndex((header) => labels.some((label) => header.toLowerCase() === label.toLowerCase()));
      if (index >= 0) customer[field] = row[index] || customer[field] || "";
    });
    addTimeline(customer, "导入客户", "通过 CSV 导入客户。");
    return customer;
  }

  function exportCustomersCsv(rows) {
    const header = ALL_COLUMNS.filter((column) => column.key !== "select" && ui.columns.includes(column.key)).map((column) => column.label);
    const keys = ALL_COLUMNS.filter((column) => column.key !== "select" && ui.columns.includes(column.key)).map((column) => column.key);
    exportRowsCsv(`FORYAL客户-${todayString()}.csv`, header, rows.map((customer) => keys.map((key) => plainCustomerValue(customer, key))));
    notify("CSV 已导出");
  }

  function exportRowsCsv(filename, header, rows) {
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function plainCustomerValue(customer, key) {
    if (key === "logo") return customer.logoData ? "已上传" : "";
    if (key === "nextDate") return customer.nextDate || getNextDate(customer);
    if (key === "lastFollowDate") return getLastFollowDate(customer);
    return customer[key] || "";
  }

  function buildCustomerLetter(customer) {
    const product = customer.product || "CM-1700MY";
    const type = customer.customerType || customer.industry || "home appliance importer";
    const riskLine = customer.paymentRisk && customer.paymentRisk !== "未知" ? `For payment terms, we usually recommend keeping the first cooperation conservative and secure, especially for ${customer.paymentRisk}.` : "For first cooperation, we can start with standard TT terms and a clear production schedule.";
    return `Subject: ${product} OEM / ODM Coffee Machine Cooperation\n\nHi ${customer.contacts?.[0]?.name || customer.contact || ""},\n\nI am Lina from FORYAL, a coffee machine OEM / ODM factory in China.\n\nI noticed ${customer.company || "your company"} works in the ${type} market${customer.country ? ` in ${customer.country}` : ""}. Based on your business profile, ${product} could be a suitable product direction for your coffee appliance line.\n\nWe can support OEM / private label, SKD / CKD cooperation, export documents, packaging customization, and stable factory-direct supply.\n\n${riskLine}\n\nWould you be open to reviewing a short product summary with key specifications, MOQ and FOB reference?\n\nBest regards,\nLina Mei\nDemo Export Company`;
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

  function getCustomerMailTimeline(customer) {
    const email = String(customer.email || "").trim().toLowerCase();
    const state = loadCustomerMailState();
    const rows = [];

    ["inbox", "sent", "drafts"].forEach((mailbox) => {
      (state[mailbox] || []).forEach((message) => {
        if (!isMailForCustomer(message, customer, email)) return;
        rows.push({
          date: toDateOnly(message.date || message.createdAt),
          type: mailbox === "inbox" ? "收到客户邮件" : mailbox === "sent" ? "发送邮件" : "生成邮件草稿",
          content: `${message.subject || "(No subject)"}${message.snippet ? `：${message.snippet}` : ""}`,
        });
      });
    });

    (customer.drafts || []).forEach((draft) => {
      rows.push({
        date: draft.date || "",
        type: "生成邮件草稿",
        content: draft.subject || "(No subject)",
      });
    });

    (customer.followUps || []).forEach((record) => {
      if (record.channel && !/email|邮件/i.test(record.channel)) return;
      rows.push({
        date: record.date || "",
        type: "Email跟进记录",
        content: [record.summary, record.nextStep].filter(Boolean).join(" / "),
      });
    });

    const seen = new Set();
    return rows.filter((row) => {
      const key = `${row.date}-${row.type}-${row.content}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function loadCustomerMailState() {
    try {
      const stored = JSON.parse(localStorage.getItem("coffee-machine-crm-mail-v1") || "null") || {};
      return {
        inbox: Array.isArray(stored.inbox) ? stored.inbox : [],
        sent: Array.isArray(stored.sent) ? stored.sent : [],
        drafts: Array.isArray(stored.drafts) ? stored.drafts : [],
      };
    } catch {
      return { inbox: [], sent: [], drafts: [] };
    }
  }

  function isMailForCustomer(message, customer, email) {
    if (message.customerId && message.customerId === customer.id) return true;
    if (!email) return false;
    return [message.from, message.to, message.cc, message.bcc].filter(Boolean).some((value) => extractEmails(value).includes(email));
  }

  function extractEmails(value) {
    return (String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map((item) => item.toLowerCase());
  }

  function addTimeline(customer, type, content) {
    customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
    customer.timeline.unshift({ id: newId(), date: todayString(), type, content });
  }

  function getNextDate(customer) {
    return (customer.followUps || []).find((item) => item.nextDate)?.nextDate || customer.nextDate || "";
  }

  function getLastFollowDate(customer) {
    return (customer.followUps || []).find((item) => item.date)?.date || "";
  }

  function createEmptyCustomer() {
    return {
      id: newId(),
      company: "",
      owner: window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
      source: "LinkedIn",
      whatsapp: "",
      phone: "",
      email: "",
      priority: "B",
      industry: "家电进口商",
      tags: "",
      nextDate: "",
      website: "",
      notes: "",
      country: "",
      officialWebsite: "",
      linkedin: "",
      instagram: "",
      facebook: "",
      youtube: "",
      hasOwnBrand: "未知",
      hasCoffeeCategory: "未知",
      hasChinaImport: "未知",
      product: "CM-1700MY",
      paymentRisk: "未知",
      customerType: "进口商",
      isQuoted: "否",
      isSample: "否",
      isBlacklisted: "否",
      stage: "新线索",
      contacts: [],
      followUps: [],
      opportunities: [],
      quotes: [],
      contracts: [],
      payments: [],
      invoices: [],
      attachments: [],
      letters: [],
      drafts: [],
      timeline: [],
      createdAt: todayString(),
      updatedAt: todayString(),
      inPool: "否",
    };
  }

  function emptyContact() {
    return { id: newId(), name: "", title: "", email: "", phone: "", whatsapp: "", linkedin: "", notes: "" };
  }

  function autoGradeCustomer(customer) {
    // A级: 已成交/谈判中, 或已报价且有30天内跟进
    if (customer.stage === "已成交" || customer.stage === "谈判中") return "A";
    if (customer.isQuoted === "是") {
      const hasRecentFollow = (customer.followUps || []).some(
        (f) => f.date && f.date >= addDaysStr(todayString(), -30)
      );
      if (hasRecentFollow) return "A";
    }
    // C级: 黑名单, 沉睡, 或新线索无联系方式
    if (customer.isBlacklisted === "是") return "C";
    if (customer.stage === "沉睡") return "C";
    if (customer.stage === "新线索" && !customer.email && !customer.website && !customer.whatsapp) return "C";
    // B级: 默认
    return "B";
  }

  function addDaysStr(dateStr, days) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function cloneCustomer(customer) {
    return JSON.parse(JSON.stringify(customer || createEmptyCustomer()));
  }

  function getSubviewMeta(subview) {
    const map = {
      customer: ["客户管理", "管理国外小家电品牌商、进口商、批发商、连锁零售商和电商卖家。"],
      followups: ["跟进记录", "集中查看 LinkedIn / Instagram / Email / WhatsApp 开发记录。"],
    };
    const [title, desc] = map[subview] || map.customer;
    return { title, desc };
  }

  function renderMiniCustomerRows(rows, actionLabel, action) {
    return `<div class="mini-customer-table">${rows.map((customer) => `<article data-customer-id="${customer.id}">
      ${renderLogo(customer)}
      <div><strong>${escapeHtml(customer.company)}</strong><span>${escapeHtml(customer.country || "-")} · ${escapeHtml(customer.stage || "-")} · ${escapeHtml(customer.product || "-")}</span><p>${escapeHtml(customer.notes || "")}</p></div>
      <button class="ghost-btn" type="button" data-mini-action="${action}" data-id="${customer.id}">${actionLabel}</button>
    </article>`).join("") || `<div class="empty-state">暂无客户</div>`}</div>`;
  }

  function wireMiniCustomerActions(host, action, mutator) {
    host.querySelectorAll(`[data-mini-action="${action}"]`).forEach((button) => {
      button.addEventListener("click", () => {
        const customer = getCustomerById(button.dataset.id);
        if (!customer) return;
        mutator(customer);
        selectedId = customer.id;
        saveCustomers();
        renderCustomerModule();
        notify("已处理");
      });
    });
    host.querySelectorAll("[data-customer-id]").forEach((item) => item.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      selectCustomerById(item.dataset.customerId);
    }));
  }

  function renderRegionSummary(rows) {
    const counts = rows.reduce((acc, customer) => {
      const country = customer.country || "未知国家";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([country, count]) => `<div><strong>${count}</strong><span>${escapeHtml(country)}</span></div>`).join("");
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
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

  function mapCustomerType(value) {
    if (String(value).includes("咖啡")) return "咖啡设备进口商";
    if (String(value).includes("品牌")) return "品牌商";
    if (String(value).includes("批发") || String(value).includes("经销")) return "批发商";
    if (String(value).includes("连锁") || String(value).includes("零售")) return "连锁零售商";
    if (String(value).includes("电商")) return "电商卖家";
    return "进口商";
  }

  function normalizeProduct(value) {
    const text = String(value || "");
    if (PRODUCT_OPTIONS.includes(text)) return text;
    if (text.includes("1600")) return "CM-1600B";
    if (text.includes("1700")) return "CM-1700MY";
    if (text.includes("1302")) return "CM-1302MYC";
    if (/skd/i.test(text)) return "SKD Project";
    if (/ckd/i.test(text)) return "CKD Project";
    if (/private/i.test(text)) return "Private Label Project";
    if (/oem/i.test(text)) return "OEM Project";
    return "CM-1700MY";
  }

  function normalizeKey(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
  }

  function newId() {
    return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function todayString() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  }

  function toDateOnly(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "").slice(0, 10);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
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
    return escapeHtml(value);
  }

  function notify(message) {
    if (typeof showToast === "function") showToast(message);
  }

  // Global bridge for AI parse apply button onclick
  window._aiParseApply = function() {
    if (!pendingAiParseData) { console.warn("[AI Parse] No pending data"); return; }
    var data = pendingAiParseData;
    pendingAiParseData = null;
    pendingAiParseDraft = null;
    var now = todayString();

    // Build complete customer record directly
    var record = {
      id: newId(),
      company: data.company || '未命名客户',
      contact: data.contactName || '',
      title: data.contactTitle || '',
      country: data.country || '',
      website: normalizeUrl(data.website || ''),
      email: data.email || '',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      linkedin: data.linkedin || '',
      instagram: data.instagram || '',
      source: data.source || 'AI助手',
      industry: data.industry || '家电进口商',
      customerType: data.customerType || '进口商',
      product: data.product || 'CM-1700MY',
      notes: data.notes || '',
      priority: 'B',
      stage: '新线索',
      paymentRisk: '未知',
      isQuoted: '否', isSample: '否', isBlacklisted: '否',
      hasOwnBrand: '未知', hasCoffeeCategory: '未知', hasChinaImport: '未知',
      createdAt: now, updatedAt: now,
      contacts: [],
      followUps: [],
      timeline: [{ id: newId(), date: now, type: 'AI识别客户资料', content: '通过AI识别客户资料：' + (data.company || data.contactName || '未知公司') }],
      quotes: [], attachments: [], drafts: [], letters: [],
      inPool: '否'
    };

    // Auto-extract domain from email
    if (!record.website && record.email) {
      var domain = extractBusinessDomain(record.email);
      if (domain) record.website = 'https://' + domain;
    }

    // Add primary contact
    if (data.contactName || data.email || data.phone) {
      record.contacts.push({
        id: newId(), name: data.contactName || '', title: data.contactTitle || '',
        email: data.email || '', phone: data.phone || '',
        whatsapp: data.whatsapp || '', linkedin: data.linkedin || '', notes: ''
      });
    }
    // Add additional contacts
    if (data.contacts && data.contacts.length) {
      data.contacts.forEach(function(c) {
        if (c.name || c.email) record.contacts.push({
          id: newId(), name: c.name || '', title: c.title || '',
          email: c.email || '', phone: c.phone || '',
          whatsapp: c.whatsapp || '', linkedin: c.linkedin || '', notes: ''
        });
      });
    }
    record.contacts = deduplicateContacts(record.contacts);

    // Save directly to customers array
    if (window.FORYAL_CRM && window.FORYAL_CRM.addCustomer) {
      var saved = window.FORYAL_CRM.addCustomer(record);
      if (saved) {
        selectedId = saved.id;
        saveCustomers();
        renderCustomerModule();
        notify('客户已保存！可搜索 "' + record.company + '" 查找。');
        return;
      }
    }
    // Fallback
    console.warn('[AI Parse] FORYAL_CRM.addCustomer not available');
    applyAiParseToForm(data, null);
    notify('已把AI识别结果填入表单，请检查后保存客户');
  };
})();
