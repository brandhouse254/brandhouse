import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { getLead, leadNotes, updateLead } from "@/lib/biz/data";
import { teamMembers } from "@/lib/biz/server";
import { labelOf, leadStages } from "@/lib/biz/types";
import { timeAgoServer } from "@/lib/admin/time";
import { NotConnected, PageHeader, Panel, Pill, stageTone } from "@/components/admin/biz/bits";
import { ContactLinks } from "@/components/admin/biz/contact-links";
import { LeadControls, LeadMenu, NoteComposer, WinLeadButton } from "@/components/admin/biz/leads";

export const metadata: Metadata = { title: "Lead" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 border-b border-ink/8 px-5 py-3 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-mute-2">{label}</dt>
      <dd className="min-w-0 break-words">{children || <span className="text-mute-2">—</span>}</dd>
    </div>
  );
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  const { id } = await params;
  let lead = await getLead(id);
  if (!lead) notFound();
  if (!lead.read) {
    await updateLead(id, { read: true });
    lead = { ...lead, read: true };
  }
  const [notes, team] = await Promise.all([leadNotes(id), teamMembers()]);
  const received = new Date(lead.receivedAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" });

  return (
    <>
      <PageHeader
        back={{ href: "/admin/leads", label: "All leads" }}
        title={lead.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {lead.organisation ? <span>{lead.organisation}</span> : null}
            <Pill tone={stageTone[lead.stage]}>{labelOf(leadStages, lead.stage)}</Pill>
            <span>
              {lead.source === "website" ? "Website enquiry" : `From ${lead.source}`} · {received}
            </span>
          </span>
        }
        actions={<WinLeadButton lead={lead} />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          {lead.projectId ? (
            <Link
              href={`/admin/projects/${lead.projectId}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-emerald-800 ring-1 ring-emerald-600/20"
            >
              <span>
                <span className="font-semibold">Won.</span> This lead is now a client with a project.
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                Open project <ArrowUpRight className="size-4" />
              </span>
            </Link>
          ) : null}

          <Panel title="Pipeline">
            <div className="p-5">
              <LeadControls lead={lead} team={team} meId={me.id} />
            </div>
          </Panel>

          <Panel title="What they need">
            <dl>
              <Row label="Services">{lead.services.join(", ")}</Row>
              <Row label="Budget">{lead.budget}</Row>
              <Row label="Timeline">{lead.timeline}</Row>
              <Row label="Heard about us">{lead.referral}</Row>
              <Row label="Details">{lead.description ? <p className="whitespace-pre-wrap leading-relaxed">{lead.description}</p> : null}</Row>
            </dl>
          </Panel>
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title="Contact">
            <div className="space-y-4 p-5">
              <dl className="space-y-1 text-sm">
                {lead.email ? <dd className="break-all">{lead.email}</dd> : null}
                {lead.phone ? <dd>{lead.phone}</dd> : null}
              </dl>
              <ContactLinks name={lead.name} email={lead.email} phone={lead.phone} subject={`Your project enquiry — ${lead.organisation || lead.name}`} />
            </div>
          </Panel>

          <Panel title={`Notes${notes.length ? ` (${notes.length})` : ""}`}>
            <div className="space-y-4 p-5">
              {notes.length ? (
                <ol className="space-y-3">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-xl bg-paper/60 px-4 py-3 ring-1 ring-ink/8">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{n.body}</p>
                      <p className="mt-1.5 text-xs text-ink/45">
                        {n.userName} · {timeAgoServer(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-mute-2">Keep a record of calls, meetings and what was agreed.</p>
              )}
              <NoteComposer leadId={lead.id} />
            </div>
          </Panel>

          <LeadMenu lead={lead} />
        </div>
      </div>
    </>
  );
}
