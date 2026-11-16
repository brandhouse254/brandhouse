import Link from "next/link";
import { FileText } from "lucide-react";
import { invoiceStatuses, kes, labelOf, type Invoice } from "@/lib/biz/types";
import { EmptyState } from "@/components/admin/ui";
import { docTone, dueLabel, fmtDate, Pill } from "./bits";

export function DocList({ docs, today, empty }: { docs: Invoice[]; today: string; empty: string }) {
  if (!docs.length) return <EmptyState icon={<FileText className="size-6" />} title="Nothing here yet" body={empty} />;
  return (
    <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
      {docs.map((d) => {
        const late = d.kind === "invoice" && ["sent", "partial"].includes(d.status) ? dueLabel(d.dueOn, today) : null;
        return (
          <li key={d.id} className="border-b border-ink/8 last:border-b-0">
            <Link href={`/admin/finance/doc/${d.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-ink/4 sm:grid-cols-[8rem_minmax(0,1fr)_7rem_8rem_6rem]">
              <span className="font-medium tabular-nums">{d.number}</span>
              <span className="row-start-2 min-w-0 truncate text-sm text-mute-2 sm:row-start-auto sm:text-base sm:text-ink">{d.clientName ?? "No client"}</span>
              <span className="hidden text-sm text-mute-2 sm:block">{fmtDate(d.issueOn)}</span>
              <span className="text-right font-medium tabular-nums">
                {kes(d.totals.total)}
                {d.kind === "invoice" && d.totals.paid > 0 && d.totals.balance > 0.004 ? (
                  <span className="block text-xs font-normal text-mute-2">{kes(d.totals.balance)} due</span>
                ) : null}
              </span>
              <span className="row-start-2 flex justify-end sm:row-start-auto">
                {late && late.tone === "red" ? <Pill tone="red">{late.label}</Pill> : <Pill tone={docTone[d.status]}>{labelOf(invoiceStatuses[d.kind], d.status)}</Pill>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
