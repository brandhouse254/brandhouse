"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { assertUser, NotAllowedError } from "@/lib/auth/session";
import { notifyUsers } from "@/lib/admin/push";
import { readUsers } from "@/lib/auth/users";
import * as db from "./data";
import {
  expenseCategories,
  invoiceStatuses,
  leadStages,
  paymentMethods,
  projectStatuses,
  taskPriorities,
  taskStatuses,
  type BusinessSettings,
} from "./types";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function failure(e: unknown): { ok: false; error: string } {
  if (e instanceof NotAllowedError) return { ok: false, error: e.message };
  if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Check the form and try again." };
  console.error("[business]", e);
  return { ok: false, error: "Something went wrong saving that. Please try again." };
}

/** After any change: refresh this screen, and let other open screens know. */
function changed() {
  revalidatePath("/admin", "layout");
  after(() => db.touchPulse().catch(() => undefined));
}

const ids = <T extends readonly { id: string }[]>(list: T) => list.map((x) => x.id) as [T[number]["id"], ...T[number]["id"][]];

const text = (max: number) => z.string().trim().max(max, { error: `Keep this under ${max} characters.` });
const date = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), { error: "Enter a valid date." })
  .transform((v) => v || null);
const optionalId = z
  .string()
  .trim()
  .transform((v) => v || null)
  .refine((v) => v === null || db.isUuid(v), { error: "That item no longer exists." });
const money = z.coerce.number({ error: "Enter an amount." }).min(0, { error: "Amounts can't be negative." }).max(1e11);
const optionalMoney = z
  .union([z.literal(""), z.null(), z.coerce.number().min(0).max(1e11)])
  .transform((v) => (v === "" || v === null ? null : Number(v)));

async function nameOf(userId: string): Promise<string> {
  const { users } = await readUsers();
  const u = users.find((x) => x.id === userId);
  return u ? u.name || u.email : "Someone";
}

/* ───────────── Leads ───────────── */

const leadSources = ["website", "phone", "whatsapp", "instagram", "referral", "walk-in", "event", "other"] as const;

const newLeadSchema = z.object({
  source: z.enum(leadSources),
  name: text(120).min(2, { error: "Enter the contact's name." }),
  organisation: text(160),
  email: text(200).refine((v) => v === "" || z.email().safeParse(v).success, { error: "Enter a valid email address." }),
  phone: text(40),
  services: z.array(text(120)).max(13).default([]),
  budget: text(80).default(""),
  description: text(5000).default(""),
  value: optionalMoney.default(null),
  assigneeId: z.string().trim().max(80).default(""),
  followUpOn: date.default(""),
});

export async function addLead(input: z.input<typeof newLeadSchema>): Promise<Result<{ id: string }>> {
  try {
    const me = await assertUser();
    const d = newLeadSchema.parse(input);
    const lead = await db.createLead({
      source: d.source,
      name: d.name,
      organisation: d.organisation,
      email: d.email,
      phone: d.phone,
      services: d.services,
      budget: d.budget,
      timeline: "",
      referral: "",
      description: d.description,
      read: true,
    });
    if (!lead) throw new Error("Lead not created");
    await db.updateLead(lead.id, { value: d.value, assigneeId: d.assigneeId || null, followUpOn: d.followUpOn });
    if (d.assigneeId && d.assigneeId !== me.id) await notifyLeadAssignee(lead.id, d.assigneeId, d.name, me.id);
    changed();
    return { ok: true, id: lead.id };
  } catch (e) {
    return failure(e);
  }
}

async function notifyLeadAssignee(leadId: string, assigneeId: string, leadName: string, byId: string) {
  const by = await nameOf(byId);
  after(() =>
    notifyUsers([assigneeId], "tasks", {
      title: `Lead assigned to you: ${leadName}`,
      body: `${by} asked you to follow this up.`,
      url: `/admin/leads/${leadId}`,
      tag: `lead-${leadId}`,
    }),
  );
}

