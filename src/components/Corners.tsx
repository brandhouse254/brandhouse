import { cn } from "@/lib/cn";

/**
 * Viewfinder corner marks — the Brand House framing device. Decorative only.
 */
export function Corners({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const len = { sm: "size-3", md: "size-5 md:size-7", lg: "size-6 md:size-10" }[size];
  const w = size === "sm" ? "border-[1.5px]" : "border-2";
  const c = cn("absolute border-accent", len, w);
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn(c, "left-0 top-0 border-b-0 border-r-0")} />
      <span className={cn(c, "right-0 top-0 border-b-0 border-l-0")} />
      <span className={cn(c, "bottom-0 right-0 border-l-0 border-t-0")} />
      <span className={cn(c, "bottom-0 left-0 border-r-0 border-t-0")} />
    </span>
  );
}
