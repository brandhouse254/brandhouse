import { processSteps } from "@/content/services";
import { cn } from "@/lib/cn";

type Props = {
  /** Optional per-step detail that replaces the generic body (service pages). */
  notes?: readonly string[];
  tone?: "light" | "dark";
};

/** The four-stage process. Numbered because it is a true sequence. */
export function ProcessSteps({ notes, tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <ol className="grid gap-y-12 md:grid-cols-4 md:gap-y-0">
      {processSteps.map((step, i) => (
        <li key={step.title} className="reveal relative pt-8 md:pr-8">
          {/* progress rail: the segment up to this step is filled */}
          <span aria-hidden className={cn("absolute inset-x-0 top-0 h-px", dark ? "bg-white/15" : "bg-ink/15")} />
          <span
            aria-hidden
            className="rail-fill absolute inset-x-0 top-[-1px] h-[3px] origin-left bg-accent"
            style={{ ["--rail-start" as string]: `${10 + i * 12}%` }}
          />
          <span className={cn("font-display text-sm tabular-nums", dark ? "text-white/50" : "text-mute-2")}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="type-h3 mt-3">{step.title}</h3>
          <p className={cn("mt-3 max-w-xs leading-relaxed", dark ? "text-white/70" : "text-mute-2")}>
            {notes?.[i] ?? step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
