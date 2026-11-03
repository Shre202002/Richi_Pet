"use client";
import { ClipboardList, LayoutDashboard, LogOut, Package, Store, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string; Icon: typeof Store; badge?: "orders" | "shops" }[] = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: ClipboardList, badge: "orders" },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/shops", label: "Shops", Icon: Store, badge: "shops" },
  { href: "/admin/payments", label: "Payments", Icon: Wallet },
];

export default function AdminShell({ name, badges, children }: { name: string; badges: { orders: number; shops: number }; children: React.ReactNode }) {
  const path = usePathname();
  const on = (h: string) => (h === "/admin" ? path === h : path.startsWith(h));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-dvh bg-surface pb-24 lg:pb-8">
      <header className="no-print sticky top-0 z-30 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-white">R</span>
            <span className="hidden sm:inline">Richi&apos;s Admin</span>
          </Link>
          <nav className="mx-auto hidden gap-1 rounded-full bg-white p-1 shadow-sm lg:flex" aria-label="Admin">
            {TABS.map(({ href, label, badge }) => (
              <Link key={href} href={href} className={`relative rounded-full px-5 py-2 text-sm font-semibold transition ${on(href) ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                {label}
                {badge && badges[badge] > 0 && <span className="ml-1.5 rounded-full bg-accent px-1.5 text-xs text-white">{badges[badge]}</span>}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link href="/" className="hidden h-10 items-center rounded-full bg-white px-4 text-sm font-semibold shadow-sm sm:flex">View store</Link>
            <span className="grid size-10 place-items-center rounded-full bg-white text-sm font-bold shadow-sm" title={name}>{name.slice(0, 1).toUpperCase()}</span>
            <button onClick={logout} aria-label="Log out" className="grid size-10 place-items-center rounded-full bg-white shadow-sm"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-2">{children}</main>

      <nav aria-label="Admin" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map(({ href, label, Icon, badge }) => (
            <li key={href}>
              <Link href={href} className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${on(href) ? "text-accent" : "text-neutral-500"}`}>
                <Icon size={22} strokeWidth={on(href) ? 2.4 : 1.8} />
                {label}
                {badge && badges[badge] > 0 && <span className="absolute right-[22%] top-2 grid size-4 place-items-center rounded-full bg-accent text-[10px] text-white">{badges[badge]}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
