"use client";
import { useEffect, useSyncExternalStore } from "react";

export type MeShop = { id: string; name: string; owner: string; status: string; phone: string; address: string };
// role null = guest. `loaded` false until the first /api/me answer.
export type Me = { loaded: boolean; role: "admin" | "salesperson" | "shop" | null; name: string; staff: boolean; shop: MeShop | null; shops: MeShop[] };

const GUEST: Me = { loaded: false, role: null, name: "", staff: false, shop: null, shops: [] };
let me: Me = GUEST;
let started = false;
const subs = new Set<() => void>();

export async function refreshMe() {
  try {
    const r = await fetch("/api/me", { cache: "no-store" });
    const j = await r.json();
    me = { ...GUEST, ...j, loaded: true, shops: j.shops ?? [] };
  } catch {
    me = { ...GUEST, loaded: true };
  }
  subs.forEach((f) => f());
}

// Shared across components: one fetch, everyone re-renders on change.
export function useMe() {
  const v = useSyncExternalStore(
    (cb) => (subs.add(cb), () => void subs.delete(cb)),
    () => me,
    () => GUEST,
  );
  useEffect(() => {
    if (!started) {
      started = true;
      refreshMe();
    }
  }, []);
  return v;
}

export async function selectShop(shopId: string) {
  const r = await fetch("/api/me/shop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ shopId }) });
  if (r.ok) await refreshMe();
  return r.ok;
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  await fetch("/api/me/shop", { method: "DELETE" });
  window.location.href = "/";
}
