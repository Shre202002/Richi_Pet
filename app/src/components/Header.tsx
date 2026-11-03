import Link from "next/link";
import CartLink from "./CartLink";
import LoginButton from "./LoginButton";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import ShopSwitcher from "./ShopSwitcher";

// Mobile/tablet home header. On desktop TopNav takes over.
export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-ink px-4 pb-3 pt-3 text-white md:px-6 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" aria-label="Home" className="shrink-0"><Logo size={44} /></Link>
          <span className="min-w-0 leading-tight">
            <Link href="/" className="block text-base font-extrabold">Richi&apos;s PET Stuff</Link>
            <ShopSwitcher />
          </span>
        </div>
        <div className="flex items-center gap-1"><LoginButton /><CartLink /></div>
      </div>
      <SearchBox className="mt-3" />
    </header>
  );
}
