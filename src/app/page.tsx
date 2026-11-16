import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Difference } from "@/components/home/Difference";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} | Creative, Media & Digital Agency in Kenya`,
  absoluteTitle: true,
  description:
    "Creative, media and digital agency in Kenya. We build brands, produce commercials and brand films, design websites and run digital campaigns that grow visibility.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <ServicesOverview />
      <SelectedWork />
      <Difference />
      <Process />
      <Testimonials />
      <CtaBand />
    </>
  );
}
