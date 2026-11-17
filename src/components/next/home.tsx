import Image from "next/image";
import Link from "next/link";
import type { DifferenceContent, HeroContent, IntroContent, Project, Service, Testimonial } from "@/lib/cms/types";
import { ButtonLink } from "../Button";
import { ProcessSteps } from "../ProcessSteps";
import { factPhotos, photos, servicePhotos, type Photo } from "./imagery";
import { Pic } from "./photo";
import { NairobiTime, Timecode } from "./live";
import { cn } from "@/lib/cn";

/* The /next homepage concept: same content as the live homepage, new art direction. */

/** Section rhythm: tight enough that the page never feels empty between sections. */
const SECTION = "py-16 md:py-24";

/** Full-bleed horizontal swipe on phones that turns back into a normal grid from `md` up. */
const SWIPE =
  "-mx-[clamp(1rem,4vw,3.5rem)] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[clamp(1rem,4vw,3.5rem)] px-[clamp(1rem,4vw,3.5rem)] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden";

/** Little live equaliser, used where a status dot would normally go. */
function Bars() {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="bh-eq w-[3px] rounded-[1px] bg-accent" style={{ animationDelay: `${i * -0.35}s` }} />
      ))}
    </span>
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

/* ── Hero ───────────────────────────────────────────────────────────────── */

type Frame = { photo: Photo; label: string };

const reel: Frame[][] = [
  [
    { photo: photos.skincare, label: "Product shoot" },
    { photo: photos.yellowBlazer, label: "Social ad" },
    { photo: photos.leafCrown, label: "Beauty campaign" },
  ],
  [
    { photo: photos.afro, label: "Portrait series" },
    { photo: photos.dropper, label: "Packaging" },
    { photo: photos.coffeeHandover, label: "Brand film" },
  ],
  [
    { photo: photos.braids, label: "Lookbook" },
    { photo: photos.carpenter, label: "Founder story" },
    { photo: photos.mintPhone, label: "Launch content" },
  ],
];

const making = ["brand films", "identities", "websites", "campaigns"];

