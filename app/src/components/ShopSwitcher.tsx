"use client";
import { ChevronDown, LogOut, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { logout, selectShop, useMe } from "@/lib/me";

const STATUS: Record<string, string> = { pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800", blocked: "bg-red-100 text-red-700" };

// Header subtitle: guests see the tagline, shop owners their name, staff a tappable "Ordering for" shop switcher.
export default function ShopSwitcher({ className = "" }: { className?: string }) {
  const me = useMe();
  const [open, setOpen] = useState(false);
  const base = `block max-w-full truncate text-xs ${className}`;

  if (!me.loaded || !me.role) return null; // guests see nothing under the brand name
  if (!me.staff) {
    return <span className={`${base} font-semibold text-white`}>{me.name}{me.shop ? ` · ${me.shop.name}` : ""}</span>;
  }
  return (
    <>
      <button onClick={() => setOpen(true)} aria-haspopup="dialog" className={`${base} flex items-center gap-1 text-left font-semibold ${me.shop ? "text-white" : "animate-pulse text-amber-300"}`}>
        <span className="truncate">{me.shop ? `For: ${me.shop.name}` : "Select shop to order for"}</span>
        <ChevronDown size={14} className="shrink-0" />
      </button>
      {open && <ShopPicker onClose={() => setOpen(false)} />}
    </>
  );
}

export function ShopPicker({ onClose }: { onClose: () => void }) {
  const me = useMe();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState("");
  const list = useMemo(() => me.shops.filter((s) => `${s.name} ${s.owner} ${s.phone}`.toLowerCase().includes(q.toLowerCase())), [me.shops, q]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function pick(id: string) {
    setBusy(id);
    if (await selectShop(id)) {
      router.refresh();
      onClose();
    }
    setBusy("");
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center text-neutral-900 md:items-center" role="dialog" aria-modal aria-label="Choose shop">
      <button aria-label="Close" onClick={onClose} className="fade-in absolute inset-0 bg-black/50" />
      <div className="sheet-up relative flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white md:max-w-md md:rounded-3xl">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div>
            <h2 className="text-lg font-extrabold">Order on behalf of</h2>
            <p className="text-xs text-neutral-500">Signed in as {me.name} ({me.role})</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-neutral-100"><X size={18} /></button>
        </div>
        <div className="relative px-4">
          <Search size={16} className="absolute left-7 top-3.5 text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shop, owner or phone" className="h-11 w-full rounded-xl border border-neutral-200 pl-9 pr-3 text-sm outline-none focus:border-brand" />
        </div>
        <ul className="mt-2 flex-1 space-y-1.5 overflow-y-auto px-4 pb-3">
          {list.length === 0 && <li className="py-8 text-center text-sm text-neutral-500">{me.shops.length ? "No shops match." : "No shops assigned to you yet."}</li>}
          {list.map((s) => {
            const on = s.id === me.shop?.id;
            return (
              <li key={s.id}>
                <button disabled={!!busy} onClick={() => pick(s.id)} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left ${on ? "border-brand bg-brand-soft" : "border-neutral-200 bg-white"}`}>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{s.name}</span>
                    <span className="block truncate text-xs text-neutral-500">{s.owner}{s.phone && ` · ${s.phone}`}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${STATUS[s.status] ?? ""}`}>{busy === s.id ? "..." : on ? "Selected" : s.status}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex gap-2 border-t border-neutral-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {me.role === "admin" && <Link href="/admin" className="flex h-11 flex-1 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white">Admin panel</Link>}
          <button onClick={logout} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-100 text-sm font-bold"><LogOut size={16} />Log out</button>
        </div>
      </div>
    </div>
  );
}
