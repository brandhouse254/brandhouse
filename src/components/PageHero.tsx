import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

type Props = {
  title: string;
  intro?: ReactNode;
  crumbs?: { name: string; path: string }[];
  children?: ReactNode;
};

/** Editorial hero for light, text-led pages. */
export function PageHero({ title, intro, crumbs, children }: Props) {
  return (
    <section className="bg-paper">
      <div className="shell pb-16 pt-32 md:pb-24 md:pt-44">
        {crumbs ? <Breadcrumbs items={crumbs} className="mb-10 text-mute-2" /> : null}
        <h1 className="type-display max-w-[16ch]">{title}</h1>
        {intro ? <div className="type-lead mt-8 max-w-[52ch] text-ink/75 md:mt-10">{intro}</div> : null}
        {children}
      </div>
    </section>
  );
}
