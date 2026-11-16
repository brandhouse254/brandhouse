import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { ServiceEditor } from "@/components/admin/editors/services";

export const metadata: Metadata = { title: "Edit service" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { content } = await readContent();
  return <ServiceEditor key={slug} services={content.services} slug={slug === "new" ? null : slug} />;
}
