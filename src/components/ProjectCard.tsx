import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/cn";

type Props = {
  project: Project;
  /** Aspect ratio class for the media frame, e.g. "aspect-[4/5]". */
  aspect?: string;
  sizes?: string;
  tone?: "light" | "dark";
  headingLevel?: "h2" | "h3";
  className?: string;
};

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "type-meta inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 font-medium text-ink",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      Sample concept
    </span>
  );
}

export function ProjectCard({
  project,
  aspect = "aspect-[4/3]",
  sizes = "(min-width: 768px) 50vw, 100vw",
  tone = "light",
  headingLevel: H = "h3",
  className,
}: Props) {
  const dark = tone === "dark";
  return (
    <article className={cn("group relative self-start", className)}>
      <div className={cn("relative overflow-hidden bg-ink", aspect)}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        {project.isSample ? <SampleBadge className="absolute left-3 top-3" /> : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <H className="type-h3 text-balance">
            <Link
              href={`/work/${project.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[:focus-visible]:underline"
            >
              {project.title}
            </Link>
          </H>
          <p className={cn("mt-2 type-meta", dark ? "text-white/60" : "text-mute-2")}>
            {project.client ?? project.industry}
            <span aria-hidden> / </span>
            {project.services.slice(0, 2).join(", ")}
          </p>
        </div>
      </div>
      {/* Focus ring for the whole card when its link is focused */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 hidden rounded-sm border-2 border-accent group-has-[:focus-visible]:block"
      />
    </article>
  );
}
