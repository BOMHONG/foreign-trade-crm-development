const MODULE_STORAGE_KEY = "foryal-crm-module-records-v1";
const MODULE_ATTACHMENT_INDEX_KEY = "foryal-crm-module-attachment-index-v1";
const MODULE_ATTACHMENT_DB_NAME = "foryal-crm-attachments-db";
const MODULE_ATTACHMENT_STORE = "files";
const MODULE_ATTACHMENT_INLINE_LIMIT = 20 * 1024 * 1024;

const PRODUCT_OPTIONS = ["CM-1600B", "CM-1700MY", "CM-1302MYC", "OEM Project", "Private Label Project", "SKD Project", "CKD Project"];
const PROSPECT_CUSTOMER_TYPES = ["小家电品牌商", "家电进口商", "厨房电器批发商", "连锁零售商", "电商卖家", "咖啡设备品牌商", "咖啡设备进口商"];
const BIG_BRAND_KEYWORDS = ["nespresso", "delonghi", "de'longhi", "philips", "bosch", "siemens", "breville", "sage", "krups", "miele", "whirlpool", "electrolux", "samsung", "lg", "sony", "nvidia"];
const RISK_OPTIONS = [
  "TT",
  "30% deposit + 70% before shipment",
  "OA风险",
  "60/90/120 days credit风险",
  "寄售风险",
  "未知",
];
const STATUS_OPTIONS = ["新建", "进行中", "待跟进", "已完成", "暂停"];
const FOLLOWUP_CHANNELS = ["Email", "WhatsApp", "LinkedIn", "Instagram", "电话", "展会", "拜访", "其他"];
const FOLLOWUP_TYPES = ["首次开发", "已发送资料", "已报价", "样品沟通", "样品测试中", "客户反馈", "价格谈判", "等待回复", "沉睡唤醒", "成交维护"];
const FOLLOWUP_STAGES = ["新客户", "已联系", "已发资料", "已报价", "样品中", "谈判中", "等待回复", "已成交", "暂停"];
const REMINDER_CYCLES = ["3天", "7天", "10天", "14天", "30天", "自定义"];

let followupUi = {
  scope: "all",
  view: "table",
  advanced: false,
  channel: "all",
  stage: "all",
  completed: "all",
  calendarMode: "month",
  calendarDate: "",
};

const baseTradeFields = [
  { key: "company", label: "公司名", required: true },
  { key: "country", label: "国家" },
  { key: "website", label: "官网" },
  { key: "source", label: "客户来源", type: "select", options: ["LinkedIn", "Instagram", "Facebook", "Google", "展会", "海关数据", "转介绍", "官网询盘"] },
  { key: "contact", label: "联系人" },
  { key: "title", label: "职位" },
  { key: "email", label: "邮箱", type: "email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "grade", label: "客户等级", type: "select", options: ["A+", "A", "A-待补关键人", "B+", "B", "B-", "C-待补资料", "D-不导入"] },
  { key: "product", label: "推荐产品", type: "select", options: PRODUCT_OPTIONS },
  { key: "risk", label: "付款风险", type: "select", options: RISK_OPTIONS },
  { key: "stage", label: "跟进阶段", type: "select", options: ["新线索", "已联系", "已报价", "样品/测试", "谈判中", "已成交", "沉睡", "黑名单"] },
  { key: "lastFollow", label: "最近跟进内容" },
  { key: "nextDate", label: "下次联系时间", type: "date" },
  { key: "quoted", label: "是否已报价", type: "select", options: ["否", "是"] },
  { key: "sample", label: "是否样品客户", type: "select", options: ["否", "是"] },
  { key: "blacklisted", label: "是否黑名单", type: "select", options: ["否", "是"] },
  { key: "notes", label: "备注", type: "textarea" },
];

const moduleDefinitions = {
  dashboard: {
    title: "仪表盘",
    eyebrow: "Overview",
    description: "汇总每天需要处理的客户、跟进、报价和风险事项。",
    filterField: "status",
    table: ["name", "type", "status", "date", "owner"],
    fields: [
      { key: "name", label: "事项名称", required: true },
      { key: "type", label: "类型", type: "select", options: ["A类客户提醒", "报价跟进", "付款风险", "沉睡客户", "新品推荐"] },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "date", label: "日期", type: "date" },
      { key: "owner", label: "负责人" },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { name: "A类客户 Nordic Brew 跟进", type: "A类客户提醒", status: "待跟进", date: "2026-06-02", owner: "Lina", notes: "确认 CM-1700MY 报价反馈。" },
      { name: "OA付款风险复盘", type: "付款风险", status: "进行中", date: "2026-06-04", owner: "Lina", notes: "所有要求 60/90/120 天账期的客户必须标红。" },
    ],
  },
  calendar: {
    title: "日历",
    eyebrow: "Task Calendar",
    description: "管理下一次联系、客户节假日祝福、样品寄送和会议安排。",
    filterField: "status",
    table: ["title", "date", "type", "customer", "status"],
    fields: [
      { key: "title", label: "日程标题", required: true },
      { key: "date", label: "日期", type: "date" },
      { key: "type", label: "类型", type: "select", options: ["跟进", "会议", "节日祝福", "报价", "样品", "回款"] },
      { key: "customer", label: "客户" },
      { key: "channel", label: "渠道", type: "select", options: ["Email", "LinkedIn", "WhatsApp", "Call", "Meeting"] },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { title: "给葡萄牙客户发二次跟进", date: "2026-06-08", type: "跟进", customer: "Demo Retail Group", channel: "Email", status: "待跟进", notes: "重点提 CE/GS/LFGB 和 in-house tooling。" },
    ],
  },
  leads: {
    title: "线索",
    eyebrow: "Leads",
    description: "保存未确认的潜在客户，并判断是否转为正式客户。",
    filterField: "stage",
    table: ["company", "country", "contact", "product", "grade", "stage"],
    fields: baseTradeFields,
    sample: [
      { company: "Demo Home Imports", country: "Chile", website: "https://example.com", source: "LinkedIn", contact: "Demo Buyer", title: "Category Manager", email: "demo.importer@example.com", whatsapp: "+1 555 010 1004", grade: "B", product: "CM-1600B", risk: "未知", stage: "新线索", lastFollow: "LinkedIn 接受好友，未回复", nextDate: "2026-06-05", quoted: "否", sample: "否", blacklisted: "否", notes: "进口商，可能关注认证和交期。" },
    ],
  },
  contacts: {
    title: "联系人",
    eyebrow: "Contacts",
    description: "按人管理采购经理、产品经理、品类经理、CEO 和 Founder。",
    filterField: "role",
    table: ["name", "company", "role", "email", "whatsapp", "status"],
    fields: [
      { key: "name", label: "姓名", required: true },
      { key: "company", label: "公司" },
      { key: "role", label: "角色", type: "select", options: ["采购经理", "产品经理", "品类经理", "CEO", "Founder", "进口负责人", "其他"] },
      { key: "email", label: "邮箱", type: "email" },
      { key: "whatsapp", label: "WhatsApp" },
      { key: "linkedin", label: "LinkedIn" },
      { key: "country", label: "国家" },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { name: "Demo Contact", company: "Demo Retail Group", role: "进口负责人", email: "", whatsapp: "", linkedin: "https://www.linkedin.com/", country: "Portugal", status: "待跟进", notes: "28年进口经验，适合用合规和稳定供应链切入。" },
    ],
  },
  opportunities: {
    title: "商机",
    eyebrow: "Opportunities",
    description: "跟踪报价前后的项目金额、赢率、产品组合和预计成交时间。",
    filterField: "stage",
    table: ["name", "customer", "stage", "amount", "product", "expectedDate"],
    fields: [
      { key: "name", label: "商机名称", required: true },
      { key: "customer", label: "客户名称" },
      { key: "stage", label: "商机阶段", type: "select", options: ["需求确认", "已报价", "样品评估", "价格谈判", "赢单", "输单", "无效"] },
      { key: "amount", label: "预计金额" },
      { key: "product", label: "推荐产品", type: "select", options: PRODUCT_OPTIONS },
      { key: "expectedDate", label: "预计成交日期", type: "date" },
      { key: "probability", label: "赢率%" },
      { key: "risk", label: "付款风险", type: "select", options: RISK_OPTIONS },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { name: "Nordic 2026 Grinder Espresso Program", customer: "Nordic Brew Equipment AB", stage: "已报价", amount: "USD 120000", product: "CM-1700MY", expectedDate: "2026-07-15", probability: "55", risk: "30% deposit + 70% before shipment", notes: "需要补充 MOQ 与备件政策。" },
    ],
  },
  quotes: {
    title: "报价单",
    eyebrow: "Quotes",
    description: "管理客户报价、报价文件、产品报价资料和发给客户的报价记录。",
    filterField: "status",
    table: ["quoteNo", "customer", "product", "quantity", "fob", "status", "validUntil"],
    fields: [
      { key: "quoteNo", label: "报价单编号", required: true },
      { key: "customer", label: "客户名称" },
      { key: "contact", label: "联系人" },
      { key: "country", label: "国家" },
      { key: "product", label: "产品型号" },
      { key: "quantity", label: "数量" },
      { key: "fob", label: "FOB价格" },
      { key: "moq", label: "MOQ" },
      { key: "paymentTerm", label: "付款方式", type: "select", options: RISK_OPTIONS },
      { key: "deliveryTime", label: "交期" },
      { key: "validUntil", label: "有效期", type: "date" },
      { key: "quoteDate", label: "报价日期", type: "date" },
      { key: "owner", label: "负责人" },
      { key: "status", label: "状态", type: "select", options: ["草稿", "已发送", "已跟进", "客户有兴趣", "客户未回复", "已成交", "已失效"] },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { quoteNo: "Q-2026-0601", customer: "Nordic Brew Equipment AB", contact: "Erik Lind", country: "Sweden", product: "CM-1700MY", quantity: "300 sets", fob: "USD 58.8 / set", moq: "300", paymentTerm: "30% deposit + 70% before shipment", deliveryTime: "45 days", validUntil: "2026-06-30", quoteDate: "2026-06-01", owner: "Lina", status: "已发送", notes: "本地CRM附件可上传报价表、PDF、产品图片、规格书和认证文件。" },
    ],
  },
  contracts: {
    title: "合同",
    eyebrow: "Contracts",
    description: "管理 PI/合同、付款方式、交期和执行状态。",
    filterField: "status",
    table: ["contractNo", "customer", "amount", "paymentTerm", "status", "deliveryDate"],
    fields: [
      { key: "contractNo", label: "合同编号", required: true },
      { key: "customer", label: "客户名称" },
      { key: "amount", label: "合同金额" },
      { key: "paymentTerm", label: "付款方式", type: "select", options: RISK_OPTIONS },
      { key: "status", label: "状态", type: "select", options: ["草稿", "待定金", "生产中", "待尾款", "已出货", "已完成"] },
      { key: "signDate", label: "签订日期", type: "date" },
      { key: "deliveryDate", label: "交货日期", type: "date" },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { contractNo: "PI-2026-001", customer: "Cafe Route Trading LLC", amount: "USD 36800", paymentTerm: "30% deposit + 70% before shipment", status: "待定金", signDate: "2026-05-24", deliveryDate: "2026-07-10", notes: "需阿语包装确认。" },
    ],
  },
  payments: {
    title: "回款",
    eyebrow: "Payments",
    description: "跟踪定金、尾款、账期和高风险付款条件。",
    filterField: "status",
    table: ["customer", "contractNo", "amount", "dueDate", "status", "risk"],
    fields: [
      { key: "customer", label: "客户名称", required: true },
      { key: "contractNo", label: "合同编号" },
      { key: "amount", label: "应收金额" },
      { key: "dueDate", label: "应收日期", type: "date" },
      { key: "receivedDate", label: "实收日期", type: "date" },
      { key: "status", label: "状态", type: "select", options: ["未收", "部分回款", "已收", "逾期", "坏账风险"] },
      { key: "risk", label: "付款风险", type: "select", options: RISK_OPTIONS },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { customer: "Cafe Route Trading LLC", contractNo: "PI-2026-001", amount: "USD 11040", dueDate: "2026-06-03", receivedDate: "", status: "未收", risk: "30% deposit + 70% before shipment", notes: "定金到账后排产。" },
    ],
  },
  invoices: {
    title: "发票",
    eyebrow: "Invoices",
    description: "管理商业发票、形式发票和客户开票状态。",
    filterField: "status",
    table: ["invoiceNo", "customer", "amount", "issueDate", "dueDate", "status"],
    fields: [
      { key: "invoiceNo", label: "发票编号", required: true },
      { key: "customer", label: "客户名称" },
      { key: "amount", label: "金额" },
      { key: "issueDate", label: "开票日期", type: "date" },
      { key: "dueDate", label: "到期日期", type: "date" },
      { key: "status", label: "状态", type: "select", options: ["草稿", "已开票", "已发送", "已收款", "作废"] },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { invoiceNo: "INV-2026-001", customer: "Cafe Route Trading LLC", amount: "USD 36800", issueDate: "2026-05-24", dueDate: "2026-06-03", status: "已发送", notes: "PI 同步给客户确认。" },
    ],
  },
  visits: {
    title: "回访",
    eyebrow: "Customer Visit",
    description: "记录售后、样品反馈、满意度和二次采购机会。",
    filterField: "status",
    table: ["customer", "date", "type", "satisfaction", "status", "feedback"],
    fields: [
      { key: "customer", label: "客户名称", required: true },
      { key: "date", label: "回访日期", type: "date" },
      { key: "type", label: "回访形式", type: "select", options: ["Email", "WhatsApp", "Call", "Video Meeting", "Visit"] },
      { key: "satisfaction", label: "满意度", type: "select", options: ["高", "中", "低", "未知"] },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "feedback", label: "客户反馈", type: "textarea" },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { customer: "Nordic Brew Equipment AB", date: "2026-06-12", type: "Email", satisfaction: "未知", status: "待跟进", feedback: "等待客户对 FOB 价格反馈。", notes: "提醒客户确认 CE 文件。" },
    ],
  },
  products: {
    title: "公司和产品",
    eyebrow: "Company & Products",
    description: "管理公司资料、产品资料、画册/PPT、视频、认证、报价表和常用外贸资料。",
    filterField: "status",
    table: ["section", "category", "price", "status"],
    fields: [
      { key: "code", label: "资料编号", hiddenInForm: true },
      { key: "name", label: "资料/产品名称", hiddenInForm: true },
      { key: "section", label: "子区", type: "select", options: ["公司资料", "产品列表", "资料库", "视频库", "画册与PPT", "认证与测试报告", "报价资料"] },
      { key: "category", label: "产品/资料分类", type: "select", options: ["CM-1600B", "CM-1700MY", "CM-1302MYC", "OEM / Private Label", "SKD / CKD", "公司简介", "产品画册", "产品视频", "认证证书", "测试报告", "报价表", "包装资料", "说明书", "客户演示资料"] },
      { key: "recommendedMarket", label: "推荐市场" },
      { key: "recommendedCustomerType", label: "推荐客户类型" },
      { key: "price", label: "FOB价格区间" },
      { key: "moq", label: "MOQ" },
      { key: "sellingPoints", label: "主要卖点", type: "textarea" },
      { key: "specs", label: "技术参数", type: "textarea" },
      { key: "certification", label: "认证" },
      { key: "packing", label: "包装信息" },
      { key: "deliveryTime", label: "交期" },
      { key: "paymentTerm", label: "付款条款" },
      { key: "status", label: "状态", type: "select", options: ["可用", "重点推荐", "样品阶段", "待更新", "停用"] },
      { key: "tags", label: "标签" },
      { key: "relatedCustomer", label: "关联客户" },
      { key: "relatedQuote", label: "关联报价单" },
      { key: "notes", label: "说明/备注", type: "textarea" },
    ],
    sample: [
      { code: "COMPANY", name: "Demo Export Company", section: "公司资料", category: "公司简介", recommendedMarket: "Europe / Latin America / Middle East", recommendedCustomerType: "品牌商 / 进口商 / 批发商", price: "", moq: "", sellingPoints: "咖啡机 OEM / ODM、Private Label、SKD/CKD、工厂直供。", specs: "支持客户定制、包装、认证资料配合。", certification: "CE / GS / LFGB", packing: "Private label packaging available", deliveryTime: "按订单确认", paymentTerm: "TT / 30% deposit + 70% before shipment", status: "可用", tags: "公司资料,OEM,ODM", notes: "可作为邮件、报价单和客户介绍资料来源。" },
      { code: "CM-1600B", name: "Premium TFT Espresso Machine", section: "产品列表", category: "CM-1600B", recommendedMarket: "Europe / Korea / Middle East", recommendedCustomerType: "品牌商 / 电商卖家 / 连锁零售商", price: "FOB TBD", moq: "300", sellingPoints: "Premium TFT display, espresso platform, private label ready.", specs: "TFT display, espresso brewing system, custom packaging support.", certification: "CE / GS / LFGB", packing: "Gift box + master carton", deliveryTime: "45-60 days", paymentTerm: "30% deposit + 70% before shipment", status: "重点推荐", tags: "espresso,premium,TFT", notes: "适合欧洲品牌和中高端电商客户。" },
      { code: "CM-1700MY", name: "Grinder Espresso Machine", section: "产品列表", category: "CM-1700MY", recommendedMarket: "Europe / Latin America", recommendedCustomerType: "进口商 / 品牌商 / 咖啡设备供应商", price: "FOB TBD", moq: "300", sellingPoints: "Integrated grinder espresso machine, factory-direct OEM/ODM.", specs: "Integrated grinder, espresso function, private label options.", certification: "CE / GS / LFGB", packing: "Custom color box supported", deliveryTime: "45-60 days", paymentTerm: "30% deposit + 70% before shipment", status: "重点推荐", tags: "grinder,espresso,OEM", notes: "适合品类经理寻找研磨一体产品。" },
      { code: "CM-1302MYC", name: "CM-1302MYC Espresso Machine", section: "产品列表", category: "CM-1302MYC", recommendedMarket: "Importers / wholesalers", recommendedCustomerType: "批发商 / 进口商", price: "FOB TBD", moq: "300", sellingPoints: "Cost-effective espresso option for private label projects.", specs: "Entry-to-mid range espresso platform.", certification: "CE / LFGB", packing: "OEM package available", deliveryTime: "45 days", paymentTerm: "TT", status: "可用", tags: "espresso,value", notes: "适合价格敏感型客户。" },
    ],
  },
  marketing: {
    title: "营销",
    eyebrow: "Marketing",
    description: "管理 LinkedIn、邮件、WhatsApp 和节日祝福活动。",
    filterField: "channel",
    table: ["campaign", "channel", "targetSegment", "product", "status", "startDate"],
    fields: [
      { key: "campaign", label: "活动名称", required: true },
      { key: "channel", label: "渠道", type: "select", options: ["Email", "LinkedIn", "WhatsApp", "Instagram", "Facebook"] },
      { key: "targetSegment", label: "目标客户类型", type: "select", options: ["小家电品牌商", "家电进口商", "厨房电器批发商", "区域型品牌商", "连锁零售商", "电商卖家"] },
      { key: "product", label: "推荐产品", type: "select", options: PRODUCT_OPTIONS },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "startDate", label: "开始日期", type: "date" },
      { key: "copy", label: "话术/文案", type: "textarea" },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { campaign: "欧洲进口商 CM-1700MY 开发", channel: "LinkedIn", targetSegment: "家电进口商", product: "CM-1700MY", status: "进行中", startDate: "2026-06-01", copy: "强调研磨一体、欧规认证、原厂控模。", notes: "优先找 Import / Category Manager。" },
    ],
  },
  tickets: {
    title: "工单",
    eyebrow: "Service Tickets",
    description: "记录客户问题、样品反馈、认证文件、包装和售后事项。",
    filterField: "status",
    table: ["title", "customer", "type", "priority", "status", "owner"],
    fields: [
      { key: "title", label: "工单标题", required: true },
      { key: "customer", label: "客户名称" },
      { key: "type", label: "类型", type: "select", options: ["样品反馈", "认证文件", "包装设计", "售后问题", "报价问题", "物流问题"] },
      { key: "priority", label: "优先级", type: "select", options: ["A+", "A", "A-待补关键人", "B+", "B", "B-", "C-待补资料", "D-不导入"] },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "owner", label: "负责人" },
      { key: "notes", label: "处理记录", type: "textarea" },
    ],
    sample: [
      { title: "补发 CM-1600B CE 文件", customer: "Nordic Brew Equipment AB", type: "认证文件", priority: "A", status: "待跟进", owner: "Lina", notes: "发送前确认文件版本。" },
    ],
  },
  followups: {
    title: "跟进记录",
    eyebrow: "Follow-ups",
    description: "按客户、联系人、渠道、反馈、关心点和下次动作管理所有跟进。",
    filterField: "channel",
    table: ["customer", "contact", "channel", "followType", "date", "stage", "nextDate", "completed"],
    fields: [
      { key: "customer", label: "客户名称", required: true },
      { key: "contact", label: "联系人" },
      { key: "date", label: "跟进日期", type: "date" },
      { key: "channel", label: "跟进方式", type: "select", options: ["Email", "WhatsApp", "LinkedIn", "Instagram", "电话", "展会", "拜访", "其他"] },
      { key: "followType", label: "跟进类型", type: "select", options: ["首次开发", "已发送资料", "已报价", "样品沟通", "样品测试中", "客户反馈", "价格谈判", "等待回复", "沉睡唤醒", "成交维护"] },
      { key: "summary", label: "跟进内容", type: "textarea" },
      { key: "feedback", label: "客户反馈", type: "textarea" },
      { key: "concerns", label: "客户关心点" },
      { key: "stage", label: "当前阶段", type: "select", options: ["新客户", "已联系", "已发资料", "已报价", "样品中", "谈判中", "等待回复", "已成交", "暂停"] },
      { key: "nextAction", label: "下一步动作" },
      { key: "nextDate", label: "下次联系时间", type: "date" },
      { key: "reminderCycle", label: "提醒周期", type: "select", options: ["3天", "7天", "10天", "14天", "30天", "自定义"] },
      { key: "comments", label: "评论/备注", type: "textarea" },
      { key: "createdBy", label: "创建人" },
      { key: "completed", label: "是否完成", type: "select", options: ["否", "是"] },
      { key: "result", label: "跟进结果" },
    ],
    sample: [],
  },
  letters: {
    title: "开发信",
    eyebrow: "Outreach Drafts",
    description: "按客户类型、推荐产品和渠道生成开发信、WhatsApp 话术和邮件草稿。",
    filterField: "channel",
    table: ["title", "customerType", "product", "channel", "status", "updatedAt"],
    fields: [
      { key: "title", label: "草稿标题", required: true },
      { key: "customerType", label: "客户类型", type: "select", options: ["小家电品牌商", "家电进口商", "厨房电器批发商", "区域型品牌商", "连锁零售商", "电商卖家"] },
      { key: "product", label: "推荐产品", type: "select", options: PRODUCT_OPTIONS },
      { key: "channel", label: "渠道", type: "select", options: ["Email", "LinkedIn", "WhatsApp"] },
      { key: "language", label: "语言", type: "select", options: ["English", "Spanish", "Portuguese", "German", "French"] },
      { key: "status", label: "状态", type: "select", options: ["草稿", "已复制", "已发送", "需优化"] },
      { key: "body", label: "草稿内容", type: "textarea" },
      { key: "notes", label: "客户资料/突破口", type: "textarea" },
    ],
    sample: [
      { title: "进口商首次开发信", customerType: "家电进口商", product: "CM-1700MY", channel: "Email", language: "English", status: "草稿", body: "", notes: "强调 OEM/ODM、CE/GS/LFGB、稳定交期和工厂成本。" },
    ],
  },
  prospecting: {
    title: "搜客",
    eyebrow: "Prospecting",
    description: "按国家、关键词和客户类型生成 Google 搜索词，保存搜客记录，并可一键转线索或客户。",
    filterField: "score",
    table: ["candidateCompany", "country", "customerType", "keyword", "score", "status"],
    fields: [
      { key: "searchName", label: "搜索名称", required: true },
      { key: "country", label: "国家", required: true },
      { key: "keyword", label: "关键词", required: true },
      { key: "customerType", label: "客户类型", type: "select", options: PROSPECT_CUSTOMER_TYPES },
      { key: "googleKeywords", label: "Google搜索关键词", type: "textarea" },
      { key: "candidateCompany", label: "候选公司" },
      { key: "website", label: "官网" },
      { key: "email", label: "邮箱", type: "email" },
      { key: "score", label: "客户评分", type: "select", options: ["A+", "A", "A-待补关键人", "B+", "B", "B-", "C-待补资料", "D-不导入"] },
      { key: "risk", label: "风险提示", type: "select", options: ["正常", "重复客户", "黑名单", "国际大牌排除", "OA风险提示"] },
      { key: "status", label: "状态", type: "select", options: ["待搜索", "已生成关键词", "已转线索", "已转客户", "排除"] },
      { key: "notes", label: "备注/判断依据", type: "textarea" },
    ],
    sample: [
      { searchName: "Portugal coffee appliance importers", country: "Portugal", keyword: "espresso machine importer", customerType: "家电进口商", googleKeywords: "", candidateCompany: "Demo Retail Group", website: "", email: "", score: "A", risk: "正常", status: "待搜索", notes: "优先找进口负责人、品类经理、采购经理。" },
    ],
  },
  aiAssistant: {
    title: "AI助手",
    eyebrow: "Trade AI Assistant",
    description: "外贸团队常用动作：查询/创建客户、创建线索、生成跟进建议、邮件草稿、WhatsApp话术、判断风险和推荐产品。",
    filterField: "task",
    table: ["task", "customer", "product", "status", "updatedAt"],
    fields: [
      { key: "task", label: "任务", type: "select", options: ["查询客户", "创建客户", "创建线索", "生成今日跟进计划", "找30天未跟进客户", "生成跟进建议", "生成邮件草稿", "生成WhatsApp话术", "总结客户历史", "判断客户价值", "判断付款风险", "推荐产品", "生成社媒内容"] },
      { key: "customer", label: "客户/公司" },
      { key: "product", label: "推荐产品", type: "select", options: PRODUCT_OPTIONS },
      { key: "input", label: "输入资料/要求", type: "textarea" },
      { key: "output", label: "输出结果", type: "textarea" },
      { key: "status", label: "状态", type: "select", options: ["草稿", "已完成", "已复制", "已保存"] },
    ],
    sample: [
      { task: "生成今日跟进计划", customer: "", product: "CM-1700MY", input: "优先A类客户和下次联系已到期客户。", output: "", status: "草稿" },
    ],
  },
  bi: {
    title: "BI",
    eyebrow: "Analytics",
    description: "跟踪客户数量、A类客户、报价、沉睡客户和付款风险。",
    filterField: "type",
    table: ["reportName", "type", "period", "metric", "status", "owner"],
    fields: [
      { key: "reportName", label: "报表名称", required: true },
      { key: "type", label: "类型", type: "select", options: ["客户增长", "报价转化", "付款风险", "产品机会", "渠道效果"] },
      { key: "period", label: "周期", type: "select", options: ["本周", "本月", "本季度", "今年"] },
      { key: "metric", label: "关键指标" },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "owner", label: "负责人" },
      { key: "notes", label: "分析结论", type: "textarea" },
    ],
    sample: [
      { reportName: "A类客户优先跟进", type: "客户增长", period: "本周", metric: "151个A类客户", status: "进行中", owner: "Lina", notes: "优先跟进有邮箱和WhatsApp的进口商。" },
    ],
  },
  settings: {
    title: "设置",
    eyebrow: "Settings",
    description: "管理个人 CRM 规则、DeepSeek、提醒和外贸字段默认值。",
    filterField: "category",
    table: ["settingName", "category", "value", "status", "updatedAt"],
    fields: [
      { key: "settingName", label: "设置名称", required: true },
      { key: "category", label: "分类", type: "select", options: ["AI", "提醒", "客户字段", "权限", "邮箱", "黑名单"] },
      { key: "value", label: "设置值" },
      { key: "status", label: "状态", type: "select", options: ["启用", "停用"] },
      { key: "notes", label: "说明", type: "textarea" },
    ],
    sample: [
      { settingName: "DeepSeek 邮件助手", category: "AI", value: "deepseek-chat", status: "启用", notes: "API Key 仍在原 AI 设置面板本地保存。" },
      { settingName: "首次开发后提醒", category: "提醒", value: "7-10天", status: "启用", notes: "跳过周末；节假日后续可继续扩展到国家假日。" },
    ],
  },
  customerTimeline: {
    title: "客户时间轴",
    eyebrow: "Customer Timeline",
    description: "按时间记录客户资料变化、开发信、报价、跟进和成交节点。",
    filterField: "type",
    table: ["customer", "date", "type", "content", "nextStep", "status"],
    fields: [
      { key: "customer", label: "客户名称", required: true },
      { key: "date", label: "日期", type: "date" },
      { key: "type", label: "类型", type: "select", options: ["资料更新", "开发信", "LinkedIn", "WhatsApp", "报价", "合同", "回款", "回访"] },
      { key: "content", label: "内容", type: "textarea" },
      { key: "nextStep", label: "下一步" },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { customer: "Nordic Brew Equipment AB", date: "2026-05-29", type: "报价", content: "已发送 CM-1700MY FOB 初版报价。", nextStep: "补充认证与MOQ", status: "待跟进", notes: "A类客户优先。" },
    ],
  },
  pool: {
    title: "公海",
    eyebrow: "Customer Pool",
    description: "存放暂时无人跟进、沉睡或待重新分配的客户。",
    filterField: "status",
    table: ["company", "country", "reason", "owner", "status", "nextDate"],
    fields: [
      { key: "company", label: "公司名", required: true },
      { key: "country", label: "国家" },
      { key: "reason", label: "进入公海原因", type: "select", options: ["沉睡客户", "无效邮箱", "长期未回复", "付款风险", "待重新分配"] },
      { key: "owner", label: "原负责人" },
      { key: "status", label: "状态", type: "select", options: ["可领取", "观察中", "黑名单", "已重新开发"] },
      { key: "nextDate", label: "再开发时间", type: "date" },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { company: "Dormant Appliance Buyer", country: "Spain", reason: "长期未回复", owner: "Lina", status: "可领取", nextDate: "2026-06-20", notes: "换产品角度重新开发 CM-1600B。" },
    ],
  },
  nearby: {
    title: "附近客户",
    eyebrow: "Regional Prospects",
    description: "按国家、城市、区域整理可集中开发的客户。",
    filterField: "region",
    table: ["company", "country", "city", "region", "source", "status"],
    fields: [
      { key: "company", label: "公司名", required: true },
      { key: "country", label: "国家" },
      { key: "city", label: "城市" },
      { key: "region", label: "区域", type: "select", options: ["Europe", "North America", "Latin America", "Middle East", "Asia-Pacific", "Africa"] },
      { key: "source", label: "来源" },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { company: "Lisbon Home Retail", country: "Portugal", city: "Lisbon", region: "Europe", source: "Google", status: "新建", notes: "可与 Jocel 同区域对比开发。" },
    ],
  },
  visitPlans: {
    title: "拜访计划 / 提醒",
    eyebrow: "Visit Plans",
    description: "管理视频会议、展会拜访、样品讲解和下次提醒。",
    filterField: "status",
    table: ["customer", "date", "type", "address", "status", "owner"],
    fields: [
      { key: "customer", label: "客户名称", required: true },
      { key: "date", label: "日期", type: "date" },
      { key: "type", label: "类型", type: "select", options: ["视频会议", "展会拜访", "客户来厂", "电话会议", "样品演示"] },
      { key: "address", label: "地点/链接" },
      { key: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
      { key: "owner", label: "负责人" },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { customer: "Nordic Brew Equipment AB", date: "2026-06-10", type: "视频会议", address: "Teams / WhatsApp", status: "待跟进", owner: "Lina", notes: "演示 CM-1700MY 卖点。" },
    ],
  },
  checkins: {
    title: "外勤签到",
    eyebrow: "Check-ins",
    description: "记录展会拜访、客户现场沟通和结果。",
    filterField: "result",
    table: ["customer", "date", "location", "result", "owner", "notes"],
    fields: [
      { key: "customer", label: "客户名称", required: true },
      { key: "date", label: "日期", type: "date" },
      { key: "location", label: "地点" },
      { key: "result", label: "结果", type: "select", options: ["已拜访", "待补资料", "需报价", "无效", "高意向"] },
      { key: "owner", label: "负责人" },
      { key: "notes", label: "备注", type: "textarea" },
    ],
    sample: [
      { customer: "Regional Chain Buyer", date: "2026-06-18", location: "IFA / Berlin", result: "高意向", owner: "Lina", notes: "重点推荐 CM-1600B TFT 方案。" },
    ],
  },
};

