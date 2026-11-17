import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { pageMetadata } from "@/lib/seo";
import { DarkHero } from "@/components/site/bits";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Start a Project",
  description:
    "Tell Brand House about your brand, film, website or campaign project. Share your goals, budget and timeline and our team will be in touch.",
  path: "/contact",
});

export default async function ContactPage() {
  const { settings, services, pages } = await getContent();
  const { email, phone, whatsapp, whatsappMessage } = settings.contact;
  const copy = pages.contact;
  const direct = [
    email ? { label: "Email", value: email, href: `mailto:${email}` } : null,
    phone ? { label: "Call", value: phone, href: `tel:${phone.replace(/\s+/g, "")}` } : null,
    whatsapp ? { label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`, external: true } : null,
  ].filter(Boolean) as { label: string; value: string; href: string; external?: boolean }[];

  return (
    <>
      <DarkHero title={copy.title} crumbs={[{ name: "Contact", path: "/contact" }]} intro={copy.intro ? <p>{copy.intro}</p> : undefined}>
        {direct.length ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {direct.map((d) => (
              <li key={d.label}>
                <a
                  href={d.href}
                  {...(d.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.07] px-4 text-sm text-white ring-1 ring-white/10 transition-colors hover:bg-white hover:text-ink"
                >
                  <span className="text-white/50">{d.label}</span> {d.value}
                  {d.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </DarkHero>

      <section className="bg-paper-2">
        <div className="shell grid gap-4 py-10 md:py-16 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="rounded-[2rem] bg-white p-6 ring-1 ring-ink/8 sm:p-8 md:p-10">
              <h2 className="type-h2">Tell us about the project</h2>
              <div className="mt-8">
                <ContactForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} email={email} />
              </div>
            </div>
          </div>

          {copy.steps.length ? (
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="rounded-[2rem] bg-ink p-7 text-white lg:sticky lg:top-24 md:p-8">
                <h2 className="type-h3">What happens next</h2>
                <ol className="mt-6 space-y-6">
                  {copy.steps.map((n, i) => (
                    <li key={`${i}-${n.title}`} className="flex gap-4">
                      <span className="font-display text-sm tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-display text-lg font-semibold">{n.title}</h3>
                        <p className="mt-1 leading-relaxed text-white/65">{n.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
    </>
  );
}
