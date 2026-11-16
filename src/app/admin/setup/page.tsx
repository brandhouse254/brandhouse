import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readUsers } from "@/lib/auth/users";
import { AuthFrame, SetupForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Set up" };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const { users } = await readUsers();
  if (users.length > 0) redirect("/admin/login");
  return (
    <AuthFrame
      title="Create the owner account"
      intro="This works once. After the owner exists, everyone else is added from Team members."
    >
      <SetupForm />
    </AuthFrame>
  );
}