const DISABLED_MODULE_IDS = new Set([
  "opportunities",
  "letters",
  "prospecting",
  "customerTimeline",
  "pool",
  "contracts",
  "payments",
  "invoices",
  "visits",
  "marketing",
  "tickets",
  "bi",
  "aiAssistant",
]);

DISABLED_MODULE_IDS.forEach((moduleId) => delete moduleDefinitions[moduleId]);

let moduleStore = loadModuleStore();
let moduleAttachments = loadModuleAttachmentIndex();
let activeModuleId = "leads";
let activeRecordId = null;
let prospectWorkspaceView = "enterprise";
let moduleSelectedIds = new Set();

const moduleWorkbench = document.querySelector("#moduleWorkbench");
const moduleTitle = document.querySelector("#moduleTitle");
const moduleEyebrow = document.querySelector("#moduleEyebrow");
const moduleDescription = document.querySelector("#moduleDescription");
const moduleSummary = document.querySelector("#moduleSummary");
const moduleSearchInput = document.querySelector("#moduleSearchInput");
const moduleFilterSelect = document.querySelector("#moduleFilterSelect");
const moduleTable = document.querySelector("#moduleTable");
const moduleForm = document.querySelector("#moduleForm");
const moduleDetailTitle = document.querySelector("#moduleDetailTitle");
const moduleDetailStatus = document.querySelector("#moduleDetailStatus");
const moduleImportInput = document.querySelector("#moduleImportInput");
const moduleBulkDeleteBtn = document.querySelector("#moduleBulkDeleteBtn");

document.querySelectorAll("[data-module]").forEach((button) => {
  button.addEventListener("click", () => openModule(button.dataset.module, button));
});

document.querySelectorAll("[data-nav-target]").forEach((button) => {
  button.addEventListener("click", () => exitModuleMode(button));
});

document.querySelector("#moduleNewBtn")?.addEventListener("click", createModuleRecord);
document.querySelector("#moduleExportBtn")?.addEventListener("click", exportModuleCsv);
document.querySelector("#moduleImportBtn")?.addEventListener("click", () => moduleImportInput?.click());
document.querySelector("#moduleDeleteBtn")?.addEventListener("click", deleteModuleRecord);
moduleBulkDeleteBtn?.addEventListener("click", deleteSelectedModuleRecords);
moduleImportInput?.addEventListener("change", importModuleCsv);
moduleSearchInput?.addEventListener("input", renderActiveModule);
moduleFilterSelect?.addEventListener("change", renderActiveModule);
moduleForm?.addEventListener("submit", saveModuleRecord);
document.addEventListener("foryal:customer-followup-saved", (event) => {
  const record = event.detail?.record;
  if (!record?.id) return;
  moduleStore.followups = Array.isArray(moduleStore.followups) ? moduleStore.followups : [];
  const existing = moduleStore.followups.find((item) => item.id === record.id);
  const row = {
    ...record,
    customerId: event.detail?.customerId || record.customerId || "",
    customer: event.detail?.company || record.customer || "",
    createdAt: record.createdAt || record.date || todayForModule(),
    updatedAt: todayForModule(),
  };
  if (existing) Object.assign(existing, row);
  else moduleStore.followups.unshift(row);
  saveModuleStore();
  if (activeModuleId === "followups") renderActiveModule();
});
document.addEventListener("foryal:customer-followup-deleted", (event) => {
  const id = event.detail?.id;
  if (!id) return;
  moduleStore.followups = (moduleStore.followups || []).filter((item) => item.id !== id);
  saveModuleStore();
  if (activeModuleId === "followups") renderActiveModule();
});

function loadModuleStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(MODULE_STORAGE_KEY) || "{}");
    const result = {};
    Object.entries(moduleDefinitions).forEach(([id, definition]) => {
      const rows = Array.isArray(stored[id]) ? stored[id] : definition.sample;
      result[id] = rows.map((row) => ({
        id: row.id || crypto.randomUUID(),
        createdAt: row.createdAt || todayForModule(),
        updatedAt: row.updatedAt || todayForModule(),
        ...row,
      }));
    });
    return result;
  } catch {
    const result = {};
    Object.entries(moduleDefinitions).forEach(([id, definition]) => {
      result[id] = definition.sample.map((row) => ({
        id: crypto.randomUUID(),
        createdAt: todayForModule(),
        updatedAt: todayForModule(),
        ...row,
      }));
    });
    return result;
  }
}

function saveModuleStore() {
  localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(moduleStore));
}

function loadModuleAttachmentIndex() {
  try {
    const rows = JSON.parse(localStorage.getItem(MODULE_ATTACHMENT_INDEX_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function saveModuleAttachmentIndex() {
  localStorage.setItem(MODULE_ATTACHMENT_INDEX_KEY, JSON.stringify(moduleAttachments));
}

function canUseModuleAttachments(moduleId = activeModuleId) {
  return ["quotes", "products"].includes(moduleId);
}

function getModuleAttachments(moduleId, recordId) {
  return moduleAttachments
    .filter((item) => item.moduleId === moduleId && item.recordId === recordId)
    .sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
}

function openModuleAttachmentDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(MODULE_ATTACHMENT_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MODULE_ATTACHMENT_STORE)) {
        db.createObjectStore(MODULE_ATTACHMENT_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
  });
}

async function putModuleAttachmentData(id, dataUrl) {
  const db = await openModuleAttachmentDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MODULE_ATTACHMENT_STORE, "readwrite");
    tx.objectStore(MODULE_ATTACHMENT_STORE).put({ id, dataUrl, savedAt: new Date().toISOString() });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error("Attachment save failed"));
    };
  });
}

async function getModuleAttachmentData(id) {
  const db = await openModuleAttachmentDb();
  return new Promise((resolve) => {
    const tx = db.transaction(MODULE_ATTACHMENT_STORE, "readonly");
    const request = tx.objectStore(MODULE_ATTACHMENT_STORE).get(id);
    request.onsuccess = () => resolve(request.result?.dataUrl || "");
    request.onerror = () => resolve("");
    tx.oncomplete = () => db.close();
  });
}