const leadPatchSchema = z
  .object({
    stage: z.enum(ids(leadStages)),
    assigneeId: z.string().trim().max(80).transform((v) => v || null),
    followUpOn: date,
    value: optionalMoney,
    read: z.boolean(),
    name: text(120).min(2, { error: "Enter the contact's name." }),
    organisation: text(160),
    email: text(200),
    phone: text(40),
    description: text(5000),
  })
  .partial();

export async function updateLeadDetails(id: string, input: z.input<typeof leadPatchSchema>): Promise<Result> {
  try {
    const me = await assertUser();
    const before = await db.getLead(id);
    if (!before) return { ok: false, error: "This lead no longer exists." };
    const patch = leadPatchSchema.parse(input);
    await db.updateLead(id, patch);
    if (patch.assigneeId && patch.assigneeId !== before.assigneeId && patch.assigneeId !== me.id) {
      await notifyLeadAssignee(id, patch.assigneeId, before.name, me.id);
    }
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function addLeadNote(id: string, body: string): Promise<Result> {
  try {
    const me = await assertUser();
    const note = text(4000).min(1, { error: "Write a note first." }).parse(body);
    await db.addLeadNote(id, me.id, me.name || me.email, note);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/** Won: the lead becomes a client and a project, ready for tasks and invoices. */
export async function winLead(id: string, projectName: string): Promise<Result<{ projectId: string }>> {
  try {
    await assertUser();
    const lead = await db.getLead(id);
    if (!lead) return { ok: false, error: "This lead no longer exists." };
    if (lead.projectId) return { ok: true, projectId: lead.projectId };
    const name = text(160).min(2, { error: "Name the project." }).parse(projectName);
    const clientId =
      lead.clientId ??
      (
        await db.createClient({
          name: lead.name,
          company: lead.organisation,
          email: lead.email,
          phone: lead.phone,
          kraPin: "",
          address: "",
          notes: `From a ${lead.source} lead received ${lead.receivedAt.slice(0, 10)}.`,
        })
      ).id;
    const projectId = await db.createProject({
      clientId,
      leadId: lead.id,
      name,
      description: lead.description,
      status: "planning",
      startOn: db.todayKE(),
      dueOn: null,
      budget: lead.value,
    });
    await db.updateLead(id, { stage: "won", clientId, projectId, read: true });
    changed();
    return { ok: true, projectId };
  } catch (e) {
    return failure(e);
  }
}

export async function removeLead(id: string): Promise<Result> {
  try {
    await assertUser();
    await db.deleteLead(id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/* ───────────── Clients ───────────── */

const clientSchema = z.object({
  name: text(120).min(2, { error: "Enter the client's name." }),
  company: text(160),
  email: text(200).refine((v) => v === "" || z.email().safeParse(v).success, { error: "Enter a valid email address." }),
  phone: text(40),
  kraPin: text(20)
    .transform((v) => v.toUpperCase())
    .refine((v) => v === "" || /^[A-Z]\d{9}[A-Z]$/.test(v), { error: "A KRA PIN looks like A123456789B." }),
  address: text(400),
  notes: text(4000),
  archived: z.boolean().default(false),
});

export async function saveClient(id: string | null, input: z.input<typeof clientSchema>): Promise<Result<{ id: string }>> {
  try {
    await assertUser();
    const d = clientSchema.parse(input);
    let clientId = id;
    if (id) await db.updateClient(id, d);
    else clientId = (await db.createClient(d)).id;
    changed();
    return { ok: true, id: clientId! };
  } catch (e) {
    return failure(e);
  }
}

export async function removeClient(id: string): Promise<Result> {
  try {
    await assertUser("owner");
    await db.deleteClient(id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/* ───────────── Projects ───────────── */

const projectSchema = z.object({
  clientId: optionalId,
  name: text(160).min(2, { error: "Name the project." }),
  description: text(5000),
  status: z.enum(ids(projectStatuses)),
  startOn: date,
  dueOn: date,
  budget: optionalMoney,
});

export async function saveProject(id: string | null, input: z.input<typeof projectSchema>): Promise<Result<{ id: string }>> {
  try {
    await assertUser();
    const d = projectSchema.parse(input);
    let projectId = id;
    if (id) await db.updateProject(id, d);
    else projectId = await db.createProject(d);
    changed();
    return { ok: true, id: projectId! };
  } catch (e) {
    return failure(e);
  }
}

export async function removeProject(id: string): Promise<Result> {
  try {
    await assertUser("owner");
    await db.deleteProject(id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/* ───────────── Tasks ───────────── */

const taskSchema = z.object({
  projectId: optionalId,
  title: text(200).min(2, { error: "Give the task a title." }),
  description: text(5000).default(""),
  status: z.enum(ids(taskStatuses)).default("todo"),
  priority: z.enum(ids(taskPriorities)).default("normal"),
  assigneeId: z.string().trim().max(80).transform((v) => v || null),
  dueOn: date,
});

async function notifyTaskAssignee(taskId: string, title: string, assigneeId: string, byId: string, dueOn: string | null) {
  const by = await nameOf(byId);
  after(() =>
    notifyUsers([assigneeId], "tasks", {
      title: `New task for you: ${title}`,
      body: `From ${by}${dueOn ? ` · due ${new Date(`${dueOn}T00:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}` : ""}`,
      url: `/admin/tasks/${taskId}`,
      tag: `task-${taskId}`,
    }),
  );
}

export async function saveTask(id: string | null, input: z.input<typeof taskSchema>): Promise<Result<{ id: string }>> {
  try {
    const me = await assertUser();
    const d = taskSchema.parse(input);
    if (id) {
      const before = await db.getTask(id);
      if (!before) return { ok: false, error: "This task no longer exists." };
      await db.updateTask(id, d);
      if (d.assigneeId && d.assigneeId !== before.assigneeId && d.assigneeId !== me.id) {
        await notifyTaskAssignee(id, d.title, d.assigneeId, me.id, d.dueOn);
      }
      changed();
      return { ok: true, id };
    }
    const newId = await db.createTask(d, me.id);
    if (d.assigneeId && d.assigneeId !== me.id) await notifyTaskAssignee(newId, d.title, d.assigneeId, me.id, d.dueOn);
    changed();
    return { ok: true, id: newId };
  } catch (e) {
    return failure(e);
  }
}

export async function setTaskStatus(id: string, status: string): Promise<Result> {
  try {
    const me = await assertUser();
    const s = z.enum(ids(taskStatuses)).parse(status);
    const task = await db.getTask(id);
    if (!task) return { ok: false, error: "This task no longer exists." };
    await db.updateTask(id, { status: s });
    // Tell whoever created the task when someone else finishes it.
    if (s === "done" && task.createdBy && task.createdBy !== me.id) {
      after(() =>
        notifyUsers([task.createdBy!], "tasks", {
          title: `Done: ${task.title}`,
          body: `${me.name || me.email} marked it complete.`,
          url: `/admin/tasks/${id}`,
          tag: `task-${id}`,
        }),
      );
    }
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function removeTask(id: string): Promise<Result> {
  try {
    await assertUser();
    await db.deleteTask(id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

const attachmentSchema = z.object({
  url: z.url().refine((u) => new URL(u).hostname.endsWith(".public.blob.vercel-storage.com"), { error: "Attach files by uploading them." }),
  name: text(200),
  kind: z.enum(["image", "video", "file"]),
});

export async function addTaskComment(taskId: string, body: string, attachments: unknown[]): Promise<Result> {
  try {
    const me = await assertUser();
    const files = z.array(attachmentSchema).max(10).parse(attachments);
    const note = text(4000).parse(body);
    if (!note && !files.length) return { ok: false, error: "Write a comment or attach a file." };
    const task = await db.getTask(taskId);
    if (!task) return { ok: false, error: "This task no longer exists." };
    await db.addTaskComment(taskId, me.id, me.name || me.email, note, files);
    // Everyone involved hears about it, except the person who wrote it.
    const people = new Set([task.assigneeId, task.createdBy, ...(await db.taskComments(taskId)).map((c) => c.userId)]);
    people.delete(me.id);
    const who = [...people].filter((x): x is string => Boolean(x));
    after(() =>
      notifyUsers(who, "tasks", {
        title: `${me.name || me.email} on “${task.title}”`,
        body: note ? note.slice(0, 140) : `Attached ${files.length} file${files.length === 1 ? "" : "s"}`,
        url: `/admin/tasks/${taskId}`,
        tag: `task-${taskId}`,
      }),
    );
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/* ───────────── Finance (owners only) ───────────── */

const settingsSchema = z.object({
  legalName: text(160).min(2, { error: "Enter the business name." }),
  kraPin: text(20)
    .transform((v) => v.toUpperCase())
    .refine((v) => v === "" || /^[A-Z]\d{9}[A-Z]$/.test(v), { error: "A KRA PIN looks like P051234567X." }),
  vatRegistered: z.boolean(),
  address: text(400),
  email: text(200),
  phone: text(40),
  mpesaPaybill: text(20),
  mpesaAccountHint: text(160),
  mpesaTill: text(20),
  bankName: text(120),
  bankAccountName: text(160),
  bankAccountNumber: text(40),
  bankBranch: text(120),
  bankSwift: text(20),
  invoicePrefix: text(12),
  quotePrefix: text(12),
  defaultVatRate: z.coerce.number().min(0).max(100),
  defaultDueDays: z.coerce.number().int().min(0).max(365),
  defaultTerms: text(2000),
  invoiceFooter: text(400),
});

export async function saveBusinessSettings(input: BusinessSettings): Promise<Result> {
  try {
    await assertUser("owner");
    await db.saveBusinessSettings(settingsSchema.parse(input));
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

const itemSchema = z.object({
  description: text(500).min(1, { error: "Every line needs a description." }),
  quantity: z.coerce.number().min(0, { error: "Quantities can't be negative." }).max(1e7),
  unitPrice: money,
});

const invoiceSchema = z.object({
  clientId: optionalId,
  projectId: optionalId,
  issueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Enter the date." }),
  dueOn: date,
  status: z.string(),
  vatRate: z.coerce.number().min(0).max(100),
  vatInclusive: z.boolean(),
  discount: money.default(0),
  notes: text(4000),
  terms: text(4000),
  items: z.array(itemSchema).min(1, { error: "Add at least one line." }).max(100),
});

const kindSchema = z.enum(["quote", "invoice"]);

export async function saveInvoice(id: string | null, kind: string, input: z.input<typeof invoiceSchema>): Promise<Result<{ id: string }>> {
  try {
    const me = await assertUser("owner");
    const k = kindSchema.parse(kind);
    const d = invoiceSchema.parse(input);
    if (!(invoiceStatuses[k] as readonly { id: string }[]).some((s) => s.id === d.status)) d.status = "draft";
    if (!d.clientId) return { ok: false, error: "Choose who this is for." };
    if (id) {
      const current = await db.getInvoice(id);
      if (!current) return { ok: false, error: "This document no longer exists." };
      // Payment-driven statuses are kept in step with the payments recorded.
      await db.updateInvoice(id, { ...d, status: current.kind === "invoice" && ["partial", "paid"].includes(current.status) ? current.status : d.status });
      if (current.kind === "invoice") await db.refreshPaymentStatus(id);
      changed();
      return { ok: true, id };
    }
    const newId = await db.createInvoice(k, d, me.id);
    changed();
    return { ok: true, id: newId };
  } catch (e) {
    return failure(e);
  }
}

export async function setDocumentStatus(id: string, status: string): Promise<Result> {
  try {
    await assertUser("owner");
    const inv = await db.getInvoice(id);
    if (!inv) return { ok: false, error: "This document no longer exists." };
    const allowed = (invoiceStatuses[inv.kind] as readonly { id: string }[]).map((s) => s.id);
    if (!allowed.includes(status)) return { ok: false, error: "That status doesn't apply here." };
    await db.setInvoiceStatus(id, status);
    if (inv.kind === "invoice" && status !== "void" && status !== "draft") await db.refreshPaymentStatus(id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/** Accepted quote → invoice with the same lines (the quote is kept and marked accepted). */
export async function convertQuote(id: string): Promise<Result<{ id: string }>> {
  try {
    const me = await assertUser("owner");
    const quote = await db.getInvoice(id);
    if (!quote || quote.kind !== "quote") return { ok: false, error: "This quote no longer exists." };
    const settings = await db.getBusinessSettings();
    const today = db.todayKE();
    const newId = await db.createInvoice(
      "invoice",
      {
        clientId: quote.clientId,
        projectId: quote.projectId,
        issueOn: today,
        dueOn: db.addDays(today, settings.defaultDueDays),
        status: "draft",
        vatRate: quote.vatRate,
        vatInclusive: quote.vatInclusive,
        discount: quote.discount,
        notes: quote.notes,
        terms: settings.defaultTerms,
        items: quote.items,
      },
      me.id,
      quote.id,
    );
    await db.setInvoiceStatus(id, "accepted");
    changed();
    return { ok: true, id: newId };
  } catch (e) {
    return failure(e);
  }
}

export async function removeDocument(id: string): Promise<Result> {
  try {
    await assertUser("owner");
    const inv = await db.getInvoice(id);
    if (!inv) return { ok: true };
    if (inv.kind === "invoice" && inv.status !== "draft") {
      return { ok: false, error: "Only drafts can be deleted. Void a sent invoice instead, so the numbering stays complete." };
    }
    await db.deleteInvoice(id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

const paymentSchema = z.object({
  paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Enter the date paid." }),
  amount: z.coerce.number({ error: "Enter the amount." }).positive({ error: "Enter the amount received." }).max(1e11),
  method: z.enum(ids(paymentMethods)),
  reference: text(80),
  note: text(400),
});

export async function recordPayment(invoiceId: string, input: z.input<typeof paymentSchema>): Promise<Result> {
  try {
    await assertUser("owner");
    const inv = await db.getInvoice(invoiceId);
    if (!inv || inv.kind !== "invoice") return { ok: false, error: "Payments are recorded against invoices." };
    if (inv.status === "void") return { ok: false, error: "This invoice is void." };
    await db.addPayment(invoiceId, paymentSchema.parse(input));
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function removePayment(paymentId: string): Promise<Result> {
  try {
    await assertUser("owner");
    if (!db.isUuid(paymentId)) return { ok: false, error: "That payment no longer exists." };
    await db.deletePayment(paymentId);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

const expenseSchema = z.object({
  spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Enter the date." }),
  category: z.enum(expenseCategories),
  vendor: text(160),
  description: text(1000),
  amount: z.coerce.number({ error: "Enter the amount." }).positive({ error: "Enter the amount spent." }).max(1e11),
  vat: money.default(0),
  method: z.enum(ids(paymentMethods)),
  reference: text(80),
  receiptUrl: z
    .string()
    .trim()
    .refine((u) => u === "" || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(u), { error: "Upload the receipt here." }),
  projectId: optionalId,
});

export async function saveExpense(id: string | null, input: z.input<typeof expenseSchema>): Promise<Result> {
  try {
    const me = await assertUser("owner");
    const d = expenseSchema.parse(input);
    if (d.vat > d.amount) return { ok: false, error: "The VAT can't be more than the amount." };
    await db.saveExpense(id, d, me.id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function removeExpense(id: string): Promise<Result> {
  try {
    await assertUser("owner");
    await db.deleteExpense(id);
    changed();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
