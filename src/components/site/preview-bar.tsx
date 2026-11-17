"use client";

import { useState, useSyncExternalStore } from "react";
import { endPreview } from "@/lib/admin/actions";

/** Shown on public pages while an admin previews unpublished changes. */
const noop = () => () => {};

export function PreviewBar() {
  const [busy, setBusy] = useState(false);
  // Inside the admin's preview window the admin shows its own bar.
  const framed = useSyncExternalStore(noop, () => window.self !== window.top, () => false);
  if (framed) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-[#111] py-1.5 pl-4 pr-1.5 text-sm text-white shadow-2xl ring-1 ring-white/15">
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-accent" aria-hidden />
        Preview, not live yet
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await endPreview();
          window.location.reload();
        }}
        className="rounded-full bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20"
      >
        Exit preview
      </button>
    </div>
  );
}
