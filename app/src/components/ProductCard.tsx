import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { hasOptions, inr, pctOff, type Product } from "@/lib/catalog";
import VariantAdd from "./VariantAdd";

// Blinkit/Instamart-style card: ADD sits on the image corner; several sizes -> "N options".
export default function ProductCard({ p, className = "w-full" }: { p: Product; className?: string }) {
  const multi = hasOptions(p);
  const v = p.variants.reduce((a, b) => (b.price < a.price ? b : a));
  const off = pctOff(v.price, v.mrp);
  const chip = multi ? `${p.variants.length} sizes` : v.packSize || v.label;
  return (
    <div className={`${className} flex flex-col rounded-2xl border border-neutral-200 bg-white p-2`}>
      <div className="relative">
        <Link href={`/product/${p.id}`} className="block" aria-label={p.name}>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
            <SmartImage src={p.image} alt={p.name} fill sizes="(min-width:1024px) 16vw, (min-width:768px) 23vw, 44vw" className="object-contain" />
            {off > 0 && <span className="absolute left-0 top-0 rounded-br-lg bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{off}% OFF</span>}
          </div>
        </Link>
        <div className="absolute -bottom-3 right-1">
          <div className="rounded-lg bg-white shadow-md"><VariantAdd p={p} /></div>
        </div>
      </div>
      <Link href={`/product/${p.id}`} className="mt-4 block">
        {chip && <span className="inline-block rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-600">{chip}</span>}
        <h3 className="mt-1 line-clamp-2 min-h-[2.4rem] text-[13px] font-semibold leading-tight">{p.name}</h3>
        <p className="mt-1 flex items-baseline gap-1.5 text-sm font-extrabold">
          {multi && <span className="text-[11px] font-semibold text-neutral-500">from</span>}
          {inr(v.price)}
          {v.mrp && v.mrp > v.price && <span className="text-xs font-medium text-neutral-400 line-through">{inr(v.mrp)}</span>}
        </p>
      </Link>
    </div>
  );
}
