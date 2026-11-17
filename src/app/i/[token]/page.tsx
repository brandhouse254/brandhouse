import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbConfigured } from "@/lib/db";
import { getBusinessSettings, getClient, getInvoiceByToken } from "@/lib/biz/data";
import { sheetForDocument, sheetForPayment } from "@/lib/biz/sheet";
import { DocumentSheet } from "@/components/docs/sheet";
import { PrintButton } from "./print-button";

/** The quote, invoice or receipt a client opens from a shared link: branded and printable. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brand House document",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export default async function SharedDocument({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ r?: string }> }) {
  if (!dbConfigured()) notFound();
  const [{ token }, { r }] = await Promise.all([params, searchParams]);
  const doc = await getInvoiceByToken(token);
  if (!doc || (doc.kind === "invoice" && doc.status === "draft")) notFound();
  const [biz, client] = await Promise.all([getBusinessSettings(), doc.clientId ? getClient(doc.clientId) : null]);

  let data = sheetForDocument(doc, biz, client);
  if (r) {
    const index = doc.payments.findIndex((p) => p.id === r);
    if (index < 0) notFound();
    data = sheetForPayment(doc, doc.payments[index], index, biz, client);
  }

  return (
    <div className="min-h-svh bg-[#e9e6e0] py-6 print:bg-white print:py-0 sm:py-10">
      <div className="mx-auto mb-4 flex max-w-[52rem] items-center justify-between gap-3 px-4 print:hidden">
        <p className="text-sm text-[#555]">
          {data.title} {data.number} from {biz.legalName}
        </p>
        <PrintButton />
      </div>
      <div className="mx-auto max-w-[52rem] px-3 print:max-w-none print:px-0 sm:px-4">
        <DocumentSheet data={data} biz={biz} className="rounded-2xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)] print:rounded-none print:shadow-none" />
      </div>
    </div>
  );
}
