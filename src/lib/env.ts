/**
 * Only the real production deployment should be indexed by search engines.
 * Vercel sets VERCEL_ENV automatically. If you host elsewhere, set
 * SITE_INDEXABLE=true on your production server only.
 */
export const isIndexable =
  process.env.VERCEL_ENV === "production" || process.env.SITE_INDEXABLE === "true";

export const isDev = process.env.NODE_ENV === "development";
