import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Corners } from "@/components/Corners";

export const metadata: Metadata = pageMetadata({
  title: "About Us: Strategy, Storytelling, Design & Digital",
  description:
    "Brand House is a creative, media and digital agency bringing brand strategy, film production, web development and marketing together under one roof.",
  path: "/about",
});

/*
 * EDITING NOTE: this page deliberately contains no founding date, team size,
 * awards or client list. Add a team section or credentials here once they can
 * be stated accurately.
 */

const values = [
  {
    title: "Clarity over noise",
    body: "We would rather say one thing well than five things loudly. Good work is easy to understand.",
  },
  {
    title: "Craft in the details",
    body: "Type, timing, colour and code all get the same care, because customers notice when they are off.",
  },
  {
    title: "Honest about what works",
    body: "We tell clients what we think, report results as they are, and say so when a different approach would serve them better.",
  },
  {
    title: "Rooted here, built to travel",
    body: "We design for how people in Kenya discover and choose brands, and make work that holds up wherever it travels.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="We build brands that people recognise, remember and choose."
        crumbs={[{ name: "About", path: "/about" }]}
        intro={
          <p>
            Brand House is a creative, media and digital agency. We sit where strategy, storytelling, design and
            technology meet, and we help businesses use all four to grow their visibility.
          </p>
        }
      />

      {/* Purpose */}
      <section aria-labelledby="purpose-title" className="bg-paper">
        <div className="shell grid gap-12 pb-24 md:grid-cols-12 md:pb-36">
          <div className="relative aspect-[4/5] md:col-span-5">
            <Image
              src="/media/about.jpg"
              alt="Abstract placeholder of warm and teal out-of-focus light"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-3">
              <Corners />
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:self-end">
            <h2 id="purpose-title" className="type-h2">
              Why we exist
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/80">
              <p>
                Most businesses have to piece together their brand from several suppliers: a designer for the logo, a
                production company for the advert, a developer for the website, someone else for social media. Each
                does their part, but the parts rarely add up to one clear brand.
              </p>
              <p>
                Brand House exists to close that gap: one team that learns the business, sets the creative direction,
                and carries it through every channel where customers will meet it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section aria-labelledby="approach-title" className="bg-ink text-white">
        <div className="shell py-24 md:py-36">
          <h2 id="approach-title" className="type-display max-w-[16ch]">
            Strategy first, then the craft.
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-12">
            <p className="type-lead text-white/75 md:col-span-6">
              Every project starts with the same questions: who are we trying to reach, what do they need to believe,
              and what should they do next? The answers decide whether the right move is a new identity, a film, a
              website, a campaign or a mix of them.
            </p>
            <p className="type-lead text-white/75 md:col-span-5 md:col-start-8">
              Then we make it properly. Directors, designers, developers and marketers work from one brief, so the film
              looks like the brand, the website tells the same story, and the campaign sends people somewhere worth
              arriving.
            </p>
          </div>
        </div>
      </section>

      {/* How the divisions connect */}
      <section aria-labelledby="divisions-title" className="bg-paper">
        <div className="shell py-24 md:py-36">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <h2 id="divisions-title" className="type-h2 md:col-span-6">
              Four divisions that share one brief
            </h2>
            <p className="leading-relaxed text-mute-2 md:col-span-5 md:col-start-8">
              Each division can work on its own. When they work together, decisions made in one carry through to the
              others.
            </p>
          </div>
          <ol className="mt-16 grid gap-px bg-ink/15 md:grid-cols-4">
            {services.map((s, i) => (
              <li key={s.slug} className="bg-paper py-8 md:px-6 md:first:pl-0">
                <span className="font-display text-sm tabular-nums text-mute-2">{s.number}</span>
                <h3 className="type-h3 mt-3">
                  <Link href={`/services/${s.slug}`} className="hover:underline hover:underline-offset-4">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-3 leading-relaxed text-mute-2">
                  {
                    [
                      "Sets the positioning and visual identity every other division works from.",
                      "Turns the brand into film and photography for ads, launches and social.",
                      "Gives the brand a home online and turns visitors into enquiries and sales.",
                      "Puts the content in front of the right audience and measures what it achieves.",
                    ][i]
                  }
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="bg-paper-2">
        <div className="shell py-24 md:py-36">
          <h2 id="values-title" className="type-h2">
            What we value
          </h2>
          <ul className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-2">
            {values.map((v) => (
              <li key={v.title} className="reveal border-t border-ink/15 pt-6">
                <h3 className="type-h3">{v.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-mute-2">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title="Have something worth building?" body="Tell us about the business and what you want to change. We will take it from there." />
    </>
  );
}
