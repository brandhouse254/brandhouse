import { createHash } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";
import webpush from "web-push";
import { decrypt, encrypt } from "@/lib/auth/crypto";
import { readUsers } from "@/lib/auth/users";
import { blobEnabled, paths } from "@/lib/cms/paths";

/**
 * Push notifications to the installed admin app. Each device that turns
 * notifications on is stored as its own encrypted file.
 */

export type NotifyKind = "enquiries" | "publishes";

export type PushPrefs = Record<NotifyKind, boolean>;

export const defaultPrefs: PushPrefs = { enquiries: true, publishes: false };

export type DeviceSubscription = {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  device: string;
  createdAt: string;
  prefs: PushPrefs;
};

export type PushMessage = { title: string; body: string; url: string; tag?: string };

const publicKey = () => process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const privateKey = () => process.env.VAPID_PRIVATE_KEY ?? "";

export const pushConfigured = () => Boolean(publicKey() && privateKey() && blobEnabled());

const fileFor = (endpoint: string) =>
  `${paths.pushPrefix()}${createHash("sha256").update(endpoint).digest("hex").slice(0, 32)}.bin`;

/** "iPhone", "Android phone", "Mac", … from the browser's user agent. */
export function describeDevice(ua: string): string {
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? "Android phone" : "Android tablet";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows computer";
  if (/Linux/i.test(ua)) return "Linux computer";
  return "Device";
}

export async function saveSubscription(sub: Omit<DeviceSubscription, "createdAt">) {
  const existing = await readSubscription(sub.endpoint);
  const record: DeviceSubscription = { ...sub, createdAt: existing?.createdAt ?? new Date().toISOString() };
  await put(fileFor(sub.endpoint), encrypt(JSON.stringify(record)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/octet-stream",
    cacheControlMaxAge: 60,
  });
  return record;
}

async function readPath(pathname: string): Promise<DeviceSubscription | null> {
  const res = await get(pathname, { access: "public", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return JSON.parse(decrypt(Buffer.from(await new Response(res.stream).arrayBuffer()))) as DeviceSubscription;
}

export async function readSubscription(endpoint: string) {
  if (!blobEnabled()) return null;
  return readPath(fileFor(endpoint)).catch(() => null);
}

export async function removeSubscription(endpoint: string) {
  await del(fileFor(endpoint)).catch(() => undefined);
}

export async function listSubscriptions(): Promise<DeviceSubscription[]> {
  if (!blobEnabled()) return [];
  const { blobs } = await list({ prefix: paths.pushPrefix(), limit: 1000 });
  const all = await Promise.all(blobs.map((b) => readPath(b.pathname).catch(() => null)));
  return all.filter((s): s is DeviceSubscription => Boolean(s));
}

async function sendTo(subs: DeviceSubscription[], message: PushMessage) {
  webpush.setVapidDetails("mailto:brandhouse254@gmail.com", publicKey(), privateKey());
  const payload = JSON.stringify(message);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 60 * 60 * 24, urgency: "high" });
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // The device unsubscribed or the app was removed: forget it.
        if (status === 404 || status === 410) await removeSubscription(s.endpoint);
        else console.error("[push] send failed", status, (e as Error).message);
      }
    }),
  );
}

/** Notify every active team member who wants this kind of notification. */
export async function notifyTeam(kind: NotifyKind, message: PushMessage, options: { exceptUserId?: string } = {}) {
  if (!pushConfigured()) return;
  try {
    const [subs, { users }] = await Promise.all([listSubscriptions(), readUsers()]);
    const active = new Set(users.filter((u) => u.active).map((u) => u.id));
    const targets = subs.filter((s) => active.has(s.userId) && s.userId !== options.exceptUserId && (s.prefs ?? defaultPrefs)[kind]);
    await sendTo(targets, message);
  } catch (e) {
    console.error("[push] notifyTeam failed", e);
  }
}

/** A test notification to one person's devices. */
export async function notifyUser(userId: string, message: PushMessage) {
  if (!pushConfigured()) return 0;
  const subs = (await listSubscriptions()).filter((s) => s.userId === userId);
  await sendTo(subs, message);
  return subs.length;
}
