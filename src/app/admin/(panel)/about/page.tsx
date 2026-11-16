import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { AboutEditor } from "@/components/admin/editors/simple";

export const metadata: Metadata = { title: "About page" };

export default async function Page() {
  const { content } = await readContent();
  return <AboutEditor initial={content.about} />;
}
