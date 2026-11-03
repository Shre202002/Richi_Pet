import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, readSession } from "@/lib/session";

// Optimistic gate only (the APIs check the session themselves) (signed-cookie check, no DB hit). Re-check roles in server code.
export async function proxy(req: NextRequest) {
  // Local UI review without a DB. Never set NEXT_PUBLIC_DEMO in production.
  if (process.env.NEXT_PUBLIC_DEMO === "1") return NextResponse.next();
  const user = await readSession(req.cookies.get(COOKIE)?.value);
  const path = req.nextUrl.pathname;
  // Browsing + cart are public (guests add to cart, then register). Only these need a session:
  if (!user && path === "/checkout") return NextResponse.redirect(new URL("/register?next=checkout", req.url));
  if (!user && (path.startsWith("/admin") || path.startsWith("/api/admin") || path === "/orders" || path.startsWith("/order/")))
    return NextResponse.redirect(new URL("/login", req.url));
  if (user && (path === "/login" || path === "/register")) return NextResponse.redirect(new URL(user.role === "admin" ? "/admin" : "/", req.url));
  // Admin pages/APIs also re-check the role in the DB.
  if (user?.role !== "admin" && (path.startsWith("/admin") || path.startsWith("/api/admin")))
    return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|products|logo.png|manifest.webmanifest|sw.js).*)"], // public static assets: the image optimizer fetches these without a cookie
};
