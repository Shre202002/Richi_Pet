"use client";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useMe } from "@/lib/me";

// Shown to guests only. One login page serves admins, salespersons and shop owners.
export default function LoginButton() {
  const me = useMe();
  if (!me.loaded || me.role) return null;
  return (
    <Link href="/login" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-ink hover:bg-neutral-200">
      <LogIn size={16} aria-hidden />Log in
    </Link>
  );
}
