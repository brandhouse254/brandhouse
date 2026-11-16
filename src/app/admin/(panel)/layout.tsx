import { requireUser } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/shell";
import { paths } from "@/lib/cms/paths";
import { dbConfigured } from "@/lib/db";
import { myDueTaskCount, unreadLeadCount } from "@/lib/biz/data";
import { unreadEnquiryCount } from "@/lib/admin/enquiries";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  let counts = { leads: 0, tasks: 0 };
  if (dbConfigured()) {
    const [leads, tasks] = await Promise.all([unreadLeadCount().catch(() => 0), myDueTaskCount(user.id).catch(() => 0)]);
    counts = { leads, tasks };
  } else {
    counts.leads = await unreadEnquiryCount();
  }
  return (
    <AdminShell user={{ id: user.id, name: user.name, email: user.email, role: user.role }} mediaPrefix={paths.mediaPrefix} counts={counts}>
      {children}
    </AdminShell>
  );
}
