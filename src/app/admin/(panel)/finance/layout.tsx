import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { NotConnected } from "@/components/admin/biz/bits";
import { FinanceNav } from "@/components/admin/biz/finance";

/** Money is owners-only. */
export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  await requireUser("owner");
  if (!dbConfigured()) return <NotConnected />;
  return (
    <>
      <FinanceNav />
      {children}
    </>
  );
}
