import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/** Social preview card (WhatsApp, LinkedIn, Facebook, X): the homepage hero. */
export const SOCIAL_IMAGE = {
  url: "/og/brand-house-hero.jpg",
  width: 1200,
  height: 630,
  alt: "Brand House: We build brands that move people. A creative, media and digital agency.",
};

type PageMetaInput = {
  title: string;
  description: string;
  /** Path beginning with "/", used for the canonical URL. */
  path: string;
  /** Optional absolute or root-relative image for social cards. */
  image?: string;
  /** Use the title exactly, without the "| Brand House" suffix. */
  absoluteTitle?: boolean;
};

/**
 * Builds consistent page metadata. Canonical URLs are always resolved against
 * the production domain (metadataBase in the root layout), so preview
 * deployments never become canonical.
 */
export function pageMetadata({ title, description, path, image, absoluteTitle }: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  // A page-level openGraph object replaces the parent's, so always set an image.
  // Defaults to the homepage hero card in /public/og.
  const ogImage = image ? { ...SOCIAL_IMAGE, url: image } : SOCIAL_IMAGE;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path === "/" ? "" : path}`;
}
