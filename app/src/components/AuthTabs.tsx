import Link from "next/link";

// Login and Register are one flow: same switcher on both pages.
export default function AuthTabs({ active }: { active: "login" | "register" }) {
  const cls = (on: boolean) => `flex-1 rounded-full py-2.5 text-center text-sm font-bold ${on ? "bg-ink text-white" : "text-neutral-600"}`;
  return (
    <div className="flex rounded-full bg-neutral-200 p-1" role="tablist">
      <Link href="/login" role="tab" aria-selected={active === "login"} className={cls(active === "login")}>Log in</Link>
      <Link href="/register" role="tab" aria-selected={active === "register"} className={cls(active === "register")}>Register</Link>
    </div>
  );
}
