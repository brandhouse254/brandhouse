import { redirect } from "next/navigation";

/** The enquiries inbox became Leads. */
export default function EnquiriesPage() {
  redirect("/admin/leads");
}
