/**
 * Service divisions. Each entry powers the homepage services section, the
 * /services overview and its own page at /services/[slug].
 */

export type WorkCategory = "branding" | "film" | "web" | "marketing";

export type Service = {
  slug: "branding" | "video-production" | "web-development" | "digital-marketing";
  number: string;
  title: string;
  /** One-line description used in cards and lists. */
  summary: string;
  /** Hero headline on the service page. */
  headline: string;
  intro: string;
  capabilities: string[];
  deliverables: string[];
  projectTypes: string[];
  /** Why this service matters to a business. */
  value: { title: string; body: string }[];
  /** How the shared four-stage process plays out for this service. */
  processNotes: [string, string, string, string];
  workCategory: WorkCategory;
  image: { src: string; alt: string };
  meta: { title: string; description: string };
};

export const services: Service[] = [
  {
    slug: "branding",
    number: "01",
    title: "Brand & Identity",
    summary:
      "Positioning, naming support, logos and visual systems that make a business recognisable and easy to choose.",
    headline: "Make your business recognisable before anyone reads a word.",
    intro:
      "A brand is the sum of every impression a customer forms about you. We help you decide what those impressions should be, then design an identity that delivers them consistently, from a business card to a billboard.",
    capabilities: [
      "Brand strategy and positioning",
      "Logo design and visual identity",
      "Brand guidelines",
      "Rebranding",
      "Graphic design",
      "Campaign creative development",
    ],
    deliverables: [
      "Positioning and messaging framework",
      "Primary logo, secondary marks and favicon",
      "Colour, typography and image direction",
      "Brand guidelines document",
      "Stationery, social templates and signage files",
      "Launch creative for your first campaign",
    ],
    projectTypes: [
      "New business identity",
      "Rebrand for a growing company",
      "Product or sub-brand launch",
      "Brand refresh before a funding round or expansion",
    ],
    value: [
      {
        title: "Clarity for customers",
        body: "People understand what you offer and why it suits them, faster.",
      },
      {
        title: "Consistency for your team",
        body: "Guidelines let staff and suppliers produce on-brand material without guesswork.",
      },
      {
        title: "A foundation for everything else",
        body: "Film, web and campaigns all work harder when they share one identity.",
      },
    ],
    processNotes: [
      "Workshops and interviews to understand your market, customers and ambitions.",
      "A positioning statement and two or three creative routes to choose from.",
      "The chosen route developed into a full identity system.",
      "Guidelines, files and launch support, plus a review once the brand is live.",
    ],
    workCategory: "branding",
    image: {
      src: "/media/service-brand.jpg",
      alt: "Brand board for a sample solar brand: the sun-and-horizon logo, business cards, a battery app screen, colour palette, typefaces and a billboard",
    },
    meta: {
      title: "Brand Identity & Logo Design in Kenya",
      description:
        "Brand strategy, logo design, visual identity and brand guidelines for businesses in Kenya and beyond. Build a brand people recognise and trust.",
    },
  },
  {
    slug: "video-production",
    number: "02",
    title: "Film & Media Production",
    summary:
      "Commercials, brand films, product ads, reels and photography, from concept and script to final grade.",
    headline: "Stories on screen that people actually watch.",
    intro:
      "Video is often the first place a customer meets your brand. We handle the whole production: the idea, the script, the shoot, the edit and the versions you need for every platform, so the work looks considered wherever it appears.",
    capabilities: [
      "Commercial video production",
      "Promotional videos",
      "Product advertising",
      "Brand films",
      "Social media reels and short-form video",
      "Photography",
      "Creative direction and storytelling",
      "Video editing and post-production",
    ],
    deliverables: [
      "Creative concept, script and storyboard",
      "Shoot planning, casting and location scouting",
      "Production crew and equipment",
      "Edit, colour grade, sound design and motion graphics",
      "Cut-downs for TV, YouTube, Instagram, TikTok and LinkedIn",
      "Campaign and product photography",
    ],
    projectTypes: [
      "TV and online commercials",
      "Brand and company films",
      "Product launch videos",
      "Monthly short-form content for social",
      "Event and documentary-style coverage",
    ],
    value: [
      {
        title: "Built for attention",
        body: "Openings, pacing and formats planned around how each platform is actually watched.",
      },
      {
        title: "One shoot, many assets",
        body: "We plan productions so a single shoot day feeds your ads, website and social feeds.",
      },
      {
        title: "On-brand by default",
        body: "The same team that understands your identity directs the camera.",
      },
    ],
    processNotes: [
      "A briefing session on your audience, message, platforms and budget.",
      "Concept, script, storyboard and production schedule for sign-off.",
      "Pre-production, the shoot, then editing, grading and sound.",
      "Delivery in every format you need, with notes on how each cut should be used.",
    ],
    workCategory: "film",
    image: {
      src: "/media/service-film.jpg",
      alt: "Abstract placeholder of warm out-of-focus light with an anamorphic lens flare",
    },
    meta: {
      title: "Video Production & Commercials in Kenya",
      description:
        "Commercial video production, brand films, product ads, social reels and photography. Concept to final edit by the Brand House production team.",
    },
  },
  {
    slug: "web-development",
    number: "03",
    title: "Web & Digital Experiences",
    summary:
      "Websites, landing pages and online stores designed around your customers and built to load fast.",
    headline: "A website that explains, persuades and keeps working.",
    intro:
      "Your website is where interest becomes an enquiry or a sale. We design and build sites that make your offer easy to understand, work well on the phones most of your visitors use, and are simple for your team to update.",
    capabilities: [
      "Business websites",
      "Landing pages",
      "E-commerce websites",
      "Website redesigns",
      "Website development",
      "User experience and interface design",
      "Website maintenance",
      "Conversion-focused digital experiences",
    ],
    deliverables: [
      "Site map, content plan and wireframes",
      "Visual design for mobile and desktop",
      "Development, content entry and testing",
      "Search engine foundations and analytics setup",
      "Payment and enquiry integrations, including M-Pesa where needed",
      "Training, handover and optional maintenance",
    ],
    projectTypes: [
      "Company and service websites",
      "Campaign and product landing pages",
      "Online stores",
      "Redesigns of slow or outdated sites",
    ],
    value: [
      {
        title: "Designed for real behaviour",
        body: "Layouts and journeys based on how your customers search, compare and decide.",
      },
      {
        title: "Fast on real networks",
        body: "Lean pages and optimised media that hold up on mobile data, not just office Wi-Fi.",
      },
      {
        title: "Yours to run",
        body: "Clear handover so your team can update content without calling a developer.",
      },
    ],
    processNotes: [
      "Discovery of your goals, audiences, content and any existing analytics.",
      "Site structure, wireframes and the key user journeys agreed up front.",
      "Design, development and content, reviewed on a live staging link.",
      "Launch, monitoring, and recommendations from early visitor data.",
    ],
    workCategory: "web",
    image: {
      src: "/media/service-web.jpg",
      alt: "Website design panels on a dark background: desktop and mobile pages, checkout, site map and performance scores",
    },
    meta: {
      title: "Website Design & Development in Kenya",
      description:
        "Business websites, landing pages and e-commerce stores designed for mobile and built to load fast. Web design and development by Brand House.",
    },
  },
  {
    slug: "digital-marketing",
    number: "04",
    title: "Marketing & Growth",
    summary:
      "Social strategy, content planning, paid campaigns and reporting that keep your brand in front of the right people.",
    headline: "Show up consistently, in the right places, for the right people.",
    intro:
      "Good creative needs a plan to reach anyone. We build social and paid media programmes around clear objectives, produce the content they need, and report honestly on what is working so budgets go where they count.",
    capabilities: [
      "Social media strategy",
      "Social media management",
      "Paid social advertising",
      "Digital campaign development",
      "Content planning",
      "Brand awareness campaigns",
      "Audience targeting",
      "Campaign performance reporting",
    ],
    deliverables: [
      "Channel strategy and content pillars",
      "Monthly content calendars",
      "Post design, copy and community management",
      "Paid campaign setup, targeting and optimisation",
      "Monthly performance reports in plain language",
      "Quarterly strategy reviews",
    ],
    projectTypes: [
      "Ongoing social media management",
      "Product or service launch campaigns",
      "Awareness campaigns for new markets",
      "Paid social for lead generation",
    ],
    value: [
      {
        title: "Objectives before outputs",
        body: "Every campaign starts with what the business needs, not a quota of posts.",
      },
      {
        title: "Content and media together",
        body: "The people planning your ads also brief the shoots, so creative and targeting line up.",
      },
      {
        title: "Transparent reporting",
        body: "You see what was spent, what it achieved and what we will change next.",
      },
    ],
    processNotes: [
      "An audit of your channels, audience and past performance.",
      "Objectives, channels, content pillars and a budget plan.",
      "Content production, publishing, community management and ads.",
      "Monthly reporting and adjustments based on results.",
    ],
    workCategory: "marketing",
    image: {
      src: "/media/service-marketing.jpg",
      alt: "Campaign planning board for a sample solar brand: weekly content plan, audience and budget split, a sponsored social post and a monthly results report",
    },
    meta: {
      title: "Social Media & Digital Marketing in Kenya",
      description:
        "Social media strategy and management, paid social advertising, content planning and campaign reporting for brands in Kenya.",
    },
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export const workCategoryLabels: Record<WorkCategory, string> = {
  branding: "Branding",
  film: "Film & Production",
  web: "Web & Digital",
  marketing: "Marketing Campaigns",
};

export const processSteps = [
  {
    title: "Discover",
    body: "We learn how your business works: the audience, objectives, competition and the problem the work needs to solve.",
  },
  {
    title: "Strategise",
    body: "We agree the direction, creative concept, deliverables and priorities before production starts.",
  },
  {
    title: "Create",
    body: "We design, shoot, write and build the identity, content, website or campaign.",
  },
  {
    title: "Launch & optimise",
    body: "We deliver the work, review how it performs where that can be measured, and recommend what to improve.",
  },
] as const;
