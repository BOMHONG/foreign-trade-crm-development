const OutreachQueue = require("../outreach-queue");

const OPEN_STATUSES = new Set(["pending_review", "approved", "scheduled"]);

function createSharedCrmService(repository) {
  async function requireDatabase() {
    await repository.ensureConfigured();
  }

  function makeId(prefix) {
    if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeActor(actor = {}) {
    const id = String(actor.id || actor.email || "crm-user").trim();
    return {
      id,
      name: actor.name || actor.email || id,
      email: actor.email || `${id}@local.crm`,
      role: actor.role || "user",
    };
  }

  function toApiError(error) {
    return {
      error: error.code || "SHARED_CRM_ERROR",
      message: error.message || "Shared CRM request failed",
      statusCode: error.statusCode || 500,
    };
  }

  function fail(statusCode, code, message, extra = {}) {
    throw Object.assign(new Error(message), { statusCode, code, ...extra });
  }

  function assertCustomerCanReceiveOutreach(customer, openTask) {
    if (!customer) fail(404, "CUSTOMER_NOT_FOUND", "Customer not found");
    if (!OutreachQueue.isValidEmail(customer.email)) fail(400, "INVALID_EMAIL", "Customer does not have a valid email");
    if (customer.doNotEmail) fail(409, "DO_NOT_EMAIL", "Customer is marked Do Not Email");
    if (customer.unsubscribed || customer.unsubscribe) fail(409, "UNSUBSCRIBED", "Customer is unsubscribed");
    if (customer.emailBounced || customer.bounced || customer.bounce) fail(409, "EMAIL_BOUNCED", "Customer email is marked bounced");
    if (customer.outreachReplied || customer.replied) fail(409, "OUTREACH_REPLIED", "Customer has replied; outreach must stop");
    if (customer.stopOutreach) fail(409, "STOP_OUTREACH", "Customer outreach has been stopped");
    if (openTask) fail(409, "OPEN_OUTREACH_TASK_EXISTS", "Customer already has an unfinished outreach task", { task: openTask });
  }

  function makeOutreachEvent(type, task = {}, customer = {}, note = "", actor = {}) {
    return {
      id: makeId("outreach-event"),
      type,
      taskId: task.id || "",
      customerId: customer?.id || task.customerId || "",
      company: task.company || customer?.company || "",
      email: task.email || customer?.email || "",
      status: task.status || "",
      subject: task.subject || "",
      note,
      createdBy: actor.id,
      at: new Date().toISOString(),
    };
  }

  function makeCustomerActivity(customer, type, summary, actor, extra = {}) {
    return {
      id: makeId("activity"),
      customerId: customer.id,
      type,
      channel: extra.channel || "email",
      summary,
      content: extra.content || summary,
      nextAction: extra.nextAction || "",
      nextDate: extra.nextDate || null,
      source: extra.source || "email_outreach_queue",
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
    };
  }

  function getFlagPatch(action) {
    if (action === "dne" || action === "doNotEmail") return { key: "doNotEmail", atKey: "doNotEmailAt", label: "Do Not Email" };
    if (action === "unsubscribe" || action === "unsubscribed") return { key: "unsubscribed", atKey: "unsubscribedAt", label: "Unsubscribed" };
    if (action === "bounce" || action === "emailBounced") return { key: "emailBounced", atKey: "emailBouncedAt", label: "Email bounced" };
    if (action === "replied" || action === "outreachReplied") return { key: "outreachReplied", atKey: "outreachRepliedAt", label: "Customer replied" };
    if (action === "stop" || action === "stopOutreach") return { key: "stopOutreach", atKey: "outreachStoppedAt", label: "Stop outreach" };
    fail(400, "INVALID_FLAG_ACTION", "Unsupported customer flag action");
  }

  function buildDbTaskPatch(patch = {}, actor = {}) {
    const allowed = {};
    if (patch.subject !== undefined) allowed.subject = String(patch.subject || "").trim();
    if (patch.body !== undefined) allowed.body = OutreachQueue.sanitizePlainText(patch.body || "");
    if (patch.status !== undefined) allowed.status = patch.status;
    if (patch.scheduledAt !== undefined) allowed.scheduled_at = patch.scheduledAt || null;
    if (patch.failureReason !== undefined) allowed.failure_reason = patch.failureReason || "";
    if (patch.stopReason !== undefined) allowed.stop_reason = patch.stopReason || "";
    if (patch.brandName !== undefined) allowed.brand_name = ["FORYAL", "AISON"].includes(patch.brandName) ? patch.brandName : "FORYAL";
    if (patch.senderEmail !== undefined) allowed.sender_email = OutreachQueue.normalizeEmail(patch.senderEmail || "");
    if (patch.recommendedProduct !== undefined) allowed.recommended_product = patch.recommendedProduct || "";
    if (patch.status === "stopped") allowed.stopped_at = new Date().toISOString();
    allowed.updated_by = actor.id || null;
    allowed.updated_at = new Date().toISOString();
    return allowed;
  }

  function assertCanEditTask(existing = {}, patch = {}, actor = {}) {
    if (actor.role === "admin") return patch;
    if (existing.createdBy !== actor.id) fail(403, "AUTH_FORBIDDEN", "Users can only edit their own outreach tasks");
    if (existing.status !== "pending_review") fail(403, "AUTH_FORBIDDEN", "Users can only edit pending review outreach tasks");
    const blockedKeys = [
      "status",
      "failureReason",
      "stopReason",
      "approvedBy",
      "approvedAt",
      "sentBy",
      "sentAt",
      "stoppedAt",
      "autoSendAllowed",
    ];
    if (blockedKeys.some((key) => patch[key] !== undefined)) {
      fail(403, "AUTH_FORBIDDEN", "Users cannot change approval, sending, or stop status fields");
    }
    return {
      subject: patch.subject,
      body: patch.body,
      scheduledAt: patch.scheduledAt,
      brandName: patch.brandName,
      senderEmail: patch.senderEmail,
      recommendedProduct: patch.recommendedProduct,
    };
  }

  return {
    toApiError,

    async snapshot(actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      await repository.upsertUser(actor);
      const [customers, customerActivities, outreachSettings, outreachQueue, outreachActivity, mockSentRecords] = await Promise.all([
        repository.listCustomers(),
        repository.listCustomerActivities(),
        repository.getSettings(),
        repository.listOutreachQueue(),
        repository.listOutreachActivity(),
        repository.listMockSentRecords(),
      ]);
      return {
        source: "database",
        customers,
        customerActivities,
        outreachSettings: OutreachQueue.normalizeSettings(outreachSettings || {}),
        outreachQueue,
        outreachActivity,
        mockSentRecords,
      };
    },

    async listCustomers() {
      await requireDatabase();
      return repository.listCustomers();
    },

    async saveCustomer(customer, actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      return repository.upsertCustomer(customer, actor);
    },

    async bulkUpsertCustomers(customers = [], actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      return repository.bulkUpsertCustomers(customers, actor);
    },

    async updateCustomerFlags(customerId, action, actorInput = {}, taskId = "") {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      const customer = await repository.getCustomer(customerId);
      if (!customer) fail(404, "CUSTOMER_NOT_FOUND", "Customer not found");
      const flag = getFlagPatch(action);
      const now = new Date().toISOString();

      customer[flag.key] = true;
      customer[flag.atKey] = now;
      customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
      customer.timeline.unshift({
        id: makeId("timeline"),
        date: now.slice(0, 10),
        type: "email_outreach",
        content: `Outreach compliance flag: ${flag.label}`,
      });

      const savedCustomer = await repository.upsertCustomer(customer, actor);
      const stoppedTasks = await repository.stopOpenOutreachTasksForCustomer(customer.id, flag.label, actor);
      const relatedTask = taskId ? await repository.getOutreachTask(taskId) : stoppedTasks[0] || null;
      const outreachEvent = await repository.addOutreachActivity(
        makeOutreachEvent(`marked_${action}`, relatedTask || {}, savedCustomer, `Customer marked: ${flag.label}`, actor),
        actor
      );
      const activity = await repository.addCustomerActivity(
        makeCustomerActivity(savedCustomer, "email_outreach_flag", `Customer marked: ${flag.label}`, actor),
        actor
      );

      return { customer: savedCustomer, stoppedTasks, outreachEvent, activity };
    },

    async listCustomerActivities(customerId = "") {
      await requireDatabase();
      return repository.listCustomerActivities(customerId);
    },

    async addCustomerActivity(activity, actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      return repository.addCustomerActivity(activity, actor);
    },

    async loadOutreachSettings() {
      await requireDatabase();
      return OutreachQueue.normalizeSettings((await repository.getSettings()) || {});
    },

    async saveOutreachSettings(settings = {}, actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      const normalized = OutreachQueue.normalizeSettings(settings);
      return repository.saveSettings(normalized, actor);
    },

    async listOutreachQueue() {
      await requireDatabase();
      return repository.listOutreachQueue();
    },

    async createOutreachTask(payload = {}, actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      let customer = payload.customerId ? await repository.getCustomer(payload.customerId) : null;
      if (!customer && payload.customer) customer = await repository.upsertCustomer(payload.customer, actor);
      if (!customer) fail(404, "CUSTOMER_NOT_FOUND", "Customer not found");

      const openTask = await repository.findOpenOutreachTaskForCustomer(customer.id);
      assertCustomerCanReceiveOutreach(customer, openTask);

      const [queue, storedSettings] = await Promise.all([repository.listOutreachQueue(), repository.getSettings()]);
      const settings = OutreachQueue.normalizeSettings({ ...(storedSettings || {}), ...(payload.settings || {}) });
      const task = OutreachQueue.createTask(customer, {
        queue,
        settings,
        senderEmail: payload.senderEmail || "",
        lastContactAt: payload.lastContactAt || "",
        scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : undefined,
        now: payload.now ? new Date(payload.now) : undefined,
      });
      task.brandName = settings.brandName;
      task.createdBy = actor.id;
      task.updatedBy = actor.id;
      task.autoSendAllowed = false;

      const savedTask = await repository.upsertOutreachTask(task, actor);
      const event = await repository.addOutreachActivity(
        makeOutreachEvent("draft_generated", savedTask, customer, "Plain text draft generated and pending review", actor),
        actor
      );
      return { task: savedTask, outreachEvent: event };
    },

    async updateOutreachTask(taskId, patch = {}, actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      const existing = await repository.getOutreachTask(taskId);
      if (!existing) fail(404, "TASK_NOT_FOUND", "Outreach task not found");
      const safePatch = assertCanEditTask(existing, patch, actor);
      const savedTask = await repository.patchOutreachTask(taskId, buildDbTaskPatch(safePatch, actor), actor);
      const customer = savedTask.customerId ? await repository.getCustomer(savedTask.customerId) : null;
      const event = await repository.addOutreachActivity(makeOutreachEvent("edited", savedTask, customer, "Outreach task updated", actor), actor);
      return { task: savedTask, outreachEvent: event };
    },

    async approveOutreachTask(taskId, actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      const task = await repository.getOutreachTask(taskId);
      if (!task) fail(404, "TASK_NOT_FOUND", "Outreach task not found");
      if (task.status !== "pending_review" && task.status !== "approved") {
        fail(409, "TASK_NOT_APPROVABLE", "Only pending or approved tasks can be scheduled");
      }

      const [queue, settings] = await Promise.all([repository.listOutreachQueue(), repository.getSettings()]);
      const scheduledAt = task.scheduledAt || OutreachQueue.findNextScheduleAt(queue, task.senderEmail || "", settings || {}).toISOString();
      const savedTask = await repository.patchOutreachTask(
        taskId,
        {
          status: "scheduled",
          scheduled_at: scheduledAt,
          approved_by: actor.id,
          approved_at: new Date().toISOString(),
        },
        actor
      );
      const customer = savedTask.customerId ? await repository.getCustomer(savedTask.customerId) : null;
      const event = await repository.addOutreachActivity(
        makeOutreachEvent("approved_scheduled", savedTask, customer, "Approved and scheduled for mock send", actor),
        actor
      );
      return { task: savedTask, outreachEvent: event };
    },

    async mockSendOutreachTask(taskId, actorInput = {}) {
      await requireDatabase();
      const actor = normalizeActor(actorInput);
      const task = await repository.getOutreachTask(taskId);
      if (!task) fail(404, "TASK_NOT_FOUND", "Outreach task not found");
      if (!["approved", "scheduled"].includes(task.status)) fail(409, "TASK_NOT_SENDABLE", "Task must be approved or scheduled first");
      if (!task.email || !task.subject || !task.body) fail(400, "EMPTY_MESSAGE", "Email, subject, and body are required");

      const now = new Date().toISOString();
      const sentTask = await repository.patchOutreachTask(
        taskId,
        {
          status: "sent",
          sent_by: actor.id,
          sent_at: now,
          updated_at: now,
        },
        actor
      );
      const mockRecord = await repository.addMockSentRecord(
        {
          id: makeId("mock-sent"),
          outreachTaskId: sentTask.id,
          customerId: sentTask.customerId,
          from: sentTask.senderEmail || "",
          to: sentTask.email,
          subject: sentTask.subject,
          body: sentTask.body,
          transport: "mock",
          isRealSent: false,
          date: now,
          sentBy: actor.id,
        },
        actor
      );

      let savedCustomer = null;
      if (sentTask.customerId) {
        const customer = await repository.getCustomer(sentTask.customerId);
        if (customer) {
          const followupDate = new Date(now);
          followupDate.setDate(followupDate.getDate() + (Number(sentTask.followupDelayDays) || 7));
          customer.lastOutreachAt = now;
          customer.followUps = Array.isArray(customer.followUps) ? customer.followUps : [];
          customer.followUps.unshift({
            id: makeId("followup"),
            date: now.slice(0, 10),
            contact: customer.contact || "",
            channel: "email",
            followType: "email_outreach_queue",
            summary: `Mock sent outreach email: ${sentTask.subject}`,
            nextAction: "Wait for customer reply; stop outreach if replied, unsubscribed, or bounced",
            nextDate: followupDate.toISOString().slice(0, 10),
            result: "mock_sent",
            createdBy: actor.id,
          });
          customer.timeline = Array.isArray(customer.timeline) ? customer.timeline : [];
          customer.timeline.unshift({
            id: makeId("timeline"),
            date: now.slice(0, 10),
            type: "email_outreach",
            content: `Mock sent outreach email: ${sentTask.subject}`,
          });
          savedCustomer = await repository.upsertCustomer(customer, actor);
          await repository.addCustomerActivity(
            makeCustomerActivity(savedCustomer, "email_outreach_mock_sent", `Mock sent outreach email: ${sentTask.subject}`, actor, {
              nextAction: "Wait for customer reply; stop outreach if replied, unsubscribed, or bounced",
            }),
            actor
          );
        }
      }

      const event = await repository.addOutreachActivity(
        makeOutreachEvent("mock_sent", sentTask, savedCustomer || {}, "Mock email recorded. No real delivery API was called.", actor),
        actor
      );

      return { task: sentTask, mockRecord, customer: savedCustomer, outreachEvent: event, transport: "mock", isRealSent: false };
    },

    isOpenStatus(status) {
      return OPEN_STATUSES.has(status);
    },
  };
}

module.exports = { createSharedCrmService };
