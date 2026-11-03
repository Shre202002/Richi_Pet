"use client";
import { ListSkeleton } from "./Skeletons";
import { Trash2 } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { useEffect } from "react";
import { inr } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useHydrated } from "@/lib/hydrated";
import { useMe } from "@/lib/me";
import AddToCart from "./AddToCart";
import BillSummary from "./BillSummary";

// One row per variant (size). `id` = variant id = cart key.
export type MiniProduct = { id: string; productId: string; name: string; label: string; image: string };

export default function CartView({ products }: { products: MiniProduct[] }) {
  const hydrated = useHydrated();
  const me = useMe();
  const guest = me.loaded && !me.role;
  const { lines, remove, count, total } = useCart();
  const rows = products.filter((p) => lines[p.id]);
  // drop lines for products that no longer exist (deleted/merged), so the count and total stay honest
  useEffect(() => {
    if (!hydrated) return;
    const known = new Set(products.map((p) => p.id));
    Object.keys(lines).filter((id) => !known.has(id)).forEach(remove);
  }, [hydrated, lines, products, remove]);

  if (!hydrated) return <ListSkeleton />;
  if (rows.length === 0)
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-600">Add products from the catalog to place an order.</p>
        <Link href="/category/all" className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand px-6 font-bold text-white">Browse products</Link>
      </main>
    );

  return (
    <main className="mx-auto w-full max-w-7xl lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-8 lg:px-6 lg:py-6">
      <section aria-label="Cart items">
        <h1 className="hidden pb-4 text-2xl font-extrabold lg:block">Your cart ({count})</h1>
        <ul className="divide-y divide-neutral-200 bg-white md:mx-6 md:rounded-2xl md:border md:border-neutral-200 lg:mx-0">
          {rows.map((p) => {
            const l = lines[p.id];
            return (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <SmartImage src={p.image} alt={p.name} fill sizes="64px" className="object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${p.productId}`} className="block truncate text-sm font-bold">{p.name}</Link>
                  {p.label && <p className="text-xs font-semibold text-neutral-500">{p.label}</p>}
                  <p className="text-sm text-neutral-600">{inr(l.p)} each</p>
                  <button onClick={() => remove(p.id)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <AddToCart id={p.id} price={l.p} name={p.name} />
                  <p className="text-sm font-extrabold">{inr(l.q * l.p)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="p-4 md:px-6 lg:sticky lg:top-24 lg:p-0">
        <BillSummary count={count} total={total}>
          <Link href={guest ? "/register?next=checkout" : "/checkout"} className="flex h-12 w-full items-center justify-center rounded-xl bg-brand font-bold text-white hover:bg-brand-dark">
            {guest ? "Place order" : "Proceed to checkout"}
          </Link>
          {guest && (
            <p className="mt-2 text-center text-xs text-neutral-500">
              New shop? You&apos;ll register first and your order is placed automatically. Already registered? <Link href="/login?next=checkout" className="font-bold text-brand underline">Log in</Link>
            </p>
          )}
          {me.staff && <p className="mt-2 text-center text-xs text-neutral-600">{me.shop ? <>Ordering for <b>{me.shop.name}</b></> : "Pick a shop at checkout"}</p>}
        </BillSummary>
      </div>
    </main>
  );
}
