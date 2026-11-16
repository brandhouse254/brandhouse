import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { getClient, listClients, listInvoices, listProjects } from "@/lib/biz/data";
import { invoiceStatuses, kes, labelOf, projectStatuses } from "@/lib/biz/types";
import { docTone, fmtDate, LinkButton, NotConnected, PageHeader, Panel, Pill, projectTone, Stat } from "@/components/admin/biz/bits";
import { ContactLinks } from "@/components/admin/biz/contact-links";
import { ClientButton, ClientMenu, ProjectButton } from "@/components/admin/biz/records";

export const metadata: Metadata = { title: "Client" };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const isOwner = me.role === "owner";
  const [projects, invoices, clients] = await Promise.all([
    listProjects({ clientId: id }),
    isOwner ? listInvoices({ clientId: id }) : Promise.resolve([]),
    listClients(),
  ]);
  const billed = invoices.filter((i) => i.kind === "invoice" && !["draft", "void"].includes(i.status));
  const invoiced = billed.reduce((s, i) => s + i.totals.total, 0);
  const paid = billed.reduce((s, i) => s + i.totals.paid, 0);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/clients", label: "All clients" }}
        title={client.company || client.name}
        description={[client.company ? client.name : "", client.archived ? "Archived" : ""].filter(Boolean).join(" · ") || undefined}
        actions={
          <>
            <ClientButton client={client} />
            {isOwner ? (
              <LinkButton href={`/admin/finance/new?kind=quote&client=${client.id}`} variant="accent">
                <FilePlus2 className="size-4" /> New quote
              </LinkButton>
            ) : null}
          </>
        }
      />

      {isOwner ? (
        <dl className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Invoiced" value={kes(invoiced)} />
          <Stat label="Paid" value={kes(paid)} tone="green" />
          <Stat label="Outstanding" value={kes(invoiced - paid)} tone={invoiced - paid > 0.004 ? "red" : undefined} />
          <Stat label="Projects" value={projects.length} note={`${projects.filter((p) => p.status !== "done").length} active`} />
        </dl>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Panel
            title="Projects"
            action={<ProjectButton clients={clients.map((c) => ({ id: c.id, label: c.company || c.name }))} defaultClientId={client.id} label="New project" />}
          >
            {projects.length ? (
              <ul>
                {projects.map((p) => (
                  <li key={p.id} className="border-b border-ink/8 last:border-b-0">
                    <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink/4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-mute-2">
                          {p.openTasks} open task{p.openTasks === 1 ? "" : "s"}
                          {p.dueOn ? ` · due ${fmtDate(p.dueOn)}` : ""}
                        </p>
                      </div>
                      <Pill tone={projectTone[p.status]}>{labelOf(projectStatuses, p.status)}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-mute-2">No projects yet.</p>
            )}
          </Panel>

          {isOwner ? (
            <Panel title="Quotes & invoices">
              {invoices.length ? (
                <ul>
                  {invoices.map((i) => (
                    <li key={i.id} className="border-b border-ink/8 last:border-b-0">
                      <Link href={`/admin/finance/doc/${i.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink/4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{i.number}</p>
                          <p className="text-xs text-mute-2">
                            {i.kind === "quote" ? "Quote" : "Invoice"} · {fmtDate(i.issueOn)}
                          </p>
                        </div>
                        <span className="text-sm tabular-nums">{kes(i.totals.total)}</span>
                        <Pill tone={docTone[i.status]}>{labelOf(invoiceStatuses[i.kind], i.status)}</Pill>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-6 text-sm text-mute-2">Nothing billed yet.</p>
              )}
            </Panel>
          ) : null}
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title="Details">
            <div className="space-y-4 p-5 text-sm">
              <dl className="space-y-2">
                {client.email ? <dd className="break-all">{client.email}</dd> : null}
                {client.phone ? <dd>{client.phone}</dd> : null}
                {client.address ? <dd className="text-mute-2">{client.address}</dd> : null}
                {client.kraPin ? <dd>KRA PIN {client.kraPin}</dd> : null}
              </dl>
              <ContactLinks name={client.name} email={client.email} phone={client.phone} subject="Brand House" />
              {client.notes ? <p className="whitespace-pre-wrap rounded-xl bg-paper/60 p-3 leading-relaxed ring-1 ring-ink/8">{client.notes}</p> : null}
            </div>
          </Panel>
          <ClientMenu client={client} isOwner={isOwner} />
        </div>
      </div>
    </>
  );
}
