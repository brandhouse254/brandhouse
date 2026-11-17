import { randomBytes } from "node:crypto";
import { readUsers } from "@/lib/auth/users";
import { day, iso, num, one, q, S, tx, type Row } from "@/lib/db";

/** jsonb columns arrive parsed from Neon and as text from some drivers. */
const json = (v: unknown): unknown => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return v;
};
import {
  computeTotals,
  blankClientDetails,
  blankProjectDetails,
  type BillTo,
  type BusinessSettings,
  type ClientDetails,
  type PayOption,
  type ProjectDetails,
  type Client,
  type Comment,
  type Expense,
  type Invoice,
  type InvoiceItem,
  type InvoiceKind,
  type Lead,
  type Note,
  type Project,
  type Task,
  type TeamMember,
} from "./types";

/* ───────────── Team ───────────── */

export async function team(): Promise<TeamMember[]> {
  const { users } = await readUsers();
  return users.map((u) => ({ id: u.id, name: u.name || u.email, role: u.role, active: u.active }));
}

/* ───────────── Settings & counters ───────────── */

export const defaultBusinessSettings: BusinessSettings = {
  legalName: "Brand House",
  kraPin: "",
  vatRegistered: false,
  address: "Nairobi, Kenya",
  email: "brandhouse254@gmail.com",
  phone: "+254 740 953007",
  mpesaPaybill: "",
  mpesaAccountHint: "Use the invoice number as the account number",
  mpesaTill: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankBranch: "",
  bankSwift: "",
  invoicePrefix: "BH-INV-",
  quotePrefix: "BH-QT-",
  defaultVatRate: 16,
  defaultDueDays: 14,
  defaultTerms: "Payment due within 14 days of the invoice date. Work starts once the deposit is received.",
  invoiceFooter: "Thank you for working with Brand House.",
  receiptPrefix: "BH-RCT-",
  payOptions: [],
  signatureUrl: "",
  signatoryName: "",
  signatoryTitle: "",
};

/** Older settings kept payment details in fixed fields; turn them into the flexible list. */
function legacyPayOptions(b: BusinessSettings): PayOption[] {
  const out: PayOption[] = [];
  if (b.mpesaPaybill) out.push({ id: "mpesa-paybill", label: "M-Pesa Paybill", details: `Paybill: ${b.mpesaPaybill}\nAccount: ${b.mpesaAccountHint || "Your document number"}` });
  if (b.mpesaTill) out.push({ id: "mpesa-till", label: "M-Pesa Till (Buy Goods)", details: `Till number: ${b.mpesaTill}` });
  if (b.bankAccountNumber)
    out.push({
      id: "bank",
      label: "Bank transfer",
      details: [b.bankName && `${b.bankName}${b.bankBranch ? `, ${b.bankBranch}` : ""}`, b.bankAccountName && `Account name: ${b.bankAccountName}`, `Account number: ${b.bankAccountNumber}`, b.bankSwift && `SWIFT: ${b.bankSwift}`]
        .filter(Boolean)
        .join("\n"),
    });
  return out;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const row = await one<{ value: Partial<BusinessSettings> }>(`SELECT value FROM ${S}.settings WHERE key = 'business'`);
  const merged = { ...defaultBusinessSettings, ...(row?.value ?? {}) };
  if (!row?.value || !("payOptions" in row.value)) merged.payOptions = legacyPayOptions(merged);
  return merged;
}

export async function saveBusinessSettings(value: BusinessSettings) {
  await q(
    `INSERT INTO ${S}.settings(key, value) VALUES ('business', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(value)],
  );
}

export async function getSetting<T>(key: string): Promise<T | null> {
  const row = await one<{ value: T }>(`SELECT value FROM ${S}.settings WHERE key = $1`, [key]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: unknown) {
  await q(
    `INSERT INTO ${S}.settings(key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, JSON.stringify(value)],
  );
}

/** Next number in a sequence, atomically (two people can't get the same invoice number). */
export async function nextNumber(name: string): Promise<number> {
  const row = await one<{ value: number }>(
    `INSERT INTO ${S}.counters(name, value) VALUES ($1, 1)
     ON CONFLICT (name) DO UPDATE SET value = ${S}.counters.value + 1
     RETURNING value`,
    [name],
  );
  return Number(row?.value ?? 1);
}

