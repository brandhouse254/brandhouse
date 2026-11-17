import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { ChangePasswordForm, ProfileForm } from "@/components/admin/auth-forms";
import { Card } from "@/components/admin/ui";
import { AppSettings } from "@/components/admin/app-setup";

export const metadata: Metadata = { title: "My account" };

export default async function Page() {
  const user = await requireUser();
  return (
    <>
      <header className="py-6">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">My account & app</h1>
        <p className="mt-0.5 text-sm text-mute-2">
          Signed in as {user.email} · {user.role === "owner" ? "Owner" : "Editor"}
        </p>
      </header>
      <Card
        title="Admin app & notifications"
        description="Install the admin on this phone or computer and choose what you're notified about. Do this on each device you use."
        className="mb-6"
      >
        <AppSettings />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile" description="Your name is shown to the team next to the changes you publish.">
          <ProfileForm name={user.name} />
        </Card>
        <Card title="Password" description="Changing it signs you out on every other device.">
          <ChangePasswordForm />
        </Card>
      </div>
    </>
  );
}
