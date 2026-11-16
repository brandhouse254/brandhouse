import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { ProjectEditor } from "@/components/admin/editors/work";

export const metadata: Metadata = { title: "Edit project" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { content } = await readContent();
  const key = slug === "new" ? "new" : slug;
  return (
    <ProjectEditor
      key={key}
      projects={content.projects}
      slug={slug === "new" ? null : slug}
      serviceNames={content.services.map((s) => s.title)}
    />
  );
}