/* ───────────── Leads ───────────── */

const mapLead = (r: Row): Lead => ({
  id: String(r.id),
  source: String(r.source),
  name: String(r.name),
  organisation: String(r.organisation ?? ""),
  email: String(r.email ?? ""),
  phone: String(r.phone ?? ""),
  services: Array.isArray(r.services) ? (r.services as string[]) : JSON.parse(String(r.services ?? "[]")),
  budget: String(r.budget ?? ""),
  timeline: String(r.timeline ?? ""),
  referral: String(r.referral ?? ""),
  description: String(r.description ?? ""),
  stage: String(r.stage) as Lead["stage"],
  assigneeId: (r.assignee_id as string) ?? null,
  followUpOn: day(r.follow_up_on),
  value: r.value === null || r.value === undefined ? null : num(r.value),
  read: Boolean(r.read),
  clientId: (r.client_id as string) ?? null,
  projectId: (r.project_id as string) ?? null,
  receivedAt: iso(r.received_at),
  updatedAt: iso(r.updated_at),
});

export type NewLead = Omit<Lead, "id" | "stage" | "assigneeId" | "followUpOn" | "value" | "read" | "clientId" | "projectId" | "receivedAt" | "updatedAt"> & {
  legacyId?: string;
  receivedAt?: string;
  read?: boolean;
};

export async function createLead(l: NewLead): Promise<Lead | null> {
  const row = await one(
    `INSERT INTO ${S}.leads(source, name, organisation, email, phone, services, budget, timeline, referral, description, legacy_id, received_at, read)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,COALESCE($12::timestamptz, now()),$13)
     ON CONFLICT (legacy_id) DO NOTHING
     RETURNING *`,
    [
      l.source,
      l.name,
      l.organisation,
      l.email,
      l.phone,
      JSON.stringify(l.services),
      l.budget,
      l.timeline,
      l.referral,
      l.description,
      l.legacyId ?? null,
      l.receivedAt ?? null,
      l.read ?? false,
    ],
  );
  // null when this enquiry was already imported (same legacy id).
  return row ? mapLead(row) : null;
}

export async function importedLegacyIds(): Promise<Set<string>> {
  const rows = await q<{ legacy_id: string }>(`SELECT legacy_id FROM ${S}.leads WHERE legacy_id IS NOT NULL`);
  return new Set(rows.map((r) => String(r.legacy_id)));
}

export async function leadByLegacyId(legacyId: string): Promise<string | null> {
  const r = await one<{ id: string }>(`SELECT id FROM ${S}.leads WHERE legacy_id = $1`, [legacyId]);
  return r ? String(r.id) : null;
}

export async function listLeads(): Promise<Lead[]> {
  return (await q(`SELECT * FROM ${S}.leads ORDER BY received_at DESC LIMIT 1000`)).map(mapLead);
}

export async function getLead(id: string): Promise<Lead | null> {
  if (!isUuid(id)) return null;
  const r = await one(`SELECT * FROM ${S}.leads WHERE id = $1`, [id]);
  return r ? mapLead(r) : null;
}

export async function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "stage" | "assigneeId" | "followUpOn" | "value" | "read" | "clientId" | "projectId" | "name" | "organisation" | "email" | "phone" | "description">>,
) {
  const cols: Record<string, string> = {
    stage: "stage",
    assigneeId: "assignee_id",
    followUpOn: "follow_up_on",
    value: "value",
    read: "read",
    clientId: "client_id",
    projectId: "project_id",
    name: "name",
    organisation: "organisation",
    email: "email",
    phone: "phone",
    description: "description",
  };
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (!(k in cols) || v === undefined) continue;
    params.push(v === "" && (k === "followUpOn" || k === "assigneeId") ? null : v);
    sets.push(`${cols[k]} = $${params.length}`);
  }
  if (!sets.length) return;
  params.push(id);
  await q(`UPDATE ${S}.leads SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length}`, params);
}

