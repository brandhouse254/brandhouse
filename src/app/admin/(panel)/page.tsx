import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Circle,
  FilePlus2,
  Home,
  Images,
  Info,
  ListChecks,
  Magnet,
  MessageSquareQuote,
  Phone,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { readContent } from "@/lib/cms/store";
import { activeSocialLinks, visibleProjects } from "@/lib/cms/public";
import { timeAgoServer } from "@/lib/admin/time";
import { listLeads, listProjects, todayKE } from "@/lib/biz/data";
import { agendaFor, type Agenda } from "@/lib/biz/agenda";
import { monthSnapshot } from "@/lib/biz/reports";
import { kes, kesWhole, labelOf, leadStages, type Lead, type Project } from "@/lib/biz/types";
import { dueLabel, Pill, stageTone } from "@/components/admin/biz/bits";
import { TaskCheck } from "@/components/admin/biz/tasks";
import { cn } from "@/lib/cn";
import { thumb } from "@/lib/cms/thumb";

export const metadata: Metadata = { title: "Dashboard" };

function Card({ title, href, linkLabel, children, className }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-3xl bg-white p-5 ring-1 ring-ink/10 sm:p-6", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em]">{title}</h2>
        {href ? (
          <Link href={href} className="inline-flex items-center gap-1 text-sm text-mute-2 hover:text-ink">
            {linkLabel ?? "Open"} <ArrowUpRight className="size-3.5" />
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}

const actionTile =
  "group flex min-h-[6.5rem] flex-col justify-between rounded-3xl p-4 ring-1 transition hover:-translate-y-0.5 sm:min-h-[7.5rem] sm:p-5";

export default async function Dashboard() {
  const user = await requireUser();
  const isOwner = user.role === "owner";
  const db = dbConfigured();
  const today = todayKE();
  const [{ content }, agenda, leads, projects, money] = await Promise.all([
    readContent(),
    db ? agendaFor(user.id, user.role).catch(() => null) : Promise.resolve(null as Agenda | null),
    db ? listLeads().catch(() => [] as Lead[]) : Promise.resolve([] as Lead[]),
    db ? listProjects().catch(() => [] as Project[]) : Promise.resolve([] as Project[]),
    db && isOwner ? monthSnapshot().catch(() => null) : Promise.resolve(null),
  ]);

  const firstName = (user.name || "there").split(" ")[0];
  const hour = Number(new Date().toLocaleString("en-KE", { hour: "numeric", hour12: false, timeZone: "Africa/Nairobi" }));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLine = new Date(`${today}T12:00:00Z`).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  const late = agenda?.overdueTasks ?? [];
  const dueToday = agenda?.todayTasks ?? [];
  const follow = agenda?.followUps ?? [];
  const deadlines = agenda?.dueProjects ?? [];
  const summary = [
    late.length + dueToday.length ? `${late.length + dueToday.length} task${late.length + dueToday.length === 1 ? "" : "s"} due` : null,
    follow.length ? `${follow.length} follow-up${follow.length === 1 ? "" : "s"}` : null,
    agenda?.newLeads ? `${agenda.newLeads} new lead${agenda.newLeads === 1 ? "" : "s"}` : null,
    agenda?.dueProjects.length ? `${agenda.dueProjects.length} project deadline${agenda.dueProjects.length === 1 ? "" : "s"} close` : null,
  ].filter(Boolean);

  const openLeads = leads.filter((l) => ["new", "contacted", "proposal"].includes(l.stage));
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "planning").slice(0, 4);
  const heroImage = content.hero.reel[0]?.src ?? content.hero.image.src;

  // Website checklist
  const realWork = content.projects.filter((p) => !p.isSample && p.published);
  const checklist = [
    { done: content.hero.reel.some((f) => f.src.includes("blob.vercel-storage.com")), label: "Your own photos in the hero reel", href: "/admin/homepage" },
    { done: realWork.length > 0, label: "First real client project", href: "/admin/work/new" },
    { done: realWork.some((p) => p.featured), label: "A client project featured on the homepage", href: "/admin/work" },
    { done: activeSocialLinks(content).length > 0, label: "Social links added", href: "/admin/settings" },
    { done: content.testimonials.length > 0, label: "A client testimonial", href: "/admin/testimonials" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const websiteTiles = [
    { href: "/admin/homepage", label: "Homepage", icon: Home },
    { href: "/admin/work", label: "Portfolio", icon: Briefcase },
    { href: "/admin/pages", label: "Page text", icon: FileText },
    { href: "/admin/services", label: "Services", icon: Sparkles },
    { href: "/admin/about", label: "About", icon: Info },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { href: "/admin/settings", label: "Contact", icon: Phone },
    { href: "/admin/media", label: "Media", icon: Images },
  ];

  return (
    <div className="py-6 sm:py-8">
      {/* Greeting banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#141417] ring-1 ring-ink/10">
        {heroImage ? (
          <Image src={thumb(heroImage, 1200)} alt="" fill unoptimized className="object-cover opacity-35" priority />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,#0d0d0f_15%,rgb(13_13_15/0.75)_55%,rgb(253_80_25/0.35))]" aria-hidden />
        <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 sm:p-8 lg:p-10">
          <div className="min-w-0">
            <p className="text-sm text-[#fff]/60">{dateLine}</p>
            <h1 className="mt-1 font-display text-[clamp(1.9rem,4.5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[#fff]">
              {greeting}, {firstName}
            </h1>
            <p className="mt-2 max-w-xl text-[#fff]/75">
              {db ? (summary.length ? `Today: ${summary.join(" · ")}.` : "Nothing urgent today. A good day to chase new work.") : "Connect the database to see tasks, leads and money here."}
            </p>
          </div>
          <a href="/" target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#fff] px-5 text-sm font-semibold text-[#111] hover:bg-[#fff]/90">
            View website <ArrowUpRight className="size-4" />
          </a>
        </div>
      </section>

      {/* Quick actions */}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-4">
        <li>
          <Link href="/admin/leads?new=1" className={cn(actionTile, "bg-accent text-[#111] ring-accent")}>
            <Magnet className="size-6" aria-hidden />
            <span>
              <span className="block font-display text-lg font-semibold leading-tight">Add a lead</span>
              <span className="text-sm text-[#111]/70">Call, WhatsApp, referral</span>
            </span>
          </Link>
        </li>
        <li>
          <Link href="/admin/tasks?new=1" className={cn(actionTile, "bg-white ring-ink/10 hover:ring-ink/25")}>
            <ListChecks className="size-6 text-accent" aria-hidden />
            <span>
              <span className="block font-display text-lg font-semibold leading-tight">New task</span>
              <span className="text-sm text-mute-2">Assign it to the team</span>
            </span>
          </Link>
        </li>
        <li>
          {isOwner ? (
            <Link href="/admin/finance/new?kind=invoice" className={cn(actionTile, "bg-white ring-ink/10 hover:ring-ink/25")}>
              <FilePlus2 className="size-6 text-accent" aria-hidden />
              <span>
                <span className="block font-display text-lg font-semibold leading-tight">Invoice</span>
                <span className="text-sm text-mute-2">Or a quote, in KES</span>
              </span>
            </Link>
          ) : (
            <Link href="/admin/clients?new=1" className={cn(actionTile, "bg-white ring-ink/10 hover:ring-ink/25")}>
              <UserPlus className="size-6 text-accent" aria-hidden />
              <span>
                <span className="block font-display text-lg font-semibold leading-tight">New client</span>
                <span className="text-sm text-mute-2">Contacts and projects</span>
              </span>
            </Link>
          )}
        </li>
        <li>
          <Link href="/admin/work/new" className={cn(actionTile, "bg-white ring-ink/10 hover:ring-ink/25")}>
            <Briefcase className="size-6 text-accent" aria-hidden />
            <span>
              <span className="block font-display text-lg font-semibold leading-tight">Post work</span>
              <span className="text-sm text-mute-2">Add to the portfolio</span>
            </span>
          </Link>
        </li>
      </ul>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-6 xl:grid-cols-12">
        {/* Today */}
        <Card title="Today" href="/admin/tasks" linkLabel="All tasks" className="md:col-span-6 xl:col-span-7">
          {!db ? (
            <p className="text-sm text-mute-2">Tasks appear here once the database is connected.</p>
          ) : late.length + dueToday.length + follow.length + deadlines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-paper/60 py-10 text-center">
              <CheckCircle2 className="size-8 text-emerald-700" aria-hidden />
              <p className="mt-2 font-medium">You&apos;re all caught up</p>
              <p className="text-sm text-mute-2">
                {agenda?.upcomingTasks.length ? `${agenda.upcomingTasks.length} coming up this week.` : "Nothing due."}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {deadlines.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3.5 py-3 ring-1",
                      p.daysLeft < 0 ? "bg-red-50 ring-red-200 hover:ring-red-300" : "bg-amber-50 ring-amber-200 hover:ring-amber-300",
                    )}
                  >
                    <Briefcase className={cn("size-5 shrink-0", p.daysLeft < 0 ? "text-red-700" : "text-amber-700")} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block font-medium leading-snug">{p.name}</span>
                      <span className="block truncate text-xs text-mute-2">{p.clientName ? `${p.clientName} · ` : ""}Project deadline</span>
                    </span>
                    <Pill tone={p.daysLeft < 0 ? "red" : "amber"}>
                      {p.daysLeft < 0 ? `${-p.daysLeft}d late` : p.daysLeft === 0 ? "Today" : p.daysLeft === 1 ? "Tomorrow" : `${p.daysLeft} days`}
                    </Pill>
                  </Link>
                </li>
              ))}
              {[...late, ...dueToday].slice(0, 7).map((t) => {
                const due = dueLabel(t.dueOn, today);
                return (
                  <li key={t.id} className="relative flex items-center gap-3 rounded-2xl bg-paper/60 px-3.5 py-3 ring-1 ring-ink/6">
                    <TaskCheck task={t} />
                    <Link href={`/admin/tasks/${t.id}`} className="min-w-0 flex-1 after:absolute after:inset-0">
                      <span className="line-clamp-2 block font-medium leading-snug">{t.title}</span>
                      {t.projectName ? <span className="block truncate text-xs text-mute-2">{t.projectName}</span> : null}
                    </Link>
                    {due ? <Pill tone={due.tone}>{due.label}</Pill> : null}
                  </li>
                );
              })}
              {follow.slice(0, 4).map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 rounded-2xl bg-accent/8 px-3.5 py-3 ring-1 ring-accent/20 hover:ring-accent/40">
                    <Phone className="size-5 shrink-0 text-accent" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block font-medium leading-snug">Follow up with {l.name}</span>
                      <span className="block truncate text-xs text-mute-2">{l.organisation || labelOf(leadStages, l.stage)}</span>
                    </span>
                    {(() => {
                      const d = dueLabel(l.followUpOn, today);
                      return d ? <Pill tone={d.tone}>{d.label}</Pill> : null;
                    })()}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Money (owners) or pipeline */}
        {money ? (
          <Card title="This month" href="/admin/finance" linkLabel="Finance" className="md:col-span-6 xl:col-span-5">
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: "Received", value: money.month.received, tone: "text-emerald-700" },
                { label: "Spent", value: money.month.expenses, tone: "" },
                { label: "Profit", value: money.month.profit, tone: money.month.profit < 0 ? "text-red-700" : "" },
                { label: "Overdue", value: (agenda?.overdueInvoices ?? []).reduce((s, i) => s + i.balance, 0), tone: agenda?.overdueInvoices.length ? "text-red-700" : "" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-paper/60 p-4 ring-1 ring-ink/6">
                  <dt className="text-xs text-mute-2">{s.label}</dt>
                  <dd className={cn("mt-1 truncate font-display text-lg font-semibold tracking-[-0.02em] sm:text-xl", s.tone)}>{kesWhole(s.value)}</dd>
                </div>
              ))}
            </dl>
            {agenda?.overdueInvoices.length ? (
              <ul className="mt-3 space-y-1.5">
                {agenda.overdueInvoices.slice(0, 3).map((i) => (
                  <li key={i.id}>
                    <Link href={`/admin/finance/doc/${i.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-ink/5">
                      <span className="min-w-0 truncate">
                        {i.number} · {i.clientName}
                      </span>
                      <span className="shrink-0 text-red-700">{i.daysOverdue}d late</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ) : null}

        {/* Pipeline */}
        <Card title="Leads pipeline" href="/admin/leads" linkLabel="Leads" className={cn("md:col-span-6", money ? "xl:col-span-5" : "xl:col-span-5")}>
          {db ? (
            <>
              <div className="space-y-3">
                {leadStages.map((s) => {
                  const n = leads.filter((l) => l.stage === s.id).length;
                  const max = Math.max(1, ...leadStages.map((x) => leads.filter((l) => l.stage === x.id).length));
                  return (
                    <Link key={s.id} href={`/admin/leads?stage=${s.id}`} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm hover:text-ink">
                      <span className="truncate text-mute-2">{s.label}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-ink/8">
                        <span className={cn("block h-full rounded-full", s.id === "won" ? "bg-emerald-600" : s.id === "lost" ? "bg-ink/25" : "bg-accent")} style={{ width: `${(n / max) * 100}%` }} />
                      </span>
                      <span className="text-right font-medium tabular-nums">{n}</span>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-mute-2">
                {openLeads.length} open
                {openLeads.some((l) => l.value) ? ` · ${kes(openLeads.reduce((s, l) => s + (l.value ?? 0), 0))} potential` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-mute-2">Connect the database to track leads.</p>
          )}
        </Card>

        {/* Projects */}
        <Card title="Projects in progress" href="/admin/projects" linkLabel="All projects" className={cn("md:col-span-6", money ? "xl:col-span-7" : "xl:col-span-7")}>
          {activeProjects.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {activeProjects.map((p) => {
                const total = p.openTasks + p.doneTasks;
                const due = dueLabel(p.dueOn, today);
                return (
                  <li key={p.id}>
                    <Link href={`/admin/projects/${p.id}`} className="block h-full rounded-2xl bg-paper/60 p-4 ring-1 ring-ink/6 hover:ring-ink/20">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-xs text-mute-2">{p.clientName ?? "Internal"}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${total ? (p.doneTasks / total) * 100 : 0}%` }} />
                      </div>
                      <p className="mt-1.5 flex justify-between text-xs text-ink/55">
                        <span>
                          {p.doneTasks}/{total} tasks
                        </span>
                        {due ? <span className={cn(due.tone === "red" && "text-red-700")}>{due.label}</span> : null}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-2xl bg-paper/60 p-6 text-center text-sm text-mute-2">No active projects. Win a lead to start one.</p>
          )}
        </Card>

        {/* Newest leads */}
        <Card title="Latest leads" href="/admin/leads" linkLabel="All" className="md:col-span-3 xl:col-span-5">
          {leads.length ? (
            <ul className="-mx-2 space-y-0.5">
              {leads.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-ink/5">
                    <span className={cn("size-2 shrink-0 rounded-full", l.read ? "bg-ink/15" : "bg-accent")} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm", !l.read && "font-semibold")}>{l.name}</span>
                      <span className="block truncate text-xs text-mute-2">{l.organisation || l.services[0] || l.source}</span>
                    </span>
                    <span className="hidden shrink-0 sm:inline">
                      <Pill tone={stageTone[l.stage]}>{labelOf(leadStages, l.stage)}</Pill>
                    </span>
                    <span className="shrink-0 text-xs text-ink/45">{timeAgoServer(l.receivedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mute-2">Enquiries from the website appear here.</p>
          )}
        </Card>

        {/* Website */}
        <Card title="Website" href="/" linkLabel="brandhouse.co.ke" className="md:col-span-3 xl:col-span-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <ul className="grid grid-cols-3 content-start gap-2 sm:grid-cols-4">
              {websiteTiles.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-paper/60 p-2 text-center ring-1 ring-ink/6 transition hover:bg-accent hover:text-[#111]">
                    <Icon className="size-5 text-accent group-hover:text-[#111]" aria-hidden />
                    <span className="text-xs font-medium leading-tight">{label}</span>
                  </Link>
                </li>
              ))}
              <li className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-paper/60 p-2 text-center ring-1 ring-ink/6">
                <span className="font-display text-xl font-semibold">{visibleProjects(content).length}</span>
                <span className="text-[0.68rem] leading-tight text-mute-2">projects live</span>
              </li>
            </ul>
            <div className="rounded-2xl bg-paper/60 p-4 ring-1 ring-ink/6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Make it yours</p>
                <span className="text-xs text-ink/55">
                  {doneCount}/{checklist.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
              </div>
              <ul className="mt-3 space-y-1">
                {checklist.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="flex items-start gap-2 rounded-lg px-1 py-1 text-xs hover:bg-ink/5">
                      {c.done ? <CheckCircle2 className="size-3.5 shrink-0 text-accent" aria-hidden /> : <Circle className="size-3.5 shrink-0 text-ink/30" aria-hidden />}
                      <span className={c.done ? "text-ink/45 line-through" : "text-ink/85"}>{c.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.7rem] text-ink/45">
                Last published {content.updatedAt ? timeAgoServer(content.updatedAt).toLowerCase() : "at launch"}
                {content.updatedBy ? ` by ${content.updatedBy}` : ""}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
