"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

/** Routes whose hero is dark, so the unscrolled header uses light text. */
function hasDarkHero(pathname: string) {
  return (
    pathname === "/" ||
    (pathname.startsWith("/services/") && pathname.split("/").length === 3) ||
    (pathname.startsWith("/work/") && pathname.split("/").length === 3)
  );
}

export function Header() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Escape to close, focus trap and scroll lock while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    // Wait for the panel to become visible before moving focus into it.
    const focusTimer = window.setTimeout(() => focusables()[0]?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [toggleRef.current, ...focusables()].filter(Boolean) as HTMLElement[];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const onDark = hasDarkHero(pathname);
  const solid = scrolled || open;
  const light = solid || onDark; // light text

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-[var(--ease-out-expo)]",
        solid || light ? "text-white" : "text-ink",
      )}
    >
      {/* The blur lives on its own layer: backdrop-filter on the header itself
          would trap the fixed mobile menu inside the header's box. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-ink/92 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-opacity duration-500",
          solid ? "opacity-100" : "opacity-0",
        )}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6 md:h-20">
        <Link href="/" aria-label="Brand House home" className="relative z-10 -m-2 p-2">
          <Logo className="hidden h-10 sm:block md:h-11" title="Brand House" />
          <Logo variant="mark" className="h-9 sm:hidden" title="Brand House" />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 lg:gap-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative inline-flex min-h-11 items-center px-3 font-display text-[0.98rem] font-medium tracking-[-0.01em] opacity-80 transition-opacity hover:opacity-100",
                    "after:absolute after:inset-x-3 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100",
                    isActive(item.href) && "opacity-100 after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={siteConfig.cta.primary.href}
            className="hidden min-h-11 items-center rounded-full bg-accent px-5 font-display text-[0.95rem] font-medium tracking-[-0.01em] text-ink transition-colors duration-300 hover:bg-white sm:inline-flex"
          >
            {siteConfig.cta.primary.label}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-10 -mr-2 inline-flex size-12 items-center justify-center md:hidden"
          >
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu. Always in the DOM so it can animate with CSS alone;
          `inert` removes it from the tab order and accessibility tree when closed. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 top-[4.5rem] flex flex-col overflow-y-auto bg-ink text-white transition-[clip-path,visibility] duration-500 ease-[var(--ease-out-expo)] md:hidden",
          open ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]",
        )}
      >
        <nav aria-label="Mobile" className="shell flex flex-1 flex-col pt-6 pb-8">
          <ul className="flex flex-col">
            {siteConfig.nav.map((item, i) => (
              <li
                key={item.href}
                style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
                className={cn(
                  "border-b border-white/10 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <Link
                  href={item.href}
                  onClick={() => close(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-16 items-center justify-between py-3 font-display text-[2.4rem] font-semibold leading-none tracking-[-0.04em]"
                >
                  {item.label}
                  {isActive(item.href) ? <span aria-hidden className="size-2.5 bg-accent" /> : null}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <Link
              href={siteConfig.cta.primary.href}
              onClick={() => close(false)}
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-accent font-display text-lg font-medium text-ink"
            >
              {siteConfig.cta.primary.label}
            </Link>
            {siteConfig.contact.email ? (
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-4 block text-center text-white/70 underline-offset-4 hover:underline"
              >
                {siteConfig.contact.email}
              </a>
            ) : null}
            {siteConfig.contact.phone ? (
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
                className="mt-2 block text-center text-white/70 underline-offset-4 hover:underline"
              >
                {siteConfig.contact.phone}
              </a>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
