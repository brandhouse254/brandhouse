import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { getProject, listClients, listExpenses, listInvoices, listTasks, todayKE } from "@/lib/biz/data";
import { nameFrom, teamMembers } from "@/lib/biz/server";
import { invoiceStatuses, kes, labelOf } from "@/lib/biz/types";
import { docTone, dueLabel, fmtDate, LinkButton, NotConnected, PageHeader, Panel, Pill, Stat } from "@/components/admin/biz/bits";
import { ProjectButton, ProjectMenu } from "@/components/admin/biz/records";
import { QuickAddTask, TaskCard } from "@/components/admin/biz/tasks";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const isOwner = me.role === "owner";
  const [tasks, team, clients, invoices, expenses] = await Promise.all([
    listTasks({ projectId: id, includeDone: true }),
    teamMembers(),
    listClients(),
    isOwner ? listInvoices() : Promise.resolve([]),
    isOwner ? listExpenses() : Promise.resolve([]),
  ]);
  const today = todayKE();
  const docs = invoices.filter((i) => i.projectId === id);
  const billed = docs.filter((i) => i.kind === "invoice" && !["draft", "void"].includes(i.status));
  const received = billed.reduce((s, i) => s + i.totals.paid, 0);
  const spent = expenses.filter((e) => e.projectId === id).reduce((s, e) => s + e.amount, 0);
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <>
      <PageHeader
        back={{ href: "/admin/projects", label: "Projects" }}
        title={project.name}
        description={
          <>
            {project.clientId ? (
              <Link href={`/admin/clients/${project.clientId}`} className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
                {project.clientName}
              </Link>
            ) : (
              "Internal"
            )}
            {project.dueOn ? ` · deadline ${fmtDate(project.dueOn)}` : ""}
          </>
        }
        actions={
          <>
            <ProjectButton project={project} clients={clients.map((c) => ({ id: c.id, label: c.company || c.name }))} />
            {isOwner && project.clientId ? (
              <LinkButton href={`/admin/finance/new?kind=invoice&client=${project.clientId}&project=${project.id}`} variant="accent">
                <FilePlus2 className="size-4" /> Invoice
              </LinkButton>
            ) : null}
          </>
        }
      />

      <dl className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open tasks" value={open.length} note={`${done.length} done`} />
        <Stat label="Budget" value={project.budget ? kes(project.budget) : "—"} />
        {isOwner ? (
          <>
            <Stat label="Received" value={kes(received)} tone="green" note={`${billed.length} invoice${billed.length === 1 ? "" : "s"}`} />
            <Stat label="Spent" value={kes(spent)} note={received ? `Margin ${kes(received - spent)}` : "Expenses tagged to this project"} />
          </>
        ) : null}
      </dl>

      <div className="mb-5">
        <ProjectMenu project={project} isOwner={isOwner} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-3">
          <h2 className="font-display text-lg font-semibold">Tasks</h2>
          <QuickAddTask team={team} meId={me.id} projectId={project.id} />
          {open.map((t) => (
            <TaskCard key={t.id} task={t} assignee={nameFrom(team, t.assigneeId)} due={dueLabel(t.dueOn, today)} showProject={false} />
          ))}
          {done.length ? (
            <details className="group">
              <summary className="cursor-pointer list-none py-2 text-sm text-mute-2 hover:text-ink">
                {done.length} completed <span className="group-open:hidden">· show</span>
              </summary>
              <div className="space-y-2.5">
                {done.map((t) => (
                  <TaskCard key={t.id} task={t} assignee={nameFrom(team, t.assigneeId)} due={null} showProject={false} />
                ))}
              </div>
            </details>
          ) : null}
        </section>

        <div className="min-w-0 space-y-5">
          <Panel title="Brief">
            <p className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-ink/85">{project.description || <span className="text-mute-2">No brief yet. Use Edit to add one.</span>}</p>
          </Panel>
          {isOwner ? (
            <Panel title="Quotes & invoices">
              {docs.length ? (
                <ul>
                  {docs.map((i) => (
                    <li key={i.id} className="border-b border-ink/8 last:border-b-0">
                      <Link href={`/admin/finance/doc/${i.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/4">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{i.number}</span>
                        <span className="text-sm tabular-nums">{kes(i.totals.total)}</span>
                        <Pill tone={docTone[i.status]}>{labelOf(invoiceStatuses[i.kind], i.status)}</Pill>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-5 text-sm text-mute-2">Nothing billed for this project yet.</p>
              )}
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
