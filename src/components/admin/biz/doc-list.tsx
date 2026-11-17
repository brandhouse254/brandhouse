import Link from "next/link";
import { FileText } from "lucide-react";
import { invoiceStatuses, kes, labelOf, type Invoice } from "@/lib/biz/types";
import { EmptyState } from "@/components/admin/ui";
import { recipientName } from "@/lib/biz/sheet";
import { docTone, dueLabel, fmtDate, Pill } from "./bits";

export function DocList({ docs, today, empty }: { docs: Invoice[]; today: string; empty: string }) {
  if (!docs.length) return <EmptyState icon={<FileText className="size-6" />} title="Nothing here yet" body={empty} />;
  return (
    <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
      {docs.map((d) => {
        const late = d.kind === "invoice" && ["sent", "partial"].includes(d.status) ? dueLabel(d.dueOn, today) : null;
        return (
          <li key={d.id} className="border-b border-ink/8 last:border-b-0">
            <Link href={`/admin/finance/doc/${d.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink/4">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{recipientName(d) || "No client"}</span>
                <span className="block truncate text-xs text-mute-2">
                  <span className="tabular-nums">{d.number}</span> · {fmtDate(d.issueOn)}
                </span>
              </span>
              <span className="shrink-0 text-right font-medium tabular-nums">
                {kes(d.totals.total)}
                {d.kind === "invoice" && d.totals.paid > 0 && d.totals.balance > 0.004 ? (
                  <span className="block text-xs font-normal text-mute-2">{kes(d.totals.balance)} due</span>
                ) : null}
              </span>
              <span className="hidden w-28 shrink-0 justify-end sm:flex">
                {late && late.tone === "red" ? <Pill tone="red">{late.label}</Pill> : <Pill tone={docTone[d.status]}>{labelOf(invoiceStatuses[d.kind], d.status)}</Pill>}
              </span>
            </Link>
            <span className="-mt-2 flex px-5 pb-3 sm:hidden">
              {late && late.tone === "red" ? <Pill tone="red">{late.label}</Pill> : <Pill tone={docTone[d.status]}>{labelOf(invoiceStatuses[d.kind], d.status)}</Pill>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
