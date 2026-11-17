"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "../Logo";

const nav = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Floating header for the /next concept: one compact glass bar that looks the
 * same over dark and light sections (no switch to a solid black strip), tucks
 * away while you read down the page and comes back as soon as you scroll up.
 */
export function NextHeader({ email, phone }: { email: string; phone: string }) {
  const pathname = usePathname() || "/";
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Hide on scroll down, show on scroll up. One rAF per frame at most.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const goingDown = y > last + 4;
        const goingUp = y < last - 4;
        if (y < 80 || goingUp) setHidden(false);
        else if (goingDown) setHidden(true);
        if (goingDown || goingUp) last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape or a tap outside closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname === "/next" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-3 z-50 px-3 transition-transform duration-500 ease-[var(--ease-out-expo)] will-change-transform md:top-4",
        hidden && !open ? "-translate-y-[130%]" : "translate-y-0",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div ref={wrapRef} className="relative mx-auto max-w-5xl">
        <div className="flex h-14 items-center justify-between gap-3 rounded-full bg-[#141414]/80 pl-5 pr-2 text-white shadow-[0_10px_40px_-12px_rgb(0_0_0/0.45)] ring-1 ring-white/10 backdrop-blur-xl md:h-[3.75rem]">
          <Link href="/" aria-label="Brand House home" className="-m-2 flex items-center p-2">
            <Logo variant="mark" className="h-7" title="Brand House" />
            <span className="ml-2.5 font-display text-[0.95rem] font-semibold tracking-[-0.02em]">Brand House</span>
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-0.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full px-3.5 font-display text-[0.9rem] font-medium tracking-[-0.01em] text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                      isActive(item.href) && "bg-white/10 text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 font-display text-[0.88rem] font-medium text-[#111] transition-colors hover:bg-white md:h-11 md:px-5"
            >
              <span className="hidden sm:inline">Start a project</span>
              <span className="sm:hidden">Let’s talk</span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="next-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative inline-flex size-10 items-center justify-center rounded-full bg-white/10 md:hidden"
            >
              <span aria-hidden className={cn("absolute h-[1.5px] w-4 rounded bg-white transition-transform duration-300", open ? "rotate-45" : "-translate-y-[3px]")} />
              <span aria-hidden className={cn("absolute h-[1.5px] w-4 rounded bg-white transition-transform duration-300", open ? "-rotate-45" : "translate-y-[3px]")} />
            </button>
          </div>
        </div>

        {/* Mobile menu: a compact card under the bar, not a full-screen takeover. */}
        <div
          id="next-menu"
          inert={!open}
          className={cn(
            "absolute inset-x-0 top-full mt-2 origin-top rounded-[1.75rem] bg-[#161616] p-2 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-out-expo)] md:hidden",
            open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.98] opacity-0",
          )}
        >
          <nav aria-label="Mobile">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center justify-between rounded-2xl px-4 font-display text-base font-medium tracking-[-0.01em] text-white/85 transition-colors hover:bg-white/[0.06]",
                      isActive(item.href) && "bg-white/[0.06] text-white",
                    )}
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden className={cn("size-4", isActive(item.href) ? "text-accent" : "text-white/35")} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {email || phone ? (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 px-4 pb-2 pt-3 text-sm text-white/55">
              {email ? <a href={`mailto:${email}`} className="hover:text-white">{email}</a> : null}
              {phone ? <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white">{phone}</a> : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
