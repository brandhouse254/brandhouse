import type { WorkCategory } from "./services";

/**
 * PORTFOLIO PROJECTS
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT: every project currently in this file is an ILLUSTRATIVE SAMPLE
 * (isSample: true). The brands are fictional and the visuals are concept
 * mock-ups made for this site. They show the kinds of work Brand House takes on and are
 * labelled as samples everywhere they appear.
 *
 * To add a real case study:
 *  1. Put images in /public/work/<slug>/ (JPG or WebP, ~2000px wide).
 *  2. Add an entry below with isSample: false.
 *  3. Only fill `client` if the client has approved being named.
 *  4. Only fill `outcome` with results the client has verified.
 *  5. Set showSampleProjects to false in src/config/site.ts when ready.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ProjectImage = { src: string; alt: string; width: number; height: number };

export type Project = {
  slug: string;
  title: string;
  /** Client name. Only set when the client has authorised being named. */
  client: string | null;
  /** True for illustrative samples / concepts. False for real client work. */
  isSample: boolean;
  industry: string;
  categories: WorkCategory[];
  services: string[];
  summary: string;
  brief: string;
  objectives: string[];
  creativeDirection: string;
  cover: ProjectImage;
  gallery: ProjectImage[];
  /** Optional self-hosted video (mp4) or a YouTube/Vimeo embed URL. */
  video?: { src: string; poster: string; title: string } | null;
  /** Verified outcome only. Leave null if results haven't been confirmed. */
  outcome: string | null;
  year?: string;
};

const img = (slug: string, n: number, alt: string): ProjectImage => ({
  src: `/media/${slug}-${n}.jpg`,
  alt,
  width: 1600,
  height: 1200,
});

