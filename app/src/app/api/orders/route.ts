import { NextResponse } from "next/server";
import { z } from "zod";
import { currentShop, currentUser } from "@/lib/auth";
import { db } from "@/lib/mongo";
import { nextSeq } from "@/lib/seq";

const Body = z.object({
  // delivery details default to the shop's saved ones
  shop: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().min(1).max(10000) })).min(1),
});

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const d = await db();
  const { shop } = await currentShop(user);
  const rows = shop ? await d.collection("orders").find({ shopId: shop._id }).sort({ createdAt: -1 }).toArray() : [];
  return NextResponse.json(
    rows.map((o) => ({
      id: o.no, shop: o.shopName, phone: o.phone, address: o.address, note: o.note ?? "",
      items: o.items, total: o.total, status: o.status, rejectReason: o.rejectReason ?? "",
      createdAt: o.createdAt,
    })),
  );
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const b = parsed.data;
  const d = await db();
  const { shop, staff } = await currentShop(user);
  if (!shop) return NextResponse.json({ error: staff ? "Choose a shop first" : "No shop on this account" }, { status: staff ? 400 : 403 });
  // Pending shops may order (the admin accepts/rejects the order); blocked ones may not.
  if (shop.status === "blocked") return NextResponse.json({ error: "This shop is blocked. Please contact Richi's PET Stuff." }, { status: 403 });

  // Prices come from the DB, never from the client.
  type V = { id: string; label?: string; price: number };
  type P = { _id: string; name: string; price: number; gstPercent?: number; variants?: V[] };
  const ids = b.items.map((i) => i.id);
  // item id = variant id; single-size legacy products use the product id
  const prods = await d.collection<P>("products").find({ active: true, $or: [{ "variants.id": { $in: ids } }, { _id: { $in: ids } }] }).toArray();
  const byVariant = new Map<string, { name: string; price: number; gst: number }>();
  for (const p of prods) {
    if (p.variants?.length) for (const v of p.variants) byVariant.set(v.id, { name: v.label ? `${p.name} - ${v.label}` : p.name, price: v.price, gst: p.gstPercent ?? 0 });
    else byVariant.set(String(p._id), { name: p.name, price: p.price, gst: p.gstPercent ?? 0 });
  }
  const items = [];
  for (const i of b.items) {
    const v = byVariant.get(i.id);
    if (!v) return NextResponse.json({ error: "A product in your cart is no longer available" }, { status: 409 });
    items.push({ id: i.id, name: v.name, qty: i.qty, price: v.price, gst: v.gst });
  }
  const total = items.reduce((n, i) => n + i.qty * i.price, 0);
  const stamp = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const no = `RP-${stamp}-${String(await nextSeq("order")).padStart(4, "0")}`;
  await d.collection("orders").insertOne({
    no, shopId: shop._id, placedBy: user._id, onBehalf: staff, shopName: b.shop?.trim() || shop.name, phone: b.phone?.trim() || shop.phone || "",
    address: b.address?.trim() || shop.address || "", note: b.note ?? "", items, total, status: "placed", rejectReason: "", createdAt: new Date(),
  });
  return NextResponse.json({ id: no });
}
