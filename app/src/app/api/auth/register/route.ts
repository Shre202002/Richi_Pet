import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/mongo";
import { COOKIE, cookieOpts, hashPassword, signSession } from "@/lib/session";

const Body = z.object({
  shop: z.string().min(1),
  owner: z.string().min(1),
  phone: z.string().min(1),
  gstin: z.string().optional(),
  address: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const b = parsed.data;
  const d = await db();
  const users = d.collection("users");
  await users.createIndex({ email: 1 }, { unique: true }); // idempotent
  let userId;
  try {
    // role is always 'shop'; admin promotes manually in the DB.
    ({ insertedId: userId } = await users.insertOne({
      email: b.email.toLowerCase(),
      passwordHash: await hashPassword(b.password),
      role: "shop",
      name: b.owner,
      phone: b.phone,
    }));
  } catch (e) {
    if ((e as { code?: number }).code === 11000)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    throw e;
  }
  await d.collection("shops").insertOne({
    ownerId: userId,
    name: b.shop,
    gstin: b.gstin || null,
    address: b.address,
    phone: b.phone,
    status: "pending",
    createdAt: new Date(),
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(String(userId), "shop"), cookieOpts);
  return res;
}
