import { cache } from "react";
import { readUsers } from "@/lib/auth/users";
import type { TeamMember } from "./types";

/** Active team members for pickers (read once per request). */
export const teamMembers = cache(async (): Promise<TeamMember[]> => {
  const { users } = await readUsers();
  return users.filter((u) => u.active).map((u) => ({ id: u.id, name: u.name || u.email, role: u.role, active: u.active }));
});

export function nameFrom(team: TeamMember[], id: string | null) {
  return id ? (team.find((m) => m.id === id)?.name ?? "Former member") : null;
}

export function initialsOf(name: string) {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
