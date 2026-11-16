"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Send, Trash2, Trophy, X } from "lucide-react";
import { addLead, addLeadNote, removeLead, updateLeadDetails, winLead } from "@/lib/biz/actions";
import { leadStages, type Lead } from "@/lib/biz/types";
import { useUnsavedFlag } from "@/lib/admin/dirty";
import { Button } from "../ui";
import { Choice, ErrorNote, Input, kesInput, Label, Modal, Segmented, TextBox, useAction } from "./kit";

type Member = { id: string; name: string };

const sources = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram / social" },
  { value: "referral", label: "Referral" },
  { value: "walk-in", label: "Walk-in / meeting" },
  { value: "event", label: "Event" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

export function NewLeadButton({ team, meId, services, autoOpen }: { team: Member[]; meId: string; services: string[]; autoOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(autoOpen));
  const blank = { source: "phone", name: "", organisation: "", email: "", phone: "", service: "", value: "", description: "", assigneeId: meId, followUpOn: "" };
  const [f, setF] = useState(blank);
  const { run, pending, error, setError } = useAction();
  useUnsavedFlag(open && (f.name !== "" || f.description !== ""));
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New lead
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="New lead">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(
              () =>
                addLead({
                  source: f.source as "phone",
                  name: f.name,
                  organisation: f.organisation,
                  email: f.email,
                  phone: f.phone,
                  services: f.service ? [f.service] : [],
                  description: f.description,
                  value: f.value,
                  assigneeId: f.assigneeId,
                  followUpOn: f.followUpOn,
                }),
              (r) => {
                setOpen(false);
                setF(blank);
                router.push(`/admin/leads/${r.id}`);
              },
            );
          }}
        >
          <Choice label="Where did it come from?" value={f.source} onValue={set("source")} options={sources} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Contact name" value={f.name} onValue={set("name")} required autoComplete="off" />
            <Input label="Business / organisation" value={f.organisation} onValue={set("organisation")} autoComplete="off" />
            <Input label="Phone" type="tel" value={f.phone} onValue={set("phone")} autoComplete="off" />
            <Input label="Email" type="email" value={f.email} onValue={set("email")} autoComplete="off" />
            <Choice label="Service" value={f.service} onValue={set("service")} placeholder="Not sure yet" options={services.map((s) => ({ value: s, label: s }))} />
            <Input label="Estimated value (KES)" inputMode="decimal" value={f.value} onValue={set("value")} placeholder="Optional" />
            <Choice label="Who follows up" value={f.assigneeId} onValue={set("assigneeId")} placeholder="No one yet" options={team.map((m) => ({ value: m.id, label: m.id === meId ? `${m.name} (me)` : m.name }))} />
            <Input label="Follow up on" type="date" value={f.followUpOn} onValue={set("followUpOn")} />
          </div>
          <TextBox label="What do they need?" value={f.description} onValue={set("description")} rows={3} />
          <ErrorNote error={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setOpen(false); setError(null); }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null} Add lead
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/** Stage, owner, follow-up date and value; each change saves straight away. */
export function LeadControls({ lead, team, meId }: { lead: Lead; team: Member[]; meId: string }) {
  const { run, pending, error } = useAction();
  const [value, setValue] = useState(kesInput(lead.value));
  const save = (patch: Parameters<typeof updateLeadDetails>[1]) => run(() => updateLeadDetails(lead.id, patch));
  return (
    <div className="space-y-5">
      <div>
        <Label>Stage</Label>
        <Segmented
          label="Stage"
          value={lead.stage}
          disabled={pending}
          onValue={(stage) => {
            if (stage === "won" && !lead.projectId) {
              document.getElementById("win-lead")?.click();
              return;
            }
            void save({ stage: stage as Lead["stage"] });
          }}
          options={leadStages}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Choice
          label="Who follows up"
          value={lead.assigneeId ?? ""}
          onValue={(v) => void save({ assigneeId: v })}
          placeholder="No one yet"
          options={team.map((m) => ({ value: m.id, label: m.id === meId ? `${m.name} (me)` : m.name }))}
        />
        <Input label="Follow up on" type="date" value={lead.followUpOn ?? ""} onValue={(v) => void save({ followUpOn: v })} />
        <Input
          label="Estimated value (KES)"
          inputMode="decimal"
          value={value}
          onValue={setValue}
          onBlur={() => value !== kesInput(lead.value) && void save({ value })}
          placeholder="Optional"
        />
      </div>
      {pending ? (
        <p className="flex items-center gap-2 text-xs text-mute-2">
          <Loader2 className="size-3.5 animate-spin" /> Saving…
        </p>
      ) : null}
      <ErrorNote error={error} />
    </div>
  );
}

export function NoteComposer({ leadId }: { leadId: string }) {
  const [body, setBody] = useState("");
  const { run, pending, error } = useAction();
  useUnsavedFlag(body.trim() !== "");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => addLeadNote(leadId, body), () => setBody(""));
      }}
    >
      <TextBox value={body} onValue={setBody} rows={2} placeholder="Add a note: a call, a meeting, what they said…" />
      <ErrorNote error={error} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant="primary" disabled={pending || !body.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Add note
        </Button>
      </div>
    </form>
  );
}

export function WinLeadButton({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${lead.organisation || lead.name}${lead.services[0] ? ` — ${lead.services[0]}` : ""}`);
  const { run, pending, error } = useAction();
  if (lead.projectId) return null;
  return (
    <>
      <Button id="win-lead" variant="accent" onClick={() => setOpen(true)}>
        <Trophy className="size-4" /> Won it
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Won! Set up the project">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => winLead(lead.id, name), (r) => router.push(`/admin/projects/${r.projectId}`));
          }}
        >
          <p className="text-sm text-mute-2">
            {lead.name}
            {lead.organisation ? ` (${lead.organisation})` : ""} becomes a client, and a project is created so you can add tasks and send a quote or invoice.
          </p>
          <Input label="Project name" value={name} onValue={setName} required />
          <ErrorNote error={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Trophy className="size-4" />} Create client & project
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function LeadMenu({ lead }: { lead: Lead }) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {lead.stage !== "lost" && lead.stage !== "won" ? (
        <Button variant="ghost" disabled={pending} onClick={() => void run(() => updateLeadDetails(lead.id, { stage: "lost" }))}>
          <X className="size-4" /> Mark lost
        </Button>
      ) : null}
      {lead.read ? (
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => void run(() => updateLeadDetails(lead.id, { read: false }), () => router.push("/admin/leads"))}
        >
          Mark as unread
        </Button>
      ) : null}
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete the lead from ${lead.name}? Its notes are deleted too. This can't be undone.`)) return;
          void run(() => removeLead(lead.id), () => router.push("/admin/leads"));
        }}
      >
        <Trash2 className="size-4" /> Delete
      </Button>
      <ErrorNote error={error} />
    </div>
  );
}
