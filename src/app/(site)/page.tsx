import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { HomeDifference, HomeHero, HomeIntro, HomeProcess, HomeServices, HomeTestimonials, HomeWork } from "@/components/site/home";
import { CtaBand } from "@/components/CtaBand";
import { getContent } from "@/lib/cms/store";
import { featuredProjects } from "@/lib/cms/public";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} | Creative, Media & Digital Agency in Kenya`,
  absoluteTitle: true,
  description:
    "Creative, media and digital agency in Kenya. We build brands, produce commercials and brand films, design websites and run digital campaigns that grow visibility.",
  path: "/",
});

export default async function HomePage() {
  const content = await getContent();
  return (
    <>
      <HomeHero hero={content.hero} services={content.services} />
      <HomeWork projects={featuredProjects(content)} copy={content.pages.home} />
      <HomeIntro intro={content.intro} />
      <HomeServices services={content.services} copy={content.pages.home} />
      <HomeDifference difference={content.difference} image={content.difference.image} />
      <HomeProcess copy={content.pages.home} />
      <HomeTestimonials testimonials={content.testimonials} title={content.pages.home.testimonialsTitle} />
      <CtaBand />
    </>
  );
}
