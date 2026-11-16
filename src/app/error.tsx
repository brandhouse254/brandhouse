"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClasses } from "@/components/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-paper">
      <div className="shell flex min-h-[80svh] flex-col justify-center py-36">
        <h1 className="type-display max-w-[16ch]">This page didn’t load properly.</h1>
        <p className="type-lead mt-8 max-w-[44ch] text-ink/75">
          Something went wrong on our side. Try loading it again, or head back to the homepage.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <button type="button" onClick={reset} className={buttonClasses("primary")}>
            Try again
          </button>
          <Link href="/" className={buttonClasses("outline")}>
            Go to the homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
