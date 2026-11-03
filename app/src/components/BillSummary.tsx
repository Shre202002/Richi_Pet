import { inr } from "@/lib/catalog";

export default function BillSummary({ count, total, children }: { count: number; total: number; children?: React.ReactNode }) {
  return (
    <section aria-label="Bill summary" className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h2 className="text-lg font-extrabold">Bill summary</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-neutral-600">Items</dt><dd className="font-semibold">{count}</dd></div>
        <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
          <dt className="font-extrabold">Order total</dt><dd className="font-extrabold">{inr(total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-neutral-500">No online payment. The final invoice is issued by Richi&apos;s PET Stuff when the order is dispatched.</p>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
