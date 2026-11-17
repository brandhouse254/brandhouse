import { listExpenses, listInvoices, todayKE } from "./data";
import type { Expense, Invoice } from "./types";

/**
 * Money reports. Profit is on a cash basis (money actually received minus
 * money spent), excluding VAT, which is what a small studio usually wants to
 * know. Invoiced amounts are shown alongside for the accrual view.
 */

export type MonthRow = {
  month: string; // YYYY-MM
  invoiced: number;
  received: number;
  receivedNet: number;
  vatCollected: number;
  expenses: number;
  vatPaid: number;
  profit: number;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Share of a payment that is income (excluding VAT) for its invoice. */
const netShare = (inv: Invoice) => (inv.totals.total > 0 ? inv.totals.net / inv.totals.total : 1);

const counts = (inv: Invoice) => inv.kind === "invoice" && inv.status !== "draft" && inv.status !== "void";

export async function yearReport(year: number) {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const [all, expenses] = await Promise.all([listInvoices(), listExpenses({ from, to })]);
  // Invoices count when sent; standalone receipts are money received without an invoice.
  const invoices = all.filter((d) => counts(d) || (d.kind === "receipt" && d.status !== "void"));
  const months: MonthRow[] = Array.from({ length: 12 }, (_, i) => ({
    month: `${year}-${String(i + 1).padStart(2, "0")}`,
    invoiced: 0,
    received: 0,
    receivedNet: 0,
    vatCollected: 0,
    expenses: 0,
    vatPaid: 0,
    profit: 0,
  }));
  const at = (d: string) => (d.startsWith(String(year)) ? months[Number(d.slice(5, 7)) - 1] : undefined);
  const byClient = new Map<string, { name: string; received: number }>();

  for (const inv of invoices) {
    const m = inv.kind === "invoice" ? at(inv.issueOn) : undefined;
    if (m) m.invoiced += inv.totals.total;
    for (const p of inv.payments) {
      const pm = at(p.paidOn);
      if (!pm) continue;
      const net = p.amount * netShare(inv);
      pm.received += p.amount;
      pm.receivedNet += net;
      pm.vatCollected += p.amount - net;
      const key = inv.clientId ?? "none";
      const c = byClient.get(key) ?? { name: inv.clientName ?? (inv.billTo?.company || inv.billTo?.name || "No client"), received: 0 };
      c.received += p.amount;
      byClient.set(key, c);
    }
  }
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    const m = at(e.spentOn);
    if (!m) continue;
    m.expenses += e.amount;
    m.vatPaid += e.vat;
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }
  for (const m of months) {
    m.invoiced = r2(m.invoiced);
    m.received = r2(m.received);
    m.receivedNet = r2(m.receivedNet);
    m.vatCollected = r2(m.vatCollected);
    m.expenses = r2(m.expenses);
    m.vatPaid = r2(m.vatPaid);
    m.profit = r2(m.receivedNet - (m.expenses - m.vatPaid));
  }
  const total = months.reduce(
    (t, m) => {
      for (const k of ["invoiced", "received", "receivedNet", "vatCollected", "expenses", "vatPaid", "profit"] as const) t[k] = r2(t[k] + m[k]);
      return t;
    },
    { month: String(year), invoiced: 0, received: 0, receivedNet: 0, vatCollected: 0, expenses: 0, vatPaid: 0, profit: 0 } as MonthRow,
  );
  return {
    months,
    total,
    categories: [...byCategory.entries()].map(([category, amount]) => ({ category, amount: r2(amount) })).sort((a, b) => b.amount - a.amount),
    clients: [...byClient.values()].map((c) => ({ ...c, received: r2(c.received) })).sort((a, b) => b.received - a.received).slice(0, 10),
  };
}

export type Receivable = { invoice: Invoice; daysOverdue: number };

const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/** Unpaid invoices, oldest first, with how late each one is. */
export async function receivables() {
  const today = todayKE();
  const open = (await listInvoices({ kind: "invoice" })).filter((i) => counts(i) && i.totals.balance > 0.004);
  const items: Receivable[] = open
    .map((invoice) => ({ invoice, daysOverdue: invoice.dueOn ? Math.max(daysBetween(invoice.dueOn, today), 0) : 0 }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
  const buckets = [
    { label: "Not yet due", min: 0, max: 0 },
    { label: "1–30 days late", min: 1, max: 30 },
    { label: "31–60 days late", min: 31, max: 60 },
    { label: "61–90 days late", min: 61, max: 90 },
    { label: "Over 90 days late", min: 91, max: Infinity },
  ].map((b) => {
    const inBucket = items.filter((i) => i.daysOverdue >= b.min && i.daysOverdue <= b.max);
    return { label: b.label, count: inBucket.length, amount: r2(inBucket.reduce((s, i) => s + i.invoice.totals.balance, 0)) };
  });
  return {
    items,
    buckets,
    total: r2(items.reduce((s, i) => s + i.invoice.totals.balance, 0)),
    overdue: r2(items.filter((i) => i.daysOverdue > 0).reduce((s, i) => s + i.invoice.totals.balance, 0)),
  };
}

/** This month at a glance, for the dashboard and Finance overview. */
export async function monthSnapshot() {
  const today = todayKE();
  const year = Number(today.slice(0, 4));
  const report = await yearReport(year);
  const m = report.months[Number(today.slice(5, 7)) - 1];
  return { month: m, year: report.total };
}

/* ───────────── CSV ───────────── */

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Guard against spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsv = (rows: unknown[][]) => `﻿${rows.map((r) => r.map(cell).join(",")).join("\r\n")}\r\n`;

export function invoicesCsv(invoices: Invoice[]) {
  return toCsv([
    ["Type", "Number", "Client", "Issued", "Due", "Status", "Subtotal", "Discount", "Net", "VAT", "Total", "Paid", "Balance"],
    ...invoices.map((i) => [
      i.kind === "quote" ? "Quote" : i.kind === "receipt" ? "Receipt" : "Invoice",
      i.number,
      i.clientName ?? i.billTo?.company ?? i.billTo?.name ?? "",
      i.issueOn,
      i.dueOn ?? "",
      i.status,
      i.totals.subtotal,
      i.totals.discount,
      i.totals.net,
      i.totals.vat,
      i.totals.total,
      i.totals.paid,
      i.totals.balance,
    ]),
  ]);
}

export function paymentsCsv(invoices: Invoice[]) {
  return toCsv([
    ["Date", "Receipt", "Invoice", "Client", "Amount", "Of which VAT", "Method", "Reference", "Note"],
    ...invoices
      .flatMap((i) => i.payments.map((p) => ({ i, p })))
      .sort((a, b) => a.p.paidOn.localeCompare(b.p.paidOn))
      .map(({ i, p }) => [p.paidOn, p.receiptNo, i.kind === "receipt" ? "" : i.number, i.clientName ?? i.billTo?.company ?? i.billTo?.name ?? "", p.amount, r2(p.amount - p.amount * netShare(i)), p.method, p.reference, p.note]),
  ]);
}

export function expensesCsv(expenses: Expense[]) {
  return toCsv([
    ["Date", "Category", "Vendor", "Description", "Amount", "VAT", "Method", "Reference", "Project", "Receipt"],
    ...[...expenses]
      .sort((a, b) => a.spentOn.localeCompare(b.spentOn))
      .map((e) => [e.spentOn, e.category, e.vendor, e.description, e.amount, e.vat, e.method, e.reference, e.projectName ?? "", e.receiptUrl]),
  ]);
}
