import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { visibleProjects } from "@/lib/cms/public";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { WorkGrid } from "@/components/WorkGrid";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Work: Branding, Film, Web & Campaign Projects",
  description:
    "Explore Brand House projects across brand identity, film and production, websites and marketing campaigns. Filter by discipline.",
  path: "/work",
});

export default async function WorkPage() {
  const projects = visibleProjects(await getContent());
  const hasSamples = projects.some((p) => p.isSample);
  return (
    <>
      <PageHero
        title="Work"
        crumbs={[{ name: "Work", path: "/work" }]}
        intro={
          hasSamples ? (
            <p>
              The projects below are <strong className="font-semibold text-ink">sample concepts</strong> for fictional
              brands. They show the range of work we take on across identity, film, web and campaigns. Client case
              studies will be added here as they are published.
            </p>
          ) : (
            <p>Identity, film, web and campaign projects for businesses across Kenya and beyond.</p>
          )
        }
      />
      <section aria-label="Projects" className="bg-paper">
        <div className="shell pb-24 md:pb-36">
          <WorkGrid projects={projects} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
