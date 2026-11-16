"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileText, Loader2, MessageSquare, Paperclip, Plus, Send, Trash2, X } from "lucide-react";
import { addTaskComment, removeTask, saveTask, setTaskStatus } from "@/lib/biz/actions";
import { taskPriorities, taskStatuses, type Attachment, type Task } from "@/lib/biz/types";
import { useUnsavedFlag } from "@/lib/admin/dirty";
import { cn } from "@/lib/cn";
import { Button } from "../ui";
import { useUploader } from "../media";
import { Choice, ErrorNote, Input, Label, Modal, Segmented, TextBox, useAction } from "./kit";

type Member = { id: string; name: string };
type Option = { id: string; label: string };

const initials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/* ───────────── Quick add ───────────── */

export function QuickAddTask({ team, meId, projects, projectId }: { team: Member[]; meId: string; projects?: Option[]; projectId?: string }) {
  const blank = { title: "", assigneeId: meId, dueOn: "", projectId: projectId ?? "", priority: "normal" };
  const [f, setF] = useState(blank);
  const [more, setMore] = useState(false);
  const { run, pending, error } = useAction();
  const input = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  useUnsavedFlag(f.title.trim() !== "");
  return (
    <form
      className="rounded-2xl bg-white p-3 ring-1 ring-ink/10"
      onSubmit={(e) => {
        e.preventDefault();
        void run(
          () => saveTask(null, { ...f, description: "", status: "todo", priority: f.priority as "normal" }),
          () => {
            setF({ ...blank, assigneeId: f.assigneeId, projectId: f.projectId });
            input.current?.focus();
          },
        );
      }}
    >
      <div className="flex items-center gap-2">
        <Plus className="ml-1 size-5 shrink-0 text-ink/40" aria-hidden />
        <input
          ref={input}
          value={f.title}
          onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))}
          onFocus={() => setMore(true)}
          placeholder="Add a task…"
          aria-label="New task"
          className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-ink/40"
        />
        <Button type="submit" size="sm" variant="primary" disabled={pending || f.title.trim().length < 2}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Add"}
        </Button>
      </div>
      {more ? (
        <div className="mt-3 grid gap-3 border-t border-ink/8 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <Choice label="Assign to" value={f.assigneeId} onValue={set("assigneeId")} placeholder="No one" options={team.map((m) => ({ value: m.id, label: m.id === meId ? `${m.name} (me)` : m.name }))} />
          <Input label="Due" type="date" value={f.dueOn} onValue={set("dueOn")} />
          <Choice label="Priority" value={f.priority} onValue={set("priority")} options={taskPriorities.map((p) => ({ value: p.id, label: p.label }))} />
          {projects && !projectId ? (
            <Choice label="Project" value={f.projectId} onValue={set("projectId")} placeholder="No project" options={projects.map((p) => ({ value: p.id, label: p.label }))} />
          ) : null}
        </div>
      ) : null}
      <ErrorNote error={error} />
    </form>
  );
}

/* ───────────── Rows and cards ───────────── */

export function TaskCheck({ task }: { task: Pick<Task, "id" | "status" | "title"> }) {
  const { run, pending } = useAction();
  const done = task.status === "done";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void run(() => setTaskStatus(task.id, done ? "todo" : "done"));
      }}
      className={cn(
        "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ring-2 ring-inset transition-colors",
        done ? "bg-emerald-600 text-[#111] ring-emerald-600" : "ring-ink/25 hover:ring-accent",
        pending && "opacity-50",
      )}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : done ? <Check className="size-4" strokeWidth={3} /> : null}
    </button>
  );
}

export function StatusPicker({ task }: { task: Pick<Task, "id" | "status"> }) {
  const { run, pending } = useAction();
  return (
    <select
      aria-label="Move to"
      value={task.status}
      disabled={pending}
      onChange={(e) => void run(() => setTaskStatus(task.id, e.target.value))}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 h-8 rounded-full bg-ink/6 px-2.5 text-xs font-medium text-ink/75 outline-none ring-1 ring-ink/10"
    >
      {taskStatuses.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

/* ───────────── Task detail ───────────── */

export function TaskEditor({ task, team, meId, projects }: { task: Task; team: Member[]; meId: string; projects: Option[] }) {
  const router = useRouter();
  const start = {
    title: task.title,
    description: task.description,
    status: task.status as string,
    priority: task.priority as string,
    assigneeId: task.assigneeId ?? "",
    dueOn: task.dueOn ?? "",
    projectId: task.projectId ?? "",
  };
  const [f, setF] = useState(start);
  const { run, pending, error } = useAction();
  const dirty = JSON.stringify(f) !== JSON.stringify(start);
  useUnsavedFlag(dirty);
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => saveTask(task.id, { ...f, status: f.status as "todo", priority: f.priority as "normal" }));
      }}
    >
      <Input label="Task" value={f.title} onValue={set("title")} required />
      <div>
        <Label>Status</Label>
        <Segmented label="Status" value={f.status} onValue={set("status")} options={taskStatuses} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice label="Assigned to" value={f.assigneeId} onValue={set("assigneeId")} placeholder="No one" options={team.map((m) => ({ value: m.id, label: m.id === meId ? `${m.name} (me)` : m.name }))} />
        <Input label="Due" type="date" value={f.dueOn} onValue={set("dueOn")} />
        <Choice label="Priority" value={f.priority} onValue={set("priority")} options={taskPriorities.map((p) => ({ value: p.id, label: p.label }))} />
        <Choice label="Project" value={f.projectId} onValue={set("projectId")} placeholder="No project" options={projects.map((p) => ({ value: p.id, label: p.label }))} />
      </div>
      <TextBox label="Details" value={f.description} onValue={set("description")} rows={4} placeholder="What does done look like? Links, sizes, copy…" />
      <ErrorNote error={error} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this task and its comments?")) return;
            void run(() => removeTask(task.id), () => router.push(task.projectId ? `/admin/projects/${task.projectId}` : "/admin/tasks"));
          }}
        >
          <Trash2 className="size-4" /> Delete
        </Button>
        <div className="flex gap-2">
          {dirty ? (
            <Button variant="ghost" onClick={() => setF(start)} disabled={pending}>
              Discard
            </Button>
          ) : null}
          <Button type="submit" variant="primary" disabled={!dirty || pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null} Save
          </Button>
        </div>
      </div>
    </form>
  );
}

