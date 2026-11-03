import { NextResponse } from "next/server";
import { z } from "zod";
import { allowedShops, currentUser, SHOP_COOKIE } from "@/lib/auth";
import { cookieOpts } from "@/lib/session";

// Staff pick which shop they are ordering for. The id must be one they are allowed to use.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role === "shop") return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const parsed = z.object({ shopId: z.string() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid shop" }, { status: 400 });
  const ok = (await allowedShops(user)).some((s) => String(s._id) === parsed.data.shopId);
  if (!ok) return NextResponse.json({ error: "You can't order for that shop" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SHOP_COOKIE, parsed.data.shopId, cookieOpts);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SHOP_COOKIE);
  return res;
}
