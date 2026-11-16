import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/config/site";
import { isIndexable } from "@/lib/env";
import { SOCIAL_IMAGE } from "@/lib/seo";
import { getContent } from "@/lib/cms/store";
import "./globals.css";

// Self-hosted variable fonts (SIL Open Font License), served by next/font with
// automatic preloading and size-adjusted fallbacks to prevent layout shift.
const spaceGrotesk = localFont({
  src: "../fonts/SpaceGrotesk-Variable.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const inter = localFont({
  src: "../fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getContent();
  const descriptor = settings.descriptor;
  const statement = settings.statement;
  return {
    // Canonicals and OG URLs always resolve to the production domain.
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} | ${descriptor}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: statement,
    applicationName: siteConfig.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: "/",
      title: `${siteConfig.name} | ${descriptor}`,
      description: statement,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} | ${descriptor}`,
      description: statement,
      images: [SOCIAL_IMAGE.url],
    },
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "business",
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
