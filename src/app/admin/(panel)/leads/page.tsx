import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Magnet } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { listLeads, todayKE } from "@/lib/biz/data";
import { importBlobEnquiries } from "@/lib/biz/import";
import { initialsOf, nameFrom, teamMembers } from "@/lib/biz/server";
import { kes, labelOf, leadStages } from "@/lib/biz/types";
import { readContent } from "@/lib/cms/store";
import { timeAgoServer } from "@/lib/admin/time";
import { EmptyState } from "@/components/admin/ui";
import { NotConnected, PageHeader, Pill, stageTone, Tabs, dueLabel } from "@/components/admin/biz/bits";
import { NewLeadButton } from "@/components/admin/biz/leads";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Leads" };

const OPEN = ["new", "contacted", "proposal"];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ stage?: string; mine?: string; new?: string }> }) {
  const me = await requireUser();
  if (!dbConfigured()) return <NotConnected />;
  await importBlobEnquiries();
  const { stage = "open", mine, new: autoOpen } = await searchParams;
  const [leads, team, { content }] = await Promise.all([listLeads(), teamMembers(), readContent()]);
  const today = todayKE();

  let shown = stage === "all" ? leads : stage === "open" ? leads.filter((l) => OPEN.includes(l.stage)) : leads.filter((l) => l.stage === stage);
  if (mine) shown = shown.filter((l) => l.assigneeId === me.id);
  const open = leads.filter((l) => OPEN.includes(l.stage));
  const pipelineValue = open.reduce((s, l) => s + (l.value ?? 0), 0);
  const q = (s: string) => `/admin/leads?stage=${s}${mine ? "&mine=1" : ""}`;

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${open.length} open${pipelineValue ? ` · ${kes(pipelineValue)} in the pipeline` : ""}. Website enquiries land here automatically.`}
        actions={<NewLeadButton team={team} meId={me.id} services={content.services.map((s) => s.title)} autoOpen={autoOpen === "1"} />}
      />

      {/* Pipeline at a glance */}
      <ol className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {leadStages.map((s) => {
          const inStage = leads.filter((l) => l.stage === s.id);
          const value = inStage.reduce((t, l) => t + (l.value ?? 0), 0);
          return (
            <li key={s.id}>
              <Link
                href={q(s.id)}
                className={cn(
                  "block rounded-2xl bg-white p-4 ring-1 ring-ink/10 transition hover:ring-ink/25",
                  stage === s.id && "ring-2 ring-accent",
                )}
              >
                <Pill tone={stageTone[s.id]}>{s.label}</Pill>
                <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{inStage.length}</p>
                <p className="truncate text-xs text-mute-2">{value ? kes(value) : "—"}</p>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          current={stage}
          items={[
            { id: "open", label: "Open", href: q("open"), count: open.length },
            ...leadStages.map((s) => ({ id: s.id, label: s.label, href: q(s.id) })),
            { id: "all", label: "All", href: q("all"), count: leads.length },
          ]}
        />
        <Link
          href={`/admin/leads?stage=${stage}${mine ? "" : "&mine=1"}`}
          className={cn("mb-5 inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium ring-1 ring-inset", mine ? "bg-accent text-[#111] ring-accent" : "text-ink/70 ring-ink/15")}
        >
          Only mine
        </Link>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<Magnet className="size-6" />}
          title={leads.length ? "Nothing here" : "No leads yet"}
          body={leads.length ? "No leads match this filter." : "Enquiries from the website's Contact page appear here. Add calls, WhatsApps and referrals with New lead."}
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {shown.map((l) => {
            const owner = nameFrom(team, l.assigneeId);
            const due = OPEN.includes(l.stage) ? dueLabel(l.followUpOn, today) : null;
            return (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex h-full items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink/10 transition hover:ring-ink/25">
                  <span className={cn("mt-2 size-2.5 shrink-0 rounded-full", l.read ? "bg-transparent" : "bg-accent")} aria-label={l.read ? undefined : "Unread"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("min-w-0 truncate", l.read ? "font-medium" : "font-semibold")}>{l.name}</p>
                      <Pill tone={stageTone[l.stage]}>{labelOf(leadStages, l.stage)}</Pill>
                    </div>
                    <p className="truncate text-sm text-mute-2">
                      {[l.organisation, l.services.join(", ")].filter(Boolean).join(" · ") || "No details yet"}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-ink/55">
                      {due ? <Pill tone={due.tone}>Follow up {due.label.toLowerCase()}</Pill> : null}
                      {l.value ? <span className="font-medium text-ink/80">{kes(l.value)}</span> : l.budget ? <span>{l.budget}</span> : null}
                      <span className="ml-auto flex items-center gap-2">
                        {owner ? (
                          <span title={owner} className="flex size-6 items-center justify-center rounded-full bg-ink/10 text-[0.6rem] font-semibold">
                            {initialsOf(owner)}
                          </span>
                        ) : null}
                        {timeAgoServer(l.receivedAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-ink/30" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
