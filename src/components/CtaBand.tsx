import Link from "next/link";
import { getContent } from "@/lib/cms/store";

type Props = {
  title?: string;
  body?: string;
  /** Where the main button goes. Defaults to the contact page. */
  href?: string;
  label?: string;
};

/**
 * Closing call to action used on every page. The default heading, text and
 * button come from the admin (Page text › Call to action); pages can override.
 */
export async function CtaBand({ title, body, href = "/contact", label }: Props) {
  const { settings, pages } = await getContent();
  const email = settings.contact.email;
  return (
    <section aria-labelledby="cta-title" className="bg-paper">
      <div className="shell py-10 md:py-14">
        <div
          className="relative overflow-hidden rounded-[2.5rem] bg-accent px-6 py-14 text-[#111] sm:px-12 md:px-16 md:py-20"
          style={{ backgroundImage: "radial-gradient(36rem 24rem at 100% 0%, rgb(255 255 255 / 0.28), transparent 60%)" }}
        >
          <h2 id="cta-title" className="type-display relative max-w-[14ch]">
            {title ?? pages.cta.title}
          </h2>
          {(body ?? pages.cta.body) ? <p className="type-lead relative mt-6 max-w-[46ch] text-[#111]/75">{body ?? pages.cta.body}</p> : null}
          <div className="relative mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={href} className="inline-flex h-14 items-center gap-3 rounded-full bg-[#111] px-7 font-display font-medium text-white transition-transform hover:-translate-y-0.5">
              {label ?? pages.cta.buttonLabel} <span aria-hidden>→</span>
            </Link>
            {email ? (
              <a href={`mailto:${email}`} className="font-display text-lg underline decoration-[#111]/30 underline-offset-[6px] hover:decoration-[#111]">
                {email}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
