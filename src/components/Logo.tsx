import { logoArt, LOGO_ORANGE } from "./logo-art";
import { cn } from "@/lib/cn";

type LogoProps = {
  /** "full" = stacked BRAND / HOUSE wordmark, "mark" = the B monogram (mobile header, small spaces). */
  variant?: "full" | "mark";
  className?: string;
  title?: string;
};

/**
 * Brand House logo, from the supplied artwork. Letterforms use currentColor,
 * so the logo is white on dark backgrounds and charcoal on light ones; the
 * square is always the brand orange.
 */
export function Logo({ variant = "full", className, title = "Brand House" }: LogoProps) {
  const art = variant === "mark" ? logoArt.mark : logoArt.wordmark;
  const [x, y, w, h] = art.square;
  return (
    <svg
      viewBox={art.viewBox}
      className={cn(variant === "mark" ? "h-9 w-auto" : "h-10 w-auto", className)}
      role="img"
      aria-label={title}
    >
      <path d={art.path} fill="currentColor" fillRule="evenodd" />
      <rect x={x} y={y} width={w} height={h} fill={LOGO_ORANGE} />
    </svg>
  );
}
