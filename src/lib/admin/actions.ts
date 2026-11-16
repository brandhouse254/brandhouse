"use server";

import { del, list } from "@vercel/blob";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, safeEqualText, temporaryPassword, verifyPassword } from "@/lib/auth/crypto";
import { assertUser, currentUser, endSession, NotAllowedError, startSession } from "@/lib/auth/session";
import { newUser, normaliseEmail, readUsers, toPublic, updateUsers, type PublicUser, type Role } from "@/lib/auth/users";
import { blobEnabled, paths } from "@/lib/cms/paths";
import { describeIssue, sectionSchemas, type SectionKey } from "@/lib/cms/schema";
import {
  CONTENT_TAG,
  ContentConflictError,
  listHistory,
  readContent,
  readHistoryVersion,
  writeContent,
  type HistoryEntry,
} from "@/lib/cms/store";
import { stableStringify } from "@/lib/cms/stable";
import type { SiteContent } from "@/lib/cms/types";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function failure(e: unknown): { ok: false; error: string } {
  if (e instanceof NotAllowedError || e instanceof ContentConflictError) return { ok: false, error: e.message };
  console.error("[admin]", e);
  return { ok: false, error: e instanceof Error && e.message ? e.message : "Something went wrong. Please try again." };
}

/**
 * Expire the cached content (the next visitor waits for fresh content rather
 * than being served the old version) and re-render every public page.
 */
function refreshSite() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

const passwordRule = z
  .string()
  .min(10, { error: "Use at least 10 characters." })
  .max(200, { error: "That password is too long." });

