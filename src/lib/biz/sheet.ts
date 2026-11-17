import type { SheetData } from "@/components/docs/sheet";
import { docWords, invoiceStatuses, labelOf, type BillTo, type BusinessSettings, type Client, type Invoice, type Payment } from "./types";

export const billToFromClient = (c: Pick<Client, "name" | "company" | "email" | "phone" | "address"> | null | undefined): BillTo => ({
  name: c?.name ?? "",
  company: c?.company ?? "",
  email: c?.email ?? "",
  phone: c?.phone ?? "",
  address: c?.address ?? "",
});

/** Who the document is for: what was typed on it, else the linked client's details. */
export const billToOf = (doc: Pick<Invoice, "billTo" | "clientName">, client?: Client | null): BillTo =>
  doc.billTo ?? (client ? billToFromClient(client) : { name: doc.clientName ?? "", company: "", email: "", phone: "", address: "" });

export const recipientName = (doc: Pick<Invoice, "billTo" | "clientName">) => doc.billTo?.company || doc.billTo?.name || doc.clientName || "";

/** The payment options chosen for a document (all of them when none were picked). */
export const payOptionsFor = (ids: string[], biz: BusinessSettings) => (ids.length ? biz.payOptions.filter((o) => ids.includes(o.id)) : biz.payOptions);

export function sheetForDocument(doc: Invoice, biz: BusinessSettings, client?: Client | null): SheetData {
  const w = docWords[doc.kind];
  const receiptPayment = doc.kind === "receipt" ? doc.payments[0] : undefined;
  return {
    title: w.title,
    number: doc.number,
    issueOn: doc.issueOn,
    dueOn: doc.kind === "receipt" ? null : doc.dueOn,
    dueLabel: doc.kind === "quote" ? "Valid until" : "Due",
    statusLabel: doc.kind === "invoice" ? labelOf(invoiceStatuses.invoice, doc.status) : undefined,
    stamp: doc.status === "void" ? "void" : doc.kind === "invoice" && doc.status === "paid" ? "paid" : null,
    toLabel: w.to,
    to: billToOf(doc, client),
    projectTitle: doc.projectTitle,
    items: doc.items,
    totals: doc.totals,
    vatRate: doc.vatRate,
    vatInclusive: doc.vatInclusive,
    showPaid: doc.kind === "invoice",
    notes: doc.notes,
    terms: doc.kind === "receipt" ? "" : doc.terms,
    payOptions: doc.kind === "receipt" || doc.status === "void" || doc.status === "paid" ? [] : payOptionsFor(doc.payMethods, biz),
    signature: doc.showSignature ? { url: biz.signatureUrl, name: biz.signatoryName, title: biz.signatoryTitle } : null,
    receipt: receiptPayment
      ? { amount: receiptPayment.amount, paidOn: receiptPayment.paidOn, method: receiptPayment.method, reference: receiptPayment.reference }
      : undefined,
  };
}

/** A receipt for one payment made against an invoice. */
export function sheetForPayment(doc: Invoice, payment: Payment, index: number, biz: BusinessSettings, client?: Client | null): SheetData {
  const paidSoFar = doc.payments.slice(0, index + 1).reduce((s, p) => s + p.amount, 0);
  return {
    title: "Receipt",
    number: payment.receiptNo || `${doc.number}-R${index + 1}`,
    issueOn: payment.paidOn,
    dueOn: null,
    dueLabel: "",
    toLabel: "Received from",
    to: billToOf(doc, client),
    projectTitle: doc.projectTitle,
    items: [],
    totals: doc.totals,
    vatRate: doc.vatRate,
    vatInclusive: doc.vatInclusive,
    showPaid: false,
    notes: payment.note,
    terms: "",
    payOptions: [],
    signature: doc.showSignature ? { url: biz.signatureUrl, name: biz.signatoryName, title: biz.signatoryTitle } : null,
    receipt: {
      amount: payment.amount,
      paidOn: payment.paidOn,
      method: payment.method,
      reference: payment.reference,
      forNumber: doc.number,
      balance: Math.round((doc.totals.total - paidSoFar) * 100) / 100,
    },
  };
}
