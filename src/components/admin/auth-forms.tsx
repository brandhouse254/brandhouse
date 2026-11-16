"use client";

import { useActionState, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { changePassword, login, setupOwner, updateProfile, type FormState } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { inputClass } from "./ui";

export function AuthFrame({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -right-32 -top-32 size-[34rem] rounded-full bg-accent/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-[#2a6f6a]/30 blur-3xl" />
        <Logo className="relative h-14 text-white" />
        <div className="relative">
          <p className="font-display text-[clamp(2.2rem,3.6vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Your website,
            <br />
            your story.
          </p>
          <p className="mt-5 max-w-sm text-white/60">
            Update the homepage, publish new work and keep every page current, without touching code.
          </p>
        </div>
        <p className="relative text-sm text-white/35">Brand House · Admin</p>
      </div>
      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <Logo className="mb-10 h-11 lg:hidden" />
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
          {intro ? <div className="mt-2 text-[0.95rem] leading-relaxed text-mute-2">{intro}</div> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", autoComplete, hint, defaultValue, autoFocus }: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && show ? "text" : type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          required
          className={cn(inputClass, "h-12", isPassword && "pr-12")}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink/45 hover:text-ink"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1.5 text-xs text-mute-2">{hint}</p> : null}
    </div>
  );
}

function Submit({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-medium text-white transition-colors hover:bg-ink-2 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function Message({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error)
    return (
      <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-600/15">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-600/15">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.message}
      </p>
    );
  return null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-5">
      <Input label="Email" name="email" type="email" autoComplete="username" autoFocus />
      <Input label="Password" name="password" type="password" autoComplete="current-password" />
      <Message state={state} />
      <Submit pending={pending}>Sign in</Submit>
      <p className="text-center text-xs text-mute-2">Forgot your password? Ask an owner to reset it from Team members.</p>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupOwner, undefined);
  return (
    <form action={action} className="space-y-5">
      <Input label="Setup code" name="code" autoComplete="off" hint="The one-time code you were given, e.g. BH-XXXX-XXXX-XXXX." autoFocus />
      <Input label="Your name" name="name" autoComplete="name" />
      <Input label="Email" name="email" type="email" autoComplete="username" hint="You'll sign in with this." />
      <Input label="Password" name="password" type="password" autoComplete="new-password" hint="At least 10 characters." />
      <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" />
      <Message state={state} />
      <Submit pending={pending}>Create owner account</Submit>
    </form>
  );
}

export function ChangePasswordForm({ from, submitLabel = "Change password" }: { from?: "welcome"; submitLabel?: string }) {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="space-y-5">
      {from ? <input type="hidden" name="from" value={from} /> : null}
      <Input
        label={from ? "Temporary password" : "Current password"}
        name="current"
        type="password"
        autoComplete="current-password"
      />
      <Input label="New password" name="password" type="password" autoComplete="new-password" hint="At least 10 characters." />
      <Input label="Confirm new password" name="confirm" type="password" autoComplete="new-password" />
      <Message state={state} />
      <Submit pending={pending}>{submitLabel}</Submit>
    </form>
  );
}

export { Message as FormMessage, Submit as FormSubmit, Input as FormInput };

export function ProfileForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="space-y-5">
      <Input label="Your name" name="name" autoComplete="name" defaultValue={name} />
      <Message state={state} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null} Save name
      </button>
    </form>
  );
}
