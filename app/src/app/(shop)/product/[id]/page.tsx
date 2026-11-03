import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ProductDetailView from "@/components/ProductDetailView";
import ProductRow from "@/components/ProductRow";
import { getCatalog, getProduct, productIdForVariant } from "@/lib/catalog.server";

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const found = await getProduct(id);
  if (!found) {
    // old per-size URLs now live under the merged product
    const merged = await productIdForVariant(id);
    if (merged && merged !== id) redirect(`/product/${merged}`);
    notFound();
  }
  const { product: p, category } = found;
  const { products } = await getCatalog();
  const related = products.filter((x) => x.categoryId === category.id && x.id !== p.id);

  return (
    <>
      <PageHeader title={p.name} />
      <main className="mx-auto w-full max-w-7xl pb-6 lg:px-6 lg:pt-6">
        <nav aria-label="Breadcrumb" className="hidden pb-4 text-sm text-neutral-500 lg:block">
          <Link href="/" className="hover:text-brand">Home</Link> / <Link href={`/category/${category.slug}`} className="hover:text-brand">{category.name}</Link> / <span className="text-neutral-900">{p.name}</span>
        </nav>
        <ProductDetailView p={p} category={category}>
          {p.details && (
            <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
              <h2 className="text-lg font-extrabold">About this product</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{p.details}</p>
            </section>
          )}
          {p.features.length > 0 && (
            <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
              <h2 className="text-lg font-extrabold">Key features</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                {p.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </section>
          )}
          {p.specs.length > 0 && (
            <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
              <h2 className="text-lg font-extrabold">Specifications</h2>
              <dl className="mt-2 divide-y divide-neutral-100 text-sm">
                {p.specs.map((x) => (
                  <div key={x.label} className="flex justify-between gap-4 py-2"><dt className="text-neutral-500">{x.label}</dt><dd className="text-right font-semibold">{x.value}</dd></div>
                ))}
              </dl>
            </section>
          )}
        </ProductDetailView>
        {related.length > 0 && <ProductRow category={{ ...category, name: `More in ${category.name}` }} products={related} />}
      </main>
    </>
  );
}
