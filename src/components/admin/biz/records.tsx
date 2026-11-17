"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { removeClient, removeProject, saveClient, saveProject } from "@/lib/biz/actions";
import { blankClientDetails, blankProjectDetails, projectPriorities, projectStatuses, type Client, type ClientDetails, type Project, type ProjectDetails } from "@/lib/biz/types";
import { useUnsavedFlag } from "@/lib/admin/dirty";
import { Button } from "../ui";
import { Choice, ErrorNote, Input, kesInput, Label, Modal, Segmented, TextBox, useAction } from "./kit";

/* ───────────── Clients ───────────── */

type ClientDraft = Omit<Client, "id" | "createdAt" | "kraPin">;

const blankClient: ClientDraft = { name: "", company: "", email: "", phone: "", address: "", notes: "", archived: false, details: { ...blankClientDetails } };

const toClientDraft = (c: Client): ClientDraft => ({
  name: c.name,
  company: c.company,
  email: c.email,
  phone: c.phone,
  address: c.address,
  notes: c.notes,
  archived: c.archived,
  details: { ...blankClientDetails, ...c.details },
});

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-ink/10 p-4 sm:p-5">
      <legend className="px-1.5 font-display text-sm font-semibold">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function ClientFields({ f, setF }: { f: ClientDraft; setF: React.Dispatch<React.SetStateAction<ClientDraft>> }) {
  const set = (k: keyof Omit<ClientDraft, "details" | "archived">) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const setD = (k: keyof ClientDetails) => (v: string) => setF((x) => ({ ...x, details: { ...x.details, [k]: v } }));
  return (
    <div className="space-y-4">
      <Group title="Who they are">
        <Input label="Contact person" value={f.name} onValue={set("name")} required autoComplete="off" />
        <Input label="Their role" value={f.details.role} onValue={setD("role")} autoComplete="off" placeholder="e.g. Marketing manager" />
        <Input label="Company / brand" value={f.company} onValue={set("company")} autoComplete="off" />
        <Input label="Industry" value={f.details.industry} onValue={setD("industry")} autoComplete="off" placeholder="e.g. Fashion, Real estate" />
      </Group>
      <Group title="What they want">
        <TextBox
          label="Their project or need"
          value={f.details.needs}
          onValue={setD("needs")}
          rows={3}
          className="sm:col-span-2"
          placeholder="e.g. New logo and packaging for a juice brand, launching in March"
        />
        <Input label="How they found us" value={f.details.source} onValue={setD("source")} autoComplete="off" placeholder="e.g. Instagram, referral from…" />
      </Group>
      <Group title="Contact">
        <Input label="Phone" type="tel" value={f.phone} onValue={set("phone")} autoComplete="off" />
        <Input label="Other phone / WhatsApp" type="tel" value={f.details.altPhone} onValue={setD("altPhone")} autoComplete="off" />
        <Input label="Email" type="email" value={f.email} onValue={set("email")} autoComplete="off" />
        <Input label="Location" value={f.details.location} onValue={setD("location")} autoComplete="off" placeholder="e.g. Westlands, Nairobi" />
        <Input label="Website" type="url" value={f.details.website} onValue={setD("website")} autoComplete="off" placeholder="https://" />
        <Input label="Instagram / social" value={f.details.social} onValue={setD("social")} autoComplete="off" placeholder="@handle or link" />
        <TextBox label="Postal / billing address" value={f.address} onValue={set("address")} rows={2} className="sm:col-span-2" />
      </Group>
      <TextBox label="Notes" value={f.notes} onValue={set("notes")} rows={3} placeholder="Anything else worth remembering" />
    </div>
  );
}

