import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getInvoice, todayKE } from "@/lib/biz/data";
import { invoiceStatuses, kes, labelOf, paymentMethods } from "@/lib/biz/types";
import { docTone, dueLabel, fmtDate, PageHeader, Panel, Pill, Stat } from "@/components/admin/biz/bits";
import { DocActions, PaymentDelete, PaymentForm, ShareButtons } from "@/components/admin/biz/finance";

export const metadata: Metadata = { title: "Document" };

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getInvoice(id);
  if (!doc) notFound();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "brandhouse.co.ke";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const shareUrl = `${proto}://${host}/i/${doc.shareToken}`;
  const today = todayKE();
  const late = doc.kind === "invoice" && ["sent", "partial"].includes(doc.status) ? dueLabel(doc.dueOn, today) : null;
  const t = doc.totals;

  return (
    <>
      <PageHeader
        back={{ href: `/admin/finance/${doc.kind === "quote" ? "quotes" : "invoices"}`, label: doc.kind === "quote" ? "Quotes" : "Invoices" }}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {doc.number}
            <Pill tone={docTone[doc.status]}>{labelOf(invoiceStatuses[doc.kind], doc.status)}</Pill>
            {late?.tone === "red" ? <Pill tone="red">{late.label}</Pill> : null}
          </span>
        }
        description={
          <>
            {doc.kind === "quote" ? "Quote" : "Invoice"} for{" "}
            {doc.clientId ? (
              <Link href={`/admin/clients/${doc.clientId}`} className="underline decoration-ink/25 underline-offset-4">
                {doc.clientName}
              </Link>
            ) : (
              "no client"
            )}{" "}
            · {fmtDate(doc.issueOn)}
            {doc.dueOn ? ` · ${doc.kind === "quote" ? "valid until" : "due"} ${fmtDate(doc.dueOn)}` : ""}
          </>
        }
      />

      <div className="space-y-5">
        <DocActions doc={doc} />

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Total" value={kes(t.total)} note={t.vat ? `incl. VAT ${kes(t.vat)}` : "No VAT"} />
          {doc.kind === "invoice" ? (
            <>
              <Stat label="Paid" value={kes(t.paid)} tone="green" />
              <Stat label="Balance" value={kes(t.balance)} tone={t.balance > 0.004 && doc.status !== "void" ? "red" : undefined} />
            </>
          ) : null}
          <Stat label="Lines" value={doc.items.length} note={doc.convertedFrom ? "From an accepted quote" : undefined} />
        </dl>

        <Panel title="Send it to the client">
          <div className="space-y-3 p-5">
            <p className="text-sm text-mute-2">
              The link opens a clean, printable {doc.kind} with your payment details. Anyone with the link can see it, so share it only with the client.
            </p>
            <ShareButtons url={shareUrl} number={doc.number} kind={doc.kind} clientName={doc.clientName ?? ""} total={kes(t.total)} />
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel title="Items">
            <ul className="divide-y divide-ink/8">
              {doc.items.map((it, i) => (
                <li key={it.id ?? i} className="flex items-start justify-between gap-4 px-5 py-3">
                  <span className="min-w-0">
                    <span className="block break-words">{it.description}</span>
                    <span className="text-xs text-mute-2">
                      {it.quantity} × {kes(it.unitPrice)}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums">{kes(it.quantity * it.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t border-ink/8 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-mute-2">Subtotal</dt>
                <dd>{kes(t.subtotal)}</dd>
              </div>
              {t.discount ? (
                <div className="flex justify-between">
                  <dt className="text-mute-2">Discount</dt>
                  <dd>−{kes(t.discount)}</dd>
                </div>
              ) : null}
              {t.vat ? (
                <div className="flex justify-between">
                  <dt className="text-mute-2">VAT {doc.vatRate}%{doc.vatInclusive ? " (included)" : ""}</dt>
                  <dd>{kes(t.vat)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{kes(t.total)}</dd>
              </div>
            </dl>
          </Panel>

          {doc.kind === "invoice" ? (
            <Panel title="Payments" action={doc.status !== "void" && t.balance > 0.004 ? <PaymentForm invoiceId={doc.id} balance={t.balance} today={today} /> : null}>
              {doc.payments.length ? (
                <ul className="divide-y divide-ink/8">
                  {doc.payments.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium tabular-nums">{kes(p.amount)}</p>
                        <p className="truncate text-xs text-mute-2">
                          {fmtDate(p.paidOn)} · {labelOf(paymentMethods, p.method)}
                          {p.reference ? ` · ${p.reference}` : ""}
                          {p.note ? ` · ${p.note}` : ""}
                        </p>
                      </div>
                      <PaymentDelete id={p.id} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-5 text-sm text-mute-2">No payments recorded yet. Record M-Pesa or bank payments here as they come in.</p>
              )}
            </Panel>
          ) : null}
        </div>

        {doc.notes || doc.terms ? (
          <Panel title="Notes & terms">
            <div className="space-y-3 whitespace-pre-wrap p-5 text-sm leading-relaxed">
              {doc.notes ? <p>{doc.notes}</p> : null}
              {doc.terms ? <p className="text-mute-2">{doc.terms}</p> : null}
            </div>
          </Panel>
        ) : null}
      </div>
    </>
  );
}
