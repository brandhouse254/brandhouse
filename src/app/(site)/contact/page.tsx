import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Start a Project",
  description:
    "Tell Brand House about your brand, film, website or campaign project. Share your goals, budget and timeline and our team will be in touch.",
  path: "/contact",
});

const next = [
  { title: "We read your brief", body: "Every enquiry is read by the people who would work on it." },
  { title: "We get in touch", body: "We follow up to ask questions and understand what success looks like for you." },
  { title: "We propose a plan", body: "You receive a suggested approach, timeline and cost to review before anything is agreed." },
];

export default async function ContactPage() {
  const { settings, services } = await getContent();
  const { email, phone, whatsapp, whatsappMessage } = settings.contact;
  return (
    <section className="bg-paper">
      <div className="shell grid gap-16 pb-24 pt-32 md:pb-36 md:pt-44 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} className="mb-10 text-mute-2" />
            <h1 className="type-display">Start a project</h1>
            <p className="type-lead mt-8 max-w-[40ch] text-ink/75">
              Whether you have a detailed brief or just an idea, tell us what you want to build. The more context you
              share, the more useful our first conversation will be.
            </p>

            <h2 className="type-h3 mt-14">What happens next</h2>
            <ol className="mt-6 space-y-6">
              {next.map((n, i) => (
                <li key={n.title} className="flex gap-5">
                  <span className="font-display text-sm tabular-nums text-mute-2">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{n.title}</h3>
                    <p className="mt-1 leading-relaxed text-mute-2">{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {email || phone ? (
              <div className="mt-14 border-t border-ink/15 pt-8">
                <h2 className="type-h3">Prefer to write directly?</h2>
                <ul className="mt-4 space-y-2">
                  {email ? (
                    <li>
                      <a href={`mailto:${email}`} className="font-display text-xl underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
                        {email}
                      </a>
                    </li>
                  ) : null}
                  {phone ? (
                    <li>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-display text-xl underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink">
                        {phone}
                      </a>
                    </li>
                  ) : null}
                  {whatsapp ? (
                    <li>
                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display text-xl underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink"
                      >
                        Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7">
          <h2 className="sr-only">Project enquiry form</h2>
          <ContactForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} email={email} />
        </div>
      </div>
    </section>
  );
}