export function ClientButton({ client, label, autoOpen }: { client?: Client; label?: string; autoOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(autoOpen));
  const start: ClientDraft = client ? toClientDraft(client) : blankClient;
  const [f, setF] = useState<ClientDraft>(start);
  const { run, pending, error } = useAction();
  const dirty = open && JSON.stringify(f) !== JSON.stringify(start);
  useUnsavedFlag(dirty);
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
          <ClientFields f={f} setF={setF} />
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
      <Button variant="ghost" disabled={pending} onClick={() => void run(() => saveClient(client.id, { ...toClientDraft(client), archived: !client.archived }))}>
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

type ProjectDraft = { clientId: string; name: string; description: string; status: string; startOn: string; dueOn: string; budget: string; details: ProjectDetails };

const serviceOptions = ["Branding", "Logo", "Packaging", "Photography", "Video / film", "Website", "Online shop", "Social media", "Paid ads", "Printing", "Event"];

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
        details: { ...blankProjectDetails, ...project.details },
      }
    : { clientId: defaultClientId ?? "", name: "", description: "", status: "active", startOn: "", dueOn: "", budget: "", details: { ...blankProjectDetails } };
  const [f, setF] = useState<ProjectDraft>(start);
  const { run, pending, error } = useAction();
  useUnsavedFlag(open && JSON.stringify(f) !== JSON.stringify(start));
  const set = (k: keyof Omit<ProjectDraft, "details">) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const setD = <K extends keyof ProjectDetails>(k: K, v: ProjectDetails[K]) => setF((x) => ({ ...x, details: { ...x.details, [k]: v } }));
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
          <Group title="The project">
            <Input label="Project name" value={f.name} onValue={set("name")} required autoComplete="off" placeholder="e.g. Rebrand and launch campaign" className="sm:col-span-2" />
            <Choice label="Client" value={f.clientId} onValue={set("clientId")} placeholder="Internal / no client" options={clients.map((c) => ({ value: c.id, label: c.label }))} />
            <Input label="Budget (KES)" inputMode="decimal" value={f.budget} onValue={set("budget")} placeholder="Optional" />
            <div className="sm:col-span-2">
              <Label>Status</Label>
              <Segmented label="Status" value={f.status} onValue={set("status")} options={projectStatuses} />
            </div>
            <div className="sm:col-span-2">
              <Label>What we&apos;re doing</Label>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((o) => {
                  const on = f.details.services.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setD("services", on ? f.details.services.filter((x) => x !== o) : [...f.details.services, o])}
                      className={on ? "rounded-full bg-ink px-3.5 py-2 text-sm font-medium text-white" : "rounded-full bg-white px-3.5 py-2 text-sm ring-1 ring-ink/15 hover:ring-ink/35"}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
            <TextBox label="Brief" value={f.description} onValue={set("description")} rows={4} className="sm:col-span-2" placeholder="Goals, audience, the look they want…" />
            <TextBox label="Deliverables" value={f.details.deliverables} onValue={(v) => setD("deliverables", v)} rows={3} className="sm:col-span-2" placeholder="e.g. Logo files, 10 product photos, 3 reels, website" />
          </Group>
          <Group title="Dates & reminders">
            <Input label="Start" type="date" value={f.startOn} onValue={set("startOn")} />
            <Input label="Deadline" type="date" value={f.dueOn} onValue={set("dueOn")} />
            <div>
              <Label>Priority</Label>
              <Segmented label="Priority" value={f.details.priority} onValue={(v) => setD("priority", v as ProjectDetails["priority"])} options={projectPriorities} />
            </div>
            <Input
              label="Remind the team (days before deadline)"
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={String(f.details.remindDays)}
              onValue={(v) => setD("remindDays", Math.max(0, Math.min(60, Number(v) || 0)))}
            />
          </Group>
          <Group title="People & files">
            <Input label="Contact on their side" value={f.details.contactPerson} onValue={(v) => setD("contactPerson", v)} autoComplete="off" />
            <Input label="Their phone" type="tel" value={f.details.contactPhone} onValue={(v) => setD("contactPhone", v)} autoComplete="off" />
            <Input label="Shoot / work location" value={f.details.location} onValue={(v) => setD("location", v)} autoComplete="off" />
            <Input label="Files & assets link" type="url" value={f.details.assetsLink} onValue={(v) => setD("assetsLink", v)} autoComplete="off" placeholder="Google Drive, Dropbox…" />
            <TextBox label="Other notes" value={f.details.notes} onValue={(v) => setD("notes", v)} rows={3} className="sm:col-span-2" />
          </Group>
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
