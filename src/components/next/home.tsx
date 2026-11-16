import Image from "next/image";
import Link from "next/link";
import type { DifferenceContent, HeroContent, IntroContent, Project, Service, Testimonial } from "@/lib/cms/types";
import { ButtonLink } from "../Button";
import { ProcessSteps } from "../ProcessSteps";
import { photos, servicePhotos, type Photo } from "./imagery";
import { cn } from "@/lib/cn";

/* The /next homepage concept: same content as the live homepage, new art direction. */

function Shot({ photo, className, sizes, priority, label }: { photo: Photo; className?: string; sizes: string; priority?: boolean; label?: string }) {
  return (
    <figure className={cn("group relative overflow-hidden rounded-[1.75rem] bg-[#1b1b1b]", className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05] motion-reduce:transition-none"
      />
      {label ? (
        <figcaption className="absolute bottom-3 left-3 rounded-full bg-[#111]/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function NextHero({ hero, services }: { hero: HeroContent; services: Service[] }) {
  const ticker = [...services.map((s) => s.title), "Product shoots", "Packaging", "Social content", "Paid ads"];
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink text-white">
      {/* Warm glow in the brand orange */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-20 -z-10 size-[42rem] rounded-full bg-accent/25 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -left-60 bottom-0 -z-10 size-[30rem] rounded-full bg-accent/10 blur-[120px]" />

      <div className="shell grid min-h-[100svh] items-center gap-12 pb-16 pt-32 lg:grid-cols-12 lg:gap-10 lg:pt-28">
        <div className="lg:col-span-7">
          <p className="hero-fade inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80">
            <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden /> {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="type-hero mt-7">
            <span className="hero-line">
              <span>{hero.line1}</span>
            </span>
            {hero.line2 ? (
              <span className="hero-line">
                <span className="text-accent">{hero.line2}</span>
              </span>
            ) : null}
          </h1>
          <p className="hero-fade type-lead mt-8 max-w-[40ch] text-white/75">{hero.lead}</p>
          <div className="hero-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href={hero.primaryCta.href} icon>
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="outline">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>

        {/* Editorial collage */}
        <div className="hero-fade relative grid h-[min(70svh,40rem)] grid-cols-6 grid-rows-6 gap-3 lg:col-span-5 lg:gap-4">
          <Shot photo={photos.skincare} sizes="(min-width: 1024px) 30vw, 70vw" priority className="col-span-4 row-span-4" label="Product shoot" />
          <Shot photo={photos.productOrange} sizes="(min-width: 1024px) 14vw, 35vw" priority className="col-span-2 row-span-3" label="Packaging" />
          <Shot photo={photos.filmCrew} sizes="(min-width: 1024px) 14vw, 35vw" className="col-span-2 row-span-3" label="Brand film" />
          <Shot photo={photos.campaignCans} sizes="(min-width: 1024px) 20vw, 50vw" className="col-span-4 row-span-2" label="Campaign" />
          <div className="absolute -bottom-5 -left-5 hidden rotate-[-6deg] rounded-2xl bg-accent px-5 py-4 font-display text-[#111] shadow-2xl sm:block">
            <p className="text-xs font-medium uppercase tracking-[0.14em]">Made in Nairobi</p>
            <p className="text-lg font-semibold leading-tight">For brands people remember</p>
          </div>
        </div>
      </div>

      {/* Running list of what we do */}
      <div className="border-y border-white/10 bg-white/[0.03] py-5" aria-hidden>
        <div className="flex w-max animate-[bh-marquee_40s_linear_infinite] whitespace-nowrap font-display text-2xl font-semibold tracking-[-0.02em] text-white/85 motion-reduce:animate-none md:text-4xl">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-10 pr-10">
              {ticker.map((t) => (
                <span key={`${k}-${t}`} className="flex items-center gap-10">
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

export function NextIntro({ intro }: { intro: IntroContent }) {
  return (
    <section aria-labelledby="intro-title" className="bg-paper">
      <div className="shell py-24 md:py-36">
        <h2 id="intro-title" className="type-meta mb-8 font-medium text-mute-2">
          {intro.title}
        </h2>
        <p className="type-statement reveal max-w-[24ch] md:max-w-[30ch]">
          {intro.statement.split(" ").slice(0, 6).join(" ")}{" "}
          <span className="relative mx-1 inline-block h-[0.85em] w-[2.2em] translate-y-[0.1em] overflow-hidden rounded-full align-baseline">
            <Image src={photos.dropper.src} alt="" fill sizes="160px" className="object-cover" />
          </span>{" "}
          {intro.statement.split(" ").slice(6).join(" ")}
        </p>
        {intro.facts.length ? (
          <dl className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-ink/10 sm:grid-cols-2 lg:grid-cols-4 md:mt-24">
            {intro.facts.map((f, i) => (
              <div key={f.title} className="reveal bg-paper p-6 md:p-8">
                <span className="font-display text-sm tabular-nums text-accent">0{i + 1}</span>
                <dt className="mt-4 font-display text-xl font-semibold tracking-[-0.02em]">{f.title}</dt>
                <dd className="mt-2 leading-relaxed text-mute-2">{f.body}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

export function NextServices({ services }: { services: Service[] }) {
  return (
    <section aria-labelledby="services-title" className="bg-ink text-white">
      <div className="shell py-24 md:py-36">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="services-title" className="type-display md:col-span-7">
            What we make
          </h2>
          <p className="leading-relaxed text-white/60 md:col-span-4 md:col-start-9">
            One team for the whole brand: how it looks, how it sounds on camera, where it lives online and who gets to see it.
          </p>
        </div>
        <ul className="mt-16 grid gap-4 md:mt-20 md:grid-cols-2">
          {services.map((s, i) => {
            const photo = servicePhotos[s.slug] ?? photos.studioDesk;
            return (
              <li key={s.slug} className={cn("reveal", i % 2 === 1 && "md:mt-24")}>
                <Link href={`/services/${s.slug}`} className="group relative block overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[4/5] sm:aspect-[5/4]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 768px) 46vw, 100vw"
                      className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06] motion-reduce:transition-none"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(17_17_17/0.92))]" aria-hidden />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <span className="font-display text-sm tabular-nums text-accent">{s.number}</span>
                    <h3 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,2.8rem)] font-semibold leading-none tracking-[-0.03em]">{s.title}</h3>
                    <p className="mt-3 max-w-md text-white/75">{s.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.capabilities.slice(0, 4).map((c) => (
                        <li key={c} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/85 backdrop-blur-sm">
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

export function NextWork({ projects }: { projects: Project[] }) {
  const featured = projects.slice(0, 6);
  if (!featured.length) return null;
  const allSamples = featured.every((p) => p.isSample);
  return (
    <section aria-labelledby="work-title" className="overflow-hidden bg-paper-2">
      <div className="shell pt-24 md:pt-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="work-title" className="type-display">
            Selected work
          </h2>
          <div className="max-w-sm md:text-right">
            {allSamples ? <p className="text-sm leading-relaxed text-mute-2">Sample concepts showing the kind of work we take on. Client case studies appear here as they are published.</p> : null}
            <Link href="/work" className="mt-3 inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
              See all work
            </Link>
          </div>
        </div>
      </div>
      {/* Swipe through on phones, scroll sideways on desktop */}
      <ul className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100vw-96rem)/2+3.5rem))] pb-24 [scrollbar-width:none] md:mt-16 md:pb-36">
        {featured.map((p, i) => (
          <li key={p.slug} className="w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-[38vw]">
            <Link href={`/work/${p.slug}`} className="group block">
              <div className={cn("relative overflow-hidden rounded-[1.75rem] bg-ink", i % 2 ? "aspect-[4/5]" : "aspect-[4/4.6]")}>
                <Image src={p.cover.src} alt={p.cover.alt} fill sizes="(min-width: 1024px) 38vw, 82vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]" />
                {p.isSample ? (
                  <span className="absolute left-4 top-4 rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink">Sample concept</span>
                ) : null}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="type-h3">{p.title}</h3>
                  <p className="type-meta mt-1.5 text-mute-2">
                    {p.client ?? p.industry} / {p.services.slice(0, 2).join(", ")}
                  </p>
                </div>
                <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-ink/15 transition-colors group-hover:bg-accent group-hover:ring-accent" aria-hidden>
                  →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NextDifference({ difference }: { difference: DifferenceContent }) {
  return (
    <section aria-labelledby="diff-title" className="bg-paper">
      <div className="shell grid gap-12 py-24 md:py-36 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="sticky top-28">
            <h2 id="diff-title" className="type-display">
              {difference.title}
            </h2>
            <p className="type-lead mt-6 text-mute-2">{difference.lead}</p>
            <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[1.75rem]">
              <Image src={photos.crewNairobi.src} alt={photos.crewNairobi.alt} fill sizes="(min-width: 1024px) 36vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
        <ol className="space-y-4 lg:col-span-6 lg:col-start-7">
          {difference.points.map((p, i) => (
            <li key={p.title} className="reveal rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8 md:p-9">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#111]">{i + 1}</span>
              <h3 className="mt-5 type-h3">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-mute-2">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function NextProcess() {
  return (
    <section aria-labelledby="process-title" className="bg-paper-2">
      <div className="shell py-24 md:py-36">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="process-title" className="type-display md:col-span-7">
            How we work
          </h2>
          <p className="leading-relaxed text-mute-2 md:col-span-4 md:col-start-9">
            Every project moves through the same four stages. You sign off at each one before we move on.
          </p>
        </div>
        <div className="mt-16 md:mt-24">
          <ProcessSteps />
        </div>
      </div>
    </section>
  );
}

export function NextTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  const [first, ...rest] = testimonials;
  return (
    <section aria-labelledby="voices-title" className="bg-ink text-white">
      <div className="shell py-24 md:py-36">
        <h2 id="voices-title" className="type-meta font-medium text-white/50">
          What clients say
        </h2>
        <figure className="mt-8">
          <blockquote className="type-statement max-w-[28ch]">
            <span className="text-accent">“</span>
            {first.quote}
            <span className="text-accent">”</span>
          </blockquote>
          <figcaption className="mt-8 text-white/60">
            {first.name}
            {first.role || first.company ? `, ${[first.role, first.company].filter(Boolean).join(", ")}` : ""}
          </figcaption>
        </figure>
        {rest.length ? (
          <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

export function NextCta({ email }: { email: string }) {
  return (
    <section aria-labelledby="cta-title" className="bg-paper">
      <div className="shell py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-accent px-6 py-16 text-[#111] sm:px-12 md:px-16 md:py-24">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-[#fff]/20 blur-3xl" />
          <h2 id="cta-title" className="type-display relative max-w-[13ch]">
            Let’s build something worth noticing.
          </h2>
          <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
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
        <p className="mt-6 text-center text-xs text-mute-2">
          Photography on this page:{" "}
          {Object.values(photos)
            .map((p) => p.credit)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", ")}{" "}
          on{" "}
          <a href="https://unsplash.com/?utm_source=brandhouse&utm_medium=referral" className="underline underline-offset-2" rel="noopener" target="_blank">
            Unsplash
          </a>
          .
        </p>
      </div>
    </section>
  );
}
