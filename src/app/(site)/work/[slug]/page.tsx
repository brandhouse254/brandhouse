import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { findProject, relatedProjects, videoEmbedUrl, visibleProjects } from "@/lib/cms/public";
import { pageMetadata } from "@/lib/seo";
import { graph, projectSchema } from "@/lib/structured-data";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { DarkHero, Kicker, SECTION } from "@/components/site/bits";
import { kickerFor, ShowcaseCard } from "@/components/site/showcase";
import { Pic } from "@/components/site/photo";

type Params = { slug: string };

// Projects added in the admin after a deploy render on first visit; unknown slugs 404.
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  return visibleProjects(await getContent()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(await getContent(), slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/work/${project.slug}`,
  });
}

const isExternal = (href: string) => /^https?:/i.test(href);

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const content = await getContent();
  const project = findProject(content, slug);
  if (!project) notFound();

  const related = relatedProjects(content, project, 3);
  const embed = project.video ? videoEmbedUrl(project.video.src) : null;
  const schema = projectSchema(project);
  const facts = [
    project.client ? { label: "Client", value: project.client } : null,
    project.industry ? { label: "Industry", value: project.industry } : null,
    project.year ? { label: "Year", value: project.year } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      {schema ? <JsonLd data={graph(schema)} /> : null}

      <article>
        <DarkHero
          crumbs={[
            { name: "Work", path: "/work" },
            { name: project.title, path: `/work/${project.slug}` },
          ]}
          title={project.title}
          intro={<p>{project.summary}</p>}
          aside={
            <div className="h-[26rem] sm:h-[32rem] lg:h-[36rem]">
              <ShowcaseCard project={project} asLink={false} priority sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          }
        >
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-[#111]">{kickerFor(project)}</span>
            {facts.map((f) => (
              <span key={f.label} className="rounded-full bg-white/[0.07] px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10">
                <span className="text-white/50">{f.label}:</span> {f.value}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.link ? (
              <a
                href={project.link.href}
                {...(isExternal(project.link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-display font-medium text-[#111] transition-colors hover:bg-white"
              >
                {project.link.label} <span aria-hidden>↗</span>
                {isExternal(project.link.href) ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            ) : null}
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full px-6 font-display font-medium text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white hover:text-ink"
            >
              Start a project like this
            </Link>
          </div>
        </DarkHero>

        {/* The story */}
        <section aria-label="About the project" className="bg-paper">
          <div className={`shell ${SECTION}`}>
            {project.services.length ? (
              <div className="mb-10 flex flex-wrap items-center gap-2">
                <Kicker className="mr-3">What we did</Kicker>
                {project.services.map((s) => (
                  <span key={s} className="rounded-full bg-white px-3.5 py-1.5 text-sm ring-1 ring-ink/10">
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              {project.brief ? (
                <div className="rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8 md:p-8">
                  <h2 className="type-h3">The brief</h2>
                  <p className="mt-4 leading-relaxed text-mute-2">{project.brief}</p>
                </div>
              ) : null}
              {project.objectives.length ? (
                <div className="rounded-[1.75rem] bg-ink p-7 text-white md:p-8">
                  <h2 className="type-h3">What it had to do</h2>
                  <ol className="mt-4 space-y-3">
                    {project.objectives.map((o, i) => (
                      <li key={o} className="flex gap-3 leading-snug text-white/80">
                        <span className="font-display text-sm tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                        {o}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              {project.creativeDirection ? (
                <div className="rounded-[1.75rem] bg-white p-7 ring-1 ring-ink/8 md:p-8">
                  <h2 className="type-h3">Creative direction</h2>
                  <p className="mt-4 leading-relaxed text-mute-2">{project.creativeDirection}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Film and gallery */}
        {project.video || project.gallery.length ? (
          <section aria-label="Project visuals" className="bg-ink">
            <div className={`shell grid gap-4 md:grid-cols-12 ${SECTION}`}>
              {project.video && embed ? (
                <div className="relative aspect-video overflow-hidden rounded-[1.75rem] md:col-span-12">
                  <iframe
                    src={embed}
                    title={project.video.title || project.title}
                    className="absolute inset-0 size-full"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : project.video ? (
                <div className="relative aspect-video overflow-hidden rounded-[1.75rem] md:col-span-12">
                  <video className="size-full object-cover" controls preload="none" poster={project.video.poster || undefined} title={project.video.title} playsInline>
                    <source src={project.video.src} type={project.video.src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4"} />
                  </video>
                </div>
              ) : null}
              {project.gallery.map((g, i) => (
                <figure
                  key={`${i}-${g.src}`}
                  className={
                    i % 3 === 0
                      ? "relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#1b1b1b] md:col-span-7 md:aspect-auto md:min-h-[34rem]"
                      : "relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#1b1b1b] md:col-span-5 md:aspect-auto md:min-h-[34rem]"
                  }
                >
                  <Pic src={g.src} alt={g.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* Outcome: only verified results */}
        {project.outcome ? (
          <section aria-labelledby="outcome-title" className="bg-paper">
            <div className={`shell grid gap-6 md:grid-cols-12 ${SECTION}`}>
              <div className="md:col-span-4">
                <Kicker>
                  <span id="outcome-title">Outcome</span>
                </Kicker>
              </div>
              <p className="type-statement md:col-span-8">{project.outcome}</p>
            </div>
          </section>
        ) : null}
      </article>

      {related.length ? (
        <section aria-labelledby="more-work-title" className="bg-paper-2">
          <div className={`shell ${SECTION}`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="more-work-title" className="type-display">
                More work
              </h2>
              <Link href="/work" className="inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
                See all work
              </Link>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug} className="h-[28rem] md:h-[30rem]">
                  <ShowcaseCard project={p} sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
