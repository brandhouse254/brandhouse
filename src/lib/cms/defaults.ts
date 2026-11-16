import { siteConfig } from "@/config/site";
import { seedServices } from "@/content/services";
import { seedProjects } from "@/content/projects";
import { seedTestimonials } from "@/content/testimonials";
import type { SiteContent } from "./types";

/**
 * The site's content as it was hand-written before the admin existed. Used
 * until the first save from the admin, and as the base that saved content is
 * merged onto (so new fields added in code always have a value).
 */

const aboutNotes: Record<string, string> = {
  branding: "Sets the positioning and visual identity every other division works from.",
  "video-production": "Turns the brand into film and photography for ads, launches and social.",
  "web-development": "Gives the brand a home online and turns visitors into enquiries and sales.",
  "digital-marketing": "Puts the content in front of the right audience and measures what it achieves.",
};

export function defaultContent(): SiteContent {
  return {
    version: 1,
    settings: {
      descriptor: siteConfig.descriptor,
      statement: siteConfig.statement,
      contact: {
        email: siteConfig.contact.email,
        phone: siteConfig.contact.phone,
        whatsapp: siteConfig.contact.whatsapp,
        whatsappMessage: siteConfig.contact.whatsappMessage,
        location: siteConfig.contact.location,
      },
      social: siteConfig.social.map((s) => ({ label: s.label, href: s.href })),
      showSampleProjects: siteConfig.showSampleProjects,
    },
    hero: {
      eyebrow: siteConfig.descriptor,
      line1: "We build brands",
      line2: "that move people.",
      lead: "From cinematic content and compelling brand identities to high-performing websites and digital campaigns, we help businesses stand out and grow.",
      primaryCta: { ...siteConfig.cta.primary },
      secondaryCta: { ...siteConfig.cta.work },
      image: {
        src: "/media/hero-poster.jpg",
        alt: "Abstract warm light, a placeholder for the Brand House showreel",
      },
      video: null,
      timecode: "00:00:18:06",
    },
    intro: {
      title: "More than creative. Built for impact.",
      statement:
        "We bring strategy, storytelling, design and digital together to help brands communicate clearly, connect with audiences and build lasting visibility.",
      facts: [
        {
          title: "Who we work with",
          body: "Established companies refreshing how they show up, and startups and growing businesses building a brand for the first time.",
        },
        {
          title: "What we bring together",
          body: "Brand identity, film and photography, websites and digital marketing, planned by one team so they work as one.",
        },
        {
          title: "What to expect",
          body: "A clear brief, honest timelines and costs, regular reviews, and work you can use the day it is delivered.",
        },
      ],
    },
    difference: {
      title: "One creative partner. A bigger picture.",
      lead: "Most businesses juggle a designer, a production house, a web developer and a social media manager. We bring that work together so it adds up.",
      points: [
        {
          title: "One brand, every channel",
          body: "Your identity, films, website and social feeds are planned together, so customers meet the same brand wherever they find you.",
        },
        {
          title: "Creative and technical under one roof",
          body: "Designers, directors, developers and marketers share the brief. Nothing gets lost in a hand-off between agencies.",
        },
        {
          title: "Content made for your objectives",
          body: "We start with what the business needs to achieve, then decide what to shoot, design or build.",
        },
        {
          title: "Experiences built around real users",
          body: "Websites and campaigns are shaped by how your customers search, scroll and decide, not by guesswork.",
        },
        {
          title: "A process you can see into",
          body: "Clear stages, shared timelines and regular check-ins. You always know what is happening and what comes next.",
        },
      ],
    },
    about: {
      title: "We build brands that people recognise, remember and choose.",
      intro:
        "Brand House is a creative, media and digital agency. We sit where strategy, storytelling, design and technology meet, and we help businesses use all four to grow their visibility.",
      image: { src: "/media/about.jpg", alt: "Abstract placeholder of warm and teal out-of-focus light" },
      purposeTitle: "Why we exist",
      purposeParagraphs: [
        "Most businesses have to piece together their brand from several suppliers: a designer for the logo, a production company for the advert, a developer for the website, someone else for social media. Each does their part, but the parts rarely add up to one clear brand.",
        "Brand House exists to close that gap: one team that learns the business, sets the creative direction, and carries it through every channel where customers will meet it.",
      ],
      approachTitle: "Strategy first, then the craft.",
      approachLeft:
        "Every project starts with the same questions: who are we trying to reach, what do they need to believe, and what should they do next? The answers decide whether the right move is a new identity, a film, a website, a campaign or a mix of them.",
      approachRight:
        "Then we make it properly. Directors, designers, developers and marketers work from one brief, so the film looks like the brand, the website tells the same story, and the campaign sends people somewhere worth arriving.",
      divisionsTitle: "Four divisions that share one brief",
      divisionsIntro:
        "Each division can work on its own. When they work together, decisions made in one carry through to the others.",
      valuesTitle: "What we value",
      values: [
        {
          title: "Clarity over noise",
          body: "We would rather say one thing well than five things loudly. Good work is easy to understand.",
        },
        {
          title: "Craft in the details",
          body: "Type, timing, colour and code all get the same care, because customers notice when they are off.",
        },
        {
          title: "Honest about what works",
          body: "We tell clients what we think, report results as they are, and say so when a different approach would serve them better.",
        },
        {
          title: "Rooted here, built to travel",
          body: "We design for how people in Kenya discover and choose brands, and make work that holds up wherever it travels.",
        },
      ],
      ctaTitle: "Have something worth building?",
      ctaBody: "Tell us about the business and what you want to change. We will take it from there.",
    },
    services: seedServices.map((s) => ({
      ...s,
      capabilities: [...s.capabilities],
      deliverables: [...s.deliverables],
      projectTypes: [...s.projectTypes],
      value: s.value.map((v) => ({ ...v })),
      processNotes: [...s.processNotes] as [string, string, string, string],
      image: { ...s.image },
      meta: { ...s.meta },
      aboutNote: aboutNotes[s.slug] ?? "",
    })),
    projects: seedProjects.map((p) => ({
      ...p,
      published: true,
      categories: [...p.categories],
      services: [...p.services],
      objectives: [...p.objectives],
      cover: { ...p.cover },
      gallery: p.gallery.map((g) => ({ ...g })),
      video: p.video ? { ...p.video } : null,
    })),
    testimonials: seedTestimonials.map((t) => ({ ...t })),
    updatedAt: null,
    updatedBy: null,
  };
}
