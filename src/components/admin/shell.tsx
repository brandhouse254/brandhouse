"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ExternalLink,
  History,
  Home,
  Images,
  Inbox,
  Info,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  MoreHorizontal,
  Phone,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { MediaPrefixContext } from "./media";
import { AppSetupPrompt } from "./app-setup";

type ShellUser = { name: string; email: string; role: "owner" | "editor" };
type NavItem = { href: string; label: string; icon: typeof Home; ownerOnly?: boolean; badge?: boolean };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: true },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/work", label: "Work & projects", icon: Briefcase },
      { href: "/admin/services", label: "Services", icon: Sparkles },
      { href: "/admin/about", label: "About page", icon: Info },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/settings", label: "Contact & social", icon: Phone },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/admin/media", label: "Media library", icon: Images },
      { href: "/admin/history", label: "Version history", icon: History },
    ],
  },
  {
    label: "Team",
    items: [
      { href: "/admin/team", label: "Team members", icon: Users, ownerOnly: true },
      { href: "/admin/account", label: "My account & app", icon: UserRound },
    ],
  },
];

/** The four most-used screens get a tab on phones; everything else is under More. */
const tabs: NavItem[] = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: true },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/work", label: "Work", icon: Briefcase },
];

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

export function AdminShell({
  user,
  mediaPrefix,
  unread,
  children,
}: {
  user: ShellUser;
  mediaPrefix: string;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/admin";
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const inMore = !tabs.some((t) => isActive(t.href));

  const navList = (dense: boolean) => (
    <nav
      aria-label="Admin"
      className={cn("flex-1 overflow-y-auto px-3", dense ? "py-4" : "py-2")}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) setMoreOpen(false);
      }}
    >
      {groups.map((g) => {
        const items = g.items.filter((i) => !i.ownerOnly || user.role === "owner");
        if (!items.length) return null;
        return (
          <div key={g.label} className="mb-5">
            <p className="px-3 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#fff]/35">{g.label}</p>
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 transition-colors",
                        dense ? "py-2 text-[0.92rem]" : "py-3 text-base",
                        active ? "bg-[#fff]/10 text-[#fff]" : "text-[#fff]/65 hover:bg-[#fff]/5 hover:text-[#fff]",
                      )}
                    >
                      <Icon className={cn("size-[1.1rem]", active ? "text-accent" : "text-[#fff]/45 group-hover:text-[#fff]/80")} aria-hidden />
                      <span className="flex-1">{label}</span>
                      {badge ? <Count n={unread} /> : null}
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

  const accountFooter = (
    <div className="border-t border-[#fff]/8 p-3">
      <Link href="/" target="_blank" className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#fff]/65 hover:bg-[#fff]/5 hover:text-[#fff]">
        <ExternalLink className="size-4 text-[#fff]/45" aria-hidden /> View live site
      </Link>
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
    </div>
  );

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-[#fff]/8 bg-[#08080a] text-[#fff] lg:flex">
        <div className="flex items-center gap-3 px-6 pb-2 pt-6">
          <Logo className="h-9 text-[#fff]" />
          <span className="rounded-md bg-[#fff]/10 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#fff]/60">Admin</span>
        </div>
        {navList(true)}
        {accountFooter}
      </aside>

      {/* Phone / tablet top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#fff]/8 bg-[#08080a]/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-[#fff] backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5" aria-label="Dashboard">
          <Logo variant="mark" className="h-8 text-[#fff]" />
          <span className="text-sm font-medium text-[#fff]/70">Admin</span>
        </Link>
        <Link
          href="/admin/account"
          aria-label="My account & app"
          className="flex size-9 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#111]"
        >
          {initials(user.name, user.email)}
        </Link>
      </header>

      <main className="min-w-0 px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-8 lg:pb-24">
        <div className="mx-auto max-w-5xl pt-2">
          <MediaPrefixContext.Provider value={mediaPrefix}>{children}</MediaPrefixContext.Provider>
        </div>
      </main>

      {/* Phone / tablet bottom tabs */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#fff]/8 bg-[#08080a]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {tabs.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium", active ? "text-[#fff]" : "text-[#fff]/50")}
                >
                  <span className="relative">
                    <Icon className={cn("size-[1.35rem]", active && "text-accent")} aria-hidden />
                    {badge ? <Count n={unread} className="absolute -right-3 -top-2" /> : null}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              className={cn("flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.7rem] font-medium", inMore ? "text-[#fff]" : "text-[#fff]/50")}
            >
              <MoreHorizontal className={cn("size-[1.35rem]", inMore && "text-accent")} aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* "More" sheet with every screen */}
      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="All admin screens">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-[#000]/60 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-3xl bg-[#111114] text-[#fff] shadow-2xl ring-1 ring-[#fff]/10">
            <div className="flex justify-center pb-1 pt-3">
              <span className="h-1 w-10 rounded-full bg-[#fff]/20" aria-hidden />
            </div>
            <div className="flex items-center justify-between px-6 pb-2">
              <p className="font-display text-lg font-semibold">Menu</p>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close menu" className="-mr-2 rounded-full p-2 hover:bg-[#fff]/10">
                <X className="size-5" />
              </button>
            </div>
            {navList(false)}
            <div className="pb-[env(safe-area-inset-bottom)]">{accountFooter}</div>
          </div>
        </div>
      ) : null}

      <AppSetupPrompt />
    </div>
  );
}
