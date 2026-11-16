"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { hasUnsavedChanges, userIsBusy } from "@/lib/admin/dirty";
import { cn } from "@/lib/cn";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "";
const POLL_MS = 30_000;
const PULL_TRIGGER = 72;

function standalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function checkServiceWorker() {
  navigator.serviceWorker
    ?.getRegistration("/admin/")
    .then((r) => r?.update())
    .catch(() => undefined);
}

/**
 * Keeps the admin current without anyone reinstalling or reloading:
 * - screens refresh by themselves when a teammate changes something;
 * - a new version of the admin loads itself after it goes live;
 * - in the installed app, pulling down from the top refreshes the screen.
 * Nothing refreshes while someone is typing or has unsaved changes.
 */
export function LiveUpdates() {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [updateReady, setUpdateReady] = useState(false);
  const [pull, setPull] = useState(0);
  const [reloading, setReloading] = useState(false);
  const lastStamp = useRef<string | null>(null);
  const pendingRefresh = useRef(false);
  const hiddenAt = useRef<number | null>(null);

  const softRefresh = useCallback(() => startRefresh(() => router.refresh()), [router]);

  const check = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    try {
      const res = await fetch("/api/admin/pulse", { cache: "no-store" });
      if (!res.ok) return;
      const { version, stamp } = (await res.json()) as { version: string; stamp: string };
      if (version && APP_VERSION && version !== APP_VERSION) {
        checkServiceWorker();
        if (userIsBusy()) setUpdateReady(true);
        else window.location.reload();
        return;
      }
      if (lastStamp.current !== null && stamp !== lastStamp.current) pendingRefresh.current = true;
      lastStamp.current = stamp;
      if (pendingRefresh.current && !userIsBusy()) {
        pendingRefresh.current = false;
        softRefresh();
      }
    } catch {
      // Offline for a moment: try again on the next tick.
    }
  }, [softRefresh]);

  // Poll while visible; catch up as soon as the app comes back to the front.
  useEffect(() => {
    const first = window.setTimeout(() => void check(), 1500);
    const timer = window.setInterval(() => void check(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
        return;
      }
      checkServiceWorker();
      const away = hiddenAt.current ? Date.now() - hiddenAt.current : 0;
      hiddenAt.current = null;
      if (away > 60_000 && !userIsBusy()) softRefresh();
      void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [check, softRefresh]);

  // Pull to refresh (installed app only; browsers already do this themselves).
  useEffect(() => {
    if (!standalone()) return;
    let startY = 0;
    let active = false;
    let distance = 0;

    const scrolledAncestor = (target: EventTarget | null) => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.closest('[role="dialog"]')) return true;
        if (el.scrollTop > 0) return true;
        el = el.parentElement;
      }
      return false;
    };
    const onStart = (e: TouchEvent) => {
      active = e.touches.length === 1 && window.scrollY <= 0 && !scrolledAncestor(e.target);
      startY = e.touches[0]?.clientY ?? 0;
      distance = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const dy = (e.touches[0]?.clientY ?? 0) - startY;
      if (dy <= 0 || window.scrollY > 0) {
        distance = 0;
        setPull(0);
        if (window.scrollY > 0) active = false;
        return;
      }
      distance = Math.min(dy * 0.5, 120);
      setPull(distance);
    };
    const onEnd = () => {
      if (!active) return;
      active = false;
      if (distance >= PULL_TRIGGER) {
        setReloading(true);
        checkServiceWorker();
        if (hasUnsavedChanges()) {
          // Keep unsaved edits: refresh the data around them instead of reloading the page.
          startRefresh(() => router.refresh());
          window.setTimeout(() => {
            setReloading(false);
            setPull(0);
          }, 700);
        } else {
          window.location.reload();
        }
      } else {
        setPull(0);
      }
      distance = 0;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [router]);

  const shown = reloading ? PULL_TRIGGER : pull;
  const ready = pull >= PULL_TRIGGER;

  return (
    <>
      {shown > 0 ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center"
          style={{ transform: `translateY(calc(env(safe-area-inset-top) + ${shown - 28}px))` }}
        >
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full bg-[#1d1d21] text-[#fff] shadow-lg ring-1 ring-[#fff]/10 transition-colors",
              (ready || reloading) && "bg-accent text-[#111]",
            )}
          >
            {reloading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : ready ? (
              <RefreshCw className="size-5" />
            ) : (
              <ArrowDown className="size-5" style={{ transform: `rotate(${Math.min(pull / PULL_TRIGGER, 1) * 180}deg)` }} />
            )}
          </span>
        </div>
      ) : null}

      {refreshing && !reloading ? (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-[bh-progress_1s_ease-in-out_infinite] rounded-full bg-accent" />
        </div>
      ) : null}

      {updateReady ? (
        <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-[#1d1d21] px-4 py-3 text-[#fff] shadow-2xl ring-1 ring-[#fff]/10 lg:bottom-6">
          <Sparkles className="size-5 shrink-0 text-accent" aria-hidden />
          <p className="flex-1 text-sm">A new version of the admin is ready. Save your work, then update.</p>
          <button
            type="button"
            onClick={() => {
              if (hasUnsavedChanges() && !confirm("You have unsaved changes. Update anyway and lose them?")) return;
              window.location.reload();
            }}
            className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-[#111]"
          >
            Update
          </button>
        </div>
      ) : null}
    </>
  );
}
