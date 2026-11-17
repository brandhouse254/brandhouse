"use client";

import { useRef, useState } from "react";
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
  setDocumentStatus,
} from "@/lib/biz/actions";
import {
  docWords,
  expenseCategories,
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
    { href: "/admin/finance/receipts", label: "Receipts" },
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

/* ───────────── Document actions ───────────── */

export function ShareButtons({ url, number, kind, clientName, total }: { url: string; number: string; kind: InvoiceKind; clientName: string; total: string }) {
  const [copied, setCopied] = useState(false);
  const word = docWords[kind].word;
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
        {doc.kind !== "quote" && doc.status !== "void" && doc.status !== "draft" ? (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => confirm(`Void ${doc.number}? It stays on record, marked void, and no longer counts as owed.`) && void status("void")}
          >
            <Ban className="size-4" /> Void
          </Button>
        ) : null}
        {doc.kind !== "receipt" && (doc.status === "draft" || doc.kind === "quote") ? (
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => confirm(`Delete ${doc.number}? This can't be undone.`) && void run(() => removeDocument(doc.id), () => router.push(`/admin/finance/${docWords[doc.kind].plural}`))}
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">How clients pay you</h2>
            <p className="mt-1 text-sm text-mute-2">Printed on quotes and invoices. Add as many as you like; choose which to show on each document. Type {"{number}"} to insert the document number.</p>
          </div>
          <Button
            size="sm"
            onClick={() => setF((x) => ({ ...x, payOptions: [...x.payOptions, { id: `pay-${Date.now().toString(36)}`, label: "", details: "" }] }))}
          >
            <Plus className="size-4" /> Add option
          </Button>
        </div>
        {f.payOptions.length ? (
          <ul className="space-y-3">
            {f.payOptions.map((o, i) => (
              <li key={o.id} className="grid gap-3 rounded-xl bg-paper p-4 ring-1 ring-ink/8 sm:grid-cols-[14rem_minmax(0,1fr)_auto]">
                <Input
                  label="Name"
                  value={o.label}
                  onValue={(v) => setF((x) => ({ ...x, payOptions: x.payOptions.map((p, j) => (j === i ? { ...p, label: v } : p)) }))}
                  placeholder="e.g. M-Pesa Paybill"
                />
                <TextBox
                  label="Details"
                  value={o.details}
                  onValue={(v) => setF((x) => ({ ...x, payOptions: x.payOptions.map((p, j) => (j === i ? { ...p, details: v } : p)) }))}
                  rows={3}
                  placeholder={"Paybill: 123456\nAccount: {number}"}
                />
                <IconButton label="Remove option" className="self-start sm:mt-7" onClick={() => setF((x) => ({ ...x, payOptions: x.payOptions.filter((_, j) => j !== i) }))}>
                  <Trash2 className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-paper px-4 py-3 text-sm text-mute-2">No payment options yet. Add M-Pesa Paybill or Till, Pochi la Biashara, bank transfer, PayPal or anything else.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "M-Pesa Paybill", details: "Paybill: \nAccount: {number}" },
            { label: "M-Pesa Till (Buy Goods)", details: "Till number: " },
            { label: "Pochi la Biashara", details: "Phone: " },
            { label: "Bank transfer", details: "Bank: \nAccount name: \nAccount number: \nBranch: " },
          ]
            .filter((t) => !f.payOptions.some((o) => o.label === t.label))
            .map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setF((x) => ({ ...x, payOptions: [...x.payOptions, { id: `pay-${Date.now().toString(36)}`, ...t }] }))}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-white px-3 text-xs font-medium ring-1 ring-ink/15 hover:ring-ink/30"
              >
                <Plus className="size-3.5" /> {t.label}
              </button>
            ))}
        </div>
      </section>

      <section className={section}>
        <h2 className="font-display text-base font-semibold">Signature</h2>
        <p className="-mt-2 text-sm text-mute-2">Signs your quotes, invoices and receipts. Draw it with your finger or mouse, or upload a photo of it.</p>
        <SignaturePad url={f.signatureUrl} onChange={(signatureUrl) => setF((x) => ({ ...x, signatureUrl }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Signed by" value={f.signatoryName} onValue={set("signatoryName")} placeholder="Full name" />
          <Input label="Title" value={f.signatoryTitle} onValue={set("signatoryTitle")} placeholder="e.g. Managing Director" />
        </div>
      </section>

      <section className={section}>
        <h2 className="font-display text-base font-semibold">Defaults</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Invoice number prefix" value={f.invoicePrefix} onValue={set("invoicePrefix")} />
          <Input label="Quote number prefix" value={f.quotePrefix} onValue={set("quotePrefix")} />
          <Input label="Receipt number prefix" value={f.receiptPrefix} onValue={set("receiptPrefix")} />
          <Input label="VAT %" inputMode="decimal" value={String(f.defaultVatRate)} onValue={set("defaultVatRate")} />
          <Input label="Days to pay" inputMode="numeric" value={String(f.defaultDueDays)} onValue={set("defaultDueDays")} />
        </div>
        <TextBox label="Default payment terms" value={f.defaultTerms} onValue={set("defaultTerms")} rows={2} />
        <Input label="Footer line" value={f.invoiceFooter} onValue={set("invoiceFooter")} />
      </section>

      <ErrorNote error={error} />
      <div className="fixed inset-x-0 bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex justify-end gap-2 border-t border-ink/10 bg-paper/95 px-4 pt-3 backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:p-0">
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

/* ───────────── Signature pad ───────────── */

function SignaturePad({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"view" | "draw">(url ? "view" : "draw");
  const [hasInk, setHasInk] = useState(false);
  const { send, progress, error } = useUploader();
  const picker = useRef<HTMLInputElement>(null);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const ctx = () => {
    const c = canvas.current!.getContext("2d")!;
    c.lineWidth = 5;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "#111";
    return c;
  };
  const clear = () => {
    const c = canvas.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  };
  const saveDrawing = async () => {
    const c = canvas.current;
    if (!c) return;
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
    if (!blob) return;
    const up = await send(new File([blob], `signature-${Date.now()}.png`, { type: "image/png" }));
    if (up) {
      onChange(up.url);
      setMode("view");
    }
  };

  return (
    <div className="space-y-3">
      {mode === "view" && url ? (
        <div className="flex h-36 items-center justify-center rounded-xl bg-paper ring-1 ring-ink/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Your signature" className="max-h-28 w-auto object-contain" />
        </div>
      ) : (
        <canvas
          ref={canvas}
          width={900}
          height={300}
          aria-label="Draw your signature here"
          className="h-36 w-full touch-none rounded-xl bg-white ring-1 ring-ink/15 [background-image:linear-gradient(transparent_calc(100%-2.2rem),#11111122_calc(100%-2.2rem),#11111122_calc(100%-2.2rem+1px),transparent_calc(100%-2.2rem+1px))]"
          onPointerDown={(e) => {
            drawing.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            const p = point(e);
            const c = ctx();
            c.beginPath();
            c.moveTo(p.x, p.y);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const p = point(e);
            const c = ctx();
            c.lineTo(p.x, p.y);
            c.stroke();
            setHasInk(true);
          }}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {mode === "draw" ? (
          <>
            <Button size="sm" variant="primary" disabled={!hasInk || progress !== null} onClick={() => void saveDrawing()}>
              {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Use this signature
            </Button>
            <Button size="sm" variant="ghost" onClick={clear} disabled={!hasInk}>
              Clear
            </Button>
            {url ? (
              <Button size="sm" variant="ghost" onClick={() => setMode("view")}>
                Cancel
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <Button size="sm" onClick={() => setMode("draw")}>
              <Pencil className="size-4" /> Draw again
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onChange("")}>
              Remove
            </Button>
          </>
        )}
        <input
          ref={picker}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          tabIndex={-1}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const up = await send(file);
            if (up) {
              onChange(up.url);
              setMode("view");
            }
          }}
        />
        <Button size="sm" variant="ghost" onClick={() => picker.current?.click()} disabled={progress !== null}>
          <Paperclip className="size-4" /> Upload a photo
        </Button>
      </div>
      <ErrorNote error={error} />
    </div>
  );
}
