import CheckoutView from "@/components/CheckoutView";
import PageHeader from "@/components/PageHeader";
import { getCatalog } from "@/lib/catalog.server";

export default async function CheckoutPage() {
  const { products } = await getCatalog();
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({ id: v.id, productId: p.id, name: p.name, label: v.label, image: v.image })),
  );
  return (
    <>
      <PageHeader title="Checkout" cart={false} />
      <CheckoutView products={rows} />
    </>
  );
}
