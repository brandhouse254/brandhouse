import Link from "next/link";
import type { DifferenceContent, HeroContent, IntroContent, PagesContent, Project, ReelFrame, Service, Testimonial } from "@/lib/cms/types";
import { defaultReel } from "@/lib/cms/defaults";
import { ButtonLink } from "../Button";
import { ProcessSteps } from "../ProcessSteps";
import { Pic } from "./photo";
import { NairobiTime, Timecode } from "./live";
import { FeaturedShowcase, SWIPE } from "./showcase";
import { Bars, SECTION } from "./bits";
import { cn } from "@/lib/cn";

/* Homepage sections. Every word and picture here is edited in the admin. */

/* ── Hero ───────────────────────────────────────────────────────────────── */

/** Keyframes for the rotating "We make …" line, built for however many words there are. */
function wordsKeyframes(n: number) {
  const name = `bh-words-${n}`;
  const steps: string[] = [];
  for (let i = 0; i < n; i++) {
    const start = (i / n) * 100;
    const hold = start + (100 / n) * 0.8;
    const y = -(i * 100) / (n + 1);
    steps.push(`${start.toFixed(2)}%,${hold.toFixed(2)}%{transform:translateY(${y.toFixed(3)}%)}`);
  }
  steps.push(`100%{transform:translateY(${(-(n * 100) / (n + 1)).toFixed(3)}%)}`);
  return { name, css: `@keyframes ${name}{${steps.join("")}}` };
}

