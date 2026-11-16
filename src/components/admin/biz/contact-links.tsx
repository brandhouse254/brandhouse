import { siWhatsapp } from "simple-icons";
import { Mail, PhoneCall } from "lucide-react";

/** Email / WhatsApp / Call buttons for a person, ready to use on a phone. */
export function ContactLinks({ name, email, phone, subject }: { name: string; email: string; phone: string; subject: string }) {
  const digits = phone.replace(/[^\d+]/g, "");
  const wa = digits.replace(/^\+/, "").replace(/^0/, "254");
  const first = name.split(" ")[0] || name;
  const cls = "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-inset";
  return (
    <div className="flex flex-wrap gap-2">
      {email ? (
        <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} className={`${cls} bg-white ring-ink/15 hover:ring-ink/30`}>
          <Mail className="size-4" /> Email
        </a>
      ) : null}
      {wa.length >= 9 ? (
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi ${first}, this is Brand House.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cls} bg-white ring-ink/15 hover:ring-ink/30`}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-[#25D366]">
            <path d={siWhatsapp.path} />
          </svg>
          WhatsApp
        </a>
      ) : null}
      {digits ? (
        <a href={`tel:${digits}`} className={`${cls} bg-white ring-ink/15 hover:ring-ink/30`}>
          <PhoneCall className="size-4" /> Call
        </a>
      ) : null}
    </div>
  );
}
