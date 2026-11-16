import type { NextConfig } from "next";

/**
 * Preview and development deployments must never be indexed, so they cannot
 * compete with brandhouse.co.ke in search results. Vercel sets VERCEL_ENV at
 * build time ("production" | "preview" | "development").
 */
const isProductionDeployment =
  process.env.VERCEL_ENV === "production" || process.env.SITE_INDEXABLE === "true";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  async headers() {
    const headers = [...securityHeaders];
    if (!isProductionDeployment) {
      headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
