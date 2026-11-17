import type { Metadata } from "next";
import { Download, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin guide" };

const PDF = "/admin/guide/brand-house-admin-guide.pdf";
const PAGES = 18;

/** The how-to guide for the admin, readable here and downloadable as a PDF. */
export default async function GuidePage() {
  await requireUser();
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 py-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">Admin guide</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-mute-2">
            How to use everything here: getting started, leads, clients, projects, tasks, M-Pesa and payments, invoices and receipts, and editing the
            website. Prepared by Ciel Africa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={PDF}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-ink/15 hover:ring-ink/30"
          >
            <ExternalLink className="size-4" /> Open PDF
          </a>
          <a
            href={PDF}
            download="Brand-House-Admin-Guide.pdf"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-[#111] hover:bg-accent-deep"
          >
            <Download className="size-4" /> Download PDF
          </a>
        </div>
      </header>

      {/* Page images rather than an embedded PDF: phones (iPhone especially) only show the first page of an embedded PDF. */}
      <ol className="mx-auto max-w-3xl space-y-4 pb-10">
        {Array.from({ length: PAGES }, (_, i) => {
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={n} className="overflow-hidden rounded-xl bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] ring-1 ring-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/admin/guide/page-${n}.webp`}
                alt={`Guide page ${i + 1} of ${PAGES}`}
                width={900}
                height={1274}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                className="block h-auto w-full"
              />
            </li>
          );
        })}
      </ol>
    </>
  );
}
