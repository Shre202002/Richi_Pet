"use client";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { inr } from "@/lib/catalog";
import { STATUS_LABEL, useOrders, type Order } from "@/lib/orders";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function OrderDetail({ id }: { id: string }) {
  const orders = useOrders();
  const order: Order | undefined = orders?.find((o) => o.id === id);
  if (!orders) return <main className="mx-auto max-w-2xl p-6 text-neutral-500">Loading…</main>;
  if (!order)
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-extrabold">Order not found</h1>
        <Link href="/orders" className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand px-6 font-bold text-white">My orders</Link>
      </main>
    );
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
      <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <CheckCircle2 size={48} className="text-brand" aria-hidden />
        <h1 className="mt-3 text-2xl font-extrabold">{order.status === "placed" ? "Order placed" : `Order ${STATUS_LABEL[order.status].toLowerCase()}`}</h1>
        <p className="mt-1 text-neutral-600">Order no. <span className="font-bold text-neutral-900">{order.id}</span></p>
        <p className="mt-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">{STATUS_LABEL[order.status]}</p>
        {order.rejectReason && <p className="mt-2 text-sm text-red-700">Reason: {order.rejectReason}</p>}
        {order.status === "placed" && <p className="mt-3 text-sm text-neutral-600">Richi&apos;s PET Stuff will confirm your order and arrange dispatch.</p>}
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-lg font-extrabold">Items</h2>
        <ul className="mt-2 divide-y divide-neutral-200 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2">
              <span className="min-w-0 truncate">{i.qty} × {i.name}</span>
              <span className="font-semibold">{inr(i.qty * i.price)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between border-t border-neutral-200 pt-3 text-base font-extrabold"><span>Total</span><span>{inr(order.total)}</span></p>
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
        <h2 className="text-lg font-extrabold">Delivery</h2>
        <p className="mt-2 font-semibold">{order.shop}</p>
        <p>{order.address}</p>
        <p className="text-neutral-600">{order.phone}</p>
        {order.note && <p className="mt-2 text-neutral-600">Note: {order.note}</p>}
        <p className="mt-2 text-xs text-neutral-500">{when(order.createdAt)}</p>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/category/all" className="flex h-12 flex-1 items-center justify-center rounded-xl bg-brand font-bold text-white hover:bg-brand-dark">Continue shopping</Link>
        <Link href="/orders" className="flex h-12 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white font-bold">View all orders</Link>
      </div>
    </main>
  );
}

export function OrderList() {
  const orders = useOrders();
  if (!orders) return <main className="mx-auto max-w-3xl p-6 text-neutral-500">Loading…</main>;
  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <h1 className="hidden pb-4 text-2xl font-extrabold lg:block">My orders</h1>
      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-neutral-600">You haven&apos;t placed any orders yet.</p>
          <Link href="/category/all" className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand px-6 font-bold text-white">Browse products</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/order/${o.id}`} className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-brand">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-extrabold">{o.id}</span>
                  <span className="font-extrabold">{inr(o.total)}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">{o.shop} · {o.items.reduce((n, i) => n + i.qty, 0)} items</p>
                <p className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                  <span>{when(o.createdAt)}</span>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 font-bold text-brand-dark">{STATUS_LABEL[o.status]}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
