import { siteConfig } from "@/config/site";
import { activeSocialLinks } from "@/lib/cms/public";
import type { Project, Service, SiteContent } from "@/lib/cms/types";
import { absoluteUrl } from "./seo";

/**
 * Structured data only states facts that exist in the site config. No address,
 * coordinates, ratings or opening hours are emitted until they are supplied.
 */
const orgId = `${siteConfig.url}/#organization`;

export function organizationSchema(content: SiteContent) {
  const { contact, descriptor, statement } = content.settings;
  const social = activeSocialLinks(content);
  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/brand-house-icon-512.png"),
    description: statement,
    slogan: descriptor,
  };
  if (contact.email) org.email = contact.email;
  if (contact.phone) org.telephone = contact.phone;
  org.areaServed = { "@type": "Country", name: "Kenya" };
  org.knowsAbout = [
    "Brand strategy",
    "Logo and visual identity design",
    "Video production",
    "Photography",
    "Website design and development",
    "Social media marketing",
    "Digital advertising",
  ];
  if (contact.phone || contact.email) {
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "sales",
      areaServed: "KE",
      ...(contact.phone ? { telephone: contact.phone } : {}),
      ...(contact.email ? { email: contact.email } : {}),
    };
  }
  if (social.length) org.sameAs = social.map((s) => s.href);
  return org;
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    inLanguage: siteConfig.language,
    publisher: { "@id": orgId },
  };
}

export function serviceSchema(service: Service) {
  return {
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: service.intro,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@id": orgId },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.title,
      itemListElement: service.capabilities.map((c) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: c },
      })),
    },
  };
}

/** Only emitted for genuine client work, never for samples. */
export function projectSchema(project: Project) {
  if (project.isSample) return null;
  return {
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/work/${project.slug}`),
    image: absoluteUrl(project.cover.src),
    creator: { "@id": orgId },
    ...(project.client ? { sourceOrganization: { "@type": "Organization", name: project.client } } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function graph(...nodes: Array<Record<string, unknown> | null>) {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}
