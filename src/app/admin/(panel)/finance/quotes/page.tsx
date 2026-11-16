import type { Metadata } from "next";
import { FilePlus2 } from "lucide-react";
import { listInvoices, todayKE } from "@/lib/biz/data";
import { invoiceStatuses } from "@/lib/biz/types";
import { LinkButton, PageHeader, Tabs } from "@/components/admin/biz/bits";
import { DocList } from "@/components/admin/biz/doc-list";

export const metadata: Metadata = { title: "Quotes" };

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const docs = await listInvoices({ kind: "quote" });
  const shown = status === "all" ? docs : docs.filter((d) => d.status === status);
  return (
    <>
      <PageHeader
        title="Quotes"
        actions={
          <LinkButton href="/admin/finance/new?kind=quote" variant="accent">
            <FilePlus2 className="size-4" /> New quote
          </LinkButton>
        }
      />
      <Tabs
        current={status}
        items={[
          { id: "all", label: "All", href: "/admin/finance/quotes", count: docs.length },
          ...invoiceStatuses.quote.map((s) => ({ id: s.id, label: s.label, href: `/admin/finance/quotes?status=${s.id}`, count: docs.filter((d) => d.status === s.id).length })),
        ]}
      />
      <DocList docs={shown} today={todayKE()} empty="Create one with the button above, or from a client or project." />
    </>
  );
}
