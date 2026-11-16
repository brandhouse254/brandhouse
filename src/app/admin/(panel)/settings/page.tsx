import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { SettingsEditor } from "@/components/admin/editors/simple";

export const metadata: Metadata = { title: "Contact & social" };

export default async function Page() {
  const { content } = await readContent();
  return <SettingsEditor initial={content.settings} />;
}
