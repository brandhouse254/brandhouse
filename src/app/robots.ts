import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { isIndexable } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Preview and development deployments are never crawlable.
  if (!isIndexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
