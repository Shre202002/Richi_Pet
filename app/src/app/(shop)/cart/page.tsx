import CartView from "@/components/CartView";
import PageHeader from "@/components/PageHeader";
import { getCatalog } from "@/lib/catalog.server";

export default async function CartPage() {
  const { products } = await getCatalog();
  // one cart row per variant (size)
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({ id: v.id, productId: p.id, name: p.name, label: v.label, image: v.image })),
  );
  return (
    <>
      <PageHeader title="Cart" cart={false} />
      <CartView products={rows} />
    </>
  );
}
