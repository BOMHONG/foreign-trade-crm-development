function toCamelCustomer(row = {}) {
  return {
    ...(row.raw_json || {}),
    id: row.id,
    company: row.company || "",
    contact: row.contact || "",
    title: row.title || "",
    email: row.email || "",
    country: row.country || "",
    grade: row.grade || row.priority || "",
    priority: row.priority || row.grade || "",
    customerType: row.customer_type || row.raw_json?.customerType || "",
    segment: row.segment || "",
    product: row.product || "",
    outreachProduct: row.outreach_product || row.raw_json?.outreachProduct || "",
    doNotEmail: Boolean(row.do_not_email),
    unsubscribed: Boolean(row.unsubscribed),
    emailBounced: Boolean(row.email_bounced),
    outreachReplied: Boolean(row.outreach_replied),
    stopOutreach: Boolean(row.stop_outreach),
    notes: row.notes || row.raw_json?.notes || "",
    createdBy: row.created_by || row.raw_json?.createdBy || "",
    updatedBy: row.updated_by || row.raw_json?.updatedBy || "",
    createdAt: row.created_at || row.raw_json?.createdAt || "",
    updatedAt: row.updated_at || row.raw_json?.updatedAt || "",
    followUps: Array.isArray(row.raw_json?.followUps) ? row.raw_json.followUps : [],
    timeline: Array.isArray(row.raw_json?.timeline) ? row.raw_json.timeline : [],
  };
}

function toDbCustomer(customer = {}, actor = {}) {
  const raw = { ...customer };
  return {
    id: customer.id,
    company: customer.company || customer.name || "Unnamed customer",
    contact: customer.contact || "",
    title: customer.title || "",
    email: customer.email || "",
    country: customer.country || "",
    grade: customer.grade || customer.priority || "",
    priority: customer.priority || customer.grade || "",
    customer_type: customer.customerType || customer.segment || "",
    segment: customer.segment || customer.customerType || "",
    product: customer.product || "",
    outreach_product: customer.outreachProduct || customer.emailOutreachProduct || customer.outreachRecommendedProduct || "",
    do_not_email: Boolean(customer.doNotEmail),
    unsubscribed: Boolean(customer.unsubscribed || customer.unsubscribe),
    email_bounced: Boolean(customer.emailBounced || customer.bounced || customer.bounce),
    outreach_replied: Boolean(customer.outreachReplied || customer.replied),
    stop_outreach: Boolean(customer.stopOutreach),
    notes: customer.notes || "",
    raw_json: raw,
    created_by: customer.createdBy || actor.id || null,
    updated_by: actor.id || customer.updatedBy || null,
    created_at: customer.createdAt || new Date().toISOString(),
    updated_at: customer.updatedAt || new Date().toISOString(),
  };
}

