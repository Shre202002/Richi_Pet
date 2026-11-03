import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/mongo";
import { COOKIE, checkPassword, cookieOpts, signSession } from "@/lib/session";

const Body = z.object({ email: z.email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const user = await (await db()).collection("users").findOne({ email: parsed.data.email.toLowerCase() });
  if (!user || !(await checkPassword(parsed.data.password, user.passwordHash)))
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(COOKIE, await signSession(String(user._id), user.role), cookieOpts);
  return res;
}
