"use client";
import SmartImage from "@/components/SmartImage";
import Link from "next/link";
import { useState } from "react";

// Copy taken from the client's WhatsApp business profile (Quality · Care · Trust, bulk orders welcome).
const BANNERS = [
  { t: "Collars, harnesses & leashes", s: "Browse the full range", img: "/products/nylon-collar-1in.jpg", href: "/category/dog-collar", bg: "bg-ink" },
  { t: "Bulk orders welcome", s: "Retail & wholesale enquiries", img: "/products/natural-800-gram.jpg", href: "/category/treats", bg: "bg-brand" },
  { t: "Quality · Care · Trust", s: "Chew sticks, treats & accessories", img: "/products/chicken-2-kg.jpg", href: "/category/treats", bg: "bg-brand-dark" },
];

export default function BannerCarousel() {
  const [a, setA] = useState(0);
  return (
    <section className="px-4 pt-4 md:px-6">
      <div
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          setA(Math.round(el.scrollLeft / (el.scrollWidth / BANNERS.length)));
        }}
      >
        {BANNERS.map((b) => (
          <Link
            key={b.t}
            href={b.href}
            className={`relative flex h-32 w-[88%] shrink-0 snap-center items-center justify-between overflow-hidden rounded-2xl p-4 text-white md:h-40 md:w-[48%] lg:h-48 lg:w-[32.4%] ${b.bg}`}
          >
            <div className="relative z-10 max-w-[60%]">
              <p className="text-lg font-extrabold leading-tight md:text-xl">{b.t}</p>
              <p className="mt-1 text-sm text-white/80">{b.s}</p>
            </div>
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white md:h-28 md:w-28 lg:h-36 lg:w-36">
              <SmartImage src={b.img} alt="" fill sizes="144px" className="object-contain" />
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5 lg:hidden" aria-hidden>
        {BANNERS.map((b, i) => (
          <span key={b.t} className={`h-1.5 rounded-full transition-all ${i === a ? "w-4 bg-brand" : "w-1.5 bg-neutral-300"}`} />
        ))}
      </div>
    </section>
  );
}
