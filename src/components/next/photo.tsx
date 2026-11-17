"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

/**
 * Unsplash's CDN resizes and re-encodes (AVIF/WebP) on the fly, so we ask it
 * for exactly the width each device needs instead of routing full-size
 * originals through our own image optimiser.
 */
const unsplash: ImageLoader = ({ src, width, quality }) => `${src}&w=${width}&q=${quality ?? 70}`;

export function Pic(props: Omit<ImageProps, "loader">) {
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through props
  return <Image {...props} loader={unsplash} />;
}
