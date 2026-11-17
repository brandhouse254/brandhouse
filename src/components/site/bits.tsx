import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "../Breadcrumbs";

/** Section rhythm used across the site: tight enough that pages never feel empty. */
export const SECTION = "py-16 md:py-24";

/** Little live equaliser, used where a status dot would normally go. */
export function Bars() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="bh-eq w-[3px] rounded-[1px] bg-accent" style={{ animationDelay: `${i * -0.35}s` }} />
      ))}
    </span>
  );
}

/** Small label above a heading, with a short orange rule. */
export function Kicker({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <p className={cn("flex items-center gap-3 font-display text-sm font-medium", dark ? "text-accent" : "text-accent-deep", className)}>
      <span className="h-px w-8 bg-accent" aria-hidden />
      {children}
    </p>
  );
}

const glow = {
  backgroundImage:
    "radial-gradient(60rem 40rem at 85% 0%, rgb(253 80 25 / 0.16), transparent 60%), radial-gradient(40rem 30rem at 0% 100%, rgb(253 80 25 / 0.07), transparent 60%)",
};

/** Dark opening section for inner pages, matching the homepage hero. */
export function DarkHero({
  title,
  intro,
  crumbs,
  eyebrow,
  children,
  aside,
}: {
  title: ReactNode;
  intro?: ReactNode;
  crumbs?: { name: string; path: string }[];
  eyebrow?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white" style={glow}>
      <div className={cn("shell pb-12 pt-24 md:pb-16 md:pt-32", !!aside && "grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12")}>
        <div className={cn(!!aside && "lg:col-span-7")}>
          {crumbs ? <Breadcrumbs items={crumbs} className="mb-6 text-white/55" /> : null}
          {eyebrow ? (
            <p className="hero-fade mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80">
              <Bars /> {eyebrow}
            </p>
          ) : null}
          <h1 className="type-display max-w-[18ch]">{title}</h1>
          {intro ? <div className="type-lead mt-6 max-w-[52ch] text-white/70">{intro}</div> : null}
          {children}
        </div>
        {aside ? <div className="hero-fade lg:col-span-5">{aside}</div> : null}
      </div>
    </section>
  );
}
