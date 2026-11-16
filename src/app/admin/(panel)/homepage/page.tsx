import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { HomepageEditor } from "@/components/admin/editors/homepage";

export const metadata: Metadata = { title: "Homepage" };

export default async function Page() {
  const { content } = await readContent();
  return <HomepageEditor hero={content.hero} intro={content.intro} difference={content.difference} />;
}
