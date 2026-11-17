"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Film,
  ImageIcon,
  KeyRound,
  Loader2,
  Shield,
  Trash2,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import {
  addTeamMember,
  deleteMedia,
  listMedia,
  removeTeamMember,
  resetTeamPassword,
  updateTeamMember,
  type MediaItem,
} from "@/lib/admin/actions";
import type { PublicUser, Role } from "@/lib/auth/users";
import { cn } from "@/lib/cn";
import { useUploader } from "./media";
import { Badge, Button, Card, EmptyState, formatBytes, Grid, Select, TextField, timeAgo } from "./ui";
import { thumb } from "@/lib/cms/thumb";

/* ───────────── Media library ───────────── */

export function MediaScreen() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [queue, setQueue] = useState<{ name: string; done: boolean; failed?: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const { send, progress, error: uploadError } = useUploader();
  const input = useRef<HTMLInputElement>(null);

  const load = () => listMedia().then((r) => (r.ok ? setItems(r.items) : setError(r.error)));
  useEffect(() => {
    void load();
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    setQueue(list.map((f) => ({ name: f.name, done: false })));
    for (let i = 0; i < list.length; i++) {
      const ok = await send(list[i]);
      setQueue((q) => q.map((x, j) => (j === i ? { ...x, done: true, failed: ok ? undefined : "Failed" } : x)));
    }
    await load();
    setTimeout(() => setQueue([]), 2500);
  };

  const shown = (items ?? []).filter((i) => filter === "all" || i.kind === filter);
  const total = (items ?? []).reduce((n, i) => n + i.size, 0);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 py-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Media library</h1>
          <p className="mt-0.5 text-sm text-mute-2">
            Every image and video you&apos;ve uploaded{items ? ` · ${items.length} files · ${formatBytes(total)}` : ""}
          </p>
        </div>
        <div>
          <input
            ref={input}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={(e) => e.target.files && void uploadFiles(e.target.files)}
          />
          <Button variant="primary" onClick={() => input.current?.click()} disabled={progress !== null}>
            {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {progress !== null ? `Uploading ${progress}%` : "Upload files"}
          </Button>
        </div>
      </header>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files);
        }}
        className="mb-6 rounded-2xl border-2 border-dashed border-ink/15 bg-white/60 px-6 py-8 text-center text-sm text-mute-2"
      >
        Drag and drop images or videos here to upload them. Images up to 25 MB, videos up to 500 MB.
        {queue.length ? (
          <ul className="mx-auto mt-4 max-w-md space-y-1 text-left">
            {queue.map((q, i) => (
              <li key={i} className="flex items-center gap-2 text-ink/75">
                {q.done ? (q.failed ? <span className="text-red-600">✕</span> : <Check className="size-4 text-emerald-600" />) : <Loader2 className="size-4 animate-spin" />}
                <span className="truncate">{q.name}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {uploadError ? <p className="mt-3 text-red-700">{uploadError}</p> : null}
      </div>

      <div className="mb-4 flex gap-2">
        {(["all", "image", "video"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm ring-1 ring-inset",
              filter === f ? "bg-ink text-white ring-ink" : "bg-white text-ink/70 ring-ink/15 hover:ring-ink/30",
            )}
          >
            {{ all: "All", image: "Images", video: "Videos" }[f]}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {!items && !error ? (
        <p className="flex items-center gap-2 text-sm text-mute-2">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : null}
      {items && shown.length === 0 ? (
        <EmptyState icon={<ImageIcon className="size-6" />} title="Nothing here yet" body="Uploads from any editor also appear here, ready to reuse." />
      ) : null}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((item) => (
          <li key={item.url} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
            <div className="relative aspect-[4/3] bg-ink/5">
              {item.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb(item.url, 384)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
              ) : item.kind === "video" ? (
                <video src={`${item.url}#t=0.5`} muted preload="metadata" className="size-full object-cover" />
              ) : null}
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#000]/70 px-2 py-0.5 text-[0.7rem] font-medium text-[#fff]">
                {item.kind === "video" ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
                {formatBytes(item.size)}
              </span>
            </div>
            <div className="flex items-center gap-1 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{item.name}</p>
                <p className="text-[0.7rem] text-ink/45">{timeAgo(item.uploadedAt)}</p>
              </div>
              <button
                type="button"
                title="Copy link"
                aria-label="Copy link"
                onClick={() => {
                  void navigator.clipboard.writeText(item.url);
                  setCopied(item.url);
                  setTimeout(() => setCopied(null), 1500);
                }}
                className="rounded-full p-1.5 text-ink/50 hover:bg-ink/6 hover:text-ink"
              >
                {copied === item.url ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>
              <button
                type="button"
                title="Delete"
                aria-label="Delete"
                onClick={async () => {
                  if (!confirm(`Delete ${item.name}? This can't be undone.`)) return;
                  const r = await deleteMedia(item.url);
                  if (r.ok) setItems((all) => (all ?? []).filter((x) => x.url !== item.url));
                  else alert(r.error);
                }}
                className="rounded-full p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ───────────── Team ───────────── */

function PasswordReveal({ email, password, onClose }: { email: string; password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `Brand House admin\nSign in: https://brandhouse.co.ke/admin\nEmail: ${email}\nTemporary password: ${password}\nYou'll be asked to choose your own password when you first sign in.`;
  return (
    <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-600/20">
      <p className="font-medium text-emerald-900">Share these sign-in details with {email}</p>
      <p className="mt-1 text-sm text-emerald-900/75">This password is shown only once. They must change it when they first sign in.</p>
      <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-4 font-mono text-sm text-ink ring-1 ring-emerald-600/15">{text}</pre>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            void navigator.clipboard.writeText(text);
            setCopied(true);
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy details"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function TeamScreen({ users, meId }: { users: PublicUser[]; meId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<{ email: string; password: string } | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Something went wrong.");
      router.refresh();
    });

  return (
    <>
      <header className="py-6">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Team members</h1>
        <p className="mt-0.5 max-w-2xl text-sm text-mute-2">
          <strong className="font-medium text-ink">Owners</strong> can do everything, including money, the team and settings.{" "}
          <strong className="font-medium text-ink">Editors</strong> can edit the website, upload media and work on leads, projects and tasks.
        </p>
      </header>

      <div className="space-y-6">
        {reveal ? <PasswordReveal {...reveal} onClose={() => setReveal(null)} /> : null}
        {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-600/15">{error}</p> : null}

        <Card title="Add someone" description="They get a temporary password to share with them, and choose their own on first sign-in.">
          <Grid cols={3}>
            <TextField label="Name" value={name} onChange={setName} />
            <TextField label="Email" type="email" value={email} onChange={setEmail} />
            <Select
              label="Role"
              value={role}
              onChange={setRole}
              options={[
                { value: "editor", label: "Editor" },
                { value: "owner", label: "Owner" },
              ]}
            />
          </Grid>
          <Button
            variant="primary"
            disabled={pending || !name || !email}
            onClick={() =>
              start(async () => {
                setError(null);
                const r = await addTeamMember({ name, email, role });
                if (!r.ok) return setError(r.error);
                setReveal({ email: email.trim().toLowerCase(), password: r.password });
                setName("");
                setEmail("");
                setRole("editor");
                router.refresh();
              })
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Add team member
          </Button>
        </Card>

        <Card title={`People with access (${users.length})`}>
          <ul className="-my-2 divide-y divide-ink/8">
            {users.map((u) => {
              const me = u.id === meId;
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className={cn("flex size-10 items-center justify-center rounded-full font-display text-sm font-semibold", u.active ? "bg-ink text-white" : "bg-ink/10 text-ink/50")}>
                    {(u.name || u.email).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {u.name} {me ? <Badge>You</Badge> : null}
                      {u.role === "owner" ? (
                        <Badge tone="orange">
                          <Shield className="size-3" /> Owner
                        </Badge>
                      ) : (
                        <Badge>Editor</Badge>
                      )}
                      {!u.active ? <Badge tone="red">Switched off</Badge> : null}
                      {u.mustChangePassword && u.active ? <Badge tone="amber">Hasn&apos;t signed in yet</Badge> : null}
                    </p>
                    <p className="truncate text-xs text-mute-2">
                      {u.email} · {u.lastLoginAt ? `last signed in ${timeAgo(u.lastLoginAt)}` : "never signed in"}
                    </p>
                  </div>
                  {!me ? (
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => updateTeamMember(u.id, { role: u.role === "owner" ? "editor" : "owner" }))}>
                        Make {u.role === "owner" ? "editor" : "owner"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            if (!confirm(`Reset ${u.name}'s password? They'll be signed out and need the new temporary password.`)) return;
                            const r = await resetTeamPassword(u.id);
                            if (!r.ok) return setError(r.error);
                            setReveal({ email: u.email, password: r.password });
                            router.refresh();
                          })
                        }
                      >
                        <KeyRound className="size-4" /> Reset password
                      </Button>
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => updateTeamMember(u.id, { active: !u.active }))}>
                        {u.active ? "Switch off" : "Switch on"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={pending}
                        onClick={() => {
                          if (confirm(`Remove ${u.name}'s access completely?`)) run(() => removeTeamMember(u.id));
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
