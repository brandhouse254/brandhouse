import type { Metadata } from "next";
import { readContent } from "@/lib/cms/store";
import { TestimonialsEditor } from "@/components/admin/editors/simple";

export const metadata: Metadata = { title: "Testimonials" };

export default async function Page() {
  const { content } = await readContent();
  return <TestimonialsEditor initial={content.testimonials} />;
}
