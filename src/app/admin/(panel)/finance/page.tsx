import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, FileText, Plus, Receipt } from "lucide-react";
import { getBusinessSettings, listInvoices, todayKE } from "@/lib/biz/data";
import { monthSnapshot, receivables } from "@/lib/biz/reports";
import { kes, kesWhole } from "@/lib/biz/types";
import { LinkButton, PageHeader, Panel, Stat } from "@/components/admin/biz/bits";
import { DocList } from "@/components/admin/biz/doc-list";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const today = todayKE();
  const [snap, owed, docs, settings] = await Promise.all([monthSnapshot(), receivables(), listInvoices(), getBusinessSettings()]);
  const m = snap.month;
  const setupNeeded = !settings.mpesaPaybill && !settings.mpesaTill && !settings.bankAccountNumber;
  const openQuotes = docs.filter((d) => d.kind === "quote" && d.status === "sent");

  return (
    <>
      <PageHeader
        title="Finance"
        description={new Date(`${today}T00:00:00Z`).toLocaleDateString("en-KE", { month: "long", year: "numeric", timeZone: "UTC" })}
        actions={
          <>
            <LinkButton href="/admin/finance/new?kind=quote">
              <FilePlus2 className="size-4" /> Quote
            </LinkButton>
            <LinkButton href="/admin/finance/new?kind=invoice" variant="accent">
              <Plus className="size-4" /> Invoice
            </LinkButton>
          </>
        }
      />

      {setupNeeded ? (
        <Link href="/admin/finance/settings" className="mb-5 block rounded-2xl bg-accent/12 px-5 py-4 text-sm ring-1 ring-accent/30">
          <span className="font-semibold">First, add how clients pay you.</span> Your M-Pesa Paybill or Till and bank details are printed on every invoice. Open Settings →
        </Link>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Received this month" value={kesWhole(m.received)} tone="green" note={`${kesWhole(m.receivedNet)} excl. VAT`} />
        <Stat label="Spent this month" value={kesWhole(m.expenses)} href="/admin/finance/expenses" />
        <Stat label="Profit this month" value={kesWhole(m.profit)} tone={m.profit < 0 ? "red" : undefined} note={`${kesWhole(snap.year.profit)} this year`} href="/admin/finance/reports" />
        <Stat label="Owed to you" value={kesWhole(owed.total)} tone={owed.overdue ? "red" : undefined} note={owed.overdue ? `${kesWhole(owed.overdue)} overdue` : `${owed.items.length} unpaid`} href="/admin/finance/reports" />
      </dl>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent</h2>
            <Link href="/admin/finance/invoices" className="text-sm text-mute-2 hover:text-ink">
              All invoices →
            </Link>
          </div>
          <DocList docs={docs.slice(0, 8)} today={today} empty="Your quotes and invoices will show here." />
        </section>
        <div className="min-w-0 space-y-5">
          <Panel title="Quotes waiting for an answer">
            {openQuotes.length ? (
              <ul className="divide-y divide-ink/8">
                {openQuotes.slice(0, 6).map((q) => (
                  <li key={q.id}>
                    <Link href={`/admin/finance/doc/${q.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-ink/4">
                      <FileText className="size-4 text-ink/40" />
                      <span className="min-w-0 flex-1 truncate">{q.clientName}</span>
                      <span className="tabular-nums">{kes(q.totals.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-mute-2">None right now.</p>
            )}
          </Panel>
          <Panel title="Quick links">
            <div className="grid grid-cols-2 gap-2 p-4">
              <LinkButton href="/admin/finance/expenses">
                <Receipt className="size-4" /> Expenses
              </LinkButton>
              <LinkButton href="/admin/finance/reports">Reports</LinkButton>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
