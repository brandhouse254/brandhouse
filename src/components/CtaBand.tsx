import { siteConfig } from "@/config/site";
import { ButtonLink } from "./Button";
import { Corners } from "./Corners";

type Props = {
  title?: string;
  body?: string;
  /** Where the primary button goes. Defaults to the contact page. */
  href?: string;
  label?: string;
};

export function CtaBand({
  title = "Let’s build something worth noticing.",
  body = "Have a brand to build, a story to tell or a business ready for its next chapter? Let’s talk.",
  href = siteConfig.cta.primary.href,
  label = siteConfig.cta.primary.label,
}: Props) {
  const email = siteConfig.contact.email;
  return (
    <section aria-labelledby="cta-title" className="bg-ink text-white">
      <div className="shell py-24 md:py-36">
        <div className="relative px-6 py-14 sm:px-10 md:px-16 md:py-24">
          <Corners size="lg" />
          <h2 id="cta-title" className="type-display max-w-[14ch]">
            {title}
          </h2>
          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
            <p className="type-lead text-white/70 md:col-span-6">{body}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 md:col-span-6 md:justify-end">
              <ButtonLink href={href} icon>
                {label}
              </ButtonLink>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-h-11 items-center font-display underline decoration-white/30 underline-offset-[6px] hover:decoration-white"
                >
                  {siteConfig.cta.email}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
