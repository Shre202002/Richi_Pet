"use client";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { inr, pctOff, type Product } from "@/lib/catalog";
import AddToCart from "./AddToCart";

// Blinkit/Instamart-style options sheet: every size has its own price and ADD / stepper.
export default function VariantSheet({ p, onClose }: { p: Product; onClose: () => void }) {
  const { qty, count, total } = useCart();

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center" role="dialog" aria-modal aria-label={`${p.name} options`}>
      <button aria-label="Close" onClick={onClose} className="fade-in absolute inset-0 bg-black/50" />
      <div className="sheet-up relative flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-neutral-50 md:max-w-md md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 rounded-t-3xl bg-white px-4 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-base font-extrabold leading-tight">{p.name}</h2>
            <Link href={`/product/${p.id}`} onClick={onClose} className="text-xs font-bold text-brand">View product details</Link>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-100"><X size={18} /></button>
        </div>
        <ul className="space-y-2 overflow-y-auto px-4 py-3">
          {p.variants.map((v) => {
            const off = pctOff(v.price, v.mrp);
            return (
              <li key={v.id} className={`flex items-center gap-3 rounded-2xl border bg-white p-2.5 ${qty(v.id) ? "border-brand" : "border-neutral-200"}`}>
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white">
                  <Image src={v.image} alt="" fill sizes="64px" className="object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{v.label || p.name}</p>
                  {v.packSize && v.packSize !== v.label && <p className="truncate text-xs text-neutral-500">{v.packSize}</p>}
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-extrabold">
                    {inr(v.price)}
                    {v.mrp && v.mrp > v.price && <span className="text-xs font-medium text-neutral-400 line-through">{inr(v.mrp)}</span>}
                    {off > 0 && <span className="rounded bg-green-100 px-1 text-[10px] font-bold text-green-700">{off}% OFF</span>}
                  </p>
                </div>
                <AddToCart id={v.id} price={v.price} name={`${p.name} ${v.label}`} />
              </li>
            );
          })}
        </ul>
        {count > 0 && (
          <div className="border-t border-neutral-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Link href="/cart" onClick={onClose} className="flex h-12 items-center justify-between rounded-xl bg-brand px-4 font-extrabold text-white">
              <span>{count} item{count > 1 ? "s" : ""} · {inr(total)}</span>
              <span>View cart ›</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
