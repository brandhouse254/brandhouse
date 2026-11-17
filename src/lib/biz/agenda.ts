import { readUsers } from "@/lib/auth/users";
import { notifyUsers } from "@/lib/admin/push";
import { S, q } from "@/lib/db";
import { listProjects, listTasks, todayKE, unreadLeadCount } from "./data";
import { receivables } from "./reports";
import type { Lead, Task } from "./types";

export type Agenda = {
  today: string;
  overdueTasks: Task[];
  todayTasks: Task[];
  upcomingTasks: Task[];
  followUps: Pick<Lead, "id" | "name" | "organisation" | "followUpOn" | "stage">[];
  newLeads: number;
  overdueInvoices: { id: string; number: string; clientName: string | null; balance: number; daysOverdue: number }[];
  /** Projects inside their reminder window (set per project) or past their deadline. */
  dueProjects: { id: string; name: string; clientName: string | null; dueOn: string; daysLeft: number }[];
};

const dayDiff = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** What needs doing today, for one person. */
export async function agendaFor(userId: string, role: "owner" | "editor"): Promise<Agenda> {
  const today = todayKE();
  const [tasks, followUps, newLeads, money, projects] = await Promise.all([
    listTasks({ assigneeId: userId }),
    q(
      `SELECT id, name, organisation, follow_up_on, stage FROM ${S}.leads
       WHERE follow_up_on IS NOT NULL AND follow_up_on <= $1::date AND stage NOT IN ('won', 'lost')
         AND (assignee_id = $2 ${role === "owner" ? "OR assignee_id IS NULL" : ""})
       ORDER BY follow_up_on`,
      [today, userId],
    ),
    unreadLeadCount(),
    role === "owner" ? receivables() : null,
    listProjects(),
  ]);
  // Owners hear about every project; staff about projects they have open tasks on.
  const mine = new Set(tasks.filter((t) => t.status !== "done" && t.projectId).map((t) => t.projectId));
  const dueProjects = projects
    .filter((p) => p.dueOn && p.status !== "done" && p.status !== "on_hold" && (role === "owner" || mine.has(p.id)))
    .filter((p) => dayDiff(today, p.dueOn as string) <= p.details.remindDays)
    .map((p) => ({ id: p.id, name: p.name, clientName: p.clientName ?? null, dueOn: p.dueOn as string, daysLeft: dayDiff(today, p.dueOn as string) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const open = tasks.filter((t) => t.status !== "done");
  const inAWeek = new Date(Date.parse(`${today}T00:00:00Z`) + 7 * 86_400_000).toISOString().slice(0, 10);
  return {
    today,
    overdueTasks: open.filter((t) => t.dueOn && t.dueOn < today),
    todayTasks: open.filter((t) => t.dueOn === today),
    upcomingTasks: open.filter((t) => !t.dueOn || (t.dueOn > today && t.dueOn <= inAWeek)).slice(0, 8),
    followUps: followUps.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      organisation: String(r.organisation ?? ""),
      followUpOn: r.follow_up_on instanceof Date ? r.follow_up_on.toISOString().slice(0, 10) : String(r.follow_up_on).slice(0, 10),
      stage: String(r.stage) as Lead["stage"],
    })),
    newLeads,
    overdueInvoices: (money?.items ?? [])
      .filter((i) => i.daysOverdue > 0)
      .map((i) => ({
        id: i.invoice.id,
        number: i.invoice.number,
        clientName: i.invoice.clientName,
        balance: i.invoice.totals.balance,
        daysOverdue: i.daysOverdue,
      })),
    dueProjects,
  };
}

const whenLeft = (d: number) => (d < 0 ? `${-d} day${d === -1 ? "" : "s"} late` : d === 0 ? "due today" : d === 1 ? "due tomorrow" : `due in ${d} days`);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The 7am push: one short summary per person, only if there's something to do. */
export async function sendMorningReminders(): Promise<{ sent: number }> {
  const { users } = await readUsers();
  let sent = 0;
  for (const u of users.filter((x) => x.active)) {
    const a = await agendaFor(u.id, u.role);
    const parts: string[] = [];
    const due = a.overdueTasks.length + a.todayTasks.length;
    if (due) parts.push(`${plural(due, "task")} due${a.overdueTasks.length ? ` (${a.overdueTasks.length} late)` : ""}`);
    if (a.followUps.length) parts.push(`${plural(a.followUps.length, "follow-up")}`);
    if (a.newLeads && u.role === "owner") parts.push(`${plural(a.newLeads, "new lead")}`);
    if (a.overdueInvoices.length) parts.push(`${plural(a.overdueInvoices.length, "unpaid invoice")} past due`);
    if (a.dueProjects.length) parts.push(`${plural(a.dueProjects.length, "project")} near deadline`);
    if (!parts.length) continue;
    const first = a.overdueTasks[0] ?? a.todayTasks[0];
    const project = a.dueProjects[0];
    await notifyUsers([u.id], "reminders", {
      title: `Today: ${parts.join(" · ")}`,
      body: project
        ? `“${project.name}”${project.clientName ? ` for ${project.clientName}` : ""} is ${whenLeft(project.daysLeft)}.${first ? ` Then “${first.title}”.` : ""}`
        : first
          ? `Start with “${first.title}”.`
          : a.followUps[0]
            ? `Follow up with ${a.followUps[0].name}.`
            : "Open the admin to see the list.",
      url: project && !first ? `/admin/projects/${project.id}` : "/admin",
      tag: `morning-${a.today}`,
    });
    sent++;
  }
  return { sent };
}
