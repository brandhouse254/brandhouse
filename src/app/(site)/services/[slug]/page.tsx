import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { findService, projectsByCategory } from "@/lib/cms/public";
import { pageMetadata } from "@/lib/seo";
import { graph, serviceSchema } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Corners } from "@/components/Corners";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProjectCard } from "@/components/ProjectCard";

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

  const work = projectsByCategory(content, service.workCategory).slice(0, 2);
  const related = content.services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <JsonLd data={graph(serviceSchema(service))} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src={service.image.src} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/40" />
        </div>
        <div className="pointer-events-none absolute inset-x-[clamp(0.75rem,2.5vw,2rem)] bottom-[clamp(0.75rem,2.5vw,2rem)] top-[5.25rem] md:top-24">
          <Corners size="lg" />
        </div>
        <div className="shell flex min-h-[88svh] flex-col justify-end pb-[clamp(3rem,8vh,6rem)] pt-36">
          <Breadcrumbs
            items={[
              { name: "Services", path: "/services" },
              { name: service.title, path: `/services/${service.slug}` },
            ]}
            className="mb-10 text-white/75"
          />
          <p className="font-display text-lg text-white/75">
            <span className="tabular-nums">{service.number}</span> {service.title}
          </p>
          <h1 className="type-display mt-4 max-w-[17ch]">{service.headline}</h1>
          <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
            <p className="type-lead text-white/80 md:col-span-7 lg:col-span-6">{service.intro}</p>
            <div className="md:col-span-5 md:col-start-8 md:text-right lg:col-span-6 lg:col-start-7">
              <Link
                href={`/contact?service=${service.slug}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-display font-medium text-ink transition-colors hover:bg-white"
              >
                Start a {service.title.toLowerCase()} project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value */}
      <section aria-labelledby="value-title" className="bg-paper">
        <div className="shell py-24 md:py-32">
          <h2 id="value-title" className="type-h2 max-w-[18ch]">
            Why it matters for your business
          </h2>
          <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {service.value.map((v) => (
              <li key={v.title} className="reveal border-t border-ink/15 pt-6">
                <h3 className="type-h3">{v.title}</h3>
                <p className="mt-3 max-w-sm leading-relaxed text-mute-2">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Capabilities and deliverables */}
      <section aria-labelledby="capabilities-title" className="bg-paper-2">
        <div className="shell grid gap-14 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-5">
            <h2 id="capabilities-title" className="type-h2">
              What we do
            </h2>
            <ul className="mt-10">
              {service.capabilities.map((c) => (
                <li key={c} className="border-b border-ink/12 py-4 font-display text-xl tracking-[-0.02em] md:text-2xl">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <h2 className="type-h3">What you receive</h2>
            <ul className="mt-6 space-y-3 text-ink/80">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3 leading-snug">
                  <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 bg-accent" />
                  {d}
                </li>
              ))}
            </ul>
            <h2 className="type-h3 mt-14">Typical projects</h2>
            <ul className="mt-6 space-y-3 text-ink/80">
              {service.projectTypes.map((d) => (
                <li key={d} className="flex gap-3 leading-snug">
                  <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 bg-ink/40" />
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
          <div className="shell py-24 md:py-32">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 id="related-work-title" className="type-h2">
                Related work
              </h2>
              <Link
                href={`/work?category=${service.workCategory}`}
                className="inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
              >
                See all {service.title.toLowerCase()} work
              </Link>
            </div>
            <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-8">
              {work.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Process */}
      <section aria-labelledby="service-process-title" className="bg-ink text-white">
        <div className="shell py-24 md:py-32">
          <h2 id="service-process-title" className="type-h2 max-w-[20ch]">
            How a {service.title.toLowerCase()} project runs
          </h2>
          <div className="mt-14 md:mt-20">
            <ProcessSteps notes={service.processNotes} tone="dark" />
          </div>
        </div>
      </section>

      {/* Related services */}
      <section aria-labelledby="related-services-title" className="bg-paper">
        <div className="shell py-24 md:py-32">
          <h2 id="related-services-title" className="type-h2 max-w-[22ch]">
            Works well with
          </h2>
          <ul className="mt-12 grid gap-px border-y border-ink/15 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug} className="group relative py-8 md:px-6 md:first:pl-0 md:[&+&]:border-l md:[&+&]:border-ink/15">
                <span className="font-display text-sm tabular-nums text-mute-2">{r.number}</span>
                <h3 className="type-h3 mt-2">
                  <Link href={`/services/${r.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                    {r.title}
                  </Link>
                </h3>
                <p className="mt-3 max-w-sm leading-relaxed text-mute-2">{r.summary}</p>
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