export async function deleteLead(id: string) {
  await q(`DELETE FROM ${S}.leads WHERE id = $1`, [id]);
}

export async function unreadLeadCount(): Promise<number> {
  const r = await one<{ n: number }>(`SELECT count(*)::int AS n FROM ${S}.leads WHERE read = false`);
  return Number(r?.n ?? 0);
}

export async function leadNotes(leadId: string): Promise<Note[]> {
  return (await q(`SELECT * FROM ${S}.lead_notes WHERE lead_id = $1 ORDER BY created_at`, [leadId])).map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    userName: String(r.user_name),
    body: String(r.body),
    createdAt: iso(r.created_at),
  }));
}

export async function addLeadNote(leadId: string, userId: string, userName: string, body: string) {
  await q(`INSERT INTO ${S}.lead_notes(lead_id, user_id, user_name, body) VALUES ($1,$2,$3,$4)`, [leadId, userId, userName, body]);
  await q(`UPDATE ${S}.leads SET updated_at = now() WHERE id = $1`, [leadId]);
}

/* ───────────── Clients ───────────── */

const mapClient = (r: Row): Client => ({
  id: String(r.id),
  name: String(r.name),
  company: String(r.company ?? ""),
  email: String(r.email ?? ""),
  phone: String(r.phone ?? ""),
  kraPin: String(r.kra_pin ?? ""),
  address: String(r.address ?? ""),
  notes: String(r.notes ?? ""),
  details: { ...blankClientDetails, ...(json(r.details) as Partial<ClientDetails>) },
  archived: Boolean(r.archived),
  createdAt: iso(r.created_at),
});

export type ClientInput = Omit<Client, "id" | "createdAt" | "archived" | "kraPin" | "details"> & { archived?: boolean; kraPin?: string; details?: ClientDetails };

export async function listClients(includeArchived = false): Promise<Client[]> {
  return (
    await q(`SELECT * FROM ${S}.clients ${includeArchived ? "" : "WHERE archived = false"} ORDER BY lower(coalesce(nullif(company, ''), name))`)
  ).map(mapClient);
}

export async function getClient(id: string): Promise<Client | null> {
  if (!isUuid(id)) return null;
  const r = await one(`SELECT * FROM ${S}.clients WHERE id = $1`, [id]);
  return r ? mapClient(r) : null;
}

export async function createClient(c: ClientInput): Promise<Client> {
  const r = await one(
    `INSERT INTO ${S}.clients(name, company, email, phone, kra_pin, address, notes, details) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb) RETURNING *`,
    [c.name, c.company, c.email, c.phone, c.kraPin ?? "", c.address, c.notes, JSON.stringify(c.details ?? blankClientDetails)],
  );
  return mapClient(r!);
}

export async function updateClient(id: string, c: ClientInput) {
  await q(
    `UPDATE ${S}.clients SET name=$1, company=$2, email=$3, phone=$4, address=$5, notes=$6, archived=$7, details=$8::jsonb WHERE id=$9`,
    [c.name, c.company, c.email, c.phone, c.address, c.notes, Boolean(c.archived), JSON.stringify(c.details ?? blankClientDetails), id],
  );
}

export async function deleteClient(id: string) {
  await q(`DELETE FROM ${S}.clients WHERE id = $1`, [id]);
}

/** Invoiced, paid and outstanding per client (invoices only, void excluded). */
export async function clientBalances(): Promise<Record<string, { invoiced: number; paid: number }>> {
  const invoices = await listInvoices({ kind: "invoice" });
  const out: Record<string, { invoiced: number; paid: number }> = {};
  for (const inv of invoices) {
    if (!inv.clientId || inv.status === "void" || inv.status === "draft") continue;
    out[inv.clientId] ??= { invoiced: 0, paid: 0 };
    out[inv.clientId].invoiced += inv.totals.total;
    out[inv.clientId].paid += inv.totals.paid;
  }
  return out;
}

/* ───────────── Projects ───────────── */

