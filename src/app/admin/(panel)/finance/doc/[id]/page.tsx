import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getBusinessSettings, getClient, getInvoice, todayKE } from "@/lib/biz/data";
import { recipientName, sheetForDocument } from "@/lib/biz/sheet";
import { docWords, invoiceStatuses, kes, labelOf, paymentMethods } from "@/lib/biz/types";
import { DocumentSheet } from "@/components/docs/sheet";
import { FitSheet } from "@/components/admin/biz/doc-editor";
import { docTone, dueLabel, fmtDate, PageHeader, Panel, Pill, Stat } from "@/components/admin/biz/bits";
import { DocActions, PaymentDelete, PaymentForm, ShareButtons } from "@/components/admin/biz/finance";

export const metadata: Metadata = { title: "Document" };

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getInvoice(id);
  if (!doc) notFound();
  const [biz, client] = await Promise.all([getBusinessSettings(), doc.clientId ? getClient(doc.clientId) : null]);
  const words = docWords[doc.kind];
  const who = recipientName(doc);
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
        back={{ href: `/admin/finance/${words.plural}`, label: words.plural.charAt(0).toUpperCase() + words.plural.slice(1) }}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {doc.number}
            <Pill tone={docTone[doc.status]}>{labelOf(invoiceStatuses[doc.kind], doc.status)}</Pill>
            {late?.tone === "red" ? <Pill tone="red">{late.label}</Pill> : null}
          </span>
        }
        description={
          <>
            {words.title} for{" "}
            {doc.clientId ? (
              <Link href={`/admin/clients/${doc.clientId}`} className="underline decoration-ink/25 underline-offset-4">
                {who}
              </Link>
            ) : (
              who || "no one yet"
            )}{" "}
            · {fmtDate(doc.issueOn)}
            {doc.dueOn && doc.kind !== "receipt" ? ` · ${doc.kind === "quote" ? "valid until" : "due"} ${fmtDate(doc.dueOn)}` : ""}
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
          {doc.kind !== "invoice" ? <Stat label="Lines" value={doc.items.length} note={doc.convertedFrom ? "From an accepted quote" : undefined} /> : null}
        </dl>

        <Panel title={`Send the ${words.word}`}>
          <div className="space-y-3 p-5">
            <p className="text-sm text-mute-2">
              The link opens the branded {words.word}, ready to print or save as a PDF. Anyone with the link can see it, so share it only with the client.
            </p>
            <ShareButtons url={shareUrl} number={doc.number} kind={doc.kind} clientName={doc.billTo?.name || doc.clientName || ""} total={kes(t.total)} />
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel title="Preview">
            <div className="bg-[#e9e6e0] p-3 sm:p-4">
              <div className="overflow-hidden rounded-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)]">
                <FitSheet>
                  <DocumentSheet data={sheetForDocument(doc, biz, client)} biz={biz} />
                </FitSheet>
              </div>
            </div>
          </Panel>

          {doc.kind === "invoice" ? (
            <Panel title="Payments" action={doc.status !== "void" && t.balance > 0.004 ? <PaymentForm invoiceId={doc.id} balance={t.balance} today={today} /> : null}>
              {doc.payments.length ? (
                <ul className="divide-y divide-ink/8">
                  {doc.payments.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium tabular-nums">{kes(p.amount)}</p>
                        <p className="truncate text-xs text-mute-2">
                          {fmtDate(p.paidOn)} · {labelOf(paymentMethods, p.method)}
                          {p.reference ? ` · ${p.reference}` : ""}
                          {p.note ? ` · ${p.note}` : ""}
                        </p>
                      </div>
                      <a
                        href={`/i/${doc.shareToken}?r=${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-medium ring-1 ring-ink/15 hover:ring-ink/30"
                      >
                        <ReceiptText className="size-4" /> {p.receiptNo || `Receipt ${i + 1}`}
                      </a>
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

      </div>
    </>
  );
}
