import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Brand House collects, uses and protects personal information submitted through brandhouse.co.ke.",
  path: "/privacy",
});

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * OWNER REVIEW REQUIRED
 * This policy is a plain-language starting point, not legal advice. Before
 * launch, confirm the items marked [CONFIRM] with the business owner and,
 * ideally, a lawyer familiar with Kenya's Data Protection Act, 2019.
 * Update LAST_UPDATED whenever the policy changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const LAST_UPDATED = "18 October 2026";

const analyticsOn =
  process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "1" || Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);

export default function PrivacyPage() {
  const email = siteConfig.contact.email;
  const contactLine = email ? (
    <a href={`mailto:${email}`} className="underline underline-offset-4">
      {email}
    </a>
  ) : (
    <>
      the <Link href="/contact" className="underline underline-offset-4">contact form</Link>
    </>
  );

  return (
    <>
      <PageHero
        title="Privacy policy"
        crumbs={[{ name: "Privacy policy", path: "/privacy" }]}
        intro={<p>Last updated {LAST_UPDATED}. This page explains what information we collect through this website and how we use it.</p>}
      />
      <section className="bg-paper">
        <div className="shell py-14 md:py-20">
          <div className="max-w-[68ch] space-y-12 text-lg leading-relaxed text-ink/85 [&_h2]:type-h3 [&_h2]:text-ink [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_p+p]:mt-4">
            <div>
              <h2>Who we are</h2>
              <p className="mt-4">
                This website, {siteConfig.domain}, is operated by {siteConfig.name}, {siteConfig.descriptor.toLowerCase()}.
                {/* [CONFIRM] Add the registered business name and address if required. */}
              </p>
            </div>

            <div>
              <h2>Information we collect</h2>
              <p className="mt-4">When you send a project enquiry, we collect the details you choose to give us:</p>
              <ul>
                <li>your name, business or organisation and email address</li>
                <li>your phone number, if you provide it</li>
                <li>the services, budget range and timeline you select</li>
                <li>your project description and how you heard about us, if you tell us</li>
              </ul>
              <p>
                Like most websites, our hosting provider automatically records basic technical information such as IP
                address, browser type and the pages requested, to keep the site secure and working.
              </p>
            </div>

            <div>
              <h2>How we use it</h2>
              <ul>
                <li>to reply to your enquiry and discuss your project</li>
                <li>to prepare proposals and, if we work together, to deliver the project</li>
                <li>to protect the website from spam and abuse</li>
              </ul>
              <p>We do not sell your personal information, and we do not add you to marketing lists without asking.</p>
            </div>

            <div>
              <h2>Who we share it with</h2>
              <p className="mt-4">We use a small number of service providers to run this website:</p>
              <ul>
                <li>Vercel, which hosts the website</li>
                <li>Resend, which delivers enquiry form submissions to our inbox</li>
                <li>our email provider, where enquiries are received and stored</li>
                {analyticsOn ? <li>a privacy-focused analytics service that does not use cookies</li> : null}
              </ul>
              <p>
                These providers may process data outside Kenya. We only use them to provide the services described here.
              </p>
            </div>

            <div>
              <h2>Cookies and analytics</h2>
              <p className="mt-4">
                This website does not use advertising or tracking cookies.
                {analyticsOn
                  ? " We use cookieless analytics to count page visits in aggregate. It does not identify you personally."
                  : " We do not currently run website analytics."}
              </p>
            </div>

            <div>
              <h2>How long we keep it</h2>
              <p className="mt-4">
                We keep enquiry details for as long as needed to respond and, if we work together, for the duration of
                the project and any period required for our business records. {/* [CONFIRM] retention period */}
              </p>
            </div>

            <div>
              <h2>Your choices</h2>
              <p className="mt-4">
                You can ask us to tell you what information we hold about you, to correct it, or to delete it. Contact us
                through {contactLine} and we will respond as soon as we reasonably can.
              </p>
            </div>

            <div>
              <h2>Changes to this policy</h2>
              <p className="mt-4">
                We may update this policy as the website or our services change. The date at the top shows when it was
                last revised.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
