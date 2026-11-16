import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { WorkList } from "@/components/admin/editors/work";

export const metadata: Metadata = { title: "Work & projects" };

export default async function Page() {
  const { content } = await readContent();
  return <WorkList initial={content.projects} showSamples={content.settings.showSampleProjects} />;
}
