import type { Metadata } from "next";
import { getBusinessSettings } from "@/lib/biz/data";
import { PageHeader } from "@/components/admin/biz/bits";
import { BusinessSettingsForm } from "@/components/admin/biz/finance";

export const metadata: Metadata = { title: "Finance settings" };

export default async function FinanceSettingsPage() {
  const settings = await getBusinessSettings();
  return (
    <>
      <PageHeader title="Finance settings" description="Your details, payment options and numbering for quotes and invoices." />
      <BusinessSettingsForm initial={settings} />
      <p className="mt-6 text-xs leading-relaxed text-mute-2">
        Invoices made here are commercial invoices. They are not KRA eTIMS tax invoices. If Brand House is VAT-registered, also issue each sale through eTIMS so clients can claim the VAT.
      </p>
    </>
  );
}
