"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { siWhatsapp } from "simple-icons";
import {
  ArrowRightLeft,
  Ban,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  Paperclip,
  Pencil,
  Plus,
  Receipt,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  convertQuote,
  recordPayment,
  removeDocument,
  removeExpense,
  removePayment,
  saveBusinessSettings,
  saveExpense,
  saveInvoice,
  setDocumentStatus,
} from "@/lib/biz/actions";
import {
  computeTotals,
  expenseCategories,
  kes,
  paymentMethods,
  type BusinessSettings,
  type Expense,
  type Invoice,
  type InvoiceKind,
} from "@/lib/biz/types";
import { useUnsavedFlag } from "@/lib/admin/dirty";
import { cn } from "@/lib/cn";
import { Button, IconButton, Toggle } from "../ui";
import { useUploader } from "../media";
import { Choice, ErrorNote, Input, Label, Modal, TextBox, useAction } from "./kit";

type Option = { id: string; label: string };

export function FinanceNav() {
  const path = usePathname() ?? "";
  const items = [
    { href: "/admin/finance", label: "Overview" },
    { href: "/admin/finance/invoices", label: "Invoices" },
    { href: "/admin/finance/quotes", label: "Quotes" },
    { href: "/admin/finance/expenses", label: "Expenses" },
    { href: "/admin/finance/reports", label: "Reports" },
    { href: "/admin/finance/settings", label: "Settings" },
  ];
  const current = items.filter((i) => path === i.href || path.startsWith(`${i.href}/`)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav className="-mx-4 overflow-x-auto px-4 pt-5 sm:mx-0 sm:px-0" aria-label="Finance">
      <ul className="flex w-max gap-1 rounded-full bg-white p-1 ring-1 ring-ink/10">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={i.href === current ? "page" : undefined}
              className={cn(
                "flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium",
                i.href === current ? "bg-ink text-paper" : "text-ink/65 hover:text-ink",
              )}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ───────────── Quote / invoice editor ───────────── */

type Line = { key: number; description: string; quantity: string; unitPrice: string };

export type EditorDoc = {
  id: string | null;
  kind: InvoiceKind;
  number?: string;
  clientId: string;
  projectId: string;
  issueOn: string;
  dueOn: string;
  status: string;
  vatRate: number;
  vatInclusive: boolean;
  discount: number;
  notes: string;
  terms: string;
  items: { description: string; quantity: number; unitPrice: number }[];
};

export function InvoiceEditor({
  doc,
  clients,
  projects,
  vatRegistered,
}: {
  doc: EditorDoc;
  clients: Option[];
  projects: (Option & { clientId: string | null })[];
  vatRegistered: boolean;
}) {
  const router = useRouter();
  const seq = useRef(doc.items.length + 1);
  const start = useMemo(
    () => ({
      clientId: doc.clientId,
      projectId: doc.projectId,
      issueOn: doc.issueOn,
      dueOn: doc.dueOn,
      vatRate: String(doc.vatRate),
      vatInclusive: doc.vatInclusive,
      discount: doc.discount ? String(doc.discount) : "",
      notes: doc.notes,
      terms: doc.terms,
      lines: (doc.items.length ? doc.items : [{ description: "", quantity: 1, unitPrice: 0 }]).map((it, i) => ({
        key: i,
        description: it.description,
        quantity: String(it.quantity),
        unitPrice: it.unitPrice ? String(it.unitPrice) : "",
      })) as Line[],
    }),
    [doc],
  );
  const [f, setF] = useState(start);
  const { run, pending, error } = useAction();
  const dirty = JSON.stringify(f) !== JSON.stringify(start);
  useUnsavedFlag(dirty);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const setLine = (key: number, patch: Partial<Line>) => set("lines", f.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const items = f.lines.map((l) => ({ description: l.description, quantity: Number(l.quantity) || 0, unitPrice: Number(l.unitPrice) || 0 }));
  const totals = computeTotals(items, { vatRate: Number(f.vatRate) || 0, vatInclusive: f.vatInclusive, discount: Number(f.discount) || 0 });
  const clientProjects = projects.filter((p) => !f.clientId || p.clientId === f.clientId);
  const label = doc.kind === "quote" ? "quote" : "invoice";

  const submit = (status: string) =>
    run(
      () =>
        saveInvoice(doc.id, doc.kind, {
          clientId: f.clientId,
          projectId: f.projectId,
          issueOn: f.issueOn,
          dueOn: f.dueOn,
          status,
          vatRate: Number(f.vatRate) || 0,
          vatInclusive: f.vatInclusive,
          discount: Number(f.discount) || 0,
          notes: f.notes,
          terms: f.terms,
          items: items.filter((i) => i.description.trim() || i.unitPrice),
        }),
      (r) => {
        setF(f);
        router.push(`/admin/finance/doc/${r.id}`);
      },
    );

  return (
    <div className="grid gap-5 pb-28 lg:grid-cols-[minmax(0,1fr)_20rem] lg:pb-6">
      <div className="min-w-0 space-y-5">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
          <div className="grid gap-4 sm:grid-cols-2">
            <Choice
              label="Client"
              value={f.clientId}
              onValue={(v) => setF((x) => ({ ...x, clientId: v, projectId: projects.find((p) => p.id === x.projectId)?.clientId === v ? x.projectId : "" }))}
              placeholder="Choose a client"
              options={clients.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Choice label="Project" value={f.projectId} onValue={(v) => set("projectId", v)} placeholder="No project" options={clientProjects.map((p) => ({ value: p.id, label: p.label }))} />
            <Input label={doc.kind === "quote" ? "Date" : "Invoice date"} type="date" value={f.issueOn} onValue={(v) => set("issueOn", v)} required />
            <Input label={doc.kind === "quote" ? "Valid until" : "Due date"} type="date" value={f.dueOn} onValue={(v) => set("dueOn", v)} />
          </div>
          <p className="mt-3 text-xs text-mute-2">
            Client not listed?{" "}
            <Link href="/admin/clients" className="underline underline-offset-4">
              Add them in Clients
            </Link>{" "}
            first.
          </p>
        </section>

        <section className="rounded-2xl bg-white ring-1 ring-ink/10">
          <header className="flex items-center justify-between border-b border-ink/8 px-5 py-3.5">
            <h2 className="font-display text-base font-semibold">Items</h2>
            <span className="hidden text-xs text-mute-2 sm:block">Prices {f.vatInclusive ? "include" : "exclude"} VAT</span>
          </header>
          <ul className="divide-y divide-ink/8">
            {f.lines.map((l, idx) => (
              <li key={l.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_5rem_8rem_7rem_auto] sm:items-end">
                <Input
                  label={idx === 0 ? "Description" : undefined}
                  aria-label="Description"
                  value={l.description}
                  onValue={(v) => setLine(l.key, { description: v })}
                  placeholder="e.g. Brand identity design"
                  className="col-span-2 sm:col-span-1"
                />
                <Input label={idx === 0 ? "Qty" : undefined} aria-label="Quantity" inputMode="decimal" value={l.quantity} onValue={(v) => setLine(l.key, { quantity: v })} />
                <Input label={idx === 0 ? "Unit price" : undefined} aria-label="Unit price" inputMode="decimal" value={l.unitPrice} onValue={(v) => setLine(l.key, { unitPrice: v })} placeholder="0" />
                <p className="col-span-1 self-center text-right text-sm tabular-nums text-ink/80 sm:pb-3">{kes((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0))}</p>
                <IconButton
                  label="Remove line"
                  className="self-center sm:mb-1.5"
                  disabled={f.lines.length === 1}
                  onClick={() => set("lines", f.lines.filter((x) => x.key !== l.key))}
                >
                  <X className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
          <div className="px-5 pb-5">
            <Button size="sm" onClick={() => set("lines", [...f.lines, { key: seq.current++, description: "", quantity: "1", unitPrice: "" }])}>
              <Plus className="size-4" /> Add line
            </Button>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-ink/10 sm:grid-cols-2">
          <TextBox label="Notes to the client" value={f.notes} onValue={(v) => set("notes", v)} rows={3} placeholder="Scope, deliverables, what's not included…" />
          <TextBox label="Payment terms" value={f.terms} onValue={(v) => set("terms", v)} rows={3} />
        </section>
      </div>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Discount (KES)" inputMode="decimal" value={f.discount} onValue={(v) => set("discount", v)} placeholder="0" />
            <Input label="VAT %" inputMode="decimal" value={f.vatRate} onValue={(v) => set("vatRate", v)} />
          </div>
          <Toggle label="Prices include VAT" checked={f.vatInclusive} onChange={(v) => set("vatInclusive", v)} />
          {!vatRegistered && Number(f.vatRate) > 0 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Only charge VAT if Brand House is VAT-registered with KRA. Set this in Finance › Settings.
            </p>
          ) : null}
          <dl className="space-y-1.5 border-t border-ink/8 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-mute-2">Subtotal</dt>
              <dd className="tabular-nums">{kes(totals.subtotal)}</dd>
            </div>
            {totals.discount ? (
              <div className="flex justify-between">
                <dt className="text-mute-2">Discount</dt>
                <dd className="tabular-nums">−{kes(totals.discount)}</dd>
              </div>
            ) : null}
            {totals.vat ? (
              <div className="flex justify-between">
                <dt className="text-mute-2">VAT {f.vatRate}%</dt>
                <dd className="tabular-nums">{kes(totals.vat)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-ink/8 pt-2 font-display text-lg font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{kes(totals.total)}</dd>
            </div>
          </dl>
        </section>
        <ErrorNote error={error} />
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex gap-2 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-md lg:static lg:flex-col lg:border-0 lg:bg-transparent lg:p-0">
          <Button variant="ghost" className="flex-1" disabled={pending} onClick={() => void submit(doc.id ? doc.status : "draft")}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} {doc.id ? "Save" : "Save draft"}
          </Button>
          {doc.status === "draft" ? (
            <Button variant="accent" className="flex-1" disabled={pending} onClick={() => void submit("sent")}>
              <Send className="size-4" /> Save & mark sent
            </Button>
          ) : null}
        </div>
        <p className="hidden text-xs text-mute-2 lg:block">
          After saving you can share the {label} by WhatsApp or email, or print it as a PDF.
        </p>
      </aside>
    </div>
  );
}

/* ───────────── Document actions ───────────── */

export function ShareButtons({ url, number, kind, clientName, total }: { url: string; number: string; kind: InvoiceKind; clientName: string; total: string }) {
  const [copied, setCopied] = useState(false);
  const word = kind === "quote" ? "quote" : "invoice";
  const message = `Hello${clientName ? ` ${clientName}` : ""}, here is Brand House ${word} ${number} for ${total}: ${url}`;
  const cls = "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 ring-inset bg-white ring-ink/15 hover:ring-ink/30";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
        <ExternalLink className="size-4" /> Open / print PDF
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={cls}>
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-[#25D366]">
          <path d={siWhatsapp.path} />
        </svg>
        WhatsApp
      </a>
      <a href={`mailto:?subject=${encodeURIComponent(`Brand House ${word} ${number}`)}&body=${encodeURIComponent(message)}`} className={cls}>
        <Mail className="size-4" /> Email
      </a>
      <button
        type="button"
        className={cls}
        onClick={async () => {
          await navigator.clipboard.writeText(url).catch(() => undefined);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

export function DocActions({ doc }: { doc: Pick<Invoice, "id" | "kind" | "status" | "number"> }) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  const status = (s: string) => run(() => setDocumentStatus(doc.id, s));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/finance/doc/${doc.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-ink/15 hover:ring-ink/30">
          <Pencil className="size-4" /> Edit
        </Link>
        {doc.status === "draft" ? (
          <Button variant="primary" disabled={pending} onClick={() => void status("sent")}>
            <Send className="size-4" /> Mark as sent
          </Button>
        ) : null}
        {doc.kind === "quote" && doc.status !== "declined" ? (
          <Button variant="accent" disabled={pending} onClick={() => void run(() => convertQuote(doc.id), (r) => router.push(`/admin/finance/doc/${r.id}`))}>
            <ArrowRightLeft className="size-4" /> Accepted: make invoice
          </Button>
        ) : null}
        {doc.kind === "quote" && doc.status === "sent" ? (
          <Button variant="ghost" disabled={pending} onClick={() => void status("declined")}>
            <X className="size-4" /> Declined
          </Button>
        ) : null}
        {doc.kind === "invoice" && doc.status !== "void" && doc.status !== "draft" ? (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => confirm(`Void ${doc.number}? It stays on record, marked void, and no longer counts as owed.`) && void status("void")}
          >
            <Ban className="size-4" /> Void
          </Button>
        ) : null}
        {doc.status === "draft" || doc.kind === "quote" ? (
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => confirm(`Delete ${doc.number}? This can't be undone.`) && void run(() => removeDocument(doc.id), () => router.push(`/admin/finance/${doc.kind === "quote" ? "quotes" : "invoices"}`))}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        ) : null}
      </div>
      <ErrorNote error={error} />
    </div>
  );
}

export function PaymentForm({ invoiceId, balance, today }: { invoiceId: string; balance: number; today: string }) {
  const [open, setOpen] = useState(false);
  const blank = { paidOn: today, amount: balance > 0 ? String(balance) : "", method: "mpesa", reference: "", note: "" };
  const [f, setF] = useState(blank);
  const { run, pending, error } = useAction();
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      <Button variant="accent" onClick={() => { setF(blank); setOpen(true); }}>
        <Plus className="size-4" /> Record payment
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Record a payment">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => recordPayment(invoiceId, { ...f, method: f.method as "mpesa" }), () => setOpen(false));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Amount (KES)" inputMode="decimal" value={f.amount} onValue={set("amount")} required />
            <Input label="Date received" type="date" value={f.paidOn} onValue={set("paidOn")} required />
            <Choice label="Method" value={f.method} onValue={set("method")} options={paymentMethods.map((m) => ({ value: m.id, label: m.label }))} />
            <Input label={f.method === "mpesa" ? "M-Pesa code" : "Reference"} value={f.reference} onValue={set("reference")} placeholder={f.method === "mpesa" ? "e.g. SKL3X9ABCD" : ""} />
          </div>
          <Input label="Note" value={f.note} onValue={set("note")} placeholder="Optional" />
          <ErrorNote error={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function PaymentDelete({ id }: { id: string }) {
  const { run, pending } = useAction();
  return (
    <IconButton label="Delete payment" disabled={pending} onClick={() => confirm("Delete this payment record?") && void run(() => removePayment(id))}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </IconButton>
  );
}

/* ───────────── Expenses ───────────── */

export function ExpenseButton({ expense, projects, today }: { expense?: Expense; projects: Option[]; today: string }) {
  const [open, setOpen] = useState(false);
  const start = {
    spentOn: expense?.spentOn ?? today,
    category: expense?.category ?? "Other",
    vendor: expense?.vendor ?? "",
    description: expense?.description ?? "",
    amount: expense ? String(expense.amount) : "",
    vat: expense?.vat ? String(expense.vat) : "",
    method: expense?.method ?? "mpesa",
    reference: expense?.reference ?? "",
    receiptUrl: expense?.receiptUrl ?? "",
    projectId: expense?.projectId ?? "",
  };
  const [f, setF] = useState(start);
  const { run, pending, error } = useAction();
  const { send, progress, error: uploadError } = useUploader();
  const picker = useRef<HTMLInputElement>(null);
  useUnsavedFlag(open && JSON.stringify(f) !== JSON.stringify(start));
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      {expense ? (
        <IconButton label="Edit expense" onClick={() => { setF(start); setOpen(true); }}>
          <Pencil className="size-4" />
        </IconButton>
      ) : (
        <Button variant="accent" onClick={() => { setF(start); setOpen(true); }}>
          <Plus className="size-4" /> Add expense
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={expense ? "Edit expense" : "Add an expense"} wide>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => saveExpense(expense?.id ?? null, { ...f, category: f.category as "Other", method: f.method as "mpesa" }), () => setOpen(false));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Amount paid (KES)" inputMode="decimal" value={f.amount} onValue={set("amount")} required />
            <Input label="Date" type="date" value={f.spentOn} onValue={set("spentOn")} required />
            <Choice label="Category" value={f.category} onValue={set("category")} options={expenseCategories.map((c) => ({ value: c, label: c }))} />
            <Input label="Paid to" value={f.vendor} onValue={set("vendor")} placeholder="Supplier, person or shop" />
            <Choice label="Method" value={f.method} onValue={set("method")} options={paymentMethods.map((m) => ({ value: m.id, label: m.label }))} />
            <Input label={f.method === "mpesa" ? "M-Pesa code" : "Reference"} value={f.reference} onValue={set("reference")} />
            <Input label="VAT included (KES)" hint="From the receipt, if it shows VAT" inputMode="decimal" value={f.vat} onValue={set("vat")} placeholder="0" />
            <Choice label="For project" value={f.projectId} onValue={set("projectId")} placeholder="General / overheads" options={projects.map((p) => ({ value: p.id, label: p.label }))} />
          </div>
          <Input label="What was it for?" value={f.description} onValue={set("description")} />
          <div>
            <Label hint="A photo of the receipt is enough.">Receipt</Label>
            <div className="flex flex-wrap items-center gap-2">
              {f.receiptUrl ? (
                <a href={f.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800">
                  <Receipt className="size-4" /> Receipt attached
                </a>
              ) : null}
              <input
                ref={picker}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                capture="environment"
                className="sr-only"
                tabIndex={-1}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const up = await send(file);
                  if (up) set("receiptUrl")(up.url);
                }}
              />
              <Button size="sm" onClick={() => picker.current?.click()} disabled={progress !== null}>
                {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
                {progress !== null ? `Uploading ${progress}%` : f.receiptUrl ? "Replace" : "Snap or upload"}
              </Button>
              {f.receiptUrl ? (
                <Button size="sm" variant="ghost" onClick={() => set("receiptUrl")("")}>
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
          <ErrorNote error={error ?? uploadError} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending || progress !== null}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save expense
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ExpenseDelete({ id }: { id: string }) {
  const { run, pending } = useAction();
  return (
    <IconButton label="Delete expense" disabled={pending} onClick={() => confirm("Delete this expense?") && void run(() => removeExpense(id))}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </IconButton>
  );
}

/* ───────────── Business settings ───────────── */

export function BusinessSettingsForm({ initial }: { initial: BusinessSettings }) {
  const [f, setF] = useState(initial);
  const [saved, setSaved] = useState<BusinessSettings>(initial);
  const { run, pending, error } = useAction();
  const dirty = JSON.stringify(f) !== JSON.stringify(saved);
  useUnsavedFlag(dirty);
  const set = (k: keyof BusinessSettings) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const section = "space-y-4 rounded-2xl bg-white p-5 ring-1 ring-ink/10";
  return (
    <form
      className="space-y-5 pb-28 lg:pb-0"
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => saveBusinessSettings({ ...f, defaultVatRate: Number(f.defaultVatRate), defaultDueDays: Number(f.defaultDueDays) }), () => setSaved(f));
      }}
    >
      <section className={section}>
        <h2 className="font-display text-base font-semibold">Business details</h2>
        <p className="-mt-2 text-sm text-mute-2">Printed at the top of every quote and invoice.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Business name" value={f.legalName} onValue={set("legalName")} />
          <Input label="KRA PIN" value={f.kraPin} onValue={set("kraPin")} placeholder="P051234567X" />
          <Input label="Email" value={f.email} onValue={set("email")} />
          <Input label="Phone" value={f.phone} onValue={set("phone")} />
          <TextBox label="Address" value={f.address} onValue={set("address")} rows={2} className="sm:col-span-2" />
        </div>
        <Toggle
          label="VAT-registered with KRA"
          checked={f.vatRegistered}
          onChange={(v) => setF((x) => ({ ...x, vatRegistered: v, defaultVatRate: v ? (x.defaultVatRate || 16) : 0 }))}
          hint="Only charge VAT (16%) once you're registered. When this is off, new invoices start at 0% VAT."
        />
      </section>

      <section className={section}>
        <h2 className="font-display text-base font-semibold">How clients pay you</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="M-Pesa Paybill" value={f.mpesaPaybill} onValue={set("mpesaPaybill")} inputMode="numeric" />
          <Input label="Paybill account instructions" value={f.mpesaAccountHint} onValue={set("mpesaAccountHint")} />
          <Input label="M-Pesa Till (Buy Goods)" value={f.mpesaTill} onValue={set("mpesaTill")} inputMode="numeric" />
          <span className="hidden sm:block" />
          <Input label="Bank" value={f.bankName} onValue={set("bankName")} />
          <Input label="Account name" value={f.bankAccountName} onValue={set("bankAccountName")} />
          <Input label="Account number" value={f.bankAccountNumber} onValue={set("bankAccountNumber")} />
          <Input label="Branch" value={f.bankBranch} onValue={set("bankBranch")} />
          <Input label="SWIFT code" value={f.bankSwift} onValue={set("bankSwift")} />
        </div>
      </section>

      <section className={section}>
        <h2 className="font-display text-base font-semibold">Defaults</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Invoice number prefix" value={f.invoicePrefix} onValue={set("invoicePrefix")} />
          <Input label="Quote number prefix" value={f.quotePrefix} onValue={set("quotePrefix")} />
          <Input label="VAT %" inputMode="decimal" value={String(f.defaultVatRate)} onValue={set("defaultVatRate")} />
          <Input label="Days to pay" inputMode="numeric" value={String(f.defaultDueDays)} onValue={set("defaultDueDays")} />
        </div>
        <TextBox label="Default payment terms" value={f.defaultTerms} onValue={set("defaultTerms")} rows={2} />
        <Input label="Footer line" value={f.invoiceFooter} onValue={set("invoiceFooter")} />
      </section>

      <ErrorNote error={error} />
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex justify-end gap-2 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:p-0">
        {dirty ? (
          <Button variant="ghost" onClick={() => setF(saved)} disabled={pending}>
            Discard
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={!dirty || pending} className="flex-1 sm:flex-none">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
        </Button>
      </div>
    </form>
  );
}
