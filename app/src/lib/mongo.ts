import { MongoClient } from "mongodb";
import { connection } from "next/server";

const u = encodeURIComponent((process.env.Mongo_DB_USer ?? process.env.Mongo_DB_User)!);
const p = encodeURIComponent(process.env.Mongo_DB_Pass!);
export const MONGO_URI = `mongodb+srv://${u}:${p}@cluster1.ab3azex.mongodb.net/`;

// Cached on globalThis so dev hot-reload doesn't open a new connection each edit.
const g = globalThis as unknown as { _mongo?: Promise<MongoClient> };

export async function db() {
  await connection(); // DB reads are per-request; never prerender them into the static shell
  g._mongo ??= new MongoClient(MONGO_URI).connect();
  return (await g._mongo).db("richi");
}
