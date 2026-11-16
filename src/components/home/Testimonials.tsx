import { testimonials } from "@/content/testimonials";
import { isDev } from "@/lib/env";

/**
 * Renders only genuine testimonials from src/content/testimonials.ts.
 * With none supplied: hidden in production, labelled placeholder in dev.
 */
export function Testimonials() {
  if (testimonials.length === 0) {
    if (!isDev) return null;
    return (
      <section aria-label="Testimonials placeholder" className="bg-paper">
        <div className="shell py-16">
          <div className="border-2 border-dashed border-ink/25 p-8 text-center text-mute-2">
            <p className="font-display text-lg text-ink">Testimonials section (development preview only)</p>
            <p className="mt-2 text-sm">
              Add approved client quotes to src/content/testimonials.ts. This placeholder is never shown in
              production.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="testimonials-title" className="bg-paper">
      <div className="shell py-24 md:py-36">
        <h2 id="testimonials-title" className="type-h2">
          What clients say
        </h2>
        <ul className="mt-14 grid gap-14 md:grid-cols-2">
          {testimonials.map((t) => (
            <li key={`${t.name}-${t.company}`}>
              <figure className="border-t border-ink/15 pt-8">
                <blockquote className="type-statement text-[clamp(1.35rem,2.4vw,2rem)]">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-6 text-mute-2">
                  <span className="font-medium text-ink">{t.name}</span>, {t.role}, {t.company}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