function Reel() {
  return (
    <div className="bh-reel relative h-[30rem] overflow-hidden rounded-[2rem] bg-[#0b0b0b] ring-1 ring-white/10 sm:h-[36rem] lg:h-[min(76svh,46rem)]">
      <div className="grid h-full grid-cols-2 gap-3 px-3 [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] sm:grid-cols-3">
        {reel.map((col, c) => (
          <div key={c} className={cn("relative overflow-hidden", c === 2 && "hidden sm:block")}>
            <div
              className="bh-reel-col flex flex-col gap-3"
              data-dir={c === 1 ? "down" : "up"}
              style={{ ["--reel-speed" as string]: `${[44, 52, 40][c]}s` }}
            >
              {[...col, ...col].map((f, i) => (
                <figure key={i} className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl bg-[#1b1b1b]" aria-hidden={i >= col.length}>
                  <Pic src={f.photo.src} alt={i >= col.length ? "" : f.photo.alt} fill sizes="(min-width: 1024px) 13vw, (min-width: 640px) 30vw, 46vw" priority={i === 0} className="object-cover" />
                  <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[0.7rem] font-medium text-white">{f.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Live overlays */}
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
        <p className="flex items-center gap-[0.3em] font-display text-lg font-semibold leading-[1.2em] tracking-[-0.02em] sm:text-xl">
          <span className="text-[#111]/60">We make</span>
          <span className="block h-[1.2em] overflow-hidden">
            <span className="bh-words block">
              {[...making, making[0]].map((w, i) => (
                <span key={i} className="block h-[1.2em] whitespace-nowrap" aria-hidden={i > 0}>
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

export function NextHero({ hero, services }: { hero: HeroContent; services: Service[] }) {
  const ticker = [...services.map((s) => s.title), "Product shoots", "Packaging", "Social content", "Paid ads"];
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
          <p className="hero-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80">
            <Bars /> {hero.eyebrow}
          </p>
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
          <p className="hero-fade type-lead mt-7 max-w-[42ch] text-white/75">{hero.lead}</p>
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
          <Reel />
        </div>
      </div>

      {/* Running list of what we do */}
      <div className="overflow-hidden border-t border-white/10 py-4" aria-hidden>
        <div className="flex w-max animate-[bh-marquee_42s_linear_infinite] whitespace-nowrap font-display text-xl font-semibold tracking-[-0.02em] text-white/80 will-change-transform md:text-3xl">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-8 pr-8">
              {ticker.map((t) => (
                <span key={`${k}-${t}`} className="flex items-center gap-8">
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

/* ── More than creative ─────────────────────────────────────────────────── */

export function NextIntro({ intro }: { intro: IntroContent }) {
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
            <p className="type-statement mt-5 max-w-[30ch]">{intro.statement}</p>
          </div>
          <p className="text-sm text-mute-2 md:hidden" aria-hidden>
            Swipe to see more →
          </p>
        </div>

        {n ? (
          <dl className={cn(SWIPE, "mt-10 md:mt-14", n % 3 === 0 ? "md:grid-cols-3" : n === 1 ? "md:grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4")}>
            {intro.facts.map((f, i) => {
              const photo = factPhotos[i % factPhotos.length];
              return (
                <div key={f.title} className="group relative aspect-[4/5] w-[78vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-ink text-white sm:w-[48vw] md:aspect-[4/4.4] md:w-auto">
                  <Pic
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 768px) 32vw, 78vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.15)_0%,transparent_30%,rgb(10_10_10/0.9)_78%)]" aria-hidden />
                  <span className="absolute left-5 top-5 flex size-9 items-center justify-center rounded-full bg-white font-display text-sm font-semibold tabular-nums text-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <dt className="font-display text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.03em]">{f.title}</dt>
                    <dd className="mt-2.5 text-[0.95rem] leading-relaxed text-white/80">{f.body}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

/* ── What we make ───────────────────────────────────────────────────────── */

export function NextServices({ services }: { services: Service[] }) {
  return (
    <section aria-labelledby="services-title" className="bg-ink text-white">
      <div className={cn("shell", SECTION)}>
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="services-title" className="type-display md:col-span-7">
            What we make
          </h2>
          <p className="leading-relaxed text-white/60 md:col-span-4 md:col-start-9">
            One team for the whole brand: how it looks, how it sounds on camera, where it lives online and who gets to see it.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2">
          {services.map((s, i) => {
            const photo = servicePhotos[s.slug] ?? photos.studioDesk;
            return (
              <li key={s.slug} className={cn(i % 2 === 1 && "md:mt-16")}>
                <Link href={`/services/${s.slug}`} className="group relative block overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[4/5] sm:aspect-[5/4]">
                    <Pic
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 768px) 46vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(17_17_17/0.92))]" aria-hidden />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <span className="mb-3 block font-display text-sm tabular-nums text-accent">{s.number}</span>
                    <h3 className="font-display text-[clamp(1.8rem,3.2vw,2.8rem)] font-semibold leading-none tracking-[-0.03em]">{s.title}</h3>
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
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ── Selected work (real case studies only) ─────────────────────────────── */

export function NextWork({ projects }: { projects: Project[] }) {
  const real = projects.filter((p) => !p.isSample).slice(0, 6);
  if (!real.length) return null;
  return (
    <section aria-labelledby="work-title" className="bg-paper">
      <div className={cn("shell", SECTION)}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="work-title" className="type-display">
            Selected work
          </h2>
          <Link href="/work" className="inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
            See all work
          </Link>
        </div>
        <ul className={cn(SWIPE, "mt-10 md:mt-14 md:grid-cols-3")}>
          {real.map((p) => (
            <li key={p.slug} className="w-[80vw] shrink-0 snap-start sm:w-[50vw] md:w-auto">
              <Link href={`/work/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-ink">
                  {/* Case-study covers come from the admin, so they use the standard optimiser. */}
                  <Image src={p.cover.src} alt={p.cover.alt} fill sizes="(min-width: 768px) 30vw, 80vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
                </div>
                <h3 className="type-h3 mt-4">{p.title}</h3>
                <p className="type-meta mt-1.5 text-mute-2">
                  {p.client ?? p.industry} / {p.services.slice(0, 2).join(", ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Formats: what a project with us turns into ─────────────────────────── */

function Caption({ kicker, title, dark = true }: { kicker: string; title: string; dark?: boolean }) {
  return (
    <div>
      <p className={cn("text-xs font-medium uppercase tracking-[0.14em]", dark ? "text-white/60" : "text-[#111]/60")}>{kicker}</p>
      <h3 className="mt-1.5 font-display text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.025em] md:text-[1.65rem]">{title}</h3>
    </div>
  );
}

const fade = "absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(10_10_10/0.85))]";
const tile = "group relative block h-[30rem] overflow-hidden rounded-[1.75rem] md:h-full";
const cell = "w-[82vw] shrink-0 snap-start sm:w-[52vw] md:w-auto";
const zoom = "object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]";

export function NextFormats() {
  return (
    <section aria-labelledby="formats-title" className="bg-paper-2">
      <div className={cn("shell", SECTION)}>
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <h2 id="formats-title" className="type-display md:col-span-7">
            Made to be noticed.
          </h2>
          <div className="md:col-span-4 md:col-start-9">
            <p className="leading-relaxed text-mute-2">
              Launch campaigns, packaging, films, lookbooks, websites and social content, planned and produced by one team so every piece looks like the same brand.
            </p>
            <Link href="/work" className="mt-3 inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
              See our work
            </Link>
            <p className="mt-2 text-sm text-mute-2 md:hidden" aria-hidden>
              Swipe to see more →
            </p>
          </div>
        </div>

        <ul className={cn(SWIPE, "mt-10 md:mt-14 md:grid-cols-12 md:auto-rows-[13.5rem] lg:auto-rows-[15.5rem]")}>
          {/* Launch campaign */}
          <li className={cn(cell, "md:col-span-5 md:row-span-2")}>
            <Link href="/services/digital-marketing" className={cn(tile, "bg-[#f2c230] text-white")}>
              <Pic src={photos.sneakers.src} alt={photos.sneakers.alt} fill sizes="(min-width: 768px) 40vw, 82vw" className={zoom} />
              <div className={fade} aria-hidden />
              <div className="absolute right-4 top-4 w-44 rounded-2xl bg-white p-3 text-[#111] shadow-xl" aria-hidden>
                <div className="flex items-center gap-2">
                  <Avatar />
                  <div className="leading-tight">
                    <p className="text-[0.7rem] font-semibold">yourbrand</p>
                    <p className="text-[0.6rem] text-[#111]/50">Sponsored</p>
                  </div>
                </div>
                <p className="mt-2.5 font-display text-sm font-semibold leading-tight">The new drop lands Friday.</p>
                <span className="mt-2.5 flex h-7 items-center justify-center rounded-lg bg-[#111] text-[0.68rem] font-medium text-white">Shop now</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Caption kicker="Campaigns" title="Product launches, from shoot to paid ads" />
              </div>
            </Link>
          </li>

          {/* Social content in a phone */}
          <li className={cn(cell, "md:col-span-3 md:row-span-2")}>
            <Link href="/services/digital-marketing" className={cn(tile, "bg-accent text-[#111]")}>
              <div className="absolute inset-x-0 top-0 p-6">
                <Caption kicker="Social" title="Content made for the feed" dark={false} />
              </div>
              <div className="absolute bottom-[-2.5rem] left-1/2 aspect-[9/17] w-[64%] -translate-x-1/2 overflow-hidden rounded-[2rem] bg-[#111] ring-[6px] ring-[#111] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2 md:w-[72%]">
                <Pic src={photos.selfie.src} alt={photos.selfie.alt} fill sizes="(min-width: 768px) 18vw, 52vw" className="object-cover" />
                <div className="absolute inset-x-3 top-3 flex gap-1" aria-hidden>
                  <span className="h-0.5 flex-1 rounded bg-white" />
                  <span className="h-0.5 flex-1 rounded bg-white/45" />
                  <span className="h-0.5 flex-1 rounded bg-white/45" />
                </div>
                <div className="absolute left-3 top-6 flex items-center gap-1.5 text-[0.65rem] font-semibold text-white" aria-hidden>
                  <Avatar className="ring-2 ring-white" /> yourbrand
                </div>
              </div>
            </Link>
          </li>

          {/* Packaging */}
          <li className={cn(cell, "md:col-span-4 md:row-span-1")}>
            <Link href="/services/branding" className={cn(tile, "bg-[#e9e2d6] text-white")}>
              <Pic src={photos.coffeeBag.src} alt={photos.coffeeBag.alt} fill sizes="(min-width: 768px) 32vw, 82vw" className={cn(zoom, "object-[50%_40%]")} />
              <div className={fade} aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Caption kicker="Branding" title="Packaging that sells on the shelf" />
              </div>
            </Link>
          </li>

          {/* Brand film */}
          <li className={cn(cell, "md:col-span-4 md:row-span-1")}>
            <Link href="/services/video-production" className={cn(tile, "bg-[#111] text-white")}>
              <Pic src={photos.plinth.src} alt={photos.plinth.alt} fill sizes="(min-width: 768px) 32vw, 82vw" className={zoom} />
              <div className={fade} aria-hidden />
              <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#111] transition-transform duration-500 group-hover:scale-110" aria-hidden>
                <svg viewBox="0 0 24 24" className="ml-1 size-6" fill="currentColor">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[0.7rem] text-white" aria-hidden>
                0:30 · 0:15 · 0:06
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Caption kicker="Film" title="Brand films and ad cuts" />
              </div>
            </Link>
          </li>

          {/* Website */}
          <li className={cn(cell, "md:col-span-7 md:row-span-2")}>
            <Link href="/services/web-development" className={cn(tile, "flex flex-col bg-[#111] text-white")}>
              <div className="relative mx-4 mt-4 flex-1 overflow-hidden rounded-t-2xl bg-[#f5f2ec] text-[#111] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 md:mx-6 md:mt-6" aria-hidden>
                <div className="flex items-center gap-1.5 border-b border-[#111]/10 bg-white px-3 py-2">
                  <span className="size-2 rounded-full bg-[#ff5f57]" />
                  <span className="size-2 rounded-full bg-[#febc2e]" />
                  <span className="size-2 rounded-full bg-[#28c840]" />
                  <span className="ml-3 rounded-md bg-[#111]/5 px-3 py-0.5 text-[0.65rem] text-[#111]/60">yourbrand.co.ke</span>
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
                    <p className="mt-2 font-display text-[clamp(1.2rem,2.6vw,2.3rem)] font-bold leading-[0.95] tracking-[-0.04em]">Made in Nairobi. Worn everywhere.</p>
                    <span className="mt-3 inline-flex w-fit rounded-full bg-accent px-3 py-1.5 text-[0.62rem] font-semibold">Shop the collection</span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl">
                    <Pic src={photos.editorial.src} alt="" fill sizes="(min-width: 768px) 24vw, 40vw" className="object-cover object-[50%_25%]" />
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between gap-4 p-6">
                <Caption kicker="Web" title="Websites and online shops that convert" />
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:rotate-45" aria-hidden>
                  ↗
                </span>
              </div>
            </Link>
          </li>

          {/* Lookbook */}
          <li className={cn(cell, "md:col-span-5 md:row-span-2")}>
            <Link href="/services/video-production" className={cn(tile, "bg-[#3b2a1d] text-white")}>
              <Pic src={photos.kente.src} alt={photos.kente.alt} fill sizes="(min-width: 768px) 40vw, 82vw" className={cn(zoom, "object-[50%_30%]")} />
              <div className={fade} aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Caption kicker="Photography" title="Lookbooks and campaign shoots" />
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ── Why Brand House ────────────────────────────────────────────────────── */

export function NextDifference({ difference }: { difference: DifferenceContent }) {
  return (
    <section aria-labelledby="diff-title" className="bg-paper">
      <div className={cn("shell grid gap-10 lg:grid-cols-12", SECTION)}>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <h2 id="diff-title" className="type-display">
              {difference.title}
            </h2>
            <p className="type-lead mt-5 text-mute-2">{difference.lead}</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.75rem]">
              <Pic src={photos.crewNairobi.src} alt={photos.crewNairobi.alt} fill sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
        <ol className={cn(SWIPE, "md:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:grid-cols-1 lg:gap-3")}>
          {difference.points.map((p, i) => (
            <li key={p.title} className="w-[78vw] shrink-0 snap-start rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8 sm:w-[48vw] md:w-auto md:p-8">
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

export function NextProcess() {
  return (
    <section aria-labelledby="process-title" className="bg-paper-2">
      <div className={cn("shell", SECTION)}>
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <h2 id="process-title" className="type-display md:col-span-7">
            How we work
          </h2>
          <p className="leading-relaxed text-mute-2 md:col-span-4 md:col-start-9">
            Every project moves through the same four stages. You sign off at each one before we move on.
          </p>
        </div>
        <div className="mt-10 md:mt-14">
          <ProcessSteps />
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ───────────────────────────────────────────────────────── */

export function NextTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  const [first, ...rest] = testimonials;
  return (
    <section aria-labelledby="voices-title" className="bg-ink text-white">
      <div className={cn("shell", SECTION)}>
        <h2 id="voices-title" className="type-meta font-medium text-white/50">
          What clients say
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

/* ── Call to action ─────────────────────────────────────────────────────── */

export function NextCta({ email }: { email: string }) {
  return (
    <section aria-labelledby="cta-title" className="bg-paper">
      <div className="shell py-10 md:py-14">
        <div
          className="relative overflow-hidden rounded-[2.5rem] bg-accent px-6 py-14 text-[#111] sm:px-12 md:px-16 md:py-20"
          style={{ backgroundImage: "radial-gradient(36rem 24rem at 100% 0%, rgb(255 255 255 / 0.28), transparent 60%)" }}
        >
          <h2 id="cta-title" className="type-display relative max-w-[13ch]">
            Let’s build something worth noticing.
          </h2>
          <div className="relative mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/contact" className="inline-flex h-14 items-center gap-3 rounded-full bg-[#111] px-7 font-display font-medium text-white transition-transform hover:-translate-y-0.5">
              Start a project <span aria-hidden>→</span>
            </Link>
            {email ? (
              <a href={`mailto:${email}`} className="font-display text-lg underline decoration-[#111]/30 underline-offset-[6px] hover:decoration-[#111]">
                {email}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
