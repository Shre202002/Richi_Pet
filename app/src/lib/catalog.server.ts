import "server-only";
import { db } from "./mongo";
import type { Category, Product, Variant } from "./catalog";

// Catalog lives in MongoDB (managed from /admin). Product ids are slug strings; variant ids are the cart/order keys.
export async function getCatalog() {
  const d = await db();
  const [cats, prods] = await Promise.all([
    d.collection("categories").find().sort({ sort: 1, name: 1 }).toArray(),
    d.collection("products").find({ active: true }).sort({ _id: 1 }).toArray(),
  ]);
  const products: Product[] = prods.map((x) => {
    const images: string[] = x.images?.length ? x.images : [x.image || "/logo.png"];
    // Old docs without variants behave as a single-size product keyed by the product id.
    const variants: Variant[] = x.variants?.length
      ? x.variants.map((y: Partial<Variant> & { id: string }) => ({ id: y.id, label: y.label ?? "", price: y.price ?? 0, mrp: y.mrp ?? null, packSize: y.packSize ?? "", image: y.image || images[0] }))
      : [{ id: String(x._id), label: "", price: x.price, mrp: x.mrp ?? null, packSize: x.packSize ?? "", image: images[0] }];
    return {
      id: String(x._id),
      categoryId: x.categoryId,
      name: x.name,
      description: x.description ?? "",
      image: images[0],
      images,
      details: x.details ?? "",
      features: x.features ?? [],
      specs: x.specs ?? [],
      variants,
      price: Math.min(...variants.map((y) => y.price)),
    };
  });
  const categories: Category[] = cats.map((c) => ({
    id: String(c._id),
    slug: String(c._id),
    name: c.name,
    image: products.find((x) => x.categoryId === String(c._id))?.image ?? "/logo.png",
  }));
  return { categories, products };
}

export async function getProduct(id: string) {
  const { categories, products } = await getCatalog();
  const product = products.find((x) => x.id === id);
  if (!product) return null;
  return { product, category: categories.find((c) => c.id === product.categoryId)! };
}

// Old per-size URLs (/product/<variantId>) -> the product that now holds that variant.
export async function productIdForVariant(variantId: string) {
  const { products } = await getCatalog();
  return products.find((p) => p.variants.some((v) => v.id === variantId))?.id ?? null;
}
