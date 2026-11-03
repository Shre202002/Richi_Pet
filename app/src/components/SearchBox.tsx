"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const HINTS = ["cotton collar", "nylon harness", "steel bowl", "chew sticks", "grooming comb"];

export default function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % HINTS.length), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <form
      role="search"
      className={`flex items-center gap-2 rounded-xl bg-white px-3 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/category/all?q=${encodeURIComponent(q)}` : "/category/all");
      }}
    >
      <Search size={18} className="shrink-0 text-neutral-500" aria-hidden />
      <input
        name="q"
        type="search"
        aria-label="Search products"
        placeholder={`Search "${HINTS[i]}"`}
        className="h-11 w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
      />
    </form>
  );
}
