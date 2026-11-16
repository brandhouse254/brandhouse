"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { enquiryOptions } from "@/config/site";
import {
  enquirySchema,
  NOT_SURE,
  toFieldErrors,
  type ContactApiResponse,
  type Enquiry,
  type FieldErrors,
} from "@/lib/contact-schema";
import { cn } from "@/lib/cn";

type Values = {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  services: string[];
  budget: string;
  timeline: string;
  description: string;
  referral: string;
};

const empty: Values = {
  name: "",
  organisation: "",
  email: "",
  phone: "",
  services: [],
  budget: "",
  timeline: "",
  description: "",
  referral: "",
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string; code?: string };

const fieldOrder: (keyof Enquiry)[] = [
  "name",
  "organisation",
  "email",
  "phone",
  "services",
  "budget",
  "timeline",
  "description",
  "referral",
];

const inputBase =
  "mt-2 block w-full rounded-none border bg-white px-4 py-3.5 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-accent";

type ContactFormProps = {
  /** Services offered in the form, from the admin. */
  services: { slug: string; title: string }[];
  /** Public email shown as a fallback if sending fails. */
  email: string;
};

export function ContactForm({ services, email }: ContactFormProps) {
  const serviceChoices = [...services.map((s) => s.title), NOT_SURE];
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // The services list only needs reading once, on mount.
  const servicesRef = useRef(services);

  useEffect(() => {
    startedAt.current = Date.now();
    // Preselect a service when arriving from a service page (?service=branding).
    // Read after hydration so the statically rendered form matches the server HTML.
    const slug = new URLSearchParams(window.location.search).get("service");
    const match = servicesRef.current.find((s) => s.slug === slug);
    if (!match) return;
    const id = requestAnimationFrame(() =>
      setValues((v) => (v.services.length ? v : { ...v, services: [match.title] })),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const validate = (v: Values) => {
    const r = enquirySchema.safeParse(v);
    return r.success ? {} : toFieldErrors(r.error);
  };

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key] || errors[key as keyof Enquiry]) {
      const e = validate(next);
      setErrors((prev) => ({ ...prev, [key]: e[key as keyof Enquiry] }));
    }
  };

  const blur = (key: keyof Values) => {
    setTouched((t) => ({ ...t, [key]: true }));
    const e = validate(values);
    setErrors((prev) => ({ ...prev, [key]: e[key as keyof Enquiry] }));
  };

  const toggleService = (title: string) => {
    const has = values.services.includes(title);
    update("services", has ? values.services.filter((s) => s !== title) : [...values.services, title]);
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = fieldOrder.find((k) => errs[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    el?.focus();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;

    const errs = validate(values);
    setErrors(errs);
    setTouched(Object.fromEntries(fieldOrder.map((k) => [k, true])));
    if (Object.keys(errs).length) {
      setStatus({ kind: "idle" });
      focusFirstError(errs);
      return;
    }

    const honeypot = (formRef.current?.elements.namedItem("company_website") as HTMLInputElement | null)?.value ?? "";

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company_website: honeypot, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => null)) as ContactApiResponse | null;

      if (res.ok && data?.ok) {
        setStatus({ kind: "success" });
        setValues(empty);
        setTouched({});
        requestAnimationFrame(() => resultRef.current?.focus());
        return;
      }
      if (data && !data.ok) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
          focusFirstError(data.fieldErrors);
        }
        setStatus({ kind: "error", message: data.message, code: data.code });
      } else {
        setStatus({ kind: "error", message: "Something went wrong and your enquiry was not sent. Try again in a minute." });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Your enquiry could not be sent. Check your internet connection and try again.",
      });
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  if (status.kind === "success") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="bg-ink p-8 text-white focus:outline-none md:p-12">
        <span aria-hidden className="block size-3 bg-accent" />
        <h2 className="type-h2 mt-8">Enquiry sent.</h2>
        <p className="type-lead mt-4 max-w-[40ch] text-white/75">
          Thank you. Your project details have reached the Brand House team, and we will reply to the email address
          you gave us.
        </p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus({ kind: "idle" });
          }}
          className="mt-8 inline-flex min-h-11 items-center font-display font-medium underline decoration-white/30 underline-offset-[6px] hover:decoration-white"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const err = (k: keyof Enquiry) => (touched[k] || status.kind === "error" ? errors[k] : undefined);
  const describedBy = (k: keyof Enquiry, hint?: boolean) =>
    [hint ? `${k}-hint` : null, err(k) ? `${k}-error` : null].filter(Boolean).join(" ") || undefined;

  const errorText = (k: keyof Enquiry) =>
    err(k) ? (
      <p id={`${k}-error`} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-[#B3261E]">
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        {err(k)}
      </p>
    ) : null;

  const borderFor = (k: keyof Enquiry) => (err(k) ? "border-[#B3261E]" : "border-ink/20 hover:border-ink/40");
  const errorCount = fieldOrder.filter((k) => err(k)).length;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="form-note" className="space-y-8">
      <p id="form-note" className="text-sm text-mute-2">
        Fields marked <span aria-hidden>*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {status.kind === "error" ? (
        <div
          ref={resultRef}
          tabIndex={-1}
          role="alert"
          className="border-l-4 border-[#B3261E] bg-white p-5 focus:outline-none"
        >
          <p className="font-display font-semibold">
            {status.code === "validation" || errorCount ? "Check the highlighted fields." : "Your enquiry was not sent."}
          </p>
          <p className="mt-1 text-ink/80">{status.message}</p>
          {status.code === "not_configured" || status.code === "delivery_failed" ? (
            email ? (
              <p className="mt-2 text-ink/80">
                Email us directly at{" "}
                <a className="font-medium underline underline-offset-4" href={`mailto:${email}`}>
                  {email}
                </a>
                .
              </p>
            ) : null
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-display font-medium">
            Your name <span aria-hidden>*</span>
          </label>
          <input
            id="name"
            data-field="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={Boolean(err("name"))}
            aria-describedby={describedBy("name")}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => blur("name")}
            className={cn(inputBase, borderFor("name"))}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="organisation" className="font-display font-medium">
            Business or organisation <span aria-hidden>*</span>
          </label>
          <input
            id="organisation"
            data-field="organisation"
            name="organisation"
            type="text"
            autoComplete="organization"
            required
            aria-required="true"
            aria-invalid={Boolean(err("organisation"))}
            aria-describedby={describedBy("organisation")}
            value={values.organisation}
            onChange={(e) => update("organisation", e.target.value)}
            onBlur={() => blur("organisation")}
            className={cn(inputBase, borderFor("organisation"))}
          />
          {errorText("organisation")}
        </div>
        <div>
          <label htmlFor="email" className="font-display font-medium">
            Email address <span aria-hidden>*</span>
          </label>
          <input
            id="email"
            data-field="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={Boolean(err("email"))}
            aria-describedby={describedBy("email")}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => blur("email")}
            className={cn(inputBase, borderFor("email"))}
          />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor="phone" className="font-display font-medium">
            Phone number <span className="font-sans font-normal text-mute-2">(optional)</span>
          </label>
          <input
            id="phone"
            data-field="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(err("phone"))}
            aria-describedby={describedBy("phone")}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => blur("phone")}
            className={cn(inputBase, borderFor("phone"))}
          />
          {errorText("phone")}
        </div>
      </div>

      <fieldset aria-describedby={describedBy("services", true)}>
        <legend className="font-display font-medium">
          What do you need help with? <span aria-hidden>*</span>
        </legend>
        <p id="services-hint" className="mt-1 text-sm text-mute-2">
          Choose all that apply.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {serviceChoices.map((title, i) => {
            const on = values.services.includes(title);
            const id = `service-${i}`;
            return (
              <div key={title}>
                <input
                  id={id}
                  type="checkbox"
                  name="services"
                  value={title}
                  checked={on}
                  data-field={i === 0 ? "services" : undefined}
                  onChange={() => toggleService(title)}
                  onBlur={() => blur("services")}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className={cn(
                    "inline-flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-full border px-4 text-[0.95rem] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                    on ? "border-ink bg-ink text-white" : "border-ink/25 bg-white hover:border-ink",
                    err("services") && !on && "border-[#B3261E]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn("size-2 rounded-full transition-colors", on ? "bg-accent" : "bg-ink/20")}
                  />
                  {title}
                </label>
              </div>
            );
          })}
        </div>
        {errorText("services")}
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="budget" className="font-display font-medium">
            Project budget <span aria-hidden>*</span>
          </label>
          <select
            id="budget"
            data-field="budget"
            name="budget"
            required
            aria-required="true"
            aria-invalid={Boolean(err("budget"))}
            aria-describedby={describedBy("budget")}
            value={values.budget}
            onChange={(e) => update("budget", e.target.value)}
            onBlur={() => blur("budget")}
            className={cn(inputBase, "appearance-none bg-[url('/brand/chevron.svg')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10", borderFor("budget"))}
          >
            <option value="" disabled>
              Choose a range
            </option>
            {enquiryOptions.budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {errorText("budget")}
        </div>
        <div>
          <label htmlFor="timeline" className="font-display font-medium">
            Expected timeline <span aria-hidden>*</span>
          </label>
          <select
            id="timeline"
            data-field="timeline"
            name="timeline"
            required
            aria-required="true"
            aria-invalid={Boolean(err("timeline"))}
            aria-describedby={describedBy("timeline")}
            value={values.timeline}
            onChange={(e) => update("timeline", e.target.value)}
            onBlur={() => blur("timeline")}
            className={cn(inputBase, "appearance-none bg-[url('/brand/chevron.svg')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10", borderFor("timeline"))}
          >
            <option value="" disabled>
              Choose a timeline
            </option>
            {enquiryOptions.timelines.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errorText("timeline")}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="font-display font-medium">
          Tell us about the project <span aria-hidden>*</span>
        </label>
        <p id="description-hint" className="mt-1 text-sm text-mute-2">
          What you want to achieve, who it is for, and anything you already have in place.
        </p>
        <textarea
          id="description"
          data-field="description"
          name="description"
          rows={7}
          required
          aria-required="true"
          aria-invalid={Boolean(err("description"))}
          aria-describedby={describedBy("description", true)}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          onBlur={() => blur("description")}
          className={cn(inputBase, "resize-y", borderFor("description"))}
        />
        {errorText("description")}
      </div>

      <div className="sm:max-w-[calc(50%-1rem)]">
        <label htmlFor="referral" className="font-display font-medium">
          How did you hear about us? <span className="font-sans font-normal text-mute-2">(optional)</span>
        </label>
        <select
          id="referral"
          data-field="referral"
          name="referral"
          value={values.referral}
          onChange={(e) => update("referral", e.target.value)}
          className={cn(inputBase, "appearance-none bg-[url('/brand/chevron.svg')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10", "border-ink/20 hover:border-ink/40")}
        >
          <option value="">Prefer not to say</option>
          {enquiryOptions.referralSources.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot: hidden from people and screen readers. Bots that fill it are rejected. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="flex flex-col gap-4 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-sm text-mute-2">
          We use these details only to reply to your enquiry. See our{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-ink">
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          aria-disabled={status.kind === "submitting"}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-accent px-8 font-display text-lg font-medium text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-wait disabled:opacity-80"
        >
          {status.kind === "submitting" ? (
            <>
              <LoaderCircle aria-hidden className="size-5 animate-spin" />
              Sending enquiry…
            </>
          ) : (
            "Send enquiry"
          )}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {status.kind === "submitting" ? "Sending your enquiry" : ""}
      </p>
    </form>
  );
}
