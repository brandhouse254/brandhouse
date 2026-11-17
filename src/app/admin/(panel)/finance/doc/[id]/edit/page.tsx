import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessSettings, getClient, getInvoice } from "@/lib/biz/data";
import { editorOptions } from "@/lib/biz/editor-data";
import { billToOf } from "@/lib/biz/sheet";
import { PageHeader } from "@/components/admin/biz/bits";
import { DocEditor } from "@/components/admin/biz/doc-editor";

export const metadata: Metadata = { title: "Edit" };

export default async function EditDocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc, settings, options] = await Promise.all([getInvoice(id), getBusinessSettings(), editorOptions()]);
  if (!doc) notFound();
  const client = doc.clientId ? await getClient(doc.clientId) : null;
  const pay = doc.payments[0];
  return (
    <>
      <PageHeader back={{ href: `/admin/finance/doc/${id}`, label: doc.number }} title={`Edit ${doc.number}`} />
      <DocEditor
        biz={settings}
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
          billTo: billToOf(doc, client),
          projectTitle: doc.projectTitle,
          payMethods: doc.payMethods,
          showSignature: doc.showSignature,
          receipt: { method: pay?.method ?? "mpesa", reference: pay?.reference ?? "" },
        }}
      />
    </>
  );
}
