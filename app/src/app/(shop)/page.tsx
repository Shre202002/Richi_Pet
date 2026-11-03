import BannerCarousel from "@/components/BannerCarousel";
import CategoryGrid from "@/components/CategoryGrid";
import Header from "@/components/Header";
import ProductRow from "@/components/ProductRow";
import { getCatalog } from "@/lib/catalog.server";

export default async function Home() {
  const { categories, products } = await getCatalog();
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl pb-6">
        <BannerCarousel />
        <CategoryGrid categories={categories} />
        {categories.map((c) => {
          const items = products.filter((p) => p.categoryId === c.id);
          return items.length ? <ProductRow key={c.id} category={c} products={items} /> : null;
        })}
      </main>
    </>
  );
}
