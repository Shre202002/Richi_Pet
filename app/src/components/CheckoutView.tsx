"use client";
import { ListSkeleton } from "./Skeletons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearCart, useCart } from "@/lib/cart";
import { inr } from "@/lib/catalog";
import { useHydrated } from "@/lib/hydrated";
import { useMe } from "@/lib/me";
import { placeOrder } from "@/lib/orders";
import BillSummary from "./BillSummary";
import { ShopPicker } from "./ShopSwitcher";
import type { MiniProduct } from "./CartView";

const field = "h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base outline-none focus:border-brand";

export default function CheckoutView({ products }: { products: MiniProduct[] }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { lines, count, total } = useCart();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const me = useMe();
  const [picking, setPicking] = useState(false);
  const shop = me.shop;
  const needShop = me.loaded && me.staff && !shop;
  const rows = products.filter((p) => lines[p.id]);

  if (!hydrated) return <ListSkeleton />;
  if (rows.length === 0 && !placing)
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-extrabold">Nothing to check out</h1>
        <Link href="/category/all" className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand px-6 font-bold text-white">Browse products</Link>
      </main>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!v("shop")) next.shop = "Enter your shop name";
    if (!/^[6-9]\d{9}$/.test(v("phone"))) next.phone = "Enter a 10-digit mobile number";
    if (v("address").length < 8) next.address = "Enter the full delivery address";
    setErrors(next);
    if (Object.keys(next).length) return;
    setPlacing(true); // stops the "empty cart" screen flashing once the cart is cleared
    if (needShop) return setErrors({ form: "Choose which shop you are ordering for first." });
    const res = await placeOrder({
      shop: v("shop"),
      phone: v("phone"),
      address: v("address"),
      note: v("note"),
      items: rows.map((p) => ({ id: p.id, qty: lines[p.id].q })),
    });
    if (res.error) {
      setPlacing(false);
      return setErrors({ form: res.error });
    }
    clearCart();
    router.push(`/order/${res.id}`);
  }

  return (
    <main className="mx-auto w-full max-w-7xl lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-8 lg:px-6 lg:py-6">
      <form id="checkout" onSubmit={submit} noValidate className="space-y-4 p-4 md:px-6 lg:p-0">
        <h1 className="hidden text-2xl font-extrabold lg:block">Checkout</h1>
        {errors.form && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{errors.form}</p>}
        {me.staff && (
          <div className={`flex items-center justify-between gap-3 rounded-2xl p-3 text-sm ${shop ? "bg-brand-soft" : "bg-amber-100"}`}>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-neutral-600">Placing order on behalf of</span>
              <span className="block truncate font-extrabold">{shop ? `${shop.name}${shop.owner ? ` (${shop.owner})` : ""}` : "No shop selected"}</span>
            </span>
            <button type="button" onClick={() => setPicking(true)} className="h-10 shrink-0 rounded-full bg-ink px-4 text-xs font-bold text-white">{shop ? "Change" : "Select shop"}</button>
          </div>
        )}
        {picking && <ShopPicker onClose={() => setPicking(false)} />}
        <section key={shop?.id ?? "none"} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-extrabold">Delivery details</h2>
          <div>
            <label htmlFor="shop" className="mb-1 block text-sm font-semibold">Shop name</label>
            <input id="shop" name="shop" defaultValue={shop?.name ?? ""} autoComplete="organization" className={field} aria-invalid={!!errors.shop} />
            {errors.shop && <p className="mt-1 text-sm text-red-700">{errors.shop}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-semibold">Mobile number</label>
            <input id="phone" name="phone" defaultValue={(shop?.phone ?? "").replace(/\D/g, "").slice(-10)} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" className={field} aria-invalid={!!errors.phone} />
            {errors.phone && <p className="mt-1 text-sm text-red-700">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-semibold">Delivery address</label>
            <textarea id="address" name="address" defaultValue={shop?.address ?? ""} rows={3} autoComplete="street-address" className={`${field} h-auto py-3`} aria-invalid={!!errors.address} />
            {errors.address && <p className="mt-1 text-sm text-red-700">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="note" className="mb-1 block text-sm font-semibold">Note for Richi&apos;s PET Stuff (optional)</label>
            <textarea id="note" name="note" rows={2} className={`${field} h-auto py-3`} />
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-extrabold">Order items ({count})</h2>
          <ul className="mt-2 divide-y divide-neutral-200 text-sm">
            {rows.map((p) => (
              <li key={p.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 truncate">{lines[p.id].q} × {p.name}{p.label && ` · ${p.label}`}</span>
                <span className="font-semibold">{inr(lines[p.id].q * lines[p.id].p)}</span>
              </li>
            ))}
          </ul>
        </section>
      </form>

      <div className="px-4 pb-4 md:px-6 lg:sticky lg:top-24 lg:p-0">
        <BillSummary count={count} total={total}>
          <button form="checkout" type="submit" disabled={needShop} className="h-12 w-full rounded-xl bg-brand font-bold text-white hover:bg-brand-dark disabled:opacity-50">
            Place order
          </button>
          <p className="mt-2 text-center text-xs text-neutral-500">Payment is settled directly with Richi&apos;s PET Stuff.</p>
        </BillSummary>
      </div>
    </main>
  );
}
