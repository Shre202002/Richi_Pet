import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminUser } from "@/lib/auth";
import { db } from "@/lib/mongo";
import { nextSeq } from "@/lib/seq";
import { hashPassword } from "@/lib/session";

// One endpoint per admin resource: POST = create, PATCH = update (body.id), DELETE = ?id=
// Every call re-checks the admin role in the DB (the proxy only does an optimistic check).

class Fail extends Error {
  constructor(msg: string, public status = 400) {
    super(msg);
  }
}
const oid = (s: string) => {
  if (!ObjectId.isValid(s)) throw new Fail("Invalid id");
  return new ObjectId(s);
};
const slug = (s: string) => s.toLowerCase().replace(/["”]/g, "in").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
const num = z.coerce.number().min(0);
const opt = z.string().trim().optional().default("");

const product = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1),
  description: opt,
  variants: z.array(z.object({
    id: z.string().trim().optional(),
    label: z.string().trim().default(""),
    price: num,
    mrp: num.nullish().transform((v) => v ?? null),
    packSize: opt,
    image: opt,
  })).min(1, "Add at least one size / price"),
  gstPercent: num.max(100).default(0),
  images: z.array(z.string().trim().min(1)).max(10).default([]),
  details: opt,
  features: z.array(z.string().trim()).default([]).transform((a) => a.filter(Boolean)),
  specs: z.array(z.object({ label: z.string().trim(), value: z.string().trim() })).default([]).transform((a) => a.filter((x) => x.label && x.value)),
  active: z.boolean().default(true),
}).transform((p) => ({ ...p, image: p.images[0] ?? "", price: Math.min(...p.variants.map((v) => v.price)) })); // cover + "from" price stay in sync
const shopFields = z.object({
  shop: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8),
  gstin: opt,
  address: opt,
  status: z.enum(["pending", "approved", "blocked"]).default("approved"),
  salespersonId: z.string().nullish(),
});
const userFields = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  phone: opt,
  password: z.string().min(8),
  role: z.enum(["admin", "salesperson"]),
});
const TRANSITIONS: Record<string, string[]> = {
  placed: ["accepted", "rejected"],
  accepted: ["dispatched", "rejected"],
  dispatched: ["delivered"],
  rejected: [],
  delivered: [],
};

// Variant ids are the cart/order keys: keep the ones sent, mint new ones for new sizes.
function withIds<T extends { id?: string; label: string; image: string }>(productId: string, vs: T[], cover: string) {
  const seen = new Set(vs.map((v) => v.id).filter(Boolean));
  return vs.map((v, i) => {
    let id = v.id;
    for (let n = 0; !id; n++) {
      const c = `${productId}-${slug(v.label || String(i + 1))}${n ? `-${n}` : ""}`;
      if (!seen.has(c)) (id = c), seen.add(c);
    }
    return { ...v, id, image: v.image || cover };
  });
}

type Body = Record<string, unknown> & { id?: string };
type Handler = { create?: (b: Body) => Promise<unknown>; update?: (b: Body) => Promise<unknown>; remove?: (id: string, me: ObjectId) => Promise<unknown> };

async function insertUser(doc: { email: string; password: string; role: string; name: string; phone: string }) {
  const { password, ...rest } = doc;
  try {
    return (await (await db()).collection("users").insertOne({ ...rest, email: rest.email.toLowerCase(), passwordHash: await hashPassword(password) })).insertedId;
  } catch (e) {
    if ((e as { code?: number }).code === 11000) throw new Fail("Email already registered", 409);
    throw e;
  }
}

async function makeInvoice(orderId: ObjectId, type: "order" | "dispatch") {
  const c = (await db()).collection("invoices");
  if (await c.findOne({ orderId, type })) return;
  await c.insertOne({ orderId, type, number: `RP-${String(await nextSeq("invoice")).padStart(5, "0")}`, createdAt: new Date() });
}

