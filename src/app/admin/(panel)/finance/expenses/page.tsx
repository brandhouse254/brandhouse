import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, Wallet } from "lucide-react";
import { listExpenses, listProjects, todayKE } from "@/lib/biz/data";
import { kes, labelOf, paymentMethods } from "@/lib/biz/types";
import { EmptyState } from "@/components/admin/ui";
import { fmtDate, PageHeader, Stat } from "@/components/admin/biz/bits";
import { ExpenseButton, ExpenseDelete } from "@/components/admin/biz/finance";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Expenses" };

const monthName = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-KE", { month: "long", year: "numeric", timeZone: "UTC" });

function shift(month: string, by: number) {
  const d = new Date(`${month}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + by);
  return d.toISOString().slice(0, 7);
}

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const today = todayKE();
  const sp = await searchParams;
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : today.slice(0, 7);
  const last = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const [expenses, projects] = await Promise.all([listExpenses({ from: `${month}-01`, to: last }), listProjects()]);
  const projectOptions = projects.map((p) => ({ id: p.id, label: p.clientName ? `${p.name} · ${p.clientName}` : p.name }));
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCat = new Map<string, number>();
  for (const e of expenses) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount);
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title="Expenses" description="Everything the business spends, with receipts." actions={<ExpenseButton projects={projectOptions} today={today} />} />

      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-white px-2 py-2 ring-1 ring-ink/10">
        <Link href={`/admin/finance/expenses?month=${shift(month, -1)}`} className="rounded-full px-3 py-2 text-sm text-ink/70 hover:bg-ink/6" aria-label="Previous month">
          ← <span className="hidden sm:inline">{monthName(shift(month, -1))}</span>
        </Link>
        <p className="font-display font-semibold">{monthName(month)}</p>
        <Link
          href={`/admin/finance/expenses?month=${shift(month, 1)}`}
          className={cn("rounded-full px-3 py-2 text-sm text-ink/70 hover:bg-ink/6", shift(month, 1) > today.slice(0, 7) && "pointer-events-none opacity-30")}
          aria-label="Next month"
        >
          <span className="hidden sm:inline">{monthName(shift(month, 1))}</span> →
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          {expenses.length === 0 ? (
            <EmptyState icon={<Wallet className="size-6" />} title="No expenses this month" body="Add what you spend (equipment hire, transport, crew, ads) so the reports show your real profit." />
          ) : (
            <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-center gap-3 border-b border-ink/8 px-4 py-3 last:border-b-0 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.vendor || e.description || e.category}</p>
                    <p className="truncate text-xs text-mute-2">
                      {fmtDate(e.spentOn, { year: false })} · {e.category} · {labelOf(paymentMethods, e.method)}
                      {e.projectName ? ` · ${e.projectName}` : ""}
                    </p>
                  </div>
                  {e.receiptUrl ? (
                    <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" aria-label="Receipt" title="Receipt" className="rounded-full p-1.5 text-emerald-700 hover:bg-ink/6">
                      <Receipt className="size-4" />
                    </a>
                  ) : null}
                  <span className="shrink-0 font-medium tabular-nums">{kes(e.amount)}</span>
                  <ExpenseButton expense={e} projects={projectOptions} today={today} />
                  <ExpenseDelete id={e.id} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="min-w-0 space-y-4">
          <dl>
            <Stat label={`Spent in ${monthName(month)}`} value={kes(total)} note={`${expenses.length} expense${expenses.length === 1 ? "" : "s"}`} />
          </dl>
          {cats.length ? (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
              <h2 className="mb-3 font-display text-base font-semibold">By category</h2>
              <ul className="space-y-3">
                {cats.map(([c, v]) => (
                  <li key={c}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="truncate">{c}</span>
                      <span className="tabular-nums text-ink/70">{kes(v)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(v / total) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
