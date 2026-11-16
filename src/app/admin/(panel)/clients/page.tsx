import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ChevronRight, Search } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { clientBalances, listClients, listProjects } from "@/lib/biz/data";
import { kes } from "@/lib/biz/types";
import { inputClass } from "@/components/admin/ui";
import { EmptyState } from "@/components/admin/ui";
import { NotConnected, PageHeader, Pill, Tabs } from "@/components/admin/biz/bits";
import { ClientButton } from "@/components/admin/biz/records";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; view?: string; new?: string }> }) {
  const me = await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  const { q = "", view = "active", new: autoOpen } = await searchParams;
  const [clients, projects, balances] = await Promise.all([
    listClients(true),
    listProjects(),
    me.role === "owner" ? clientBalances() : Promise.resolve({} as Record<string, { invoiced: number; paid: number }>),
  ]);
  const needle = q.trim().toLowerCase();
  const shown = clients
    .filter((c) => (view === "archived" ? c.archived : !c.archived))
    .filter((c) => !needle || [c.name, c.company, c.email, c.phone].some((v) => v.toLowerCase().includes(needle)));

  return (
    <>
      <PageHeader title="Clients" description="Everyone you work for, with their projects and what they owe." actions={<ClientButton autoOpen={autoOpen === "1"} />} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs
          current={view}
          items={[
            { id: "active", label: "Active", href: "/admin/clients", count: clients.filter((c) => !c.archived).length },
            { id: "archived", label: "Archived", href: "/admin/clients?view=archived", count: clients.filter((c) => c.archived).length },
          ]}
        />
        <form className="relative mb-5 w-full sm:w-72" role="search">
          {view === "archived" ? <input type="hidden" name="view" value="archived" /> : null}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search clients" aria-label="Search clients" className={`${inputClass} pl-10`} />
        </form>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-6" />}
          title={clients.length ? "No matches" : "No clients yet"}
          body={clients.length ? "Try another search." : "Add a client here, or mark a lead as won and it becomes a client automatically."}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => {
            const live = projects.filter((p) => p.clientId === c.id && p.status !== "done").length;
            const b = balances[c.id];
            const owed = b ? b.invoiced - b.paid : 0;
            return (
              <li key={c.id}>
                <Link href={`/admin/clients/${c.id}`} className="flex h-full items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink/10 transition hover:ring-ink/25">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 font-display font-semibold text-accent">
                    {(c.company || c.name).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.company || c.name}</p>
                    <p className="truncate text-sm text-mute-2">{c.company ? c.name : c.email || c.phone || "—"}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {live ? <Pill tone="orange">{live} active project{live === 1 ? "" : "s"}</Pill> : null}
                      {owed > 0.004 ? <Pill tone="amber">Owes {kes(owed)}</Pill> : null}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-ink/30" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
