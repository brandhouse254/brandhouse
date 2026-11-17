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

/** Identifies this build, so an open admin app can tell when a newer version is live. */
const appVersion = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || `local-${Date.now()}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: { NEXT_PUBLIC_APP_VERSION: appVersion },
  // In-process Postgres used only for local development and tests.
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // Images uploaded through the admin are stored in Vercel Blob.
    // YouTube thumbnails can be used as project covers.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Unsplash stock photography (resized by Unsplash's own CDN, see src/components/site/photo.tsx).
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    // The homepage concept was previewed at /next before it replaced the homepage.
    return [{ source: "/next", destination: "/", permanent: false }];
  },
  async headers() {
    const headers = [...securityHeaders];
    if (!isProductionDeployment) {
      headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }
    return [
      { source: "/:path*", headers },
      // The admin app's service worker is always re-checked, so updates arrive without reinstalling.
      { source: "/admin/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, max-age=0" }] },
      // Shared invoices and quotes are private links: never indexed.
      { source: "/i/:token", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
