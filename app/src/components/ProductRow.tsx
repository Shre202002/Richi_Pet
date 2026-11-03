import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import ProductCard from "./ProductCard";

export default function ProductRow({ category, products }: { category: Category; products: Product[] }) {
  return (
    <section className="pt-6">
      <div className="mb-3 flex items-center justify-between px-4 md:px-6">
        <h2 className="text-lg font-extrabold md:text-xl">{category.name}</h2>
        <Link href={`/category/${category.slug}`} className="flex items-center text-sm font-bold text-brand">
          see all <ChevronRight size={16} />
        </Link>
      </div>
      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 md:px-6">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-[15.5%]" />
        ))}
      </div>
    </section>
  );
}
