import type { Metadata } from "next";
import { MediaScreen } from "@/components/admin/screens";

export const metadata: Metadata = { title: "Media library" };

export default function Page() {
  return <MediaScreen />;
}
