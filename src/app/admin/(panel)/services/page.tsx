import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { ServicesList } from "@/components/admin/editors/services";

export const metadata: Metadata = { title: "Services" };

export default async function Page() {
  const { content } = await readContent();
  return <ServicesList initial={content.services} />;
}
