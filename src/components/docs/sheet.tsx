import { Logo } from "@/components/Logo";
import { kes, labelOf, paymentMethods, type BillTo, type BusinessSettings, type PayOption, type Totals } from "@/lib/biz/types";
import { amountInWords } from "@/lib/biz/words";
import { cn } from "@/lib/cn";

/**
 * The branded quote / invoice / receipt. One component renders the shared link
 * clients open (and print to PDF), the preview in the admin and the live
 * preview while editing, so all three always match.
 */

export type SheetData = {
  title: string;
  number: string;
  issueOn: string;
  dueOn: string | null;
  dueLabel: string;
  statusLabel?: string;
  stamp?: "paid" | "void" | null;
  toLabel: string;
  to: BillTo;
  projectTitle: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  totals: Totals;
  vatRate: number;
  vatInclusive: boolean;
  /** Show paid / balance lines (invoices). */
  showPaid: boolean;
  notes: string;
  terms: string;
  payOptions: PayOption[];
  signature: { url: string; name: string; title: string } | null;
  /** Receipts: the money received. */
  receipt?: { amount: number; paidOn: string; method: string; reference: string; forNumber?: string; balance?: number | null };
};

type Biz = Pick<BusinessSettings, "legalName" | "address" | "phone" | "email" | "kraPin" | "invoiceFooter">;

export const fmtDocDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8a857d]", className)}>{children}</p>;
}

