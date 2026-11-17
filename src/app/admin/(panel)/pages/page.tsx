import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { PagesEditor } from "@/components/admin/editors/pages";

export const metadata: Metadata = { title: "Page text" };

export default async function Page() {
  const { content } = await readContent();
  return <PagesEditor initial={content.pages} />;
}
