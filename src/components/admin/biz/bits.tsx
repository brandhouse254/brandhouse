import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Server-safe building blocks for the business screens. */

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="py-6">
      {back ? (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm text-mute-2 hover:text-ink">
          <span aria-hidden>←</span> {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] break-words">{title}</h1>
          {description ? <p className="mt-0.5 text-sm text-mute-2">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function LinkButton({
  href,
  children,
  variant = "secondary",
  className,
  target,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "accent" | "secondary" | "ghost";
  className?: string;
  target?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
        variant === "primary" && "bg-ink text-white hover:bg-ink-2",
        variant === "accent" && "bg-accent font-semibold text-[#111] hover:bg-accent-deep",
        variant === "secondary" && "bg-white text-ink ring-1 ring-ink/15 hover:ring-ink/30",
        variant === "ghost" && "text-ink/70 hover:bg-ink/6 hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Segmented links (filters and sub-pages). */
export function Tabs({ items, current }: { items: { href: string; label: string; id: string; count?: number }[]; current: string }) {
  return (
    <nav className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Filter">
      <ul className="flex w-max gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
        {items.map((t) => (
          <li key={t.id}>
            <Link
              href={t.href}
              aria-current={t.id === current ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors",
                t.id === current ? "bg-ink text-paper" : "text-ink/65 hover:text-ink",
              )}
            >
              {t.label}
              {typeof t.count === "number" ? (
                <span className={cn("text-xs tabular-nums", t.id === current ? "text-paper/70" : "text-ink/40")}>{t.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const tones = {
  neutral: "bg-ink/8 text-ink/75",
  blue: "bg-sky-400/12 text-sky-300",
  violet: "bg-violet-400/12 text-violet-300",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  orange: "bg-accent/15 text-accent",
} as const;
export type Tone = keyof typeof tones;

export function Pill({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export const stageTone: Record<string, Tone> = { new: "orange", contacted: "blue", proposal: "violet", won: "green", lost: "neutral" };
export const projectTone: Record<string, Tone> = { planning: "blue", active: "orange", on_hold: "amber", done: "green" };
export const taskTone: Record<string, Tone> = { todo: "neutral", in_progress: "orange", review: "violet", done: "green" };
export const priorityTone: Record<string, Tone> = { low: "neutral", normal: "neutral", high: "amber", urgent: "red" };
export const docTone: Record<string, Tone> = {
  draft: "neutral",
  sent: "blue",
  partial: "amber",
  paid: "green",
  void: "neutral",
  accepted: "green",
  declined: "red",
  issued: "green",
};

/** 16 Nov 2026 */
export function fmtDate(d: string | null | undefined, opts: { year?: boolean } = {}) {
  if (!d) return "";
  return new Date(`${d.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: opts.year === false ? undefined : "numeric",
    timeZone: "UTC",
  });
}

/** "Today", "Tomorrow", "In 3 days", "2 days late" relative to today (YYYY-MM-DD). */
export function dueLabel(due: string | null, today: string): { label: string; tone: Tone } | null {
  if (!due) return null;
  const days = Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (days < 0) return { label: days === -1 ? "1 day late" : `${-days} days late`, tone: "red" };
  if (days === 0) return { label: "Today", tone: "amber" };
  if (days === 1) return { label: "Tomorrow", tone: "neutral" };
  if (days < 7) return { label: `In ${days} days`, tone: "neutral" };
  return { label: fmtDate(due, { year: false }), tone: "neutral" };
}

export function Stat({ label, value, note, href, tone }: { label: string; value: ReactNode; note?: ReactNode; href?: string; tone?: "red" | "green" }) {
  return (
    <div className="relative min-w-0 rounded-2xl bg-white p-4 ring-1 sm:p-5 ring-ink/10">
      <dt className="text-sm text-mute-2">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 hover:text-ink">
            {label}
          </Link>
        ) : (
          label
        )}
      </dt>
      <dd
        className={cn(
          "mt-2 whitespace-nowrap font-display text-[1.15rem] font-semibold tabular-nums tracking-[-0.03em] min-[400px]:text-[1.3rem] sm:text-[1.7rem]",
          tone === "red" && "text-red-700",
          tone === "green" && "text-emerald-700",
        )}
      >
        {value}
      </dd>
      {note ? <dd className="mt-1 truncate text-xs text-ink/45">{note}</dd> : null}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-2xl bg-white ring-1 ring-ink/10", className)}>
      {title || action ? (
        <header className="flex items-center justify-between gap-3 border-b border-ink/8 px-5 py-3.5">
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function NotConnected() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-ink/20 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold">The database isn&apos;t connected yet</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-mute-2">
        Leads, projects, tasks and invoices are kept in the database connected in Vercel Storage. Connect it to this project, then redeploy.
      </p>
    </div>
  );
}
