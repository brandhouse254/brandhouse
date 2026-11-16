import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getContent } from "@/lib/cms/store";
import { visibleProjects } from "@/lib/cms/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const services = content.services;
  const projects = visibleProjects(content);
  const base = siteConfig.url;
  const now = new Date();
  const staticRoutes = ["", "/work", "/services", "/about", "/contact", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : path === "/privacy" ? 0.3 : 0.8,
  }));
  return [
    ...staticRoutes,
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: p.isSample ? 0.4 : 0.7,
    })),
  ];
}
