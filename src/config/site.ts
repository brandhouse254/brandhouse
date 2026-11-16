/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  BRAND HOUSE — CENTRAL SITE CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Edit business details here. Everything on the site (header, footer, contact
 *  page, structured data, metadata) reads from this file.
 *
 *  Rules:
 *  - Leave a value as an empty string ("") if you don't have it yet. Empty
 *    values are hidden on the site rather than shown as fake details.
 *  - Never put secrets (API keys, passwords) in this file. It ships to the
 *    browser. Secrets belong in environment variables (see .env.example).
 *
 *  Service descriptions live in  src/content/services.ts
 *  Portfolio projects live in    src/content/projects.ts
 *  Testimonials live in          src/content/testimonials.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const siteConfig = {
  name: "Brand House",
  descriptor: "A Creative, Media & Digital Agency",
  /** Production domain. Used for canonical URLs, sitemap and Open Graph. */
  domain: "brandhouse.co.ke",
  /**
   * Absolute site address used for canonical links, the sitemap and social
   * previews. Order: NEXT_PUBLIC_SITE_URL if set, otherwise the project's
   * production domain on Vercel (Vercel switches this to brandhouse.co.ke
   * automatically once the domain is connected), otherwise brandhouse.co.ke.
   */
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "https://brandhouse.co.ke"
  ).replace(/\/$/, ""),
  locale: "en_KE",
  language: "en",

  /** Short statement used in the footer and default meta description. */
  statement:
    "Brand House builds brands, produces film and photography, designs websites and runs digital campaigns for businesses in Kenya and beyond.",

  contact: {
    // Public enquiries address. NEXT_PUBLIC_CONTACT_EMAIL overrides it if set.
    email: (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "brandhouse254@gmail.com") as string,
    // Public phone number in international format.
    phone: "+254 740 953007" as string,
    // WhatsApp number in international format, digits only (powers the floating chat button).
    whatsapp: "254740953007" as string,
    whatsappMessage: "Hi Brand House, I'd like to talk about a project." as string,
    // TODO(owner): add only if you want a location shown publicly, e.g. "Nairobi, Kenya".
    location: "" as string,
  },

  /**
   * TODO(owner): add real profile URLs. Empty entries are not rendered.
   */
  social: [
    { label: "Instagram", href: "" as string },
    { label: "LinkedIn", href: "" as string },
    { label: "TikTok", href: "" as string },
    { label: "YouTube", href: "" as string },
    { label: "X", href: "" as string },
  ],

  nav: [
    { label: "Work", href: "/work" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  cta: {
    primary: { label: "Start a project", href: "/contact" },
    work: { label: "Explore our work", href: "/work" },
    email: "Email Brand House",
  },

  /**
   * Show the illustrative sample projects in the portfolio. Set to false once
   * real case studies have been added to src/content/projects.ts.
   */
  showSampleProjects: true as boolean,
} as const;

/** Options for the project enquiry form. Edit freely. */
export const enquiryOptions = {
  budgets: [
    "Under KES 150,000",
    "KES 150,000 – 500,000",
    "KES 500,000 – 1,500,000",
    "KES 1,500,000 – 5,000,000",
    "Over KES 5,000,000",
    "Not sure yet",
  ],
  timelines: [
    "As soon as possible",
    "Within 1 month",
    "1 – 3 months",
    "3 – 6 months",
    "Flexible",
  ],
  referralSources: [
    "Search engine",
    "Instagram",
    "LinkedIn",
    "TikTok",
    "Referral from someone",
    "Saw our work",
    "Other",
  ],
} as const;

export const activeSocialLinks = siteConfig.social.filter((s) => s.href.trim() !== "");
