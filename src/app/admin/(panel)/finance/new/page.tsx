import type { Metadata } from "next";
import { addDays, getBusinessSettings, getProject, todayKE } from "@/lib/biz/data";
import { editorOptions } from "@/lib/biz/editor-data";
import { PageHeader } from "@/components/admin/biz/bits";
import { InvoiceEditor } from "@/components/admin/biz/finance";

export const metadata: Metadata = { title: "New document" };

export default async function NewDocPage({ searchParams }: { searchParams: Promise<{ kind?: string; client?: string; project?: string }> }) {
  const sp = await searchParams;
  const kind = sp.kind === "quote" ? "quote" : "invoice";
  const [settings, options, project] = await Promise.all([getBusinessSettings(), editorOptions(), sp.project ? getProject(sp.project) : null]);
  const today = todayKE();
  const clientId = options.clients.some((c) => c.id === sp.client) ? sp.client! : (project?.clientId ?? "");
  return (
    <>
      <PageHeader
        back={{ href: `/admin/finance/${kind === "quote" ? "quotes" : "invoices"}`, label: kind === "quote" ? "Quotes" : "Invoices" }}
        title={kind === "quote" ? "New quote" : "New invoice"}
        description="The number is given when you save."
      />
      <InvoiceEditor
        vatRegistered={settings.vatRegistered}
        clients={options.clients}
        projects={options.projects}
        doc={{
          id: null,
          kind,
          clientId,
          projectId: project?.id ?? "",
          issueOn: today,
          dueOn: addDays(today, kind === "quote" ? 30 : settings.defaultDueDays),
          status: "draft",
          vatRate: settings.vatRegistered ? settings.defaultVatRate : 0,
          vatInclusive: false,
          discount: 0,
          notes: project && kind === "quote" ? project.description.slice(0, 1000) : "",
          terms: settings.defaultTerms,
          items: project?.budget ? [{ description: project.name, quantity: 1, unitPrice: project.budget }] : [],
        }}
      />
    </>
  );
}
