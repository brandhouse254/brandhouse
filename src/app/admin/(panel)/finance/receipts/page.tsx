import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, ReceiptText } from "lucide-react";
import { listInvoices, todayKE } from "@/lib/biz/data";
import { recipientName } from "@/lib/biz/sheet";
import { kes, labelOf, paymentMethods } from "@/lib/biz/types";
import { fmtDate, LinkButton, PageHeader, Panel } from "@/components/admin/biz/bits";
import { DocList } from "@/components/admin/biz/doc-list";

export const metadata: Metadata = { title: "Receipts" };

export default async function Page() {
  const [receipts, invoices] = await Promise.all([listInvoices({ kind: "receipt" }), listInvoices({ kind: "invoice" })]);
  const fromInvoices = invoices
    .flatMap((inv) => inv.payments.map((p, i) => ({ inv, p, i })))
    .sort((a, b) => b.p.paidOn.localeCompare(a.p.paidOn))
    .slice(0, 50);
  return (
    <>
      <PageHeader
        title="Receipts"
        description="Every payment recorded on an invoice gets its own receipt automatically. Make a standalone receipt for money received without an invoice."
        actions={
          <LinkButton href="/admin/finance/new?kind=receipt" variant="accent">
            <FilePlus2 className="size-4" /> New receipt
          </LinkButton>
        }
      />
      <div className="space-y-5">
        <Panel title="Payments on invoices">
          {fromInvoices.length ? (
            <ul className="divide-y divide-ink/8">
              {fromInvoices.map(({ inv, p, i }) => (
                <li key={p.id}>
                  <a href={`/i/${inv.shareToken}?r=${p.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink/4">
                    <ReceiptText className="size-5 shrink-0 text-accent-deep" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{recipientName(inv) || "No client"}</span>
                      <span className="block truncate text-xs text-mute-2">
                        {p.receiptNo || `${inv.number}-R${i + 1}`} · {fmtDate(p.paidOn)} · {labelOf(paymentMethods, p.method)} · for {inv.number}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">{kes(p.amount)}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-5 text-sm text-mute-2">
              No payments yet. Record one on an{" "}
              <Link href="/admin/finance/invoices" className="underline underline-offset-4">
                invoice
              </Link>{" "}
              and its receipt appears here.
            </p>
          )}
        </Panel>
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Standalone receipts</h2>
          <DocList docs={receipts} today={todayKE()} empty="Use New receipt for money received without an invoice." />
        </div>
      </div>
    </>
  );
}
