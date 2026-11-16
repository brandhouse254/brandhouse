import { del, get, list, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { defaultContent } from "./defaults";
import { blobEnabled, paths } from "./paths";
import type { SiteContent } from "./types";

const HISTORY_KEEP = 40;

/** Stored content laid over the defaults, so fields added later in code always exist. */
function withDefaults(stored: Partial<SiteContent>): SiteContent {
  const d = defaultContent();
  const s = stored ?? {};
  return {
    ...d,
    ...s,
    version: 1,
    settings: { ...d.settings, ...s.settings, contact: { ...d.settings.contact, ...s.settings?.contact } },
    hero: { ...d.hero, ...s.hero },
    intro: { ...d.intro, ...s.intro },
    difference: { ...d.difference, ...s.difference },
    about: { ...d.about, ...s.about },
    services: (s.services ?? d.services).map((svc) => ({ ...d.services[0], ...svc, aboutNote: svc.aboutNote ?? "" })),
    projects: (s.projects ?? d.projects).map((p) => ({ ...p, published: p.published ?? true })),
    testimonials: s.testimonials ?? d.testimonials,
  };
}

async function readJson(pathname: string): Promise<{ data: unknown; etag: string } | null> {
  const res = await get(pathname, { access: "public", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  const data = await new Response(res.stream).json();
  return { data, etag: res.blob.etag };
}

/**
 * Latest content straight from storage, plus its version tag (etag) so a save
 * can detect that someone else saved in between. Used by the admin.
 * Throws if storage can't be reached, so a temporary outage never replaces the
 * live site with the defaults.
 */
export async function readContent(): Promise<{ content: SiteContent; etag: string | null }> {
  if (!blobEnabled()) return { content: defaultContent(), etag: null };
  const found = await readJson(paths.content());
  if (!found) return { content: defaultContent(), etag: null };
  return { content: withDefaults(found.data as Partial<SiteContent>), etag: found.etag };
}

export const CONTENT_TAG = "cms-content";

const cachedContent = unstable_cache(async () => (await readContent()).content, ["cms-content-v2"], {
  tags: [CONTENT_TAG],
});

/**
 * Content for public pages. Cached (and the pages built from it) until the
 * admin publishes; see refreshSite in src/lib/admin/actions.ts.
 */
export const getContent = cache(async (): Promise<SiteContent> => cachedContent());

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Storage can briefly return the previous version right after a write. Poll
 * until the new version is readable, so pages rebuilt next see the change.
 */
async function waitUntilReadable(updatedAt: string) {
  for (let i = 0; i < 20; i++) {
    const { content } = await readContent();
    if (content.updatedAt === updatedAt) return;
    await sleep(250);
  }
  console.warn("[cms] new content not readable after 5s; pages may need another publish");
}

export class ContentConflictError extends Error {
  constructor() {
    super("Someone else saved changes while you were editing. Reload the page to get their version, then make your edit again.");
  }
}

/**
 * Write a whole new content document. Callers check for conflicting edits
 * first (see saveSection); the write itself simply replaces the file.
 */
export async function writeContent(next: SiteContent, editor: string): Promise<SiteContent> {
  if (!blobEnabled()) throw new Error("Storage isn't connected (BLOB_READ_WRITE_TOKEN is missing).");
  const doc: SiteContent = { ...next, version: 1, updatedAt: new Date().toISOString(), updatedBy: editor };
  const body = JSON.stringify(doc);
  await put(paths.content(), body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });

  // Version history: one snapshot per save, newest 40 kept.
  try {
    const stamp = Date.now();
    await put(`${paths.historyPrefix()}${stamp}__${encodeURIComponent(editor).slice(0, 80)}.json`, body, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    });
    const { blobs } = await list({ prefix: paths.historyPrefix(), limit: 1000 });
    const old = blobs
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .slice(HISTORY_KEEP)
      .map((b) => b.url);
    if (old.length) await del(old);
  } catch (e) {
    console.error("[cms] history snapshot failed", e);
  }

  await waitUntilReadable(doc.updatedAt!);
  return doc;
}

export type HistoryEntry = { url: string; savedAt: string; editor: string; size: number };

export async function listHistory(): Promise<HistoryEntry[]> {
  if (!blobEnabled()) return [];
  const { blobs } = await list({ prefix: paths.historyPrefix(), limit: 1000 });
  return blobs
    .map((b) => {
      const file = b.pathname.slice(paths.historyPrefix().length);
      const [stamp, rest = ""] = file.split("__");
      const editor = decodeURIComponent(rest.replace(/-[A-Za-z0-9]+\.json$/, "").replace(/\.json$/, ""));
      return { url: b.url, savedAt: new Date(Number(stamp)).toISOString(), editor, size: b.size };
    })
    .filter((h) => !Number.isNaN(Date.parse(h.savedAt)))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function readHistoryVersion(url: string): Promise<SiteContent> {
  if (!url.includes(paths.historyPrefix())) throw new Error("Not a history file.");
  const found = await readJson(url);
  if (!found) throw new Error("That version no longer exists.");
  return withDefaults(found.data as Partial<SiteContent>);
}