const mapProject = (r: Row): Project => ({
  id: String(r.id),
  clientId: (r.client_id as string) ?? null,
  clientName: (r.client_name as string) ?? null,
  leadId: (r.lead_id as string) ?? null,
  name: String(r.name),
  description: String(r.description ?? ""),
  status: String(r.status) as Project["status"],
  startOn: day(r.start_on),
  dueOn: day(r.due_on),
  budget: r.budget === null || r.budget === undefined ? null : num(r.budget),
  details: { ...blankProjectDetails, ...(json(r.details) as Partial<ProjectDetails>) },
  createdAt: iso(r.created_at),
  completedAt: r.completed_at ? iso(r.completed_at) : null,
  openTasks: Number(r.open_tasks ?? 0),
  doneTasks: Number(r.done_tasks ?? 0),
});

const projectSelect = `
  SELECT p.*, coalesce(nullif(c.company, ''), c.name) AS client_name,
    (SELECT count(*) FROM ${S}.tasks t WHERE t.project_id = p.id AND t.status <> 'done')::int AS open_tasks,
    (SELECT count(*) FROM ${S}.tasks t WHERE t.project_id = p.id AND t.status = 'done')::int AS done_tasks
  FROM ${S}.projects p LEFT JOIN ${S}.clients c ON c.id = p.client_id`;

export async function listProjects(filter: { clientId?: string } = {}): Promise<Project[]> {
  const rows = filter.clientId
    ? await q(`${projectSelect} WHERE p.client_id = $1 ORDER BY p.created_at DESC`, [filter.clientId])
    : await q(`${projectSelect} ORDER BY (p.status = 'done'), p.due_on NULLS LAST, p.created_at DESC`);
  return rows.map(mapProject);
}

export async function getProject(id: string): Promise<Project | null> {
  if (!isUuid(id)) return null;
  const r = await one(`${projectSelect} WHERE p.id = $1`, [id]);
  return r ? mapProject(r) : null;
}

export type ProjectInput = Pick<Project, "clientId" | "name" | "description" | "status" | "startOn" | "dueOn" | "budget"> & {
  leadId?: string | null;
  details?: ProjectDetails;
};

export async function createProject(p: ProjectInput): Promise<string> {
  const r = await one<{ id: string }>(
    `INSERT INTO ${S}.projects(client_id, lead_id, name, description, status, start_on, due_on, budget, details)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING id`,
    [p.clientId, p.leadId ?? null, p.name, p.description, p.status, p.startOn, p.dueOn, p.budget, JSON.stringify(p.details ?? blankProjectDetails)],
  );
  return String(r!.id);
}

export async function updateProject(id: string, p: ProjectInput) {
  await q(
    `UPDATE ${S}.projects SET client_id=$1, name=$2, description=$3, status=$4, start_on=$5, due_on=$6, budget=$7,
       completed_at = CASE WHEN $4 = 'done' THEN coalesce(completed_at, now()) ELSE NULL END,
       details = coalesce($9::jsonb, details)
     WHERE id=$8`,
    [p.clientId, p.name, p.description, p.status, p.startOn, p.dueOn, p.budget, id, p.details ? JSON.stringify(p.details) : null],
  );
}

export async function deleteProject(id: string) {
  await q(`DELETE FROM ${S}.projects WHERE id = $1`, [id]);
}

/* ───────────── Tasks ───────────── */

const mapTask = (r: Row): Task => ({
  id: String(r.id),
  projectId: (r.project_id as string) ?? null,
  projectName: (r.project_name as string) ?? null,
  title: String(r.title),
  description: String(r.description ?? ""),
  status: String(r.status) as Task["status"],
  priority: String(r.priority) as Task["priority"],
  assigneeId: (r.assignee_id as string) ?? null,
  dueOn: day(r.due_on),
  position: Number(r.position ?? 0),
  createdBy: (r.created_by as string) ?? null,
  createdAt: iso(r.created_at),
  completedAt: r.completed_at ? iso(r.completed_at) : null,
  comments: Number(r.comment_count ?? 0),
});

const taskSelect = `
  SELECT t.*, p.name AS project_name,
    (SELECT count(*) FROM ${S}.task_comments c WHERE c.task_id = t.id)::int AS comment_count
  FROM ${S}.tasks t LEFT JOIN ${S}.projects p ON p.id = t.project_id`;

