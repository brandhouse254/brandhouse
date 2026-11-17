"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Check,
  Eye,
  Loader2,
  Monitor,
  RotateCcw,
  Save,
  Smartphone,
  X,
} from "lucide-react";
import { endPreview, saveSection, startPreview } from "@/lib/admin/actions";
import type { SectionKey } from "@/lib/cms/schema";
import { stableStringify } from "@/lib/cms/stable";
import { cn } from "@/lib/cn";
import { useUnsavedFlag } from "@/lib/admin/dirty";
import { Button } from "./ui";

type SaveState =
  | { kind: "idle" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string };

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
  const [baseline, setBaseline] = useState<string>(() =>
    stableStringify(options?.stored ?? initial),
  );
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const onSavedRef = useRef(options?.onSaved);
  useEffect(() => {
    onSavedRef.current = options?.onSaved;
  });

  const dirty = useMemo(
    () => stableStringify(value) !== baseline,
    [value, baseline],
  );
  useUnsavedFlag(dirty);

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

  return { section, value, setValue, dirty, save, discard, pending, state };
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
    <>
      <div className="sticky top-[calc(3.2rem+max(0.6rem,env(safe-area-inset-top)))] z-30 -mx-4 mb-6 border-b border-ink/10 bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:py-4 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-semibold tracking-[-0.02em] md:text-2xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-0.5 text-sm text-mute-2">{description}</p>
            ) : null}
          </div>
          <Status dirty={dirty} pending={pending} state={state} />
          <div className="flex items-center gap-2">
            {extra}
            <PreviewButton editor={editor} path={viewHref ?? "/"} />
            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant="ghost"
                onClick={discard}
                disabled={!dirty || pending}
              >
                <RotateCcw className="size-4" /> Discard
              </Button>
              <Button
                variant="primary"
                onClick={() => void save()}
                disabled={!dirty || pending}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {pending ? "Publishing…" : "Save & publish"}
              </Button>
            </div>
          </div>
        </div>
        {state.kind === "error" ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-600/15"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{state.message}</span>
          </div>
        ) : null}
      </div>

      {/* Phones: Save sits above the bottom tabs, only while there is something to save. */}
      {dirty || pending ? (
        <div className="fixed inset-x-0 bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 border-t border-ink/10 bg-paper/95 px-4 pt-3 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <Button
              variant="ghost"
              onClick={discard}
              disabled={pending}
              className="shrink-0"
              aria-label="Discard changes"
            >
              <RotateCcw className="size-4" />
            </Button>
            <PreviewButton editor={editor} path={viewHref ?? "/"} compact />
            <Button
              variant="accent"
              onClick={() => void save()}
              disabled={pending}
              className="flex-1"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {pending ? "Publishing…" : "Save & publish"}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Preview: shows the website with the unsaved changes, inside the admin (so it
 * works in the installed app too). Nothing is published until Save & publish.
 */
function PreviewButton<T>({
  editor,
  path,
  compact,
}: {
  editor: SectionEditor<T>;
  path: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"phone" | "desktop">(() =>
    typeof window !== "undefined" && window.innerWidth >= 1024
      ? "desktop"
      : "phone",
  );
  const [stamp, setStamp] = useState(0);

  const start = async () => {
    setBusy(true);
    setError(null);
    const r = await startPreview(editor.section, editor.value);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setStamp(Date.now());
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    void endPreview();
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const [pathname, hash = ""] = path.split("#");
  const src = `${pathname}${pathname.includes("?") ? "&" : "?"}preview=${stamp}${hash ? `#${hash}` : ""}`;

  return (
    <>
      <Button
        variant={compact ? "ghost" : "ghost"}
        onClick={() => void start()}
        aria-label="Preview"
        disabled={busy || editor.pending}
        className={compact ? "shrink-0" : undefined}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Eye className="size-4" />
        )}
        <span className={compact ? "sr-only" : "hidden sm:inline"}>
          Preview
        </span>
      </Button>
      {error && !open ? (
        <span role="alert" className="text-sm text-red-700">
          {error}
        </span>
      ) : null}
      {open
        ? createPortal(
            <div
              className="admin-theme fixed inset-0 z-[90] flex flex-col bg-[#0b0b0c]"
              role="dialog"
              aria-modal="true"
              aria-label="Preview"
            >
              <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#fff]/10 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-[#fff] sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold leading-tight">
                    Preview
                  </p>
                  <p className="text-xs text-[#fff]/55">
                    {editor.dirty
                      ? "Your changes, not live yet."
                      : "No unsaved changes: this is the live version."}
                  </p>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Screen size"
                  className="hidden rounded-full bg-[#fff]/10 p-1 sm:flex"
                >
                  {(
                    [
                      ["phone", Smartphone, "Phone"],
                      ["desktop", Monitor, "Desktop"],
                    ] as const
                  ).map(([id, Icon, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={device === id}
                      onClick={() => setDevice(id)}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm",
                        device === id
                          ? "bg-[#fff] text-[#111]"
                          : "text-[#fff]/70",
                      )}
                    >
                      <Icon className="size-4" /> {label}
                    </button>
                  ))}
                </div>
                {editor.dirty ? (
                  <button
                    type="button"
                    onClick={() => {
                      void editor.save().then((ok) => ok && close());
                    }}
                    disabled={editor.pending}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-[#111]"
                  >
                    {editor.pending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}{" "}
                    Publish
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close preview"
                  className="inline-flex size-10 items-center justify-center rounded-full bg-[#fff]/10"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-0 sm:p-4">
                <iframe
                  key={src}
                  src={src}
                  title="Website preview"
                  className={cn(
                    "h-full bg-[#fff]",
                    device === "phone"
                      ? "w-full sm:w-[24.5rem] sm:rounded-[2rem] sm:ring-[8px] sm:ring-[#222]"
                      : "w-full sm:rounded-xl",
                  )}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Status({
  dirty,
  pending,
  state,
}: {
  dirty: boolean;
  pending: boolean;
  state: SaveState;
}) {
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
    <p
      aria-live="polite"
      className={cn(
        "hidden items-center gap-1.5 text-sm font-medium md:flex",
        tone,
      )}
    >
      {icon}
      {label}
    </p>
  );
}
