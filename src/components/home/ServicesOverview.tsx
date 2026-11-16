import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { Corners } from "../Corners";

function ServiceLink({ service, tone = "light" }: { service: Service; tone?: "light" | "dark" }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "mt-8 inline-flex min-h-11 items-center font-display font-medium underline underline-offset-[6px]",
        tone === "dark" ? "decoration-white/30 hover:decoration-white" : "decoration-ink/30 hover:decoration-ink",
      )}
    >
      Explore {service.title.toLowerCase()}
    </Link>
  );
}

function CapabilityList({ items, tone = "light", columns = 1 }: { items: string[]; tone?: "light" | "dark"; columns?: 1 | 2 }) {
  return (
    <ul
      className={cn(
        "mt-8 grid gap-x-8",
        columns === 2 && "sm:grid-cols-2",
        tone === "dark" ? "text-white/80" : "text-ink/80",
      )}
    >
      {items.map((c) => (
        <li
          key={c}
          className={cn("border-b py-3 leading-snug", tone === "dark" ? "border-white/12" : "border-ink/12")}
        >
          {c}
        </li>
      ))}
    </ul>
  );
}

function Idx({ n, tone = "light" }: { n: string; tone?: "light" | "dark" }) {
  return (
    <span className={cn("font-display text-sm tabular-nums", tone === "dark" ? "text-white/50" : "text-mute-2")}>
      {n}
    </span>
  );
}

/**
 * Each division gets its own composition. The first four follow the original
 * editorial spread (tall image, cinematic band, wide image, square board);
 * services added later reuse the same four layouts in turn.
 */
function ServiceBlock({ service, index }: { service: Service; index: number }) {
  const id = `svc-${service.slug}`;
  const variant = index % 4;
  if (variant === 0)
    return (
      <>
          {/* 01 Brand — tall image left, text right. On mobile: title, image, details. */}
          <article
            aria-labelledby={id}
            className="shell grid gap-10 py-16 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-8 md:gap-y-0 md:py-24"
          >
            <div className="md:col-span-6 md:col-start-7 md:row-start-1 md:self-end">
              <Idx n={service.number} />
              <h3 id={id} className="type-display mt-4">
                {service.title}
              </h3>
              <p className="type-lead mt-6 max-w-[44ch] text-ink/75">{service.summary}</p>
            </div>
            <div className="reveal-media relative aspect-[4/5] overflow-hidden md:col-span-5 md:col-start-1 md:row-span-2 md:row-start-1">
              <Image src={service.image.src} alt={service.image.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="md:col-span-6 md:col-start-7 md:row-start-2">
              <CapabilityList items={service.capabilities} />
              <ServiceLink service={service} />
            </div>
          </article>

      </>
    );
  if (variant === 1)
    return (
      <>
          {/* 02 Film — full-bleed cinematic band */}
          <article aria-labelledby={id} className="bg-ink text-white">
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]">
              <Image src={service.image.src} alt={service.image.alt} fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-[clamp(0.75rem,2.5vw,2rem)]">
                <Corners size="lg" />
              </div>
              <div className="shell absolute inset-x-0 bottom-0 pb-[clamp(2rem,5vw,4rem)]">
                <Idx n={service.number} tone="dark" />
                <h3 id={id} className="type-hero mt-4 max-w-[10ch]">
                  {service.title}
                </h3>
              </div>
            </div>
            <div className="shell grid gap-10 py-16 md:grid-cols-12 md:py-24">
              <p className="type-statement md:col-span-5">{service.summary}</p>
              <div className="md:col-span-6 md:col-start-7">
                <CapabilityList items={service.capabilities} tone="dark" columns={2} />
                <ServiceLink service={service} tone="dark" />
              </div>
            </div>
          </article>

      </>
    );
  if (variant === 2)
    return (
      <>
          {/* 03 Web — text left, wide image right. On mobile: title, image, details. */}
          <article
            aria-labelledby={id}
            className="shell grid gap-10 py-16 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-8 md:gap-y-0 md:py-28"
          >
            <div className="md:col-span-5 md:row-start-1 md:self-end">
              <Idx n={service.number} />
              <h3 id={id} className="type-display mt-4">
                {service.title}
              </h3>
              <p className="type-lead mt-6 max-w-[40ch] text-ink/75">{service.summary}</p>
            </div>
            <div className="reveal-media relative aspect-[16/11] overflow-hidden md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 md:self-center">
              <Image src={service.image.src} alt={service.image.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
            </div>
            <div className="md:col-span-5 md:row-start-2">
              <CapabilityList items={service.capabilities.slice(0, 6)} />
              <ServiceLink service={service} />
            </div>
          </article>

      </>
    );
  return (
    <>
          {/* 04 Marketing — text left, large square campaign board right. On mobile: title, image, details. */}
          <article
            aria-labelledby={id}
            className="shell grid gap-10 border-t border-ink/15 py-16 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-8 md:gap-y-0 md:py-28"
          >
            <div className="md:col-span-5 md:row-start-1 md:self-end">
              <Idx n={service.number} />
              <h3 id={id} className="type-display mt-4">
                {service.title}
              </h3>
              <p className="type-lead mt-6 max-w-[44ch] text-ink/75">{service.summary}</p>
            </div>
            <div className="reveal-media relative aspect-square overflow-hidden md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1">
              <Image src={service.image.src} alt={service.image.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
            </div>
            <div className="md:col-span-5 md:row-start-2">
              <CapabilityList items={service.capabilities} />
              <ServiceLink service={service} />
            </div>
          </article>
    </>
  );
}

export function ServicesOverview({ services }: { services: Service[] }) {
  if (services.length === 0) return null;
  return (
    <section aria-labelledby="services-title" className="bg-paper">
      <div className="shell pb-10">
        <div className="flex flex-col gap-6 border-t border-ink/15 pt-10 md:flex-row md:items-end md:justify-between">
          <h2 id="services-title" className="type-h2 max-w-[16ch]">
            {services.length === 4 ? "Four disciplines, one team." : "Our disciplines, one team."}
          </h2>
          <p className="max-w-md leading-relaxed text-mute-2">
            Each division stands on its own, and each one is stronger when it shares a brief with the others.
          </p>
        </div>
      </div>

      {services.map((service, i) => (
        <ServiceBlock key={service.slug} service={service} index={i} />
      ))}
    </section>
  );
}
