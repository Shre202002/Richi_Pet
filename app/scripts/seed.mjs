// Run: npm run db:seed  (idempotent: catalog + super admin from ADMIN_EMAIL/ADMIN_PASSWORD)
// Never overwrites products you already edited in /admin; only fills in products that have no variants yet.
import { MongoClient } from "mongodb";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { mergedOldIds, rawCategories, rawProducts } from "./seed-data.mjs";

const { Mongo_DB_USer: u, Mongo_DB_Pass: p, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!u || !p || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set Mongo_DB_USer, Mongo_DB_Pass, ADMIN_EMAIL, ADMIN_PASSWORD in .env.local");
const client = await new MongoClient(`mongodb+srv://${encodeURIComponent(u)}:${encodeURIComponent(p)}@cluster1.ab3azex.mongodb.net/`).connect();
const db = client.db("richi");

for (const [i, c] of rawCategories.entries())
  await db.collection("categories").updateOne({ _id: c.id }, { $setOnInsert: { name: c.name, sort: i } }, { upsert: true });

const products = db.collection("products");
for (const x of rawProducts) {
  const fields = {
    categoryId: x.categoryId, name: x.name, description: x.description, details: x.details, features: x.features, specs: [],
    images: x.images, image: x.images[0], variants: x.variants, price: Math.min(...x.variants.map((y) => y.price)), mrp: null, gstPercent: 0, active: true,
  };
  const existing = await products.findOne({ _id: x.id });
  if (!existing) await products.insertOne({ _id: x.id, ...fields });
  else if (!existing.variants) await products.updateOne({ _id: x.id }, { $set: { ...fields, active: existing.active, description: existing.description || x.description } });
}

// Remove the old per-size docs now represented as variants of a group.
const gone = await products.deleteMany({ _id: { $in: mergedOldIds } });

const salt = randomBytes(16);
const hash = (await promisify(scrypt)(ADMIN_PASSWORD, salt, 64)).toString("hex");
await db.collection("users").updateOne(
  { email: ADMIN_EMAIL.toLowerCase() },
  { $set: { role: "admin" }, $setOnInsert: { passwordHash: `${salt.toString("hex")}:${hash}`, name: "Super Admin", phone: "" } },
  { upsert: true },
);
console.log("products:", await products.countDocuments(), "| merged docs removed:", gone.deletedCount, "| admin:", ADMIN_EMAIL);
await client.close();
