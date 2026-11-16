"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { siWhatsapp } from "simple-icons";
import { Mail, MailOpen, PhoneCall, Trash2 } from "lucide-react";
import { removeEnquiry, setEnquiryRead } from "@/lib/admin/actions";
import { Button } from "./ui";

export function EnquiryActions({
  id,
  email,
  subject,
  phone,
  whatsapp,
  firstName,
}: {
  id: string;
  email: string;
  subject: string;
  phone: string;
  whatsapp: string;
  firstName: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const link = "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-inset";
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} className={`${link} bg-accent font-semibold text-[#111] ring-accent hover:bg-accent-deep`}>
        <Mail className="size-4" /> Reply by email
      </a>
      {whatsapp ? (
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi ${firstName}, thanks for your enquiry to Brand House.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${link} bg-white ring-ink/15 hover:ring-ink/30`}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-[#25D366]">
            <path d={siWhatsapp.path} />
          </svg>
          WhatsApp
        </a>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className={`${link} bg-white ring-ink/15 hover:ring-ink/30`}>
          <PhoneCall className="size-4" /> Call
        </a>
      ) : null}
      <Button
        variant="ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await setEnquiryRead(id, false);
            router.push("/admin/enquiries");
          })
        }
      >
        <MailOpen className="size-4" /> Mark as new
      </Button>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this enquiry? This can't be undone.")) return;
          start(async () => {
            const r = await removeEnquiry(id);
            if (r.ok) router.push("/admin/enquiries");
            else alert(r.error);
          });
        }}
      >
        <Trash2 className="size-4" /> Delete
      </Button>
    </div>
  );
}
