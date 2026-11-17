import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/cms/store";
import { pageMetadata } from "@/lib/seo";
import { DarkHero, Kicker, SECTION } from "@/components/site/bits";
import { Pic } from "@/components/site/photo";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "About Us: Strategy, Storytelling, Design & Digital",
  description:
    "Brand House is a creative, media and digital agency bringing brand strategy, film production, web development and marketing together under one roof.",
  path: "/about",
});

/* All text and pictures on this page are edited in the admin under About page. */

export default async function AboutPage() {
  const { about, services } = await getContent();
  return (
    <>
      <DarkHero
        title={about.title}
        crumbs={[{ name: "About", path: "/about" }]}
        intro={about.intro ? <p>{about.intro}</p> : undefined}
        aside={
          about.image.src ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#1b1b1b] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Pic src={about.image.src} alt={about.image.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          ) : undefined
        }
      />

      {/* Purpose */}
      <section aria-labelledby="purpose-title" className="bg-paper">
        <div className={`shell grid gap-8 md:grid-cols-12 ${SECTION}`}>
          <div className="md:col-span-4">
            <Kicker>
              <span id="purpose-title">{about.purposeTitle}</span>
            </Kicker>
          </div>
          <div className="space-y-5 md:col-span-8">
            {about.purposeParagraphs.map((para, i) => (
              <p key={i} className={i === 0 ? "type-statement" : "type-lead text-mute-2"}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section aria-labelledby="approach-title" className="bg-ink text-white">
        <div className={`shell ${SECTION}`}>
          <h2 id="approach-title" className="type-display max-w-[16ch]">
            {about.approachTitle}
          </h2>
          <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2">
            {[about.approachLeft, about.approachRight].filter(Boolean).map((t, i) => (
              <p key={i} className="type-lead rounded-[1.75rem] bg-white/[0.04] p-7 text-white/75 ring-1 ring-white/10 md:p-8">
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* How the divisions connect */}
      <section aria-labelledby="divisions-title" className="bg-paper-2">
        <div className={`shell ${SECTION}`}>
          <div className="grid gap-5 md:grid-cols-12 md:items-end">
            <h2 id="divisions-title" className="type-display md:col-span-7">
              {about.divisionsTitle}
            </h2>
            {about.divisionsIntro ? <p className="leading-relaxed text-mute-2 md:col-span-4 md:col-start-9">{about.divisionsIntro}</p> : null}
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#1b1b1b] text-white">
                  {s.image.src ? (
                    <Pic
                      src={s.image.src}
                      alt={s.image.alt}
                      fill
                      sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgb(17_17_17/0.92))]" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="font-display text-sm tabular-nums text-accent">{s.number}</span>
                    <h3 className="mt-1 font-display text-2xl font-semibold tracking-[-0.025em]">{s.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-white/75">{s.aboutNote || s.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      {about.values.length ? (
        <section aria-labelledby="values-title" className="bg-paper">
          <div className={`shell ${SECTION}`}>
            <h2 id="values-title" className="type-display">
              {about.valuesTitle}
            </h2>
            <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2">
              {about.values.map((v, i) => (
                <li key={`${i}-${v.title}`} className="rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8 md:p-8">
                  <span className="font-display text-sm tabular-nums text-mute-2">
                    <span className="text-accent-deep">{String(i + 1).padStart(2, "0")}</span> / {String(about.values.length).padStart(2, "0")}
                  </span>
                  <h3 className="type-h3 mt-4">{v.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-mute-2">{v.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand title={about.ctaTitle} body={about.ctaBody} />
    </>
  );
}
