import type { DifferenceContent } from "@/lib/cms/types";

export function Difference({ difference }: { difference: DifferenceContent }) {
  const points = difference.points;
  return (
    <section aria-labelledby="difference-title" className="bg-ink text-white">
      <div className="shell grid gap-14 py-24 md:grid-cols-12 md:py-36">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <h2 id="difference-title" className="type-display">
              {difference.title}
            </h2>
            {difference.lead ? <p className="type-lead mt-8 max-w-[36ch] text-white/70">{difference.lead}</p> : null}
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
