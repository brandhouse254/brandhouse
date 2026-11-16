import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { AuthFrame, ChangePasswordForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Choose your password" };
export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (!user.mustChangePassword) redirect("/admin");
  return (
    <AuthFrame
      title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
      intro="You signed in with a temporary password. Choose your own to continue."
    >
      <ChangePasswordForm from="welcome" submitLabel="Save and continue" />
    </AuthFrame>
  );
}
