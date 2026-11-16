import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Services: Branding, Video, Web & Marketing",
  description:
    "Brand identity, film and media production, web design and development, and digital marketing from one Kenyan agency. See what each Brand House division delivers.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="Everything a brand needs to be seen and chosen."
        crumbs={[{ name: "Services", path: "/services" }]}
        intro={
          <p>
            We are organised into four divisions. You can hire one for a single project, or bring in several so your
            identity, content, website and campaigns are planned together from the start.
          </p>
        }
      />

      <section aria-label="Service divisions" className="bg-paper pb-24 md:pb-36">
        <ol className="shell">
          {services.map((s) => (
            <li key={s.slug} className="reveal border-t border-ink/15 py-14 md:py-20">
              <article aria-labelledby={`division-${s.slug}`} className="grid gap-10 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-4">
                  <span className="font-display text-sm tabular-nums text-mute-2">{s.number}</span>
                  <h2 id={`division-${s.slug}`} className="type-h2 mt-3">
                    <Link href={`/services/${s.slug}`} className="hover:underline hover:decoration-2 hover:underline-offset-8">
                      {s.title}
                    </Link>
                  </h2>
                  <div className="relative mt-8 aspect-[4/3] max-w-sm overflow-hidden">
                    <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                  </div>
                </div>
                <div className="md:col-span-7 md:col-start-6">
                  <p className="type-lead text-ink/80">{s.intro}</p>
                  <div className="mt-10 grid gap-10 sm:grid-cols-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold">What you get</h3>
                      <ul className="mt-4 space-y-2 text-mute-2">
                        {s.deliverables.map((d) => (
                          <li key={d} className="leading-snug">{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">Typical projects</h3>
                      <ul className="mt-4 space-y-2 text-mute-2">
                        {s.projectTypes.map((d) => (
                          <li key={d} className="leading-snug">{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Link
                    href={`/services/${s.slug}`}
                    className="mt-10 inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
                  >
                    More about {s.title.toLowerCase()}
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <CtaBand
        title="Not sure which service you need?"
        body="Tell us what you are trying to achieve. We will recommend the mix of services that fits the goal and the budget."
      />
    </>
  );
}
