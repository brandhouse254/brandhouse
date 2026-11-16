import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/cms/store";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Corners } from "@/components/Corners";

export const metadata: Metadata = pageMetadata({
  title: "About Us: Strategy, Storytelling, Design & Digital",
  description:
    "Brand House is a creative, media and digital agency bringing brand strategy, film production, web development and marketing together under one roof.",
  path: "/about",
});

/* All text and the image on this page are edited in the admin under About. */

export default async function AboutPage() {
  const { about, services } = await getContent();
  return (
    <>
      <PageHero
        title={about.title}
        crumbs={[{ name: "About", path: "/about" }]}
        intro={about.intro ? <p>{about.intro}</p> : undefined}
      />

      {/* Purpose */}
      <section aria-labelledby="purpose-title" className="bg-paper">
        <div className="shell grid gap-12 pb-24 md:grid-cols-12 md:pb-36">
          <div className="relative aspect-[4/5] md:col-span-5">
            <Image
              src={about.image.src}
              alt={about.image.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-3">
              <Corners />
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:self-end">
            <h2 id="purpose-title" className="type-h2">
              {about.purposeTitle}
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/80">
              {about.purposeParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section aria-labelledby="approach-title" className="bg-ink text-white">
        <div className="shell py-24 md:py-36">
          <h2 id="approach-title" className="type-display max-w-[16ch]">
            {about.approachTitle}
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-12">
            <p className="type-lead text-white/75 md:col-span-6">{about.approachLeft}</p>
            <p className="type-lead text-white/75 md:col-span-5 md:col-start-8">{about.approachRight}</p>
          </div>
        </div>
      </section>

      {/* How the divisions connect */}
      <section aria-labelledby="divisions-title" className="bg-paper">
        <div className="shell py-24 md:py-36">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <h2 id="divisions-title" className="type-h2 md:col-span-6">
              {about.divisionsTitle}
            </h2>
            <p className="leading-relaxed text-mute-2 md:col-span-5 md:col-start-8">{about.divisionsIntro}</p>
          </div>
          <ol className="mt-16 grid gap-px bg-ink/15 md:grid-cols-4">
            {services.map((s) => (
              <li key={s.slug} className="bg-paper py-8 md:px-6 md:first:pl-0">
                <span className="font-display text-sm tabular-nums text-mute-2">{s.number}</span>
                <h3 className="type-h3 mt-3">
                  <Link href={`/services/${s.slug}`} className="hover:underline hover:underline-offset-4">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-3 leading-relaxed text-mute-2">{s.aboutNote || s.summary}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="bg-paper-2">
        <div className="shell py-24 md:py-36">
          <h2 id="values-title" className="type-h2">
            {about.valuesTitle}
          </h2>
          <ul className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-2">
            {about.values.map((v, i) => (
              <li key={`${i}-${v.title}`} className="reveal border-t border-ink/15 pt-6">
                <h3 className="type-h3">{v.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-mute-2">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title={about.ctaTitle} body={about.ctaBody} />
    </>
  );
}
