import { z } from "zod";
import { workCategories } from "./types";

/**
 * Validation for every save from the admin. Keeps the stored document in the
 * exact shape the public pages expect, so a bad edit can never break the site.
 */

const text = (max: number, label = "This field") =>
  z.string().trim().max(max, { error: `${label} must be under ${max} characters.` });
const required = (max: number, label: string) =>
  text(max, label).min(1, { error: `${label} can't be empty.` });

/** Site-relative paths (/media/x.jpg) or https URLs only. */
const src = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//i.test(v), {
    error: "Use an uploaded file or a link starting with https://",
  });

const requiredSrc = src.refine((v) => v !== "", { error: "Choose an image." });

const href = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^(https?:|mailto:|tel:)/i.test(v), {
    error: "Links must start with /, https://, mailto: or tel:",
  });

const media = z.object({ src: requiredSrc, alt: text(400, "Image description") });
const projectImage = media.extend({
  width: z.number().int().positive().max(20000).default(1600),
  height: z.number().int().positive().max(20000).default(1200),
});
const titleBody = z.object({ title: required(160, "Title"), body: text(1200, "Text") });
const link = z.object({ label: required(60, "Button label"), href: href.refine((v) => v !== "", { error: "Add a link." }) });

const slug = z
  .string()
  .trim()
  .min(2, { error: "The web address needs at least 2 characters." })
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "Use lowercase letters, numbers and dashes only." });

const lines = (maxItems: number, maxLen = 240) => z.array(required(maxLen, "Item")).max(maxItems);

export const settingsSchema = z.object({
  descriptor: required(120, "Tagline"),
  statement: required(400, "Short description"),
  contact: z.object({
    email: z.union([z.literal(""), z.email({ error: "Enter a valid email address." })]),
    phone: text(40, "Phone"),
    whatsapp: z.string().trim().regex(/^\d{0,15}$/, { error: "WhatsApp number: digits only, with country code, e.g. 254740953007." }),
    whatsappMessage: text(300, "WhatsApp message"),
    location: text(120, "Location"),
  }),
  social: z
    .array(
      z.object({
        label: required(40, "Network name"),
        href: z
          .string()
          .trim()
          .max(500)
          .refine((v) => v === "" || /^https:\/\//i.test(v), { error: "Social links must start with https://" }),
      }),
    )
    .max(12),
  showSampleProjects: z.boolean(),
});

export const heroSchema = z.object({
  eyebrow: text(120, "Small heading"),
  line1: required(60, "Headline line 1"),
  line2: text(60, "Headline line 2"),
  lead: text(400, "Intro text"),
  primaryCta: link,
  secondaryCta: link,
  image: media,
  video: z.object({ src: requiredSrc, type: z.enum(["video/mp4", "video/webm"]) }).nullable(),
  timecode: text(20, "Timecode"),
});

export const introSchema = z.object({
  title: required(160, "Heading"),
  statement: text(600, "Statement"),
  facts: z.array(titleBody).max(6),
});

export const differenceSchema = z.object({
  title: required(160, "Heading"),
  lead: text(600, "Intro text"),
  points: z.array(titleBody).max(10),
});

export const aboutSchema = z.object({
  title: required(200, "Page heading"),
  intro: text(800, "Intro"),
  image: media,
  purposeTitle: required(120, "Heading"),
  purposeParagraphs: z.array(required(1500, "Paragraph")).max(6),
  approachTitle: required(160, "Heading"),
  approachLeft: text(1500, "Text"),
  approachRight: text(1500, "Text"),
  divisionsTitle: required(160, "Heading"),
  divisionsIntro: text(600, "Intro"),
  valuesTitle: required(120, "Heading"),
  values: z.array(titleBody).max(8),
  ctaTitle: required(160, "Call-to-action heading"),
  ctaBody: text(400, "Call-to-action text"),
});

export const serviceSchema = z.object({
  slug,
  number: text(4, "Number"),
  title: required(80, "Service name"),
  summary: required(400, "Summary"),
  headline: required(200, "Page headline"),
  intro: required(1200, "Intro"),
  capabilities: lines(16),
  deliverables: lines(16),
  projectTypes: lines(12),
  value: z.array(titleBody).max(6),
  processNotes: z.tuple([text(400), text(400), text(400), text(400)]),
  workCategory: z.enum(workCategories),
  image: media,
  aboutNote: text(300, "About page note"),
  meta: z.object({ title: required(120, "Search title"), description: required(300, "Search description") }),
});

export const projectSchema = z.object({
  slug,
  title: required(160, "Project title"),
  published: z.boolean(),
  client: z
    .string()
    .trim()
    .max(120)
    .nullable()
    .transform((v) => (v ? v : null)),
  isSample: z.boolean(),
  industry: text(80, "Industry"),
  categories: z.array(z.enum(workCategories)).min(1, { error: "Pick at least one discipline." }),
  services: lines(10, 80),
  summary: required(600, "Summary"),
  brief: text(1500, "Brief"),
  objectives: lines(10, 300),
  creativeDirection: text(1500, "Creative direction"),
  cover: projectImage,
  gallery: z.array(projectImage).max(24),
  video: z
    .object({ src: requiredSrc, poster: src, title: text(160, "Video title") })
    .nullable(),
  outcome: z
    .string()
    .trim()
    .max(1200)
    .nullable()
    .transform((v) => (v ? v : null)),
  year: z.string().trim().max(10).optional(),
});

export const testimonialSchema = z.object({
  quote: required(800, "Quote"),
  name: required(80, "Name"),
  role: text(80, "Role"),
  company: text(120, "Company"),
});

const uniqueSlugs = <T extends { slug: string }>(items: T[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>();
  items.forEach((item, i) => {
    if (seen.has(item.slug)) {
      ctx.addIssue({ code: "custom", path: [i, "slug"], message: `The web address "${item.slug}" is used twice.` });
    }
    seen.add(item.slug);
  });
};

export const sectionSchemas = {
  settings: settingsSchema,
  hero: heroSchema,
  intro: introSchema,
  difference: differenceSchema,
  about: aboutSchema,
  services: z.array(serviceSchema).min(1, { error: "Keep at least one service." }).max(12).superRefine(uniqueSlugs),
  projects: z.array(projectSchema).max(200).superRefine(uniqueSlugs),
  testimonials: z.array(testimonialSchema).max(30),
} as const;

export type SectionKey = keyof typeof sectionSchemas;

/** First readable error message, with where it happened. */
export function describeIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Something in this form isn't valid.";
  const where = issue.path
    .map((p) => (typeof p === "number" ? `#${p + 1}` : String(p)))
    .join(" › ");
  return where ? `${issue.message} (${where})` : issue.message;
}
