const points = [
  {
    title: "One brand, every channel",
    body: "Your identity, films, website and social feeds are planned together, so customers meet the same brand wherever they find you.",
  },
  {
    title: "Creative and technical under one roof",
    body: "Designers, directors, developers and marketers share the brief. Nothing gets lost in a hand-off between agencies.",
  },
  {
    title: "Content made for your objectives",
    body: "We start with what the business needs to achieve, then decide what to shoot, design or build.",
  },
  {
    title: "Experiences built around real users",
    body: "Websites and campaigns are shaped by how your customers search, scroll and decide, not by guesswork.",
  },
  {
    title: "A process you can see into",
    body: "Clear stages, shared timelines and regular check-ins. You always know what is happening and what comes next.",
  },
];

export function Difference() {
  return (
    <section aria-labelledby="difference-title" className="bg-ink text-white">
      <div className="shell grid gap-14 py-24 md:grid-cols-12 md:py-36">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <h2 id="difference-title" className="type-display">
              One creative partner. A bigger picture.
            </h2>
            <p className="type-lead mt-8 max-w-[36ch] text-white/70">
              Most businesses juggle a designer, a production house, a web developer and a social media manager. We
              bring that work together so it adds up.
            </p>
          </div>
        </div>
        <ul className="md:col-span-6 md:col-start-7">
          {points.map((p) => (
            <li key={p.title} className="reveal border-t border-white/12 py-8 first:border-t-0 first:pt-0 md:py-10">
              <h3 className="type-h3">{p.title}</h3>
              <p className="mt-3 max-w-[48ch] leading-relaxed text-white/65">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
