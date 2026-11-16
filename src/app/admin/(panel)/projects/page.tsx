import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { listClients, listProjects, todayKE } from "@/lib/biz/data";
import { kes, labelOf, projectStatuses } from "@/lib/biz/types";
import { EmptyState } from "@/components/admin/ui";
import { dueLabel, NotConnected, PageHeader, Pill, projectTone, Tabs } from "@/components/admin/biz/bits";
import { ProjectButton } from "@/components/admin/biz/records";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  const { status = "current" } = await searchParams;
  const [projects, clients] = await Promise.all([listProjects(), listClients()]);
  const today = todayKE();
  const shown = status === "current" ? projects.filter((p) => p.status !== "done") : status === "all" ? projects : projects.filter((p) => p.status === status);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Client work in progress, with tasks, files and billing."
        actions={<ProjectButton clients={clients.map((c) => ({ id: c.id, label: c.company || c.name }))} />}
      />
      <Tabs
        current={status}
        items={[
          { id: "current", label: "Current", href: "/admin/projects", count: projects.filter((p) => p.status !== "done").length },
          ...projectStatuses.map((s) => ({ id: s.id, label: s.label, href: `/admin/projects?status=${s.id}` })),
          { id: "all", label: "All", href: "/admin/projects?status=all", count: projects.length },
        ]}
      />
      {shown.length === 0 ? (
        <EmptyState icon={<FolderKanban className="size-6" />} title={projects.length ? "Nothing here" : "No projects yet"} body="Create one here, or win a lead to start a project automatically." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const total = p.openTasks + p.doneTasks;
            const pct = total ? Math.round((p.doneTasks / total) * 100) : 0;
            const due = p.status !== "done" ? dueLabel(p.dueOn, today) : null;
            return (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:ring-ink/25">
                  <div className="flex items-start justify-between gap-3">
                    <Pill tone={projectTone[p.status]}>{labelOf(projectStatuses, p.status)}</Pill>
                    {due ? <Pill tone={due.tone}>{due.label}</Pill> : null}
                  </div>
                  <p className="mt-3 font-display text-lg font-semibold leading-snug">{p.name}</p>
                  <p className="truncate text-sm text-mute-2">{p.clientName ?? "Internal"}</p>
                  <div className="mt-auto pt-5">
                    <div className="flex justify-between text-xs text-ink/55">
                      <span>
                        {p.doneTasks}/{total} tasks
                      </span>
                      {p.budget ? <span>{kes(p.budget)}</span> : null}
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
