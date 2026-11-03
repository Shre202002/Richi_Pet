"use client";
import { useSyncExternalStore } from "react";

// Tiny external store persisted to localStorage (no provider needed, SSR-safe).
export type CartLines = Record<string, { q: number; p: number }>; // productId -> qty, unit price
const KEY = "richi-cart";
const EMPTY: CartLines = {};
let lines: CartLines = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    lines = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {}
}

function set(next: CartLines) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  subs.forEach((f) => f());
}

export function clearCart() {
  set({});
}

export function useCart() {
  const l = useSyncExternalStore(
    (cb) => (subs.add(cb), () => void subs.delete(cb)),
    () => (load(), lines),
    () => EMPTY,
  );
  const entries = Object.values(l);
  return {
    lines: l,
    qty: (id: string) => l[id]?.q ?? 0,
    add: (id: string, price: number) => set({ ...lines, [id]: { q: (lines[id]?.q ?? 0) + 1, p: price } }),
    dec: (id: string) => {
      const { [id]: cur, ...rest } = lines;
      set(cur && cur.q > 1 ? { ...rest, [id]: { ...cur, q: cur.q - 1 } } : rest);
    },
    remove: (id: string) => {
      const { [id]: _gone, ...rest } = lines;
      set(rest);
    },
    count: entries.reduce((n, e) => n + e.q, 0),
    total: entries.reduce((n, e) => n + e.q * e.p, 0),
  };
}
