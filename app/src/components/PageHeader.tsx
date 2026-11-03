"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CartLink from "./CartLink";
import LoginButton from "./LoginButton";
import ShopSwitcher from "./ShopSwitcher";

// Compact back-header for inner pages (mobile/tablet). Hidden on desktop where TopNav shows.
export default function PageHeader({ title, cart = true }: { title: string; cart?: boolean }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 bg-ink px-2 py-2 text-white lg:hidden">
      <button onClick={() => router.back()} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
        <ChevronLeft size={24} />
      </button>
      <div className="min-w-0 flex-1 leading-tight">
        <h1 className="truncate text-lg font-bold">{title}</h1>
        <ShopSwitcher className="text-[11px]" />
      </div>
      <LoginButton />
      {cart && <CartLink />}
    </header>
  );
}
