import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { listEnquiries } from "@/lib/admin/enquiries";
import { timeAgoServer } from "@/lib/admin/time";
import { EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const enquiries = await listEnquiries();
  const unread = enquiries.filter((e) => !e.read).length;
  return (
    <>
      <header className="py-6">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Enquiries</h1>
        <p className="mt-0.5 text-sm text-mute-2">
          Messages sent from the Contact page{enquiries.length ? ` · ${enquiries.length} total${unread ? `, ${unread} new` : ""}` : ""}.
        </p>
      </header>
      {enquiries.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title="No enquiries yet"
          body="When someone sends the form on brandhouse.co.ke/contact it lands here, and you get a notification on the admin app."
        />
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
          {enquiries.map((e) => (
            <li key={e.id} className="border-b border-ink/8 last:border-b-0">
              <Link href={`/admin/enquiries/${e.id}`} className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-ink/4 sm:px-5">
                <span className={cn("size-2.5 shrink-0 rounded-full", e.read ? "bg-transparent" : "bg-accent")} aria-label={e.read ? undefined : "New"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={cn("truncate", e.read ? "text-ink/80" : "font-semibold text-ink")}>
                      {e.name} <span className="font-normal text-mute-2">· {e.organisation}</span>
                    </p>
                    <span className="shrink-0 text-xs text-ink/45">{timeAgoServer(e.receivedAt)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-mute-2">
                    {e.services.join(", ")} · {e.budget}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-ink/60">{e.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-ink/30" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
