import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "text";

const base =
  "group inline-flex min-h-12 items-center justify-center gap-2 font-display text-[0.98rem] font-medium tracking-[-0.01em] transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98]";

const variants: Record<Variant, string> = {
  // Ink text on orange keeps ~6:1 contrast.
  primary: "rounded-full bg-accent px-6 text-ink hover:bg-ink hover:text-white",
  outline: "rounded-full border border-current/35 px-6 hover:border-current",
  text: "underline decoration-current/30 underline-offset-[6px] hover:decoration-current min-h-11",
};

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  /** Show the arrow icon. Reserved for the primary project CTA. */
  icon?: boolean;
};

export function ButtonLink({ variant = "primary", className, children, icon, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props}>
      {children}
      {icon ? (
        <ArrowUpRight
          aria-hidden
          className="size-[1.1em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      ) : null}
    </Link>
  );
}

export function buttonClasses(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}
