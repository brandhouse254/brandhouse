// TEMPORARY (preview branch only): removes images uploaded by the automated admin test.
import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/session";

export async function POST() {
  const user = await currentUser();
  if (!user || user.role !== "owner" || process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "no" }, { status: 403 });
  }
  const { blobs } = await list({ prefix: "media/test-hero", limit: 1000 });
  if (blobs.length) await del(blobs.map((b) => b.url));
  const rest = await list({ prefix: "media/", limit: 1000 });
  return NextResponse.json({ deleted: blobs.map((b) => b.pathname), remaining: rest.blobs.map((b) => b.pathname) });
}
