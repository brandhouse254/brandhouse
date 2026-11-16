import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { readUsers } from "@/lib/auth/users";
import { AuthFrame, LoginForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentUser()) redirect("/admin");
  const { users } = await readUsers();
  if (users.length === 0) {
    return (
      <AuthFrame
        title="Set up the admin"
        intro="No accounts exist yet. The first person to set up becomes the owner, using the one-time setup code."
      >
        <Link
          href="/admin/setup"
          className="flex h-12 w-full items-center justify-center rounded-full bg-ink font-medium text-white hover:bg-ink-2"
        >
          Start setup
        </Link>
      </AuthFrame>
    );
  }
  return (
    <AuthFrame title="Welcome back" intro="Sign in to manage the Brand House website.">
      <LoginForm />
    </AuthFrame>
  );
}
