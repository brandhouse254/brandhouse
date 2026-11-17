import { getContent } from "@/lib/cms/store";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { NextHeader } from "@/components/next/header";

/**
 * Chrome for the /next homepage concept. It has its own floating header so the
 * live site's header stays exactly as it is until the new design is approved.
 */
export default async function ConceptLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { settings } = await getContent();
  return (
    <>
      <NextHeader email={settings.contact.email} phone={settings.contact.phone} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
