import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { listProjects, listTasks, todayKE } from "@/lib/biz/data";
import { nameFrom, teamMembers } from "@/lib/biz/server";
import { taskStatuses, type Task } from "@/lib/biz/types";
import { EmptyState } from "@/components/admin/ui";
import { dueLabel, NotConnected, PageHeader, Tabs } from "@/components/admin/biz/bits";
import { NewTaskModalButton, QuickAddTask, TaskCard } from "@/components/admin/biz/tasks";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string; new?: string }> }) {
  const me = await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  const { view = "mine", new: autoOpen } = await searchParams;
  const [tasks, team, projects] = await Promise.all([listTasks(view === "mine" ? { assigneeId: me.id } : {}), teamMembers(), listProjects()]);
  const today = todayKE();
  const projectOptions = projects.filter((p) => p.status !== "done").map((p) => ({ id: p.id, label: p.clientName ? `${p.name} · ${p.clientName}` : p.name }));
  const card = (t: Task, board = false) => (
    <TaskCard key={t.id} task={t} assignee={view === "mine" && !board ? null : nameFrom(team, t.assigneeId)} due={dueLabel(t.dueOn, today)} board={board} />
  );

  const open = tasks.filter((t) => t.status !== "done");
  const weekEnd = new Date(Date.parse(`${today}T00:00:00Z`) + 7 * 86_400_000).toISOString().slice(0, 10);
  const groups = [
    { label: "Late", items: open.filter((t) => t.dueOn && t.dueOn < today) },
    { label: "Today", items: open.filter((t) => t.dueOn === today) },
    { label: "This week", items: open.filter((t) => t.dueOn && t.dueOn > today && t.dueOn <= weekEnd) },
    { label: "Later", items: open.filter((t) => t.dueOn && t.dueOn > weekEnd) },
    { label: "No date", items: open.filter((t) => !t.dueOn) },
    { label: "Done recently", items: tasks.filter((t) => t.status === "done") },
  ].filter((g) => g.items.length);

  return (
    <>
      <PageHeader
        title="Tasks"
        description={view === "mine" ? `${open.length} open task${open.length === 1 ? "" : "s"} assigned to you.` : `${open.length} open across the team.`}
        actions={<NewTaskModalButton team={team} meId={me.id} projects={projectOptions} autoOpen={autoOpen === "1"} />}
      />
      <Tabs
        current={view}
        items={[
          { id: "mine", label: "My tasks", href: "/admin/tasks" },
          { id: "all", label: "Everyone", href: "/admin/tasks?view=all" },
          { id: "board", label: "Board", href: "/admin/tasks?view=board" },
        ]}
      />

      {view === "board" ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          <div className="grid w-max snap-x snap-mandatory auto-cols-[minmax(17rem,85vw)] grid-flow-col gap-4 sm:auto-cols-[19rem] xl:w-full xl:grid-flow-row xl:grid-cols-4">
            {taskStatuses.map((s) => {
              const inCol = tasks.filter((t) => t.status === s.id);
              return (
                <section key={s.id} className="snap-start rounded-2xl bg-paper-2/60 p-3 ring-1 ring-ink/8">
                  <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">
                    {s.label} <span className="text-ink/40 tabular-nums">{inCol.length}</span>
                  </h2>
                  <div className="space-y-2.5">{inCol.length ? inCol.map((t) => card(t, true)) : <p className="px-1 py-6 text-center text-xs text-ink/40">Nothing here</p>}</div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <QuickAddTask team={team} meId={me.id} projects={projectOptions} />
          {groups.length === 0 ? (
            <EmptyState icon={<ListChecks className="size-6" />} title="All clear" body={view === "mine" ? "Nothing assigned to you. Add a task above or check Everyone." : "No tasks yet. Add one above."} />
          ) : (
            groups.map((g) => (
              <section key={g.label}>
                <h2 className={`mb-2.5 text-sm font-semibold ${g.label === "Late" ? "text-red-700" : "text-mute-2"}`}>
                  {g.label} <span className="font-normal text-ink/40">{g.items.length}</span>
                </h2>
                <div className="grid gap-2.5 lg:grid-cols-2">{g.items.map((t) => card(t))}</div>
              </section>
            ))
          )}
        </div>
      )}
    </>
  );
}
