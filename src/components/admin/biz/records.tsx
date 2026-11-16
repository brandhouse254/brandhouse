"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { removeClient, removeProject, saveClient, saveProject } from "@/lib/biz/actions";
import { projectStatuses, type Client, type Project } from "@/lib/biz/types";
import { useUnsavedFlag } from "@/lib/admin/dirty";
import { Button } from "../ui";
import { Choice, ErrorNote, Input, kesInput, Label, Modal, Segmented, TextBox, useAction } from "./kit";

/* ───────────── Clients ───────────── */

type ClientDraft = { name: string; company: string; email: string; phone: string; kraPin: string; address: string; notes: string; archived: boolean };

const blankClient: ClientDraft = { name: "", company: "", email: "", phone: "", kraPin: "", address: "", notes: "", archived: false };

function ClientFields({ f, set }: { f: ClientDraft; set: (k: keyof ClientDraft) => (v: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Contact person" value={f.name} onValue={set("name")} required autoComplete="off" />
      <Input label="Company" value={f.company} onValue={set("company")} autoComplete="off" />
      <Input label="Email" type="email" value={f.email} onValue={set("email")} autoComplete="off" />
      <Input label="Phone" type="tel" value={f.phone} onValue={set("phone")} autoComplete="off" />
      <Input label="KRA PIN" hint="Shown on their invoices" value={f.kraPin} onValue={set("kraPin")} autoComplete="off" />
      <Input label="Address" value={f.address} onValue={set("address")} autoComplete="off" />
      <TextBox label="Notes" value={f.notes} onValue={set("notes")} rows={3} className="sm:col-span-2" />
    </div>
  );
}

export function ClientButton({ client, label, autoOpen }: { client?: Client; label?: string; autoOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(autoOpen));
  const start: ClientDraft = client ? { ...client } : blankClient;
  const [f, setF] = useState<ClientDraft>(start);
  const { run, pending, error } = useAction();
  const dirty = open && JSON.stringify(f) !== JSON.stringify(start);
  useUnsavedFlag(dirty);
  const set = (k: keyof ClientDraft) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      {client ? (
        <Button onClick={() => setOpen(true)}>
          <Pencil className="size-4" /> {label ?? "Edit"}
        </Button>
      ) : (
        <Button variant="accent" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> {label ?? "New client"}
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={client ? "Edit client" : "New client"} wide>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => saveClient(client?.id ?? null, f), (r) => {
              setOpen(false);
              if (!client) router.push(`/admin/clients/${r.id}`);
            });
          }}
        >
          <ClientFields f={f} set={set} />
          <ErrorNote error={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null} {client ? "Save" : "Add client"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ClientMenu({ client, isOwner }: { client: Client; isOwner: boolean }) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" disabled={pending} onClick={() => void run(() => saveClient(client.id, { ...client, archived: !client.archived }))}>
        <Archive className="size-4" /> {client.archived ? "Restore" : "Archive"}
      </Button>
      {isOwner ? (
        <Button
          variant="danger"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete ${client.company || client.name}? Their projects and invoices are kept but no longer linked to a client.`)) return;
            void run(() => removeClient(client.id), () => router.push("/admin/clients"));
          }}
        >
          <Trash2 className="size-4" /> Delete
        </Button>
      ) : null}
      <ErrorNote error={error} />
    </div>
  );
}

/* ───────────── Projects ───────────── */

type ProjectDraft = { clientId: string; name: string; description: string; status: string; startOn: string; dueOn: string; budget: string };

export function ProjectButton({
  project,
  clients,
  defaultClientId,
  label,
}: {
  project?: Project;
  clients: { id: string; label: string }[];
  defaultClientId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const start: ProjectDraft = project
    ? {
        clientId: project.clientId ?? "",
        name: project.name,
        description: project.description,
        status: project.status,
        startOn: project.startOn ?? "",
        dueOn: project.dueOn ?? "",
        budget: kesInput(project.budget),
      }
    : { clientId: defaultClientId ?? "", name: "", description: "", status: "active", startOn: "", dueOn: "", budget: "" };
  const [f, setF] = useState<ProjectDraft>(start);
  const { run, pending, error } = useAction();
  useUnsavedFlag(open && JSON.stringify(f) !== JSON.stringify(start));
  const set = (k: keyof ProjectDraft) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      {project ? (
        <Button onClick={() => setOpen(true)}>
          <Pencil className="size-4" /> {label ?? "Edit"}
        </Button>
      ) : (
        <Button variant="accent" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> {label ?? "New project"}
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={project ? "Edit project" : "New project"} wide>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => saveProject(project?.id ?? null, { ...f, status: f.status as "active" }), (r) => {
              setOpen(false);
              if (!project) router.push(`/admin/projects/${r.id}`);
            });
          }}
        >
          <Input label="Project name" value={f.name} onValue={set("name")} required autoComplete="off" placeholder="e.g. Rebrand and launch campaign" />
          <Choice label="Client" value={f.clientId} onValue={set("clientId")} placeholder="Internal / no client" options={clients.map((c) => ({ value: c.id, label: c.label }))} />
          <div>
            <Label>Status</Label>
            <Segmented label="Status" value={f.status} onValue={set("status")} options={projectStatuses} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Start" type="date" value={f.startOn} onValue={set("startOn")} />
            <Input label="Deadline" type="date" value={f.dueOn} onValue={set("dueOn")} />
            <Input label="Budget (KES)" inputMode="decimal" value={f.budget} onValue={set("budget")} placeholder="Optional" />
          </div>
          <TextBox label="Brief" value={f.description} onValue={set("description")} rows={4} placeholder="Goals, deliverables, links to assets…" />
          <ErrorNote error={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null} {project ? "Save" : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ProjectMenu({ project, isOwner }: { project: Project; isOwner: boolean }) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  const base = {
    clientId: project.clientId ?? "",
    name: project.name,
    description: project.description,
    startOn: project.startOn ?? "",
    dueOn: project.dueOn ?? "",
    budget: kesInput(project.budget),
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Segmented
        label="Project status"
        value={project.status}
        disabled={pending}
        onValue={(status) => void run(() => saveProject(project.id, { ...base, status: status as "active" }))}
        options={projectStatuses}
      />
      {isOwner ? (
        <Button
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete “${project.name}” and all its tasks? Invoices are kept. This can't be undone.`)) return;
            void run(() => removeProject(project.id), () => router.push("/admin/projects"));
          }}
        >
          <Trash2 className="size-4" /> Delete project
        </Button>
      ) : null}
      <ErrorNote error={error} />
    </div>
  );
}
