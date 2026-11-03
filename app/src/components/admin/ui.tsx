"use client";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { btn } from "./tokens";


// Calls /api/admin/<res>; refreshes server data on success, shows a toast either way.
export function useAdminApi() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [t, setT] = useState<{ msg: string; err: boolean } | null>(null);
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setT(null), 3500);
    return () => clearTimeout(id);
  }, [t]);

  async function call(method: "POST" | "PATCH" | "DELETE", res: string, body?: unknown, okMsg = "Saved") {
    setBusy(true);
    try {
      const url = method === "DELETE" ? `/api/admin/${res}?id=${encodeURIComponent(String(body))}` : `/api/admin/${res}`;
      const r = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setT({ msg: j.error || "Something went wrong", err: true });
        return null;
      }
      setT({ msg: okMsg, err: false });
      router.refresh();
      return j as Record<string, unknown>;
    } finally {
      setBusy(false);
    }
  }

  const toast = t && (
    <div role="status" className="fade-in fixed inset-x-4 bottom-24 z-[60] mx-auto flex max-w-sm items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl lg:bottom-6">
      {t.err ? <XCircle size={18} className="shrink-0 text-red-400" /> : <CheckCircle2 size={18} className="shrink-0 text-green-400" />}
      {t.msg}
    </div>
  );
  return { call, busy, toast };
}

// Bottom sheet on phones, centred dialog on larger screens.
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal aria-label={title}>
      <button aria-label="Close" onClick={onClose} className="fade-in absolute inset-0 bg-black/40" />
      <div className="sheet-up relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white md:max-w-lg md:rounded-3xl">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-neutral-100"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

// Two-tap delete: first tap arms it, second tap confirms.
export function ConfirmBtn({ onConfirm, label = "Delete", className = "" }: { onConfirm: () => void; label?: string; className?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button type="button" onClick={() => (armed ? onConfirm() : setArmed(true))}
      className={`${btn} ${armed ? "bg-red-600 text-white" : "bg-red-50 text-red-700"} ${className}`}>
      {armed ? "Tap again to confirm" : label}
    </button>
  );
}

export function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; n?: number }[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition ${value === o.v ? "bg-ink text-white" : "bg-white text-neutral-600 hover:bg-neutral-200"}`}>
          {o.label}{o.n !== undefined && <span className="ml-1.5 opacity-60">{o.n}</span>}
        </button>
      ))}
    </div>
  );
}

const TONE: Record<string, string> = {
  placed: "bg-amber-100 text-amber-800", pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800", dispatched: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800", approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700", blocked: "bg-red-100 text-red-700",
  admin: "bg-ink text-white", salesperson: "bg-accent-soft text-accent", shop: "bg-neutral-100 text-neutral-700",
};
export const Badge = ({ s }: { s: string }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${TONE[s] ?? "bg-neutral-100"}`}>{s}</span>
);

export const Empty = ({ text }: { text: string }) => <p className="rounded-2xl bg-white py-12 text-center text-sm text-neutral-500">{text}</p>;

