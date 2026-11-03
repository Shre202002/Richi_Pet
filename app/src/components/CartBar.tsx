"use client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { inr } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

// Floating bar on mobile/tablet; desktop uses the header cart button.
export default function CartBar() {
  const { count, total } = useCart();
  const path = usePathname();
  if (!count || /^\/(cart|checkout|order|product)/.test(path)) return null;
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)] z-40 mx-auto max-w-3xl px-4 lg:hidden">
      <Link href="/cart" className="flex min-h-14 items-center justify-between rounded-2xl bg-brand px-4 text-white shadow-lg">
        <span className="leading-tight">
          <span className="block text-sm font-extrabold">{count} item{count > 1 ? "s" : ""}</span>
          <span className="block text-xs opacity-90">{inr(total)}</span>
        </span>
        <span className="flex items-center text-sm font-extrabold">View cart <ChevronRight size={18} /></span>
      </Link>
    </div>
  );
}
