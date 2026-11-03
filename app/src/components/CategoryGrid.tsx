import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/catalog";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="px-4 pt-6 md:px-6">
      <h2 className="mb-3 text-lg font-extrabold md:text-xl">Shop by category</h2>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {categories.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="flex flex-col items-center gap-2 text-center">
            <span className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <Image src={c.image} alt="" fill sizes="(min-width:1024px) 13vw, (min-width:768px) 24vw, 30vw" className="object-contain p-1" />
            </span>
            <span className="text-xs font-semibold leading-tight md:text-sm">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
