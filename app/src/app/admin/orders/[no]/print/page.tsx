import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import { day } from "@/components/admin/tokens";
import { inr } from "@/lib/catalog";
import { db } from "@/lib/mongo";

type Item = { id: string; name: string; qty: number; price: number; gst?: number };

export default async function InvoicePage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const d = await db();
  const o = await d.collection("orders").findOne({ no });
  if (!o) notFound();
  const inv = await d.collection("invoices").find({ orderId: o._id }).sort({ createdAt: -1 }).toArray();
  const gst = (o.items as Item[]).reduce((n, i) => n + (i.qty * i.price * (i.gst ?? 0)) / 100, 0);
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm print:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Richi&apos;s PET Stuff</h1>
          <p className="text-sm text-neutral-500">Invoice / order slip</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold">{inv[0]?.number ?? o.no}</p>
          <p>Order {o.no}</p>
          <p className="text-neutral-500">{day(o.createdAt.toISOString())}</p>
        </div>
      </div>
      <div className="mt-5 text-sm"><p className="font-bold">Bill to</p><p>{o.shopName}</p><p>{o.address}</p><p>{o.phone}</p></div>
      <table className="mt-5 w-full text-sm">
        <thead><tr className="border-b text-left text-xs text-neutral-500"><th className="py-2">Item</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead>
        <tbody>
          {(o.items as Item[]).map((i) => (
            <tr key={i.id} className="border-b border-neutral-100"><td className="py-2">{i.name}</td><td className="text-right">{i.qty}</td><td className="text-right">{inr(i.price)}</td><td className="text-right">{inr(i.qty * i.price)}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 space-y-1 text-right text-sm">
        {gst > 0 && <p className="text-neutral-500">Includes GST ≈ {inr(Math.round(gst * 100) / 100)}</p>}
        <p className="text-xl font-extrabold">Total {inr(o.total)}</p>
      </div>
      <PrintButton />
    </div>
  );
}
