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
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Phone,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";

type ShellUser = { name: string; email: string; role: "owner" | "editor" };

const groups: { label: string; items: { href: string; label: string; icon: typeof Home; ownerOnly?: boolean }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
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
      { href: "/admin/account", label: "My account", icon: UserRound },
    ],
  },
];

function initials(name: string, email: string) {
  const src = name.trim() || email;
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "BH";
}

export function AdminShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav
      aria-label="Admin"
      className="flex-1 overflow-y-auto px-3 py-4"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) setOpen(false);
      }}
    >
      {groups.map((g) => {
        const items = g.items.filter((i) => !i.ownerOnly || user.role === "owner");
        if (!items.length) return null;
        return (
          <div key={g.label} className="mb-5">
            <p className="px-3 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/35">{g.label}</p>
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-[0.92rem] transition-colors",
                        active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className={cn("size-[1.05rem]", active ? "text-accent" : "text-white/45 group-hover:text-white/80")} aria-hidden />
                      {label}
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

  const footer = (
    <div className="border-t border-white/10 p-3">
      <Link href="/" target="_blank" className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white">
        <ExternalLink className="size-4 text-white/45" aria-hidden /> View live site
      </Link>
      <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-ink">
          {initials(user.name, user.email)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.name || user.email}</p>
          <p className="truncate text-xs text-white/45">{user.role === "owner" ? "Owner" : "Editor"}</p>
        </div>
        <form action={logout}>
          <button type="submit" aria-label="Sign out" title="Sign out" className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col bg-ink text-white lg:flex">
        <div className="flex items-center gap-3 px-6 pb-2 pt-6">
          <Logo className="h-9 text-white" />
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/60">Admin</span>
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2.5">
          <Logo variant="mark" className="h-8 text-white" />
          <span className="text-sm font-medium text-white/70">Admin</span>
        </div>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-full p-2 hover:bg-white/10">
          <Menu className="size-5" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(19rem,85vw)] flex-col bg-ink text-white shadow-2xl">
            <div className="flex items-center justify-between px-5 pb-1 pt-5">
              <Logo className="h-8 text-white" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      ) : null}

      <main className="min-w-0 px-4 pb-24 sm:px-8">
        <div className="mx-auto max-w-5xl pt-2">{children}</div>
      </main>
    </div>
  );
}
