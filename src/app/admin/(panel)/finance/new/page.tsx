import type { Metadata } from "next";
import { addDays, getBusinessSettings, getProject, todayKE } from "@/lib/biz/data";
import { editorOptions } from "@/lib/biz/editor-data";
import { docWords, type InvoiceKind } from "@/lib/biz/types";
import { PageHeader } from "@/components/admin/biz/bits";
import { DocEditor } from "@/components/admin/biz/doc-editor";

export const metadata: Metadata = { title: "New document" };

const back: Record<InvoiceKind, string> = { quote: "quotes", invoice: "invoices", receipt: "receipts" };

export default async function NewDocPage({ searchParams }: { searchParams: Promise<{ kind?: string; client?: string; project?: string }> }) {
  const sp = await searchParams;
  const kind: InvoiceKind = sp.kind === "quote" ? "quote" : sp.kind === "receipt" ? "receipt" : "invoice";
  const [settings, options, project] = await Promise.all([getBusinessSettings(), editorOptions(), sp.project ? getProject(sp.project) : null]);
  const today = todayKE();
  const clientId = options.clients.some((c) => c.id === sp.client) ? sp.client! : (project?.clientId ?? "");
  const client = options.clients.find((c) => c.id === clientId);
  const w = docWords[kind];
  return (
    <>
      <PageHeader
        back={{ href: `/admin/finance/${back[kind]}`, label: w.plural.charAt(0).toUpperCase() + w.plural.slice(1) }}
        title={`New ${w.word}`}
        description="The number is given when you save. The preview shows exactly what the client will see."
      />
      <DocEditor
        biz={settings}
        clients={options.clients}
        projects={options.projects}
        doc={{
          id: null,
          kind,
          clientId,
          projectId: project?.id ?? "",
          issueOn: today,
          dueOn: kind === "receipt" ? "" : addDays(today, kind === "quote" ? 30 : settings.defaultDueDays),
          status: kind === "receipt" ? "issued" : "draft",
          vatRate: settings.vatRegistered ? settings.defaultVatRate : 0,
          vatInclusive: kind === "receipt",
          discount: 0,
          notes: project && kind === "quote" ? project.description.slice(0, 1000) : "",
          terms: kind === "receipt" ? "" : settings.defaultTerms,
          items: project?.budget ? [{ description: project.name, quantity: 1, unitPrice: project.budget }] : [],
          billTo: client?.billTo ?? { name: "", company: "", email: "", phone: "", address: "" },
          projectTitle: project?.name ?? "",
          payMethods: [],
          showSignature: true,
          receipt: { method: "mpesa", reference: "" },
        }}
      />
    </>
  );
}
