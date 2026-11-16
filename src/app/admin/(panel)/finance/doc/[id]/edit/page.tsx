import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessSettings, getInvoice } from "@/lib/biz/data";
import { editorOptions } from "@/lib/biz/editor-data";
import { PageHeader } from "@/components/admin/biz/bits";
import { InvoiceEditor } from "@/components/admin/biz/finance";

export const metadata: Metadata = { title: "Edit" };

export default async function EditDocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc, settings, options] = await Promise.all([getInvoice(id), getBusinessSettings(), editorOptions()]);
  if (!doc) notFound();
  return (
    <>
      <PageHeader back={{ href: `/admin/finance/doc/${id}`, label: doc.number }} title={`Edit ${doc.number}`} />
      <InvoiceEditor
        vatRegistered={settings.vatRegistered}
        clients={options.clients}
        projects={options.projects}
        doc={{
          id: doc.id,
          kind: doc.kind,
          number: doc.number,
          clientId: doc.clientId ?? "",
          projectId: doc.projectId ?? "",
          issueOn: doc.issueOn,
          dueOn: doc.dueOn ?? "",
          status: doc.status,
          vatRate: doc.vatRate,
          vatInclusive: doc.vatInclusive,
          discount: doc.discount,
          notes: doc.notes,
          terms: doc.terms,
          items: doc.items,
        }}
      />
    </>
  );
}
