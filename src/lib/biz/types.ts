/** Shared shapes for the business side of the admin (safe to import in the browser). */

export const leadStages = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "proposal", label: "Proposal sent" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;
export type LeadStage = (typeof leadStages)[number]["id"];

export const projectStatuses = [
  { id: "planning", label: "Planning" },
  { id: "active", label: "In progress" },
  { id: "on_hold", label: "On hold" },
  { id: "done", label: "Completed" },
] as const;
export type ProjectStatus = (typeof projectStatuses)[number]["id"];

export const taskStatuses = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "review", label: "In review" },
  { id: "done", label: "Done" },
] as const;
export type TaskStatus = (typeof taskStatuses)[number]["id"];

export const taskPriorities = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
] as const;
export type TaskPriority = (typeof taskPriorities)[number]["id"];

export const invoiceStatuses = {
  quote: [
    { id: "draft", label: "Draft" },
    { id: "sent", label: "Sent" },
    { id: "accepted", label: "Accepted" },
    { id: "declined", label: "Declined" },
  ],
  invoice: [
    { id: "draft", label: "Draft" },
    { id: "sent", label: "Sent" },
    { id: "partial", label: "Part paid" },
    { id: "paid", label: "Paid" },
    { id: "void", label: "Void" },
  ],
} as const;

export const paymentMethods = [
  { id: "mpesa", label: "M-Pesa" },
  { id: "bank", label: "Bank transfer" },
  { id: "cash", label: "Cash" },
  { id: "cheque", label: "Cheque" },
  { id: "card", label: "Card" },
  { id: "other", label: "Other" },
] as const;

export const expenseCategories = [
  "Equipment & gear",
  "Equipment hire",
  "Crew & freelancers",
  "Talent & models",
  "Locations & permits",
  "Transport & fuel",
  "Software & subscriptions",
  "Advertising (client spend)",
  "Printing & production",
  "Rent & utilities",
  "Internet & airtime",
  "Salaries",
  "Meals & entertainment",
  "Bank & M-Pesa charges",
  "Taxes & licences",
  "Office supplies",
  "Other",
] as const;

export type TeamMember = { id: string; name: string; role: "owner" | "editor"; active: boolean };

export type Lead = {
  id: string;
  source: string;
  name: string;
  organisation: string;
  email: string;
  phone: string;
  services: string[];
  budget: string;
  timeline: string;
  referral: string;
  description: string;
  stage: LeadStage;
  assigneeId: string | null;
  followUpOn: string | null;
  value: number | null;
  read: boolean;
  clientId: string | null;
  projectId: string | null;
  receivedAt: string;
  updatedAt: string;
};

export type Note = { id: string; userId: string; userName: string; body: string; createdAt: string };

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  kraPin: string;
  address: string;
  notes: string;
  archived: boolean;
  createdAt: string;
};

export type Project = {
  id: string;
  clientId: string | null;
  clientName: string | null;
  leadId: string | null;
  name: string;
  description: string;
  status: ProjectStatus;
  startOn: string | null;
  dueOn: string | null;
  budget: number | null;
  createdAt: string;
  completedAt: string | null;
  openTasks: number;
  doneTasks: number;
};

export type Attachment = { url: string; name: string; kind: "image" | "video" | "file" };

export type Task = {
  id: string;
  projectId: string | null;
  projectName: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueOn: string | null;
  position: number;
  createdBy: string | null;
  createdAt: string;
  completedAt: string | null;
  comments: number;
};

export type Comment = Note & { attachments: Attachment[] };

export type InvoiceKind = "quote" | "invoice";

export type InvoiceItem = { id?: string; description: string; quantity: number; unitPrice: number };

export type Payment = { id: string; paidOn: string; amount: number; method: string; reference: string; note: string };

export type Invoice = {
  id: string;
  kind: InvoiceKind;
  number: string;
  clientId: string | null;
  clientName: string | null;
  projectId: string | null;
  issueOn: string;
  dueOn: string | null;
  status: string;
  vatRate: number;
  vatInclusive: boolean;
  discount: number;
  notes: string;
  terms: string;
  shareToken: string;
  convertedFrom: string | null;
  createdAt: string;
  sentAt: string | null;
  items: InvoiceItem[];
  payments: Payment[];
  totals: Totals;
};

export type Totals = { subtotal: number; discount: number; net: number; vat: number; total: number; paid: number; balance: number };

export type Expense = {
  id: string;
  spentOn: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  vat: number;
  method: string;
  reference: string;
  receiptUrl: string;
  projectId: string | null;
  projectName: string | null;
  createdAt: string;
};

export type BusinessSettings = {
  legalName: string;
  kraPin: string;
  vatRegistered: boolean;
  address: string;
  email: string;
  phone: string;
  mpesaPaybill: string;
  mpesaAccountHint: string;
  mpesaTill: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankSwift: string;
  invoicePrefix: string;
  quotePrefix: string;
  defaultVatRate: number;
  defaultDueDays: number;
  defaultTerms: string;
  invoiceFooter: string;
};

/** Money as "KES 12,500" (no decimals unless needed). */
export function kes(n: number) {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: hasCents ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** Invoice maths, shared by the editor (live preview) and the server (stored totals). */
export function computeTotals(
  items: InvoiceItem[],
  opts: { vatRate: number; vatInclusive: boolean; discount: number },
  paid = 0,
): Totals {
  const round = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round(items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0));
  const discount = round(Math.min(Math.max(opts.discount || 0, 0), subtotal));
  const afterDiscount = subtotal - discount;
  const rate = Math.max(opts.vatRate || 0, 0) / 100;
  let net: number, vat: number, total: number;
  if (opts.vatInclusive) {
    total = round(afterDiscount);
    net = round(total / (1 + rate));
    vat = round(total - net);
  } else {
    net = round(afterDiscount);
    vat = round(net * rate);
    total = round(net + vat);
  }
  return { subtotal, discount, net, vat, total, paid: round(paid), balance: round(total - paid) };
}

export const labelOf = (list: readonly { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? id;
