import { randomUUID } from "node:crypto";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { blobEnabled, paths } from "@/lib/cms/paths";
import { decrypt, encrypt } from "./crypto";

export type Role = "owner" | "editor";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  /** Bumped to sign the user out everywhere (password change, removal, reset). */
  sessionVersion: number;
  /** Set when an owner creates the account or resets the password. */
  mustChangePassword: boolean;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

/** What the admin screens may see about a user (never the password hash). */
export type PublicUser = Omit<AdminUser, "passwordHash" | "sessionVersion">;

export function toPublic(user: AdminUser): PublicUser {
  const { passwordHash, sessionVersion, ...rest } = user;
  void passwordHash;
  void sessionVersion;
  return rest;
}

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

type UsersFile = { users: AdminUser[] };

/**
 * The user list is one encrypted file in Blob storage. Reads bypass the CDN so
 * a change (new password, removed user) applies immediately.
 */
export async function readUsers(): Promise<{ users: AdminUser[]; etag: string | null }> {
  if (!blobEnabled()) return { users: [], etag: null };
  const res = await get(paths.users(), { access: "public", useCache: false });
  if (!res || res.statusCode !== 200) return { users: [], etag: null };
  const buf = Buffer.from(await new Response(res.stream).arrayBuffer());
  const file = JSON.parse(decrypt(buf)) as UsersFile;
  return { users: file.users ?? [], etag: res.blob.etag };
}

export class UsersConflictError extends Error {
  constructor() {
    super("The team list changed while you were working. Please try again.");
  }
}

async function writeUsers(users: AdminUser[], etag: string | null) {
  if (!blobEnabled()) throw new Error("Storage isn't connected (BLOB_READ_WRITE_TOKEN is missing).");
  try {
    await put(paths.users(), encrypt(JSON.stringify({ users } satisfies UsersFile)), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/octet-stream",
      cacheControlMaxAge: 60,
      ...(etag ? { ifMatch: etag } : {}),
    });
  } catch (e) {
    if (e instanceof BlobPreconditionFailedError) throw new UsersConflictError();
    throw e;
  }
}

/** Read, change and write the user list in one step, retrying once on a clash. */
export async function updateUsers<T>(change: (users: AdminUser[]) => T | Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { users, etag } = await readUsers();
    const copy = users.map((u) => ({ ...u }));
    const result = await change(copy);
    try {
      await writeUsers(copy, etag);
      return result;
    } catch (e) {
      if (!(e instanceof UsersConflictError) || attempt === 1) throw e;
    }
  }
  throw new UsersConflictError();
}

export function newUser(input: { email: string; name: string; role: Role; passwordHash: string; mustChangePassword: boolean }): AdminUser {
  return {
    id: randomUUID(),
    email: normaliseEmail(input.email),
    name: input.name.trim(),
    role: input.role,
    passwordHash: input.passwordHash,
    sessionVersion: 1,
    mustChangePassword: input.mustChangePassword,
    active: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
}
