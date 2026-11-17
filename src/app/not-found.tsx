import Link from "next/link";
import type { Metadata } from "next";
import { buttonClasses } from "@/components/Button";
import SiteLayout from "./(site)/layout";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteLayout>
    <section
      className="bg-ink text-white"
      style={{ backgroundImage: "radial-gradient(60rem 40rem at 85% 0%, rgb(253 80 25 / 0.16), transparent 60%)" }}
    >
      <div className="shell flex min-h-[80svh] flex-col justify-center pb-16 pt-28">
        <div>
          <p className="font-display text-white/60">Error 404</p>
          <h1 className="type-display mt-4 max-w-[14ch]">This shot didn’t make the final cut.</h1>
          <p className="type-lead mt-8 max-w-[44ch] text-white/70">
            The page you are looking for has moved or doesn’t exist. Try one of these instead.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/" className={buttonClasses("primary")}>
              Go to the homepage
            </Link>
            <Link href="/work" className={buttonClasses("outline")}>
              See our work
            </Link>
            <Link href="/contact" className={buttonClasses("outline")}>
              Start a project
            </Link>
          </div>
        </div>
      </div>
    </section>
    </SiteLayout>
  );
}
