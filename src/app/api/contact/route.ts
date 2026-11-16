import { after, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { saveEnquiry, updateEnquiry } from "@/lib/admin/enquiries";
import { notifyTeam } from "@/lib/admin/push";
import { dbConfigured } from "@/lib/db";
import { createLead, touchPulse } from "@/lib/biz/data";
import {
  enquirySchema,
  spamFieldsSchema,
  toFieldErrors,
  type ContactApiResponse,
  type Enquiry,
} from "@/lib/contact-schema";

/**
 * Project enquiry endpoint.
 *
 * Every enquiry becomes a lead in the admin (/admin/leads) and the team
 * gets a push notification on the installed admin app. An email copy is also
 * sent when the Resend email API (https://resend.com) is configured:
 *   RESEND_API_KEY      — API key from Resend
 *   CONTACT_TO_EMAIL    — inbox that receives enquiries (comma-separate several)
 *   CONTACT_FROM_EMAIL  — verified sender
 *
 * The visitor sees success once the enquiry is stored or emailed; if neither
 * worked they are told plainly that it was not sent.
 */

export const runtime = "nodejs";

const MIN_FILL_MS = 3_000; // faster than any person can complete the form
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // reject stale/replayed timestamps

// Best-effort, per-instance rate limit. Serverless instances are short-lived,
// so this only slows bursts; it is not a guarantee.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function json(body: ContactApiResponse, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function buildEmail(e: Enquiry) {
  const rows: [string, string][] = [
    ["Name", e.name],
    ["Organisation", e.organisation],
    ["Email", e.email],
    ["Phone", e.phone || "Not given"],
    ["Services", e.services.join(", ")],
    ["Budget", e.budget],
    ["Timeline", e.timeline],
    ["Heard about us", e.referral || "Not given"],
  ];
  const text = [
    `New project enquiry via ${siteConfig.domain}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Project description:",
    e.description,
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 16px">New project enquiry</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#666;vertical-align:top;padding-right:16px">${k}</td><td>${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
<h3 style="margin:24px 0 8px">Project description</h3>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(e.description)}</p>
<p style="color:#888;font-size:12px;margin-top:32px">Sent from the enquiry form on ${siteConfig.domain}. Reply to this email to respond to ${escapeHtml(e.name)}.</p>
</div>`;
  return { text, html };
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, code: "bad_request", message: "The form data could not be read. Refresh the page and try again." }, 400);
  }

  // 1. Spam checks
  const spam = spamFieldsSchema.safeParse(payload);
  if (!spam.success || spam.data.company_website.trim() !== "") {
    return json({ ok: false, code: "spam", message: "This submission was flagged as automated and was not sent." }, 422);
  }
  const startedAt = spam.data.startedAt;
  const elapsed = startedAt ? Date.now() - startedAt : 0;
  if (!startedAt || elapsed < MIN_FILL_MS || elapsed > MAX_AGE_MS) {
    return json(
      {
        ok: false,
        code: "spam",
        message: "That was sent a little too quickly to check. Wait a few seconds, then send it again.",
      },
      422,
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return json({ ok: false, code: "rate_limited", message: "Too many enquiries from this connection. Try again in a few minutes." }, 429);
  }

  // 2. Validation (same schema as the browser)
  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { ok: false, code: "validation", message: "Some fields need attention.", fieldErrors: toFieldErrors(parsed.error) },
      400,
    );
  }

  const enquiry = parsed.data;

  // 3. Save as a lead (database), or to Blob storage if the database is unreachable
  let leadId: string | null = null;
  let stored = null;
  if (dbConfigured()) {
    try {
      leadId = (await createLead({ source: "website", ...enquiry }))?.id ?? null;
    } catch (err) {
      console.error("[contact] Could not save the lead to the database:", err);
    }
  }
  if (!leadId) {
    try {
      stored = await saveEnquiry(enquiry);
    } catch (err) {
      console.error("[contact] Could not save enquiry to the inbox:", err);
    }
  }

  // 4. Email copy (optional)
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  let emailed = false;
  if (apiKey && to && from) {
    const { text, html } = buildEmail(enquiry);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: to.split(",").map((s) => s.trim()).filter(Boolean),
          reply_to: enquiry.email,
          subject: `Project enquiry: ${enquiry.organisation} (${enquiry.services.join(", ")})`,
          text,
          html,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      emailed = res.ok;
      if (!res.ok) console.error(`[contact] Resend responded ${res.status}: ${(await res.text().catch(() => "")).slice(0, 500)}`);
    } catch (err) {
      console.error("[contact] Email delivery error:", err);
    }
  }

  if (!leadId && !stored && !emailed) {
    return json(
      { ok: false, code: "delivery_failed", message: "Your enquiry could not be delivered just now. Try again in a minute." },
      502,
    );
  }

  // 5. Tell the team (after the visitor has their answer)
  after(async () => {
    if (stored && emailed) await updateEnquiry(stored.id, { emailed: true }).catch(() => undefined);
    if (leadId) await touchPulse().catch(() => undefined);
    await notifyTeam("enquiries", {
      title: `New lead: ${enquiry.name}`,
      body: `${enquiry.organisation} · ${enquiry.services.join(", ")} · ${enquiry.budget}`,
      url: leadId ? `/admin/leads/${leadId}` : stored ? `/admin/enquiries/${stored.id}` : "/admin/leads",
      tag: leadId ? `lead-${leadId}` : stored ? `enquiry-${stored.id}` : undefined,
    });
  });

  return json({ ok: true }, 200);
}