async function deleteModuleAttachmentData(id) {
  try {
    const db = await openModuleAttachmentDb();
    await new Promise((resolve) => {
      const tx = db.transaction(MODULE_ATTACHMENT_STORE, "readwrite");
      tx.objectStore(MODULE_ATTACHMENT_STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
    db.close();
  } catch {
    // Metadata-only attachments or browsers without IndexedDB do not need binary cleanup.
  }
}

function readModuleFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

async function uploadModuleAttachments(files, moduleId = activeModuleId, recordId = activeRecordId) {
  const list = Array.from(files || []);
  if (!list.length || !recordId || !canUseModuleAttachments(moduleId)) return;
  const user = window.FORYAL_CRM?.getCurrentUser?.();
  let syncedQuoteProduct = "";
  for (const file of list) {
    const id = crypto.randomUUID();
    const smallEnough = Number(file.size || 0) <= MODULE_ATTACHMENT_INLINE_LIMIT;
    let dataUrl = "";
    const meta = {
      id,
      moduleId,
      recordId,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size || 0,
      uploadedBy: user?.name || "Lina",
      uploadedAt: new Date().toISOString(),
      note: "",
      tags: "",
      localCrm: true,
      storage: smallEnough ? "indexedDB" : "metadata-only",
      previewable: smallEnough && /^(image\/|application\/pdf|text\/)/i.test(file.type || ""),
    };
    if (smallEnough) {
      dataUrl = await readModuleFileAsDataUrl(file);
      if (dataUrl) await putModuleAttachmentData(id, dataUrl);
    }
    if (moduleId === "quotes" && !syncedQuoteProduct) {
      syncedQuoteProduct = inferQuoteProductModelFromAttachment(file.name, dataUrl);
    }
    moduleAttachments.unshift(meta);
  }
  if (moduleId === "quotes" && syncedQuoteProduct) {
    syncQuoteProductModel(recordId, syncedQuoteProduct);
  }
  saveModuleAttachmentIndex();
  renderActiveModule();
  notifyModule(syncedQuoteProduct ? `附件已保存，产品型号已同步为：${syncedQuoteProduct}` : "附件已保存到本地CRM。大文件仅保存元数据，后续可接入服务器或云盘。");
}

function syncQuoteProductModel(recordId, productModel) {
  const record = (moduleStore.quotes || []).find((item) => item.id === recordId);
  if (!record || !productModel) return;
  const current = String(record.product || "").trim();
  const canReplace = !current || current === PRODUCT_OPTIONS[0] || /^CM-1600B$/i.test(current);
  if (!canReplace && current.toLowerCase() !== productModel.toLowerCase()) return;
  record.product = productModel;
  record.updatedAt = todayForModule();
  saveModuleStore();
}

function inferQuoteProductModelFromAttachment(fileName = "", dataUrl = "") {
  const contentText = decodeAttachmentText(dataUrl);
  return inferQuoteProductModelFromText(contentText) || inferQuoteProductModelFromText(fileName) || cleanQuoteProductModelFromFileName(fileName);
}

function inferQuoteProductModelFromText(text = "") {
  const raw = String(text || "");
  if (!raw.trim()) return "";
  const known = PRODUCT_OPTIONS
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .find((option) => new RegExp(`\\b${escapeRegExpForModule(option).replace(/\\s+/g, "\\\\s+")}\\b`, "i").test(raw));
  if (known) return known;
  const cmMatch = raw.match(/\bCM[-\s]?\d{3,4}[A-Z]{0,5}\b/i);
  if (cmMatch) return cmMatch[0].replace(/\s+/g, "-").toUpperCase();
  const modelLine = raw.match(/(?:model|item|product|产品型号|型号|品名)\s*[:：#-]?\s*([A-Z0-9][A-Z0-9 _./-]{2,48})/i);
  if (modelLine) return normalizeQuoteProductModel(modelLine[1]);
  return "";
}

function cleanQuoteProductModelFromFileName(fileName = "") {
  const base = String(fileName || "")
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b(quotation|quote|price|pricelist|price list|fob|offer|报价|报价表|表格|catalogue|catalog|xlsx?|pdf|docx?|final|new|copy)\b/gi, " ")
    .replace(/\b20\d{2}(?:[-\s]?\d{1,2}){0,2}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalizeQuoteProductModel(base);
}

function normalizeQuoteProductModel(value = "") {
  const text = String(value || "")
    .replace(/[^\w\s./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || text.length < 2) return "";
  return text.length > 60 ? text.slice(0, 60).trim() : text;
}

function decodeAttachmentText(dataUrl = "") {
  const match = String(dataUrl || "").match(/^data:[^,]*;base64,(.+)$/);
  if (!match || typeof atob !== "function") return "";
  try {
    const binary = atob(match[1]);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const utf16 = new TextDecoder("utf-16le", { fatal: false }).decode(bytes);
    return `${utf8}\n${utf16}`.slice(0, 200000);
  } catch {
    return "";
  }
}

function escapeRegExpForModule(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function previewModuleAttachment(id) {
  const file = moduleAttachments.find((item) => item.id === id);
  if (!file) return;
  const dataUrl = await getModuleAttachmentData(id);
  if (!dataUrl) {
    notifyModule("该附件为本地CRM元数据记录，当前没有可预览文件内容。");
    return;
  }
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    notifyModule("浏览器阻止了预览窗口，请允许弹窗后重试。");
    return;
  }
  if (/^image\//i.test(file.type || "")) {
    win.document.write(`<title>${escapeModuleHtml(file.name)}</title><img src="${dataUrl}" style="max-width:100%;height:auto;">`);
  } else if (/application\/pdf/i.test(file.type || "")) {
    win.location.href = dataUrl;
  } else {
    win.document.write(`<title>${escapeModuleHtml(file.name)}</title><pre style="white-space:pre-wrap;">本地CRM附件：${escapeModuleHtml(file.name)}\n类型：${escapeModuleHtml(file.type)}\n大小：${escapeModuleHtml(formatModuleFileSize(file.size))}</pre>`);
  }
}

async function downloadModuleAttachment(id) {
  const file = moduleAttachments.find((item) => item.id === id);
  if (!file) return;
  const dataUrl = await getModuleAttachmentData(id);
  if (!dataUrl) {
    notifyModule("该附件当前只保存了元数据，不能下载真实文件。");
    return;
  }
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = file.name || "attachment";
  link.click();
}

async function deleteModuleAttachment(id) {
  const file = moduleAttachments.find((item) => item.id === id);
  if (!file) return;
  if (!confirm(`确定删除附件「${file.name}」吗？`)) return;
  moduleAttachments = moduleAttachments.filter((item) => item.id !== id);
  await deleteModuleAttachmentData(id);
  saveModuleAttachmentIndex();
  renderActiveModule();
  notifyModule("附件记录已删除，不影响报价单或资料本身。");
}

function renameModuleAttachment(id) {
  const file = moduleAttachments.find((item) => item.id === id);
  if (!file) return;
  const name = prompt("附件新名称", file.name || "");
  if (!name) return;
  file.name = name.trim();
  file.updatedAt = new Date().toISOString();
  saveModuleAttachmentIndex();
  renderActiveModule();
}

function editModuleAttachmentNote(id) {
  const file = moduleAttachments.find((item) => item.id === id);
  if (!file) return;
  file.note = prompt("附件备注", file.note || "") || "";
  file.tags = prompt("附件标签（用逗号分隔）", file.tags || "") || "";
  file.updatedAt = new Date().toISOString();
  saveModuleAttachmentIndex();
  renderActiveModule();
}

async function copyModuleAttachmentInfo(id) {
  const file = moduleAttachments.find((item) => item.id === id);
  if (!file) return;
  const info = [
    `文件名：${file.name}`,
    `类型：${file.type}`,
    `大小：${formatModuleFileSize(file.size)}`,
    `上传人：${file.uploadedBy}`,
    `上传时间：${formatModuleDateTime(file.uploadedAt)}`,
    `存储：${file.storage === "metadata-only" ? "本地CRM元数据" : "IndexedDB本地附件"}`,
    file.note ? `备注：${file.note}` : "",
    file.tags ? `标签：${file.tags}` : "",
  ].filter(Boolean).join("\n");
  await navigator.clipboard?.writeText(info);
  notifyModule("附件信息已复制。");
}

function formatModuleFileSize(size) {
  const bytes = Number(size || 0);
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatModuleDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function openModule(moduleId, sourceButton) {
  if (!moduleDefinitions[moduleId]) return;
  activeModuleId = moduleId;
  activeRecordId = moduleStore[moduleId]?.[0]?.id || null;
  moduleSelectedIds.clear();
  setModuleMode(true);
  setModuleNavActive(sourceButton);
  renderActiveModule();
  moduleWorkbench.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitModuleMode(sourceButton) {
  setModuleMode(false);
  setModuleNavActive(sourceButton);
}

function setModuleMode(enabled) {
  const sections = [
    "#customerSection",
    ".bottom-grid",
    "#mailSection",
    "#reminderPanel",
    "#settingsPanel",
  ];
  moduleWorkbench.hidden = !enabled;
  sections.forEach((selector) => {
    document.querySelector(selector)?.classList.toggle("is-module-hidden", enabled);
  });
}

function setModuleNavActive(sourceButton) {
  document.querySelectorAll(".wk-module-item, .nav-item").forEach((item) => {
    item.classList.toggle("active", item === sourceButton);
  });
}

function renderActiveModule() {
  const definition = moduleDefinitions[activeModuleId];
  const records = getFilteredModuleRecords();
  const existingIds = new Set((moduleStore[activeModuleId] || []).map((record) => record.id));
  moduleSelectedIds = new Set([...moduleSelectedIds].filter((id) => existingIds.has(id)));
  const active = getActiveRecord() || records[0] || null;
  activeRecordId = active?.id || null;
  document.querySelector(".module-grid")?.classList.toggle("wide-module", activeModuleId === "followups");

  moduleTitle.textContent = definition.title;
  moduleEyebrow.textContent = definition.eyebrow;
  moduleDescription.textContent = definition.description;
  renderModuleSummary(definition);
  renderModuleFilter(definition);
  renderModuleTable(definition, records);
  renderModuleForm(definition, active);
  applyModulePermissions();
  updateModuleBulkDeleteState();
}

function applyModulePermissions() {
  const user = window.FORYAL_CRM?.getCurrentUser?.();
  const isAdmin = user?.role === "admin";
  if (moduleDeleteBtn) moduleDeleteBtn.disabled = !isAdmin;
  const importBtn = document.querySelector("#moduleImportBtn");
  const exportBtn = document.querySelector("#moduleExportBtn");
  if (importBtn) importBtn.disabled = !isAdmin;
  if (exportBtn) exportBtn.disabled = !isAdmin;
  updateModuleBulkDeleteState();
}

function renderModuleSummary(definition) {
  const all = moduleStore[activeModuleId] || [];
  const filterField = definition.filterField;
  const filtered = getFilteredModuleRecords();
  const due = all.filter((row) => row.nextDate && row.nextDate <= todayForModule()).length;
  const risk = all.filter((row) => ["OA风险", "60/90/120 days credit风险", "寄售风险"].includes(row.risk)).length;
  moduleSummary.innerHTML = [
    ["总记录", all.length],
    ["当前筛选", filtered.length],
    ["待跟进", due],
    ["高风险", risk],
  ]
    .map(([label, value]) => `<div><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderModuleFilter(definition) {
  const current = moduleFilterSelect.value;
  const field = definition.fields.find((item) => item.key === definition.filterField);
  const values = field?.options || uniqueValues(moduleStore[activeModuleId], definition.filterField);
  moduleFilterSelect.innerHTML = `<option value="all">全部</option>${values
    .map((value) => `<option value="${escapeModuleHtml(value)}">${escapeModuleHtml(value)}</option>`)
    .join("")}`;
  moduleFilterSelect.value = values.includes(current) ? current : "all";
}

function renderModuleTable(definition, records) {
  if (activeModuleId === "dashboard") {
    renderDashboardWorkspace();
    return;
  }
  if (activeModuleId === "prospecting") {
    renderProspectingWorkspace(records);
    return;
  }
  if (activeModuleId === "followups") {
    renderFollowupsWorkspace();
    return;
  }
  if (activeModuleId === "aiAssistant") {
    renderAiAssistantWorkspace(records);
    return;
  }

  const tableFields = getModuleTableFields(definition);
  if (!records.length) {
    moduleTable.innerHTML = `<tbody><tr><td class="module-empty" colspan="${(tableFields.length || 1) + 2}">没有匹配记录，可以点击“新增”创建。</td></tr></tbody>`;
    updateModuleBulkDeleteState();
    return;
  }

  const allVisibleSelected = records.every((record) => moduleSelectedIds.has(record.id));
  moduleTable.innerHTML = `<thead><tr>
      <th class="module-select-col"><input type="checkbox" data-module-select-all ${allVisibleSelected ? "checked" : ""} aria-label="选择当前筛选记录" /></th>
      ${tableFields.map((field) => `<th>${escapeModuleHtml(field.label)}</th>`).join("")}<th>操作</th></tr></thead>
    <tbody>${records
      .map(
        (record) => `<tr class="${record.id === activeRecordId ? "active" : ""}" data-module-record="${record.id}">
          <td class="module-select-col"><input type="checkbox" data-module-select-record="${escapeModuleHtml(record.id)}" ${moduleSelectedIds.has(record.id) ? "checked" : ""} aria-label="选择记录" /></td>
          ${tableFields.map((field) => `<td>${renderModuleTableCell(record, field)}</td>`).join("")}
          <td>
            <button class="module-row-btn" type="button" data-edit-record="${record.id}">编辑</button>
            ${activeModuleId === "leads" ? `<button class="module-row-btn" type="button" data-lead-transfer="${record.id}">转客户</button>` : ""}
          </td>
        </tr>`,
      )
      .join("")}</tbody>`;

  const selectAll = moduleTable.querySelector("[data-module-select-all]");
  if (selectAll) {
    selectAll.indeterminate = !allVisibleSelected && records.some((record) => moduleSelectedIds.has(record.id));
    selectAll.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleVisibleModuleSelection(records, selectAll.checked);
    });
  }
  moduleTable.querySelectorAll("[data-module-select-record]").forEach((checkbox) => {
    checkbox.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleModuleSelection(checkbox.dataset.moduleSelectRecord, checkbox.checked);
    });
  });
  moduleTable.querySelectorAll("[data-module-record]").forEach((row) => {
    row.addEventListener("click", () => selectModuleRecord(row.dataset.moduleRecord));
  });
  moduleTable.querySelectorAll("[data-edit-record]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectModuleRecord(button.dataset.editRecord);
    });
  });
  moduleTable.querySelectorAll("[data-lead-transfer]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      transferLeadToCustomer(button.dataset.leadTransfer);
    });
  });
  moduleTable.querySelectorAll("[data-module-email-link]").forEach((link) => {
    link.addEventListener("click", (event) => event.stopPropagation());
  });
  hydrateModuleAttachmentPreviews();
  updateModuleBulkDeleteState();
}

function getModuleTableFields(definition) {
  const fields = definition.table.map((key) => definition.fields.find((field) => field.key === key) || { key, label: key });
  if (!canUseModuleAttachments(activeModuleId)) return fields;
  return [{ key: "__attachments", label: activeModuleId === "products" ? "图片/附件" : "附件" }, ...fields];
}

function renderModuleTableCell(record, field) {
  if (field.key === "__attachments") return renderModuleAttachmentCell(record);
  const value = record[field.key];
  if (!value) return "-";
  if (field.key === "email") {
    return `<a class="module-email-link" data-module-email-link href="${escapeModuleHtml(getModuleComposeUrl(record))}">${escapeModuleHtml(value)}</a>`;
  }
  if (["website", "linkedin", "instagram", "facebook", "youtube"].includes(field.key) && /^https?:\/\//i.test(String(value))) {
    return `<a class="module-email-link" data-module-email-link target="_blank" rel="noreferrer" href="${escapeModuleHtml(value)}">${escapeModuleHtml(value)}</a>`;
  }
  return escapeModuleHtml(value);
}

function renderModuleAttachmentCell(record) {
  const files = getModuleAttachments(activeModuleId, record.id);
  if (!files.length) return `<span class="module-attachment-empty">无附件</span>`;
  const visible = files.slice(0, 3);
  return `<div class="module-attachment-cell">
    ${visible.map(renderModuleAttachmentCellItem).join("")}
    ${files.length > visible.length ? `<span class="module-attachment-more">+${files.length - visible.length}</span>` : ""}
  </div>`;
}

function renderModuleAttachmentCellItem(file) {
  const isImage = /^image\//i.test(file.type || "");
  const label = file.name || "附件";
  const ext = getModuleFileExtension(label);
  if (isImage && file.storage !== "metadata-only") {
    return `<span class="module-attachment-thumb image" title="${escapeModuleHtml(label)}" data-module-attachment-preview="${escapeModuleHtml(file.id)}">
      <span>${escapeModuleHtml(ext || "IMG")}</span>
      <small>${escapeModuleHtml(label)}</small>
    </span>`;
  }
  return `<span class="module-attachment-thumb file" title="${escapeModuleHtml(label)}">
    <strong>${escapeModuleHtml(ext || "FILE")}</strong>
    <small>${escapeModuleHtml(label)}</small>
  </span>`;
}

async function hydrateModuleAttachmentPreviews() {
  const nodes = Array.from(moduleTable.querySelectorAll("[data-module-attachment-preview]"));
  for (const node of nodes) {
    const id = node.dataset.moduleAttachmentPreview;
    const dataUrl = await getModuleAttachmentData(id);
    if (!dataUrl) continue;
    const label = node.getAttribute("title") || "附件";
    node.innerHTML = `<img src="${escapeModuleHtml(dataUrl)}" alt="附件图片预览" loading="lazy" /><small>${escapeModuleHtml(label)}</small>`;
  }
}

function getModuleFileExtension(name = "") {
  const ext = String(name).split(".").pop();
  return ext && ext !== name ? ext.slice(0, 5).toUpperCase() : "";
}

function truncateModuleFileName(name = "") {
  const clean = String(name || "附件");
  return clean.length > 18 ? `${clean.slice(0, 9)}…${clean.slice(-6)}` : clean;
}

function getModuleComposeUrl(record = {}) {
  const params = new URLSearchParams({
    to: record.email || "",
    company: record.company || "",
    contact: record.contact || record.name || "",
    country: record.country || "",
    product: record.product || "",
    type: "first",
  });
  return `compose.html?${params.toString()}`;
}

function toggleModuleSelection(recordId, checked) {
  if (!recordId) return;
  if (checked) moduleSelectedIds.add(recordId);
  else moduleSelectedIds.delete(recordId);
  updateModuleBulkDeleteState();
}

function toggleVisibleModuleSelection(records, checked) {
  records.forEach((record) => {
    if (checked) moduleSelectedIds.add(record.id);
    else moduleSelectedIds.delete(record.id);
  });
  renderActiveModule();
}

function canBatchDeleteActiveModule() {
  return !["dashboard", "followups"].includes(activeModuleId);
}

function updateModuleBulkDeleteState() {
  if (!moduleBulkDeleteBtn) return;
  const isAdmin = window.FORYAL_CRM?.getCurrentUser?.()?.role === "admin";
  const count = moduleSelectedIds.size;
  moduleBulkDeleteBtn.hidden = !canBatchDeleteActiveModule();
  moduleBulkDeleteBtn.disabled = !isAdmin || !canBatchDeleteActiveModule() || count === 0;
  moduleBulkDeleteBtn.textContent = count ? `删除选中 (${count})` : "删除选中";
}

function renderFollowupsWorkspace() {
  moduleSearchInput.placeholder = "搜索跟进内容 / 客户名称 / 联系人";
  const rows = getVisibleFollowups();
  moduleTable.innerHTML = `<tbody><tr><td class="module-workspace-cell" colspan="12">
    <section class="followup-workspace">
      <div class="followup-topline">
        <div>
          <p class="eyebrow">Follow-up</p>
          <h4>跟进记录</h4>
        </div>
        <div class="followup-actions">
          <button class="ghost-btn" type="button" data-followup-toggle-advanced>高级筛选</button>
          <div class="view-switch">
            <button class="${followupUi.view === "table" ? "active" : ""}" type="button" data-followup-view="table">列表</button>
            <button class="${followupUi.view === "card" ? "active" : ""}" type="button" data-followup-view="card">卡片</button>
            <button class="${followupUi.view === "calendar" ? "active" : ""}" type="button" data-followup-view="calendar">日历</button>
          </div>
          <button class="primary-btn" type="button" data-followup-new>新增跟进</button>
        </div>
      </div>
      <div class="followup-scope">
        ${renderFollowupScope("all", "全部跟进记录")}
        ${renderFollowupScope("today", "今日跟进")}
        ${renderFollowupScope("overdue", "已逾期")}
        ${renderFollowupScope("next7", "未来7天")}
        ${renderFollowupScope("mine", "我创建的跟进记录")}
        ${renderFollowupScope("subordinate", "下属创建的跟进记录")}
        ${renderFollowupScope("watched", "我关注的跟进记录")}
      </div>
      <div class="followup-advanced ${followupUi.advanced ? "open" : ""}">
        ${renderFollowupSelect("channel", "跟进方式", FOLLOWUP_CHANNELS)}
        ${renderFollowupSelect("stage", "当前阶段", FOLLOWUP_STAGES)}
        ${renderFollowupSelect("completed", "是否完成", ["否", "是"])}
      </div>
      ${followupUi.view === "calendar" ? renderFollowupCalendar(rows) : followupUi.view === "card" ? renderFollowupCards(rows) : renderFollowupTable(rows)}
    </section>
  </td></tr></tbody>`;

  moduleTable.querySelector("[data-followup-new]")?.addEventListener("click", () => openFollowupModal());
  moduleTable.querySelector("[data-followup-toggle-advanced]")?.addEventListener("click", () => {
    followupUi.advanced = !followupUi.advanced;
    renderActiveModule();
  });
  moduleTable.querySelectorAll("[data-followup-view]").forEach((button) => {
    button.addEventListener("click", () => {
      followupUi.view = button.dataset.followupView;
      renderActiveModule();
    });
  });
  moduleTable.querySelectorAll("[data-followup-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      followupUi.scope = button.dataset.followupScope;
      renderActiveModule();
    });
  });
  moduleTable.querySelectorAll("[data-followup-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      followupUi[select.dataset.followupFilter] = select.value;
      renderActiveModule();
    });
  });
  moduleTable.querySelectorAll("[data-followup-action]").forEach((button) => {
    button.addEventListener("click", () => handleFollowupAction(button.dataset.followupAction, button.dataset.followupId));
  });
  moduleTable.querySelectorAll("[data-followup-calendar-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      followupUi.calendarMode = button.dataset.followupCalendarMode;
      renderActiveModule();
    });
  });
  moduleTable.querySelectorAll("[data-followup-new-date]").forEach((button) => {
    button.addEventListener("click", () => openFollowupModal({ nextDate: button.dataset.followupNewDate }, { isPreset: true }));
  });
}

function renderFollowupScope(key, label) {
  const count = getVisibleFollowups({ scope: key, ignoreAdvanced: true }).length;
  return `<button class="scope-chip ${followupUi.scope === key ? "active" : ""}" type="button" data-followup-scope="${key}">${label} <span>${count}</span></button>`;
}

function renderFollowupSelect(key, label, options) {
  return `<label>${label}<select data-followup-filter="${key}">
    <option value="all">全部</option>
    ${options.map((option) => `<option value="${escapeModuleHtml(option)}" ${followupUi[key] === option ? "selected" : ""}>${escapeModuleHtml(option)}</option>`).join("")}
  </select></label>`;
}

function renderFollowupTable(rows) {
  if (!rows.length) return `<div class="empty-state">暂无跟进记录</div>`;
  return `<div class="followup-table-wrap"><table class="followup-table">
    <thead><tr>
      <th>跟进内容</th><th>客户名称</th><th>联系人</th><th>下次联系时间</th><th>跟进方式</th><th>跟进类型</th><th>当前阶段</th><th>创建人</th><th>创建时间</th><th>评论/备注</th><th>操作</th>
    </tr></thead>
    <tbody>${rows.map((row) => `<tr>
      <td>${escapeModuleHtml(row.summary || "-")}</td>
      <td>${escapeModuleHtml(row.customer || "-")}</td>
      <td>${escapeModuleHtml(row.contact || "-")}</td>
      <td>${escapeModuleHtml(row.nextDate || "-")}</td>
      <td>${escapeModuleHtml(row.channel || "-")}</td>
      <td>${escapeModuleHtml(row.followType || "-")}</td>
      <td>${escapeModuleHtml(row.stage || "-")}</td>
      <td>${escapeModuleHtml(row.createdBy || "-")}</td>
      <td>${escapeModuleHtml(row.createdAt || row.date || "-")}</td>
      <td>${escapeModuleHtml(row.comments || row.result || "-")}</td>
      <td class="followup-row-actions">${renderFollowupRowActions(row)}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function renderFollowupCards(rows) {
  if (!rows.length) return `<div class="empty-state">暂无跟进记录</div>`;
  return `<div class="followup-card-grid">${rows.map((row) => `<article class="followup-card">
    <div><strong>${escapeModuleHtml(row.customer || "-")}</strong><span>${escapeModuleHtml(row.nextDate || "未设置下次联系")}</span></div>
    <p>${escapeModuleHtml(row.summary || "-")}</p>
    <small>${escapeModuleHtml(row.channel || "-")} · ${escapeModuleHtml(row.followType || "-")} · ${escapeModuleHtml(row.stage || "-")} · ${escapeModuleHtml(row.createdBy || "-")}</small>
    <div class="followup-row-actions">${renderFollowupRowActions(row)}</div>
  </article>`).join("")}</div>`;
}

function renderFollowupCalendar(rows) {
  const mode = followupUi.calendarMode || "month";
  const base = followupUi.calendarDate ? new Date(`${followupUi.calendarDate}T00:00:00`) : new Date();
  const today = todayForModule();
  const controls = `<div class="followup-calendar-controls">
    <div class="view-switch">
      <button class="${mode === "month" ? "active" : ""}" type="button" data-followup-calendar-mode="month">月视图</button>
      <button class="${mode === "week" ? "active" : ""}" type="button" data-followup-calendar-mode="week">周视图</button>
      <button class="${mode === "today" ? "active" : ""}" type="button" data-followup-calendar-mode="today">今日</button>
    </div>
    <button class="ghost-btn" type="button" data-followup-new-date="${today}">从今天新增跟进</button>
  </div>`;

  if (mode === "today") {
    const todayRows = rows.filter((row) => row.nextDate === today);
    return `${controls}${renderCalendarAgenda(`今日跟进 · ${today}`, todayRows, today)}`;
  }

  if (mode === "week") {
    const start = startOfWeek(base);
    const days = Array.from({ length: 7 }, (_, index) => addDaysForModule(formatDateForModule(start), index));
    return `${controls}<div class="followup-week-grid">${days.map((day) => renderCalendarDay(day, rows.filter((row) => row.nextDate === day), today)).join("")}</div>`;
  }

  const year = base.getFullYear();
  const month = base.getMonth();
  const monthStart = new Date(year, month, 1);
  const gridStart = startOfWeek(monthStart);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return formatDateForModule(date);
  });
  const title = `${year}-${String(month + 1).padStart(2, "0")}`;
  return `${controls}<div class="followup-calendar-title">${title}</div><div class="followup-calendar-grid">${days.map((day) => renderCalendarDay(day, rows.filter((row) => row.nextDate === day), today, new Date(`${day}T00:00:00`).getMonth() === month)).join("")}</div>`;
}

function renderCalendarAgenda(title, rows, day) {
  return `<section class="followup-agenda">
    <div class="followup-calendar-title">${escapeModuleHtml(title)}</div>
    ${rows.length ? rows.map((row) => renderCalendarEvent(row, day)).join("") : `<div class="empty-state compact">今天暂无跟进任务。</div>`}
  </section>`;
}

function renderCalendarDay(day, rows, today, inMonth = true) {
  const isToday = day === today;
  const overdueCount = rows.filter((row) => row.nextDate && row.nextDate < today && row.completed !== "是").length;
  return `<article class="followup-calendar-day ${inMonth ? "" : "muted"} ${isToday ? "today" : ""} ${overdueCount ? "overdue" : ""}">
    <div><strong>${day.slice(5)}</strong><button type="button" data-followup-new-date="${escapeModuleHtml(day)}">+</button></div>
    ${rows.length ? rows.map((row) => renderCalendarEvent(row, today)).join("") : `<span class="calendar-empty">-</span>`}
  </article>`;
}

function renderCalendarEvent(row, today) {
  const isOverdue = row.nextDate && row.nextDate < today && row.completed !== "是";
  const isToday = row.nextDate === today;
  return `<button class="followup-calendar-event ${isOverdue ? "overdue" : ""} ${isToday ? "today" : ""}" type="button" data-followup-action="view" data-followup-id="${escapeModuleHtml(row.id)}">
    <strong>${escapeModuleHtml(row.customer || "未命名客户")}</strong>
    <span>${escapeModuleHtml(row.followType || row.channel || "跟进")}</span>
  </button>`;
}

function renderFollowupRowActions(row) {
  const completed = row.completed === "是";
  return `
    <button class="module-row-btn" type="button" data-followup-action="view" data-followup-id="${escapeModuleHtml(row.id)}">查看</button>
    <button class="module-row-btn" type="button" data-followup-action="edit" data-followup-id="${escapeModuleHtml(row.id)}">编辑</button>
    <button class="module-row-btn" type="button" data-followup-action="${completed ? "reopen" : "complete"}" data-followup-id="${escapeModuleHtml(row.id)}">${completed ? "重新打开" : "标记完成"}</button>
    <button class="module-row-btn" type="button" data-followup-action="remind" data-followup-id="${escapeModuleHtml(row.id)}">创建提醒</button>
    <button class="module-row-btn" type="button" data-followup-action="note" data-followup-id="${escapeModuleHtml(row.id)}">备注</button>
    <button class="module-row-btn danger" type="button" data-followup-action="delete" data-followup-id="${escapeModuleHtml(row.id)}">删除</button>`;
}

function getVisibleFollowups(options = {}) {
  const user = window.FORYAL_CRM?.getCurrentUser?.();
  const keyword = moduleSearchInput.value.trim().toLowerCase();
  return (moduleStore.followups || [])
    .filter((row) => canViewFollowup(row))
    .filter((row) => {
      const scope = options.scope || followupUi.scope;
      const today = todayForModule();
      const next7 = addDaysForModule(today, 7);
      if (scope === "today") return row.nextDate === today;
      if (scope === "overdue") return row.nextDate && row.nextDate < today && row.completed !== "是";
      if (scope === "next7") return row.nextDate && row.nextDate >= today && row.nextDate <= next7;
      if (scope === "mine") return String(row.createdBy || "") === user?.name;
      if (scope === "subordinate") return user?.role === "admin" && String(row.createdBy || "") !== user?.name;
      if (scope === "watched") return row.watched === "是" || row.priority === "A";
      return true;
    })
    .filter((row) => {
      if (options.ignoreAdvanced) return true;
      return ["channel", "stage", "completed"].every((key) => followupUi[key] === "all" || String(row[key] || "") === followupUi[key]);
    })
    .filter((row) => {
      const text = [row.summary, row.customer, row.contact, row.feedback, row.concerns, row.nextAction, row.result, row.comments].join(" ").toLowerCase();
      return !keyword || text.includes(keyword);
    })
    .sort((a, b) => String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || "")));
}

function canViewFollowup(row) {
  const user = window.FORYAL_CRM?.getCurrentUser?.();
  if (user?.role === "admin") return true;
  if (String(row.createdBy || "") === user?.name) return true;
  const customer = findFollowupCustomer(row);
  return customer ? window.FORYAL_CRM?.canViewCustomer?.(customer) : false;
}

function handleFollowupAction(action, id) {
  const record = (moduleStore.followups || []).find((item) => item.id === id);
  if (!record) return;

  // Permission check for write operations
  const writableActions = ["edit", "complete", "reopen", "remind", "delete", "note"];
  if (writableActions.includes(action)) {
    if (!canViewFollowup(record)) {
      notifyModule("您没有权限操作此跟进记录");
      return;
    }
    const user = window.FORYAL_CRM?.getCurrentUser?.();
    const isAdmin = user?.role === "admin";
    const isOwner = String(record.createdBy || "") === user?.name;
    // Only admin or the creator can modify/delete followup records
    if (!isAdmin && !isOwner) {
      notifyModule("普通用户只能操作自己创建的跟进记录");
      return;
    }
  }

  if (action === "view") return openFollowupModal(record, { readOnly: true });
  if (action === "edit") return openFollowupModal(record);
  if (action === "complete") {
    record.completed = "是";
    record.result = record.result || "已完成";
    record.updatedAt = todayForModule();
    syncFollowupRecordToCustomer(record);
    saveModuleStore();
    renderActiveModule();
    notifyModule("跟进记录已标记完成");
    return;
  }
  if (action === "reopen") {
    record.completed = "否";
    record.result = record.result || "重新打开";
    record.updatedAt = todayForModule();
    syncFollowupRecordToCustomer(record);
    saveModuleStore();
    renderActiveModule();
    notifyModule("跟进记录已重新打开");
    return;
  }
  if (action === "note") {
    addFollowupNote(record);
    return;
  }
  if (action === "remind") {
    const suggestion = suggestNextFollowup(record);
    record.nextDate = suggestion.date;
    record.nextAction = record.nextAction || suggestion.action;
    record.updatedAt = todayForModule();
    syncFollowupRecordToCustomer(record);
    saveModuleStore();
    renderActiveModule();
    notifyModule(`下次提醒已设置为 ${suggestion.date}`);
    return;
  }
  if (action === "delete") {
    const ok = confirm("确定删除这条跟进记录吗？");
    if (!ok) return;
    moduleStore.followups = (moduleStore.followups || []).filter((item) => item.id !== id);
    removeFollowupFromCustomer(record);
    saveModuleStore();
    renderActiveModule();
    notifyModule("跟进记录已删除");
  }
}

function addFollowupNote(record) {
  const body = prompt("新增备注内容", "");
  if (!body) return;
  record.notesList = Array.isArray(record.notesList) ? record.notesList : [];
  record.notesList.unshift({
    id: crypto.randomUUID(),
    body: body.trim(),
    createdBy: window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  record.updatedAt = todayForModule();
  syncFollowupRecordToCustomer(record);
  saveModuleStore();
  renderActiveModule();
  notifyModule("备注已添加");
}

function editFollowupNote(record, noteId) {
  const note = (record.notesList || []).find((item) => item.id === noteId);
  if (!note) return;
  const body = prompt("修改备注内容", note.body || "");
  if (!body) return;
  note.body = body.trim();
  note.updatedAt = new Date().toISOString();
  record.updatedAt = todayForModule();
  syncFollowupRecordToCustomer(record);
  saveModuleStore();
  openFollowupModal(record, { readOnly: true });
  notifyModule("备注已修改");
}

function deleteFollowupNote(record, noteId) {
  if (!confirm("确定删除这条备注吗？")) return;
  record.notesList = (record.notesList || []).filter((item) => item.id !== noteId);
  record.updatedAt = todayForModule();
  syncFollowupRecordToCustomer(record);
  saveModuleStore();
  openFollowupModal(record, { readOnly: true });
  notifyModule("备注已删除");
}

function openFollowupModal(record = null, options = {}) {
  const isEdit = Boolean(record?.id);
  const readOnly = Boolean(options.readOnly);
  const draft = { ...createEmptyFollowup(), ...(record || {}) };
  const customers = window.FORYAL_CRM?.getCustomers?.() || [];
  const modal = document.createElement("div");
  modal.className = "customer-modal-backdrop";
  modal.innerHTML = `<div class="customer-modal-card followup-modal-card">
    <div class="customer-modal-head">
      <div>
        <h3>${readOnly ? "查看跟进记录" : isEdit ? "编辑跟进记录" : "新增跟进记录"}</h3>
        <p>记录客户开发进展、反馈、关心点和下次提醒。</p>
      </div>
      <button class="icon-close" type="button" data-followup-close>×</button>
    </div>
    <form class="customer-modal-form" id="followupModalForm">
      <div class="modal-grid">
        <label>客户名称<input name="customer" list="followupCustomerNames" value="${escapeModuleHtml(draft.customer || "")}" required ${readOnly ? "disabled" : ""} /></label>
        <datalist id="followupCustomerNames">${customers.map((customer) => `<option value="${escapeModuleHtml(customer.company || "")}"></option>`).join("")}</datalist>
        ${followupInput("contact", "联系人", draft.contact, readOnly)}
        ${followupInput("date", "跟进日期", draft.date || todayForModule(), readOnly, "date")}
        ${followupSelect("channel", "跟进方式", draft.channel, FOLLOWUP_CHANNELS, readOnly)}
        ${followupSelect("followType", "跟进类型", draft.followType, FOLLOWUP_TYPES, readOnly)}
        ${followupTextarea("summary", "跟进内容", draft.summary, readOnly, true)}
        ${followupTextarea("feedback", "客户反馈", draft.feedback, readOnly)}
        ${followupInput("concerns", "客户关心点", draft.concerns, readOnly)}
        ${followupSelect("stage", "当前阶段", draft.stage, FOLLOWUP_STAGES, readOnly)}
        ${followupInput("nextAction", "下一步动作", draft.nextAction, readOnly)}
        ${followupInput("nextDate", "下次联系时间", draft.nextDate, readOnly, "date")}
        ${followupSelect("reminderCycle", "提醒周期", draft.reminderCycle, REMINDER_CYCLES, readOnly)}
        ${followupSelect("completed", "是否完成", draft.completed, ["否", "是"], readOnly)}
        ${followupInput("result", "跟进结果", draft.result, readOnly)}
        ${followupTextarea("comments", "备注", draft.comments, readOnly)}
      </div>
      ${renderFollowupMaterialPicker(draft, readOnly)}
      ${isEdit ? renderFollowupNotes(draft) : ""}
      <div class="customer-modal-actions">
        <button class="ghost-btn" type="button" data-followup-close>${readOnly ? "关闭" : "取消"}</button>
        ${readOnly ? "" : `<button class="primary-btn" type="submit">保存</button>`}
      </div>
    </form>
  </div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-followup-close]").forEach((button) => button.addEventListener("click", () => modal.remove()));
  modal.querySelectorAll("[data-followup-note-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.followupNoteAction;
      const noteId = button.dataset.followupNoteId;
      modal.remove();
      if (action === "add") return addFollowupNote(record);
      if (action === "edit") return editFollowupNote(record, noteId);
      if (action === "delete") return deleteFollowupNote(record, noteId);
    });
  });
  modal.querySelector("#followupModalForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    values.materials = collectFollowupMaterials(modal);
    saveFollowupFromModal(isEdit ? record : null, values);
    modal.remove();
  });
}

function getCallableModuleMaterials() {
  return moduleAttachments
    .filter((item) => ["products", "quotes"].includes(item.moduleId))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function renderFollowupMaterialPicker(record = {}, readOnly = false) {
  const selectedIds = new Set((Array.isArray(record.materials) ? record.materials : []).map((item) => item.id || item.attachmentId));
  const files = getCallableModuleMaterials();
  return `<section class="followup-material-panel">
    <div class="followup-note-head">
      <strong>可调用资料</strong>
      <span>从“公司和产品/报价单”上传的资料，可保存到本次跟进记录。</span>
    </div>
    ${files.length ? `<div class="followup-material-list">
      ${files.map((file) => `<label class="followup-material-item">
        <input type="checkbox" data-followup-material-id="${escapeModuleHtml(file.id)}" ${selectedIds.has(file.id) ? "checked" : ""} ${readOnly ? "disabled" : ""} />
        <span>
          <strong title="${escapeModuleHtml(file.name || "")}">${escapeModuleHtml(file.name || "附件")}</strong>
          <small>${escapeModuleHtml(file.moduleId === "quotes" ? "报价单资料" : "公司和产品资料")} · ${escapeModuleHtml(formatModuleFileSize(file.size))} · ${escapeModuleHtml(file.storage === "metadata-only" ? "本地元数据" : "可作为小附件调用")}</small>
        </span>
      </label>`).join("")}
    </div>` : `<div class="empty-state compact">暂无可调用资料，请先到“公司和产品”上传资料。</div>`}
  </section>`;
}

function collectFollowupMaterials(root) {
  const selectedIds = Array.from(root.querySelectorAll("[data-followup-material-id]:checked")).map((node) => node.dataset.followupMaterialId);
  return selectedIds
    .map((id) => moduleAttachments.find((item) => item.id === id))
    .filter(Boolean)
    .map((file) => ({
      id: file.id,
      name: file.name || "",
      size: file.size || 0,
      type: file.type || "",
      moduleId: file.moduleId || "",
      recordId: file.recordId || "",
      storage: file.storage || "",
      tags: file.tags || "",
      note: file.note || "",
    }));
}

function renderFollowupNotes(record = {}) {
  const notes = Array.isArray(record.notesList) ? record.notesList : [];
  return `<section class="followup-note-panel">
    <div class="followup-note-head">
      <strong>备注记录</strong>
      <button class="ghost-btn" type="button" data-followup-note-action="add">新增备注</button>
    </div>
    ${notes.length ? notes.map((note) => `<article class="followup-note-item">
      <p>${escapeModuleHtml(note.body || "")}</p>
      <span>${escapeModuleHtml(note.createdBy || "-")} · ${escapeModuleHtml(formatModuleDateTime(note.updatedAt || note.createdAt))}</span>
      <div>
        <button class="module-row-btn" type="button" data-followup-note-action="edit" data-followup-note-id="${escapeModuleHtml(note.id)}">编辑</button>
        <button class="module-row-btn danger" type="button" data-followup-note-action="delete" data-followup-note-id="${escapeModuleHtml(note.id)}">删除</button>
      </div>
    </article>`).join("") : `<div class="empty-state compact">暂无备注</div>`}
  </section>`;
}

function followupInput(name, label, value = "", readOnly = false, type = "text") {
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeModuleHtml(value || "")}" ${readOnly ? "disabled" : ""} /></label>`;
}

function followupTextarea(name, label, value = "", readOnly = false, required = false) {
  return `<label class="wide-field">${label}<textarea name="${name}" rows="3" ${required ? "required" : ""} ${readOnly ? "disabled" : ""}>${escapeModuleHtml(value || "")}</textarea></label>`;
}

function followupSelect(name, label, value = "", options = [], readOnly = false) {
  const selected = value || options[0] || "";
  return `<label>${label}<select name="${name}" ${readOnly ? "disabled" : ""}>${options.map((option) => `<option ${option === selected ? "selected" : ""}>${escapeModuleHtml(option)}</option>`).join("")}</select></label>`;
}

function createEmptyFollowup() {
  return {
    date: todayForModule(),
    channel: "Email",
    followType: "首次开发",
    stage: "新客户",
    reminderCycle: "7天",
    completed: "否",
    notesList: [],
    materials: [],
    createdBy: window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
  };
}

function saveFollowupFromModal(existing, values) {
  const customer = findFollowupCustomer(values);
  const record = existing || { id: crypto.randomUUID(), createdAt: todayForModule() };
  const suggestion = suggestNextFollowup({ ...record, ...values, customerId: customer?.id, priority: customer?.priority });
  if (!existing) {
    const ok = confirm(`是否创建下次提醒？建议日期：${suggestion.date}`);
    if (ok) {
      values.nextDate = values.nextDate || suggestion.date;
      values.nextAction = values.nextAction || suggestion.action;
    }
  }
  Object.assign(record, values, {
    customerId: customer?.id || record.customerId || "",
    createdBy: record.createdBy || window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
    updatedBy: window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
    updatedAt: todayForModule(),
  });
  if (!existing) moduleStore.followups.unshift(record);
  syncFollowupRecordToCustomer(record);
  saveModuleStore();
  renderActiveModule();
  notifyModule(existing ? "跟进记录已更新" : "跟进记录已新增");
}

function suggestNextFollowup(record = {}) {
  let days = 7;
  const text = `${record.followType || ""} ${record.stage || ""} ${record.summary || ""}`;
  if (/已报价|报价/.test(text)) days = 6;
  if (/样品沟通|样品寄出/.test(text)) days = 8;
  if (/样品测试/.test(text)) days = 10;
  if (/等待回复|未回复/.test(text)) days = 7;
  if (/沉睡/.test(text)) days = 30;
  if (record.priority === "A") days = Math.min(days, 7);
  return {
    date: addDaysForModule(todayForModule(), days),
    action: `${days}天后再次联系客户，确认目录、报价、样品或采购反馈。`,
  };
}

function findFollowupCustomer(row = {}) {
  const customers = window.FORYAL_CRM?.getCustomers?.() || [];
  return customers.find((customer) =>
    customer.id === row.customerId ||
    String(customer.company || "").trim().toLowerCase() === String(row.customer || "").trim().toLowerCase() ||
    String(customer.email || "").trim().toLowerCase() === String(row.customer || "").trim().toLowerCase()
  );
}

function removeFollowupFromCustomer(record) {
  const customer = findFollowupCustomer(record);
  if (!customer) return;
  customer.followUps = (customer.followUps || []).filter((item) => item.id !== record.id);
  // Clean timeline entries that reference this followup
  customer.timeline = Array.isArray(customer.timeline)
    ? customer.timeline.filter((entry) => {
        if (!entry) return false;
        const entryText = `${entry.type || ""} ${entry.content || ""}`;
        const followText = `${record.channel || ""} ${record.summary || ""} ${record.followType || ""}`;
        // Keep entries that don't match the deleted followup
        if (entry.type === "跟进记录" && followText.trim() && entryText.includes(record.summary?.slice(0, 20) || "")) return false;
        return true;
      })
    : [];
  // Recalculate nextDate from remaining followups
  const dates = (customer.followUps || [])
    .map((f) => f.nextDate)
    .filter(Boolean)
    .sort();
  customer.nextDate = dates[0] || "";
  customer.updatedAt = new Date().toISOString().slice(0, 10);
  window.FORYAL_CRM?.saveCustomers?.();
}

function renderDashboardWorkspace() {
  const customers = window.FORYAL_CRM?.getCustomers?.() || [];
  const buckets = buildFollowupBuckets(customers);
  const aCount = customers.filter((c) => c.priority === "A" && c.isBlacklisted !== "是").length;
  const bCount = customers.filter((c) => c.priority === "B" && c.isBlacklisted !== "是").length;
  const cCount = customers.filter((c) => c.priority === "C" || c.isBlacklisted === "是").length;

  moduleTable.innerHTML = `<tbody><tr><td class="module-workspace-cell" colspan="8">
    <div class="dashboard-v2">

      <!-- TOP: Stats bar -->
      <section class="dash-stats-bar">
        <div class="dash-stat-card priority-a-card" data-priority-filter="A" title="查看A级客户">
          <strong>${aCount}</strong><span>A 级客户</span>
          <small>高价值·7天跟进</small>
        </div>
        <div class="dash-stat-card priority-b-card" data-priority-filter="B" title="查看B级客户">
          <strong>${bCount}</strong><span>B 级客户</span>
          <small>中等价值·14天跟进</small>
        </div>
        <div class="dash-stat-card priority-c-card" data-priority-filter="C" title="查看C级客户">
          <strong>${cCount}</strong><span>C 级客户</span>
          <small>低频维护</small>
        </div>
        <div class="dash-stat-card accent-card">
          <strong>${buckets.today.length}</strong><span>今日到期</span>
          <small>今天需要联系</small>
        </div>
        <div class="dash-stat-card warn-card">
          <strong>${buckets.overdue.length}</strong><span>已逾期</span>
          <small>需要尽快跟进</small>
        </div>
        <div class="dash-stat-card">
          <strong>${buckets.next7.length}</strong><span>未来 7 天</span>
          <small>提前准备</small>
        </div>
      </section>

      <!-- MIDDLE: Today workbench -->
      <section class="dash-workbench">
        <div class="dash-section-head">
          <h3>📋 今日工作台</h3>
          <p>到期、逾期、A类客户和报价/样品跟进</p>
        </div>
        <div class="dash-lane-grid">
          ${renderFollowupLane("今天到期", buckets.today)}
          ${renderFollowupLane("已逾期", buckets.overdue)}
          ${renderFollowupLane("未来 7 天", buckets.next7)}
          ${renderFollowupLane("A 类客户", buckets.aClass)}
          ${renderFollowupLane("报价未回复", buckets.quoted)}
          ${renderFollowupLane("样品测试中", buckets.sample)}
        </div>
      </section>

      <!-- BOTTOM: Dormant alerts — always visible -->
      <section class="dash-dormant">
        <div class="dash-section-head">
          <h3>⏰ 沉睡客户提醒</h3>
          <p>长时间未联系客户，按沉睡天数分三级提醒</p>
        </div>
        <div class="dash-dormant-grid">
          ${renderDormantLane("轻度沉睡 · 30-60 天", "建议通过 Email 重新触达", "dormant-light", buckets.dormantLight, "Email")}
          ${renderDormantLane("中度沉睡 · 60-90 天", "建议通过 LinkedIn 重新触达", "dormant-medium", buckets.dormantMedium, "LinkedIn")}
          ${renderDormantLane("深度沉睡 · 90 天以上", "建议通过 WhatsApp 重新触达", "dormant-deep", buckets.dormantDeep, "WhatsApp")}
        </div>
      </section>

    </div>
  </td></tr></tbody>`;

  // Wire dashboard action buttons
  moduleTable.querySelectorAll("[data-dashboard-action]").forEach((button) => {
    button.addEventListener("click", () => handleDashboardAction(button.dataset.dashboardAction, button.dataset.customerId));
  });

  // Wire A/B/C quick filter clicks
  moduleTable.querySelectorAll("[data-priority-filter]").forEach((card) => {
    card.addEventListener("click", () => {
      const priority = card.dataset.priorityFilter;
      // Navigate to customer module with priority filter pre-set
      const customerModule = document.querySelector("[data-module=\"leads\"]");
      // Switch to customer section and filter by priority
      const navBtn = document.querySelector("[data-nav-target=\"customerSection\"]");
      if (navBtn) navBtn.click();
      // Set scope filter if possible
      setTimeout(() => {
        const scopeBtns = document.querySelectorAll("[data-customer-scope]");
        scopeBtns.forEach((b) => {
          b.classList.toggle("active", b.dataset.customerScope === (priority === "A" ? "hot" : priority === "C" ? "all" : "all"));
        });
        // Trigger a custom event that customer-crm.js can listen to
        document.dispatchEvent(new CustomEvent("foryal:dashboard-filter", { detail: { priority } }));
      }, 200);
    });
  });
}

function renderTodayMetric(label, value) {
  return `<div><strong>${value}</strong><span>${label}</span></div>`;
}

function renderFollowupLane(title, rows) {
  return `<article class="today-lane">
    <div class="today-lane-head"><h5>${escapeModuleHtml(title)}</h5><span>${rows.length}</span></div>
    <div class="today-card-list">${rows.slice(0, 8).map(renderFollowupCard).join("") || "<div class='empty-state compact'>暂无</div>"}</div>
  </article>`;
}

function renderFollowupCard(item) {
  const customer = item.customer || item;
  const priClass = customer.priority === "A" ? "pri-a" : customer.priority === "C" ? "pri-c" : "pri-b";
  return `<div class="today-card">
    <div class="today-card-body">
      <div class="today-card-row1">
        <strong>${escapeModuleHtml(customer.company || "未命名客户")}</strong>
        <span class="pri-badge ${priClass}">${escapeModuleHtml(customer.priority || "B")}级</span>
      </div>
      <div class="today-card-row2">
        <span>${escapeModuleHtml(customer.contact || "-")}</span>
        <span class="dot">·</span>
        <span>${escapeModuleHtml(customer.country || "-")}</span>
      </div>
      <div class="today-card-row3">
        <span class="stage-tag">${escapeModuleHtml(customer.stage || "-")}</span>
        <span>${escapeModuleHtml(customer.product || "-")}</span>
      </div>
      <div class="today-card-row4">
        <small>下次: <strong>${escapeModuleHtml(customer.nextDate || item.nextDate || "-")}</strong></small>
      </div>
    </div>
    <div class="today-card-actions">
      ${customer.email ? `<a class="ghost-btn" href="${escapeModuleHtml(buildComposeUrlForCustomer(customer, "followup"))}">✉️ 写邮件</a>` : ""}
      <button class="primary-btn compact-btn" type="button" data-dashboard-action="mark-followed" data-customer-id="${escapeModuleHtml(customer.id)}">✓ 记录跟进</button>
    </div>
  </div>`;
}

function renderDormantLane(title, subtitle, cssClass, rows, channel) {
  return `<article class="today-lane dormant-lane ${cssClass}">
    <div class="today-lane-head">
      <div>
        <h5>${escapeModuleHtml(title)}</h5>
        <small>${escapeModuleHtml(subtitle)}</small>
      </div>
      <span class="${rows.length ? 'has-count' : 'zero-count'}">${rows.length}</span>
    </div>
    <div class="today-card-list">${rows.length
      ? rows.slice(0, 6).map((item) => renderDormantCard(item, channel)).join("")
      : "<div class='empty-state compact dormant-empty'>✅ 暂无此类沉睡客户，继续保持跟进节奏</div>"}</div>
  </article>`;
}

function renderDormantCard(item, channel) {
  const customer = item.customer || item;
  const daysSince = item.lastDate ? Math.abs(Math.floor((new Date(todayForModule()) - new Date(item.lastDate)) / 86400000)) : 90;
  const content = generateDormantContent(customer, channel);
  const chanIcon = channel === "WhatsApp" ? "💬" : channel === "LinkedIn" ? "🔗" : "✉️";
  return `<div class="today-card dormant-card">
    <div class="today-card-body">
      <div class="today-card-row1">
        <strong>${escapeModuleHtml(customer.company || "未命名客户")}</strong>
        <span class="dormant-days-badge">${daysSince} 天</span>
      </div>
      <div class="today-card-row2">
        <span>${escapeModuleHtml(customer.contact || "-")}</span>
        <span class="dot">·</span>
        <span>${escapeModuleHtml(customer.country || "-")}</span>
        <span class="dot">·</span>
        <span>${escapeModuleHtml(customer.priority || "B")}级</span>
      </div>
      <details class="dormant-content-preview">
        <summary>${chanIcon} 查看${channel}话术</summary>
        <pre>${escapeModuleHtml(content)}</pre>
        <button class="ghost-btn copy-dormant-btn" type="button" data-dormant-copy="${escapeModuleHtml(customer.id)}">📋 复制话术</button>
      </details>
    </div>
    <div class="today-card-actions">
      ${customer.email ? `<a class="ghost-btn" href="${escapeModuleHtml(buildComposeUrlForCustomer(customer, "dormant"))}">✉️ 写邮件</a>` : ""}
      <button class="primary-btn compact-btn" type="button" data-dashboard-action="mark-followed" data-customer-id="${escapeModuleHtml(customer.id)}">✓ 记录跟进</button>
    </div>
  </div>`;
}

function buildFollowupBuckets(customers) {
  const today = todayForModule();
  const todayDate = new Date(today);
  const withInfo = customers.map((customer) => ({
    customer,
    nextDate: customer.nextDate || getNextDateForModule(customer),
    lastDate: getLastFollowDateForModule(customer),
    action: recommendNextAction(customer),
  }));
  const days = (date) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return 9999;
    return Math.floor((value - todayDate) / 86400000);
  };
  return {
    today: withInfo.filter((item) => item.nextDate === today),
    overdue: withInfo.filter((item) => item.nextDate && days(item.nextDate) < 0),
    next7: withInfo.filter((item) => item.nextDate && days(item.nextDate) >= 1 && days(item.nextDate) <= 7),
    aClass: withInfo.filter((item) => item.customer.priority === "A"),
    quoted: withInfo.filter((item) => item.customer.isQuoted === "是" || item.customer.stage === "已报价"),
    sample: withInfo.filter((item) => item.customer.isSample === "是" || /样品/.test(item.customer.stage || "")),
    dormant: withInfo.filter((item) => !item.lastDate || days(item.lastDate) <= -30 || item.customer.stage === "沉睡"),
    dormantLight: withInfo.filter((item) => {
      if (!item.lastDate) return false;
      const d = days(item.lastDate);
      return d > -60 && d <= -30;
    }),
    dormantMedium: withInfo.filter((item) => {
      if (!item.lastDate) return false;
      const d = days(item.lastDate);
      return d > -90 && d <= -60;
    }),
    dormantDeep: withInfo.filter((item) => {
      if (!item.lastDate) return true; // No activity at all
      return days(item.lastDate) <= -90 || item.customer.stage === "沉睡";
    }),
  };
}

function handleDashboardAction(action, customerId) {
  const customer = (window.FORYAL_CRM?.getCustomers?.() || []).find((item) => item.id === customerId);
  if (!customer) return;
  if (action === "mark-followed") {
    window.FORYAL_CRM?.addFollowUp?.(customerId, {
      channel: "Email",
      summary: "今日工作台记录：已安排跟进。",
      feedback: "",
      concerns: "",
      stage: customer.stage || "已联系",
      nextAction: recommendNextAction(customer),
      nextDate: addDaysForModule(todayForModule(), getDefaultFollowDelay(customer)),
    });
    renderActiveModule();
    notifyModule("跟进记录已保存，并自动设置下次提醒");
  }
}

function getNextDateForModule(customer) {
  return (customer.followUps || []).find((item) => item.nextDate)?.nextDate || customer.nextDate || "";
}

function getLastFollowDateForModule(customer) {
  return (customer.followUps || []).find((item) => item.date)?.date || customer.lastFollowDate || "";
}

function recommendNextAction(customer) {
  const stage = customer.stage || "";
  if (stage.includes("报价")) return "跟进报价反馈，确认目标价、MOQ、认证和包装要求";
  if (stage.includes("样品")) return "询问样品测试反馈，推进改进点和下一步订单";
  if (stage.includes("沉睡")) return "用新型号或Backup Supplier角度重新唤醒";
  if (customer.priority === "A") return "7天内再次联系，Email+LinkedIn双渠道";
  return "发送简短目录/FOB范围，确认是否愿意评估推荐型号";
}

function getDefaultFollowDelay(customer) {
  const stage = customer.stage || "";
  if (stage.includes("报价")) return 6;
  if (stage === "样品寄出") return 8;
  if (stage.includes("样品")) return 10;
  if (stage.includes("未回复")) return 7;
  if (stage.includes("沉睡")) return 30;
  if (customer.priority === "A") return 7;
  return 7;
}

function getDormantLevel(daysSince) {
  if (daysSince > 90) return { level: "deep", channel: "WhatsApp", label: "深度沉睡 (90+天)", cssClass: "dormant-deep" };
  if (daysSince > 60) return { level: "medium", channel: "LinkedIn", label: "中度沉睡 (60-90天)", cssClass: "dormant-medium" };
  if (daysSince > 30) return { level: "light", channel: "Email", label: "轻度沉睡 (30-60天)", cssClass: "dormant-light" };
  return null;
}

function generateDormantContent(customer, channel) {
  const product = customer.product || "CM-1700MY";
  const company = customer.company || "your company";
  const contact = customer.contact || "there";
  const templates = {
    Email: `Subject: New coffee machine updates for ${company}\n\nDear ${contact},\n\nHope you are doing well! We haven't connected in a while, and I wanted to share some updates — we've recently upgraded the ${product} with improved performance and competitive pricing.\n\nWould you be interested in receiving our latest product catalog and FOB quotation?\n\nBest regards,\nLina Mei`,
    LinkedIn: `Hi ${contact}, it's been a while since we last connected. FORYAL has recently launched some new coffee machine models that might interest ${company}. I'd be happy to send you a brief product overview if you're open to it. Let me know!`,
    WhatsApp: `Hi ${contact}, this is Lina from FORYAL. Long time no talk! We have some new coffee machine models with great pricing. May I send you quick info? ☕`
  };
  return templates[channel] || templates.Email;
}

function addDaysForModule(dateText, days) {
  const date = new Date(dateText);
  date.setDate(date.getDate() + days);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function formatDateForModule(date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function buildComposeUrlForCustomer(customer, type = "followup") {
  const params = new URLSearchParams();
  if (customer.id) params.set("customerId", customer.id);
  if (customer.email) params.set("to", customer.email);
  params.set("type", type);
  return `compose.html?${params.toString()}`;
}

function renderProspectingWorkspace(records) {
  const current = getActiveRecord() || {};
  const industryPacks = [
    ["咖啡机进口商", "coffee machine importer", "适合寻找有进口能力的区域经销/代理客户"],
    ["小家电品牌商", "small appliance brand", "适合OEM/Private Label切入"],
    ["厨房电器批发商", "kitchen appliance wholesaler", "适合目录型客户和批量询盘"],
    ["连锁零售买手", "retail chain buyer small appliances", "适合CM-1600B和差异化SKU"],
    ["电商卖家", "amazon espresso machine seller", "适合轻量化开发与样品测试"],
    ["咖啡设备品牌商", "coffee equipment brand", "适合磨豆一体和中高端平台"],
  ];
  const subMenus = [
    ["enterprise", "企业探查"],
    ["advanced", "高级筛选"],
    ["market", "潜客市场"],
    ["subscribe", "潜客订阅"],
    ["map", "地图拓客"],
    ["relation", "关系拓客"],
    ["batch", "批量查询"],
    ["unlock", "解锁记录"],
  ];
  moduleTable.innerHTML = `<tbody><tr><td class="module-workspace-cell" colspan="8">
    <div class="prospect-console">
      <aside class="prospect-side">
        ${subMenus.map(([key, label]) => `<button class="${prospectWorkspaceView === key ? "active" : ""}" type="button" data-prospect-view="${key}">${label}</button>`).join("")}
      </aside>
      <div class="prospect-main">
        <section class="prospect-search-panel">
          <div class="prospect-tabs">
            <button class="active" type="button">智能搜索</button>
            <button type="button" data-prospect-action="open-google-current">查企业</button>
          </div>
          <div class="prospect-search-row">
            <input id="prospectCountryInput" value="${escapeModuleHtml(current.country || "Portugal")}" placeholder="国家，例如 Portugal / Germany" />
            <input id="prospectKeywordInput" value="${escapeModuleHtml(current.keyword || "espresso machine importer")}" placeholder="关键词，例如 coffee machine importer" />
            <select id="prospectTypeInput">${PROSPECT_CUSTOMER_TYPES.map((type) => `<option ${type === current.customerType ? "selected" : ""}>${escapeModuleHtml(type)}</option>`).join("")}</select>
            <button class="primary-btn" type="button" data-prospect-action="run-search">搜索并保存</button>
          </div>
          <p class="prospect-hint">会生成Google搜索词、保存搜客记录、检查重复/黑名单/国际大牌/OA风险，并给出A/B/C评分。</p>
        </section>

        ${renderProspectViewBody(prospectWorkspaceView, industryPacks, records)}
      </div>
    </div>
  </td></tr></tbody>`;

  moduleTable.querySelectorAll("[data-prospect-view]").forEach((button) => {
    button.addEventListener("click", () => {
      prospectWorkspaceView = button.dataset.prospectView;
      renderActiveModule();
    });
  });
  moduleTable.querySelectorAll("[data-pack-keyword]").forEach((button) => {
    button.addEventListener("click", () => runProspectSearchFromWorkspace(button.dataset.packKeyword, button.dataset.packType));
  });
  moduleTable.querySelectorAll("[data-prospect-action]").forEach((button) => {
    button.addEventListener("click", () => handleProspectWorkspaceAction(button.dataset.prospectAction, button.dataset.recordId, button.dataset.query));
  });
}

function renderProspectViewBody(view, industryPacks, records) {
  if (view === "advanced") {
    return `<section class="prospect-panel"><h4>高级筛选</h4><div class="prospect-filter-grid">
      <span>国家/区域</span><strong>Europe / Latin America / Middle East</strong>
      <span>客户类型</span><strong>品牌商、进口商、批发商、连锁零售、电商卖家</strong>
      <span>排除规则</span><strong>已在CRM、黑名单、国际大牌、明显OA/寄售风险</strong>
      <span>评分规则</span><strong>官网+邮箱+咖啡/小家电相关=A；资料不足=B/C</strong>
    </div></section>${renderProspectResultList(records)}`;
  }
  if (view === "subscribe") {
    return `<section class="prospect-panel"><h4>潜客订阅</h4><p>保存常用搜索组合，每次进入搜客可以继续补充结果。</p>
      <div class="prospect-subscription-list">${records.slice(0, 6).map((record) => `<article><strong>${escapeModuleHtml(record.searchName || record.keyword)}</strong><span>${escapeModuleHtml(record.country || "")} · ${escapeModuleHtml(record.customerType || "")}</span><button class="ghost-btn" type="button" data-prospect-action="open-google" data-record-id="${escapeModuleHtml(record.id)}">打开Google</button></article>`).join("") || "<div class='empty-state compact'>暂无订阅，先搜索一次。</div>"}</div></section>`;
  }
  if (view === "map") {
    return `<section class="prospect-panel"><h4>地图拓客</h4><p>按国家和城市集中开发。当前阶段保存Google Maps搜索入口，后续可接地图API。</p>
      <div class="prospect-map-grid">${["Portugal Lisbon appliance importer", "Germany espresso machine distributor", "UAE kitchen appliance importer", "Chile home appliance brand"].map((query) => `<a class="prospect-map-card" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/${encodeURIComponent(query)}">${escapeModuleHtml(query)}</a>`).join("")}</div></section>`;
  }
  if (view === "relation") {
    return `<section class="prospect-panel"><h4>关系拓客</h4><p>围绕已有客户找同国家、同渠道、同职位联系人。</p>
      <div class="prospect-query-list">${buildRelationProspectQueries().map((query) => `<button class="ghost-btn" type="button" data-prospect-action="open-query" data-query="${escapeModuleHtml(query)}">${escapeModuleHtml(query)}</button>`).join("")}</div></section>`;
  }
  if (view === "batch") {
    return `<section class="prospect-panel"><h4>批量查询</h4><p>把公司名按行粘贴，系统会保存为搜客记录并自动查重。</p>
      <textarea id="prospectBatchInput" rows="8" placeholder="Company A&#10;Company B&#10;Company C"></textarea>
      <div class="prospect-actions"><button class="primary-btn" type="button" data-prospect-action="batch-create">批量生成记录</button></div></section>${renderProspectResultList(records)}`;
  }
  if (view === "unlock") {
    return `<section class="prospect-panel"><h4>解锁记录</h4><p>这里记录已经转成线索/客户的潜客，便于回看来源。</p></section>${renderProspectResultList(records.filter((record) => /已转/.test(record.status || "")))}`;
  }
  return `<section class="prospect-panel">
      <div class="prospect-section-head"><h4>${view === "market" ? "潜客市场" : "行业客群包"}</h4><span>${view === "market" ? "按外贸咖啡机客户类型拆分市场" : "点击任意客群包即可生成可执行搜索"}</span></div>
      <div class="prospect-pack-grid">
        ${industryPacks.map(([name, keyword, desc]) => `<article class="prospect-pack-card">
          <strong>${escapeModuleHtml(name)}</strong>
          <p>${escapeModuleHtml(desc)}</p>
          <span>${escapeModuleHtml(keyword)}</span>
          <button class="ghost-btn" type="button" data-pack-keyword="${escapeModuleHtml(keyword)}" data-pack-type="${escapeModuleHtml(name)}">生成搜索</button>
        </article>`).join("")}
      </div>
    </section>${renderProspectResultList(records)}`;
}

function renderProspectResultList(records) {
  const rows = records.slice(0, 16);
  if (!rows.length) return `<section class="prospect-panel"><div class="empty-state compact">暂无搜客结果，输入国家和关键词后点击搜索。</div></section>`;
  return `<section class="prospect-panel">
    <div class="prospect-section-head"><h4>潜客结果</h4><span>共 ${records.length} 条，点击按钮可执行下一步</span></div>
    <div class="prospect-result-list">${rows.map((record) => `<article class="prospect-result-card">
      <div>
        <strong>${escapeModuleHtml(record.candidateCompany || record.searchName || "未命名潜客")}</strong>
        <p>${escapeModuleHtml(record.country || "-")} · ${escapeModuleHtml(record.customerType || "-")} · ${escapeModuleHtml(record.keyword || "-")}</p>
        <small>${escapeModuleHtml(record.notes || "等待进一步调研")}</small>
      </div>
      <div class="prospect-score ${escapeModuleHtml(record.score || "B")}">${escapeModuleHtml(record.score || "B")}</div>
      <div class="prospect-row-actions">
        <button class="ghost-btn" type="button" data-prospect-action="open-google" data-record-id="${escapeModuleHtml(record.id)}">Google</button>
        <button class="ghost-btn" type="button" data-prospect-action="check" data-record-id="${escapeModuleHtml(record.id)}">查重</button>
        <button class="ghost-btn" type="button" data-prospect-action="to-lead" data-record-id="${escapeModuleHtml(record.id)}">转线索</button>
        <button class="primary-btn" type="button" data-prospect-action="to-customer" data-record-id="${escapeModuleHtml(record.id)}">转客户</button>
      </div>
    </article>`).join("")}</div>
  </section>`;
}

function renderAiAssistantWorkspace(records) {
  const taskOptions = moduleDefinitions.aiAssistant.fields.find((field) => field.key === "task").options;
  const latest = records.slice(0, 8);
  moduleTable.innerHTML = `<tbody><tr><td class="module-workspace-cell" colspan="8">
    <div class="ai-console">
      <section class="ai-console-main">
        <div class="ai-console-hero">
          <h4>外贸AI任务中心</h4>
          <p>这里不是聊天窗口。每次选择一个业务动作，系统会读取客户、线索、跟进、邮件和产品数据，生成可保存的CRM结果。</p>
        </div>
        <div class="ai-quick-actions">
          <button class="ghost-btn" type="button" data-ai-quick="查询客户">查询客户</button>
          <button class="ghost-btn" type="button" data-ai-quick="创建客户">创建客户</button>
          <button class="ghost-btn" type="button" data-ai-quick="创建线索">创建线索</button>
          <button class="ghost-btn" type="button" data-ai-quick="找30天未跟进客户">30天未跟进</button>
          <button class="ghost-btn" type="button" data-ai-quick="生成跟进建议">跟进建议</button>
          <button class="ghost-btn" type="button" data-ai-quick="生成邮件草稿">邮件草稿</button>
          <button class="ghost-btn" type="button" data-ai-quick="生成WhatsApp话术">WhatsApp</button>
          <button class="ghost-btn" type="button" data-ai-quick="生成今日跟进计划">今日计划</button>
          <button class="ghost-btn" type="button" data-ai-quick="判断付款风险">付款风险</button>
          <button class="ghost-btn" type="button" data-ai-quick="推荐产品">推荐产品</button>
        </div>
        <div class="ai-prompt-box">
          <select id="aiConsoleTask">${taskOptions.map((task) => `<option>${escapeModuleHtml(task)}</option>`).join("")}</select>
          <textarea id="aiConsolePrompt" rows="5" placeholder="输入客户名、邮箱、国家、产品关键词，或输入：公司名：ABC，国家：Germany，联系人：Tom，邮箱：tom@example.com"></textarea>
          <button class="primary-btn" type="button" data-ai-action="run-console">发送</button>
        </div>
      </section>
      <aside class="ai-console-history">
        <h4>输出记录</h4>
        ${latest.length ? latest.map((record) => `<article>
          <strong>${escapeModuleHtml(record.task || "AI任务")}</strong>
          <span>${escapeModuleHtml(record.updatedAt || record.createdAt || "")}</span>
          <p>${escapeModuleHtml((record.output || record.input || "").slice(0, 260))}</p>
          <button class="ghost-btn" type="button" data-ai-action="load-record" data-record-id="${escapeModuleHtml(record.id)}">查看/编辑</button>
        </article>`).join("") : "<div class='empty-state compact'>暂无记录，发送一次任务后会保存。</div>"}
      </aside>
    </div>
  </td></tr></tbody>`;

  moduleTable.querySelectorAll("[data-ai-quick]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = button.dataset.aiQuick;
      moduleTable.querySelector("#aiConsoleTask").value = task;
      moduleTable.querySelector("#aiConsolePrompt").focus();
    });
  });
  moduleTable.querySelectorAll("[data-ai-action]").forEach((button) => {
    button.addEventListener("click", () => handleAiConsoleAction(button.dataset.aiAction, button.dataset.recordId));
  });
}

function renderModuleForm(definition, record) {
  if (activeModuleId === "followups") {
    moduleDetailTitle.textContent = "跟进详情";
    moduleDetailStatus.textContent = "FOLLOW-UP";
    moduleForm.innerHTML = `<div class="empty-state compact">点击“新增跟进”或列表中的“查看/编辑”管理跟进记录。</div>`;
    return;
  }
  moduleDetailTitle.textContent = record ? getModuleRecordTitle(definition, record) : "新增记录";
  moduleDetailStatus.textContent = record?.status || record?.stage || record?.channel || "DETAIL";
  moduleForm.innerHTML = definition.fields
    .filter((field) => !field.hiddenInForm)
    .map((field) => renderModuleField(field, record?.[field.key] || ""))
    .join("");

  if (canUseModuleAttachments(activeModuleId) && record?.id) {
    moduleForm.insertAdjacentHTML(
      "beforeend",
      `<div class="module-special-tools">
        <button class="ghost-btn" id="copyModuleRecordSummaryBtn" type="button">${activeModuleId === "quotes" ? "复制报价内容" : "复制资料说明"}</button>
      </div>`,
    );
    document.querySelector("#copyModuleRecordSummaryBtn")?.addEventListener("click", copyModuleRecordSummary);
    moduleForm.insertAdjacentHTML("beforeend", renderModuleAttachmentManager(activeModuleId, record.id));
    bindModuleAttachmentManager();
  }

  if (activeModuleId === "letters") {
    moduleForm.insertAdjacentHTML(
      "beforeend",
      `<div class="module-draft-tools">
        <button class="ghost-btn" id="generateModuleDraftBtn" type="button">模板生成草稿</button>
        <button class="ghost-btn" id="copyModuleDraftBtn" type="button">复制草稿</button>
      </div>`,
    );
    document.querySelector("#generateModuleDraftBtn").addEventListener("click", generateModuleLetterDraft);
    document.querySelector("#copyModuleDraftBtn").addEventListener("click", copyModuleLetterDraft);
  }

  if (activeModuleId === "prospecting") {
    moduleForm.insertAdjacentHTML(
      "beforeend",
      `<div class="module-special-tools">
        <button class="ghost-btn" id="generateProspectKeywordsBtn" type="button">生成Google关键词</button>
        <button class="ghost-btn" id="checkProspectDuplicateBtn" type="button">重复/黑名单检查</button>
        <button class="ghost-btn" id="transferProspectLeadBtn" type="button">一键转线索</button>
        <button class="primary-btn" id="transferProspectCustomerBtn" type="button">一键转客户</button>
      </div>`,
    );
    document.querySelector("#generateProspectKeywordsBtn").addEventListener("click", generateProspectKeywords);
    document.querySelector("#checkProspectDuplicateBtn").addEventListener("click", checkProspectDuplicate);
    document.querySelector("#transferProspectLeadBtn").addEventListener("click", transferProspectToLead);
    document.querySelector("#transferProspectCustomerBtn").addEventListener("click", transferProspectToCustomer);
  }

  if (activeModuleId === "leads" && record?.id) {
    moduleForm.insertAdjacentHTML(
      "beforeend",
      `<div class="module-special-tools">
        <button class="primary-btn" id="transferLeadCustomerBtn" type="button">转为客户</button>
      </div>`,
    );
    document.querySelector("#transferLeadCustomerBtn")?.addEventListener("click", () => transferLeadToCustomer(record.id));
  }

  if (activeModuleId === "aiAssistant") {
    const customerButtons = renderAiCustomerActionButtons(record);
    moduleForm.insertAdjacentHTML(
      "beforeend",
      `<div class="module-special-tools">
        <button class="primary-btn" id="runAiAssistantBtn" type="button">执行AI任务</button>
        <button class="primary-btn" id="confirmAiAssistantBtn" type="button" ${record?.pendingAction ? "" : "disabled"}>确认保存结果</button>
        <button class="ghost-btn" id="copyAiAssistantOutputBtn" type="button">复制结果</button>
      </div>
      ${customerButtons}`,
    );
    document.querySelector("#runAiAssistantBtn").addEventListener("click", runAiAssistantTask);
    document.querySelector("#confirmAiAssistantBtn").addEventListener("click", confirmAiAssistantAction);
    document.querySelector("#copyAiAssistantOutputBtn").addEventListener("click", copyAiAssistantOutput);
    moduleForm.querySelectorAll("[data-ai-customer-action]").forEach((button) => {
      button.addEventListener("click", () => handleAiCustomerAction(button.dataset.aiCustomerAction, button.dataset.customerId));
    });
  }
}

function renderModuleField(field, value) {
  const required = field.required ? " required" : "";
  if (field.type === "textarea") {
    return `<label>${escapeModuleHtml(field.label)}<textarea name="${field.key}" rows="4"${required}>${escapeModuleHtml(value)}</textarea></label>`;
  }
  if (field.type === "select") {
    return `<label>${escapeModuleHtml(field.label)}<select name="${field.key}"${required}>${(field.options || [])
      .map((option) => `<option ${option === value ? "selected" : ""}>${escapeModuleHtml(option)}</option>`)
      .join("")}</select></label>`;
  }
  return `<label>${escapeModuleHtml(field.label)}<input name="${field.key}" type="${field.type || "text"}" value="${escapeModuleHtml(value)}"${required} /></label>`;
}

function renderModuleAttachmentManager(moduleId, recordId) {
  const files = getModuleAttachments(moduleId, recordId);
  const title = moduleId === "quotes" ? "报价附件" : "本地资料附件";
  return `<section class="module-attachment-manager">
    <div class="module-attachment-head">
      <div>
        <strong>${title}</strong>
        <span>小文件保存到 IndexedDB；大文件只保存元数据，标记为“本地CRM附件”。</span>
      </div>
      <div>
        <button class="ghost-btn" type="button" data-module-attachment-upload>上传附件</button>
        <input type="file" multiple hidden data-module-attachment-input />
      </div>
    </div>
    <div class="module-attachment-list">
      ${files.length ? files.map(renderModuleAttachmentItem).join("") : `<div class="empty-state compact">暂无附件。可上传报价表、PDF、图片、视频、PPT、认证、规格书等资料。</div>`}
    </div>
  </section>`;
}

function renderModuleAttachmentItem(file) {
  const storage = file.storage === "metadata-only" ? "本地CRM元数据" : "IndexedDB本地附件";
  return `<article class="module-attachment-item">
    <div>
      <strong>${escapeModuleHtml(file.name || "附件")}</strong>
      <span>${escapeModuleHtml(formatModuleFileSize(file.size))} · ${escapeModuleHtml(file.type || "unknown")} · ${storage}</span>
      ${file.note ? `<small>备注：${escapeModuleHtml(file.note)}</small>` : ""}
      ${file.tags ? `<small>标签：${escapeModuleHtml(file.tags)}</small>` : ""}
    </div>
    <div class="module-attachment-actions">
      <button class="module-row-btn" type="button" data-module-attachment-action="preview" data-module-attachment-id="${escapeModuleHtml(file.id)}">预览</button>
      <button class="module-row-btn" type="button" data-module-attachment-action="download" data-module-attachment-id="${escapeModuleHtml(file.id)}">下载</button>
      <button class="module-row-btn" type="button" data-module-attachment-action="rename" data-module-attachment-id="${escapeModuleHtml(file.id)}">重命名</button>
      <button class="module-row-btn" type="button" data-module-attachment-action="note" data-module-attachment-id="${escapeModuleHtml(file.id)}">备注/标签</button>
      <button class="module-row-btn" type="button" data-module-attachment-action="copy" data-module-attachment-id="${escapeModuleHtml(file.id)}">复制信息</button>
      <button class="module-row-btn danger" type="button" data-module-attachment-action="delete" data-module-attachment-id="${escapeModuleHtml(file.id)}">删除</button>
    </div>
  </article>`;
}

function bindModuleAttachmentManager() {
  const input = moduleForm.querySelector("[data-module-attachment-input]");
  moduleForm.querySelector("[data-module-attachment-upload]")?.addEventListener("click", () => input?.click());
  input?.addEventListener("change", async (event) => {
    await uploadModuleAttachments(event.target.files, activeModuleId, activeRecordId);
    event.target.value = "";
  });
  moduleForm.querySelectorAll("[data-module-attachment-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.moduleAttachmentId;
      const action = button.dataset.moduleAttachmentAction;
      if (action === "preview") return previewModuleAttachment(id);
      if (action === "download") return downloadModuleAttachment(id);
      if (action === "rename") return renameModuleAttachment(id);
      if (action === "note") return editModuleAttachmentNote(id);
      if (action === "copy") return copyModuleAttachmentInfo(id);
      if (action === "delete") return deleteModuleAttachment(id);
    });
  });
}

async function copyModuleRecordSummary() {
  const definition = moduleDefinitions[activeModuleId];
  const record = getActiveRecord();
  if (!definition || !record) return;
  const lines = definition.fields.filter((field) => !field.hiddenInForm).map((field) => `${field.label}：${record[field.key] || "-"}`);
  const files = getModuleAttachments(activeModuleId, record.id);
  if (files.length) {
    lines.push("");
    lines.push("本地CRM附件：");
    files.forEach((file) => {
      lines.push(`- ${file.name} (${formatModuleFileSize(file.size)}, ${file.storage === "metadata-only" ? "元数据" : "IndexedDB"})`);
    });
  }
  await navigator.clipboard?.writeText(lines.join("\n"));
  notifyModule(activeModuleId === "quotes" ? "报价内容已复制" : "资料说明已复制");
}

function getFilteredModuleRecords() {
  const definition = moduleDefinitions[activeModuleId];
  const keyword = moduleSearchInput.value.trim().toLowerCase();
  const filterValue = moduleFilterSelect.value || "all";
  return (moduleStore[activeModuleId] || []).filter((record) => {
    const text = definition.fields.map((field) => record[field.key]).join(" ").toLowerCase();
    const keywordMatch = !keyword || text.includes(keyword);
    const filterMatch = filterValue === "all" || String(record[definition.filterField] || "") === filterValue;
    return keywordMatch && filterMatch;
  });
}

function selectModuleRecord(id) {
  activeRecordId = id;
  renderActiveModule();
}

function createModuleRecord() {
  if (activeModuleId === "followups") {
    openFollowupModal();
    return;
  }
  const definition = moduleDefinitions[activeModuleId];
  const record = { id: crypto.randomUUID(), createdAt: todayForModule(), updatedAt: todayForModule() };
  definition.fields.forEach((field) => {
    record[field.key] = field.options?.[0] || "";
  });
  moduleStore[activeModuleId].unshift(record);
  activeRecordId = record.id;
  saveModuleStore();
  renderActiveModule();
  notifyModule("已新增记录");
}

function saveModuleRecord(event) {
  event.preventDefault();
  const record = getActiveRecord();
  if (!record) return;
  const values = Object.fromEntries(new FormData(moduleForm).entries());
  Object.assign(record, values, { updatedAt: todayForModule() });
  if (activeModuleId === "followups") syncFollowupRecordToCustomer(record);
  saveModuleStore();
  renderActiveModule();
  notifyModule("已保存");
}

function syncFollowupRecordToCustomer(record) {
  const customer = findFollowupCustomer(record);
  if (!customer?.id) return;
  const cycleDays = parseInt(record.reminderCycle, 10);
  const nextDate = record.nextDate || (Number.isFinite(cycleDays) ? addDaysForModule(todayForModule(), cycleDays) : "");
  customer.followUps = Array.isArray(customer.followUps) ? customer.followUps : [];
  const payload = {
    id: record.id,
    contact: record.contact || customer.contact || "",
    date: record.date || todayForModule(),
    channel: record.channel || "Email",
    followType: record.followType || "",
    summary: record.summary || "",
    feedback: record.feedback || "",
    concerns: record.concerns || "",
    stage: record.stage || customer.stage || "已联系",
    nextAction: record.nextAction || recommendNextAction(customer),
    nextDate,
    reminderCycle: record.reminderCycle || "",
    completed: record.completed || "否",
    result: record.result || "",
    comments: record.comments || "",
    notesList: Array.isArray(record.notesList) ? record.notesList : [],
    materials: Array.isArray(record.materials) ? record.materials : [],
    createdBy: record.createdBy || window.FORYAL_CRM?.getCurrentUser?.()?.name || customer.owner || "Lina",
    updatedBy: record.updatedBy || window.FORYAL_CRM?.getCurrentUser?.()?.name || customer.owner || "Lina",
  };
  const existing = customer.followUps.find((item) => item.id === record.id);
  if (existing) {
    Object.assign(existing, payload);
  } else {
    customer.followUps.unshift(payload);
  }
  customer.nextDate = nextDate || customer.nextDate || "";
  customer.stage = record.stage || customer.stage || "";
  customer.updatedAt = todayForModule();
  window.FORYAL_CRM?.saveCustomers?.();
}

function deleteModuleRecord() {
  if (window.FORYAL_CRM?.getCurrentUser?.()?.role !== "admin") {
    notifyModule("普通用户不能删除系统数据");
    return;
  }
  const record = getActiveRecord();
  if (!record) {
    notifyModule("请选择要删除的记录");
    return;
  }
  const title = getModuleRecordTitle(moduleDefinitions[activeModuleId], record);
  const ok = canUseModuleAttachments(activeModuleId)
    ? confirm(`确认删除「${title}」？相关本地附件索引也会一并删除，但不会影响其他客户资料。`)
    : confirm(`确认删除「${title}」？`);
  if (!ok) return;
  const removedAttachments = getModuleAttachments(activeModuleId, record.id);
  if (removedAttachments.length) {
    moduleAttachments = moduleAttachments.filter((item) => !(item.moduleId === activeModuleId && item.recordId === record.id));
    saveModuleAttachmentIndex();
    removedAttachments.forEach((item) => deleteModuleAttachmentData(item.id));
  }
  moduleStore[activeModuleId] = moduleStore[activeModuleId].filter((item) => item.id !== record.id);
  activeRecordId = moduleStore[activeModuleId][0]?.id || null;
  saveModuleStore();

  // Sync customer.quotes[] when deleting a quote record
  if (activeModuleId === "quotes" && record.customerId) {
    const customers = window.FORYAL_CRM?.getCustomers?.() || [];
    const customer = customers.find((c) => c.id === record.customerId);
    if (customer && Array.isArray(customer.quotes)) {
      customer.quotes = customer.quotes.filter((q) => q.id !== record.id);
      customer.updatedAt = new Date().toISOString().slice(0, 10);
      window.FORYAL_CRM?.saveCustomers?.();
    }
  }

  // Sync customer.followUps[] when deleting a followup record
  if (activeModuleId === "followups") {
    removeFollowupFromCustomer(record);
  }

  renderActiveModule();
  notifyModule("已删除");
}

function deleteSelectedModuleRecords() {
  if (window.FORYAL_CRM?.getCurrentUser?.()?.role !== "admin") {
    notifyModule("普通用户不能删除系统数据");
    return;
  }
  if (!canBatchDeleteActiveModule()) {
    notifyModule("当前模块不支持批量删除");
    return;
  }
  const rows = moduleStore[activeModuleId] || [];
  const selected = rows.filter((record) => moduleSelectedIds.has(record.id));
  if (!selected.length) {
    notifyModule("请先勾选要删除的记录");
    return;
  }
  const attachmentCount = selected.reduce((total, record) => total + getModuleAttachments(activeModuleId, record.id).length, 0);
  const message = attachmentCount
    ? `确定删除选中的 ${selected.length} 条记录吗？相关 ${attachmentCount} 个本地附件索引也会一并删除，但不会影响其他客户资料。`
    : `确定删除选中的 ${selected.length} 条记录吗？`;
  if (!confirm(message)) return;

  const selectedIds = new Set(selected.map((record) => record.id));
  const removedAttachments = moduleAttachments.filter((item) => item.moduleId === activeModuleId && selectedIds.has(item.recordId));
  if (removedAttachments.length) {
    moduleAttachments = moduleAttachments.filter((item) => !(item.moduleId === activeModuleId && selectedIds.has(item.recordId)));
    saveModuleAttachmentIndex();
    removedAttachments.forEach((item) => deleteModuleAttachmentData(item.id));
  }
  moduleStore[activeModuleId] = rows.filter((record) => !selectedIds.has(record.id));
  moduleSelectedIds.clear();
  activeRecordId = moduleStore[activeModuleId][0]?.id || null;
  saveModuleStore();
  renderActiveModule();
  notifyModule(`已删除 ${selected.length} 条记录`);
}

function cleanupCustomerAssociations(customerId, customerEmail, customerCompany) {
  if (!customerId) return;
  // Clean followups in moduleStore
  if (Array.isArray(moduleStore.followups)) {
    moduleStore.followups = moduleStore.followups.filter((item) => {
      if (!item) return false;
      if (item.customerId === customerId) return false;
      const itemCustomer = String(item.customer || "").trim().toLowerCase();
      const email = String(customerEmail || "").trim().toLowerCase();
      const company = String(customerCompany || "").trim().toLowerCase();
      if (email && itemCustomer === email) return false;
      if (company && itemCustomer === company) return false;
      return true;
    });
  }
  // Clean leads in moduleStore that match this customer
  if (Array.isArray(moduleStore.leads)) {
    moduleStore.leads = moduleStore.leads.filter((item) => {
      if (!item) return false;
      const itemCompany = String(item.company || item.name || "").trim().toLowerCase();
      const company = String(customerCompany || "").trim().toLowerCase();
      if (itemCompany && company && itemCompany === company) return false;
      const itemEmail = String(item.email || "").trim().toLowerCase();
      const email = String(customerEmail || "").trim().toLowerCase();
      if (itemEmail && email && itemEmail === email) return false;
      return true;
    });
  }
  // Clean quotes in moduleStore
  if (Array.isArray(moduleStore.quotes)) {
    moduleStore.quotes = moduleStore.quotes.filter((item) => {
      if (!item) return false;
      if (item.customerId === customerId) return false;
      const itemCustomer = String(item.customer || "").trim().toLowerCase();
      const company = String(customerCompany || "").trim().toLowerCase();
      if (company && itemCustomer === company) return false;
      return true;
    });
  }
  // Clean module attachments for this customer's records
  const customerRecordIds = new Set();
  Object.values(moduleStore).forEach((rows) => {
    if (!Array.isArray(rows)) return;
    rows.forEach((row) => {
      if (row && (row.customerId === customerId || String(row.customer || "").trim().toLowerCase() === String(customerCompany || "").trim().toLowerCase())) {
        customerRecordIds.add(row.id);
      }
    });
  });
  if (customerRecordIds.size > 0) {
    moduleAttachments = moduleAttachments.filter((item) => !customerRecordIds.has(item.recordId));
    saveModuleAttachmentIndex();
  }
  saveModuleStore();
}

// Expose for cross-module cleanup
window.FORYAL_CRM = window.FORYAL_CRM || {};
window.FORYAL_CRM.cleanupCustomerAssociations = cleanupCustomerAssociations;

function exportModuleCsv() {
  const definition = moduleDefinitions[activeModuleId];
  const rows = getFilteredModuleRecords();
  const header = definition.fields.map((field) => field.label);
  const csvRows = rows.map((record) => definition.fields.map((field) => record[field.key] || ""));
  downloadModuleCsv(`${definition.title}-${todayForModule()}.csv`, [header, ...csvRows]);
  notifyModule("CSV 已导出");
}

function importModuleCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const definition = moduleDefinitions[activeModuleId];
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseModuleCsv(String(reader.result || ""));
    if (rows.length < 2) {
      notifyModule("CSV 没有可导入的数据");
      return;
    }
    const headers = rows[0].map((item) => item.trim());
    const imported = rows.slice(1).filter((row) => row.some(Boolean)).map((row) => {
      const record = { id: crypto.randomUUID(), createdAt: todayForModule(), updatedAt: todayForModule() };
      definition.fields.forEach((field) => {
        const index = headers.findIndex((header) => header === field.label || header === field.key);
        record[field.key] = index >= 0 ? row[index] || "" : "";
      });
      return record;
    });
    moduleStore[activeModuleId].unshift(...imported);
    activeRecordId = imported[0]?.id || activeRecordId;
    saveModuleStore();
    renderActiveModule();
    notifyModule(`已导入 ${imported.length} 条`);
    moduleImportInput.value = "";
  };
  reader.readAsText(file, "utf-8");
}

