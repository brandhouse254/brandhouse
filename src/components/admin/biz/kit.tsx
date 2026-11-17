"use client";

import { useCallback, useEffect, useId, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputClass } from "../ui";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Runs a server action with a pending state and a readable error. */
export function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    <R extends ActionResult>(fn: () => Promise<R>, onOk?: (r: Extract<R, { ok: true }>) => void) =>
      new Promise<boolean>((resolve) => {
        setError(null);
        start(async () => {
          try {
            const r = await fn();
            if (r.ok) {
              onOk?.(r as Extract<R, { ok: true }>);
              router.refresh();
              resolve(true);
            } else {
              setError(r.error);
              resolve(false);
            }
          } catch {
            setError("Couldn't reach the server. Check your connection and try again.");
            resolve(false);
          }
        });
      }),
    [router],
  );
  return { run, pending, error, setError };
}

export function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
    </p>
  );
}

/** Bottom sheet on phones, centred dialog on larger screens. */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-[#000]/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          // Full screen on phones so the on-screen keyboard can't push the form around; a centred card from sm up.
          "relative flex h-[100dvh] w-full flex-col bg-white shadow-2xl ring-1 ring-ink/10 sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-ink/8 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 rounded-full p-2 text-ink/60 hover:bg-ink/6 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: ReactNode }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {children}
      </label>
      {hint ? <p className="text-xs text-mute-2">{hint}</p> : null}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label?: string;
  hint?: ReactNode;
  value: string | number;
  onValue: (v: string) => void;
};

export function Input({ label, hint, value, onValue, className, ...rest }: InputProps) {
  const id = useId();
  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={id} hint={hint}>
          {label}
        </Label>
      ) : null}
      <input id={id} value={value} onChange={(e) => onValue(e.target.value)} className={inputClass} {...rest} />
    </div>
  );
}

export function TextBox({
  label,
  value,
  onValue,
  rows = 3,
  placeholder,
  className,
}: {
  label?: string;
  value: string;
  onValue: (v: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onValue(e.target.value)} className={cn(inputClass, "leading-relaxed")} />
    </div>
  );
}

export function Choice({
  label,
  value,
  onValue,
  options,
  className,
  placeholder,
}: {
  label?: string;
  value: string;
  onValue: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onValue(e.target.value)} className={cn(inputClass, "appearance-none pr-10")}>
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink/45" />
      </div>
    </div>
  );
}

/** Row of pill buttons for picking one option (stages, statuses). */
export function Segmented({
  value,
  onValue,
  options,
  disabled,
  label,
}: {
  value: string;
  onValue: (v: string) => void;
  options: readonly { id: string; label: string }[];
  disabled?: boolean;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          disabled={disabled}
          onClick={() => onValue(o.id)}
          className={cn(
            "h-9 rounded-full px-3.5 text-sm font-medium ring-1 ring-inset transition-colors disabled:opacity-50",
            o.id === value ? "bg-ink text-paper ring-ink" : "bg-white text-ink/70 ring-ink/15 hover:text-ink hover:ring-ink/30",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const kesInput = (v: number | null | undefined) => (v === null || v === undefined || Number.isNaN(v) ? "" : String(v));