export async function listTasks(filter: { projectId?: string; assigneeId?: string; includeDone?: boolean } = {}): Promise<Task[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.projectId) {
    params.push(filter.projectId);
    where.push(`t.project_id = $${params.length}`);
  }
  if (filter.assigneeId) {
    params.push(filter.assigneeId);
    where.push(`t.assignee_id = $${params.length}`);
  }
  if (!filter.includeDone) where.push(`(t.status <> 'done' OR t.completed_at > now() - interval '14 days')`);
  const rows = await q(
    `${taskSelect} ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY (t.status = 'done'), t.due_on NULLS LAST,
       CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, t.position, t.created_at`,
    params,
  );
  return rows.map(mapTask);
}

export async function getTask(id: string): Promise<Task | null> {
  if (!isUuid(id)) return null;
  const r = await one(`${taskSelect} WHERE t.id = $1`, [id]);
  return r ? mapTask(r) : null;
}

export type TaskInput = Pick<Task, "projectId" | "title" | "description" | "status" | "priority" | "assigneeId" | "dueOn">;

export async function createTask(t: TaskInput, createdBy: string): Promise<string> {
  const r = await one<{ id: string }>(
    `INSERT INTO ${S}.tasks(project_id, title, description, status, priority, assignee_id, due_on, created_by, position, completed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, extract(epoch from now()), CASE WHEN $4 = 'done' THEN now() END) RETURNING id`,
    [t.projectId, t.title, t.description, t.status, t.priority, t.assigneeId, t.dueOn, createdBy],
  );
  return String(r!.id);
}

export async function updateTask(id: string, patch: Partial<TaskInput>) {
  const cols: Record<string, string> = {
    projectId: "project_id",
    title: "title",
    description: "description",
    status: "status",
    priority: "priority",
    assigneeId: "assignee_id",
    dueOn: "due_on",
  };
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (!(k in cols) || v === undefined) continue;
    params.push(v === "" ? null : v);
    sets.push(`${cols[k]} = $${params.length}`);
  }
  if (!sets.length) return;
  params.push(id);
  await q(`UPDATE ${S}.tasks SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length}`, params);
  // Stamp (or clear) the completion time once the new status is stored.
  if (patch.status) {
    await q(
      `UPDATE ${S}.tasks SET completed_at = CASE WHEN status = 'done' THEN coalesce(completed_at, now()) ELSE NULL END WHERE id = $1`,
      [id],
    );
  }
}

export async function deleteTask(id: string) {
  await q(`DELETE FROM ${S}.tasks WHERE id = $1`, [id]);
}

export async function taskComments(taskId: string): Promise<Comment[]> {
  return (await q(`SELECT * FROM ${S}.task_comments WHERE task_id = $1 ORDER BY created_at`, [taskId])).map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    userName: String(r.user_name),
    body: String(r.body),
    createdAt: iso(r.created_at),
    attachments: (Array.isArray(r.attachments) ? r.attachments : JSON.parse(String(r.attachments ?? "[]"))) as Comment["attachments"],
  }));
}

export async function addTaskComment(taskId: string, userId: string, userName: string, body: string, attachments: Comment["attachments"]) {
  await q(`INSERT INTO ${S}.task_comments(task_id, user_id, user_name, body, attachments) VALUES ($1,$2,$3,$4,$5::jsonb)`, [
    taskId,
    userId,
    userName,
    body,
    JSON.stringify(attachments),
  ]);
  await q(`UPDATE ${S}.tasks SET updated_at = now() WHERE id = $1`, [taskId]);
}

/* ───────────── Invoices & quotes ───────────── */