function generateModuleLetterDraft() {
  const record = getActiveRecord();
  if (!record) return;
  const body = buildTemplateDraft(record);
  const textarea = moduleForm.elements.body;
  if (textarea) textarea.value = body;
  notifyModule("已生成模板草稿");
}

async function copyModuleLetterDraft() {
  const text = moduleForm.elements.body?.value || "";
  if (!text.trim()) {
    notifyModule("没有可复制的草稿");
    return;
  }
  await navigator.clipboard.writeText(text);
  notifyModule("草稿已复制");
}

function handleProspectWorkspaceAction(action, recordId, query = "") {
  if (recordId) activeRecordId = recordId;
  if (action === "run-search") {
    const keyword = moduleTable.querySelector("#prospectKeywordInput")?.value || "";
    const type = moduleTable.querySelector("#prospectTypeInput")?.value || "";
    runProspectSearchFromWorkspace(keyword, type);
    return;
  }
  if (action === "open-google-current") {
    const keyword = moduleTable.querySelector("#prospectKeywordInput")?.value || "";
    const country = moduleTable.querySelector("#prospectCountryInput")?.value || "";
    openGoogleQuery(`${country} ${keyword}`);
    return;
  }
  if (action === "open-google") {
    openGoogleForProspect(getActiveRecord());
    return;
  }
  if (action === "open-query") {
    openGoogleQuery(query);
    return;
  }
  if (action === "check") {
    checkProspectDuplicate();
    return;
  }
  if (action === "to-lead") {
    transferProspectToLead();
    return;
  }
  if (action === "to-customer") {
    transferProspectToCustomer();
    return;
  }
  if (action === "batch-create") {
    createBatchProspects();
  }
}

