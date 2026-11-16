import { list } from "@vercel/blob";
import { getEnquiry } from "@/lib/admin/enquiries";
import { blobEnabled, paths } from "@/lib/cms/paths";
import { dbConfigured } from "@/lib/db";
import { createLead, getSetting, importedLegacyIds, setSetting } from "./data";

const EVERY_MS = 6 * 60 * 60 * 1000;
let running: Promise<void> | null = null;

/**
 * Enquiries saved before the database existed (or while it was briefly
 * unreachable) live in Blob storage. Copy any that aren't leads yet. Runs at
 * most every few hours; only files not already imported are opened.
 */
export function importBlobEnquiries(force = false): Promise<void> {
  if (!dbConfigured() || !blobEnabled()) return Promise.resolve();
  running ??= (async () => {
    const last = await getSetting<string>("import:enquiries");
    if (!force && last && Date.now() - Date.parse(last) < EVERY_MS) return;
    const [{ blobs }, done] = await Promise.all([list({ prefix: paths.enquiriesPrefix(), limit: 1000 }), importedLegacyIds()]);
    for (const b of blobs) {
      const id = b.pathname.match(/_([0-9a-f-]{36})\.bin$/)?.[1];
      if (!id || done.has(id)) continue;
      const e = await getEnquiry(id).catch(() => null);
      if (!e) continue;
      await createLead({
        source: "website",
        name: e.name,
        organisation: e.organisation,
        email: e.email,
        phone: e.phone,
        services: e.services,
        budget: e.budget,
        timeline: e.timeline,
        referral: e.referral,
        description: e.description,
        legacyId: e.id,
        receivedAt: e.receivedAt,
        read: e.read,
      });
    }
    await setSetting("import:enquiries", new Date().toISOString());
  })()
    .catch((err) => console.error("[leads] import of earlier enquiries failed", err))
    .finally(() => {
      running = null;
    });
  return running;
}
