"use client";
import { MessageCircle, Printer, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { inr } from "@/lib/catalog";
import { btnAccent, btnDark, btnLight, card, inp, when } from "./tokens";
import { Badge, Chips, Empty, Field, Sheet, useAdminApi } from "./ui";

export type AdminOrder = {
  id: string; no: string; shopName: string; phone: string; address: string; note: string; total: number;
  status: "placed" | "accepted" | "rejected" | "dispatched" | "delivered"; rejectReason: string; createdAt: string;
  items: { id: string; name: string; qty: number; price: number }[];
  invoices: { type: string; number: string }[];
};

const NEXT: Record<string, { to: string; label: string }[]> = {
  placed: [{ to: "accepted", label: "Accept order" }],
  accepted: [{ to: "dispatched", label: "Mark dispatched" }],
  dispatched: [{ to: "delivered", label: "Mark delivered" }],
};

export default function OrdersClient({ orders }: { orders: AdminOrder[] }) {
  const { call, busy, toast } = useAdminApi();
  const [f, setF] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const open = orders.find((o) => o.id === openId);

  const shown = useMemo(
    () => orders.filter((o) => (f === "all" || o.status === f) && (!q || `${o.no} ${o.shopName} ${o.phone}`.toLowerCase().includes(q.toLowerCase()))),
    [orders, f, q],
  );
  const n = (s: string) => orders.filter((o) => o.status === s).length;

  async function setStatus(o: AdminOrder, status: string, rejectReason = "") {
    if (await call("PATCH", "orders", { id: o.id, status, rejectReason }, `Order ${status}`)) {
      setRejecting(false);
      setReason("");
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="pt-2 text-2xl font-extrabold tracking-tight">Orders</h1>
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3 text-neutral-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order no., shop or phone" className={`${inp} pl-10`} />
      </div>
      <Chips value={f} onChange={setF} options={[
        { v: "all", label: "All", n: orders.length }, { v: "placed", label: "New", n: n("placed") }, { v: "accepted", label: "Accepted", n: n("accepted") },
        { v: "dispatched", label: "Dispatched", n: n("dispatched") }, { v: "delivered", label: "Delivered", n: n("delivered") }, { v: "rejected", label: "Rejected", n: n("rejected") },
      ]} />

      {shown.length === 0 ? <Empty text="No orders match." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {shown.map((o) => (
            <li key={o.id}>
              <button onClick={() => setOpenId(o.id)} className={`${card} w-full text-left transition hover:shadow-md active:scale-[.99]`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{o.shopName}</p>
                    <p className="text-xs text-neutral-500">{o.no} · {when(o.createdAt)}</p>
                  </div>
                  <Badge s={o.status} />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-xs text-neutral-500">{o.items.reduce((s, i) => s + i.qty, 0)} items</span>
                  <span className="text-lg font-extrabold">{inr(o.total)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Sheet title={open.no} onClose={() => { setOpenId(null); setRejecting(false); }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Badge s={open.status} /><span className="text-xs text-neutral-500">{when(open.createdAt)}</span></div>
            <div className="rounded-2xl bg-neutral-50 p-3 text-sm">
              <p className="font-bold">{open.shopName}</p>
              <p className="text-neutral-600">{open.address}</p>
              <div className="mt-2 flex gap-2">
                <a href={`tel:${open.phone}`} className={`${btnLight} h-9 px-4`}>{open.phone}</a>
                <a href={`https://wa.me/91${open.phone.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noreferrer" className={`${btnLight} h-9 px-4`}><MessageCircle size={16} />WhatsApp</a>
              </div>
              {open.note && <p className="mt-2 text-neutral-600">Note: {open.note}</p>}
            </div>
            <ul className="divide-y divide-neutral-100 text-sm">
              {open.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 py-2"><span className="min-w-0">{i.qty} × {i.name}<span className="block text-xs text-neutral-500">{inr(i.price)} each</span></span><span className="font-semibold">{inr(i.qty * i.price)}</span></li>
              ))}
              <li className="flex justify-between pt-3 text-base font-extrabold"><span>Total</span><span>{inr(open.total)}</span></li>
            </ul>
            {open.rejectReason && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Rejected: {open.rejectReason}</p>}
            {open.invoices.length > 0 && (
              <p className="text-xs text-neutral-500">Invoices: {open.invoices.map((i) => `${i.number} (${i.type})`).join(", ")}</p>
            )}

            {rejecting ? (
              <div className="space-y-2">
                <Field label="Reason for rejecting"><input value={reason} onChange={(e) => setReason(e.target.value)} className={inp} placeholder="e.g. Out of stock" autoFocus /></Field>
                <div className="flex gap-2">
                  <button className={`${btnLight} flex-1`} onClick={() => setRejecting(false)}>Back</button>
                  <button disabled={busy} className={`${btnDark} flex-1 !bg-red-600`} onClick={() => setStatus(open, "rejected", reason)}>Reject order</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {NEXT[open.status]?.map((a) => <button key={a.to} disabled={busy} onClick={() => setStatus(open, a.to)} className={`${btnAccent} flex-1`}>{a.label}</button>)}
                {(open.status === "placed" || open.status === "accepted") && <button className={`${btnLight} flex-1 !bg-red-50 !text-red-700`} onClick={() => setRejecting(true)}>Reject</button>}
                {open.status !== "placed" && open.status !== "rejected" && (
                  <Link href={`/admin/orders/${open.no}/print`} target="_blank" className={`${btnDark} flex-1`}><Printer size={16} />Invoice</Link>
                )}
              </div>
            )}
          </div>
        </Sheet>
      )}
      {toast}
    </div>
  );
}