function toCamelActivity(row = {}) {
  return {
    ...(row.raw_json || {}),
    id: row.id,
    customerId: row.customer_id || "",
    type: row.type || "",
    channel: row.channel || "",
    summary: row.summary || "",
    content: row.content || "",
    nextAction: row.next_action || "",
    nextDate: row.next_date || "",
    source: row.source || "",
    createdBy: row.created_by || "",
    updatedBy: row.updated_by || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function toDbActivity(activity = {}, actor = {}) {
  return {
    id: activity.id,
    customer_id: activity.customerId || activity.customer_id,
    type: activity.type || "note",
    channel: activity.channel || "",
    summary: activity.summary || activity.content || activity.note || "",
    content: activity.content || activity.summary || activity.note || "",
    next_action: activity.nextAction || activity.nextStep || "",
    next_date: activity.nextDate || null,
    source: activity.source || "",
    raw_json: { ...activity },
    created_by: activity.createdBy || actor.id || null,
    updated_by: actor.id || activity.updatedBy || null,
    created_at: activity.createdAt || activity.date || new Date().toISOString(),
    updated_at: activity.updatedAt || new Date().toISOString(),
  };
}

function toCamelTask(row = {}) {
  return {
    ...(row.raw_json || {}),
    id: row.id,
    customerId: row.customer_id,
    company: row.company || "",
    contact: row.contact || "",
    email: row.email || "",
    country: row.country || "",
    grade: row.grade || "",
    recommendedProduct: row.recommended_product || "",
    brandName: row.brand_name || "FORYAL",
    subject: row.subject || "",
    body: row.body || "",
    status: row.status || "pending_review",
    scheduledAt: row.scheduled_at || "",
    lastContactAt: row.last_contact_at || "",
    senderEmail: row.sender_email || "",
    followupDelayDays: row.followup_delay_days || row.raw_json?.followupDelayDays || 7,
    reviewRequired: row.review_required !== false,
    autoSendAllowed: Boolean(row.auto_send_allowed),
    failureReason: row.failure_reason || "",
    stopReason: row.stop_reason || "",
    createdBy: row.created_by || "",
    updatedBy: row.updated_by || "",
    approvedBy: row.approved_by || "",
    sentBy: row.sent_by || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    approvedAt: row.approved_at || "",
    sentAt: row.sent_at || "",
    stoppedAt: row.stopped_at || "",
  };
}

function toDbTask(task = {}, actor = {}) {
  return {
    id: task.id,
    customer_id: task.customerId || task.customer_id,
    company: task.company || "",
    contact: task.contact || "",
    email: task.email || "",
    country: task.country || "",
    grade: task.grade || "",
    recommended_product: task.recommendedProduct || task.recommended_product || "",
    brand_name: task.brandName || task.brand_name || "FORYAL",
    subject: task.subject || "",
    body: task.body || "",
    status: task.status || "pending_review",
    scheduled_at: task.scheduledAt || task.scheduled_at || null,
    last_contact_at: task.lastContactAt || task.last_contact_at || null,
    sender_email: task.senderEmail || task.sender_email || "",
    followup_delay_days: Number(task.followupDelayDays || task.followup_delay_days || 7),
    review_required: task.reviewRequired !== false,
    auto_send_allowed: Boolean(task.autoSendAllowed || task.auto_send_allowed),
    failure_reason: task.failureReason || task.failure_reason || "",
    stop_reason: task.stopReason || task.stop_reason || "",
    raw_json: { ...task },
    created_by: task.createdBy || actor.id || null,
    updated_by: actor.id || task.updatedBy || null,
    approved_by: task.approvedBy || task.approved_by || null,
    sent_by: task.sentBy || task.sent_by || null,
    created_at: task.createdAt || task.created_at || new Date().toISOString(),
    updated_at: task.updatedAt || task.updated_at || new Date().toISOString(),
    approved_at: task.approvedAt || task.approved_at || null,
    sent_at: task.sentAt || task.sent_at || null,
    stopped_at: task.stoppedAt || task.stopped_at || null,
  };
}

function toCamelOutreachActivity(row = {}) {
  return {
    ...(row.raw_json || {}),
    id: row.id,
    taskId: row.task_id || "",
    customerId: row.customer_id || "",
    type: row.type || "",
    note: row.note || "",
    status: row.status || "",
    subject: row.subject || "",
    createdBy: row.created_by || "",
    at: row.created_at || "",
    createdAt: row.created_at || "",
  };
}

function toDbOutreachActivity(event = {}, actor = {}) {
  return {
    id: event.id,
    task_id: event.taskId || event.task_id || null,
    customer_id: event.customerId || event.customer_id || null,
    type: event.type || "event",
    note: event.note || "",
    status: event.status || "",
    subject: event.subject || "",
    raw_json: { ...event },
    created_by: event.createdBy || actor.id || null,
    updated_by: actor.id || event.updatedBy || null,
    created_at: event.at || event.createdAt || new Date().toISOString(),
    updated_at: event.updatedAt || new Date().toISOString(),
  };
}

function toCamelMockSent(row = {}) {
  return {
    ...(row.raw_json || {}),
    id: row.id,
    outreachTaskId: row.task_id,
    customerId: row.customer_id || "",
    from: row.from_email || "",
    to: row.to_email || "",
    subject: row.subject || "",
    body: row.body || "",
    transport: row.transport || "mock",
    isRealSent: Boolean(row.is_real_sent),
    createdBy: row.created_by || "",
    date: row.created_at || "",
  };
}

function toDbMockSent(record = {}, actor = {}) {
  return {
    id: record.id,
    task_id: record.outreachTaskId || record.taskId || record.task_id,
    customer_id: record.customerId || record.customer_id || null,
    from_email: record.from || record.fromEmail || record.from_email || "",
    to_email: record.to || record.toEmail || record.to_email || "",
    subject: record.subject || "",
    body: record.body || record.text || "",
    transport: "mock",
    is_real_sent: false,
    raw_json: { ...record, transport: "mock", isRealSent: false },
    created_by: record.createdBy || actor.id || null,
    updated_by: actor.id || record.updatedBy || null,
    sent_by: record.sentBy || actor.id || null,
    created_at: record.date || record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  };
}

module.exports = {
  toCamelCustomer,
  toDbCustomer,
  toCamelActivity,
  toDbActivity,
  toCamelTask,
  toDbTask,
  toCamelOutreachActivity,
  toDbOutreachActivity,
  toCamelMockSent,
  toDbMockSent,
};
