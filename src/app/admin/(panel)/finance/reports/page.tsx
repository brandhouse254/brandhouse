import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { receivables, yearReport } from "@/lib/biz/reports";
import { todayKE } from "@/lib/biz/data";
import { kes } from "@/lib/biz/types";
import { fmtDate, PageHeader, Panel, Stat } from "@/components/admin/biz/bits";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Reports" };

const short = (n: number) => (n === 0 ? "—" : n.toLocaleString("en-KE", { maximumFractionDigits: 0 }));

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const today = todayKE();
  const thisYear = Number(today.slice(0, 4));
  const sp = await searchParams;
  const year = sp.year && /^\d{4}$/.test(sp.year) ? Number(sp.year) : thisYear;
  const [report, owed] = await Promise.all([yearReport(year), receivables()]);
  const max = Math.max(1, ...report.months.map((m) => Math.max(m.receivedNet, m.expenses - m.vatPaid)));
  const months = report.months.filter((m) => m.month <= today.slice(0, 7) || year < thisYear);
  const download = (kind: string) => `/api/admin/export/${kind}?year=${year}`;

  return (
    <>
      <PageHeader
        title="Reports"
        description="Cash basis: money actually received and spent, excluding VAT."
        actions={
          <nav className="flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10" aria-label="Year">
            {[thisYear - 2, thisYear - 1, thisYear].map((y) => (
              <Link key={y} href={`/admin/finance/reports?year=${y}`} className={cn("rounded-full px-3 py-1.5 text-sm font-medium", y === year ? "bg-ink text-paper" : "text-ink/65")}>
                {y}
              </Link>
            ))}
          </nav>
        }
      />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Income (excl. VAT)" value={kes(report.total.receivedNet)} note={`${kes(report.total.received)} received in total`} />
        <Stat label="Expenses (excl. VAT)" value={kes(report.total.expenses - report.total.vatPaid)} />
        <Stat label="Profit" value={kes(report.total.profit)} tone={report.total.profit >= 0 ? "green" : "red"} />
        <Stat label="Owed to you now" value={kes(owed.total)} tone={owed.overdue ? "red" : undefined} note={owed.overdue ? `${kes(owed.overdue)} overdue` : "Nothing overdue"} />
      </dl>

      <Panel title={`Month by month, ${year}`} className="mt-5">
        <div className="px-5 pt-5">
          <div className="flex h-40 items-end gap-1.5 sm:gap-3" role="img" aria-label="Income and expenses per month">
            {report.months.map((m) => (
              <div key={m.month} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <div className="flex h-full items-end justify-center gap-0.5">
                  <div className="w-1/2 max-w-4 rounded-t bg-emerald-600" style={{ height: `${(m.receivedNet / max) * 100}%` }} />
                  <div className="w-1/2 max-w-4 rounded-t bg-accent" style={{ height: `${((m.expenses - m.vatPaid) / max) * 100}%` }} />
                </div>
                <span className="mt-1.5 text-center text-[0.65rem] text-ink/45">{new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-KE", { month: "narrow", timeZone: "UTC" })}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 flex gap-4 text-xs text-mute-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-600" /> Income
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-accent" /> Expenses
            </span>
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm tabular-nums">
            <thead>
              <tr className="border-y border-ink/8 text-left text-xs text-mute-2">
                <th className="px-5 py-2 font-medium">Month</th>
                <th className="px-3 py-2 text-right font-medium">Invoiced</th>
                <th className="px-3 py-2 text-right font-medium">Received</th>
                <th className="px-3 py-2 text-right font-medium">VAT collected</th>
                <th className="px-3 py-2 text-right font-medium">Expenses</th>
                <th className="px-5 py-2 text-right font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-b border-ink/6">
                  <td className="px-5 py-2.5">{new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-KE", { month: "long", timeZone: "UTC" })}</td>
                  <td className="px-3 py-2.5 text-right text-ink/70">{short(m.invoiced)}</td>
                  <td className="px-3 py-2.5 text-right">{short(m.received)}</td>
                  <td className="px-3 py-2.5 text-right text-ink/70">{short(m.vatCollected)}</td>
                  <td className="px-3 py-2.5 text-right">{short(m.expenses)}</td>
                  <td className={cn("px-5 py-2.5 text-right font-medium", m.profit < 0 && "text-red-700")}>{short(m.profit)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="px-5 py-3">Total (KES)</td>
                <td className="px-3 py-3 text-right">{short(report.total.invoiced)}</td>
                <td className="px-3 py-3 text-right">{short(report.total.received)}</td>
                <td className="px-3 py-3 text-right">{short(report.total.vatCollected)}</td>
                <td className="px-3 py-3 text-right">{short(report.total.expenses)}</td>
                <td className={cn("px-5 py-3 text-right", report.total.profit < 0 && "text-red-700")}>{short(report.total.profit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Who owes you">
          <ul className="divide-y divide-ink/8">
            {owed.buckets.map((b) => (
              <li key={b.label} className="flex justify-between px-5 py-2.5 text-sm">
                <span className={cn(b.label.includes("late") && b.amount ? "text-red-700" : "")}>{b.label}</span>
                <span className="tabular-nums">
                  {b.count ? `${b.count} · ` : ""}
                  {kes(b.amount)}
                </span>
              </li>
            ))}
          </ul>
          {owed.items.length ? (
            <ul className="border-t border-ink/8">
              {owed.items.slice(0, 8).map(({ invoice, daysOverdue }) => (
                <li key={invoice.id}>
                  <Link href={`/admin/finance/doc/${invoice.id}`} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-ink/4">
                    <span className="min-w-0 flex-1 truncate">
                      {invoice.number} · {invoice.clientName}
                    </span>
                    <span className={cn("text-xs", daysOverdue ? "text-red-700" : "text-mute-2")}>{daysOverdue ? `${daysOverdue}d late` : `due ${fmtDate(invoice.dueOn, { year: false })}`}</span>
                    <span className="tabular-nums">{kes(invoice.totals.balance)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <div className="space-y-5">
          <Panel title="Where the money went">
            {report.categories.length ? (
              <ul className="space-y-2.5 p-5">
                {report.categories.map((c) => (
                  <li key={c.category} className="text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="truncate">{c.category}</span>
                      <span className="tabular-nums text-ink/70">{kes(c.amount)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(c.amount / report.categories[0].amount) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-mute-2">No expenses recorded in {year}.</p>
            )}
          </Panel>
          <Panel title="Top clients by money received">
            {report.clients.length ? (
              <ol className="divide-y divide-ink/8">
                {report.clients.map((c, i) => (
                  <li key={c.name + i} className="flex justify-between px-5 py-2.5 text-sm">
                    <span className="truncate">
                      {i + 1}. {c.name}
                    </span>
                    <span className="tabular-nums">{kes(c.received)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="p-5 text-sm text-mute-2">No payments recorded in {year}.</p>
            )}
          </Panel>
        </div>
      </div>

      <Panel title="For your accountant" className="mt-5">
        <div className="flex flex-wrap gap-2 p-5">
          {[
            ["invoices", "Invoices & quotes"],
            ["payments", "Payments received"],
            ["expenses", "Expenses"],
          ].map(([k, l]) => (
            <a key={k} href={download(k)} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-ink/15 hover:ring-ink/30">
              <Download className="size-4" /> {l} {year} (CSV)
            </a>
          ))}
        </div>
      </Panel>
    </>
  );
}
