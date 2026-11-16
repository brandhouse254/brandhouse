import type { IntroContent } from "@/lib/cms/types";

export function Intro({ intro }: { intro: IntroContent }) {
  const facts = intro.facts;
  return (
    <section aria-labelledby="intro-title" className="bg-paper">
      <div className="shell py-24 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 id="intro-title" className="type-display reveal md:col-span-8">
            {intro.title}
          </h2>
          {intro.statement ? (
            <p className="type-statement reveal text-ink/85 md:col-span-9 md:col-start-4 md:mt-10">{intro.statement}</p>
          ) : null}
        </div>
        {facts.length ? (
        <ul className="mt-20 grid gap-10 md:mt-28 md:grid-cols-3 md:gap-8">
          {facts.map((f) => (
            <li key={f.title} className="reveal border-t border-ink/15 pt-6">
              <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{f.title}</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-mute-2">{f.body}</p>
            </li>
          ))}
        </ul>
        ) : null}
      </div>
    </section>
  );
}
