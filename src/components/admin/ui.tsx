"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

/* ───────────── Layout pieces ───────────── */

export function Card({
  title,
  description,
  children,
  actions,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04)]", className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/8 px-5 py-4 sm:px-6">
          <div>
            {title ? <h2 className="font-display text-[1.05rem] font-semibold tracking-[-0.01em]">{title}</h2> : null}
            {description ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mute-2">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={cn("grid gap-6", cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "orange" | "red" }) {
  const tones = {
    neutral: "bg-ink/6 text-ink/70",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
    orange: "bg-accent/12 text-accent-deep ring-accent/25",
    red: "bg-red-50 text-red-700 ring-red-600/15",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-transparent ring-inset", tones[tone])}>
      {children}
    </span>
  );
}

/* ───────────── Buttons ───────────── */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ variant = "secondary", size = "md", className, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background,color,box-shadow,opacity] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        size === "sm" ? "h-8 px-3 text-[0.82rem]" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-ink text-white hover:bg-ink-2 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]",
        variant === "accent" && "bg-accent font-semibold text-[#111] hover:bg-accent-deep",
        variant === "secondary" && "bg-white text-ink ring-1 ring-ink/15 hover:ring-ink/30 hover:bg-paper",
        variant === "ghost" && "text-ink/70 hover:bg-ink/6 hover:text-ink",
        variant === "danger" && "bg-white text-red-700 ring-1 ring-red-600/25 hover:bg-red-50",
        className,
      )}
    />
  );
}

export function IconButton({ label, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/6 hover:text-ink disabled:pointer-events-none disabled:opacity-30",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        className,
      )}
    />
  );
}

/* ───────────── Fields ───────────── */

export const inputClass =
  "block w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-base text-ink sm:text-[0.95rem] shadow-[0_1px_1px_rgba(17,17,17,0.03)] placeholder:text-ink/35 transition-[border,box-shadow] hover:border-ink/25 focus:border-ink focus:outline-none focus:ring-4 focus:ring-accent/15";

export function Field({
  label,
  hint,
  children,
  htmlFor,
  counter,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
  counter?: { value: number; max: number };
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        {counter ? (
          <span className={cn("text-xs tabular-nums", counter.value > counter.max ? "text-red-600" : "text-ink/40")}>
            {counter.value}/{counter.max}
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-mute-2">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  max,
  type = "text",
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  placeholder?: string;
  max?: number;
  type?: string;
  prefix?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} counter={max ? { value: value.length, max } : undefined}>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[0.95rem] text-ink/40">{prefix}</span>
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          style={prefix ? { paddingLeft: `${0.9 + prefix.length * 0.52}rem` } : undefined}
        />
      </div>
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  placeholder,
  max,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  placeholder?: string;
  max?: number;
  rows?: number;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <Field label={label} hint={hint} htmlFor={id} counter={max ? { value: value.length, max } : undefined}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "resize-none leading-relaxed")}
      />
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 rounded-xl border border-ink/10 bg-paper/50 px-4 py-3.5">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint ? <p className="mt-1 text-xs leading-relaxed text-mute-2">{hint}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          checked ? "bg-accent" : "bg-ink/20",
        )}
      >
        <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(inputClass, "appearance-none pr-10")}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink/45" />
      </div>
    </Field>
  );
}

export function Chips<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T[];
  onChange: (v: T[]) => void;
  options: { value: T; label: string }[];
  hint?: ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm ring-1 ring-inset transition-colors",
                on ? "bg-ink text-white ring-ink" : "bg-white text-ink/75 ring-ink/15 hover:ring-ink/35",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

/* ───────────── Lists ───────────── */

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** A list of one-line items (capabilities, deliverables…). */
export function StringList({
  label,
  value,
  onChange,
  hint,
  addLabel = "Add item",
  placeholder,
  max = 20,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: ReactNode;
  addLabel?: string;
  placeholder?: string;
  max?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);
  const setFocusIndex = (i: number) => {
    pendingFocus.current = i;
  };
  useEffect(() => {
    if (pendingFocus.current !== null) {
      refs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  }, [value.length]);

  return (
    <Field label={label} hint={hint}>
      <ul className="space-y-2">
        {value.map((item, i) => (
          <li key={i} className="group flex items-center gap-1.5">
            <GripVertical aria-hidden className="size-4 shrink-0 text-ink/20" />
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={item}
              placeholder={placeholder}
              aria-label={`${label} ${i + 1}`}
              onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (value.length < max) {
                    const next = [...value];
                    next.splice(i + 1, 0, "");
                    onChange(next);
                    setFocusIndex(i + 1);
                  }
                }
              }}
              className={cn(inputClass, "py-2")}
            />
            <IconButton label="Move up" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))}>
              <ArrowUp className="size-4" />
            </IconButton>
            <IconButton label="Move down" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))}>
              <ArrowDown className="size-4" />
            </IconButton>
            <IconButton label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-red-600">
              <Trash2 className="size-4" />
            </IconButton>
          </li>
        ))}
      </ul>
      {value.length < max ? (
        <Button
          size="sm"
          variant="ghost"
          className="mt-2"
          onClick={() => {
            onChange([...value, ""]);
            setFocusIndex(value.length);
          }}
        >
          <Plus className="size-4" /> {addLabel}
        </Button>
      ) : null}
    </Field>
  );
}

/** A list of cards (values, testimonials, facts…) with reorder and delete. */
export function Repeater<T>({
  label,
  items,
  onChange,
  render,
  create,
  itemLabel,
  addLabel = "Add",
  max = 20,
  hint,
}: {
  label?: string;
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  create: () => T;
  itemLabel: (item: T, index: number) => string;
  addLabel?: string;
  max?: number;
  hint?: ReactNode;
}) {
  return (
    <div>
      {label ? <p className="mb-1.5 text-sm font-medium">{label}</p> : null}
      {hint ? <p className="mb-3 text-xs text-mute-2">{hint}</p> : null}
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="min-w-0 rounded-xl border border-ink/10 bg-paper/40">
            <div className="flex items-center gap-2 border-b border-ink/8 px-3 py-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-semibold tabular-nums text-ink/60 ring-1 ring-ink/10">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink/80">{itemLabel(item, i) || "Untitled"}</span>
              <IconButton label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, i - 1))}>
                <ArrowUp className="size-4" />
              </IconButton>
              <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, i + 1))}>
                <ArrowDown className="size-4" />
              </IconButton>
              <IconButton
                label="Remove"
                className="hover:text-red-600"
                onClick={() => {
                  if (confirm(`Remove "${itemLabel(item, i) || "this item"}"?`)) onChange(items.filter((_, j) => j !== i));
                }}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
            <div className="space-y-4 p-4">
              {render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))), i)}
            </div>
          </li>
        ))}
      </ol>
      {items.length < max ? (
        <Button size="sm" className="mt-3" onClick={() => onChange([...items, create()])}>
          <Plus className="size-4" /> {addLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center">
      {icon ? <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-paper text-ink/60">{icon}</div> : null}
      <p className="font-display text-lg font-semibold">{title}</p>
      {body ? <p className="mt-1.5 max-w-sm text-sm text-mute-2">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
