"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { saveSection } from "@/lib/admin/actions";
import type { SectionKey } from "@/lib/cms/schema";
import { stableStringify } from "@/lib/cms/stable";
import { cn } from "@/lib/cn";
import { Button } from "./ui";

type SaveState = { kind: "idle" } | { kind: "saved"; at: string } | { kind: "error"; message: string };

/**
 * Holds a working copy of one content section, tracks unsaved changes, and
 * saves through the server (which validates, stores and refreshes the site).
 */
export function useSectionEditor<T>(
  section: SectionKey,
  initial: T,
  options?: {
    onSaved?: (stored: T) => void;
    /** What's currently stored, when `initial` already contains an unsaved addition (a new project). */
    stored?: T;
    /** Replaces Discard (e.g. leave the page when discarding a brand-new item). */
    onDiscard?: () => void;
  },
) {
  const [value, setValue] = useState<T>(initial);
  const [baseline, setBaseline] = useState<string>(() => stableStringify(options?.stored ?? initial));
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const onSavedRef = useRef(options?.onSaved);
  useEffect(() => {
    onSavedRef.current = options?.onSaved;
  });

  const dirty = useMemo(() => stableStringify(value) !== baseline, [value, baseline]);

  const save = useCallback(
    (override?: T) =>
      new Promise<boolean>((resolve) => {
        const toSave = override ?? value;
        startTransition(async () => {
          const r = await saveSection(section, toSave, baseline);
          if (r.ok) {
            const stored = r.value as T;
            setBaseline(stableStringify(stored));
            setValue(stored);
            setState({ kind: "saved", at: r.savedAt });
            onSavedRef.current?.(stored);
            router.refresh();
            resolve(true);
          } else {
            setState({ kind: "error", message: r.error });
            resolve(false);
          }
        });
      }),
    [section, value, baseline, router],
  );

  const onDiscard = options?.onDiscard;
  const discard = useCallback(() => {
    if (onDiscard) return onDiscard();
    setValue(JSON.parse(baseline) as T);
    setState({ kind: "idle" });
  }, [baseline, onDiscard]);

  // Warn before leaving with unsaved changes; Ctrl/⌘+S saves.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) void saveRef.current();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKey);
    };
  }, [dirty]);

  return { value, setValue, dirty, save, discard, pending, state };
}

export type SectionEditor<T> = ReturnType<typeof useSectionEditor<T>>;

/** Sticky header for every editing screen: title, status, discard / save. */
export function EditorBar<T>({
  title,
  description,
  editor,
  viewHref,
  extra,
}: {
  title: string;
  description?: ReactNode;
  editor: SectionEditor<T>;
  viewHref?: string;
  extra?: ReactNode;
}) {
  const { dirty, pending, state, save, discard } = editor;
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-ink/10 bg-paper/90 px-4 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
          {description ? <p className="mt-0.5 text-sm text-mute-2">{description}</p> : null}
        </div>
        <Status dirty={dirty} pending={pending} state={state} />
        <div className="flex items-center gap-2">
          {extra}
          {viewHref ? (
            <Link
              href={viewHref}
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink/70 hover:bg-ink/6 hover:text-ink"
            >
              <ExternalLink className="size-4" /> <span className="hidden sm:inline">View</span>
            </Link>
          ) : null}
          <Button variant="ghost" onClick={discard} disabled={!dirty || pending}>
            <RotateCcw className="size-4" /> <span className="hidden sm:inline">Discard</span>
          </Button>
          <Button variant="primary" onClick={() => void save()} disabled={!dirty || pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {pending ? "Publishing…" : "Save & publish"}
          </Button>
        </div>
      </div>
      {state.kind === "error" ? (
        <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-600/15">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{state.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function Status({ dirty, pending, state }: { dirty: boolean; pending: boolean; state: SaveState }) {
  let label = "No changes";
  let tone = "text-ink/45";
  let icon: ReactNode = null;
  if (pending) {
    label = "Saving";
    tone = "text-ink/60";
  } else if (dirty) {
    label = "Unsaved changes";
    tone = "text-amber-700";
    icon = <span className="size-2 rounded-full bg-amber-500" aria-hidden />;
  } else if (state.kind === "saved") {
    label = "Saved and live";
    tone = "text-emerald-700";
    icon = <Check className="size-4" aria-hidden />;
  }
  return (
    <p aria-live="polite" className={cn("hidden items-center gap-1.5 text-sm font-medium md:flex", tone)}>
      {icon}
      {label}
    </p>
  );
}
