import { siWhatsapp } from "simple-icons";
import { siteConfig } from "@/config/site";

/**
 * Floating "chat on WhatsApp" button, bottom right on every page.
 * Opens wa.me with a short pre-filled message. Hidden if no number is set.
 */
export function WhatsAppButton() {
  const { whatsapp, whatsappMessage } = siteConfig.contact;
  if (!whatsapp) return null;
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <aside aria-label="Quick contact" className="print:hidden">
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Brand House on WhatsApp (opens in a new tab)"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-14 min-w-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-3.5 font-display text-[0.98rem] font-semibold text-ink shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 focus-visible:outline-offset-4 sm:right-6 sm:bottom-6 sm:pr-5 print:hidden"
    >
      {/* Official WhatsApp glyph from Simple Icons (CC0). */}
      <svg aria-hidden viewBox="0 0 24 24" className="size-7 shrink-0 fill-white">
        <path d={siWhatsapp.path} />
      </svg>
      <span className="hidden sm:inline">WhatsApp us</span>
    </a>
    </aside>
  );
}
