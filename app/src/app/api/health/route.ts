import { NextResponse } from "next/server";
import { db } from "@/lib/mongo";

// Deployment check: which env vars are set (never their values) and whether MongoDB answers.
const VARS = ["Mongo_DB_USer", "Mongo_DB_Pass", "AUTH_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"] as const;

export async function GET() {
  const env = Object.fromEntries(VARS.map((k) => [k, !!process.env[k] || (k === "Mongo_DB_USer" && !!process.env.Mongo_DB_User)]));
  let mongo = "ok";
  let hint = "";
  try {
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000));
    await Promise.race([(await db()).command({ ping: 1 }), timeout]);
  } catch (e) {
    const m = String((e as Error).message);
    mongo = (e as Error).name;
    hint = /Authentication|auth/i.test(m)
      ? "Wrong or missing Mongo_DB_USer / Mongo_DB_Pass"
      : /timeout|ServerSelection|ECONNREFUSED|ENOTFOUND/i.test(m)
        ? "Atlas is not reachable: add 0.0.0.0/0 under Network Access (and check the user/pass vars)"
        : "See the Vercel runtime logs for details";
    console.error("health: mongo check failed", m);
  }
  const ok = mongo === "ok" && Object.values(env).every(Boolean);
  return NextResponse.json({ ok, env, mongo, hint }, { status: ok ? 200 : 503 });
}
