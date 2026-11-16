import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySigned } from "@/lib/auth/crypto";
import { dbConfigured } from "@/lib/db";
import { readPulse } from "@/lib/biz/data";

/**
 * Polled by the open admin app every so often. Returns the live version (so
 * the app updates itself after a deploy) and a stamp that changes whenever
 * the team changes anything (so screens refresh with the latest data).
 * Cheap on purpose: a signed-cookie check and one tiny query.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = verifySigned<{ exp: number }>((await cookies()).get("bh_admin")?.value);
  if (!payload || payload.exp < Date.now() / 1000) {
    return NextResponse.json({ error: "signed-out" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  let stamp = "";
  if (dbConfigured()) stamp = await readPulse().catch(() => "");
  return NextResponse.json(
    { version: process.env.NEXT_PUBLIC_APP_VERSION ?? "", stamp },
    { headers: { "Cache-Control": "no-store" } },
  );
}
