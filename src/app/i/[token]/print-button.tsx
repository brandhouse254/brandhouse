"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-[#111] px-4 text-sm font-medium text-white hover:bg-[#333]"
    >
      <Printer className="size-4" /> Print or save as PDF
    </button>
  );
}
