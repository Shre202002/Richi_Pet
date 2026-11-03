"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink({ label = false }: { label?: boolean }) {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className={`relative flex h-11 items-center justify-center gap-2 rounded-full text-white hover:bg-white/10 ${label ? "bg-brand px-4 font-bold hover:bg-brand-dark" : "w-11"}`}
    >
      <ShoppingCart size={22} />
      {label && <span className="text-sm">Cart</span>}
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-extrabold text-brand">
          {count}
        </span>
      )}
    </Link>
  );
}
