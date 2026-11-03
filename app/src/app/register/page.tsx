"use client";
import Link from "next/link";
import { useState } from "react";
import AuthTabs from "@/components/AuthTabs";
import { clearCart, useCart } from "@/lib/cart";
import { inr } from "@/lib/catalog";
import { useHydrated } from "@/lib/hydrated";
import { placeOrder } from "@/lib/orders";

export default function Register() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const hydrated = useHydrated();
  const { lines, count, total } = useCart();
  const hasCart = hydrated && count > 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f)),
    });
    if (!r.ok) {
      setBusy(false);
      return setMsg((await r.json()).error);
    }
    if (!hasCart) {
      setBusy(false);
      return setMsg("Registered. Your shop will be visible once the admin approves it.");
    }
    // Signed in by the register call -> place the cart as the new shop's first order.
    const res = await placeOrder({
      shop: String(f.get("shop")),
      phone: String(f.get("phone")),
      address: String(f.get("address")),
      note: "",
      items: Object.entries(lines).map(([id, l]) => ({ id, qty: l.q })),
    });
    if (res.error) {
      // the account exists now; keep the cart so they can retry from checkout
      window.location.href = "/cart";
      return;
    }
    clearCart();
    window.location.href = `/order/${res.id}`;
  }
  const cls = "rounded border p-3";
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-4">
      <AuthTabs active="register" />
      <h1 className="text-2xl font-bold">{hasCart ? "Register to place your order" : "Register your shop"}</h1>
      {hasCart && (
        <p className="rounded-xl bg-brand-soft p-3 text-sm">
          Your cart: <b>{count} item{count > 1 ? "s" : ""}</b> · <b>{inr(total)}</b>. We&apos;ll place this order as soon as you register.
        </p>
      )}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input name="shop" placeholder="Shop name" required className={cls} />
        <input name="owner" placeholder="Owner name" required className={cls} />
        <input name="phone" type="tel" placeholder="Phone" required className={cls} />
        <input name="gstin" placeholder="GSTIN (optional)" className={cls} />
        <input name="address" placeholder="Address" required className={cls} />
        <input name="email" type="email" placeholder="Email" required className={cls} />
        <input name="password" type="password" minLength={8} placeholder="Password (8+ chars)" required className={cls} />
        {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
        <button disabled={busy} className="rounded bg-brand p-3 font-semibold text-white disabled:opacity-60">
          {busy ? "Please wait..." : hasCart ? "Register & place order" : "Register"}
        </button>
      </form>
      <Link href="/login" className="text-sm underline">Already registered? Log in</Link>
      <Link href="/cart" className="text-sm underline">Back to cart</Link>
    </main>
  );
}
