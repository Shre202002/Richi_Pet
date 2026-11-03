"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartLink from "./CartLink";
import LoginButton from "./LoginButton";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import ShopSwitcher from "./ShopSwitcher";

const LINKS = [
  { l: "Home", href: "/" },
  { l: "Categories", href: "/category/all" },
  { l: "Orders", href: "/orders" },
  { l: "About", href: "/about" },
];

// Desktop (lg+) top bar. Mobile/tablet use Header/PageHeader + BottomNav.
export default function TopNav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 hidden bg-ink text-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" aria-label="Home"><Logo size={48} /></Link>
          <span className="max-w-56 leading-tight">
            <Link href="/" className="block text-lg font-extrabold">Richi&apos;s PET Stuff</Link>
            <ShopSwitcher />
          </span>
        </div>
        <SearchBox className="max-w-xl flex-1" />
        <nav className="ml-auto flex items-center gap-1">
          {LINKS.map((n) => {
            const on = n.href === "/" ? path === "/" : path.startsWith(n.href === "/category/all" ? "/category" : n.href);
            return (
              <Link
                key={n.l}
                href={n.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/10 ${on ? "bg-white/10 text-brand-logo" : ""}`}
              >
                {n.l}
              </Link>
            );
          })}
        </nav>
        <LoginButton />
        <CartLink label />
      </div>
    </header>
  );
}
