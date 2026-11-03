import { Suspense } from "react";
import BottomNav from "@/components/BottomNav";
import CartBar from "@/components/CartBar";
import SiteFooter from "@/components/SiteFooter";
import TopNav from "@/components/TopNav";
import { PRICES_ARE_SAMPLE } from "@/lib/catalog";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-40 lg:pb-0">
      <Suspense fallback={null}><TopNav /></Suspense>
      {PRICES_ARE_SAMPLE && (
        <p className="bg-brand-soft px-4 py-1.5 text-center text-xs font-medium text-brand-dark">
          Sample prices shown. Final wholesale prices load from the price list.
        </p>
      )}
      <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading…</div>}>{children}</Suspense>
      <SiteFooter />
      <Suspense fallback={null}><CartBar /></Suspense>
      <Suspense fallback={null}><BottomNav /></Suspense>
    </div>
  );
}
