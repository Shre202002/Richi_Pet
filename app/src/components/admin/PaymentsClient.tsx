"use client";
import { Plus, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { inr } from "@/lib/catalog";
import { btnAccent, btnDark, btnLight, card, day, inp } from "./tokens";
import { ConfirmBtn, Empty, Field, Sheet, useAdminApi } from "./ui";

export type Balance = { shopId: string; name: string; phone: string; billed: number; paid: number };
export type Payment = { id: string; shop: string; amount: number; mode: string; note: string; paidOn: string };
export type Invoice = { id: string; number: string; type: string; orderNo: string; shop: string; createdAt: string };

const today = () => new Date().toISOString().slice(0, 10);

export default function PaymentsClient({ balances, payments, invoices }: { balances: Balance[]; payments: Payment[]; invoices: Invoice[] }) {
  const { call, busy, toast } = useAdminApi();
  const [tab, setTab] = useState<"dues" | "payments" | "invoices">("dues");
  const [form, setForm] = useState<{ shopId: string; amount: string; mode: string; note: string; paidOn: string } | null>(null);

  const due = balances.reduce((n, b) => n + b.billed - b.paid, 0);
  const collected = payments.reduce((n, p) => n + p.amount, 0);
  const sorted = [...balances].sort((a, b) => b.billed - b.paid - (a.billed - a.paid));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form && (await call("POST", "payments", { ...form, amount: Number(form.amount) }, "Payment recorded"))) setForm(null);
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Payments</h1>
        <button onClick={() => setForm({ shopId: sorted[0]?.shopId ?? "", amount: "", mode: "UPI", note: "", paidOn: today() })} className={btnAccent}><Plus size={18} />Record payment</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#ff8a4c] to-accent p-4 text-white"><p className="text-xs font-medium opacity-90">Total outstanding</p><p className="text-2xl font-extrabold">{inr(due)}</p></div>
        <div className={card}><p className="text-xs font-medium text-neutral-500">Collected</p><p className="text-2xl font-extrabold">{inr(collected)}</p></div>
      </div>

      <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
        {(["dues", "payments", "invoices"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === t ? "bg-ink text-white" : "text-neutral-600"}`}>{t === "dues" ? "Shop dues" : t}</button>
        ))}
      </div>

      {tab === "dues" && (balances.length === 0 ? <Empty text="No shops yet." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {sorted.map((b) => {
            const out = b.billed - b.paid;
            return (
              <li key={b.shopId} className={`${card} flex items-center justify-between gap-3`}>
                <div className="min-w-0"><p className="truncate font-bold">{b.name}</p><p className="text-xs text-neutral-500">Billed {inr(b.billed)} · Paid {inr(b.paid)}</p></div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`text-lg font-extrabold ${out > 0 ? "text-accent" : ""}`}>{inr(out)}</span>
                  <button onClick={() => setForm({ shopId: b.shopId, amount: out > 0 ? String(out) : "", mode: "UPI", note: "", paidOn: today() })} className={`${btnLight} h-8 px-3 text-xs`}>Collect</button>
                </div>
              </li>
            );
          })}
        </ul>
      ))}

      {tab === "payments" && (payments.length === 0 ? <Empty text="No payments recorded." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {payments.map((p) => (
            <li key={p.id} className={`${card} flex items-center justify-between gap-3`}>
              <div className="min-w-0"><p className="truncate font-bold">{p.shop}</p><p className="text-xs text-neutral-500">{day(p.paidOn)} · {p.mode || "—"}{p.note && ` · ${p.note}`}</p></div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-extrabold text-green-700">+{inr(p.amount)}</span>
                <ConfirmBtn label="×" onConfirm={() => call("DELETE", "payments", p.id, "Payment removed")} className="!h-8 !px-3 text-xs" />
              </div>
            </li>
          ))}
        </ul>
      ))}

      {tab === "invoices" && (invoices.length === 0 ? <Empty text="Invoices appear when you accept or dispatch an order." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {invoices.map((i) => (
            <li key={i.id} className={`${card} flex items-center justify-between gap-3`}>
              <div className="min-w-0"><p className="font-bold">{i.number}</p><p className="truncate text-xs text-neutral-500">{i.shop} · {i.orderNo} · {i.type}</p></div>
              <Link href={`/admin/orders/${i.orderNo}/print`} target="_blank" className={`${btnDark} h-9 px-4`}><Printer size={15} />Open</Link>
            </li>
          ))}
        </ul>
      ))}

      {form && (
        <Sheet title="Record payment" onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Shop">
              <select required value={form.shopId} onChange={(e) => setForm({ ...form, shopId: e.target.value })} className={inp}>
                {balances.map((b) => <option key={b.shopId} value={b.shopId}>{b.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (₹)"><input required type="number" min={1} step="0.01" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inp} autoFocus /></Field>
              <Field label="Date"><input required type="date" value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} className={inp} /></Field>
            </div>
            <Field label="Mode">
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className={inp}>
                {["UPI", "Cash", "Bank transfer", "Cheque"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Note (optional)"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inp} /></Field>
            <button disabled={busy} className={`${btnDark} w-full`}>Save payment</button>
          </form>
        </Sheet>
      )}
      {toast}
    </div>
  );
}
