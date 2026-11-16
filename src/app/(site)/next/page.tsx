import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { visibleProjects } from "@/lib/cms/public";
import { NextCta, NextDifference, NextHero, NextIntro, NextProcess, NextServices, NextTestimonials, NextWork } from "@/components/next/home";

/**
 * Homepage concept for approval. Uses the same content as the live homepage
 * (edited in the admin) with new art direction and photography. Not indexed.
 */
export const metadata: Metadata = {
  title: "Homepage preview",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: "/" },
};

export default async function NextHomePage() {
  const content = await getContent();
  return (
    <>
      <NextHero hero={content.hero} services={content.services} />
      <NextIntro intro={content.intro} />
      <NextServices services={content.services} />
      <NextWork projects={visibleProjects(content)} />
      <NextDifference difference={content.difference} />
      <NextProcess />
      <NextTestimonials testimonials={content.testimonials} />
      <NextCta email={content.settings.contact.email} />
    </>
  );
}
