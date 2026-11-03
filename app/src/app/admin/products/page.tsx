import ProductsClient, { type AdminCategory, type AdminProduct } from "@/components/admin/ProductsClient";
import { rows } from "@/lib/admin-data";
import { db } from "@/lib/mongo";

export default async function ProductsPage() {
  const d = await db();
  const [products, categories] = await Promise.all([
    d.collection("products").find().sort({ name: 1 }).toArray(),
    d.collection("categories").find().sort({ sort: 1, name: 1 }).toArray(),
  ]);
  return <ProductsClient products={rows<AdminProduct>(products)} categories={rows<AdminCategory>(categories)} />;
}