function Reel({ frames, making }: { frames: ReelFrame[]; making: string[] }) {
  const list = frames.length >= 3 ? frames : defaultReel;
  const columns = [0, 1, 2].map((c) => list.filter((_, i) => i % 3 === c));
  const words = making.length ? making : ["brands"];
  const kf = wordsKeyframes(words.length);
  return (
    <div className="bh-reel relative h-[30rem] overflow-hidden rounded-[2rem] bg-[#0b0b0b] ring-1 ring-white/10 sm:h-[36rem] lg:h-[min(76svh,46rem)]">
      <style>{kf.css}</style>
      <div className="grid h-full grid-cols-2 gap-3 px-3 [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] sm:grid-cols-3">
        {columns.map((col, c) => (
          <div key={c} className={cn("relative overflow-hidden", c === 2 && "hidden sm:block")}>
            <div className="bh-reel-col flex flex-col gap-3" data-dir={c === 1 ? "down" : "up"} style={{ ["--reel-speed" as string]: `${[44, 52, 40][c]}s` }}>
              {[...col, ...col].map((f, i) => (
                <figure key={i} className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl bg-[#1b1b1b]" aria-hidden={i >= col.length}>
                  <Pic src={f.src} alt={i >= col.length ? "" : f.alt} fill sizes="(min-width: 1024px) 13vw, (min-width: 640px) 30vw, 46vw" priority={i === 0} className="object-cover" />
                  {f.label ? <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[0.7rem] font-medium text-white">{f.label}</figcaption> : null}
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-white">
        <span className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
          <span className="size-1.5 animate-[bh-blink_1.2s_steps(1)_infinite] rounded-full bg-[#ff3b30]" aria-hidden />
          Rec <Timecode className="tabular-nums tracking-[0.04em]" />
        </span>
        <span className="rounded-full bg-black/60 px-3 py-1.5">
          Nairobi <NairobiTime className="tabular-nums" />
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-accent px-5 py-4 text-[#111] shadow-[0_20px_50px_-20px_rgb(253_80_25/0.7)]">
        <p className="flex min-w-0 items-center gap-[0.3em] font-display text-lg font-semibold leading-[1.2em] tracking-[-0.02em] sm:text-xl">
          <span className="shrink-0 text-[#111]/60">We make</span>
          <span className="block h-[1.2em] overflow-hidden">
            <span className="block" style={{ animation: words.length > 1 ? `${kf.name} ${words.length * 2.5}s var(--ease-out-expo) infinite` : undefined }}>
              {[...words, words[0]].map((w, i) => (
                <span key={i} className="block h-[1.2em] truncate" aria-hidden={i > 0}>
                  {w}
                </span>
              ))}
            </span>
          </span>
        </p>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#111] text-white" aria-hidden>
          ↗
        </span>
      </div>
    </div>
  );
}

export function HomeHero({ hero, services }: { hero: HeroContent; services: Service[] }) {
  const ticker = hero.ticker.length ? hero.ticker : [...services.map((s) => s.title), "Product shoots", "Packaging", "Social content", "Paid ads"];
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-ink text-white"
      style={{
        backgroundImage:
          "radial-gradient(60rem 40rem at 85% 10%, rgb(253 80 25 / 0.16), transparent 60%), radial-gradient(40rem 30rem at 0% 100%, rgb(253 80 25 / 0.08), transparent 60%)",
      }}
    >
      <div className="shell grid gap-10 pb-12 pt-24 md:pt-28 lg:grid-cols-12 lg:gap-12 lg:pb-16">
        <div className="lg:col-span-7 lg:pt-10">
          {hero.eyebrow ? (
            <p className="hero-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80">
              <Bars /> {hero.eyebrow}
            </p>
          ) : null}
          <h1 id="hero-title" className="type-hero mt-6 text-[clamp(3rem,7vw,8.75rem)]">
            <span className="hero-line">
              <span>{hero.line1}</span>
            </span>
            {hero.line2 ? (
              <span className="hero-line">
                <span className="text-accent">{hero.line2}</span>
              </span>
            ) : null}
          </h1>
          {hero.lead ? <p className="hero-fade type-lead mt-7 max-w-[42ch] text-white/75">{hero.lead}</p> : null}
          <div className="hero-fade mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href={hero.primaryCta.href} icon>
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="outline">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
        <div className="hero-fade lg:col-span-5">
          <Reel frames={hero.reel} making={hero.making} />
        </div>
      </div>

      <div className="overflow-hidden border-t border-white/10 py-4" aria-hidden>
        <div className="flex w-max animate-[bh-marquee_42s_linear_infinite] whitespace-nowrap font-display text-xl font-semibold tracking-[-0.02em] text-white/80 will-change-transform md:text-3xl">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-8 pr-8">
              {ticker.map((t, i) => (
                <span key={`${k}-${i}`} className="flex items-center gap-8">
                  {t}
                  <span className="text-accent">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Featured work ──────────────────────────────────────────────────────── */

export function HomeWork({ projects, copy }: { projects: Project[]; copy: PagesContent["home"] }) {
  if (!projects.length) return null;
  return (
    <section aria-labelledby="work-title" className="bg-paper-2">
      <div className={cn("shell", SECTION)}>
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <h2 id="work-title" className="type-display md:col-span-7">
            {copy.workTitle}
          </h2>
          <div className="md:col-span-4 md:col-start-9">
            {copy.workLead ? <p className="leading-relaxed text-mute-2">{copy.workLead}</p> : null}
            <Link href="/work" className="mt-3 inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
              See all our work
            </Link>
            <p className="mt-2 text-sm text-mute-2 md:hidden" aria-hidden>
              Swipe to see more →
            </p>
          </div>
        </div>
        <div className="mt-10 md:mt-14">
          <FeaturedShowcase projects={projects} />
        </div>
      </div>
    </section>
  );
}

/* ── More than creative ─────────────────────────────────────────────────── */

export function HomeIntro({ intro }: { intro: IntroContent }) {
  const n = intro.facts.length;
  return (
    <section aria-labelledby="intro-title" className="bg-paper">
      <div className={cn("shell", SECTION)}>
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <div className="md:col-span-9">
            <h2 id="intro-title" className="flex items-center gap-3 font-display text-sm font-medium text-accent-deep">
              <span className="h-px w-8 bg-accent" aria-hidden />
              {intro.title}
            </h2>
            {intro.statement ? <p className="type-statement mt-5 max-w-[30ch]">{intro.statement}</p> : null}
          </div>
          {n > 1 ? (
            <p className="text-sm text-mute-2 md:hidden" aria-hidden>
              Swipe to see more →
            </p>
          ) : null}
        </div>

        {n ? (
          <dl className={cn(SWIPE, "mt-10 md:mt-14", n % 3 === 0 ? "md:grid-cols-3" : n === 1 ? "md:grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4")}>
            {intro.facts.map((f, i) => (
              <div key={`${i}-${f.title}`} className="group relative aspect-[4/5] w-[78vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-ink text-white sm:w-[48vw] md:aspect-[4/4.4] md:w-auto">
                {f.image?.src ? (
                  <Pic
                    src={f.image.src}
                    alt={f.image.alt}
                    fill
                    sizes="(min-width: 768px) 32vw, 78vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.15)_0%,transparent_30%,rgb(10_10_10/0.9)_78%)]" aria-hidden />
                <span className="absolute left-5 top-5 flex size-9 items-center justify-center rounded-full bg-white font-display text-sm font-semibold tabular-nums text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <dt className="font-display text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.03em]">{f.title}</dt>
                  <dd className="mt-2.5 text-[0.95rem] leading-relaxed text-white/80">{f.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

/* ── What we make ───────────────────────────────────────────────────────── */

export function ServiceCards({ services, headingLevel = "h3" }: { services: Service[]; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {services.map((s, i) => (
        <li key={s.slug} className={cn(i % 2 === 1 && "md:mt-16")}>
          <Link href={`/services/${s.slug}`} className="group relative block overflow-hidden rounded-[2rem] bg-[#1b1b1b] text-white">
            <div className="relative aspect-[4/5] sm:aspect-[5/4]">
              {s.image.src ? (
                <Pic
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  sizes="(min-width: 768px) 46vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(17_17_17/0.92))]" aria-hidden />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <span className="mb-3 block font-display text-sm tabular-nums text-accent">{s.number}</span>
              <H className="font-display text-[clamp(1.8rem,3.2vw,2.8rem)] font-semibold leading-none tracking-[-0.03em]">{s.title}</H>
              <p className="mt-3 max-w-md text-white/75">{s.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {s.capabilities.slice(0, 4).map((c) => (
                  <li key={c} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <span
              aria-hidden
              className="absolute right-5 top-5 flex size-12 items-center justify-center rounded-full bg-white text-xl text-ink transition-transform duration-500 group-hover:rotate-45 group-hover:bg-accent"
            >
              ↗
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeServices({ services, copy }: { services: Service[]; copy: PagesContent["home"] }) {
  return (
    <section aria-labelledby="services-title" className="bg-ink text-white">
      <div className={cn("shell", SECTION)}>
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="services-title" className="type-display md:col-span-7">
            {copy.servicesTitle}
          </h2>
          {copy.servicesLead ? <p className="leading-relaxed text-white/60 md:col-span-4 md:col-start-9">{copy.servicesLead}</p> : null}
        </div>
        <div className="mt-10 md:mt-14">
          <ServiceCards services={services} />
        </div>
      </div>
    </section>
  );
}

/* ── Why Brand House ────────────────────────────────────────────────────── */

export function HomeDifference({ difference, image }: { difference: DifferenceContent; image: { src: string; alt: string } }) {
  return (
    <section aria-labelledby="diff-title" className="bg-paper">
      <div className={cn("shell grid gap-10 lg:grid-cols-12", SECTION)}>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <h2 id="diff-title" className="type-display">
              {difference.title}
            </h2>
            {difference.lead ? <p className="type-lead mt-5 text-mute-2">{difference.lead}</p> : null}
            {image.src ? (
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.75rem]">
                <Pic src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover" />
              </div>
            ) : null}
          </div>
        </div>
        <ol className={cn(SWIPE, "md:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:grid-cols-1 lg:gap-3")}>
          {difference.points.map((p, i) => (
            <li key={`${i}-${p.title}`} className="w-[78vw] shrink-0 snap-start rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8 sm:w-[48vw] md:w-auto md:p-8">
              <span className="font-display text-sm font-medium tabular-nums text-mute-2">
                <span className="text-accent-deep">{String(i + 1).padStart(2, "0")}</span> / {String(difference.points.length).padStart(2, "0")}
              </span>
              <h3 className="type-h3 mt-4">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-mute-2">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── How we work ────────────────────────────────────────────────────────── */

export function HomeProcess({ copy }: { copy: PagesContent["home"] }) {
  return (
    <section aria-labelledby="process-title" className="bg-paper-2">
      <div className={cn("shell", SECTION)}>
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <h2 id="process-title" className="type-display md:col-span-7">
            {copy.processTitle}
          </h2>
          {copy.processLead ? <p className="leading-relaxed text-mute-2 md:col-span-4 md:col-start-9">{copy.processLead}</p> : null}
        </div>
        <div className="mt-10 md:mt-14">
          <ProcessSteps />
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ───────────────────────────────────────────────────────── */

export function HomeTestimonials({ testimonials, title }: { testimonials: Testimonial[]; title: string }) {
  if (!testimonials.length) return null;
  const [first, ...rest] = testimonials;
  return (
    <section aria-labelledby="voices-title" className="bg-ink text-white">
      <div className={cn("shell", SECTION)}>
        <h2 id="voices-title" className="type-meta font-medium text-white/50">
          {title}
        </h2>
        <figure className="mt-6">
          <blockquote className="type-statement max-w-[28ch]">
            <span className="text-accent">“</span>
            {first.quote}
            <span className="text-accent">”</span>
          </blockquote>
          <figcaption className="mt-6 text-white/60">
            {first.name}
            {first.role || first.company ? `, ${[first.role, first.company].filter(Boolean).join(", ")}` : ""}
          </figcaption>
        </figure>
        {rest.length ? (
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((t) => (
              <li key={t.name + t.quote.slice(0, 10)} className="rounded-[1.5rem] bg-white/[0.04] p-7 ring-1 ring-white/10">
                <p className="leading-relaxed text-white/85">“{t.quote}”</p>
                <p className="mt-5 text-sm text-white/50">
                  {t.name}
                  {t.company ? `, ${t.company}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
