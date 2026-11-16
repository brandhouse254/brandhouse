import Link from "next/link";
import type { Project } from "@/lib/cms/types";
import { ProjectCard } from "../ProjectCard";

const layout = [
  { col: "md:col-span-7", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 58vw, 100vw" },
  { col: "md:col-span-5 md:mt-40", aspect: "aspect-[4/3]", sizes: "(min-width: 768px) 42vw, 100vw" },
  { col: "md:col-span-5", aspect: "aspect-square", sizes: "(min-width: 768px) 42vw, 100vw" },
  { col: "md:col-span-6 md:col-start-7 md:-mt-24", aspect: "aspect-[16/10]", sizes: "(min-width: 768px) 50vw, 100vw" },
];

export function SelectedWork({ projects }: { projects: Project[] }) {
  const featured = projects.slice(0, 4);
  if (featured.length === 0) return null;
  const allSamples = featured.every((p) => p.isSample);

  return (
    <section aria-labelledby="work-title" className="bg-paper-2">
      <div className="shell py-24 md:py-36">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="work-title" className="type-display md:col-span-7">
            Selected work
          </h2>
          <div className="md:col-span-5 md:text-right">
            {allSamples ? (
              <p className="leading-relaxed text-mute-2 md:ml-auto md:max-w-sm">
                These are sample concepts for fictional brands, showing the kind of projects we take on. Client case
                studies will appear here as they are published.
              </p>
            ) : null}
            <Link
              href="/work"
              className="mt-4 inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
            >
              See all work
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-16 md:mt-24 md:grid-cols-12 md:gap-y-24">
          {featured.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              aspect={layout[i % layout.length].aspect}
              sizes={layout[i % layout.length].sizes}
              className={`reveal ${layout[i % layout.length].col}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
