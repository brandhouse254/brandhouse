/** Where uploads go. Previews keep their files apart from the live media library. */
export function mediaPrefix() {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
  return env && env !== "production" ? "preview-media/" : "media/";
}
