import type { HeroContent } from "@/lib/cms/types";
import { ButtonLink } from "../Button";
import { Corners } from "../Corners";
import { HeroMedia } from "../HeroMedia";

export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink text-white"
    >
      {/* Image and optional background video are managed in the admin (Homepage → Hero). */}
      <HeroMedia
        poster={hero.image.src}
        posterAlt={hero.image.alt}
        videoSources={hero.video ? [hero.video] : []}
        timecode={hero.timecode}
      />

      {/* Viewfinder frame around the whole hero */}
      <div className="pointer-events-none absolute inset-x-[clamp(0.75rem,2.5vw,2rem)] bottom-[clamp(0.75rem,2.5vw,2rem)] top-[5.25rem] md:top-24">
        <Corners size="lg" />
      </div>

      <div className="shell relative z-10 pb-[clamp(3rem,9vh,6.5rem)] pt-40">
        <p className="hero-fade mb-6 font-display text-base text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)] md:text-lg">{hero.eyebrow}</p>
        <h1 id="hero-title" className="type-hero max-w-[12ch] md:max-w-none">
          <span className="hero-line">
            <span>{hero.line1}</span>
          </span>
          {hero.line2 ? (
            <span className="hero-line">
              <span>{hero.line2}</span>
            </span>
          ) : null}
        </h1>
        <div className="hero-fade mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
          <p className="type-lead max-w-[38ch] text-white/80 md:col-span-6 lg:col-span-5">
            {hero.lead}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-6 md:col-start-7 md:justify-end lg:col-span-7 lg:col-start-6">
            <ButtonLink href={hero.primaryCta.href} icon>
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="outline">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
