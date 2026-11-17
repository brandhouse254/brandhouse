import type { ReactNode } from "react";
import { DarkHero } from "./site/bits";

type Props = {
  title: string;
  intro?: ReactNode;
  crumbs?: { name: string; path: string }[];
  children?: ReactNode;
};

/** Opening section for text-led pages (privacy, legal). */
export function PageHero({ title, intro, crumbs, children }: Props) {
  return (
    <DarkHero title={title} intro={intro} crumbs={crumbs}>
      {children}
    </DarkHero>
  );
}