function runProspectSearchFromWorkspace(keywordOverride = "", typeOverride = "") {
  const country = moduleTable.querySelector("#prospectCountryInput")?.value?.trim() || "Portugal";
  const keyword = String(keywordOverride || moduleTable.querySelector("#prospectKeywordInput")?.value || "espresso machine importer").trim();
  const customerType = String(typeOverride || moduleTable.querySelector("#prospectTypeInput")?.value || "家电进口商").trim();
  const generated = createGeneratedProspects(country, keyword, customerType);
  moduleStore.prospecting.unshift(...generated);
  activeRecordId = generated[0]?.id || activeRecordId;
  saveModuleStore();
  renderActiveModule();
  notifyModule(`已生成 ${generated.length} 条搜客记录`);
}

function createGeneratedProspects(country, keyword, customerType) {
  const cleanCountry = country || "Target Market";
  const stems = [
    "Home Appliance Imports",
    "Coffee Equipment Trading",
    "Kitchen Retail Group",
    "Espresso Distribution",
    "Private Label Appliances",
  ];
  return stems.map((stem, index) => {
    const candidateCompany = `${cleanCountry} ${stem}`;
    const record = {
      id: crypto.randomUUID(),
      createdAt: todayForModule(),
      updatedAt: todayForModule(),
      searchName: `${cleanCountry} ${keyword}`,
      country: cleanCountry,
      keyword,
      customerType,
      googleKeywords: buildProspectKeywordList(cleanCountry, keyword, customerType).join("\n"),
      candidateCompany,
      website: "",
      email: "",
      score: index <= 1 ? "A" : index <= 3 ? "B" : "C",
      risk: "正常",
      status: "已生成关键词",
      notes: `系统根据 ${cleanCountry} + ${keyword} 生成。请打开Google核实官网、邮箱、采购负责人后再转客户。`,
    };
    record.score = scoreProspect(record);
    return record;
  });
}

