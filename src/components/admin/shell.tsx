"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  FolderKanban,
  Globe,
  Home,
  Images,
  Info,
  LayoutDashboard,
  BookOpen,
  FileText,
  ListChecks,
  LogOut,
  Magnet,
  Menu,
  MessageSquareQuote,
  Phone,
  Receipt,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { logout } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { MediaPrefixContext } from "./media";
import { AppSetupPrompt, setPushAccount } from "./app-setup";
import { LiveUpdates } from "./live";

type ShellUser = { id: string; name: string; email: string; role: "owner" | "editor" };
type Badge = "leads" | "tasks";
type NavItem = { href: string; label: string; icon: typeof Home; ownerOnly?: boolean; badge?: Badge; exact?: boolean };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Run the business",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/leads", label: "Leads", icon: Magnet, badge: "leads" },
      { href: "/admin/tasks", label: "Tasks", icon: ListChecks, badge: "tasks" },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/clients", label: "Clients", icon: Building2 },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/admin/finance", label: "Finance", icon: Wallet, ownerOnly: true, exact: true },
      { href: "/admin/finance/invoices", label: "Invoices & quotes", icon: Receipt, ownerOnly: true },
      { href: "/admin/finance/expenses", label: "Expenses", icon: Wallet, ownerOnly: true },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/pages", label: "Page text", icon: FileText },
      { href: "/admin/work", label: "Portfolio", icon: Briefcase },
      { href: "/admin/services", label: "Services", icon: Sparkles },
      { href: "/admin/about", label: "About page", icon: Info },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/settings", label: "Contact & social", icon: Phone },
      { href: "/admin/media", label: "Media library", icon: Images },
    ],
  },
  {
    label: "Team",
    items: [
      { href: "/admin/team", label: "Team members", icon: Users, ownerOnly: true },
      { href: "/admin/account", label: "My account & app", icon: UserRound },
      { href: "/admin/guide", label: "Admin guide", icon: BookOpen },
    ],
  },
];

/** The most-used screens get a tab on phones; everything is in the side menu. */

function initials(name: string, email: string) {
  const src = name.trim() || email;
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "BH";
}

function Count({ n, className }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span className={cn("inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold leading-5 text-[#111]", className)}>
      {n > 99 ? "99+" : n}
    </span>
  );
}

const COLLAPSE_KEY = "bh-admin-nav-collapsed";

