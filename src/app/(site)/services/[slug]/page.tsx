import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { findService, projectsByCategory } from "@/lib/cms/public";
import { pageMetadata } from "@/lib/seo";
import { graph, serviceSchema } from "@/lib/structured-data";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { ProcessSteps } from "@/components/ProcessSteps";
import { DarkHero, Kicker, SECTION } from "@/components/site/bits";
import { ShowcaseCard } from "@/components/site/showcase";
import { Pic } from "@/components/site/photo";

type Params = { slug: string };

// Services added in the admin after a deploy render on first visit, then stay cached.
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const { services } = await getContent();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const service = findService(await getContent(), slug);
  if (!service) return {};
  return pageMetadata({ ...service.meta, path: `/services/${service.slug}` });
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const content = await getContent();
  const service = findService(content, slug);
  if (!service) notFound();

  const work = projectsByCategory(content, service.workCategory).slice(0, 3);
  const related = content.services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <JsonLd data={graph(serviceSchema(service))} />

      <DarkHero
        crumbs={[
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
        eyebrow={`${service.number} ${service.title}`}
        title={service.headline}
        intro={<p>{service.intro}</p>}
        aside={
          service.image.src ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#1b1b1b] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Pic src={service.image.src} alt={service.image.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          ) : undefined
        }
      >
        <div className="mt-8">
          <Link
            href={`/contact?service=${service.slug}`}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-display font-medium text-[#111] transition-colors hover:bg-white"
          >
            Start a {service.title.toLowerCase()} project <span aria-hidden>↗</span>
          </Link>
        </div>
      </DarkHero>

      {/* Why it matters */}
      {service.value.length ? (
        <section aria-labelledby="value-title" className="bg-paper">
          <div className={`shell ${SECTION}`}>
            <h2 id="value-title" className="type-display max-w-[16ch]">
              Why it matters for your business
            </h2>
            <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
              {service.value.map((v, i) => (
                <li key={v.title} className="rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8 md:p-8">
                  <span className="font-display text-sm tabular-nums text-mute-2">
                    <span className="text-accent-deep">{String(i + 1).padStart(2, "0")}</span> / {String(service.value.length).padStart(2, "0")}
                  </span>
                  <h3 className="type-h3 mt-4">{v.title}</h3>
                  <p className="mt-3 leading-relaxed text-mute-2">{v.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* What we do and what you receive */}
      <section aria-labelledby="capabilities-title" className="bg-paper-2">
        <div className={`shell grid gap-4 lg:grid-cols-2 ${SECTION}`}>
          <div className="rounded-[2rem] bg-ink p-7 text-white md:p-10">
            <h2 id="capabilities-title" className="type-h2">
              What we do
            </h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {service.capabilities.map((c) => (
                <li key={c} className="rounded-full bg-white/[0.07] px-4 py-2 font-display text-lg tracking-[-0.01em] ring-1 ring-white/10">
                  {c}
                </li>
              ))}
            </ul>
            {service.projectTypes.length ? (
              <>
                <h3 className="mt-10 font-display text-lg font-semibold text-white/80">Typical projects</h3>
                <ul className="mt-4 space-y-2.5 text-white/70">
                  {service.projectTypes.map((d) => (
                    <li key={d} className="flex gap-3 leading-snug">
                      <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <div className="rounded-[2rem] bg-white p-7 ring-1 ring-ink/8 md:p-10">
            <h2 className="type-h2">What you receive</h2>
            <ul className="mt-8 divide-y divide-ink/10">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3 py-3.5 leading-snug">
                  <span aria-hidden className="mt-[0.15em] flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[0.7rem] font-bold text-[#111]">
                    ✓
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Related work */}
      {work.length ? (
        <section aria-labelledby="related-work-title" className="bg-paper">
          <div className={`shell ${SECTION}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 id="related-work-title" className="type-display">
                Related work
              </h2>
              <Link
                href={`/work?category=${service.workCategory}`}
                className="inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
              >
                See all {service.title.toLowerCase()} work
              </Link>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {work.map((p) => (
                <li key={p.slug} className="h-[28rem] md:h-[30rem]">
                  <ShowcaseCard project={p} sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Process */}
      <section aria-labelledby="service-process-title" className="bg-ink text-white">
        <div className={`shell ${SECTION}`}>
          <h2 id="service-process-title" className="type-display max-w-[18ch]">
            How a {service.title.toLowerCase()} project runs
          </h2>
          <div className="mt-10 md:mt-14">
            <ProcessSteps notes={service.processNotes} tone="dark" />
          </div>
        </div>
      </section>

      {/* Related services */}
      <section aria-labelledby="related-services-title" className="bg-paper">
        <div className={`shell ${SECTION}`}>
          <Kicker>
            <span id="related-services-title">Works well with</span>
          </Kicker>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/services/${r.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-[#1b1b1b] text-white">
                  {r.image.src ? (
                    <Pic
                      src={r.image.src}
                      alt={r.image.alt}
                      fill
                      sizes="(min-width: 768px) 32vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(17_17_17/0.9))]" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="font-display text-sm tabular-nums text-accent">{r.number}</span>
                    <h3 className="mt-1 font-display text-2xl font-semibold tracking-[-0.025em]">{r.title}</h3>
                  </div>
                  <span aria-hidden className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:rotate-45">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title={`Ready to talk about your ${service.title.toLowerCase()} project?`}
        body="Share what you have in mind and we will follow up to talk through the details, options and next steps."
        href={`/contact?service=${service.slug}`}
      />
    </>
  );
}
