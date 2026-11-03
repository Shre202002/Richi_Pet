"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: f.get("email"), password: f.get("password") }),
    });
    if (!r.ok) return setErr((await r.json()).error);
    const { role } = await r.json();
    // ?next=checkout sends a returning shop straight back to its cart; only plain same-site paths are honoured
    const next = new URLSearchParams(window.location.search).get("next");
    const safe = next && /^[a-z][a-z0-9/_-]*$/i.test(next) ? `/${next}` : null;
    window.location.href = safe ?? (role === "admin" ? "/admin" : "/");
  }
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Richi&apos;s PET Stuff</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="Email" required className="rounded border p-3" />
        <input name="password" type="password" placeholder="Password" required className="rounded border p-3" />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="rounded bg-brand p-3 font-semibold text-white">Log in</button>
      </form>
      <Link href="/register" className="text-sm underline">New shop? Register</Link>
      <Link href="/" className="text-sm underline">Continue browsing</Link>
    </main>
  );
}
