import { ArrowUpRight, ClipboardList, IndianRupee, Package, Store } from "lucide-react";
import Link from "next/link";
import { card, day } from "@/components/admin/tokens";
import { Badge } from "@/components/admin/ui";
import { shopBalances } from "@/lib/admin-data";
import { adminUser } from "@/lib/auth";
import { inr } from "@/lib/catalog";
import { db } from "@/lib/mongo";

const greet = () => {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default async function Overview() {
  const me = await adminUser();
  const d = await db();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(dayStart.getTime() - 6 * 864e5);
  const live = { status: { $ne: "rejected" } };

  const [month, prev, today, newOrders, pendingShops, activeProducts, week, recent, bal] = await Promise.all([
    d.collection("orders").aggregate([{ $match: { ...live, createdAt: { $gte: monthStart } } }, { $group: { _id: null, t: { $sum: "$total" }, n: { $sum: 1 } } }]).toArray(),
    d.collection("orders").aggregate([{ $match: { ...live, createdAt: { $gte: prevStart, $lt: monthStart } } }, { $group: { _id: null, t: { $sum: "$total" } } }]).toArray(),
    d.collection("orders").countDocuments({ createdAt: { $gte: dayStart } }),
    d.collection("orders").countDocuments({ status: "placed" }),
    d.collection("shops").countDocuments({ status: "pending" }),
    d.collection("products").countDocuments({ active: true }),
    d.collection("orders").find({ ...live, createdAt: { $gte: weekStart } }).project({ total: 1, createdAt: 1 }).toArray(),
    d.collection("orders").find().sort({ createdAt: -1 }).limit(6).toArray(),
    shopBalances(),
  ]);

  const sales = month[0]?.t ?? 0;
  const lastSales = prev[0]?.t ?? 0;
  const delta = lastSales ? Math.round(((sales - lastSales) / lastSales) * 100) : null;
  const outstanding = [...bal.values()].reduce((n, b) => n + b.billed - b.paid, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const s = new Date(weekStart.getTime() + i * 864e5);
    const v = week.filter((o) => o.createdAt >= s && o.createdAt < new Date(s.getTime() + 864e5)).reduce((n, o) => n + o.total, 0);
    return { label: s.toLocaleDateString("en-IN", { weekday: "short" }), v, today: i === 6 };
  });
  const max = Math.max(...days.map((x) => x.v), 1);

  const stats = [
    { label: "Orders today", value: String(today), Icon: ClipboardList, href: "/admin/orders" },
    { label: "Outstanding dues", value: inr(outstanding), Icon: IndianRupee, href: "/admin/payments" },
    { label: "Pending shops", value: String(pendingShops), Icon: Store, href: "/admin/shops" },
    { label: "Active products", value: String(activeProducts), Icon: Package, href: "/admin/products" },
  ];

  return (
    <div className="space-y-4 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{greet()}, {me?.name.split(" ")[0]}</h1>
        <p className="text-sm text-neutral-500">Stay on top of your orders, shops and payments.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff8a4c] via-accent to-[#d9481a] p-5 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
          <p className="text-sm font-medium opacity-90">Sales this month</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">{inr(sales)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/20 px-3 py-1">{month[0]?.n ?? 0} orders</span>
            {delta !== null && <span className="rounded-full bg-white px-3 py-1 text-accent">{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month</span>}
          </div>
          <Link href="/admin/orders" className="mt-5 inline-flex h-10 items-center gap-1 rounded-full bg-ink px-4 text-sm font-semibold">
            View orders <ArrowUpRight size={16} />
          </Link>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, Icon, href }) => (
            <Link key={label} href={href} className={`${card} flex flex-col justify-between transition hover:shadow-md`}>
              <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent"><Icon size={18} /></span>
              <div className="mt-3">
                <p className="text-xs font-medium text-neutral-500">{label}</p>
                <p className="text-xl font-extrabold">{value}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {(newOrders > 0 || pendingShops > 0) && (
        <section className="rounded-2xl bg-ink p-4 text-white">
          <p className="text-sm font-bold">Needs your attention</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {newOrders > 0 && <Link href="/admin/orders" className="rounded-full bg-white/15 px-4 py-2 font-semibold">{newOrders} new order{newOrders > 1 ? "s" : ""} to review</Link>}
            {pendingShops > 0 && <Link href="/admin/shops" className="rounded-full bg-white/15 px-4 py-2 font-semibold">{pendingShops} shop{pendingShops > 1 ? "s" : ""} awaiting approval</Link>}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <section className={card}>
          <h2 className="font-bold">Last 7 days</h2>
          <p className="text-xs text-neutral-500">Order value per day</p>
          <div className="mt-4 flex h-40 items-end gap-2" role="img" aria-label="Bar chart of order value for the last 7 days">
            {days.map((x) => (
              <div key={x.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-semibold text-neutral-500">{x.v ? inr(x.v) : ""}</span>
                <div className={`w-full rounded-t-lg ${x.today ? "bg-accent" : "bg-ink"}`} style={{ height: `${Math.max((x.v / max) * 100, x.v ? 6 : 2)}%`, opacity: x.v ? 1 : 0.15 }} />
                <span className="text-[11px] font-medium text-neutral-500">{x.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-accent">See all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-neutral-100">
              {recent.map((o) => (
                <li key={String(o._id)} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{o.shopName}</p>
                    <p className="text-xs text-neutral-500">{o.no} · {day(o.createdAt.toISOString())}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-extrabold">{inr(o.total)}</span>
                    <Badge s={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