const mapInvoiceRow = (r: Row) => ({
  id: String(r.id),
  kind: String(r.kind) as InvoiceKind,
  number: String(r.number),
  clientId: (r.client_id as string) ?? null,
  clientName: (r.client_name as string) ?? null,
  projectId: (r.project_id as string) ?? null,
  issueOn: day(r.issue_on)!,
  dueOn: day(r.due_on),
  status: String(r.status),
  vatRate: num(r.vat_rate),
  vatInclusive: Boolean(r.vat_inclusive),
  discount: num(r.discount),
  notes: String(r.notes ?? ""),
  terms: String(r.terms ?? ""),
  shareToken: String(r.share_token),
  convertedFrom: (r.converted_from as string) ?? null,
  billTo: (json(r.bill_to) as BillTo | null) ?? null,
  projectTitle: String(r.project_title ?? ""),
  payMethods: (json(r.pay_methods) as string[] | null) ?? [],
  showSignature: r.show_signature === undefined || r.show_signature === null ? true : Boolean(r.show_signature),
  createdAt: iso(r.created_at),
  sentAt: r.sent_at ? iso(r.sent_at) : null,
});

export async function listInvoices(filter: { kind?: InvoiceKind; clientId?: string } = {}): Promise<Invoice[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.kind) {
    params.push(filter.kind);
    where.push(`i.kind = $${params.length}`);
  }
  if (filter.clientId) {
    params.push(filter.clientId);
    where.push(`i.client_id = $${params.length}`);
  }
  const [rows, items, payments] = await Promise.all([
    q(
      `SELECT i.*, coalesce(nullif(c.company, ''), c.name) AS client_name FROM ${S}.invoices i
       LEFT JOIN ${S}.clients c ON c.id = i.client_id ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY i.issue_on DESC, i.created_at DESC`,
      params,
    ),
    q(`SELECT * FROM ${S}.invoice_items ORDER BY position`),
    q(`SELECT * FROM ${S}.payments ORDER BY paid_on`),
  ]);
  return rows.map((r) => assembleInvoice(r, items, payments));
}

function assembleInvoice(r: Row, items: Row[], payments: Row[]): Invoice {
  const base = mapInvoiceRow(r);
  const its: InvoiceItem[] = items
    .filter((i) => String(i.invoice_id) === base.id)
    .map((i) => ({ id: String(i.id), description: String(i.description), quantity: num(i.quantity), unitPrice: num(i.unit_price) }));
  const pays = payments
    .filter((p) => String(p.invoice_id) === base.id)
    .map((p) => ({
      id: String(p.id),
      paidOn: day(p.paid_on)!,
      amount: num(p.amount),
      method: String(p.method),
      reference: String(p.reference ?? ""),
      note: String(p.note ?? ""),
      receiptNo: String(p.receipt_no ?? ""),
    }));
  const paid = pays.reduce((s, p) => s + p.amount, 0);
  return { ...base, items: its, payments: pays, totals: computeTotals(its, base, paid) };
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  if (!isUuid(id)) return null;
  const r = await one(
    `SELECT i.*, coalesce(nullif(c.company, ''), c.name) AS client_name FROM ${S}.invoices i LEFT JOIN ${S}.clients c ON c.id = i.client_id WHERE i.id = $1`,
    [id],
  );
  if (!r) return null;
  const [items, payments] = await Promise.all([
    q(`SELECT * FROM ${S}.invoice_items WHERE invoice_id = $1 ORDER BY position`, [id]),
    q(`SELECT * FROM ${S}.payments WHERE invoice_id = $1 ORDER BY paid_on`, [id]),
  ]);
  return assembleInvoice(r, items, payments);
}

export async function getInvoiceByToken(token: string): Promise<Invoice | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const r = await one<{ id: string }>(`SELECT id FROM ${S}.invoices WHERE share_token = $1`, [token]);
  return r ? getInvoice(String(r.id)) : null;
}

export type InvoiceInput = {
  clientId: string | null;
  projectId: string | null;
  issueOn: string;
  dueOn: string | null;
  status: string;
  vatRate: number;
  vatInclusive: boolean;
  discount: number;
  notes: string;
  terms: string;
  items: InvoiceItem[];
  billTo: BillTo | null;
  projectTitle: string;
  payMethods: string[];
  showSignature: boolean;
};

const docPrefix = (kind: InvoiceKind, s: BusinessSettings) => (kind === "quote" ? s.quotePrefix : kind === "receipt" ? s.receiptPrefix : s.invoicePrefix);