function buildProspectKeywordList(country, keyword, type) {
  const englishType = translateProspectType(type);
  return [
    `${country} ${keyword} ${englishType}`,
    `${country} coffee machine importer distributor`,
    `${country} small home appliance brand espresso machine`,
    `site:linkedin.com/in ${country} "category manager" "small appliances"`,
    `site:linkedin.com/company ${country} "${keyword}" importer`,
    `${country} private label espresso machine brand`,
  ];
}

function openGoogleForProspect(record) {
  if (!record) return;
  const firstQuery = String(record.googleKeywords || "").split(/\r?\n/).find(Boolean) || `${record.country || ""} ${record.keyword || record.candidateCompany || ""}`;
  openGoogleQuery(firstQuery);
}

function openGoogleQuery(query) {
  const text = String(query || "").trim();
  if (!text) {
    notifyModule("请输入搜索关键词");
    return;
  }
  window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  notifyModule("已打开Google搜索");
}

function createBatchProspects() {
  const value = moduleTable.querySelector("#prospectBatchInput")?.value || "";
  const names = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!names.length) {
    notifyModule("请先粘贴公司名");
    return;
  }
  const records = names.map((name) => ({
    id: crypto.randomUUID(),
    createdAt: todayForModule(),
    updatedAt: todayForModule(),
    searchName: name,
    country: "",
    keyword: name,
    customerType: "家电进口商",
    googleKeywords: buildProspectKeywordList("", name, "家电进口商").join("\n"),
    candidateCompany: name,
    website: "",
    email: "",
    score: "B",
    risk: window.FORYAL_CRM?.findDuplicate?.({ company: name }) ? "重复客户" : "正常",
    status: "待搜索",
    notes: "批量查询生成，请补充国家、官网、邮箱和联系人。",
  }));
  moduleStore.prospecting.unshift(...records);
  activeRecordId = records[0]?.id || activeRecordId;
  saveModuleStore();
  renderActiveModule();
  notifyModule(`已批量生成 ${records.length} 条记录`);
}

