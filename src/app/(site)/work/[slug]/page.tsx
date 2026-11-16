import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { findProject, relatedProjects, videoEmbedUrl, visibleProjects } from "@/lib/cms/public";
import { workCategoryLabels } from "@/lib/cms/types";
import { pageMetadata } from "@/lib/seo";
import { graph, projectSchema } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Corners } from "@/components/Corners";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { ProjectCard } from "@/components/ProjectCard";

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

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <dt className="type-meta text-white/55">{label}</dt>
      <dd className="mt-1.5 leading-snug">{children}</dd>
    </div>
  );
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const content = await getContent();
  const project = findProject(content, slug);
  if (!project) notFound();

  const related = relatedProjects(content, project, 2);
  const embed = project.video ? videoEmbedUrl(project.video.src) : null;
  const schema = projectSchema(project);

  return (
    <>
      {schema ? <JsonLd data={graph(schema)} /> : null}

      <article>
        {/* Hero */}
        <header className="relative isolate overflow-hidden bg-ink text-white">
          <div aria-hidden className="absolute inset-0 -z-10">
            <Image src={project.cover.src} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
          </div>
          <div className="pointer-events-none absolute inset-x-[clamp(0.75rem,2.5vw,2rem)] bottom-[clamp(0.75rem,2.5vw,2rem)] top-[5.25rem] md:top-24">
            <Corners size="lg" />
          </div>
          <div className="shell flex min-h-[80svh] flex-col justify-end pb-[clamp(3rem,8vh,5rem)] pt-36">
            <Breadcrumbs
              items={[
                { name: "Work", path: "/work" },
                { name: project.title, path: `/work/${project.slug}` },
              ]}
              className="mb-10 text-white/75"
            />
            <h1 className="type-display max-w-[18ch]">{project.title}</h1>
            <dl className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              <MetaItem label="Client">
                {project.isSample ? "Fictional brand (sample concept)" : (project.client ?? "Confidential")}
              </MetaItem>
              <MetaItem label="Industry">{project.industry}</MetaItem>
              <MetaItem label="Discipline">{project.categories.map((c) => workCategoryLabels[c]).join(", ")}</MetaItem>
              <MetaItem label="Services">{project.services.join(", ")}</MetaItem>
            </dl>
          </div>
        </header>

        {project.isSample ? (
          <aside aria-label="About this project" className="bg-accent text-ink">
            <p className="shell py-4 font-display font-medium">
              This is an illustrative sample concept, not completed client work. The brand is fictional and the visuals
              are concept mock-ups.
            </p>
          </aside>
        ) : null}

        {/* Overview + brief */}
        <section aria-labelledby="overview-title" className="bg-paper">
          <div className="shell grid gap-14 py-24 md:grid-cols-12 md:py-32">
            <div className="md:col-span-4">
              <h2 id="overview-title" className="type-h3">
                Overview
              </h2>
            </div>
            <div className="md:col-span-8">
              <p className="type-statement">{project.summary}</p>
            </div>

            <div className="md:col-span-4">
              <h2 className="type-h3">Brief and objectives</h2>
            </div>
            <div className="md:col-span-8">
              <p className="type-lead text-ink/80">{project.brief}</p>
              <ul className="mt-8 grid gap-0">
                {project.objectives.map((o) => (
                  <li key={o} className="flex gap-4 border-b border-ink/12 py-4 leading-snug">
                    <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 bg-accent" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <h2 className="type-h3">Creative direction</h2>
            </div>
            <div className="md:col-span-8">
              <p className="type-lead text-ink/80">{project.creativeDirection}</p>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section aria-label="Project visuals" className="bg-ink">
          <div className="shell grid gap-4 py-4 md:grid-cols-12 md:gap-4 md:py-4">
            {project.video && embed ? (
              <div className="relative aspect-video md:col-span-12">
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
              <div className="relative aspect-video md:col-span-12">
                <video
                  className="size-full object-cover"
                  controls
                  preload="none"
                  poster={project.video.poster || undefined}
                  title={project.video.title}
                  playsInline
                >
                  <source src={project.video.src} type={project.video.src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4"} />
                </video>
              </div>
            ) : null}
            {project.gallery.map((g, i) => (
              <figure
                key={`${i}-${g.src}`}
                className={
                  i === 0
                    ? "reveal-media relative aspect-[4/3] md:col-span-7 md:aspect-auto md:min-h-[36rem]"
                    : "reveal-media relative aspect-[4/3] md:col-span-5 md:aspect-auto"
                }
              >
                <Image src={g.src} alt={g.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </figure>
            ))}
          </div>
        </section>

        {/* Outcome — only verified results */}
        {project.outcome ? (
          <section aria-labelledby="outcome-title" className="bg-paper">
            <div className="shell grid gap-10 py-24 md:grid-cols-12 md:py-32">
              <h2 id="outcome-title" className="type-h3 md:col-span-4">
                Outcome
              </h2>
              <p className="type-statement md:col-span-8">{project.outcome}</p>
            </div>
          </section>
        ) : null}
      </article>

      {related.length ? (
        <section aria-labelledby="more-work-title" className="bg-paper-2">
          <div className="shell py-24 md:py-32">
            <h2 id="more-work-title" className="type-h2">
              More work
            </h2>
            <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-8">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
