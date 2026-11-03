import PaymentsClient, { type Balance, type Invoice, type Payment } from "@/components/admin/PaymentsClient";
import { rows, shopBalances } from "@/lib/admin-data";
import { db } from "@/lib/mongo";

export default async function PaymentsPage() {
  const d = await db();
  const [shops, payments, invoices, orders, bal] = await Promise.all([
    d.collection("shops").find().sort({ name: 1 }).toArray(),
    d.collection("payments").find().sort({ paidOn: -1 }).limit(200).toArray(),
    d.collection("invoices").find().sort({ createdAt: -1 }).limit(200).toArray(),
    d.collection("orders").find().project({ no: 1, shopName: 1 }).toArray(),
    shopBalances(),
  ]);
  const name = new Map(shops.map((s) => [String(s._id), s.name as string]));
  const no = new Map(orders.map((o) => [String(o._id), o as unknown as { no: string; shopName: string }]));
  const balances: Balance[] = shops.map((s) => {
    const b = bal.get(String(s._id));
    return { shopId: String(s._id), name: s.name, phone: s.phone, billed: b?.billed ?? 0, paid: b?.paid ?? 0 };
  });
  const pays = rows<Omit<Payment, "shop">>(payments).map((p) => ({ ...p, shop: name.get((p as unknown as { shopId: string }).shopId) ?? "Deleted shop" }));
  const invs = rows<Omit<Invoice, "shop" | "orderNo">>(invoices).map((i) => {
    const o = no.get((i as unknown as { orderId: string }).orderId);
    return { ...i, orderNo: o?.no ?? "", shop: o?.shopName ?? "" };
  });
  return <PaymentsClient balances={balances} payments={pays} invoices={invs} />;
}
