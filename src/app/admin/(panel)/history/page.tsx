import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { HistoryScreen } from "@/components/admin/screens";

export const metadata: Metadata = { title: "Version history" };

export default async function Page() {
  const user = await requireUser();
  return <HistoryScreen isOwner={user.role === "owner"} />;
}
