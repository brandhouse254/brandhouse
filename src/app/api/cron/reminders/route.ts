import { NextResponse } from "next/server";
import { safeEqualText } from "@/lib/auth/crypto";
import { dbConfigured } from "@/lib/db";
import { sendMorningReminders } from "@/lib/biz/agenda";

/**
 * Runs every morning (see vercel.json; 04:00 UTC = 07:00 in Nairobi) and
 * sends each team member a push with what's due today. Vercel signs the call
 * with CRON_SECRET; anything else is refused.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqualText(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  if (!dbConfigured()) return NextResponse.json({ sent: 0, skipped: "database not connected" });
  // Previews share the database's preview schema and must not ping the real team every morning.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return NextResponse.json({ sent: 0, skipped: "preview" });
  return NextResponse.json(await sendMorningReminders());
}
