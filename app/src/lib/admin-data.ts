import "server-only";
import { plain } from "./auth";
import { db } from "./mongo";

// Outstanding per shop = dispatched/delivered order totals - payments.
export async function shopBalances() {
  const d = await db();
  const [billed, paid] = await Promise.all([
    d.collection("orders").aggregate([{ $match: { status: { $in: ["dispatched", "delivered"] } } }, { $group: { _id: "$shopId", t: { $sum: "$total" } } }]).toArray(),
    d.collection("payments").aggregate([{ $group: { _id: "$shopId", t: { $sum: "$amount" } } }]).toArray(),
  ]);
  const m = new Map<string, { billed: number; paid: number }>();
  for (const b of billed) m.set(String(b._id), { billed: b.t, paid: 0 });
  for (const p of paid) m.set(String(p._id), { billed: m.get(String(p._id))?.billed ?? 0, paid: p.t });
  return m;
}

export const rows = <T,>(docs: unknown[]) => docs.map((x) => plain<T>(x));
