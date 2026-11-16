import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getContent } from "@/lib/cms/store";
import { activeSocialLinks } from "@/lib/cms/public";
import { Logo } from "./Logo";
import { CopyrightYear } from "./CopyrightYear";

export async function Footer() {
  const content = await getContent();
  const { services, settings } = content;
  const socialLinks = activeSocialLinks(content);
  const { email, phone, location, whatsapp } = settings.contact;
  const hasContact = Boolean(email || phone || location);

  return (
    <footer className="bg-ink text-white">
      <div className="shell pt-20 pb-10 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" aria-label="Brand House home" className="inline-block">
              <Logo className="h-14 md:h-16" />
            </Link>
            <p className="mt-6 font-display text-lg text-white">{settings.descriptor}</p>
            <p className="mt-3 max-w-sm text-white/60">{settings.statement}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            <div>
              <h2 className="type-meta text-white/50">Services</h2>
              <ul className="mt-4 space-y-1">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="inline-flex min-h-10 items-center hover:text-accent">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="type-meta text-white/50">Studio</h2>
              <ul className="mt-4 space-y-1">
                {[...siteConfig.nav, { label: "Start a project", href: "/contact" }]
                  .filter((v, i, a) => a.findIndex((x) => x.href === v.href) === i)
                  .map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="inline-flex min-h-10 items-center hover:text-accent">
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="type-meta text-white/50">Contact</h2>
              <ul className="mt-4 space-y-1">
                {email ? (
                  <li>
                    <a href={`mailto:${email}`} className="inline-flex min-h-10 items-center break-all hover:text-accent">
                      {email}
                    </a>
                  </li>
                ) : null}
                {phone ? (
                  <li>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="inline-flex min-h-10 items-center hover:text-accent">
                      {phone}
                    </a>
                  </li>
                ) : null}
                {whatsapp ? (
                  <li>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center hover:text-accent"
                    >
                      WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ) : null}
                {location ? <li className="py-2 text-white/70">{location}</li> : null}
                {!hasContact ? (
                  <li>
                    <Link href="/contact" className="inline-flex min-h-10 items-center hover:text-accent">
                      Send an enquiry
                    </Link>
                  </li>
                ) : null}
              </ul>
              {socialLinks.length ? (
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
                  {socialLinks.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center text-white/70 hover:text-accent"
                      >
                        {s.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className="inline-flex min-h-10 items-center hover:text-white">
                Privacy policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
