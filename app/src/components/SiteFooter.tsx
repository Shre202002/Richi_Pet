import Link from "next/link";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="mt-10 hidden bg-ink text-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-8">
        <div className="flex items-center gap-4">
          <Logo size={56} />
          <p className="max-w-md text-sm text-white/70">
            Premium Pet Products | Quality You Can Trust. Retail &amp; wholesale enquiries, bulk orders welcome, serving pet lovers and businesses across India.
          </p>
        </div>
        <nav className="flex gap-6 text-sm font-semibold">
          <Link href="/about" className="hover:text-brand-logo">About</Link>
          <Link href="/orders" className="hover:text-brand-logo">Orders</Link>
          <Link href="/category/all" className="hover:text-brand-logo">All products</Link>
        </nav>
      </div>
    </footer>
  );
}
