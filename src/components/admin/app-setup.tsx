"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Bell, BellOff, Check, Download, Loader2, PlusSquare, Share, Smartphone, X } from "lucide-react";
import {
  deletePushSubscription,
  getPushPrefs,
  savePushSubscription,
  sendTestNotification,
  updatePushPrefs,
} from "@/lib/admin/actions";
import type { PushPrefs } from "@/lib/admin/push";
import { cn } from "@/lib/cn";
import { Button, Toggle } from "./ui";

/* ───────────── Environment detection ───────────── */

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// The install prompt fires once, early; keep it outside React so no screen misses it.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((l) => l());
  });
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function vapidKey(): Uint8Array<ArrayBuffer> {
  const base64 = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration() {
  return navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
}

type Status = {
  ready: boolean;
  standalone: boolean;
  ios: boolean;
  canPrompt: boolean;
  push: "unsupported" | "default" | "denied" | "on" | "off";
  endpoint: string | null;
};

/** Install + notification status for this device, with actions to change it. */
export function useAppStatus() {
  const canPrompt = useSyncExternalStore(subscribe, () => deferredPrompt !== null, () => false);
  const [status, setStatus] = useState<Omit<Status, "canPrompt">>({
    ready: false,
    standalone: false,
    ios: false,
    push: "unsupported",
    endpoint: null,
  });

  const refresh = useCallback(async () => {
    const base = { ready: true, standalone: isStandalone(), ios: isIOS() };
    if (!pushSupported()) return setStatus({ ...base, push: "unsupported", endpoint: null });
    try {
      const reg = await registration();
      const sub = await reg.pushManager.getSubscription();
      const perm = Notification.permission;
      setStatus({
        ...base,
        push: perm === "denied" ? "denied" : sub ? "on" : perm === "granted" ? "off" : "default",
        endpoint: sub?.endpoint ?? null,
      });
    } catch {
      setStatus({ ...base, push: "unsupported", endpoint: null });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Defer so the first render matches the server, then read the device's state.
    const id = window.setTimeout(() => {
      if (!cancelled) void refresh();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [refresh]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach((l) => l());
    await refresh();
    return outcome === "accepted";
  }, [refresh]);

  const enablePush = useCallback(async (): Promise<string | null> => {
    if (!pushSupported()) return "This browser can't receive notifications.";
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      await refresh();
      return perm === "denied" ? "Notifications are blocked for this site. Allow them in your device settings, then try again." : null;
    }
    try {
      const reg = await registration();
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey() }));
      const r = await savePushSubscription(sub.toJSON(), navigator.userAgent);
      await refresh();
      return r.ok ? null : r.error;
    } catch (e) {
      await refresh();
      return e instanceof Error ? e.message : "Couldn't turn notifications on.";
    }
  }, [refresh]);

  const disablePush = useCallback(async () => {
    const reg = await registration();
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await deletePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    await refresh();
  }, [refresh]);

  return { ...status, canPrompt, install, enablePush, disablePush, refresh };
}

/* ───────────── After sign-in: install + notifications ───────────── */

const SNOOZE_KEY = "bh-admin-setup-snoozed";
const SNOOZE_DAYS = 3;

function IOSInstallSteps() {
  return (
    <ol className="space-y-3 text-sm">
      <li className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fff]/8 text-xs font-semibold">1</span>
        <span className="pt-1">
          Tap <Share className="mx-0.5 inline size-4 -translate-y-0.5 text-[#0a84ff]" aria-label="Share" /> <strong>Share</strong> in Safari&apos;s toolbar
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fff]/8 text-xs font-semibold">2</span>
        <span className="pt-1">
          Choose <PlusSquare className="mx-0.5 inline size-4 -translate-y-0.5" aria-hidden /> <strong>Add to Home Screen</strong>, then <strong>Add</strong>
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fff]/8 text-xs font-semibold">3</span>
        <span className="pt-1">
          Open <strong>BH Admin</strong> from your Home Screen and turn on notifications there
        </span>
      </li>
    </ol>
  );
}

