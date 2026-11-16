import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { getTask, listProjects, taskComments } from "@/lib/biz/data";
import { nameFrom, teamMembers } from "@/lib/biz/server";
import { timeAgoServer } from "@/lib/admin/time";
import { NotConnected, PageHeader, Panel } from "@/components/admin/biz/bits";
import { CommentComposer, TaskEditor } from "@/components/admin/biz/tasks";

export const metadata: Metadata = { title: "Task" };

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();
  const [comments, team, projects] = await Promise.all([taskComments(id), teamMembers(), listProjects()]);
  const creator = nameFrom(team, task.createdBy);

  return (
    <>
      <PageHeader
        back={task.projectId ? { href: `/admin/projects/${task.projectId}`, label: task.projectName ?? "Project" } : { href: "/admin/tasks", label: "Tasks" }}
        title={task.title}
        description={`${creator ? `Created by ${creator} · ` : ""}${timeAgoServer(task.createdAt)}`}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Details">
          <div className="p-5">
            <TaskEditor
              key={`${task.id}-${task.status}-${task.assigneeId}-${task.dueOn}`}
              task={task}
              team={team}
              meId={me.id}
              projects={projects.map((p) => ({ id: p.id, label: p.clientName ? `${p.name} · ${p.clientName}` : p.name }))}
            />
          </div>
        </Panel>
        <Panel title={`Discussion${comments.length ? ` (${comments.length})` : ""}`}>
          <div className="space-y-4 p-5">
            {comments.length ? (
              <ol className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className={`rounded-xl px-4 py-3 ring-1 ${c.userId === me.id ? "bg-accent/8 ring-accent/20" : "bg-paper/60 ring-ink/8"}`}>
                    <p className="text-xs font-medium text-ink/60">
                      {c.userName} · <span className="font-normal">{timeAgoServer(c.createdAt)}</span>
                    </p>
                    {c.body ? <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{c.body}</p> : null}
                    {c.attachments.length ? (
                      <ul className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {c.attachments.map((a) => (
                          <li key={a.url}>
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg ring-1 ring-ink/10">
                              {a.kind === "image" ? (
                                <Image src={a.url} alt={a.name} width={320} height={240} className="aspect-[4/3] w-full object-cover" />
                              ) : a.kind === "video" ? (
                                <video src={a.url} className="aspect-[4/3] w-full bg-[#000] object-cover" muted playsInline preload="metadata" />
                              ) : (
                                <span className="flex aspect-[4/3] items-center justify-center gap-1 text-xs">
                                  <FileText className="size-4" /> {a.name}
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-mute-2">Updates, questions and drafts for this task. Everyone on it is notified.</p>
            )}
            <CommentComposer taskId={task.id} />
          </div>
        </Panel>
      </div>
    </>
  );
}
