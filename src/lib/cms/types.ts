/**
 * Shapes of everything the admin can edit. The whole site's editable content
 * lives in one document (SiteContent), stored in Vercel Blob and validated by
 * the zod schema in ./schema.ts on every save.
 */

export type WorkCategory = "branding" | "film" | "web" | "marketing";

export const workCategories: WorkCategory[] = ["branding", "film", "web", "marketing"];

export const workCategoryLabels: Record<WorkCategory, string> = {
  branding: "Branding",
  film: "Film & Production",
  web: "Web & Digital",
  marketing: "Marketing Campaigns",
};

export type Media = { src: string; alt: string };

export type ProjectImage = Media & { width: number; height: number };

export type TitleBody = { title: string; body: string };

export type Link = { label: string; href: string };

/** One photo in the moving reel beside the homepage headline. */
export type ReelFrame = Media & { label: string };

export type HeroContent = {
  eyebrow: string;
  line1: string;
  line2: string;
  lead: string;
  primaryCta: Link;
  secondaryCta: Link;
  /** Still image. Always shown first, and used as the video poster. */
  image: Media;
  /** Optional background video (mp4 or webm). Muted and looped. */
  video: { src: string; type: string } | null;
  /** Small frozen timecode shown top-right of the hero. Empty hides it. */
  timecode: string;
  /** Photos that drift past in the hero reel (shown in three columns). */
  reel: ReelFrame[];
  /** Words that rotate after "We make" on the reel. */
  making: string[];
  /** Words in the running ticker under the hero. Empty uses the service names. */
  ticker: string[];
};

export type IntroFact = TitleBody & { image: Media | null };

export type IntroContent = { title: string; statement: string; facts: IntroFact[] };

export type DifferenceContent = { title: string; lead: string; image: Media; points: TitleBody[] };

export type AboutContent = {
  title: string;
  intro: string;
  image: Media;
  purposeTitle: string;
  purposeParagraphs: string[];
  approachTitle: string;
  approachLeft: string;
  approachRight: string;
  divisionsTitle: string;
  divisionsIntro: string;
  valuesTitle: string;
  values: TitleBody[];
  ctaTitle: string;
  ctaBody: string;
};

export type Settings = {
  descriptor: string;
  statement: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    whatsappMessage: string;
    location: string;
  };
  social: Link[];
  /** Show the illustrative sample projects alongside real ones. */
  showSampleProjects: boolean;
};

export type Service = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  headline: string;
  intro: string;
  capabilities: string[];
  deliverables: string[];
  projectTypes: string[];
  value: TitleBody[];
  processNotes: [string, string, string, string];
  workCategory: WorkCategory;
  image: Media;
  /** One line on how this division connects to the others (About page). */
  aboutNote: string;
  meta: { title: string; description: string };
};

export type Project = {
  slug: string;
  title: string;
  /** Hidden from the public site while false. */
  published: boolean;
  client: string | null;
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
  /** Self-hosted mp4/webm, or a YouTube / Vimeo link. */
  video: { src: string; poster: string; title: string } | null;
  outcome: string | null;
  year?: string;
  /** Shown in the homepage "Made to be noticed" showcase. */
  featured: boolean;
  /** How the cover is presented on cards. */
  frame: ProjectFrame;
  /** Short line used inside mock-up frames (the ad text, the website headline). */
  tagline: string;
  /** Optional outside link: the live website, a YouTube video, an Instagram post. */
  link: Link | null;
};

/** How a project's cover is presented on cards: a plain photo or inside a mock-up. */
export type ProjectFrame = "photo" | "ad" | "phone" | "browser" | "film";

export const projectFrames: ProjectFrame[] = ["photo", "ad", "phone", "browser", "film"];

export const projectFrameLabels: Record<ProjectFrame, string> = {
  photo: "Photo",
  ad: "Social ad",
  phone: "Phone screen",
  browser: "Website in a browser",
  film: "Film with play button",
};

/** Headings and copy for page sections that aren't tied to one piece of content. */
export type PagesContent = {
  home: {
    workTitle: string;
    workLead: string;
    servicesTitle: string;
    servicesLead: string;
    processTitle: string;
    processLead: string;
    testimonialsTitle: string;
  };
  work: { title: string; intro: string };
  services: { title: string; intro: string };
  contact: { title: string; intro: string; steps: TitleBody[] };
  cta: { title: string; body: string; buttonLabel: string };
};

export type Testimonial = { quote: string; name: string; role: string; company: string };

export type SiteContent = {
  version: 1;
  settings: Settings;
  hero: HeroContent;
  intro: IntroContent;
  difference: DifferenceContent;
  about: AboutContent;
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  pages: PagesContent;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type ContentSection = Exclude<keyof SiteContent, "version" | "updatedAt" | "updatedBy">;