export async function createInvoice(kind: InvoiceKind, input: InvoiceInput, createdBy: string, convertedFrom?: string): Promise<string> {
  const settings = await getBusinessSettings();
  const n = await nextNumber(kind);
  const number = `${docPrefix(kind, settings)}${String(n).padStart(4, "0")}`;
  const token = randomBytes(18).toString("base64url");
  const row = await one<{ id: string }>(
    `INSERT INTO ${S}.invoices(kind, number, client_id, project_id, issue_on, due_on, status, vat_rate, vat_inclusive, discount, notes, terms, share_token, converted_from, created_by,
       bill_to, project_title, pay_methods, show_signature)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17,$18::jsonb,$19) RETURNING id`,
    [
      kind,
      number,
      input.clientId,
      input.projectId,
      input.issueOn,
      input.dueOn,
      input.status,
      input.vatRate,
      input.vatInclusive,
      input.discount,
      input.notes,
      input.terms,
      token,
      convertedFrom ?? null,
      createdBy,
      input.billTo ? JSON.stringify(input.billTo) : null,
      input.projectTitle,
      JSON.stringify(input.payMethods),
      input.showSignature,
    ],
  );
  const id = String(row!.id);
  await replaceItems(id, input.items);
  return id;
}

async function replaceItems(invoiceId: string, items: InvoiceItem[]) {
  await tx([
    { text: `DELETE FROM ${S}.invoice_items WHERE invoice_id = $1`, params: [invoiceId] },
    ...items.map((it, i) => ({
      text: `INSERT INTO ${S}.invoice_items(invoice_id, description, quantity, unit_price, position) VALUES ($1,$2,$3,$4,$5)`,
      params: [invoiceId, it.description, it.quantity, it.unitPrice, i],
    })),
  ]);
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  await q(
    `UPDATE ${S}.invoices SET client_id=$1, project_id=$2, issue_on=$3, due_on=$4, status=$5, vat_rate=$6, vat_inclusive=$7,
       discount=$8, notes=$9, terms=$10, sent_at = CASE WHEN $5 <> 'draft' THEN coalesce(sent_at, now()) ELSE sent_at END,
       bill_to=$12::jsonb, project_title=$13, pay_methods=$14::jsonb, show_signature=$15
     WHERE id=$11`,
    [
      input.clientId,
      input.projectId,
      input.issueOn,
      input.dueOn,
      input.status,
      input.vatRate,
      input.vatInclusive,
      input.discount,
      input.notes,
      input.terms,
      id,
      input.billTo ? JSON.stringify(input.billTo) : null,
      input.projectTitle,
      JSON.stringify(input.payMethods),
      input.showSignature,
    ],
  );
  await replaceItems(id, input.items);
}

export async function setInvoiceStatus(id: string, status: string) {
  await q(
    `UPDATE ${S}.invoices SET status = $1, sent_at = CASE WHEN $1 <> 'draft' THEN coalesce(sent_at, now()) ELSE sent_at END WHERE id = $2`,
    [status, id],
  );
}

export async function deleteInvoice(id: string) {
  await q(`DELETE FROM ${S}.invoices WHERE id = $1`, [id]);
}

/** After a payment changes, keep the invoice status in step with the balance. */
export async function refreshPaymentStatus(invoiceId: string) {
  const inv = await getInvoice(invoiceId);
  if (!inv || inv.kind !== "invoice" || inv.status === "void") return;
  const status = inv.totals.paid <= 0 ? (inv.status === "draft" ? "draft" : "sent") : inv.totals.balance <= 0.004 ? "paid" : "partial";
  if (status !== inv.status) await setInvoiceStatus(invoiceId, status);
}

/** A standalone receipt holds exactly one payment: the amount received. */
export async function setReceiptPayment(invoiceId: string, number: string, p: { paidOn: string; amount: number; method: string; reference: string }) {
  await tx([
    { text: `DELETE FROM ${S}.payments WHERE invoice_id = $1`, params: [invoiceId] },
    {
      text: `INSERT INTO ${S}.payments(invoice_id, paid_on, amount, method, reference, note, receipt_no) VALUES ($1,$2,$3,$4,$5,'',$6)`,
      params: [invoiceId, p.paidOn, p.amount, p.method, p.reference, number],
    },
  ]);
}

