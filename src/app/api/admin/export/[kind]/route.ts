import { assertUser } from "@/lib/auth/session";
import { listExpenses, listInvoices } from "@/lib/biz/data";
import { expensesCsv, invoicesCsv, paymentsCsv } from "@/lib/biz/reports";

/** CSV downloads for the accountant (opens in Excel or Google Sheets). Owners only. */
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  try {
    await assertUser("owner");
  } catch {
    return new Response("Only an owner can download this.", { status: 403 });
  }
  const { kind } = await params;
  const yearParam = new URL(request.url).searchParams.get("year");
  const year = yearParam && /^\d{4}$/.test(yearParam) ? yearParam : null;
  const inYear = (d: string) => !year || d.startsWith(year);

  let csv: string;
  if (kind === "invoices") {
    csv = invoicesCsv((await listInvoices()).filter((i) => inYear(i.issueOn)));
  } else if (kind === "payments") {
    const invoices = (await listInvoices())
      .filter((i) => i.kind !== "quote" && i.status !== "void")
      .map((i) => ({ ...i, payments: i.payments.filter((p) => inYear(p.paidOn)) }));
    csv = paymentsCsv(invoices);
  } else if (kind === "expenses") {
    csv = expensesCsv(year ? await listExpenses({ from: `${year}-01-01`, to: `${year}-12-31` }) : await listExpenses());
  } else {
    return new Response("Not found", { status: 404 });
  }
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="brandhouse-${kind}${year ? `-${year}` : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
