import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEnquiry, updateEnquiry } from "@/lib/admin/enquiries";
import { EnquiryActions } from "@/components/admin/enquiry-actions";

export const metadata: Metadata = { title: "Enquiry" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-ink/8 py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-mute-2">{label}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let enquiry = await getEnquiry(id);
  if (!enquiry) notFound();
  if (!enquiry.read) enquiry = (await updateEnquiry(id, { read: true })) ?? enquiry;

  const received = new Date(enquiry.receivedAt).toLocaleString("en-KE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  });
  const phoneDigits = enquiry.phone.replace(/[^\d+]/g, "");
  const waDigits = phoneDigits.replace(/^\+/, "").replace(/^0/, "254");

  return (
    <div className="py-6">
      <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-sm text-mute-2 hover:text-ink">
        <ArrowLeft className="size-4" /> All enquiries
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em]">{enquiry.name}</h1>
      <p className="text-mute-2">
        {enquiry.organisation} · received {received}
      </p>

      <EnquiryActions
        id={enquiry.id}
        email={enquiry.email}
        subject={`Re: your project enquiry — ${enquiry.organisation}`}
        phone={phoneDigits}
        whatsapp={waDigits.length >= 9 ? waDigits : ""}
        firstName={enquiry.name.split(" ")[0] ?? enquiry.name}
      />

      <dl className="mt-6 rounded-2xl bg-white px-5 py-2 ring-1 ring-ink/10">
        <Row label="Email">
          <a href={`mailto:${enquiry.email}`} className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
            {enquiry.email}
          </a>
        </Row>
        <Row label="Phone">{enquiry.phone || <span className="text-mute-2">Not given</span>}</Row>
        <Row label="Services">{enquiry.services.join(", ")}</Row>
        <Row label="Budget">{enquiry.budget}</Row>
        <Row label="Timeline">{enquiry.timeline}</Row>
        <Row label="Heard about us">{enquiry.referral || <span className="text-mute-2">Not given</span>}</Row>
      </dl>

      <section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
        <h2 className="text-sm font-medium text-mute-2">Project description</h2>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">{enquiry.description}</p>
      </section>
    </div>
  );
}
