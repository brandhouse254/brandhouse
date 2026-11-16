export function Intro() {
  const facts = [
    {
      title: "Who we work with",
      body: "Established companies refreshing how they show up, and startups and growing businesses building a brand for the first time.",
    },
    {
      title: "What we bring together",
      body: "Brand identity, film and photography, websites and digital marketing, planned by one team so they work as one.",
    },
    {
      title: "What to expect",
      body: "A clear brief, honest timelines and costs, regular reviews, and work you can use the day it is delivered.",
    },
  ];
  return (
    <section aria-labelledby="intro-title" className="bg-paper">
      <div className="shell py-24 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 id="intro-title" className="type-display reveal md:col-span-8">
            More than creative. Built for impact.
          </h2>
          <p className="type-statement reveal text-ink/85 md:col-span-9 md:col-start-4 md:mt-10">
            We bring strategy, storytelling, design and digital together to help brands communicate clearly, connect
            with audiences and build lasting visibility.
          </p>
        </div>
        <ul className="mt-20 grid gap-10 md:mt-28 md:grid-cols-3 md:gap-8">
          {facts.map((f) => (
            <li key={f.title} className="reveal border-t border-ink/15 pt-6">
              <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{f.title}</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-mute-2">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
