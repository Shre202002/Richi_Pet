// Run: npm run db:setup  (creates collections + indexes; safe to re-run)
import { MongoClient } from "mongodb";

const { Mongo_DB_USer: u, Mongo_DB_Pass: p } = process.env;
if (!u || !p) throw new Error("Mongo_DB_USer / Mongo_DB_Pass missing in .env.local");
const client = await new MongoClient(
  `mongodb+srv://${encodeURIComponent(u)}:${encodeURIComponent(p)}@cluster1.ab3azex.mongodb.net/`,
).connect();
const db = client.db("richi");

const indexes = {
  users: [[{ email: 1 }, { unique: true }]],
  shops: [[{ ownerId: 1 }], [{ salespersonId: 1 }], [{ status: 1 }]],
  categories: [[{ name: 1 }, { unique: true }]],
  products: [[{ categoryId: 1 }], [{ active: 1 }]],
  orders: [[{ shopId: 1, createdAt: -1 }], [{ status: 1 }]], // items embedded in the order doc
  payments: [[{ shopId: 1 }], [{ orderId: 1 }]],
  invoices: [[{ number: 1 }, { unique: true }], [{ orderId: 1, type: 1 }, { unique: true }]],
  counters: [], // { _id: "invoice", seq } for RP-00001 numbering
};

const have = new Set((await db.listCollections().toArray()).map((c) => c.name));
for (const [name, idx] of Object.entries(indexes)) {
  if (!have.has(name)) await db.createCollection(name);
  for (const [key, opts] of idx) await db.collection(name).createIndex(key, opts);
  console.log("ok", name);
}
await client.close();
