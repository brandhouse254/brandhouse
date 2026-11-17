import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/cms/store";
import { pageMetadata } from "@/lib/seo";
import { DarkHero, Kicker, SECTION } from "@/components/site/bits";
import { ServiceCards } from "@/components/site/home";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Services: Branding, Video, Web & Marketing",
  description:
    "Brand identity, film and media production, web design and development, and digital marketing from one Kenyan agency. See what each Brand House division delivers.",
  path: "/services",
});

export default async function ServicesPage() {
  const { services, pages } = await getContent();
  return (
    <>
      <DarkHero
        title={pages.services.title}
        crumbs={[{ name: "Services", path: "/services" }]}
        intro={pages.services.intro ? <p>{pages.services.intro}</p> : undefined}
      />

      <section aria-label="Service divisions" className="bg-ink pb-16 text-white md:pb-24">
        <div className="shell">
          <ServiceCards services={services} headingLevel="h2" />
        </div>
      </section>

      <section aria-labelledby="included-title" className="bg-paper">
        <div className={`shell ${SECTION}`}>
          <Kicker>
            <span id="included-title">What you get from each division</span>
          </Kicker>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <li key={s.slug} className="flex flex-col rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8">
                <span className="font-display text-sm tabular-nums text-accent-deep">{s.number}</span>
                <h3 className="type-h3 mt-3">{s.title}</h3>
                <ul className="mt-5 flex-1 space-y-2.5 text-[0.95rem] text-mute-2">
                  {s.deliverables.slice(0, 6).map((d) => (
                    <li key={d} className="flex gap-2.5 leading-snug">
                      <span aria-hidden className="mt-[0.55em] h-px w-3 shrink-0 bg-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${s.slug}`}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
                >
                  More about {s.title.toLowerCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Not sure which service you need?"
        body="Tell us what you are trying to achieve. We will recommend the mix of services that fits the goal and the budget."
      />
    </>
  );
}