function buildRelationProspectQueries() {
  const customers = window.FORYAL_CRM?.getCustomers?.() || [];
  return customers.slice(0, 6).map((customer) => `${customer.country || ""} ${customer.customerType || customer.segment || "importer"} ${customer.product || "coffee machine"}`.trim()).filter(Boolean);
}

async function handleAiConsoleAction(action, recordId) {
  if (action === "load-record" && recordId) {
    selectModuleRecord(recordId);
    return;
  }
  const task = moduleTable.querySelector("#aiConsoleTask")?.value || "查询客户";
  const input = moduleTable.querySelector("#aiConsolePrompt")?.value || "";
  const record = {
    id: crypto.randomUUID(),
    createdAt: todayForModule(),
    updatedAt: todayForModule(),
    task,
    customer: extractCompanyFromPrompt(input),
    product: inferProductFromText(input),
    input,
    output: "",
    status: "草稿",
  };
  const result = buildAiAssistantResult(record);
  record.output = await maybeEnhanceAiOutput(record, result.output);
  record.pendingAction = result.action ? JSON.stringify(result.action) : "";
  record.resultCustomerIds = (result.customerIds || []).join(",");
  record.status = result.action ? "待确认" : "已完成";
  moduleStore.aiAssistant.unshift(record);
  activeRecordId = record.id;
  saveModuleStore();
  renderActiveModule();
  notifyModule(result.action ? "已生成预览，请确认后保存" : "AI助手已生成结果");
}

function maybeCreateCustomerFromAiPrompt(record) {
  const company = record.customer || extractCompanyFromPrompt(record.input);
  if (!company || window.FORYAL_CRM?.findDuplicate?.({ company })) return;
  window.FORYAL_CRM?.addCustomer?.({
    company,
    country: extractCountryFromPrompt(record.input),
    customerType: "进口商",
    product: record.product,
    source: "AI助手",
    notes: `AI助手创建：${record.input}`,
  });
}

function extractCompanyFromPrompt(text) {
  const source = String(text || "");
  const match = source.match(/(?:公司|company|客户)[:：]\s*([^\n,，]+)/i);
  if (match) return match[1].trim();
  return source.split(/\r?\n/).map((line) => line.trim()).find((line) => /ltd|inc|gmbh|s\.a\.|co\.|公司|group|trading/i.test(line)) || "";
}

function extractCountryFromPrompt(text) {
  const source = String(text || "");
  const match = source.match(/(?:国家|country)[:：]\s*([^\n,，]+)/i);
  if (match) return match[1].trim();
  const known = ["Portugal", "Germany", "Spain", "Italy", "France", "UAE", "Brazil", "Chile", "Paraguay", "Sweden", "Israel"];
  return known.find((country) => source.toLowerCase().includes(country.toLowerCase())) || "";
}

function inferProductFromText(text) {
  const source = String(text || "").toLowerCase();
  if (source.includes("1600") || source.includes("tft")) return "CM-1600B";
  if (source.includes("1302")) return "CM-1302MYC";
  if (source.includes("skd")) return "SKD Project";
  if (source.includes("ckd")) return "CKD Project";
  if (source.includes("private")) return "Private Label Project";
  if (source.includes("oem")) return "OEM Project";
  return "CM-1700MY";
}

function generateProspectKeywords() {
  const record = getActiveRecord();
  if (!record) return;
  const values = getModuleFormValues();
  Object.assign(record, values);
  const country = record.country || "target country";
  const keyword = record.keyword || "espresso machine";
  const type = record.customerType || "家电进口商";
  const keywords = buildProspectKeywordList(country, keyword, type);
  record.googleKeywords = keywords.join("\n");
  record.score = scoreProspect(record);
  record.status = "已生成关键词";
  record.notes = appendLine(record.notes, `关键词已生成：优先排查官网、LinkedIn采购/品类负责人、是否有咖啡机品类。`);
  record.updatedAt = todayForModule();
  saveModuleStore();
  renderActiveModule();
  notifyModule("Google关键词已生成");
}

function checkProspectDuplicate() {
  const record = getActiveRecord();
  if (!record) return;
  Object.assign(record, getModuleFormValues());
  const duplicate = window.FORYAL_CRM?.findDuplicate?.(record);
  const nameText = `${record.candidateCompany || ""} ${record.website || ""}`.toLowerCase();
  const isBigBrand = BIG_BRAND_KEYWORDS.some((brand) => nameText.includes(brand));
  const wantsCredit = /oa|60|90|120|credit|账期/i.test(`${record.notes || ""} ${record.keyword || ""}`);
  if (duplicate?.isBlacklisted === "是") {
    record.risk = "黑名单";
    record.status = "排除";
    record.notes = appendLine(record.notes, `发现黑名单客户：${duplicate.company}`);
  } else if (duplicate) {
    record.risk = "重复客户";
    record.notes = appendLine(record.notes, `发现CRM已有客户：${duplicate.company}`);
  } else if (isBigBrand) {
    record.risk = "国际大牌排除";
    record.status = "排除";
    record.notes = appendLine(record.notes, "命中国际大牌关键词，当前阶段不作为开发重点。");
  } else if (wantsCredit) {
    record.risk = "OA风险提示";
    record.notes = appendLine(record.notes, "资料中出现OA/账期风险关键词，后续报价前需确认付款条款。");
  } else {
    record.risk = "正常";
    record.notes = appendLine(record.notes, "未发现重复、黑名单或大牌排除风险。");
  }
  record.score = scoreProspect(record);
  record.updatedAt = todayForModule();
  saveModuleStore();
  renderActiveModule();
  notifyModule("检查已完成");
}

function transferProspectToLead() {
  const record = getActiveRecord();
  if (!record) return;
  Object.assign(record, getModuleFormValues());
  const lead = buildProspectTradeRecord(record);
  lead.stage = "新线索";
  moduleStore.leads = Array.isArray(moduleStore.leads) ? moduleStore.leads : [];
  moduleStore.leads.unshift({ id: crypto.randomUUID(), createdAt: todayForModule(), updatedAt: todayForModule(), ...lead });
  record.status = "已转线索";
  record.updatedAt = todayForModule();
  saveModuleStore();
  renderActiveModule();
  notifyModule("已转入线索");
}

function transferProspectToCustomer() {
  const record = getActiveRecord();
  if (!record) return;
  Object.assign(record, getModuleFormValues());
  const duplicate = window.FORYAL_CRM?.findDuplicate?.(record);
  if (duplicate) {
    record.risk = duplicate.isBlacklisted === "是" ? "黑名单" : "重复客户";
    record.notes = appendLine(record.notes, `未转客户：CRM已存在 ${duplicate.company}`);
    saveModuleStore();
    renderActiveModule();
    notifyModule("发现重复客户，已停止转入");
    return;
  }
  const customer = window.FORYAL_CRM?.addCustomer?.(buildProspectTradeRecord(record));
  if (!customer) {
    notifyModule("客户模块未就绪");
    return;
  }
  record.status = "已转客户";
  record.updatedAt = todayForModule();
  saveModuleStore();
  renderActiveModule();
  notifyModule("已转入客户");
}

function transferLeadToCustomer(recordId = activeRecordId) {
  const record = (moduleStore.leads || []).find((item) => item.id === recordId);
  if (!record) {
    notifyModule("请选择要转为客户的线索");
    return;
  }
  if (record.id === activeRecordId) Object.assign(record, getModuleFormValues());
  const payload = buildLeadCustomerRecord(record);
  const duplicate = window.FORYAL_CRM?.findDuplicate?.(payload);
  if (duplicate) {
    record.notes = appendLine(record.notes || "", `未转客户：CRM 已存在 ${duplicate.company || duplicate.email || "重复客户"}`);
    record.updatedAt = todayForModule();
    saveModuleStore();
    renderActiveModule();
    notifyModule("发现重复客户，已停止转入");
    return;
  }
  const customer = window.FORYAL_CRM?.addCustomer?.(payload);
  if (!customer) {
    notifyModule("客户模块暂时不可用，未能转入");
    return;
  }
  record.stage = "已转客户";
  record.convertedCustomerId = customer.id;
  record.updatedAt = todayForModule();
  record.notes = appendLine(record.notes || "", `已转入客户：${customer.company || payload.company}`);
  saveModuleStore();
  renderActiveModule();
  notifyModule("线索已转为客户");
}

async function runAiAssistantTask() {
  const record = getActiveRecord();
  if (!record) return;
  Object.assign(record, getModuleFormValues());
  const result = buildAiAssistantResult(record);
  record.output = await maybeEnhanceAiOutput(record, result.output);
  record.pendingAction = result.action ? JSON.stringify(result.action) : "";
  record.resultCustomerIds = (result.customerIds || []).join(",");
  record.status = result.action ? "待确认" : "已完成";
  record.updatedAt = todayForModule();
  saveModuleStore();
  renderActiveModule();
  notifyModule(result.action ? "已生成预览，请确认后保存" : "AI任务已完成");
}

async function copyAiAssistantOutput() {
  const text = moduleForm.elements.output?.value || "";
  if (!text.trim()) {
    notifyModule("没有可复制的结果");
    return;
  }
  await navigator.clipboard.writeText(text);
  const record = getActiveRecord();
  if (record) {
    record.status = "已复制";
    saveModuleStore();
  }
  notifyModule("结果已复制");
}

function renderAiCustomerActionButtons(record = {}) {
  const ids = String(record.resultCustomerIds || "").split(",").filter(Boolean).slice(0, 8);
  if (!ids.length) return "";
  const customers = window.FORYAL_CRM?.getCustomers?.() || [];
  return `<div class="ai-result-actions">
    <strong>匹配客户动作</strong>
    ${ids.map((id) => {
      const customer = customers.find((item) => item.id === id);
      if (!customer) return "";
      return `<article>
        <span>${escapeModuleHtml(customer.company || customer.email || id)}</span>
        <button class="ghost-btn" type="button" data-ai-customer-action="view" data-customer-id="${escapeModuleHtml(id)}">查看客户</button>
        <button class="ghost-btn" type="button" data-ai-customer-action="follow" data-customer-id="${escapeModuleHtml(id)}">一键创建跟进</button>
        <a class="ghost-btn" href="${escapeModuleHtml(buildComposeUrlForCustomer(customer, "followup"))}" target="_blank" rel="noreferrer">生成邮件</a>
      </article>`;
    }).join("")}
  </div>`;
}

function handleAiCustomerAction(action, customerId) {
  if (action === "view") {
    window.FORYAL_CRM?.selectCustomer?.(customerId);
    return;
  }
  if (action === "follow") {
    const customer = (window.FORYAL_CRM?.getCustomers?.() || []).find((item) => item.id === customerId);
    const days = customer?.priority === "A" ? 7 : 10;
    window.FORYAL_CRM?.addFollowUp?.(customerId, {
      channel: "Email",
      summary: "AI助手创建跟进任务",
      stage: customer?.stage || "已联系",
      nextAction: `${days}天内再次联系客户，确认目录、报价或样品反馈`,
      nextDate: addDaysForModule(todayForModule(), days),
    });
    notifyModule("已创建跟进记录");
  }
}

function confirmAiAssistantAction() {
  const record = getActiveRecord();
  if (!record?.pendingAction) {
    notifyModule("当前任务没有待保存动作");
    return;
  }
  let action = null;
  try {
    action = JSON.parse(record.pendingAction);
  } catch {
    notifyModule("待保存动作格式异常");
    return;
  }
  const ok = confirm(`确认执行：${action.label || action.type || "保存AI结果"}？`);
  if (!ok) return;
  const result = applyAiAssistantAction(action);
  record.pendingAction = "";
  record.status = result?.ok ? "已保存" : "保存失败";
  record.updatedAt = todayForModule();
  saveModuleStore();
  renderActiveModule();
  notifyModule(result?.message || (result?.ok ? "已保存" : "保存失败"));
}

function applyAiAssistantAction(action) {
  if (action.type === "createCustomer") {
    const customer = window.FORYAL_CRM?.addCustomer?.(action.payload);
    return { ok: Boolean(customer), message: customer ? "客户已保存到客户列表" : "客户保存失败" };
  }
  if (action.type === "createLead") {
    moduleStore.leads = Array.isArray(moduleStore.leads) ? moduleStore.leads : [];
    moduleStore.leads.unshift({ id: crypto.randomUUID(), createdAt: todayForModule(), updatedAt: todayForModule(), ...action.payload });
    saveModuleStore();
    return { ok: true, message: "线索已保存" };
  }
  if (action.type === "addFollowUp") {
    const follow = window.FORYAL_CRM?.addFollowUp?.(action.customerId, action.payload);
    return { ok: Boolean(follow), message: follow ? "跟进记录已保存" : "跟进保存失败" };
  }
  if (action.type === "mailDraft") {
    const draft = window.FORYAL_CRM?.addMailDraft?.(action.payload);
    return { ok: Boolean(draft), message: draft ? "邮件草稿已保存到草稿箱" : "草稿保存失败" };
  }
  if (action.type === "appendNote") {
    const customer = window.FORYAL_CRM?.appendCustomerNote?.(action.customerId, action.title, action.body);
    return { ok: Boolean(customer), message: customer ? "摘要已保存到客户备注" : "备注保存失败" };
  }
  if (action.type === "updateCustomer") {
    const customer = window.FORYAL_CRM?.updateCustomer?.(action.customerId, action.patch);
    return { ok: Boolean(customer), message: customer ? "客户字段已更新" : "客户更新失败" };
  }
  return { ok: false, message: "未知保存动作" };
}

function buildAiAssistantOutput(record) {
  return buildAiAssistantResult(record).output;
}

