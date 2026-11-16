import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { sign, verifySigned } from "./crypto";
import { readUsers, type AdminUser, type Role } from "./users";

const COOKIE = "bh_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // one week

type SessionPayload = { uid: string; v: number; exp: number };

export async function startSession(user: AdminUser) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const store = await cookies();
  store.set(COOKIE, sign({ uid: user.id, v: user.sessionVersion, exp } satisfies SessionPayload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/**
 * The signed-in admin user, or null. Checked against the live user list on
 * every request, so removing someone or changing a password signs them out.
 */
export const currentUser = cache(async (): Promise<AdminUser | null> => {
  const payload = verifySigned<SessionPayload>((await cookies()).get(COOKIE)?.value);
  if (!payload || payload.exp < Date.now() / 1000) return null;
  const { users } = await readUsers();
  const user = users.find((u) => u.id === payload.uid);
  if (!user || !user.active || user.sessionVersion !== payload.v) return null;
  return user;
});

/** For admin pages: sends visitors who aren't signed in to the login screen. */
export async function requireUser(role?: Role): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/welcome");
  if (role === "owner" && user.role !== "owner") redirect("/admin");
  return user;
}

export class NotAllowedError extends Error {}

/** For server actions and API routes: throws instead of redirecting. */
export async function assertUser(role?: Role): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) throw new NotAllowedError("Your session has ended. Please sign in again.");
  if (role === "owner" && user.role !== "owner") throw new NotAllowedError("Only an owner can do that.");
  return user;
}
