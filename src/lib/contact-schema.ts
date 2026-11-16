import { z } from "zod";
import { enquiryOptions } from "@/config/site";

/** "Not sure yet" is always offered after the services listed in the admin. */
export const NOT_SURE = "Not sure yet";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Keep this under ${max} characters.` })
    .optional()
    .default("");

export const enquirySchema = z.object({
  name: z
    .string({ error: "Enter your name." })
    .trim()
    .min(2, { error: "Enter your name." })
    .max(120, { error: "Keep your name under 120 characters." }),
  organisation: z
    .string({ error: "Enter your business or organisation name." })
    .trim()
    .min(2, { error: "Enter your business or organisation name." })
    .max(160, { error: "Keep this under 160 characters." }),
  email: z
    .string({ error: "Enter your email address." })
    .trim()
    .min(1, { error: "Enter your email address." })
    .pipe(z.email({ error: "Enter a valid email address, like name@company.co.ke." })),
  phone: optionalText(40).refine((v) => v === "" || /^[+()\d\s-]{7,40}$/.test(v), {
    error: "Enter a phone number using digits, spaces, + or -.",
  }),
  // Service names come from the admin, so they're checked for shape rather than against a fixed list.
  services: z
    .array(z.string().trim().min(1).max(120), { error: "Choose at least one service." })
    .min(1, { error: "Choose at least one service." })
    .max(13),
  budget: z.enum(enquiryOptions.budgets, { error: "Choose a budget range." }),
  timeline: z.enum(enquiryOptions.timelines, { error: "Choose a timeline." }),
  description: z
    .string({ error: "Tell us a little about the project." })
    .trim()
    .min(20, { error: "Tell us a little more about the project (at least 20 characters)." })
    .max(5000, { error: "Keep the description under 5,000 characters." }),
  referral: z.union([z.enum(enquiryOptions.referralSources), z.literal("")]).optional().default(""),
});

export type Enquiry = z.infer<typeof enquirySchema>;

/** Anti-spam fields sent alongside the enquiry. */
export const spamFieldsSchema = z.object({
  /** Honeypot. Hidden from people; bots tend to fill it. Must stay empty. */
  company_website: z.string().optional().default(""),
  /** Timestamp (ms) when the form was first rendered in the browser. */
  startedAt: z.coerce.number().optional(),
});

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Enquiry | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export type ContactApiResponse =
  | { ok: true }
  | {
      ok: false;
      code: "validation" | "spam" | "not_configured" | "delivery_failed" | "rate_limited" | "bad_request";
      message: string;
      fieldErrors?: FieldErrors;
    };
