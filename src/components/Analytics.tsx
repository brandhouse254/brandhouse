import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * Privacy-conscious analytics, off by default. Nothing loads unless enabled:
 *
 *   NEXT_PUBLIC_VERCEL_ANALYTICS=1          → Vercel Web Analytics (cookieless).
 *                                             Also enable it in the Vercel
 *                                             project's Analytics tab.
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=brandhouse.co.ke
 *                                           → Plausible (cookieless).
 *
 * Both tools work without cookies, so no consent banner is added here. If you
 * add a cookie-based tool (e.g. Google Analytics or Meta Pixel), you must add
 * a consent mechanism first and update the privacy policy.
 */
export function Analytics() {
  const vercel = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "1";
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <>
      {vercel ? <VercelAnalytics /> : null}
      {plausible ? (
        <Script
          defer
          data-domain={plausible}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
