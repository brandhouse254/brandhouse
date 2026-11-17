import { del, get, list, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { cookies, draftMode } from "next/headers";
import { cache } from "react";
import { defaultContent } from "./defaults";
import { blobEnabled, paths } from "./paths";
import { retiredSampleSlugs } from "@/content/projects";
import { factPhotos, servicePhotos } from "./stock";
import type { Project, SiteContent } from "./types";

const HISTORY_KEEP = 40;

/** Placeholder images from the first version of the site, replaced by real photography. */
const isOldPlaceholder = (src: string | undefined) => !src || /^\/media\/(service-[a-z]+|about)\.jpg$/.test(src);

/**
 * Projects as stored, normalised to the current shape. The first illustrated
 * sample projects are swapped for the photographic showcase once; after that
 * the admin's choices (including deleting showcase pieces) stand.
 */
function migrateProjects(stored: Partial<Project>[] | undefined, d: SiteContent): Project[] {
  if (!stored) return d.projects;
  const hadOldSamples = stored.some((p) => p.isSample && retiredSampleSlugs.includes(p.slug ?? ""));
  let list = stored;
  if (hadOldSamples) {
    list = stored.filter((p) => !(p.isSample && retiredSampleSlugs.includes(p.slug ?? "")));
    const have = new Set(list.map((p) => p.slug));
    list = [...list, ...d.projects.filter((p) => !have.has(p.slug))];
  }
  return list.map((p) => ({
    ...(p as Project),
    published: p.published ?? true,
    featured: p.featured ?? false,
    frame: p.frame ?? "photo",
    tagline: p.tagline ?? "",
    link: p.link ?? null,
  }));
}

/** Stored content laid over the defaults, so fields added later in code always exist. */
function withDefaults(stored: Partial<SiteContent>): SiteContent {
  const d = defaultContent();
  const s = stored ?? {};
  const services = (s.services ?? d.services).map((svc) => {
    const merged = { ...d.services[0], ...svc, aboutNote: svc.aboutNote ?? "" };
    if (isOldPlaceholder(svc.image?.src)) merged.image = { ...(servicePhotos[svc.slug] ?? d.services[0].image) };
    return merged;
  });
  const about = { ...d.about, ...s.about };
  if (isOldPlaceholder(s.about?.image?.src)) about.image = d.about.image;
  return {
    ...d,
    ...s,
    version: 1,
    settings: { ...d.settings, ...s.settings, contact: { ...d.settings.contact, ...s.settings?.contact } },
    hero: { ...d.hero, ...s.hero },
    intro: {
      ...d.intro,
      ...s.intro,
      facts: (s.intro?.facts ?? d.intro.facts).map((f, i) => ({ ...f, image: f.image === undefined ? { ...factPhotos[i % factPhotos.length] } : f.image })),
    },
    difference: { ...d.difference, ...s.difference },
    about,
    services,
    projects: migrateProjects(s.projects, d),
    testimonials: s.testimonials ?? d.testimonials,
    pages: {
      home: { ...d.pages.home, ...s.pages?.home },
      work: { ...d.pages.work, ...s.pages?.work },
      services: { ...d.pages.services, ...s.pages?.services },
      contact: { ...d.pages.contact, ...s.pages?.contact },
      cta: { ...d.pages.cta, ...s.pages?.cta },
    },
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
export const getContent = cache(async (): Promise<SiteContent> => (await previewContent()) ?? cachedContent());

/** The cookie holding which unpublished draft this browser is previewing. */
export const PREVIEW_COOKIE = "bh_preview";

/**
 * While an admin previews unpublished changes (Next.js draft mode is on and a
 * preview token is set), public pages render from that draft instead of the
 * published content. Everyone else always gets the published site.
 */
async function previewContent(): Promise<SiteContent | null> {
  let enabled = false;
  try {
    enabled = (await draftMode()).isEnabled;
  } catch {
    return null; // outside a request (build time, sitemap generation)
  }
  if (!enabled) return null;
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  if (!blobEnabled()) {
    // Local development without storage: drafts live in a temp folder.
    const { readFile } = await import("node:fs/promises");
    const text = await readFile(localPreviewFile(token), "utf8").catch(() => null);
    return text ? withDefaults(JSON.parse(text) as Partial<SiteContent>) : null;
  }
  const found = await readJson(`${paths.previewPrefix()}${token}.json`).catch(() => null);
  return found ? withDefaults(found.data as Partial<SiteContent>) : null;
}

const localPreviewFile = (token: string) => `${process.env.TMPDIR || "/tmp"}/bh-preview-${token}.json`;

/** Store a draft for previewing. Not published, not cached. */
export async function writePreview(token: string, content: SiteContent): Promise<void> {
  if (!blobEnabled()) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(localPreviewFile(token), JSON.stringify(content));
    return;
  }
  await put(`${paths.previewPrefix()}${token}.json`, JSON.stringify(content), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

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

  // Quiet backups: one snapshot per save, newest 40 kept (not shown in the admin).
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