/** Seed data: the starting content for the admin (see src/lib/cms/defaults.ts). */
export const seedProjects: Project[] = [
  {
    slug: "electric-vehicle-launch-film",
    title: "Launch film for an electric motorbike",
    client: null,
    isSample: true,
    industry: "Mobility",
    categories: ["film", "marketing"],
    services: ["Creative direction", "Commercial production", "Social cut-downs", "Paid social"],
    summary:
      "Sample concept: a 60-second launch film and social rollout for a fictional electric motorbike brand, Mlima Motors.",
    brief:
      "Introduce an electric motorbike to boda boda riders and fleet owners who are sceptical about range, charging and running costs.",
    objectives: [
      "Answer the three biggest objections inside the first 30 seconds",
      "Produce one hero film plus vertical cut-downs from a single shoot",
      "Give the sales team clips they can share on WhatsApp",
    ],
    creativeDirection:
      "Shot from dawn to dusk across one rider's working day, with on-screen counters showing distance and cost per kilometre. Warm, natural light and real streets rather than a studio.",
    cover: img("savanna-motors", 1, "Concept film frame: a rider on an empty road at sunrise, with an on-screen counter showing 87 km and KES 1.10 per km"),
    gallery: [
      img("savanna-motors", 2, "Six-frame storyboard for a 60-second launch film, from dawn departure to a dusk end card"),
      img("savanna-motors", 3, "Three vertical social cut-downs of the launch film for reels, stories and TikTok"),
    ],
    video: null,
    outcome: null,
  },
  {
    slug: "roastery-identity",
    title: "Identity for a speciality coffee roaster",
    client: null,
    isSample: true,
    industry: "Food & beverage",
    categories: ["branding"],
    services: ["Brand strategy", "Logo and identity", "Packaging design", "Brand guidelines"],
    summary:
      "Sample concept: brand strategy, identity and packaging for a fictional Kenyan coffee roaster, Tamu Roastery.",
    brief:
      "Position a small-batch roaster for cafés and retail shelves, and make the origin of every bean easy to read on pack.",
    objectives: [
      "A mark that works stamped, printed and embroidered",
      "A packaging system that scales to new origins without redesign",
      "Guidelines the café team can follow day to day",
    ],
    creativeDirection:
      "Earthy terracotta and charcoal, a heavy geometric wordmark and a modular label grid where each origin gets its own colour band.",
    cover: img("coastal-roastery", 1, "Three coffee bags on a terracotta background, each with the Tamu wordmark and a coloured origin band"),
    gallery: [
      img("coastal-roastery", 2, "Brand board with the Tamu wordmark, roundel stamp, colour palette, typefaces and origin colour bands"),
      img("coastal-roastery", 3, "Six origin labels in one grid, each with its own colour band, process, variety, altitude and tasting notes"),
    ],
    video: null,
    outcome: null,
  },
  {
    slug: "fintech-app-website",
    title: "Website for a savings app",
    client: null,
    isSample: true,
    industry: "Financial services",
    categories: ["web", "branding"],
    services: ["UX and interface design", "Website development", "Copywriting", "Analytics setup"],
    summary:
      "Sample concept: a marketing website and onboarding flow for a fictional savings app, Kijani Ledger.",
    brief:
      "Explain a group savings product clearly enough that a first-time visitor feels confident downloading the app.",
    objectives: [
      "Explain how the product works in three steps",
      "Answer trust and security questions before they are asked",
      "Keep pages light enough for mobile data",
    ],
    creativeDirection:
      "Calm greens, generous spacing and real interface screens rather than abstract illustration. Plain-language copy reviewed against the questions customers actually ask.",
    cover: img("kijani-finance", 1, "Savings app website hero beside a phone showing a group goal at 75 percent"),
    gallery: [
      img("kijani-finance", 2, "Three app screens: choosing a group type, a group goal, and a contribution confirmation"),
      img("kijani-finance", 3, "Website section explaining how the app works in three steps, with a list of common questions"),
    ],
    video: null,
    outcome: null,
  },
  {
    slug: "sneaker-drop-campaign",
    title: "Social campaign for a sneaker drop",
    client: null,
    isSample: true,
    industry: "Retail & fashion",
    categories: ["marketing", "film"],
    services: ["Campaign concept", "Short-form video", "Content calendar", "Paid social"],
    summary:
      "Sample concept: a four-week teaser and launch campaign for a fictional streetwear label, Mtaa Kicks.",
    brief:
      "Build anticipation for a limited release and sell through the first batch online.",
    objectives: [
      "A teaser-to-launch content arc across Instagram and TikTok",
      "Creator-led reels shot in a single production day",
      "Retargeting for people who engaged with the teasers",
    ],
    creativeDirection:
      "Bold orange and blue, fast cuts set to local producers' beats, and a countdown motif that carries from posts to the product page.",
    cover: img("mtaa-sneakers", 1, "Nine-post social grid counting down to a sneaker drop in orange, blue and black"),
    gallery: [
      img("mtaa-sneakers", 2, "Three Instagram story frames: teaser, 24-hour countdown and launch"),
      img("mtaa-sneakers", 3, "Product page for the Jua Low sneaker with a drop countdown, size picker and price"),
    ],
    video: null,
    outcome: null,
  },
  {
    slug: "skincare-product-film",
    title: "Product film and stills for a skincare line",
    client: null,
    isSample: true,
    industry: "Beauty",
    categories: ["film", "branding"],
    services: ["Product photography", "Product film", "Art direction"],
    summary:
      "Sample concept: tabletop product film and e-commerce photography for a fictional botanical skincare brand, Nuru Botanics.",
    brief:
      "Show texture, ingredients and results with a premium feel, and supply images sized for the online store and marketplaces.",
    objectives: [
      "A 30-second product film and six 6-second loops",
      "Consistent pack shots on white and in context",
      "Macro footage of textures for ads",
    ],
    creativeDirection:
      "Soft sand tones, slow macro movement and natural window light. Every frame cropped to work square, vertical and widescreen.",
    cover: img("nuru-skincare", 1, "Product still of an amber dropper bottle, a body butter jar and a tube on a sand-coloured tabletop"),
    gallery: [
      img("nuru-skincare", 2, "Online store product page for Baobab Seed Face Oil with price, sizes and ingredients"),
      img("nuru-skincare", 3, "Grid of six-second loop frames with dashed guides for square and vertical crops"),
    ],
    video: null,
    outcome: null,
  },
  {
    slug: "construction-rebrand",
    title: "Rebrand and website for a construction firm",
    client: null,
    isSample: true,
    industry: "Construction",
    categories: ["branding", "web"],
    services: ["Rebranding", "Signage and vehicle livery", "Website design", "Photography"],
    summary:
      "Sample concept: a rebrand, site signage and project-led website for a fictional building contractor, Jenga Works.",
    brief:
      "Move from a word-of-mouth business to one that wins larger commercial tenders.",
    objectives: [
      "An identity that looks as dependable as the work",
      "A website organised around completed projects",
      "Hoarding and vehicle designs that act as advertising",
    ],
    creativeDirection:
      "Safety amber with charcoal, a sturdy condensed wordmark and photography of real sites and crews.",
    cover: img("jenga-build", 1, "Amber site hoarding with the Jenga Works wordmark and a panel describing the current project"),
    gallery: [
      img("jenga-build", 2, "Side view of a pickup truck in Jenga Works amber and steel livery, with colour swatches"),
      img("jenga-build", 3, "Projects page of the Jenga Works website with commercial, residential and civil project cards"),
    ],
    video: null,
    outcome: null,
  },
];
