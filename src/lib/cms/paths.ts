import { createHash } from "node:crypto";

/**
 * Admin data lives in the same public Blob store as uploaded media, under a
 * folder whose name is derived from AUTH_SECRET, so its address can't be
 * guessed. The user list is also encrypted (see src/lib/auth/users.ts).
 */
function dataRoot() {
  const secret = process.env.AUTH_SECRET ?? "local-dev";
  const key = createHash("sha256").update(`brandhouse-cms:${secret}`).digest("hex").slice(0, 20);
  // Preview deployments get their own content and accounts, so testing a change
  // never touches the live site. Uploaded media is shared.
  const scope = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" ? "cms-preview" : "cms";
  return `${scope}/${key}`;
}

/** Where uploads go. Previews keep their files apart from the live media library. */
function mediaPrefix() {
  return process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" ? "preview-media/" : "media/";
}

export const paths = {
  content: () => `${dataRoot()}/content.json`,
  historyPrefix: () => `${dataRoot()}/history/`,
  users: () => `${dataRoot()}/users.bin`,
  /** One encrypted file per enquiry, so two arriving together never overwrite each other. */
  enquiriesPrefix: () => `${dataRoot()}/enquiries/`,
  /** One encrypted file per device that turned notifications on. */
  pushPrefix: () => `${dataRoot()}/push/`,
  /** Uploaded images and videos (previews keep theirs apart from the live library). */
  mediaPrefix: mediaPrefix(),
};

export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
