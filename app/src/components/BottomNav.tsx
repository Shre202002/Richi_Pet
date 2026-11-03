"use client";
import { ClipboardList, Info, LayoutGrid, House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { l: "Home", Icon: House, href: "/", match: (p: string) => p === "/" },
  { l: "Categories", Icon: LayoutGrid, href: "/category/all", match: (p: string) => p.startsWith("/category") },
  { l: "Orders", Icon: ClipboardList, href: "/orders", match: (p: string) => p.startsWith("/orders") || p.startsWith("/order/") },
  { l: "About", Icon: Info, href: "/about", match: (p: string) => p.startsWith("/about") },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-4">
        {TABS.map(({ l, Icon, href, match }) => {
          const on = match(path);
          return (
            <Link
              key={l}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${on ? "text-brand" : "text-neutral-500"}`}
            >
              <Icon size={22} strokeWidth={on ? 2.5 : 2} />
              {l}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
