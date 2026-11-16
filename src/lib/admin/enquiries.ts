import { randomUUID } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";
import { decrypt, encrypt } from "@/lib/auth/crypto";
import { blobEnabled, paths } from "@/lib/cms/paths";
import type { Enquiry } from "@/lib/contact-schema";

/**
 * Website enquiries, kept in the admin inbox. Each one is its own encrypted
 * file (it holds people's contact details), named so the newest sorts first.
 */
export type StoredEnquiry = Enquiry & {
  id: string;
  receivedAt: string;
  read: boolean;
  /** Whether an email copy was also sent (only when email is configured). */
  emailed: boolean;
};

const fileFor = (e: Pick<StoredEnquiry, "id" | "receivedAt">) =>
  // Inverted timestamp so a plain name sort lists newest first.
  `${paths.enquiriesPrefix()}${String(9999999999999 - Date.parse(e.receivedAt)).padStart(13, "0")}_${e.id}.bin`;

async function write(e: StoredEnquiry) {
  await put(fileFor(e), encrypt(JSON.stringify(e)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/octet-stream",
    cacheControlMaxAge: 60,
  });
}

async function readFile(pathname: string): Promise<StoredEnquiry | null> {
  const res = await get(pathname, { access: "public", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return JSON.parse(decrypt(Buffer.from(await new Response(res.stream).arrayBuffer()))) as StoredEnquiry;
}

export async function saveEnquiry(enquiry: Enquiry): Promise<StoredEnquiry | null> {
  if (!blobEnabled()) return null;
  const stored: StoredEnquiry = { ...enquiry, id: randomUUID(), receivedAt: new Date().toISOString(), read: false, emailed: false };
  await write(stored);
  return stored;
}

export async function listEnquiries(): Promise<StoredEnquiry[]> {
  if (!blobEnabled()) return [];
  const { blobs } = await list({ prefix: paths.enquiriesPrefix(), limit: 1000 });
  const sorted = blobs.sort((a, b) => a.pathname.localeCompare(b.pathname)).slice(0, 300);
  const all = await Promise.all(sorted.map((b) => readFile(b.pathname).catch(() => null)));
  return all.filter((e): e is StoredEnquiry => Boolean(e));
}

export async function unreadEnquiryCount(): Promise<number> {
  try {
    return (await listEnquiries()).filter((e) => !e.read).length;
  } catch {
    return 0;
  }
}

async function findPath(id: string): Promise<string | null> {
  const { blobs } = await list({ prefix: paths.enquiriesPrefix(), limit: 1000 });
  return blobs.find((b) => b.pathname.endsWith(`_${id}.bin`))?.pathname ?? null;
}

export async function getEnquiry(id: string): Promise<StoredEnquiry | null> {
  if (!blobEnabled() || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const path = await findPath(id);
  return path ? readFile(path) : null;
}

export async function updateEnquiry(id: string, patch: Partial<Pick<StoredEnquiry, "read" | "emailed">>) {
  const current = await getEnquiry(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  await write(next);
  return next;
}

export async function deleteEnquiry(id: string) {
  const path = await findPath(id);
  if (path) await del(path);
}
