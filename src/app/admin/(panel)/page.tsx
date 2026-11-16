import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Briefcase, CheckCircle2, Circle, Home, Images, Inbox, Info, MessageSquareQuote, Phone, Sparkles } from "lucide-react";
import { listEnquiries } from "@/lib/admin/enquiries";
import { requireUser } from "@/lib/auth/session";
import { readContent } from "@/lib/cms/store";
import { activeSocialLinks, visibleProjects } from "@/lib/cms/public";
import { timeAgoServer } from "@/lib/admin/time";

export const metadata: Metadata = { title: "Dashboard" };

const shortcuts = [
  { href: "/admin/enquiries", label: "Enquiries", body: "Messages from the Contact page", icon: Inbox },
  { href: "/admin/homepage", label: "Homepage", body: "Hero headline, image and video", icon: Home },
  { href: "/admin/work/new", label: "Add a project", body: "Publish a new case study", icon: Briefcase },
  { href: "/admin/services", label: "Services", body: "Divisions and their pages", icon: Sparkles },
  { href: "/admin/about", label: "About page", body: "Story, approach and values", icon: Info },
  { href: "/admin/testimonials", label: "Testimonials", body: "Client quotes", icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Contact & social", body: "Phone, WhatsApp, links", icon: Phone },
  { href: "/admin/media", label: "Media library", body: "All uploaded images and videos", icon: Images },
];

export default async function Dashboard() {
  const user = await requireUser();
  const [{ content }, enquiries] = await Promise.all([readContent(), listEnquiries().catch(() => [])]);
  const newEnquiries = enquiries.filter((e) => !e.read).length;
  const live = visibleProjects(content);
  const realWork = content.projects.filter((p) => !p.isSample && p.published);
  const drafts = content.projects.filter((p) => !p.published);
  const firstName = (user.name || "there").split(" ")[0];
  const hour = Number(new Date().toLocaleString("en-KE", { hour: "numeric", hour12: false, timeZone: "Africa/Nairobi" }));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const checklist = [
    { done: content.hero.image.src.includes("blob.vercel-storage.com"), label: "Replace the placeholder hero image with your own", href: "/admin/homepage" },
    { done: Boolean(content.hero.video), label: "Add a showreel video to the hero (optional)", href: "/admin/homepage" },
    { done: realWork.length > 0, label: "Publish your first real client project", href: "/admin/work/new" },
    { done: !content.settings.showSampleProjects, label: "Hide the sample concept projects once you have real work", href: "/admin/settings" },
    { done: activeSocialLinks(content).length > 0, label: "Add your social media links", href: "/admin/settings" },
    { done: content.testimonials.length > 0, label: "Add a client testimonial", href: "/admin/testimonials" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-mute-2">{greeting},</p>
          <h1 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em]">{firstName}</h1>
        </div>
        <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-ink/15 hover:ring-ink/30">
          brandhouse.co.ke <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Projects live", value: live.length, note: `${realWork.length} client · ${live.length - realWork.length} sample${drafts.length ? ` · ${drafts.length} draft${drafts.length === 1 ? "" : "s"}` : ""}` },
          { label: "New enquiries", value: newEnquiries, note: enquiries.length ? `${enquiries.length} in total` : "None yet", href: "/admin/enquiries" },
          { label: "Services", value: content.services.length, note: "Each with its own page" },
          {
            label: "Last published",
            value: content.updatedAt ? timeAgoServer(content.updatedAt) : "Never",
            note: content.updatedBy ? `by ${content.updatedBy}` : "Original launch content",
          },
        ].map((s) => (
          <div key={s.label} className="relative rounded-2xl bg-white p-5 ring-1 ring-ink/10">
            <dt className="text-sm text-mute-2">
              {"href" in s && s.href ? (
                <Link href={s.href} className="after:absolute after:inset-0 hover:text-ink">
                  {s.label}
                </Link>
              ) : (
                s.label
              )}
            </dt>
            <dd className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">{s.value}</dd>
            <dd className="mt-1 truncate text-xs text-ink/45">{s.note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Edit the website</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {shortcuts.map(({ href, label, body, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className="group flex h-full items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(17,17,17,0.25)] hover:ring-ink/20">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper text-ink/70 transition-colors group-hover:bg-accent group-hover:text-ink">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium">{label}</span>
                    <span className="block text-sm text-mute-2">{body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white bg-[radial-gradient(120%_80%_at_100%_0%,rgb(253_80_25/0.18),transparent_60%)] p-6 ring-1 ring-accent/25">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Make it yours</h2>
            <span className="text-sm text-ink/55">
              {doneCount}/{checklist.length}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
          </div>
          <ul className="mt-5 space-y-1">
            {checklist.map((c) => {
              const inner = (
                <>
                  {c.done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden /> : <Circle className="mt-0.5 size-4 shrink-0 text-ink/30" aria-hidden />}
                  <span className={c.done ? "text-ink/45 line-through decoration-ink/25" : "text-ink/85"}>{c.label}</span>
                </>
              );
              return (
                <li key={c.label}>
                  {c.href && !c.done ? (
                    <Link href={c.href} className="flex gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-ink/5">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex gap-3 px-2 py-1.5 text-sm">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>

        </section>
      </div>
    </div>
  );
}
