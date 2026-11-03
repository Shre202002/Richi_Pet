"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { hasOptions, type Product } from "@/lib/catalog";
import AddToCart from "./AddToCart";
import VariantSheet from "./VariantSheet";

// Single size: plain ADD / stepper. Several sizes: "ADD · N options" opens the sheet (like Blinkit).
export default function VariantAdd({ p }: { p: Product }) {
  const { qty } = useCart();
  const [open, setOpen] = useState(false);
  if (!hasOptions(p)) return <AddToCart id={p.variants[0].id} price={p.variants[0].price} name={p.name} />;

  const inCart = p.variants.reduce((n, v) => n + qty(v.id), 0);
  return (
    <>
      <div className="flex flex-col items-center">
        <button
          onClick={() => setOpen(true)}
          aria-label={`Choose options for ${p.name}`}
          className={`inline-flex h-10 min-w-16 items-center justify-center gap-1 rounded-lg border px-4 text-xs font-extrabold transition active:scale-95 ${inCart ? "border-brand bg-brand text-white" : "border-brand bg-brand-soft text-brand"}`}
        >
          {inCart ? <><span aria-live="polite">{inCart}</span><Plus size={14} strokeWidth={3} /></> : "ADD"}
        </button>
        <span className="mt-0.5 text-[10px] font-semibold text-neutral-500">{p.variants.length} options</span>
      </div>
      {open && <VariantSheet p={p} onClose={() => setOpen(false)} />}
    </>
  );
}
