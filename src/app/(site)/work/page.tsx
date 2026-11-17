import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { visibleProjects } from "@/lib/cms/public";
import { pageMetadata } from "@/lib/seo";
import { DarkHero, SECTION } from "@/components/site/bits";
import { WorkGrid } from "@/components/WorkGrid";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Work: Branding, Film, Web & Campaign Projects",
  description:
    "Explore Brand House projects across brand identity, film and production, websites and marketing campaigns. Filter by discipline.",
  path: "/work",
});

export default async function WorkPage() {
  const content = await getContent();
  const projects = visibleProjects(content);
  return (
    <>
      <DarkHero
        title={content.pages.work.title}
        crumbs={[{ name: "Work", path: "/work" }]}
        intro={content.pages.work.intro ? <p>{content.pages.work.intro}</p> : undefined}
      />
      <section aria-label="Projects" className="bg-paper-2">
        <div className={`shell ${SECTION}`}>
          <WorkGrid projects={projects} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
