"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { inr, pctOff, type Category, type Product } from "@/lib/catalog";
import AddToCart from "./AddToCart";
import ProductGallery from "./ProductGallery";

// Product page top: gallery + size pills + price, with a sticky ADD bar on mobile. `children` = server-rendered detail sections.
export default function ProductDetailView({ p, category, children }: { p: Product; category: Category; children?: React.ReactNode }) {
  const [sel, setSel] = useState(0);
  const { count, total } = useCart();
  const v = p.variants[sel];
  const off = pctOff(v.price, v.mrp);
  // gallery order = product.images; jump to the selected size's picture when it is in there
  const focus = Math.max(0, p.images.indexOf(v.image));
  const name = v.label ? `${p.name} ${v.label}` : p.name;

  return (
    <>
      <div className="lg:grid lg:grid-cols-2 lg:gap-10">
        <div className="mx-auto w-full max-w-md md:my-4 lg:my-0 lg:max-w-none">
          <ProductGallery images={p.images} name={p.name} focus={focus} />
        </div>
        <div className="px-4 pt-4 md:mx-auto md:max-w-md md:px-0 lg:max-w-none lg:pt-0">
          <Link href={`/category/${category.slug}`} className="text-sm font-bold text-brand">{category.name}</Link>
          <h1 className="mt-1 text-2xl font-extrabold lg:text-3xl">{p.name}</h1>
          <p className="mt-3 text-neutral-600">{p.description}</p>

          {p.variants.length > 1 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Select size</p>
              <div className="no-scrollbar mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
                {p.variants.map((x, i) => (
                  <button key={x.id} role="radio" aria-checked={i === sel} onClick={() => setSel(i)}
                    className={`min-h-11 rounded-xl border-2 px-4 py-1.5 text-left transition ${i === sel ? "border-brand bg-brand-soft" : "border-neutral-200 bg-white"}`}>
                    <span className="block text-sm font-extrabold">{x.label}</span>
                    <span className="block text-xs text-neutral-600">{inr(x.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Wholesale price</p>
          <p className="flex items-baseline gap-2 text-3xl font-extrabold">
            {inr(v.price)}
            {v.mrp && v.mrp > v.price && <span className="text-base font-medium text-neutral-400 line-through">{inr(v.mrp)}</span>}
            {off > 0 && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700">{off}% OFF</span>}
          </p>
          {v.packSize && <p className="text-sm text-neutral-500">{v.packSize}</p>}
          <div className="mt-5 hidden lg:block"><AddToCart id={v.id} price={v.price} name={name} size="lg" /></div>
          <Link href="/cart" className="mt-4 hidden text-sm font-bold text-brand underline lg:inline-block">Go to cart</Link>
          {children}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-neutral-200 bg-white px-4 py-2.5 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs text-neutral-500">{v.label || p.name}</p>
            <p className="text-lg font-extrabold">{inr(v.price)}</p>
          </div>
          {count > 0 && <Link href="/cart" className="text-xs font-bold text-brand">Cart · {inr(total)}</Link>}
          <div className="w-32"><AddToCart id={v.id} price={v.price} name={name} size="lg" /></div>
        </div>
      </div>
    </>
  );
}
