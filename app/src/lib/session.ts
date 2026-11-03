import { SignJWT, jwtVerify } from "jose";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

export const COOKIE = "session";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET!);

export const signSession = (uid: string, role: string) =>
  new SignJWT({ role }).setSubject(uid).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(key());

export async function readSession(token?: string) {
  if (!token) return null;
  try {
    return (await jwtVerify(token, key())).payload;
  } catch {
    return null;
  }
}

const kdf = promisify(scrypt) as (p: string, s: Buffer, n: number) => Promise<Buffer>;

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${(await kdf(pw, salt, 64)).toString("hex")}`;
}

export async function checkPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const a = Buffer.from(hash, "hex");
  const b = await kdf(pw, Buffer.from(salt, "hex"), 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 } as const;
