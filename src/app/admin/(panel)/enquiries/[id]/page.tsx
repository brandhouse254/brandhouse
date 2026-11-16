import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";
import { leadByLegacyId } from "@/lib/biz/data";
import { importBlobEnquiries } from "@/lib/biz/import";

/** Old notification links (/admin/enquiries/…) open the matching lead. */
export default async function EnquiryRedirect({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  if (!dbConfigured()) redirect("/admin/leads");
  let leadId = await leadByLegacyId(id);
  if (!leadId) {
    await importBlobEnquiries(true);
    leadId = await leadByLegacyId(id);
  }
  redirect(leadId ? `/admin/leads/${leadId}` : "/admin/leads");
}
