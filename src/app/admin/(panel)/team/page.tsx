import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { readUsers, toPublic } from "@/lib/auth/users";
import { TeamScreen } from "@/components/admin/screens";

export const metadata: Metadata = { title: "Team members" };

export default async function Page() {
  const me = await requireUser("owner");
  const { users } = await readUsers();
  const sorted = [...users].sort((a, b) => (a.role === b.role ? a.name.localeCompare(b.name) : a.role === "owner" ? -1 : 1));
  return <TeamScreen users={sorted.map(toPublic)} meId={me.id} />;
}
