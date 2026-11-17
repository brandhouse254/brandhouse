"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

/**
 * Unsplash's CDN resizes and re-encodes (AVIF/WebP) on the fly, so we ask it
 * for exactly the width each device needs instead of routing full-size
 * originals through our own image optimiser.
 */
const unsplash: ImageLoader = ({ src, width, quality }) => `${src}${src.includes("?") ? "&" : "?"}w=${width}&q=${quality ?? 70}`;

const optimisable = (src: string) => src.startsWith("/") || /^https:\/\/([a-z0-9-]+\.public\.blob\.vercel-storage\.com|i\.ytimg\.com)\//i.test(src);

/** next/image for any picture the admin can set: Unsplash, uploads, YouTube stills or other https links. */
export function Pic({ src, ...props }: Omit<ImageProps, "loader" | "src"> & { src: string }) {
  if (src.startsWith("https://images.unsplash.com/")) {
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through props
    return <Image {...props} src={src} loader={unsplash} />;
  }
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through props
  return <Image {...props} src={src} unoptimized={!optimisable(src)} />;
}
