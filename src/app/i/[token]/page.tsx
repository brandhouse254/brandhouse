import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbConfigured } from "@/lib/db";
import { getBusinessSettings, getClient, getInvoiceByToken } from "@/lib/biz/data";
import { invoiceStatuses, kes, labelOf } from "@/lib/biz/types";
import { Logo } from "@/components/Logo";
import { PrintButton } from "./print-button";

/** The quote or invoice a client opens from a shared link: clean, light and printable. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Document",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

const fmt = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";

export default async function SharedDocument({ params }: { params: Promise<{ token: string }> }) {
  if (!dbConfigured()) notFound();
  const { token } = await params;
  const doc = await getInvoiceByToken(token);
  if (!doc || (doc.kind === "invoice" && doc.status === "draft")) notFound();
  const [biz, client] = await Promise.all([getBusinessSettings(), doc.clientId ? getClient(doc.clientId) : null]);
  const t = doc.totals;
  const isQuote = doc.kind === "quote";
  const title = isQuote ? "Quotation" : "Invoice";
  const paid = !isQuote && doc.status === "paid";
  const voided = doc.status === "void";

  return (
    <div className="min-h-svh bg-[#ecebe7] py-6 text-[#111] print:bg-white print:py-0 sm:py-10">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end px-4 print:hidden">
        <PrintButton />
      </div>
      <article className="relative mx-auto max-w-3xl overflow-hidden bg-white px-6 py-8 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)] print:max-w-none print:px-0 print:py-0 print:shadow-none sm:px-12 sm:py-12">
        {paid || voided ? (
          <div className="pointer-events-none absolute right-6 top-28 rotate-[-12deg] rounded-lg border-4 px-4 py-1 font-display text-3xl font-bold uppercase tracking-widest opacity-70 sm:right-12" style={{ color: paid ? "#059669" : "#b91c1c", borderColor: paid ? "#059669" : "#b91c1c" }}>
            {paid ? "Paid" : "Void"}
          </div>
        ) : null}

        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#111]/10 pb-8">
          <div>
            <Logo className="h-12 text-[#111]" />
            <div className="mt-4 space-y-0.5 text-sm text-[#555]">
              <p className="font-semibold text-[#111]">{biz.legalName}</p>
              {biz.address ? <p className="whitespace-pre-line">{biz.address}</p> : null}
              {biz.phone ? <p>{biz.phone}</p> : null}
              {biz.email ? <p>{biz.email}</p> : null}
              {biz.kraPin ? <p>KRA PIN: {biz.kraPin}</p> : null}
            </div>
          </div>
          <div className="text-right">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">{title}</h1>
            <p className="mt-1 text-lg tabular-nums text-[#555]">{doc.number}</p>
            <dl className="mt-4 space-y-0.5 text-sm">
              <div>
                <dt className="inline text-[#777]">Date: </dt>
                <dd className="inline">{fmt(doc.issueOn)}</dd>
              </div>
              {doc.dueOn ? (
                <div>
                  <dt className="inline text-[#777]">{isQuote ? "Valid until: " : "Due: "}</dt>
                  <dd className="inline font-medium">{fmt(doc.dueOn)}</dd>
                </div>
              ) : null}
              {!isQuote ? (
                <div>
                  <dt className="inline text-[#777]">Status: </dt>
                  <dd className="inline">{labelOf(invoiceStatuses.invoice, doc.status)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </header>

        <section className="py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">{isQuote ? "Prepared for" : "Bill to"}</p>
          <div className="mt-2 text-sm leading-relaxed">
            <p className="text-base font-semibold">{client?.company || client?.name || doc.clientName}</p>
            {client?.company ? <p>{client.name}</p> : null}
            {client?.address ? <p className="whitespace-pre-line text-[#555]">{client.address}</p> : null}
            {client?.email ? <p className="text-[#555]">{client.email}</p> : null}
            {client?.phone ? <p className="text-[#555]">{client.phone}</p> : null}
            {client?.kraPin ? <p className="text-[#555]">KRA PIN: {client.kraPin}</p> : null}
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#111] text-left text-xs uppercase tracking-[0.1em] text-[#555]">
              <th className="py-2 pr-3 font-semibold">Description</th>
              <th className="w-16 py-2 text-right font-semibold">Qty</th>
              <th className="hidden w-32 py-2 text-right font-semibold sm:table-cell">Rate</th>
              <th className="w-32 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((it, i) => (
              <tr key={it.id ?? i} className="border-b border-[#111]/10 align-top">
                <td className="py-3 pr-3">
                  {it.description}
                  <span className="block text-xs text-[#777] sm:hidden">{kes(it.unitPrice)} each</span>
                </td>
                <td className="py-3 text-right tabular-nums">{it.quantity}</td>
                <td className="hidden py-3 text-right tabular-nums sm:table-cell">{kes(it.unitPrice)}</td>
                <td className="py-3 text-right tabular-nums">{kes(it.quantity * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm tabular-nums">
            <div className="flex justify-between">
              <dt className="text-[#555]">Subtotal</dt>
              <dd>{kes(t.subtotal)}</dd>
            </div>
            {t.discount ? (
              <div className="flex justify-between">
                <dt className="text-[#555]">Discount</dt>
                <dd>−{kes(t.discount)}</dd>
              </div>
            ) : null}
            {t.vat ? (
              <div className="flex justify-between">
                <dt className="text-[#555]">VAT {doc.vatRate}%{doc.vatInclusive ? " (included)" : ""}</dt>
                <dd>{kes(t.vat)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t-2 border-[#111] pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{kes(t.total)}</dd>
            </div>
            {!isQuote && t.paid ? (
              <>
                <div className="flex justify-between text-[#059669]">
                  <dt>Paid</dt>
                  <dd>−{kes(t.paid)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>Balance due</dt>
                  <dd>{kes(t.balance)}</dd>
                </div>
              </>
            ) : null}
          </dl>
        </div>

        {doc.notes ? (
          <section className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Notes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{doc.notes}</p>
          </section>
        ) : null}

        {!voided && (biz.mpesaPaybill || biz.mpesaTill || biz.bankAccountNumber) ? (
          <section className="mt-10 grid gap-6 rounded-xl bg-[#f6f5f2] p-6 text-sm sm:grid-cols-2 print:bg-white print:ring-1 print:ring-[#ddd]">
            {biz.mpesaPaybill || biz.mpesaTill ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Pay by M-Pesa</p>
                <div className="mt-2 space-y-0.5">
                  {biz.mpesaPaybill ? (
                    <>
                      <p>
                        Paybill: <strong className="tabular-nums">{biz.mpesaPaybill}</strong>
                      </p>
                      <p>
                        Account: <strong>{doc.number}</strong>
                      </p>
                    </>
                  ) : null}
                  {biz.mpesaTill ? (
                    <p>
                      Till (Buy Goods): <strong className="tabular-nums">{biz.mpesaTill}</strong>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {biz.bankAccountNumber ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">Bank transfer</p>
                <div className="mt-2 space-y-0.5">
                  {biz.bankName ? <p>{biz.bankName}{biz.bankBranch ? `, ${biz.bankBranch}` : ""}</p> : null}
                  {biz.bankAccountName ? <p>{biz.bankAccountName}</p> : null}
                  <p>
                    Account: <strong className="tabular-nums">{biz.bankAccountNumber}</strong>
                  </p>
                  {biz.bankSwift ? <p>SWIFT: {biz.bankSwift}</p> : null}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {doc.terms ? <p className="mt-8 whitespace-pre-wrap text-xs leading-relaxed text-[#666]">{doc.terms}</p> : null}
        <footer className="mt-10 border-t border-[#111]/10 pt-5 text-center text-xs text-[#777]">{biz.invoiceFooter}</footer>
      </article>
    </div>
  );
}
