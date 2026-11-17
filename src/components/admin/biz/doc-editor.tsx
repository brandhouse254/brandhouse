"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Plus, Save, Send, X } from "lucide-react";
import { saveInvoice } from "@/lib/biz/actions";
import {
  computeTotals,
  docWords,
  kes,
  paymentMethods,
  type BillTo,
  type BusinessSettings,
  type InvoiceKind,
} from "@/lib/biz/types";
import { useUnsavedFlag } from "@/lib/admin/dirty";
import { cn } from "@/lib/cn";
import { DocumentSheet } from "@/components/docs/sheet";
import { Button, IconButton, Toggle } from "../ui";
import { Choice, ErrorNote, Input, Label, Modal, Segmented, TextBox, useAction } from "./kit";

/* The quote / invoice / receipt editor, with a live preview of the finished document. */

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
  billTo: BillTo;
  projectTitle: string;
  payMethods: string[];
  showSignature: boolean;
  receipt: { method: string; reference: string };
};

export type ClientOption = { id: string; label: string; billTo: BillTo };
export type ProjectOption = { id: string; label: string; clientId: string | null };

/** Shows the A4-width document scaled to fit whatever space it is given. */
export function FitSheet({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.45);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setZoom(Math.min(1, el.clientWidth / 832)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full overflow-hidden">
      <div style={{ zoom }} className="w-[52rem]">
        {children}
      </div>
    </div>
  );
}

const emptyBillTo: BillTo = { name: "", company: "", email: "", phone: "", address: "" };

