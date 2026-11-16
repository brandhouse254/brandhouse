import type { Metadata } from "next";
import { FilePlus2 } from "lucide-react";
import { listInvoices, todayKE } from "@/lib/biz/data";
import { invoiceStatuses } from "@/lib/biz/types";
import { LinkButton, PageHeader, Tabs } from "@/components/admin/biz/bits";
import { DocList } from "@/components/admin/biz/doc-list";

export const metadata: Metadata = { title: "Invoices" };

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const docs = await listInvoices({ kind: "invoice" });
  const shown = status === "all" ? docs : docs.filter((d) => d.status === status);
  return (
    <>
      <PageHeader
        title="Invoices"
        actions={
          <LinkButton href="/admin/finance/new?kind=invoice" variant="accent">
            <FilePlus2 className="size-4" /> New invoice
          </LinkButton>
        }
      />
      <Tabs
        current={status}
        items={[
          { id: "all", label: "All", href: "/admin/finance/invoices", count: docs.length },
          ...invoiceStatuses.invoice.map((s) => ({ id: s.id, label: s.label, href: `/admin/finance/invoices?status=${s.id}`, count: docs.filter((d) => d.status === s.id).length })),
        ]}
      />
      <DocList docs={shown} today={todayKE()} empty="Create one with the button above, or from a client or project." />
    </>
  );
}
