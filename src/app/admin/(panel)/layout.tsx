import { requireUser } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/shell";
import { paths } from "@/lib/cms/paths";
import { unreadEnquiryCount } from "@/lib/admin/enquiries";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await unreadEnquiryCount();
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} mediaPrefix={paths.mediaPrefix} unread={unread}>
      {children}
    </AdminShell>
  );
}