const handlers: Record<string, Handler> = {
  categories: {
    async create(b) {
      const { name, sort } = z.object({ name: z.string().trim().min(1), sort: num.default(0) }).parse(b);
      const _id = slug(name);
      const d = await db();
      if (await d.collection("categories").findOne({ _id } as never)) throw new Fail("Category already exists", 409);
      await d.collection("categories").insertOne({ _id, name, sort } as never);
    },
    async update(b) {
      const { name, sort } = z.object({ name: z.string().trim().min(1), sort: num.default(0) }).parse(b);
      await (await db()).collection("categories").updateOne({ _id: String(b.id) } as never, { $set: { name, sort } });
    },
    async remove(id) {
      const d = await db();
      if (await d.collection("products").findOne({ categoryId: id })) throw new Fail("Move or delete this category's products first", 409);
      await d.collection("categories").deleteOne({ _id: id } as never);
    },
  },

  products: {
    async create(b) {
      const d = await db();
      const c = d.collection("products");
      if (Array.isArray(b.bulk)) {
        // Excel import: columns name, size (optional), price, mrp (optional). Matches product by name, size by label.
        const rows = z.array(z.object({ name: z.string(), size: z.string().optional(), price: num, mrp: num.optional() })).parse(b.bulk);
        let n = 0;
        for (const r of rows) {
          const prod = await c.findOne({ name: { $regex: `^${r.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } }) as unknown as { _id: string; variants?: { label: string; price: number; mrp: number | null }[] } | null;
          if (!prod?.variants?.length) continue;
          const vs = prod.variants.map((v, i) => (!r.size ? (prod.variants!.length === 1 || i === 0 ? i === 0 : false) : v.label.trim().toLowerCase() === r.size.trim().toLowerCase())
            ? { ...v, price: r.price, mrp: r.mrp ?? v.mrp } : v);
          if (vs.every((v, i) => v === prod.variants![i])) continue;
          await c.updateOne({ _id: prod._id } as never, { $set: { variants: vs, price: Math.min(...vs.map((v) => v.price)) } });
          n++;
        }
        return { updated: n };
      }
      const p = product.parse(b);
      let _id = slug(p.name);
      if (await c.findOne({ _id } as never)) _id += `-${Math.random().toString(36).slice(2, 6)}`;
      await c.insertOne({ _id, ...p, variants: withIds(_id, p.variants, p.image) } as never);
    },
    async update(b) {
      const p = product.parse(b);
      await (await db()).collection("products").updateOne({ _id: String(b.id) } as never, { $set: { ...p, variants: withIds(String(b.id), p.variants, p.image) } });
    },
    async remove(id) {
      // Past orders keep their own name/price snapshot, so a hard delete is safe.
      await (await db()).collection("products").deleteOne({ _id: id } as never);
    },
  },

  shops: {
    async create(b) {
      const f = shopFields.parse(b);
      const ownerId = await insertUser({ email: f.email, password: f.password, role: "shop", name: f.owner, phone: f.phone });
      await (await db()).collection("shops").insertOne({
        ownerId, salespersonId: f.salespersonId ? oid(f.salespersonId) : null, name: f.shop, gstin: f.gstin || null,
        address: f.address, phone: f.phone, status: f.status, createdAt: new Date(),
      });
    },
    async update(b) {
      const f = shopFields.partial({ password: true, email: true }).parse(b);
      const d = await db();
      const shop = await d.collection("shops").findOne({ _id: oid(String(b.id)) });
      if (!shop) throw new Fail("Shop not found", 404);
      await d.collection("shops").updateOne({ _id: shop._id }, {
        $set: {
          name: f.shop, gstin: f.gstin || null, address: f.address, phone: f.phone, status: f.status,
          salespersonId: f.salespersonId ? oid(f.salespersonId) : null,
        },
      });
      const u: Record<string, unknown> = { name: f.owner, phone: f.phone };
      if (f.email) u.email = f.email.toLowerCase();
      if (f.password) u.passwordHash = await hashPassword(f.password);
      try {
        await d.collection("users").updateOne({ _id: shop.ownerId }, { $set: u });
      } catch (e) {
        if ((e as { code?: number }).code === 11000) throw new Fail("Email already registered", 409);
        throw e;
      }
    },
    async remove(id) {
      const d = await db();
      const shop = await d.collection("shops").findOne({ _id: oid(id) });
      if (!shop) return;
      if (await d.collection("orders").findOne({ shopId: shop._id })) throw new Fail("This shop has orders. Block it instead of deleting.", 409);
      await d.collection("payments").deleteMany({ shopId: shop._id });
      await d.collection("shops").deleteOne({ _id: shop._id });
      await d.collection("users").deleteOne({ _id: shop.ownerId, role: "shop" });
    },
  },

  users: {
    async create(b) {
      const f = userFields.parse(b);
      await insertUser(f);
    },
    async update(b) {
      const f = userFields.partial({ password: true, email: true }).parse(b);
      const u: Record<string, unknown> = { name: f.name, phone: f.phone, role: f.role };
      if (f.email) u.email = f.email.toLowerCase();
      if (f.password) u.passwordHash = await hashPassword(f.password);
      try {
        await (await db()).collection("users").updateOne({ _id: oid(String(b.id)), role: { $ne: "shop" } }, { $set: u });
      } catch (e) {
        if ((e as { code?: number }).code === 11000) throw new Fail("Email already registered", 409);
        throw e;
      }
    },
    async remove(id, me) {
      const _id = oid(id);
      if (_id.equals(me)) throw new Fail("You can't delete your own account");
      const d = await db();
      await d.collection("users").deleteOne({ _id, role: { $ne: "shop" } });
      await d.collection("shops").updateMany({ salespersonId: _id }, { $set: { salespersonId: null } });
    },
  },

  orders: {
    async update(b) {
      const { status, rejectReason } = z.object({ status: z.enum(["accepted", "rejected", "dispatched", "delivered"]), rejectReason: opt }).parse(b);
      const d = await db();
      const order = await d.collection("orders").findOne({ _id: oid(String(b.id)) });
      if (!order) throw new Fail("Order not found", 404);
      if (!TRANSITIONS[order.status]?.includes(status)) throw new Fail(`Can't move an order from ${order.status} to ${status}`, 409);
      await d.collection("orders").updateOne({ _id: order._id }, { $set: { status, rejectReason: status === "rejected" ? rejectReason : "" } });
      if (status === "accepted") await makeInvoice(order._id, "order");
      if (status === "dispatched") await makeInvoice(order._id, "dispatch");
    },
  },

  payments: {
    async create(b) {
      const p = z.object({ shopId: z.string(), amount: z.coerce.number().positive(), mode: opt, note: opt, paidOn: z.string().optional(), orderId: z.string().nullish() }).parse(b);
      await (await db()).collection("payments").insertOne({
        shopId: oid(p.shopId), orderId: p.orderId ? oid(p.orderId) : null, amount: p.amount, mode: p.mode, note: p.note,
        paidOn: p.paidOn ? new Date(p.paidOn) : new Date(), createdAt: new Date(),
      });
    },
    async remove(id) {
      await (await db()).collection("payments").deleteOne({ _id: oid(id) });
    },
  },
};

async function run(method: "create" | "update" | "remove", req: Request, ctx: { params: Promise<{ res: string }> }) {
  const me = await adminUser();
  if (!me) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const fn = handlers[(await ctx.params).res]?.[method];
  if (!fn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const out =
      method === "remove"
        ? await (fn as NonNullable<Handler["remove"]>)(new URL(req.url).searchParams.get("id") ?? "", me._id)
        : await (fn as NonNullable<Handler["create"]>)(await req.json());
    return NextResponse.json({ ok: true, ...((out as object) ?? {}) });
  } catch (e) {
    if (e instanceof Fail) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

type Ctx = { params: Promise<{ res: string }> };
export const POST = (r: Request, c: Ctx) => run("create", r, c);
export const PATCH = (r: Request, c: Ctx) => run("update", r, c);
export const DELETE = (r: Request, c: Ctx) => run("remove", r, c);