function buildAiAssistantResult(record) {
  const customers = window.FORYAL_CRM?.getCustomers?.() || [];
  const keyword = String(record.customer || record.input || "").trim().toLowerCase();
  const matched = keyword ? customers.filter((customer) => `${customer.company} ${customer.email} ${customer.country} ${customer.product}`.toLowerCase().includes(keyword)).slice(0, 6) : [];
  const target = matched[0] || { company: record.customer || "目标客户", country: "目标市场", customerType: "进口商", product: record.product || "CM-1700MY", priority: "B", paymentRisk: "未知" };
  const input = record.input || "";
  const product = record.product || target.product || "CM-1700MY";
  const customerIds = matched.map((customer) => customer.id);

  if (record.task === "查询客户") {
    return {
      output: matched.length
        ? matched.map((customer, index) => `${index + 1}. ${customer.company} · ${customer.country || "-"} · ${customer.contact || "-"} · ${customer.email || "-"} · ${customer.product || "-"} · 负责人：${customer.owner || "-"}`).join("\n")
        : "未找到匹配客户。可换公司名、邮箱域名、国家或产品关键词再查。",
      customerIds,
    };
  }

  if (record.task === "创建客户") {
    const payload = parseAiCustomerPayload(record);
    return {
      output: formatActionPreview("创建客户预览", payload, ["company", "country", "contact", "email", "whatsapp", "website", "customerType", "product", "owner", "notes"]),
      action: { type: "createCustomer", label: `创建客户 ${payload.company}`, payload },
      customerIds,
    };
  }

  if (record.task === "创建线索") {
    const payload = {
      company: record.customer || extractCompanyFromPrompt(input) || "AI生成线索",
      country: extractCountryFromPrompt(input),
      website: extractWebsiteFromText(input),
      source: extractSourceFromText(input) || "AI助手",
      keyword: input.slice(0, 80),
      product,
      grade: "B",
      stage: "新线索",
      notes: input || "AI助手创建线索",
    };
    return {
      output: formatActionPreview("创建线索预览", payload, ["company", "country", "website", "source", "keyword", "product", "grade", "notes"]),
      action: { type: "createLead", label: `创建线索 ${payload.company}`, payload },
    };
  }

  if (record.task === "生成今日跟进计划") {
    const buckets = getAiFollowupBuckets(customers);
    const output = [
      "今日跟进计划",
      "",
      `今日到期：${buckets.due.length} 个`,
      ...buckets.due.slice(0, 8).map(formatAiCustomerLine),
      "",
      `已逾期：${buckets.overdue.length} 个`,
      ...buckets.overdue.slice(0, 8).map(formatAiCustomerLine),
      "",
      `未来7天：${buckets.next7.length} 个`,
      ...buckets.next7.slice(0, 8).map(formatAiCustomerLine),
      "",
      "建议动作：优先A类客户、报价后未回复、样品测试中的客户；每次跟进后保存下一次提醒日期。",
    ].join("\n");
    return { output, customerIds: [...buckets.overdue, ...buckets.due, ...buckets.next7].map((customer) => customer.id).filter(Boolean).slice(0, 8) };
  }

  if (record.task === "找30天未跟进客户") {
    const dormant = customers.filter((customer) => {
      const last = getLastFollowDateForModule(customer);
      if (!last) return true;
      return Math.floor((new Date(todayForModule()) - new Date(last)) / 86400000) >= 30;
    }).slice(0, 20);
    return {
      output: dormant.length ? dormant.map((customer) => `${formatAiCustomerLine(customer)} · 建议：${recommendNextAction(customer)}`).join("\n") : "没有发现30天未跟进客户。",
      customerIds: dormant.map((customer) => customer.id),
    };
  }

  if (record.task === "生成跟进建议") {
    const advice = buildFollowupAdvice(target, input);
    const payload = {
      channel: "Email",
      summary: advice.summary,
      feedback: "",
      concerns: advice.concerns,
      stage: target.stage || "已联系",
      nextAction: advice.nextAction,
      nextDate: addDaysForModule(todayForModule(), target.priority === "A" ? 7 : 10),
    };
    return {
      output: formatActionPreview("跟进建议预览", payload, ["summary", "concerns", "stage", "nextAction", "nextDate"]),
      action: target.id ? { type: "addFollowUp", label: `保存 ${target.company} 的跟进记录`, customerId: target.id, payload } : null,
      customerIds,
    };
  }

  if (record.task === "生成邮件草稿") {
    const draft = buildAiEmailDraft(target, product, input);
    return {
      output: `邮件草稿预览\nTo：${target.email || "请补充邮箱"}\nSubject：${draft.subject}\n\n${draft.body}`,
      action: { type: "mailDraft", label: `保存邮件草稿给 ${target.company}`, payload: { ...draft, to: target.email || "", customerId: target.id || "", company: target.company, country: target.country } },
      customerIds,
    };
  }

  if (record.task === "生成WhatsApp话术") {
    return {
      output: `WhatsApp话术：\n${buildWhatsappScript(target, product)}`,
      customerIds,
    };
  }

  if (record.task === "总结客户历史") {
    const summary = buildCustomerHistorySummary(target);
    return {
      output: summary,
      action: target.id ? { type: "appendNote", label: `保存 ${target.company} 历史摘要到备注`, customerId: target.id, title: "AI客户历史总结", body: summary } : null,
      customerIds,
    };
  }

  if (record.task === "判断客户价值") {
    const grade = gradeCustomerValue(target);
    return {
      output: `客户价值判断：${grade}\n公司：${target.company}\n理由：${explainCustomerGrade(target, grade)}\n建议：${grade === "A" ? "7天内优先跟进，并结合Email+LinkedIn/WhatsApp双触达。" : grade === "B" ? "用模板筛选真实需求，确认产品线和付款方式。" : "低频维护，避免投入过多销售时间。"}`,
      action: target.id ? { type: "updateCustomer", label: `更新客户等级为 ${grade}`, customerId: target.id, patch: { priority: grade } } : null,
      customerIds,
    };
  }

  if (record.task === "判断付款风险") {
    const risk = judgePaymentRisk(target, input);
    return {
      output: `付款风险：${risk}\n建议：${risk === "TT" ? "可按常规TT推进，仍需首单控制风险。" : "建议坚持30% deposit + 70% before shipment，避免OA/账期/寄售作为首单条件。"}`,
      action: target.id ? { type: "updateCustomer", label: `更新付款风险为 ${risk}`, customerId: target.id, patch: { paymentRisk: risk } } : null,
      customerIds,
    };
  }

  if (record.task === "推荐产品") {
    const recommended = recommendProductForCustomer(target, input) || product;
    return {
      output: `推荐产品：${recommended}\n理由：${target.customerType || target.segment || "客户类型待确认"}，${target.country || "目标市场"}，适合用${recommended}作为切入点，并根据客户渠道补充OEM / Private Label / SKD / CKD方案。`,
      action: target.id ? { type: "updateCustomer", label: `更新推荐产品为 ${recommended}`, customerId: target.id, patch: { product: recommended } } : null,
      customerIds,
    };
  }

  if (record.task === "生成社媒内容") {
    return {
      output: `LinkedIn内容草稿：\nFORYAL supports coffee machine OEM/ODM projects for appliance brands, importers and retail channels. For buyers reviewing ${product}, we can provide factory-direct model options, packaging support, export documents and SKD/CKD discussion.\n\n#CoffeeMachine #OEM #PrivateLabel #HomeAppliances`,
      customerIds,
    };
  }

  if (record.task === "创建客户") {
    return `可创建客户字段：\n公司名称：${record.customer || "请填写公司名"}\n国家：\n客户类型：进口商\n推荐产品：${record.product}\n客户级别：B\n付款风险：未知\n备注：${input || "从AI助手草稿创建，保存前请补充官网、邮箱和联系人。"}`;
  }
  if (record.task === "创建线索") {
    const lead = {
      id: crypto.randomUUID(),
      createdAt: todayForModule(),
      updatedAt: todayForModule(),
      company: record.customer || extractCompanyFromPrompt(input) || "AI生成线索",
      country: extractCountryFromPrompt(input),
      contact: "",
      product: record.product || "CM-1700MY",
      grade: "B",
      stage: "新线索",
      notes: input || "AI助手创建线索",
    };
    moduleStore.leads.unshift(lead);
    return `已创建线索：${lead.company}\n国家：${lead.country || "待补充"}\n推荐产品：${lead.product}\n下一步：补充官网、邮箱、LinkedIn和采购联系人后转客户。`;
  }
  if (record.task === "查询客户") {
    return matched.length
      ? matched.map((customer) => `${customer.company} · ${customer.country || "-"} · ${customer.contact || "-"} · ${customer.email || "-"} · ${customer.product || "-"}`).join("\n")
      : "未找到匹配客户。可换公司名、邮箱域名、国家或产品关键词再查。";
  }
  if (record.task === "生成今日跟进计划") {
    const due = customers
      .filter((customer) => customer.nextDate && customer.nextDate <= todayForModule())
      .sort((a, b) => String(a.nextDate).localeCompare(String(b.nextDate)))
      .slice(0, 10);
    const hot = customers.filter((customer) => customer.priority === "A" && customer.email).slice(0, 10);
    return [`今日优先跟进：`, ...due.map((customer) => `- ${customer.company}：${customer.nextDate} · ${customer.product || ""} · ${customer.email || ""}`), "", "A类客户补充检查：", ...hot.map((customer) => `- ${customer.company} · ${customer.country || ""} · ${customer.product || ""}`)].join("\n") || "暂无到期客户。";
  }
  if (record.task === "找30天未跟进客户") {
    const dormant = customers
      .filter((customer) => {
        const last = getLastFollowDateForModule(customer);
        if (!last) return true;
        return Math.floor((new Date(todayForModule()) - new Date(last)) / 86400000) >= 30;
      })
      .slice(0, 20);
    return dormant.length
      ? dormant.map((customer) => `- ${customer.company} · ${customer.country || "-"} · 上次跟进：${getLastFollowDateForModule(customer) || "无"} · 建议：${recommendNextAction(customer)}`).join("\n")
      : "没有发现30天未跟进客户。";
  }
  if (record.task === "判断付款风险") {
    return `付款风险判断：${target.paymentRisk || "未知"}\n建议：首次合作坚持 TT 或 30% deposit + 70% before shipment；遇到OA、60/90/120天账期、寄售要求时，先做信用调查并控制样品/首单规模。`;
  }
  if (record.task === "推荐产品") {
    return `推荐产品：${target.product || record.product || "CM-1700MY"}\n理由：${target.customerType || "进口商"}适合先从中高端咖啡机平台切入，再根据品牌定位扩展 OEM / Private Label / SKD / CKD。`;
  }
  if (record.task === "总结客户历史" || record.task === "总结历史跟进") {
    const follows = (target.followUps || []).slice(0, 5).map((item) => `- ${item.date || ""} ${item.channel || ""}：${item.summary || item.nextStep || ""}`);
    return `客户历史摘要：\n${target.company}\n${follows.length ? follows.join("\n") : "暂无跟进记录"}\n下一步：确认是否看过目录/报价，补充MOQ、认证和交期。`;
  }
  if (record.task === "总结历史邮件") {
    const state = window.FORYAL_CRM?.getMailState?.() || {};
    const email = String(target.email || "").toLowerCase();
    const mails = ["inbox", "sent", "drafts"].flatMap((box) => (state[box] || []).filter((mail) => `${mail.to || ""} ${mail.from || ""} ${mail.cc || ""}`.toLowerCase().includes(email))).slice(0, 8);
    return mails.length
      ? mails.map((mail) => `- ${mail.date || ""} ${mail.subject || "(No subject)"}：${(mail.snippet || mail.body || "").slice(0, 160)}`).join("\n")
      : "未找到该客户的本地历史邮件。";
  }
  if (record.task === "判断客户价值") {
    return `客户价值：${target.priority || "B"}\n判断依据：国家/渠道、是否有邮箱和社媒、推荐产品匹配度、付款风险。\n建议：A类客户优先邮件+LinkedIn双线跟进；B类客户先用模板筛选需求；C类客户进入低频跟进。`;
  }
  if (record.task === "生成WhatsApp话术") {
    return `Hi ${target.contact || "there"}, this is Lina from FORYAL, a coffee machine OEM/ODM factory in China. I prepared a short recommendation for ${target.product || record.product}. May I send you the catalogue and FOB range for review?`;
  }
  if (record.task === "生成社媒帖子") {
    return `LinkedIn post draft:\nFORYAL is supporting appliance importers and private label brands with espresso machine platforms such as ${record.product}. For buyers reviewing OEM, certification, MOQ and stable delivery, we can provide concise product specifications and factory options.`;
  }
  if (record.task === "生成客户开发建议") {
    return `开发建议：\n1. 开场引用客户国家/渠道/职位，不要群发。\n2. 主推 ${target.product || record.product}，同时保留 OEM / Private Label / SKD / CKD 选项。\n3. 第一次只要求客户查看2-3页资料或FOB范围。\n4. 7-10天后跟进，重点问目录、认证、MOQ、样品。`;
  }
  return buildTemplateDraft({
    customerType: target.customerType || "进口商",
    product: target.product || record.product,
    channel: record.task === "生成跟进邮件" ? "Email" : "Email",
    notes: input,
  });
}

function parseAiCustomerPayload(record) {
  const input = record.input || "";
  return {
    company: record.customer || extractCompanyFromPrompt(input) || "AI创建客户",
    country: extractCountryFromPrompt(input),
    contact: extractNamedValue(input, ["联系人", "contact", "name"]),
    email: extractEmailFromText(input),
    whatsapp: extractPhoneFromText(input),
    website: extractWebsiteFromText(input),
    customerType: extractNamedValue(input, ["客户类型", "type"]) || "进口商",
    segment: extractNamedValue(input, ["客户类型", "type"]) || "进口商",
    product: record.product || inferProductFromText(input),
    owner: extractNamedValue(input, ["负责人", "owner"]) || window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
    priority: "B",
    paymentRisk: judgePaymentRisk({}, input),
    source: "AI助手",
    notes: input || "AI助手创建，待补充官网、社媒和采购联系人。",
  };
}

function formatActionPreview(title, payload, keys) {
  return [title, ...keys.map((key) => `${fieldLabel(key)}：${payload[key] || "-"}`)].join("\n");
}

function fieldLabel(key) {
  const map = {
    company: "公司名称",
    country: "国家",
    contact: "联系人",
    email: "邮箱",
    whatsapp: "WhatsApp",
    website: "官网",
    customerType: "客户类型",
    product: "推荐产品",
    owner: "负责人",
    notes: "备注",
    source: "来源",
    keyword: "关键词",
    grade: "等级",
    summary: "跟进内容",
    concerns: "客户关心点",
    stage: "当前阶段",
    nextAction: "下一步动作",
    nextDate: "下次跟进",
  };
  return map[key] || key;
}

function getAiFollowupBuckets(customers) {
  const today = todayForModule();
  const next7Limit = addDaysForModule(today, 7);
  const overdue = [];
  const due = [];
  const next7 = [];
  customers.forEach((customer) => {
    const nextDate = getNextDateForModule(customer);
    if (!nextDate) return;
    if (nextDate < today) overdue.push(customer);
    else if (nextDate === today) due.push(customer);
    else if (nextDate <= next7Limit) next7.push(customer);
  });
  return { overdue, due, next7 };
}

function formatAiCustomerLine(customer) {
  return `- ${customer.company} · ${customer.contact || "-"} · ${customer.country || "-"} · ${customer.priority || "-"} · ${customer.stage || "-"} · ${getNextDateForModule(customer) || "未安排"} · ${customer.product || "-"}`;
}

function buildFollowupAdvice(customer, input = "") {
  const text = `${customer.stage || ""} ${customer.notes || ""} ${input}`.toLowerCase();
  const concerns = [];
  if (/price|fob|报价|价格/.test(text)) concerns.push("FOB/价格");
  if (/moq|起订/.test(text)) concerns.push("MOQ");
  if (/sample|样品/.test(text)) concerns.push("样品测试");
  if (/cert|ce|gs|lfgb|认证/.test(text)) concerns.push("认证文件");
  if (!concerns.length) concerns.push("型号匹配、MOQ、FOB、认证");
  return {
    summary: `根据AI助手建议跟进 ${customer.product || "咖啡机项目"}`,
    concerns: concerns.join("、"),
    nextAction: recommendNextAction(customer),
  };
}

function buildAiEmailDraft(customer, product, input = "") {
  const contact = customer.contact || "there";
  const company = customer.company || "your team";
  const angle = input || customer.notes || "your appliance or coffee equipment channel";
  return {
    subject: `${product} options for ${company}`,
    body: `Hi ${contact},\n\nI reviewed ${company}'s profile and ${angle.slice(0, 140)}.\n\nFORYAL is a coffee machine OEM/ODM factory in China. For ${customer.customerType || customer.segment || "importers and appliance brands"}, we can support ${product}, private label packaging, export documents, and SKD/CKD discussion.\n\nWould it be useful if I send 2-3 suitable models with key specifications, MOQ and FOB reference for your review?\n\nBest regards,\nLina Mei\nDemo Export Company`,
    bodyHtml: "",
  };
}

function buildWhatsappScript(customer, product) {
  return `Hi ${customer.contact || "there"}, this is Lina from FORYAL, a coffee machine OEM/ODM factory in China. Based on ${customer.company || "your company"}'s market, I think ${product} may be worth a quick review. May I send you 2-3 suitable models with MOQ and FOB range?`;
}

function buildCustomerHistorySummary(customer) {
  const follows = (customer.followUps || []).slice(0, 6).map((item) => `- ${item.date || ""} ${item.channel || ""}：${item.summary || item.nextAction || item.nextStep || ""}`);
  const drafts = (customer.drafts || []).slice(0, 5).map((item) => `- 草稿 ${item.date || ""}：${item.subject || ""}`);
  return [
    `客户：${customer.company || "-"}`,
    `国家：${customer.country || "-"}`,
    `阶段：${customer.stage || "-"}`,
    `推荐产品：${customer.product || "-"}`,
    "历史跟进：",
    follows.length ? follows.join("\n") : "- 暂无跟进记录",
    "邮件草稿/历史：",
    drafts.length ? drafts.join("\n") : "- 暂无邮件草稿",
    `下一步建议：${recommendNextAction(customer)}`,
  ].join("\n");
}

function gradeCustomerValue(customer) {
  let score = 0;
  const text = `${customer.customerType || ""} ${customer.segment || ""} ${customer.country || ""} ${customer.product || ""} ${customer.email || ""} ${customer.website || ""}`.toLowerCase();
  if (/品牌|进口|批发|连锁|咖啡|brand|import|distributor|retail|coffee/.test(text)) score += 2;
  if (customer.email) score += 1;
  if (customer.website || customer.linkedin) score += 1;
  if (/cm-1700|cm-1600|oem|private|skd|ckd|咖啡/.test(text)) score += 1;
  if (/oa|60|90|120|寄售/.test(customer.paymentRisk || "")) score -= 2;
  if (score >= 4) return "A";
  if (score >= 2) return "B";
  return "C";
}

function explainCustomerGrade(customer, grade) {
  if (grade === "A") return "客户类型、联系方式和产品匹配度较高，适合优先开发。";
  if (grade === "B") return "具备开发可能，但需要补充官网、采购联系人、产品线或付款方式。";
  return "现有资料较弱或付款风险偏高，建议低频维护。";
}

function judgePaymentRisk(customer = {}, input = "") {
  const text = `${customer.paymentRisk || ""} ${customer.notes || ""} ${input}`.toLowerCase();
  if (/寄售|consign/.test(text)) return "寄售风险";
  if (/120|90|60|credit|账期/.test(text)) return "60/90/120 days credit风险";
  if (/\boa\b|open account/.test(text)) return "OA风险";
  if (/30%|deposit|70%|before shipment/.test(text)) return "30% deposit + 70% before shipment";
  if (/\btt\b|t\/t|电汇/.test(text)) return "TT";
  return "未知";
}

function recommendProductForCustomer(customer = {}, input = "") {
  const text = `${customer.customerType || ""} ${customer.segment || ""} ${customer.country || ""} ${customer.notes || ""} ${input}`.toLowerCase();
  if (/skd/.test(text)) return "SKD Project";
  if (/ckd/.test(text)) return "CKD Project";
  if (/private|label|品牌|brand/.test(text)) return "Private Label Project";
  if (/premium|高端|tft/.test(text)) return "CM-1600B";
  if (/grinder|磨豆|bean/.test(text)) return "CM-1700MY";
  if (/entry|入门|basic/.test(text)) return "CM-1302MYC";
  return customer.product || "CM-1700MY";
}

function extractNamedValue(text, labels) {
  const source = String(text || "");
  for (const label of labels) {
    const match = source.match(new RegExp(`${label}\\s*[:：]\\s*([^\\n,，;；]+)`, "i"));
    if (match) return match[1].trim();
  }
  return "";
}

function extractEmailFromText(text) {
  return String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
}

function extractPhoneFromText(text) {
  return String(text || "").match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || "";
}

function extractWebsiteFromText(text) {
  return String(text || "").match(/https?:\/\/[^\s,，)）]+/i)?.[0] || "";
}

function extractSourceFromText(text) {
  if (/linkedin/i.test(text)) return "LinkedIn";
  if (/instagram/i.test(text)) return "Instagram";
  if (/facebook/i.test(text)) return "Facebook";
  if (/google/i.test(text)) return "Google";
  if (/展会|fair|exhibition/i.test(text)) return "展会";
  return "AI助手";
}

async function maybeEnhanceAiOutput(record, localOutput) {
  const settings = getAiSettingsForModule();
  if (!settings.apiKey || settings.provider === "template" || location.protocol === "file:") return localOutput;
  if (!["生成邮件草稿", "生成跟进建议", "总结客户历史", "生成WhatsApp话术", "判断客户价值", "判断付款风险", "推荐产品"].includes(record.task)) return localOutput;
  try {
    const response = await fetch("/api/ai-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model,
        task: record.task,
        input: record.input,
        customer: record.customer,
        product: record.product,
        localOutput,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.output) return localOutput;
    return `${result.output}\n\n---\n本地规则校验：\n${localOutput}`;
  } catch {
    return localOutput;
  }
}

function getAiSettingsForModule() {
  try {
    const settings = JSON.parse(localStorage.getItem("coffee-machine-crm-ai-settings-v1") || "null") || {};
    return {
      provider: settings.provider || "template",
      apiKey: settings.apiKey || "",
      baseUrl: settings.baseUrl || "https://api.deepseek.com",
      model: settings.model || "deepseek-chat",
    };
  } catch {
    return { provider: "template", apiKey: "", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" };
  }
}

function getModuleFormValues() {
  return Object.fromEntries(new FormData(moduleForm).entries());
}

function buildLeadCustomerRecord(record) {
  return {
    company: record.company || "未命名客户",
    contact: record.contact || "",
    title: record.title || "",
    country: record.country || "",
    website: record.website || "",
    linkedin: record.linkedin || "",
    instagram: record.instagram || "",
    facebook: record.facebook || "",
    youtube: record.youtube || "",
    email: record.email || "",
    whatsapp: record.whatsapp || "",
    phone: record.phone || "",
    source: record.source || "线索",
    customerType: record.customerType || record.segment || "进口商",
    segment: record.customerType || record.segment || "进口商",
    priority: record.grade || record.priority || "B",
    grade: record.grade || record.priority || "B",
    product: record.product || "CM-1700MY",
    paymentRisk: record.paymentRisk || record.risk || "未知",
    risk: record.risk || record.paymentRisk || "未知",
    stage: "新客户",
    lastFollow: record.lastFollow || "",
    nextDate: record.nextDate || "",
    isQuoted: record.quoted || "否",
    isSample: record.sample || "否",
    isBlacklisted: record.blacklisted || "否",
    owner: record.owner || window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
    notes: appendLine(record.notes || "", "来源：线索转客户"),
  };
}

function buildProspectTradeRecord(record) {
  return {
    company: record.candidateCompany || record.searchName || "未命名搜客",
    country: record.country || "",
    website: record.website || "",
    email: record.email || "",
    source: "搜客",
    customerType: record.customerType || "家电进口商",
    segment: record.customerType || "进口商",
    priority: record.score || "B",
    grade: record.score || "B",
    product: inferProductFromProspect(record),
    paymentRisk: record.risk === "OA风险提示" ? "OA风险" : "未知",
    stage: "新线索",
    owner: window.FORYAL_CRM?.getCurrentUser?.()?.name || "Lina",
    notes: appendLine(record.notes || "", `搜客关键词：${record.keyword || ""}`),
  };
}

function inferProductFromProspect(record) {
  const text = `${record.keyword || ""} ${record.notes || ""}`.toLowerCase();
  if (text.includes("grinder") || text.includes("磨")) return "CM-1700MY";
  if (text.includes("tft") || text.includes("premium")) return "CM-1600B";
  if (text.includes("skd")) return "SKD Project";
  if (text.includes("ckd")) return "CKD Project";
  if (text.includes("private")) return "Private Label Project";
  return "CM-1700MY";
}

function scoreProspect(record) {
  const text = `${record.candidateCompany || ""} ${record.website || ""} ${record.email || ""} ${record.notes || ""}`.toLowerCase();
  let score = 0;
  if (record.website) score += 2;
  if (record.email) score += 2;
  if (/import|distributor|brand|retail|coffee|appliance|espresso/.test(text)) score += 2;
  if (/oa|60|90|120|consign|寄售/.test(text)) score -= 2;
  if (BIG_BRAND_KEYWORDS.some((brand) => text.includes(brand))) score -= 3;
  if (record.risk && record.risk !== "正常") score -= 1;
  if (score >= 4) return "A";
  if (score >= 2) return "B";
  return "C";
}

function translateProspectType(type) {
  const map = {
    小家电品牌商: "small home appliance brand",
    家电进口商: "home appliance importer",
    厨房电器批发商: "kitchen appliance wholesaler",
    连锁零售商: "retail chain buyer",
    电商卖家: "ecommerce seller",
    咖啡设备品牌商: "coffee equipment brand",
    咖啡设备进口商: "coffee equipment importer",
  };
  return map[type] || "home appliance importer";
}

function appendLine(source, line) {
  const current = String(source || "").trim();
  return current ? `${current}\n${line}` : line;
}

function buildTemplateDraft(record) {
  const product = record.product || "CM-1700MY";
  const customerType = record.customerType || "home appliance importer";
  const channel = record.channel || "Email";
  if (channel === "WhatsApp") {
    return `Hi, this is Lina from FORYAL, a coffee machine OEM/ODM factory in China. We are currently supporting ${customerType} partners with ${product}, private label and SKD/CKD options. Would it be convenient if I send you a short product summary for review?`;
  }
  if (channel === "LinkedIn") {
    return `Hi, thanks for connecting. I noticed your work in ${customerType}. FORYAL manufactures espresso coffee machines for OEM/ODM, private label and SKD/CKD projects. ${product} may fit your next coffee appliance line. Open to a brief review?`;
  }
  return `Subject: ${product} OEM / ODM coffee machine cooperation\n\nHi,\n\nI am Lina from FORYAL, a coffee machine OEM/ODM factory in China.\n\nFor ${customerType}, we can support ${product}, private label branding, SKD/CKD cooperation, and export documentation for appliance import requirements.\n\nIf you are evaluating new espresso machine suppliers, I can send a short product summary with key specifications, MOQ and factory options for your review.\n\nBest regards,\nLina Mei\nDemo Export Company`;
}

function getActiveRecord() {
  return (moduleStore[activeModuleId] || []).find((record) => record.id === activeRecordId) || null;
}

function getModuleRecordTitle(definition, record) {
  const titleField = definition.fields.find((field) => ["company", "candidateCompany", "searchName", "task", "name", "title", "quoteNo", "contractNo", "invoiceNo", "campaign", "reportName", "settingName", "customer", "code"].includes(field.key));
  return record[titleField?.key] || definition.title;
}

function uniqueValues(rows, key) {
  return Array.from(new Set((rows || []).map((row) => row[key]).filter(Boolean)));
}

function todayForModule() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function parseModuleCsv(text) {
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

function downloadModuleCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeModuleHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function notifyModule(message) {
  if (typeof showToast === "function") {
    showToast(message);
  } else {
    console.info(message);
  }
}