/** A receipt number from the shared receipt sequence. */
export async function nextReceiptNo(): Promise<string> {
  const settings = await getBusinessSettings();
  return `${settings.receiptPrefix}${String(await nextNumber("receipt")).padStart(4, "0")}`;
}

export async function addPayment(invoiceId: string, p: { paidOn: string; amount: number; method: string; reference: string; note: string }) {
  await q(`INSERT INTO ${S}.payments(invoice_id, paid_on, amount, method, reference, note, receipt_no) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
    invoiceId,
    p.paidOn,
    p.amount,
    p.method,
    p.reference,
    p.note,
    await nextReceiptNo(),
  ]);
  await refreshPaymentStatus(invoiceId);
}

export async function deletePayment(paymentId: string) {
  const r = await one<{ invoice_id: string }>(`DELETE FROM ${S}.payments WHERE id = $1 RETURNING invoice_id`, [paymentId]);
  if (r) await refreshPaymentStatus(String(r.invoice_id));
}

/* ───────────── Expenses ───────────── */

const mapExpense = (r: Row): Expense => ({
  id: String(r.id),
  spentOn: day(r.spent_on)!,
  category: String(r.category),
  vendor: String(r.vendor ?? ""),
  description: String(r.description ?? ""),
  amount: num(r.amount),
  vat: num(r.vat),
  method: String(r.method),
  reference: String(r.reference ?? ""),
  receiptUrl: String(r.receipt_url ?? ""),
  projectId: (r.project_id as string) ?? null,
  projectName: (r.project_name as string) ?? null,
  createdAt: iso(r.created_at),
});

export async function listExpenses(range?: { from: string; to: string }): Promise<Expense[]> {
  const rows = range
    ? await q(
        `SELECT e.*, p.name AS project_name FROM ${S}.expenses e LEFT JOIN ${S}.projects p ON p.id = e.project_id
         WHERE e.spent_on BETWEEN $1 AND $2 ORDER BY e.spent_on DESC, e.created_at DESC`,
        [range.from, range.to],
      )
    : await q(
        `SELECT e.*, p.name AS project_name FROM ${S}.expenses e LEFT JOIN ${S}.projects p ON p.id = e.project_id
         ORDER BY e.spent_on DESC, e.created_at DESC LIMIT 2000`,
      );
  return rows.map(mapExpense);
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "projectName">;

export async function saveExpense(id: string | null, e: ExpenseInput, userId: string) {
  if (id) {
    await q(
      `UPDATE ${S}.expenses SET spent_on=$1, category=$2, vendor=$3, description=$4, amount=$5, vat=$6, method=$7, reference=$8, receipt_url=$9, project_id=$10 WHERE id=$11`,
      [e.spentOn, e.category, e.vendor, e.description, e.amount, e.vat, e.method, e.reference, e.receiptUrl, e.projectId, id],
    );
  } else {
    await q(
      `INSERT INTO ${S}.expenses(spent_on, category, vendor, description, amount, vat, method, reference, receipt_url, project_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [e.spentOn, e.category, e.vendor, e.description, e.amount, e.vat, e.method, e.reference, e.receiptUrl, e.projectId, userId],
    );
  }
}

export async function deleteExpense(id: string) {
  await q(`DELETE FROM ${S}.expenses WHERE id = $1`, [id]);
}

/* ───────────── Live updates ───────────── */

/** Marks "something changed" so open admin screens refresh themselves. */
export async function touchPulse() {
  await setSetting("pulse", new Date().toISOString());
}

export async function readPulse(): Promise<string> {
  return (await getSetting<string>("pulse")) ?? "";
}

/* ───────────── Helpers ───────────── */

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Today in Nairobi as YYYY-MM-DD. */
export function todayKE(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Badge count: my open tasks that are due today or late. */
export async function myDueTaskCount(userId: string): Promise<number> {
  const r = await one<{ n: number }>(
    `SELECT count(*)::int AS n FROM ${S}.tasks WHERE assignee_id = $1 AND status <> 'done' AND due_on IS NOT NULL AND due_on <= $2::date`,
    [userId, todayKE()],
  );
  return Number(r?.n ?? 0);
}