export function AdminShell({
  user,
  mediaPrefix,
  counts,
  children,
}: {
  user: ShellUser;
  mediaPrefix: string;
  counts: Record<Badge, number>;
  children: React.ReactNode;
}) {
  setPushAccount(user.id);
  const pathname = usePathname() ?? "/admin";
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(0);

  // Longest matching menu entry wins, so /admin/finance/invoices doesn't also light up Finance.
  const allHrefs = groups.flatMap((g) => g.items);
  const activeHref =
    allHrefs
      .filter((i) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`)))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
  const isActive = (href: string) => activeHref === href;

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
      } catch {}
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });

  const closeDrawer = useCallback(() => {
    setDrawer(false);
    setDrag(0);
  }, []);

  // Close the side menu when the page changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (drawer) setDrawer(false);
  }

  // Swipe in from the left edge to open the menu; swipe it back to close.
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let mode: "open" | "close" | null = null;
    const onStart = (e: TouchEvent) => {
      if (window.innerWidth >= 1024 || e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      if (!drawer && t.clientX < 24) mode = "open";
      else if (drawer && drawerRef.current?.contains(e.target as Node)) mode = "close";
      else mode = null;
    };
    const onMove = (e: TouchEvent) => {
      if (!mode) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      if (Math.abs(t.clientY - startY) > Math.abs(dx) + 10) {
        mode = null;
        setDrag(0);
        return;
      }
      if (mode === "open" && dx > 0) setDrag(Math.min(dx, 320));
      if (mode === "close" && dx < 0) setDrag(dx);
    };
    const onEnd = (e: TouchEvent) => {
      if (!mode) return;
      const dx = (e.changedTouches[0]?.clientX ?? startX) - startX;
      if (mode === "open" && dx > 70) setDrawer(true);
      if (mode === "close" && dx < -70) setDrawer(false);
      setDrag(0);
      mode = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [drawer]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer, closeDrawer]);

  const websiteButton = (compact: boolean) => (
    <a
      href="/"
      target="_blank"
      rel="noopener"
      title="Open the website"
      className={cn(
        "flex items-center gap-3 rounded-xl bg-accent font-semibold text-[#111] transition-colors hover:bg-accent-deep",
        compact ? "size-11 justify-center" : "px-3.5 py-2.5 text-sm",
      )}
    >
      <Globe className="size-[1.1rem] shrink-0" aria-hidden />
      {compact ? <span className="sr-only">Open the website</span> : <span className="flex-1 whitespace-nowrap">View website</span>}
      {compact ? null : <ExternalLink className="size-4 shrink-0 opacity-60" aria-hidden />}
    </a>
  );

  const navList = (compact: boolean) => (
    <nav aria-label="Admin" className={cn("flex-1 overflow-y-auto overscroll-contain", compact ? "px-2 py-3" : "px-3 py-3")}>
      {groups.map((g) => {
        const items = g.items.filter((i) => !i.ownerOnly || user.role === "owner");
        if (!items.length) return null;
        return (
          <div key={g.label} className="mb-4">
            {compact ? (
              <div className="mx-auto mb-2 h-px w-6 bg-[#fff]/10" aria-hidden />
            ) : (
              <p className="px-3 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#fff]/35">{g.label}</p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(href);
                const n = badge ? counts[badge] : 0;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={compact ? label : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setDrawer(false)}
                      className={cn(
                        "group relative flex items-center rounded-xl transition-colors",
                        compact ? "size-11 justify-center" : "gap-3 px-3 py-2.5 text-[0.95rem]",
                        active ? "bg-[#fff]/10 text-[#fff]" : "text-[#fff]/65 hover:bg-[#fff]/5 hover:text-[#fff]",
                      )}
                    >
                      <Icon className={cn("size-[1.15rem] shrink-0", active ? "text-accent" : "text-[#fff]/45 group-hover:text-[#fff]/80")} aria-hidden />
                      {compact ? <span className="sr-only">{label}</span> : <span className="min-w-0 flex-1 truncate">{label}</span>}
                      {n ? compact ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" aria-label={`${n} new`} /> : <Count n={n} /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const account = (compact: boolean) => (
    <div className={cn("border-t border-[#fff]/8", compact ? "flex flex-col items-center gap-2 p-2 py-3" : "p-3")}>
      {compact ? (
        <>
          <Link href="/admin/account" title={user.name || user.email} className="flex size-10 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#111]">
            {initials(user.name, user.email)}
          </Link>
          <form action={logout}>
            <button type="submit" aria-label="Sign out" title="Sign out" className="rounded-full p-2 text-[#fff]/50 hover:bg-[#fff]/10 hover:text-[#fff]">
              <LogOut className="size-4" />
            </button>
          </form>
        </>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-[#fff]/5 px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#111]">
            {initials(user.name, user.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#fff]">{user.name || user.email}</p>
            <p className="truncate text-xs text-[#fff]/45">{user.role === "owner" ? "Owner" : "Editor"}</p>
          </div>
          <form action={logout}>
            <button type="submit" aria-label="Sign out" title="Sign out" className="rounded-full p-2 text-[#fff]/50 hover:bg-[#fff]/10 hover:text-[#fff]">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );

  const drawerOffset = drawer ? Math.min(drag, 0) : drag ? -320 + drag : -340;

  return (
    <div
      className={cn("transition-[grid-template-columns] duration-300 lg:grid lg:min-h-svh", collapsed ? "lg:grid-cols-[4.75rem_minmax(0,1fr)]" : "lg:grid-cols-[17rem_minmax(0,1fr)]")}
    >
      {/* Desktop: sidebar that folds down to icons */}
      <aside className="sticky top-0 hidden h-svh flex-col overflow-hidden border-r border-[#fff]/8 bg-[#08080a] text-[#fff] lg:flex">
        <div className={cn("flex items-center pt-5", collapsed ? "flex-col gap-3 px-2" : "justify-between gap-3 px-5")}>
          <Link href="/admin" className="flex items-center gap-2.5" aria-label="Dashboard">
            {collapsed ? <Logo variant="mark" className="h-6 text-[#fff]" /> : <Logo className="h-8 text-[#fff]" />}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            title={collapsed ? "Expand menu" : "Collapse menu"}
            className="rounded-lg p-1.5 text-[#fff]/45 hover:bg-[#fff]/8 hover:text-[#fff]"
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        </div>
        <div className={cn("pt-4", collapsed ? "flex justify-center px-2" : "px-3")}>{websiteButton(collapsed)}</div>
        {navList(collapsed)}
        {account(collapsed)}
      </aside>

      {/* Phone / tablet top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-[#fff]/8 bg-[#08080a]/90 px-3 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] text-[#fff] backdrop-blur-md lg:hidden">
        <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer} className="flex size-10 items-center justify-center rounded-xl hover:bg-[#fff]/8">
          <Menu className="size-5" />
        </button>
        <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-2" aria-label="Dashboard">
          <Logo variant="mark" className="h-[1.1rem] text-[#fff]" />
          <span className="truncate font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-[#fff]">Brand House</span>
        </Link>
        <a href="/" target="_blank" rel="noopener" className="flex h-9 items-center gap-1.5 rounded-full bg-[#fff]/8 px-3 text-sm font-medium text-[#fff] ring-1 ring-[#fff]/10">
          <Globe className="size-4 text-accent" aria-hidden /> Website
        </a>
        <Link href="/admin/account" aria-label="My account & app" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#111]">
          {initials(user.name, user.email)}
        </Link>
      </header>

      <main className="min-w-0 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-6xl pt-1">
          <MediaPrefixContext.Provider value={mediaPrefix}>{children}</MediaPrefixContext.Provider>
        </div>
      </main>

      {/* Side menu (phones and tablets): slides in from the left */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", drawer || drag ? "" : "pointer-events-none")}>
        <button
          type="button"
          tabIndex={drawer ? 0 : -1}
          aria-label="Close menu"
          onClick={closeDrawer}
          className="absolute inset-0 bg-[#000]/60 backdrop-blur-[2px] transition-opacity duration-300"
          style={{ opacity: drawer ? Math.max(0, 1 + drag / 320) : drag ? drag / 320 : 0 }}
        />
        <div
          ref={drawerRef}
          inert={!drawer}
          role="dialog"
          aria-modal={drawer ? "true" : undefined}
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-[#0b0b0d] text-[#fff] shadow-2xl ring-1 ring-[#fff]/8",
            drag ? "" : "transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            drawer || drag ? "visible" : "invisible",
          )}
          style={{ transform: `translateX(${drawerOffset}px)`, paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <Logo className="h-8 text-[#fff]" />
            <button type="button" onClick={closeDrawer} aria-label="Close menu" tabIndex={drawer ? 0 : -1} className="-mr-2 rounded-full p-2 text-[#fff]/60 hover:bg-[#fff]/10 hover:text-[#fff]">
              <X className="size-5" />
            </button>
          </div>
          <div className="px-3 pt-2">{websiteButton(false)}</div>
          {navList(false)}
          <div className="pb-[env(safe-area-inset-bottom)]">{account(false)}</div>
        </div>
      </div>

      <LiveUpdates />
      <AppSetupPrompt />
    </div>
  );
}