export function DocEditor({
  doc,
  clients,
  projects,
  biz,
}: {
  doc: EditorDoc;
  clients: ClientOption[];
  projects: ProjectOption[];
  biz: BusinessSettings;
}) {
  const router = useRouter();
  const seq = useRef(doc.items.length + 1);
  const words = docWords[doc.kind];
  const start = useMemo(
    () => ({
      who: (doc.clientId ? "client" : doc.billTo.name || doc.billTo.company ? "other" : "client") as "client" | "other",
      clientId: doc.clientId,
      billTo: doc.billTo,
      projectId: doc.projectId,
      projectTitle: doc.projectTitle,
      issueOn: doc.issueOn,
      dueOn: doc.dueOn,
      vatRate: String(doc.vatRate),
      vatInclusive: doc.vatInclusive,
      discount: doc.discount ? String(doc.discount) : "",
      notes: doc.notes,
      terms: doc.terms,
      payMethods: doc.payMethods.length ? doc.payMethods : biz.payOptions.map((o) => o.id),
      showSignature: doc.showSignature,
      method: doc.receipt.method,
      reference: doc.receipt.reference,
      lines: (doc.items.length ? doc.items : [{ description: "", quantity: 1, unitPrice: 0 }]).map((it, i) => ({
        key: i,
        description: it.description,
        quantity: String(it.quantity),
        unitPrice: it.unitPrice ? String(it.unitPrice) : "",
      })) as Line[],
    }),
    [doc, biz.payOptions],
  );
  const [f, setF] = useState(start);
  const [preview, setPreview] = useState(false);
  const { run, pending, error } = useAction();
  const dirty = JSON.stringify(f) !== JSON.stringify(start);
  useUnsavedFlag(dirty);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const setBill = (k: keyof BillTo) => (v: string) => setF((x) => ({ ...x, billTo: { ...x.billTo, [k]: v } }));
  const setLine = (key: number, patch: Partial<Line>) => set("lines", f.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const items = f.lines.map((l) => ({ description: l.description, quantity: Number(l.quantity) || 0, unitPrice: Number(l.unitPrice) || 0 }));
  const totals = computeTotals(items, { vatRate: Number(f.vatRate) || 0, vatInclusive: f.vatInclusive, discount: Number(f.discount) || 0 });
  const clientProjects = projects.filter((p) => f.who === "other" || !f.clientId || p.clientId === f.clientId);
  const isReceipt = doc.kind === "receipt";

  const chooseClient = (id: string) =>
    setF((x) => ({
      ...x,
      clientId: id,
      billTo: clients.find((c) => c.id === id)?.billTo ?? emptyBillTo,
      projectId: projects.find((p) => p.id === x.projectId)?.clientId === id ? x.projectId : "",
    }));

  const chooseProject = (id: string) => setF((x) => ({ ...x, projectId: id, projectTitle: projects.find((p) => p.id === id)?.label ?? x.projectTitle }));

  const submit = (status: string) =>
    run(
      () =>
        saveInvoice(doc.id, doc.kind, {
          clientId: f.who === "client" ? f.clientId : "",
          projectId: f.projectId,
          issueOn: f.issueOn,
          dueOn: isReceipt ? "" : f.dueOn,
          status,
          vatRate: Number(f.vatRate) || 0,
          vatInclusive: f.vatInclusive,
          discount: Number(f.discount) || 0,
          notes: f.notes,
          terms: f.terms,
          items: items.filter((i) => i.description.trim() || i.unitPrice),
          billTo: f.billTo,
          projectTitle: f.projectTitle,
          payMethods: f.payMethods.length === biz.payOptions.length ? [] : f.payMethods,
          showSignature: f.showSignature,
          receipt: isReceipt ? { method: f.method as "mpesa", reference: f.reference } : undefined,
        }),
      (r) => {
        setF(f);
        router.push(`/admin/finance/doc/${r.id}`);
      },
    );

  const sheet = (
    <DocumentSheet
      biz={biz}
      data={{
        title: words.title,
        number: doc.number ?? "",
        issueOn: f.issueOn,
        dueOn: isReceipt ? null : f.dueOn || null,
        dueLabel: doc.kind === "quote" ? "Valid until" : "Due",
        toLabel: words.to,
        to: f.billTo,
        projectTitle: f.projectTitle,
        items,
        totals,
        vatRate: Number(f.vatRate) || 0,
        vatInclusive: f.vatInclusive,
        showPaid: false,
        notes: f.notes,
        terms: isReceipt ? "" : f.terms,
        payOptions: isReceipt ? [] : biz.payOptions.filter((o) => f.payMethods.includes(o.id)),
        signature: f.showSignature ? { url: biz.signatureUrl, name: biz.signatoryName, title: biz.signatoryTitle } : null,
        receipt: isReceipt ? { amount: totals.total, paidOn: f.issueOn, method: f.method, reference: f.reference } : undefined,
      }}
    />
  );

  const card = "rounded-2xl bg-white p-5 ring-1 ring-ink/10";

  return (
    <div className="grid gap-5 pb-28 xl:grid-cols-[minmax(0,1fr)_25rem] xl:pb-6">
      <div className="min-w-0 space-y-5">
        {/* Who it's for */}
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold">{words.to}</h2>
            <Segmented
              label="Recipient"
              value={f.who}
              onValue={(v) => setF((x) => ({ ...x, who: v as "client" | "other", clientId: v === "other" ? "" : x.clientId }))}
              options={[
                { id: "client", label: "A saved client" },
                { id: "other", label: "Someone else" },
              ]}
            />
          </div>
          {f.who === "client" ? (
            <Choice className="mt-4" label="Client" value={f.clientId} onValue={chooseClient} placeholder="Choose a client" options={clients.map((c) => ({ value: c.id, label: c.label }))} />
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Name" value={f.billTo.name} onValue={setBill("name")} placeholder="Person's name" autoComplete="off" />
            <Input label="Company" value={f.billTo.company} onValue={setBill("company")} placeholder="Optional" autoComplete="off" />
            <Input label="Email" type="email" value={f.billTo.email} onValue={setBill("email")} autoComplete="off" />
            <Input label="Phone" type="tel" value={f.billTo.phone} onValue={setBill("phone")} autoComplete="off" />
            <TextBox label="Address" value={f.billTo.address} onValue={setBill("address")} rows={2} className="sm:col-span-2" />
          </div>
          <p className="mt-3 text-xs text-mute-2">Changes here only affect this {words.word}. To update a client for good, edit them in Clients.</p>
        </section>

        {/* Project and dates */}
        <section className={card}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Choice label="Link to a project" value={f.projectId} onValue={chooseProject} placeholder="No project" options={clientProjects.map((p) => ({ value: p.id, label: p.label }))} />
            <Input label="Project / reference shown on the document" value={f.projectTitle} onValue={(v) => set("projectTitle", v)} placeholder="e.g. Website redesign, phase 1" />
            <Input label={doc.kind === "receipt" ? "Date received" : doc.kind === "quote" ? "Date" : "Invoice date"} type="date" value={f.issueOn} onValue={(v) => set("issueOn", v)} required />
            {isReceipt ? (
              <Choice label="Paid by" value={f.method} onValue={(v) => set("method", v)} options={paymentMethods.map((m) => ({ value: m.id, label: m.label }))} />
            ) : (
              <Input label={doc.kind === "quote" ? "Valid until" : "Due date"} type="date" value={f.dueOn} onValue={(v) => set("dueOn", v)} />
            )}
            {isReceipt ? (
              <Input label={f.method === "mpesa" ? "M-Pesa code" : "Reference"} value={f.reference} onValue={(v) => set("reference", v)} placeholder={f.method === "mpesa" ? "e.g. SKL3X9ABCD" : ""} />
            ) : null}
          </div>
        </section>

        {/* Items */}
        <section className="rounded-2xl bg-white ring-1 ring-ink/10">
          <header className="flex items-center justify-between border-b border-ink/8 px-5 py-3.5">
            <h2 className="font-display text-base font-semibold">{isReceipt ? "What it was for" : "Items"}</h2>
            <span className="text-xs text-mute-2">Prices {f.vatInclusive ? "include" : "exclude"} VAT</span>
          </header>
          <ul className="divide-y divide-ink/8">
            {f.lines.map((l) => (
              <li key={l.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-3 gap-y-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_5rem_8rem_auto]">
                <Input
                  label="Description"
                  value={l.description}
                  onValue={(v) => setLine(l.key, { description: v })}
                  placeholder="e.g. Brand identity design"
                  className="col-span-3 sm:col-span-1"
                />
                <Input label="Qty" inputMode="decimal" value={l.quantity} onValue={(v) => setLine(l.key, { quantity: v })} />
                <Input label="Unit price" inputMode="decimal" value={l.unitPrice} onValue={(v) => setLine(l.key, { unitPrice: v })} placeholder="0" />
                <div className="flex flex-col items-end justify-end">
                  <span className="mb-1.5 text-xs tabular-nums text-mute-2">{kes((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0))}</span>
                  <IconButton label="Remove line" disabled={f.lines.length === 1} onClick={() => set("lines", f.lines.filter((x) => x.key !== l.key))}>
                    <X className="size-4" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-5 pb-5">
            <Button size="sm" onClick={() => set("lines", [...f.lines, { key: seq.current++, description: "", quantity: "1", unitPrice: "" }])}>
              <Plus className="size-4" /> Add line
            </Button>
          </div>
        </section>

        <section className={cn(card, "grid gap-4", !isReceipt && "sm:grid-cols-2")}>
          <TextBox label={isReceipt ? "Note on the receipt" : "Notes to the client"} value={f.notes} onValue={(v) => set("notes", v)} rows={3} placeholder={isReceipt ? "Optional" : "Scope, deliverables, what's not included…"} />
          {!isReceipt ? <TextBox label="Payment terms" value={f.terms} onValue={(v) => set("terms", v)} rows={3} /> : null}
        </section>

        <section className={cn(card, "space-y-4")}>
          {!isReceipt ? (
            <div>
              <Label hint="Edit the list in Finance › Settings.">Payment options shown</Label>
              {biz.payOptions.length ? (
                <div className="flex flex-wrap gap-2">
                  {biz.payOptions.map((o) => {
                    const on = f.payMethods.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("payMethods", on ? f.payMethods.filter((x) => x !== o.id) : [...f.payMethods, o.id])}
                        className={cn("h-9 rounded-full px-3.5 text-sm font-medium ring-1 ring-inset", on ? "bg-ink text-paper ring-ink" : "bg-white text-ink/70 ring-ink/15")}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-mute-2">No payment options yet. Add M-Pesa, bank or others in Finance › Settings.</p>
              )}
            </div>
          ) : null}
          <Toggle
            label="Sign it"
            checked={f.showSignature}
            onChange={(v) => set("showSignature", v)}
            hint={biz.signatureUrl || biz.signatoryName ? `Adds ${biz.signatoryName || "your"} signature at the bottom.` : "Add your signature in Finance › Settings first."}
          />
        </section>
      </div>

      <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Discount (KES)" inputMode="decimal" value={f.discount} onValue={(v) => set("discount", v)} placeholder="0" />
            <Input label="VAT %" inputMode="decimal" value={f.vatRate} onValue={(v) => set("vatRate", v)} />
          </div>
          <Toggle label="Prices include VAT" checked={f.vatInclusive} onChange={(v) => set("vatInclusive", v)} />
          {!biz.vatRegistered && Number(f.vatRate) > 0 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">Only charge VAT if Brand House is VAT-registered with KRA. Set this in Finance › Settings.</p>
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
              <dt>{isReceipt ? "Amount received" : "Total"}</dt>
              <dd className="tabular-nums">{kes(totals.total)}</dd>
            </div>
          </dl>
        </section>
        <ErrorNote error={error} />
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-ink/10 bg-paper/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md xl:static xl:border-0 xl:bg-transparent xl:p-0">
          <Button variant="ghost" className="xl:hidden" onClick={() => setPreview(true)}>
            <Eye className="size-4" /> Preview
          </Button>
          {isReceipt ? (
            <Button variant="accent" className="flex-1" disabled={pending} onClick={() => void submit("issued")}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save receipt
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="flex-1" disabled={pending} onClick={() => void submit(doc.id ? doc.status : "draft")}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} {doc.id ? "Save" : "Save draft"}
              </Button>
              {doc.status === "draft" ? (
                <Button variant="accent" className="flex-1" disabled={pending} onClick={() => void submit("sent")}>
                  <Send className="size-4" /> Save & mark sent
                </Button>
              ) : null}
            </>
          )}
        </div>

        {/* Live preview (large screens) */}
        <div className="hidden xl:block">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-mute-2">
            <Eye className="size-3.5" /> Live preview
          </p>
          <div className="overflow-hidden rounded-2xl ring-1 ring-ink/10">
            <FitSheet>{sheet}</FitSheet>
          </div>
        </div>
      </aside>

      <Modal open={preview} onClose={() => setPreview(false)} title="Preview" wide>
        <div className="overflow-hidden rounded-xl ring-1 ring-ink/10">
          <FitSheet>{sheet}</FitSheet>
        </div>
      </Modal>
    </div>
  );
}
