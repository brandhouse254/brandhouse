"use client";

/**
 * Pages are statically generated, so the year is computed again in the
 * browser to stay current without a rebuild.
 */
export function CopyrightYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
