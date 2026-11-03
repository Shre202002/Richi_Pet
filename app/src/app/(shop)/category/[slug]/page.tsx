import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog.server";

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().toLowerCase() ?? "";
  const { categories, products } = await getCatalog();
  const cat = slug === "all" ? null : categories.find((c) => c.slug === slug);
  if (slug !== "all" && !cat) notFound();

  const items = products.filter(
    (p) => (!cat || p.categoryId === cat.id) && (!q || `${p.name} ${p.description}`.toLowerCase().includes(q)),
  );
  const title = q ? `Results for "${q}"` : (cat?.name ?? "All products");
  const link = (active: boolean) =>
    `block rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-brand text-white" : "hover:bg-brand-soft"}`;

  return (
    <>
      <PageHeader title={title} />
      <main className="mx-auto w-full max-w-7xl lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8 lg:px-6 lg:py-6">
        <aside className="hidden lg:block">
          <nav aria-label="Categories" className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-3">
            <Link href="/category/all" className={link(slug === "all")}>All products</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className={link(c.slug === slug)}>{c.name}</Link>
            ))}
          </nav>
        </aside>

        <section className="flex items-start lg:block">
          {/* Blinkit-style category rail (mobile + tablet) */}
          <nav aria-label="Categories" className="no-scrollbar sticky top-14 h-[calc(100dvh-7.5rem)] w-[84px] shrink-0 overflow-y-auto border-r border-neutral-200 bg-white pb-24 md:w-24 lg:hidden">
            {[{ slug: "all", name: "All", image: "" }, ...categories].map((c) => {
              const on = c.slug === slug;
              return (
                <Link key={c.slug} href={`/category/${c.slug}`} aria-current={on ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 px-1 py-3 text-center text-[11px] font-semibold leading-tight ${on ? "bg-brand-soft text-brand-dark" : "text-neutral-600"}`}>
                  {on && <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-brand" />}
                  <span className="relative grid size-12 place-items-center overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {c.image ? <SmartImage src={c.image} alt="" fill sizes="48px" className="object-contain p-0.5" /> : <span className="text-base font-extrabold">All</span>}
                  </span>
                  {c.name}
                </Link>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1">
            <div className="hidden items-baseline justify-between pb-4 lg:flex">
              <h1 className="text-2xl font-extrabold">{title}</h1>
              <p className="text-sm text-neutral-500">{items.length} products</p>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-16 text-center text-neutral-500">
                No products found. <Link href="/category/all" className="font-bold text-brand">Show all products</Link>
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 p-2.5 pb-8 md:grid-cols-3 md:gap-3 md:p-3 lg:grid-cols-4 lg:gap-4 lg:p-0">
                {items.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