export function DocumentSheet({ data: d, biz, className }: { data: SheetData; biz: Biz; className?: string }) {
  const t = d.totals;
  const hasItems = d.items.some((i) => i.description.trim() || i.unitPrice);
  const to = d.to;
  return (
    <article className={cn("bh-sheet relative overflow-hidden bg-white text-[#111]", className)}>
      {d.stamp ? (
        <div
          className="pointer-events-none absolute right-8 top-48 z-10 rotate-[-12deg] rounded-xl border-[5px] px-5 py-1.5 font-display text-4xl font-bold uppercase tracking-[0.2em] opacity-75"
          style={{ color: d.stamp === "paid" ? "#059669" : "#b91c1c", borderColor: d.stamp === "paid" ? "#059669" : "#b91c1c" }}
        >
          {d.stamp}
        </div>
      ) : null}

      {/* Header band */}
      <header className="flex flex-wrap items-end justify-between gap-6 bg-[#111] px-7 py-7 text-white sm:px-10 sm:py-9">
        <div>
          <Logo className="h-11 text-white sm:h-12" title="Brand House" />
          <p className="mt-3 text-xs text-white/60">A Creative, Media &amp; Digital Agency</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fd5019]">{d.title}</p>
          <p className="mt-1 font-display text-[1.7rem] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[2.1rem]">{d.number || "Draft"}</p>
        </div>
      </header>
      <div className="h-1.5 bg-[#fd5019]" />

      <div className="px-7 py-8 sm:px-10 sm:py-10">
        {/* Parties and dates */}
        <section className="grid gap-6 text-sm sm:grid-cols-3">
          <div>
            <Label>From</Label>
            <div className="mt-2 space-y-0.5 leading-relaxed text-[#444]">
              <p className="font-semibold text-[#111]">{biz.legalName}</p>
              {biz.address ? <p className="whitespace-pre-line">{biz.address}</p> : null}
              {biz.phone ? <p>{biz.phone}</p> : null}
              {biz.email ? <p>{biz.email}</p> : null}
              {biz.kraPin ? <p>KRA PIN: {biz.kraPin}</p> : null}
            </div>
          </div>
          <div>
            <Label>{d.toLabel}</Label>
            <div className="mt-2 space-y-0.5 leading-relaxed text-[#444]">
              <p className="font-semibold text-[#111]">{to.company || to.name || "—"}</p>
              {to.company && to.name ? <p>{to.name}</p> : null}
              {to.address ? <p className="whitespace-pre-line">{to.address}</p> : null}
              {to.phone ? <p>{to.phone}</p> : null}
              {to.email ? <p className="break-all">{to.email}</p> : null}
            </div>
          </div>
          <dl className="space-y-2 sm:text-right">
            <div>
              <dt>
                <Label>Date</Label>
              </dt>
              <dd className="mt-0.5 font-medium">{fmtDocDate(d.issueOn)}</dd>
            </div>
            {d.dueOn ? (
              <div>
                <dt>
                  <Label>{d.dueLabel}</Label>
                </dt>
                <dd className="mt-0.5 font-medium">{fmtDocDate(d.dueOn)}</dd>
              </div>
            ) : null}
            {d.statusLabel ? (
              <div>
                <dt>
                  <Label>Status</Label>
                </dt>
                <dd className="mt-0.5 font-medium">{d.statusLabel}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        {d.projectTitle ? (
          <p className="mt-8 rounded-xl bg-[#f6f4f0] px-4 py-3 text-sm">
            <span className="font-semibold">Project:</span> {d.projectTitle}
          </p>
        ) : null}

        {/* Receipt: amount received */}
        {d.receipt ? (
          <section className="mt-8 overflow-hidden rounded-2xl ring-1 ring-[#111]/10">
            <div className="flex flex-wrap items-end justify-between gap-4 bg-[#f6f4f0] px-6 py-5">
              <div>
                <Label>Amount received</Label>
                <p className="mt-1 font-display text-4xl font-bold tracking-[-0.03em] tabular-nums">{kes(d.receipt.amount)}</p>
              </div>
              <p className="max-w-xs text-right text-sm italic text-[#555]">{amountInWords(d.receipt.amount)}</p>
            </div>
            <dl className="grid gap-4 px-6 py-5 text-sm sm:grid-cols-4">
              <div>
                <dt>
                  <Label>Received on</Label>
                </dt>
                <dd className="mt-1 font-medium">{fmtDocDate(d.receipt.paidOn)}</dd>
              </div>
              <div>
                <dt>
                  <Label>Paid by</Label>
                </dt>
                <dd className="mt-1 font-medium">{labelOf(paymentMethods, d.receipt.method)}</dd>
              </div>
              <div>
                <dt>
                  <Label>Reference</Label>
                </dt>
                <dd className="mt-1 font-medium break-all">{d.receipt.reference || "—"}</dd>
              </div>
              {d.receipt.forNumber ? (
                <div>
                  <dt>
                    <Label>For invoice</Label>
                  </dt>
                  <dd className="mt-1 font-medium">{d.receipt.forNumber}</dd>
                </div>
              ) : null}
            </dl>
            {d.receipt.balance !== undefined && d.receipt.balance !== null ? (
              <p className="border-t border-[#111]/10 px-6 py-3 text-sm">
                {d.receipt.balance > 0.004 ? (
                  <>
                    Balance remaining on the invoice: <strong className="tabular-nums">{kes(d.receipt.balance)}</strong>
                  </>
                ) : (
                  <strong className="text-[#059669]">The invoice is fully paid. Thank you.</strong>
                )}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Items */}
        {hasItems ? (
          <table className="mt-8 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#fd5019] text-left">
                <th className="py-2.5 pr-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8a857d]">Description</th>
                <th className="w-14 py-2.5 text-right text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8a857d]">Qty</th>
                <th className="hidden w-28 py-2.5 text-right text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8a857d] sm:table-cell">Rate</th>
                <th className="w-32 py-2.5 text-right text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8a857d]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {d.items.map((it, i) => (
                <tr key={i} className="border-b border-[#111]/8 align-top">
                  <td className="py-3.5 pr-3 leading-snug">
                    {it.description || <span className="text-[#aaa]">Item {i + 1}</span>}
                    <span className="block text-xs text-[#8a857d] sm:hidden">{kes(it.unitPrice)} each</span>
                  </td>
                  <td className="py-3.5 text-right tabular-nums">{it.quantity}</td>
                  <td className="hidden py-3.5 text-right tabular-nums sm:table-cell">{kes(it.unitPrice)}</td>
                  <td className="py-3.5 text-right font-medium tabular-nums">{kes(it.quantity * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {/* Totals */}
        {hasItems ? (
          <div className="mt-6 flex justify-end">
            <dl className="w-full max-w-xs space-y-1.5 text-sm tabular-nums">
              <div className="flex justify-between px-1">
                <dt className="text-[#666]">Subtotal</dt>
                <dd>{kes(t.subtotal)}</dd>
              </div>
              {t.discount ? (
                <div className="flex justify-between px-1">
                  <dt className="text-[#666]">Discount</dt>
                  <dd>−{kes(t.discount)}</dd>
                </div>
              ) : null}
              {t.vat ? (
                <div className="flex justify-between px-1">
                  <dt className="text-[#666]">
                    VAT {d.vatRate}%{d.vatInclusive ? " (included)" : ""}
                  </dt>
                  <dd>{kes(t.vat)}</dd>
                </div>
              ) : null}
              <div className="mt-2 flex justify-between rounded-xl bg-[#fd5019] px-4 py-3 font-display text-lg font-bold text-[#111]">
                <dt>Total</dt>
                <dd>{kes(t.total)}</dd>
              </div>
              {d.showPaid && t.paid ? (
                <>
                  <div className="flex justify-between px-1 pt-1 text-[#059669]">
                    <dt>Paid</dt>
                    <dd>−{kes(t.paid)}</dd>
                  </div>
                  <div className="flex justify-between px-1 font-semibold">
                    <dt>Balance due</dt>
                    <dd>{kes(t.balance)}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
        ) : null}

        {d.notes ? (
          <section className="mt-10">
            <Label>Notes</Label>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#333]">{d.notes}</p>
          </section>
        ) : null}

        {/* How to pay */}
        {d.payOptions.length ? (
          <section className="mt-10">
            <Label>How to pay</Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {d.payOptions.map((o) => (
                <div key={o.id} className="rounded-xl border-l-4 border-[#fd5019] bg-[#f6f4f0] px-4 py-3 text-sm">
                  <p className="font-semibold">{o.label}</p>
                  {o.details ? <p className="mt-1 whitespace-pre-line leading-relaxed text-[#444]">{o.details.replaceAll("{number}", d.number)}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {d.terms ? (
          <section className="mt-8">
            <Label>Terms</Label>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[#666]">{d.terms}</p>
          </section>
        ) : null}

        {/* Signature */}
        {d.signature && (d.signature.url || d.signature.name) ? (
          <section className="mt-10 flex justify-end">
            <div className="w-60 text-center">
              {d.signature.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.signature.url} alt={`Signature of ${d.signature.name || biz.legalName}`} className="mx-auto h-16 w-auto object-contain" />
              ) : (
                <div className="h-16" />
              )}
              <div className="mt-1 border-t border-[#111]/40 pt-2 text-sm">
                {d.signature.name ? <p className="font-semibold">{d.signature.name}</p> : null}
                <p className="text-xs text-[#777]">{d.signature.title || `For ${biz.legalName}`}</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#111]/8 px-7 py-5 text-xs text-[#777] sm:px-10">
        <span>{biz.invoiceFooter}</span>
        <span className="font-display font-semibold text-[#111]">brandhouse.co.ke</span>
      </footer>
      <div className="h-2 bg-[#fd5019]" />
    </article>
  );
}