/** Where two JSON values first differ, for the server log when a save is refused. */
function firstDifference(a: unknown, b: unknown, path = ""): string | null {
  if (JSON.stringify(a) === JSON.stringify(b)) return null;
  if (a && b && typeof a === "object" && typeof b === "object") {
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
    for (const k of keys) {
      const d = firstDifference((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`);
      if (d) return d;
    }
  }
  return `${path || "(root)"}: ${JSON.stringify(a)?.slice(0, 120)} → ${JSON.stringify(b)?.slice(0, 120)}`;
}

/* ───────────── Sign in / out ───────────── */

const attempts = new Map<string, { count: number; until: number }>();

/** `values` refills the form after an error (React resets forms after each submit); never passwords. */
export type FormState = { error?: string; message?: string; values?: Record<string, string> } | undefined;

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  const slot = attempts.get(email);
  if (slot && slot.count >= 5 && slot.until > Date.now()) {
    return { error: "Too many attempts. Wait 15 minutes, or ask an owner to reset your password.", values: { email } };
  }

  const { users } = await readUsers();
  const user = users.find((u) => u.email === email && u.active);
  const ok = user ? await verifyPassword(password, user.passwordHash) : await verifyPassword(password, "scrypt$AAAA$AAAA");
  if (!user || !ok) {
    const next = { count: (slot && slot.until > Date.now() ? slot.count : 0) + 1, until: Date.now() + 15 * 60_000 };
    attempts.set(email, next);
    await new Promise((r) => setTimeout(r, 400));
    return { error: "That email and password don't match an active account.", values: { email } };
  }
  attempts.delete(email);

  await updateUsers((list) => {
    const u = list.find((x) => x.id === user.id);
    if (u) u.lastLoginAt = new Date().toISOString();
  }).catch(() => undefined);
  await startSession(user);
  redirect(user.mustChangePassword ? "/admin/welcome" : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ───────────── First owner ───────────── */

export async function setupOwner(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { code: String(form.get("code") ?? ""), name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") };
  const expected = process.env.ADMIN_SETUP_CODE?.trim();
  if (!expected) return { error: "Setup isn't enabled on this site (ADMIN_SETUP_CODE is missing).", values };
  const code = values.code.trim().toUpperCase();
  if (!safeEqualText(code, expected.toUpperCase())) return { error: "That setup code isn't right.", values };

  const parsed = z
    .object({
      name: z.string().trim().min(2, { error: "Enter your name." }).max(80),
      email: z.email({ error: "Enter a valid email address." }),
      password: passwordRule,
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { error: "The two passwords don't match.", path: ["confirm"] })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: describeIssue(parsed.error), values };

  const passwordHash = await hashPassword(parsed.data.password);
  let created;
  try {
    created = await updateUsers((users) => {
      if (users.length > 0) throw new NotAllowedError("An owner account already exists. Sign in instead.");
      const u = newUser({ email: parsed.data.email, name: parsed.data.name, role: "owner", passwordHash, mustChangePassword: false });
      users.push(u);
      return u;
    });
  } catch (e) {
    return { error: failure(e).error, values };
  }
  await startSession(created);
  redirect("/admin");
}

/* ───────────── Own account ───────────── */

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await currentUser();
  if (!me) redirect("/admin/login");
  const current = String(form.get("current") ?? "");
  const next = passwordRule.safeParse(String(form.get("password") ?? ""));
  if (!next.success) return { error: describeIssue(next.error) };
  if (next.data !== String(form.get("confirm") ?? "")) return { error: "The two new passwords don't match." };
  if (!(await verifyPassword(current, me.passwordHash))) return { error: "Your current password isn't right." };
  if (current === next.data) return { error: "Choose a password you haven't used here before." };

  const passwordHash = await hashPassword(next.data);
  const updated = await updateUsers((users) => {
    const u = users.find((x) => x.id === me.id);
    if (!u) throw new NotAllowedError("Your account no longer exists.");
    u.passwordHash = passwordHash;
    u.sessionVersion += 1;
    u.mustChangePassword = false;
    return { ...u };
  });
  await startSession(updated);
  if (form.get("from") === "welcome") redirect("/admin");
  return { message: "Password changed. Other devices have been signed out." };
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  try {
    const me = await assertUser();
    const name = z.string().trim().min(2, { error: "Enter your name." }).max(80).safeParse(form.get("name"));
    if (!name.success) return { error: describeIssue(name.error) };
    await updateUsers((users) => {
      const u = users.find((x) => x.id === me.id);
      if (u) u.name = name.data;
    });
    revalidatePath("/admin", "layout");
    return { message: "Saved." };
  } catch (e) {
    return { error: failure(e).error };
  }
}

/* ───────────── Content ───────────── */

/**
 * Save one section. `baseline` is the section as the editor first loaded it;
 * if someone else has changed that same section since, the save is refused
 * rather than silently overwriting their work. Returns the stored value
 * (trimmed and normalised) so the editor can show exactly what is live.
 */
export async function saveSection(
  section: SectionKey,
  value: unknown,
  baseline: string,
): Promise<Result<{ value: unknown; savedAt: string }>> {
  try {
    const me = await assertUser();
    const schema = sectionSchemas[section];
    if (!schema) return { ok: false, error: "Unknown section." };
    const parsed = schema.safeParse(value);
    if (!parsed.success) return { ok: false, error: describeIssue(parsed.error) };
    // A read straight after someone's save can briefly return the version
    // before it, so look a few times before calling it a real conflict.
    let { content } = await readContent();
    for (let i = 0; i < 6 && stableStringify(content[section]) !== baseline; i++) {
      await new Promise((r) => setTimeout(r, 400));
      ({ content } = await readContent());
    }
    const currentText = stableStringify(content[section]);
    if (currentText !== baseline) {
      console.warn("[admin] save conflict", section, firstDifference(JSON.parse(baseline), JSON.parse(currentText)));
      throw new ContentConflictError();
    }
    const next = { ...content, [section]: parsed.data } as SiteContent;
    await writeContent(next, me.name || me.email);
    refreshSite();
    return { ok: true, value: parsed.data, savedAt: new Date().toISOString() };
  } catch (e) {
    return failure(e);
  }
}

export async function getHistory(): Promise<Result<{ entries: HistoryEntry[] }>> {
  try {
    await assertUser();
    return { ok: true, entries: await listHistory() };
  } catch (e) {
    return failure(e);
  }
}

export async function restoreVersion(url: string): Promise<Result> {
  try {
    const me = await assertUser("owner");
    const version = await readHistoryVersion(url);
    await writeContent(version, `${me.name || me.email} (restored a previous version)`);
    refreshSite();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/* ───────────── Media library ───────────── */

export type MediaItem = { url: string; pathname: string; name: string; size: number; uploadedAt: string; kind: "image" | "video" | "other" };

function kindOf(pathname: string): MediaItem["kind"] {
  if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(pathname)) return "image";
  if (/\.(mp4|webm|mov|m4v)$/i.test(pathname)) return "video";
  return "other";
}

export async function listMedia(): Promise<Result<{ items: MediaItem[] }>> {
  try {
    await assertUser();
    if (!blobEnabled()) return { ok: true, items: [] };
    const items: MediaItem[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: paths.mediaPrefix, limit: 1000, cursor });
      for (const b of page.blobs) {
        items.push({
          url: b.url,
          pathname: b.pathname,
          name: b.pathname.slice(paths.mediaPrefix.length).replace(/-[A-Za-z0-9]{20,}(?=\.[^.]+$)/, ""),
          size: b.size,
          uploadedAt: new Date(b.uploadedAt).toISOString(),
          kind: kindOf(b.pathname),
        });
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    return { ok: true, items };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteMedia(url: string): Promise<Result> {
  try {
    await assertUser();
    if (!new URL(url).pathname.startsWith(`/${paths.mediaPrefix}`)) return { ok: false, error: "Only uploaded media can be deleted." };
    const { content } = await readContent();
    if (JSON.stringify(content).includes(url)) {
      return { ok: false, error: "This file is still used on the site. Replace it there first, then delete it." };
    }
    await del(url);
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/* ───────────── Team (owners only) ───────────── */

export async function listTeam(): Promise<Result<{ users: PublicUser[] }>> {
  try {
    await assertUser("owner");
    const { users } = await readUsers();
    return { ok: true, users: users.map(toPublic) };
  } catch (e) {
    return failure(e);
  }
}

const roleSchema = z.enum(["owner", "editor"]);

export async function addTeamMember(input: { name: string; email: string; role: Role }): Promise<Result<{ password: string }>> {
  try {
    await assertUser("owner");
    const data = z
      .object({
        name: z.string().trim().min(2, { error: "Enter their name." }).max(80),
        email: z.email({ error: "Enter a valid email address." }),
        role: roleSchema,
      })
      .safeParse(input);
    if (!data.success) return { ok: false, error: describeIssue(data.error) };
    const password = temporaryPassword();
    const passwordHash = await hashPassword(password);
    await updateUsers((users) => {
      if (users.some((u) => u.email === normaliseEmail(data.data.email))) {
        throw new NotAllowedError("Someone with that email already has an account.");
      }
      users.push(newUser({ ...data.data, passwordHash, mustChangePassword: true }));
    });
    revalidatePath("/admin/team");
    return { ok: true, password };
  } catch (e) {
    return failure(e);
  }
}

export async function updateTeamMember(id: string, change: { role?: Role; active?: boolean }): Promise<Result> {
  try {
    const me = await assertUser("owner");
    await updateUsers((users) => {
      const u = users.find((x) => x.id === id);
      if (!u) throw new NotAllowedError("That account no longer exists.");
      if (change.role) u.role = roleSchema.parse(change.role);
      if (typeof change.active === "boolean") {
        if (u.id === me.id && !change.active) throw new NotAllowedError("You can't switch off your own account.");
        u.active = change.active;
        u.sessionVersion += 1;
      }
      const owners = users.filter((x) => x.role === "owner" && x.active);
      if (owners.length === 0) throw new NotAllowedError("There must always be at least one active owner.");
    });
    revalidatePath("/admin/team");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function resetTeamPassword(id: string): Promise<Result<{ password: string }>> {
  try {
    const me = await assertUser("owner");
    if (id === me.id) return { ok: false, error: "Change your own password from My account." };
    const password = temporaryPassword();
    const passwordHash = await hashPassword(password);
    await updateUsers((users) => {
      const u = users.find((x) => x.id === id);
      if (!u) throw new NotAllowedError("That account no longer exists.");
      u.passwordHash = passwordHash;
      u.mustChangePassword = true;
      u.sessionVersion += 1;
    });
    return { ok: true, password };
  } catch (e) {
    return failure(e);
  }
}

export async function removeTeamMember(id: string): Promise<Result> {
  try {
    const me = await assertUser("owner");
    if (id === me.id) return { ok: false, error: "You can't remove your own account." };
    await updateUsers((users) => {
      const i = users.findIndex((x) => x.id === id);
      if (i === -1) return;
      users.splice(i, 1);
      if (!users.some((x) => x.role === "owner" && x.active)) {
        throw new NotAllowedError("There must always be at least one active owner.");
      }
    });
    revalidatePath("/admin/team");
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
