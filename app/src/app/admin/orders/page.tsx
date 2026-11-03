import OrdersClient, { type AdminOrder } from "@/components/admin/OrdersClient";
import { rows } from "@/lib/admin-data";
import { db } from "@/lib/mongo";

export default async function OrdersPage() {
  const d = await db();
  const [orders, invoices] = await Promise.all([
    d.collection("orders").find().sort({ createdAt: -1 }).limit(300).toArray(),
    d.collection("invoices").find().toArray(),
  ]);
  const inv = rows<{ orderId: string; type: string; number: string }>(invoices);
  const list = rows<AdminOrder>(orders).map((o) => ({ ...o, invoices: inv.filter((i) => i.orderId === o.id).map((i) => ({ type: i.type, number: i.number })) }));
  return <OrdersClient orders={list} />;
}
