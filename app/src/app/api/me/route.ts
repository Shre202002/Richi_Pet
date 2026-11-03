import { NextResponse } from "next/server";
import { currentShop, currentUser } from "@/lib/auth";
import { db } from "@/lib/mongo";

// Who is signed in + which shop they are ordering for. Safe for guests ({ role: null }).
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ role: null });
  const { shop, shops, staff } = await currentShop(user);
  let owners = new Map<string, string>();
  if (staff && shops.length) {
    const us = await (await db()).collection("users").find({ _id: { $in: shops.map((s) => s.ownerId) } }).project({ name: 1 }).toArray();
    owners = new Map(us.map((u) => [String(u._id), u.name as string]));
  }
  const brief = (s: (typeof shops)[number]) => ({
    id: String(s._id), name: s.name, status: s.status, phone: s.phone ?? "", address: s.address ?? "",
    owner: owners.get(String(s.ownerId)) ?? "",
  });
  return NextResponse.json({
    role: user.role,
    name: user.name,
    staff,
    shop: shop ? { ...brief(shop), owner: staff ? (owners.get(String(shop.ownerId)) ?? "") : user.name } : null,
    shops: staff ? shops.map(brief) : [],
  });
}