const kindOf = (type: string): Attachment["kind"] => (type.startsWith("image/") ? "image" : type.startsWith("video/") ? "video" : "file");

export function CommentComposer({ taskId }: { taskId: string }) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const { run, pending, error } = useAction();
  const { send, progress, error: uploadError } = useUploader();
  const picker = useRef<HTMLInputElement>(null);
  useUnsavedFlag(body.trim() !== "" || files.length > 0);
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => addTaskComment(taskId, body, files), () => {
          setBody("");
          setFiles([]);
        });
      }}
    >
      <TextBox value={body} onValue={setBody} rows={2} placeholder="Write an update, ask a question, share a draft…" />
      {files.length ? (
        <ul className="flex flex-wrap gap-2">
          {files.map((f) => (
            <li key={f.url} className="flex items-center gap-2 rounded-full bg-ink/6 py-1 pl-3 pr-1 text-xs">
              <FileText className="size-3.5" /> <span className="max-w-[12rem] truncate">{f.name}</span>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((y) => y.url !== f.url))} className="rounded-full p-1 hover:bg-ink/10">
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <ErrorNote error={error ?? uploadError} />
      <div className="flex items-center justify-between gap-2">
        <input
          ref={picker}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const up = await send(file);
            if (up) setFiles((x) => [...x, { url: up.url, name: file.name, kind: kindOf(up.contentType) }]);
          }}
        />
        <Button size="sm" variant="ghost" onClick={() => picker.current?.click()} disabled={progress !== null}>
          {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
          {progress !== null ? `Uploading ${progress}%` : "Attach image or video"}
        </Button>
        <Button type="submit" size="sm" variant="primary" disabled={pending || progress !== null || (!body.trim() && !files.length)}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Post
        </Button>
      </div>
    </form>
  );
}

/** Link-wrapped task card used in lists and on the board. */
export function TaskCard({
  task,
  assignee,
  due,
  showProject = true,
  board = false,
}: {
  task: Task;
  assignee: string | null;
  due: { label: string; tone: string } | null;
  showProject?: boolean;
  board?: boolean;
}) {
  const done = task.status === "done";
  const urgent = task.priority === "urgent" || task.priority === "high";
  return (
    <div className="relative flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-ink/10 transition hover:ring-ink/25">
      <TaskCheck task={task} />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/tasks/${task.id}`} className="after:absolute after:inset-0">
          <span className={cn("block break-words font-medium leading-snug", done && "text-ink/45 line-through")}>{task.title}</span>
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink/55">
          {showProject && task.projectName ? <span className="max-w-[14rem] truncate">{task.projectName}</span> : null}
          {due && !done ? (
            <span className={cn(due.tone === "red" && "font-medium text-red-700", due.tone === "amber" && "font-medium text-amber-700")}>{due.label}</span>
          ) : null}
          {urgent && !done ? <span className={cn("font-medium", task.priority === "urgent" ? "text-red-700" : "text-amber-700")}>{task.priority === "urgent" ? "Urgent" : "High"}</span> : null}
          {task.comments ? (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3" aria-hidden /> {task.comments}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {assignee ? (
          <span title={assignee} className="flex size-7 items-center justify-center rounded-full bg-ink/10 text-[0.65rem] font-semibold">
            {initials(assignee)}
          </span>
        ) : null}
        {board ? <StatusPicker task={task} /> : null}
      </div>
    </div>
  );
}

export function NewTaskModalButton({ team, meId, projects, autoOpen }: { team: Member[]; meId: string; projects: Option[]; autoOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(autoOpen));
  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New task
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="New task" wide>
        <QuickAddTask team={team} meId={meId} projects={projects} />
        <p className="mt-3 text-xs text-mute-2">Add as many as you like, then close this.</p>
      </Modal>
    </>
  );
}
