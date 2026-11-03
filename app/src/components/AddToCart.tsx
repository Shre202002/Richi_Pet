"use client";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";

// Blinkit-style: ADD button that turns into a - qty + stepper.
export default function AddToCart({
  id,
  price,
  name,
  size = "sm",
}: {
  id: string;
  price: number;
  name: string;
  size?: "sm" | "lg";
}) {
  const { qty, add, dec } = useCart();
  const q = qty(id);
  const h = size === "lg" ? "h-12 text-base" : "h-10 text-xs";
  if (!q)
    return (
      <button
        onClick={() => add(id, price)}
        aria-label={`Add ${name} to cart`}
        className={`${h} rounded-lg border border-brand bg-brand-soft px-5 font-extrabold text-brand transition active:scale-95 ${size === "lg" ? "w-full max-w-xs" : ""}`}
      >
        ADD
      </button>
    );
  return (
    <div className={`${h} inline-flex items-center justify-between rounded-lg bg-brand text-white ${size === "lg" ? "w-full max-w-xs" : ""}`}>
      <button onClick={() => dec(id)} aria-label={`Remove one ${name}`} className="flex h-full w-10 items-center justify-center">
        <Minus size={16} strokeWidth={3} />
      </button>
      <span className="min-w-6 text-center font-extrabold" aria-live="polite">{q}</span>
      <button onClick={() => add(id, price)} aria-label={`Add one ${name}`} className="flex h-full w-10 items-center justify-center">
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
  );
}
