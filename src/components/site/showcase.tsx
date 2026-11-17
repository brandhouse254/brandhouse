import NextLink from "next/link";
import { workCategoryLabels, type Project } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { Pic } from "./photo";

/*
 * Project cards. Each project chooses (in the admin) how its cover is shown:
 * a plain photo, or inside a mock-up (social ad, phone, browser, film).
 * Cards fill whatever box they're given, so the same card works in the
 * homepage bento, the /work grid and "more work" rows.
 */

const fade = "absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(10_10_10/0.85))]";
const zoom = "object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]";

export const kickerFor = (p: Project) => (p.categories[0] ? workCategoryLabels[p.categories[0]] : p.industry);

function Caption({ project, dark = true }: { project: Project; dark?: boolean }) {
  return (
    <div>
      <p className={cn("text-xs font-medium uppercase tracking-[0.14em]", dark ? "text-white/65" : "text-[#111]/60")}>{kickerFor(project)}</p>
      <h3 className="mt-1.5 font-display text-[1.4rem] font-semibold leading-[1.05] tracking-[-0.025em] md:text-[1.6rem]">{project.title}</h3>
    </div>
  );
}

/** Placeholder brand avatar for the ad and story mock-ups. */
function Avatar({ className }: { className?: string }) {
  return (
    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md bg-[#111] font-display text-[0.6rem] font-bold text-white", className)}>
      Y.
    </span>
  );
}

function Wrap({ asLink, href, className, children }: { asLink: boolean; href: string; className: string; children: React.ReactNode }) {
  return asLink ? (
    <NextLink href={href} className={className}>
      {children}
    </NextLink>
  ) : (
    <div className={className}>{children}</div>
  );
}

export function ShowcaseCard({
  project: p,
  sizes,
  className,
  asLink = true,
  priority,
}: {
  project: Project;
  sizes: string;
  className?: string;
  /** False on the project's own page, where the card is the cover art rather than a link. */
  asLink?: boolean;
  priority?: boolean;
}) {
  const base = cn("group relative block h-full overflow-hidden rounded-[1.75rem]", className);
  const href = `/work/${p.slug}`;
  const cover = p.cover.src;

  if (p.frame === "phone") {
    return (
      <Wrap asLink={asLink} href={href} className={cn(base, "bg-accent text-[#111]")}>
        <div className="absolute inset-x-0 top-0 z-10 p-6">
          <Caption project={p} dark={false} />
        </div>
        <div className="absolute left-1/2 top-[7.25rem] aspect-[9/17] h-[calc(100%-4.75rem)] -translate-x-1/2 overflow-hidden rounded-[2rem] bg-[#111] ring-[6px] ring-[#111] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2">
          {cover ? <Pic src={cover} alt={p.cover.alt} fill sizes="(min-width: 768px) 18vw, 52vw" className="object-cover" /> : null}
          <div className="absolute inset-x-3 top-3 flex gap-1" aria-hidden>
            <span className="h-0.5 flex-1 rounded bg-white" />
            <span className="h-0.5 flex-1 rounded bg-white/45" />
            <span className="h-0.5 flex-1 rounded bg-white/45" />
          </div>
          <div className="absolute left-3 top-6 flex items-center gap-1.5 text-[0.65rem] font-semibold text-white" aria-hidden>
            <Avatar className="size-5 ring-2 ring-white" /> yourbrand
          </div>
        </div>
      </Wrap>
    );
  }

  if (p.frame === "browser") {
    return (
      <Wrap asLink={asLink} href={href} className={cn(base, "flex flex-col bg-[#111] text-white")}>
        <div className="relative mx-4 mt-4 min-h-0 flex-1 overflow-hidden rounded-t-2xl bg-[#f5f2ec] text-[#111] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 md:mx-6 md:mt-6" aria-hidden>
          <div className="flex items-center gap-1.5 border-b border-[#111]/10 bg-white px-3 py-2">
            <span className="size-2 rounded-full bg-[#ff5f57]" />
            <span className="size-2 rounded-full bg-[#febc2e]" />
            <span className="size-2 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate rounded-md bg-[#111]/5 px-3 py-0.5 text-[0.65rem] text-[#111]/60">yourbrand.co.ke</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-[0.62rem] md:px-6">
            <span className="font-display text-xs font-bold tracking-[-0.02em]">YOURBRAND.</span>
            <span className="hidden gap-4 text-[#111]/60 sm:flex">
              <span>Shop</span>
              <span>Lookbook</span>
              <span>Stories</span>
            </span>
            <span className="rounded-full bg-[#111] px-2.5 py-1 text-white">Bag (2)</span>
          </div>
          <div className="grid h-[calc(100%-4.5rem)] grid-cols-2 gap-3 px-4 pb-4 md:px-6">
            <div className="flex flex-col justify-center">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.16em] text-accent-deep">New season</p>
              <p className="mt-2 font-display text-[clamp(1.1rem,2.4vw,2.2rem)] font-bold leading-[0.95] tracking-[-0.04em]">{p.tagline || p.title}</p>
              <span className="mt-3 inline-flex w-fit rounded-full bg-accent px-3 py-1.5 text-[0.62rem] font-semibold">Shop now</span>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-[#ddd]">
              {cover ? <Pic src={cover} alt="" fill sizes="(min-width: 768px) 24vw, 40vw" className="object-cover object-[50%_25%]" /> : null}
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 p-6">
          <Caption project={p} />
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:rotate-45" aria-hidden>
            ↗
          </span>
        </div>
      </Wrap>
    );
  }

  return (
    <Wrap asLink={asLink} href={href} className={cn(base, "bg-[#1b1b1b] text-white")}>
      {cover ? <Pic src={cover} alt={p.cover.alt} fill sizes={sizes} priority={priority} className={zoom} /> : null}
      <div className={fade} aria-hidden />

      {p.frame === "ad" ? (
        <div className="absolute right-4 top-4 w-44 rounded-2xl bg-white p-3 text-[#111] shadow-xl" aria-hidden>
          <div className="flex items-center gap-2">
            <Avatar />
            <div className="leading-tight">
              <p className="text-[0.7rem] font-semibold">yourbrand</p>
              <p className="text-[0.6rem] text-[#111]/50">Sponsored</p>
            </div>
          </div>
          <p className="mt-2.5 font-display text-sm font-semibold leading-tight">{p.tagline || p.title}</p>
          <span className="mt-2.5 flex h-7 items-center justify-center rounded-lg bg-[#111] text-[0.68rem] font-medium text-white">Shop now</span>
        </div>
      ) : null}

      {p.frame === "film" ? (
        <>
          <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#111] transition-transform duration-500 group-hover:scale-110" aria-hidden>
            <svg viewBox="0 0 24 24" className="ml-1 size-6" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          {p.video ? (
            <span className="absolute right-4 top-4 rounded-full bg-black/60 px-2.5 py-1 text-[0.7rem] font-medium text-white" aria-hidden>
              Watch the film
            </span>
          ) : null}
        </>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-6">
        <Caption project={p} />
      </div>
    </Wrap>
  );
}

/** Full-bleed horizontal swipe on phones that turns back into a normal grid from `md` up. */
export const SWIPE =
  "-mx-[clamp(1rem,4vw,3.5rem)] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[clamp(1rem,4vw,3.5rem)] px-[clamp(1rem,4vw,3.5rem)] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden";

/** Bento slots for six featured projects: [column span, row span] on a 12-column grid. */
const bento = [
  "md:col-span-5 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-4 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-7 md:row-span-2",
  "md:col-span-5 md:row-span-2",
];

/**
 * The homepage showcase. Six projects get the editorial bento; any other
 * number falls back to an even grid so nothing looks broken.
 */
export function FeaturedShowcase({ projects }: { projects: Project[] }) {
  const isBento = projects.length === 6;
  return (
    <ul className={cn(SWIPE, isBento ? "md:grid-cols-12 md:auto-rows-[13.5rem] lg:auto-rows-[15.5rem]" : "md:grid-cols-2 lg:grid-cols-3")}>
      {projects.map((p, i) => (
        <li key={p.slug} className={cn("h-[30rem] w-[82vw] shrink-0 snap-start sm:w-[52vw] md:w-auto", isBento ? cn(bento[i], "md:h-auto") : "md:h-[32rem]")}>
          <ShowcaseCard project={p} sizes={isBento ? "(min-width: 768px) 40vw, 82vw" : "(min-width: 1024px) 32vw, (min-width: 768px) 48vw, 82vw"} />
        </li>
      ))}
    </ul>
  );
}
