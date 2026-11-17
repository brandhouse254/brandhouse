import { getContent } from "@/lib/cms/store";
import { SiteHeader } from "@/components/site/header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { JsonLd } from "@/components/JsonLd";
import { graph, organizationSchema, websiteSchema } from "@/lib/structured-data";

/** Chrome for the public website (the admin at /admin has its own layout). */
export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getContent();
  const { email, phone } = content.settings.contact;
  return (
    <>
      <SiteHeader email={email} phone={phone} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <JsonLd data={graph(organizationSchema(content), websiteSchema())} />
      <Analytics />
    </>
  );
}
