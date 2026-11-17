/**
 * A small version of an image for previews in the admin. Stock photos are
 * resized by Unsplash's CDN; uploads go through Next's image optimiser.
 * Without this the admin would download full-size originals (several MB each).
 */
export function thumb(src: string, width: 384 | 640 | 828 | 1200 = 640): string {
  if (!src) return src;
  if (src.startsWith("https://images.unsplash.com/")) return `${src}${src.includes("?") ? "&" : "?"}w=${width}&q=60`;
  if (/\.(svg|gif)(\?|$)/i.test(src)) return src;
  if ((src.startsWith("/") && !src.startsWith("/_next/")) || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(src)) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=70`;
  }
  return src;
}
