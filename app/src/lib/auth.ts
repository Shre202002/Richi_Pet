import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { db } from "./mongo";
import { COOKIE, readSession } from "./session";

export const SHOP_COOKIE = "shop";

// Re-reads the user from the DB each call so a demoted/deleted user loses access immediately.
export async function currentUser() {
  const s = await readSession((await cookies()).get(COOKIE)?.value);
  if (!s?.sub || !ObjectId.isValid(s.sub)) return null;
  return (await db()).collection("users").findOne({ _id: new ObjectId(s.sub) });
}

export async function adminUser() {
  const u = await currentUser();
  return u?.role === "admin" ? u : null;
}

type User = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

// Shops this user may order for: owner -> their own, salesperson -> assigned, admin -> all.
export async function allowedShops(user: User) {
  const c = (await db()).collection("shops");
  if (user.role === "admin") return c.find().sort({ name: 1 }).limit(1000).toArray();
  if (user.role === "salesperson") return c.find({ salespersonId: user._id }).sort({ name: 1 }).toArray();
  return c.find({ ownerId: user._id }).toArray();
}

// The shop an order is placed for. Owners always get their own shop (the cookie is ignored);
// staff get the shop picked in the header switcher, only if they are allowed to use it.
export async function currentShop(user: User) {
  const shops = await allowedShops(user);
  if (user.role === "shop") return { shop: shops[0] ?? null, shops, staff: false };
  const picked = (await cookies()).get(SHOP_COOKIE)?.value;
  return { shop: shops.find((s) => String(s._id) === picked) ?? null, shops, staff: true };
}

// Mongo doc -> JSON-safe object with string `id` (ObjectId/Date become strings).
export const plain = <T = Record<string, unknown>>(d: unknown): T => {
  const { _id, passwordHash: _p, ...rest } = JSON.parse(JSON.stringify(d)) as Record<string, unknown>;
  return { id: _id, ...rest } as T;
};
