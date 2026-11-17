import { draftMode } from "next/headers";
import { getContent } from "@/lib/cms/store";
import { PreviewBar } from "@/components/site/preview-bar";
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
  const { isEnabled: previewing } = await draftMode();
  return (
    <>
      <SiteHeader email={email} phone={phone} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
      {previewing ? <PreviewBar /> : <WhatsAppButton />}
      <JsonLd data={graph(organizationSchema(content), websiteSchema())} />
      {previewing ? null : <Analytics />}
    </>
  );
}
