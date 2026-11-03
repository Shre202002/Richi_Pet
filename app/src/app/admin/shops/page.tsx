import ShopsClient, { type AdminShop, type AdminUser } from "@/components/admin/ShopsClient";
import { rows, shopBalances } from "@/lib/admin-data";
import { db } from "@/lib/mongo";

export default async function ShopsPage() {
  const d = await db();
  const [shops, users, counts, bal] = await Promise.all([
    d.collection("shops").find().sort({ createdAt: -1 }).toArray(),
    d.collection("users").find().sort({ name: 1 }).toArray(),
    d.collection("orders").aggregate([{ $group: { _id: "$shopId", n: { $sum: 1 } } }]).toArray(),
    shopBalances(),
  ]);
  const u = rows<AdminUser>(users);
  const orderCount = new Map(counts.map((c) => [String(c._id), c.n as number]));
  const list = rows<Omit<AdminShop, "owner" | "outstanding" | "orders">>(shops).map((s) => {
    const owner = u.find((x) => x.id === (s as unknown as { ownerId: string }).ownerId);
    const b = bal.get(s.id);
    return { ...s, owner: owner ? { name: owner.name, email: owner.email } : null, orders: orderCount.get(s.id) ?? 0, outstanding: (b?.billed ?? 0) - (b?.paid ?? 0) };
  });
  const team = u.filter((x) => x.role !== "shop");
  return <ShopsClient shops={list} team={team} />;
}
