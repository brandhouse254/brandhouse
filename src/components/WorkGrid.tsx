"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { Project } from "@/lib/cms/types";
import { workCategoryLabels, type WorkCategory } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { ProjectCard } from "./ProjectCard";

type Filter = WorkCategory | "all";
const filters: Filter[] = ["all", "branding", "film", "web", "marketing"];
const label = (f: Filter) => (f === "all" ? "All work" : workCategoryLabels[f]);

function isFilter(v: string | null): v is Filter {
  return v !== null && (filters as string[]).includes(v);
}

export function WorkGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Filter>("all");
  const statusId = useId();

  // Honour ?category= links (e.g. from service pages) without making the page dynamic.
  useEffect(() => {
    const read = () => {
      const c = new URLSearchParams(window.location.search).get("category");
      setActive(isFilter(c) ? c : "all");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const choose = (f: Filter) => {
    setActive(f);
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", f);
    window.history.replaceState(null, "", url);
  };

  const visible = active === "all" ? projects : projects.filter((p) => p.categories.includes(active));

  return (
    <MotionConfig reducedMotion="user">
    <div>
      <div role="group" aria-label="Filter projects by category" className="-mx-1 flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = f === "all" ? projects.length : projects.filter((p) => p.categories.includes(f)).length;
          const on = active === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              aria-controls="work-grid"
              onClick={() => choose(f)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-display text-[0.95rem] font-medium transition-colors",
                on ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink",
              )}
            >
              {label(f)}
              <span className={cn("tabular-nums text-sm", on ? "text-white/60" : "text-mute-2")}>{count}</span>
            </button>
          );
        })}
      </div>

      <p id={statusId} role="status" className="sr-only">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"} in {label(active)}
      </p>

      <div id="work-grid" aria-describedby={statusId} className="mt-12 md:mt-16">
        {visible.length === 0 ? (
          <div className="border border-dashed border-ink/25 px-6 py-16 text-center">
            <p className="type-h3">No {label(active).toLowerCase()} projects yet.</p>
            <p className="mt-3 text-mute-2">Case studies in this category are on the way. Browse the rest of our work for now.</p>
            <button
              type="button"
              onClick={() => choose("all")}
              className="mt-6 inline-flex min-h-11 items-center font-display font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
            >
              Show all work
            </button>
          </div>
        ) : (
          <motion.ul layout className="grid gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((p, i) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(i % 2 === 1 && "md:mt-32")}
                >
                  <ProjectCard
                    project={p}
                    headingLevel="h2"
                    aspect={i % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
    </MotionConfig>
  );
}
