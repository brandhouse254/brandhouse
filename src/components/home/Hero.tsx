import { siteConfig } from "@/config/site";
import { ButtonLink } from "../Button";
import { Corners } from "../Corners";
import { HeroMedia } from "../HeroMedia";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink text-white"
    >
      {/* Still image for now. To use a showreel later, add the files to /public/media and pass
          videoSources={[{ src: "/media/showreel.webm", type: "video/webm" }, { src: "/media/showreel.mp4", type: "video/mp4" }]} */}
      <HeroMedia
        poster="/media/hero-poster.jpg"
        posterAlt="Abstract warm light, a placeholder for the Brand House showreel"
      />

      {/* Viewfinder frame around the whole hero */}
      <div className="pointer-events-none absolute inset-x-[clamp(0.75rem,2.5vw,2rem)] bottom-[clamp(0.75rem,2.5vw,2rem)] top-[5.25rem] md:top-24">
        <Corners size="lg" />
      </div>

      <div className="shell relative z-10 pb-[clamp(3rem,9vh,6.5rem)] pt-40">
        <p className="hero-fade mb-6 font-display text-base text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)] md:text-lg">{siteConfig.descriptor}</p>
        <h1 id="hero-title" className="type-hero max-w-[12ch] md:max-w-none">
          <span className="hero-line">
            <span>We build brands</span>
          </span>
          <span className="hero-line">
            <span>that move people.</span>
          </span>
        </h1>
        <div className="hero-fade mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
          <p className="type-lead max-w-[38ch] text-white/80 md:col-span-6 lg:col-span-5">
            From cinematic content and compelling brand identities to high-performing websites and digital
            campaigns, we help businesses stand out and grow.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-6 md:col-start-7 md:justify-end lg:col-span-7 lg:col-start-6">
            <ButtonLink href={siteConfig.cta.primary.href} icon>
              {siteConfig.cta.primary.label}
            </ButtonLink>
            <ButtonLink href={siteConfig.cta.work.href} variant="outline">
              {siteConfig.cta.work.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