export function AppSetupPrompt() {
  const app = useAppStatus();
  const [dismissed, setDismissed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      let snoozedUntil = 0;
      try {
        snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
      } catch {}
      setDismissed(snoozedUntil > Date.now());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const needsInstall = app.ready && !app.standalone && (app.canPrompt || app.ios);
  const needsPush = app.ready && (app.push === "default" || app.push === "off");
  const open = !dismissed && (needsInstall || needsPush);

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
    } catch {}
    setDismissed(true);
  };

  if (!open) return null;

  // iPhone in Safari: notifications only work once the app is on the Home Screen.
  const iosInBrowser = app.ios && !app.standalone;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#000]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="app-setup-title">
      <div ref={dialog} className="w-full max-w-md rounded-t-3xl bg-[#17171a] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[#f3f1ec] shadow-2xl ring-1 ring-[#fff]/10 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/admin/icon-192.png" alt="" className="size-12 rounded-xl ring-1 ring-[#fff]/10" />
            <div>
              <h2 id="app-setup-title" className="font-display text-lg font-semibold leading-tight">
                {needsInstall ? "Get the admin app" : "Turn on notifications"}
              </h2>
              <p className="text-sm text-[#9d9890]">
                {needsInstall ? "Open the admin from your Home Screen, full screen." : "Know the moment a new enquiry comes in."}
              </p>
            </div>
          </div>
          <button type="button" onClick={snooze} aria-label="Not now" className="-m-2 rounded-full p-2 text-[#9d9890] hover:bg-[#fff]/8 hover:text-[#fff]">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {needsInstall ? (
            <section className="rounded-2xl bg-[#fff]/5 p-4 ring-1 ring-[#fff]/8">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Smartphone className="size-4 text-accent" aria-hidden /> Install BH Admin
              </p>
              {app.canPrompt ? (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={async () => {
                    setBusy(true);
                    await app.install();
                    setBusy(false);
                  }}
                  disabled={busy}
                >
                  <Download className="size-4" /> Install app
                </Button>
              ) : (
                <IOSInstallSteps />
              )}
            </section>
          ) : null}

          {!iosInBrowser && needsPush ? (
            <section className="rounded-2xl bg-[#fff]/5 p-4 ring-1 ring-[#fff]/8">
              <p className="mb-1 flex items-center gap-2 text-sm font-medium">
                <Bell className="size-4 text-accent" aria-hidden /> Notifications
              </p>
              <p className="mb-3 text-sm text-[#9d9890]">New website enquiries arrive here straight away, with the client&apos;s details one tap away.</p>
              <Button
                variant="primary"
                className="w-full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setMessage(await app.enablePush());
                  setBusy(false);
                }}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Turn on notifications
              </Button>
            </section>
          ) : null}

          {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}

          <button type="button" onClick={snooze} className="w-full py-2 text-center text-sm text-[#9d9890] hover:text-[#fff]">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────── My account: this device ───────────── */

export function AppSettings() {
  const app = useAppStatus();
  const [prefs, setPrefs] = useState<PushPrefs | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!app.endpoint) return;
    let live = true;
    void getPushPrefs(app.endpoint).then((r) => live && r.ok && setPrefs(r.prefs));
    return () => {
      live = false;
    };
  }, [app.endpoint]);

  const setPref = async (key: keyof PushPrefs, value: boolean) => {
    if (!app.endpoint || !prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    const r = await updatePushPrefs(app.endpoint, next);
    if (!r.ok) setMessage(r.error);
  };

  if (!app.ready) {
    return (
      <p className="flex items-center gap-2 text-sm text-mute-2">
        <Loader2 className="size-4 animate-spin" /> Checking this device…
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-paper/60 px-4 py-3 ring-1 ring-ink/8">
        <div>
          <p className="text-sm font-medium">Admin app</p>
          <p className="text-xs text-mute-2">
            {app.standalone ? "Installed and open as an app on this device." : app.canPrompt ? "Not installed on this device yet." : app.ios ? "Add it to your Home Screen from Safari." : "Use your browser's Install option to add it."}
          </p>
        </div>
        {app.standalone ? (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
            <Check className="size-4" /> Installed
          </span>
        ) : app.canPrompt ? (
          <Button size="sm" variant="primary" onClick={() => void app.install()}>
            <Download className="size-4" /> Install
          </Button>
        ) : null}
      </div>
      {app.ios && !app.standalone ? <IOSInstallSteps /> : null}

      <div className="flex items-center justify-between gap-4 rounded-xl bg-paper/60 px-4 py-3 ring-1 ring-ink/8">
        <div>
          <p className="text-sm font-medium">Notifications on this device</p>
          <p className="text-xs text-mute-2">
            {app.push === "on"
              ? "On."
              : app.push === "denied"
                ? "Blocked. Allow notifications for this site in your device or browser settings."
                : app.push === "unsupported"
                  ? app.ios
                    ? "On iPhone, install the app first, then turn notifications on from inside it."
                    : "This browser can't receive notifications."
                  : "Off."}
          </p>
        </div>
        {app.push === "on" ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={async () => { setBusy(true); await app.disablePush(); setPrefs(null); setBusy(false); }}>
            <BellOff className="size-4" /> Turn off
          </Button>
        ) : app.push === "default" || app.push === "off" ? (
          <Button size="sm" variant="primary" disabled={busy} onClick={async () => { setBusy(true); setMessage(await app.enablePush()); setBusy(false); }}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Turn on
          </Button>
        ) : null}
      </div>

      {app.push === "on" && prefs ? (
        <div className="space-y-3">
          <Toggle label="New website enquiries" checked={prefs.enquiries} onChange={(v) => void setPref("enquiries", v)} hint="When someone sends the form on the Contact page." />
          <Toggle label="Changes published by the team" checked={prefs.publishes} onChange={(v) => void setPref("publishes", v)} hint="When someone else publishes an edit to the website." />
          <Button
            size="sm"
            onClick={async () => {
              const r = await sendTestNotification();
              setMessage(r.ok ? (r.devices ? "Test sent. It should arrive in a few seconds." : "No devices found. Turn notifications off and on again.") : r.error);
            }}
          >
            <Bell className="size-4" /> Send a test notification
          </Button>
        </div>
      ) : null}
      {message ? <p className={cn("rounded-xl px-3 py-2 text-sm", message.startsWith("Test sent") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800")}>{message}</p> : null}
    </div>
  );
}
